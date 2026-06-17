import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import AccessDenied from "../components/AccessDenied";

interface ProtectedRouteProps {
  allowedRoles: Array<"donor" | "volunteer" | "finance" | "admin" | "super_admin">;
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Verifying security credentials..." />;
  }

  if (!user) {
    // Redirect unauthorized guests to login screen
    return <Navigate to="/volunteer-login" replace />;
  }

  // Allow access only to permitted active profiles
  if (!profile || profile.status !== "active" || !allowedRoles.includes(profile.role)) {
    return <AccessDenied />;
  }

  return <Outlet />;
}
