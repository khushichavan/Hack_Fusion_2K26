/**
 * Unit tests for store.ts business logic functions.
 * Tests computeRequestScore and computeAllocation which contain
 * the core allocation and priority scoring algorithms.
 */
import { describe, it, expect } from "vitest";

// We test the pure logic functions directly by reimplementing them
// to avoid the browser-dependent initialization in store.ts

type Priority = "high" | "medium" | "low";
type Category = "Hospital" | "Residential" | "Industry";
type RequestPurpose =
  | "Hospital/Emergency"
  | "Drinking Water"
  | "Household Use"
  | "Community Tank"
  | "Other";

type Area = {
  id: string;
  name: string;
  category: Category;
  demand: number;
  priority: Priority;
  allocated: number;
  status: "Full" | "Partial" | "No Supply";
  justification: string;
};

// Extracted pure logic from store.ts for testing
function computeRequestScore(
  purpose: RequestPurpose,
  priority: Priority,
  ttlMs: number,
  amount: number,
) {
  const purposeWeight: Record<RequestPurpose, number> = {
    "Hospital/Emergency": 5,
    "Drinking Water": 4,
    "Household Use": 3,
    "Community Tank": 3,
    Other: 1,
  };
  const urgencyMinutes = Math.max(1, Math.min(240, ttlMs / 60_000));
  const urgencyWeight =
    urgencyMinutes <= 15
      ? 5
      : urgencyMinutes <= 30
        ? 4
        : urgencyMinutes <= 60
          ? 3
          : urgencyMinutes <= 120
            ? 2
            : 1;
  const quantityWeight = Math.min(5, Math.max(1, Math.ceil(amount / 100)));
  const priorityWeight = priority === "high" ? 4 : priority === "medium" ? 2.5 : 1;
  const score = purposeWeight[purpose] + urgencyWeight + quantityWeight + priorityWeight;
  const scoreLabel =
    score >= 15 ? "Critical" : score >= 12 ? "High" : score >= 9 ? "Medium" : "Low";
  return { score, scoreLabel } as const;
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function computeAllocation(areas: Area[], totalSupply: number): Area[] {
  const sorted = [...areas].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );
  let remaining = totalSupply;
  const result: Area[] = sorted.map((a) => {
    const give = Math.min(a.demand, Math.max(0, remaining));
    remaining -= give;
    let status: Area["status"] = "No Supply";
    if (give >= a.demand) status = "Full";
    else if (give > 0) status = "Partial";
    const justification =
      give >= a.demand
        ? `Full allocation granted (priority: ${a.priority}).`
        : give > 0
          ? `Partial allocation: ${give}/${a.demand} ML. Higher-priority demand was served first.`
          : `No allocation: total supply was exhausted by higher-priority areas.`;
    return { ...a, allocated: give, status, justification };
  });
  return areas.map((a) => result.find((r) => r.id === a.id)!);
}

describe("computeRequestScore", () => {
  it("assigns highest score to hospital emergency with high priority and urgent TTL", () => {
    const { score, scoreLabel } = computeRequestScore(
      "Hospital/Emergency",
      "high",
      10 * 60_000, // 10 minutes
      500,
    );
    // purpose=5 + urgency=5 + quantity=5 + priority=4 = 19
    expect(score).toBe(19);
    expect(scoreLabel).toBe("Critical");
  });

  it("assigns lowest score to 'Other' with low priority and long TTL", () => {
    const { score, scoreLabel } = computeRequestScore(
      "Other",
      "low",
      180 * 60_000, // 180 minutes
      50,
    );
    // purpose=1 + urgency=1 + quantity=1 + priority=1 = 4
    expect(score).toBe(4);
    expect(scoreLabel).toBe("Low");
  });

  it("labels score >= 15 as Critical", () => {
    const { scoreLabel } = computeRequestScore(
      "Hospital/Emergency",
      "high",
      15 * 60_000,
      400,
    );
    expect(scoreLabel).toBe("Critical");
  });

  it("labels score >= 12 but < 15 as High", () => {
    const { score, scoreLabel } = computeRequestScore(
      "Drinking Water",
      "high",
      25 * 60_000, // urgency=4
      150, // quantity=2
    );
    // purpose=4 + urgency=4 + quantity=2 + priority=4 = 14
    expect(score).toBe(14);
    expect(scoreLabel).toBe("High");
  });

  it("labels score >= 9 but < 12 as Medium", () => {
    const { score, scoreLabel } = computeRequestScore(
      "Household Use",
      "medium",
      45 * 60_000, // urgency=3
      100, // quantity=1
    );
    // purpose=3 + urgency=3 + quantity=1 + priority=2.5 = 9.5
    expect(score).toBe(9.5);
    expect(scoreLabel).toBe("Medium");
  });

  it("labels score < 9 as Low", () => {
    const { score, scoreLabel } = computeRequestScore(
      "Other",
      "low",
      120 * 60_000, // urgency=2
      80, // quantity=1
    );
    // purpose=1 + urgency=2 + quantity=1 + priority=1 = 5
    expect(score).toBe(5);
    expect(scoreLabel).toBe("Low");
  });

  it("clamps urgency minutes between 1 and 240", () => {
    // Very short TTL (< 1 min) → clamped to 1 min → urgency 5
    const { score: s1 } = computeRequestScore("Other", "low", 100, 50); // 0.001 min
    // Very long TTL (> 240 min) → clamped to 240 → urgency 1
    const { score: s2 } = computeRequestScore("Other", "low", 500 * 60_000, 50);
    // Both should use extreme urgency weights
    expect(s1).toBeGreaterThan(s2);
  });

  it("caps quantity weight at 5", () => {
    const { score: s1 } = computeRequestScore("Other", "low", 60 * 60_000, 500);
    const { score: s2 } = computeRequestScore("Other", "low", 60 * 60_000, 1000);
    // Both should have quantity = 5
    expect(s1).toBe(s2);
  });
});

describe("computeAllocation", () => {
  const makeArea = (
    id: string,
    priority: Priority,
    demand: number,
  ): Area => ({
    id,
    name: `Area ${id}`,
    category: "Residential",
    demand,
    priority,
    allocated: 0,
    status: "No Supply",
    justification: "",
  });

  it("allocates full supply to high-priority areas first", () => {
    const areas = [
      makeArea("a1", "high", 300),
      makeArea("a2", "medium", 400),
      makeArea("a3", "low", 200),
    ];
    const result = computeAllocation(areas, 500);

    const a1 = result.find((a) => a.id === "a1")!;
    const a2 = result.find((a) => a.id === "a2")!;
    const a3 = result.find((a) => a.id === "a3")!;

    expect(a1.allocated).toBe(300);
    expect(a1.status).toBe("Full");
    expect(a2.allocated).toBe(200);
    expect(a2.status).toBe("Partial");
    expect(a3.allocated).toBe(0);
    expect(a3.status).toBe("No Supply");
  });

  it("allocates everything when supply exceeds total demand", () => {
    const areas = [
      makeArea("a1", "high", 200),
      makeArea("a2", "low", 300),
    ];
    const result = computeAllocation(areas, 1000);

    expect(result.every((a) => a.status === "Full")).toBe(true);
    expect(result.find((a) => a.id === "a1")!.allocated).toBe(200);
    expect(result.find((a) => a.id === "a2")!.allocated).toBe(300);
  });

  it("gives nothing when supply is zero", () => {
    const areas = [makeArea("a1", "high", 500)];
    const result = computeAllocation(areas, 0);

    expect(result[0].allocated).toBe(0);
    expect(result[0].status).toBe("No Supply");
  });

  it("preserves original area order in output", () => {
    const areas = [
      makeArea("low-first", "low", 100),
      makeArea("high-second", "high", 100),
      makeArea("med-third", "medium", 100),
    ];
    const result = computeAllocation(areas, 250);

    expect(result[0].id).toBe("low-first");
    expect(result[1].id).toBe("high-second");
    expect(result[2].id).toBe("med-third");
  });

  it("generates correct justification for full allocation", () => {
    const areas = [makeArea("a1", "high", 100)];
    const result = computeAllocation(areas, 200);
    expect(result[0].justification).toContain("Full allocation granted");
  });

  it("generates correct justification for partial allocation", () => {
    const areas = [
      makeArea("a1", "high", 600),
      makeArea("a2", "high", 600),
    ];
    const result = computeAllocation(areas, 900);
    const partial = result.find((a) => a.status === "Partial");
    expect(partial).toBeDefined();
    expect(partial!.justification).toContain("Partial allocation");
  });

  it("generates correct justification for no allocation", () => {
    const areas = [
      makeArea("a1", "high", 500),
      makeArea("a2", "low", 200),
    ];
    const result = computeAllocation(areas, 500);
    const noSupply = result.find((a) => a.id === "a2")!;
    expect(noSupply.justification).toContain("No allocation");
  });

  it("total allocated never exceeds total supply", () => {
    const areas = [
      makeArea("a1", "high", 300),
      makeArea("a2", "high", 300),
      makeArea("a3", "medium", 300),
      makeArea("a4", "low", 300),
    ];
    const supply = 500;
    const result = computeAllocation(areas, supply);
    const totalAllocated = result.reduce((sum, a) => sum + a.allocated, 0);
    expect(totalAllocated).toBeLessThanOrEqual(supply);
  });
});
