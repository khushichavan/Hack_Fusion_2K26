import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageLoader } from "@/components/common/LoadingSpinner";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const LiveMap = lazy(() => import("@/pages/LiveMap"));
const Prediction = lazy(() => import("@/pages/Prediction"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Cameras = lazy(() => import("@/pages/Cameras"));
const Alerts = lazy(() => import("@/pages/Alerts"));
const History = lazy(() => import("@/pages/History"));
const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  const location = useLocation();
  return (
    <TooltipProvider delayDuration={200}>
      <Suspense fallback={<PageLoader label="Loading TrafficAI" />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname.split("/")[1]}>
            <Route path="/" element={<Landing />} />

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="map" element={<LiveMap />} />
              <Route path="prediction" element={<Prediction />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="cameras" element={<Cameras />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <Toaster />
    </TooltipProvider>
  );
}
