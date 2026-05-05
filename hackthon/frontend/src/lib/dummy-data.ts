export const supplyHistory = [
  { day: "Mon", supply: 1200, demand: 1000 },
  { day: "Tue", supply: 1300, demand: 1100 },
  { day: "Wed", supply: 1100, demand: 1200 },
  { day: "Thu", supply: 1400, demand: 1250 },
  { day: "Fri", supply: 1500, demand: 1300 },
  { day: "Sat", supply: 1450, demand: 1380 },
  { day: "Sun", supply: 1500, demand: 1420 },
];

export const areas = [
  { id: "a1", name: "Sector 12 - Greenfield", demand: 320, allocated: 300, status: "ok" as const },
  { id: "a2", name: "Riverside Heights", demand: 480, allocated: 410, status: "low" as const },
  { id: "a3", name: "Old Town", demand: 220, allocated: 220, status: "ok" as const },
  { id: "a4", name: "Industrial Park", demand: 600, allocated: 380, status: "critical" as const },
  { id: "a5", name: "Hillview Suburb", demand: 180, allocated: 180, status: "ok" as const },
];

export const logs = [
  { time: "10:32", actor: "Admin", action: "Increased supply to 1500 ML" },
  { time: "10:15", actor: "User: Maya", action: "Requested 50 ML for Sector 12" },
  { time: "09:58", actor: "System", action: "Request #284 expired" },
  { time: "09:30", actor: "Admin", action: "Set allocation time limit to 30 min" },
  { time: "09:02", actor: "User: Arjun", action: "Requested 80 ML for Old Town" },
];
