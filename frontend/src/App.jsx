import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import AnalystDashboard from "./pages/analyst/Dashboard.jsx";
import CaseManagement from "./pages/analyst/CaseManagement.jsx";
import CaseDetail from "./pages/analyst/CaseDetail.jsx";
import AuditExplorer from "./pages/analyst/AuditExplorer.jsx";
import CustomerPortal from "./pages/customer/Portal.jsx";
import TransactionDetail from "./pages/customer/TransactionDetail.jsx";
import SecurityCenter from "./pages/shared/SecurityCenter.jsx";
import Simulator from "./pages/shared/Simulator.jsx";

export default function App() {
  const { user } = useAuth();
  const homePath = user?.role === "customer" ? "/portal" : "/dashboard";

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={homePath} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={homePath} replace /> : <Register />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["analyst", "admin", "auditor"]}>
              <AnalystDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute roles={["analyst", "admin", "auditor"]}>
              <CaseManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <ProtectedRoute roles={["analyst", "admin", "auditor"]}>
              <CaseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute roles={["admin", "auditor"]}>
              <AuditExplorer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portal"
          element={
            <ProtectedRoute roles={["customer"]}>
              <CustomerPortal />
            </ProtectedRoute>
          }
        />
        <Route path="/transactions/:id" element={<TransactionDetail />} />

        <Route path="/security" element={<SecurityCenter />} />
        <Route path="/simulator" element={<Simulator />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
