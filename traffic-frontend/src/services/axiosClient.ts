import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://api.trafficai.mock/v1";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("trafficai_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("trafficai_token");
    }
    return Promise.reject(error);
  },
);

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    me: "/auth/me",
  },
  dashboard: {
    stats: "/dashboard/stats",
    trend: "/dashboard/trend",
  },
  predictions: {
    list: "/predictions",
    create: "/predictions/run",
  },
  analytics: "/analytics",
  cameras: "/cameras",
  alerts: "/alerts",
  roads: "/roads",
  map: "/map/markers",
  users: "/admin/users",
} as const;
