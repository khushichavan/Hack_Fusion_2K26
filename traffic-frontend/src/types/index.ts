export type CongestionLevel = "low" | "moderate" | "heavy" | "severe";

export type UserRole = "admin" | "operator" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt: string;
  lastActive: string;
  status: "active" | "inactive" | "suspended";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface StatCard {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: string;
  accent: string;
}

export interface TrafficTrendPoint {
  time: string;
  current: number;
  predicted: number;
  vehicles: number;
}

export interface VehicleCountPoint {
  hour: string;
  cars: number;
  trucks: number;
  bikes: number;
  buses: number;
}

export interface HeatCell {
  zone: string;
  day: string;
  value: number;
}

export interface Prediction {
  id: string;
  route: string;
  source: string;
  destination: string;
  congestion: CongestionLevel;
  confidence: number;
  travelTime: number;
  distance: number;
  timestamp: string;
  vehicleCount: number;
  status: "completed" | "processing" | "failed";
}

export interface PredictionResult {
  estimatedTraffic: number;
  travelTime: number;
  congestion: CongestionLevel;
  confidence: number;
  riskScore: number;
  alternateRoute: string;
  recommendation: string;
  distance: number;
  averageSpeed: number;
  timeline: { time: string; congestion: number }[];
}

export type AlertType =
  | "accident"
  | "roadblock"
  | "weather"
  | "emergency"
  | "construction";

export type AlertPriority = "critical" | "high" | "medium" | "low";

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  location: string;
  coordinates: [number, number];
  timestamp: string;
  resolved: boolean;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  status: "online" | "offline" | "maintenance";
  density: CongestionLevel;
  vehicleCount: number;
  detection: string;
  thumbnail: string;
  fps: number;
}

export type MapMarkerType =
  | "traffic"
  | "camera"
  | "accident"
  | "construction"
  | "emergency"
  | "congestion";

export interface MapMarker {
  id: string;
  type: MapMarkerType;
  position: [number, number];
  title: string;
  description: string;
  level?: CongestionLevel;
  extra?: Record<string, string | number>;
}

export interface RoadRoute {
  id: string;
  name: string;
  level: CongestionLevel;
  path: [number, number][];
  speed: number;
  delay: number;
}

export interface Road {
  id: string;
  name: string;
  zone: string;
  lanes: number;
  length: number;
  congestion: CongestionLevel;
  avgSpeed: number;
  capacity: number;
  status: "open" | "restricted" | "closed";
}

export interface AnalyticsSummary {
  dailyTraffic: { day: string; volume: number }[];
  weeklyTraffic: { week: string; volume: number }[];
  monthlyTraffic: { month: string; volume: number }[];
  peakHours: { hour: string; intensity: number }[];
  averageSpeed: { zone: string; speed: number }[];
  vehicleDistribution: { name: string; value: number; color: string }[];
  predictionAccuracy: { date: string; accuracy: number }[];
  congestionFrequency: { level: string; count: number; color: string }[];
}

export interface Activity {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  icon: string;
}
