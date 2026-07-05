import { sleep } from "@/lib/utils";
import {
  activities,
  alerts,
  analytics,
  cameras,
  currentUser,
  heatCells,
  managedUsers,
  mapMarkers,
  predictions,
  roadRoutes,
  roads,
  statCards,
  trafficTrend,
  vehicleCounts,
} from "@/data/mockData";
import type {
  Alert,
  AnalyticsSummary,
  Camera,
  CongestionLevel,
  MapMarker,
  PredictionResult,
  RoadRoute,
  User,
} from "@/types";

/**
 * Simulated network layer. Each call mirrors a real REST endpoint (see
 * axiosClient API_ENDPOINTS) but resolves against local dummy data with a
 * realistic latency so loading and skeleton states are exercised.
 */
async function withLatency<T>(data: T, ms = 700): Promise<T> {
  await sleep(ms);
  return data;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    await sleep(900);
    if (!payload.email || !payload.password) {
      throw new Error("Invalid credentials");
    }
    return {
      user: { ...currentUser, email: payload.email },
      token: `mock.jwt.${btoa(payload.email)}`,
    };
  },
  async register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
    await sleep(1000);
    return {
      user: { ...currentUser, name: payload.name, email: payload.email },
      token: `mock.jwt.${btoa(payload.email)}`,
    };
  },
  async forgotPassword(email: string): Promise<{ message: string }> {
    await sleep(900);
    return { message: `Reset link sent to ${email}` };
  },
  async me(): Promise<User> {
    return withLatency(currentUser, 300);
  },
};

export const dashboardApi = {
  getStats: () => withLatency(statCards),
  getTrend: () => withLatency(trafficTrend),
  getVehicleCounts: () => withLatency(vehicleCounts),
  getHeatCells: () => withLatency(heatCells),
  getRecentPredictions: () => withLatency(predictions.slice(0, 8)),
  getAlerts: () => withLatency(alerts.filter((a) => !a.resolved)),
};

export const predictionApi = {
  list: () => withLatency(predictions),
  run: async (input: {
    source: string;
    destination: string;
    weather: string;
    event: string;
    vehicleType: string;
    time: string;
  }): Promise<PredictionResult> => {
    await sleep(1600);
    const weatherRisk: Record<string, number> = {
      Clear: 0,
      Cloudy: 5,
      "Light Rain": 15,
      "Heavy Rain": 35,
      Fog: 25,
      Storm: 45,
    };
    const eventRisk: Record<string, number> = {
      None: 0,
      Festival: 25,
      "Sports Match": 30,
      Concert: 28,
      "Public Holiday": -15,
      "Political Rally": 40,
    };
    const base = 40 + Math.random() * 25;
    const score = Math.min(
      98,
      Math.max(
        8,
        base + (weatherRisk[input.weather] ?? 0) + (eventRisk[input.event] ?? 0),
      ),
    );
    const congestion: CongestionLevel =
      score > 80 ? "severe" : score > 60 ? "heavy" : score > 35 ? "moderate" : "low";
    const distance = Math.round((6 + Math.random() * 24) * 10) / 10;
    const averageSpeed = Math.round(60 - (score / 100) * 45);
    const travelTime = Math.round((distance / averageSpeed) * 60 + score / 4);
    const alternates = [
      "via Outer Ring Road",
      "via Old Madras Road",
      "via Bellary Road bypass",
      "via Sarjapur signal-free corridor",
    ];
    return {
      estimatedTraffic: Math.round(score),
      travelTime,
      congestion,
      confidence: Math.round(82 + Math.random() * 16),
      riskScore: Math.round(score),
      alternateRoute: alternates[Math.floor(Math.random() * alternates.length)],
      recommendation:
        congestion === "severe"
          ? "Delay departure by ~40 min or take the suggested alternate route to avoid gridlock."
          : congestion === "heavy"
            ? "Consider leaving 15 min earlier; expect stop-and-go traffic on the main corridor."
            : congestion === "moderate"
              ? "Traffic is manageable. Maintain steady speed and watch for merges."
              : "Roads are clear. Optimal time to travel with minimal delay.",
      distance,
      averageSpeed,
      timeline: Array.from({ length: 8 }).map((_, i) => ({
        time: `${(i + 1) * 5}m`,
        congestion: Math.round(
          Math.max(5, Math.min(100, score + Math.sin(i) * 18 + (Math.random() - 0.5) * 12)),
        ),
      })),
    };
  },
};

export const analyticsApi = {
  getSummary: (): Promise<AnalyticsSummary> => withLatency(analytics, 800),
};

export const cameraApi = {
  list: (): Promise<Camera[]> => withLatency(cameras),
  refresh: async (id: string): Promise<Camera> => {
    await sleep(600);
    const cam = cameras.find((c) => c.id === id) ?? cameras[0];
    return {
      ...cam,
      vehicleCount: Math.round(50 + Math.random() * 450),
    };
  },
};

export const alertApi = {
  list: (): Promise<Alert[]> => withLatency(alerts),
};

export const mapApi = {
  getMarkers: (): Promise<MapMarker[]> => withLatency(mapMarkers, 500),
  getRoutes: (): Promise<RoadRoute[]> => withLatency(roadRoutes, 500),
};

export const roadApi = {
  list: () => withLatency(roads),
};

export const adminApi = {
  listUsers: (): Promise<User[]> => withLatency(managedUsers),
};

export const activityApi = {
  list: () => withLatency(activities, 400),
};
