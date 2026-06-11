import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-bold uppercase tracking-wider">
        Loading…
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};
