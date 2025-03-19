import React from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export const ProtectedRouteWithLayout = ({ children, layout: Layout }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};
