import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { SampleRegistration } from './pages/samples/SampleRegistration';
import { SampleTracking } from './pages/samples/SampleTracking';
import { TestParameters } from './pages/parameters/TestParameters';
import { LabWorkspace } from './pages/technician/LabWorkspace';
import { ReportGeneration } from './pages/reports/ReportGeneration';
import { ReportApproval } from './pages/reports/ReportApproval';
import { ReportDetail } from './pages/reports/ReportDetail';
import { ReportList } from './pages/reports/ReportList';
import { CustomerList } from './pages/customers/CustomerList';
import { StaffManagement } from './pages/users/StaffManagement';
import { Settings } from './pages/profile/Settings';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect to Dashboard or Login */}
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

          {/* Authenticated Application Shell */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />

            {/* 1. Dashboard (All roles) */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* 2. Sample Registration / Request (All roles) */}
            <Route path="samples/register" element={<SampleRegistration />} />

            {/* 3. Sample Tracking (All roles) */}
            <Route path="samples/tracking" element={<SampleTracking />} />

            {/* 4. Test Management / Reference Standards (Admin only) */}
            <Route
              path="parameters"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <TestParameters />
                </ProtectedRoute>
              }
            />

            {/* 5. Test Results / Lab Workspace (Staff and Admin) */}
            <Route
              path="technician/workspace"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_LABORATORY_STAFF']}>
                  <LabWorkspace />
                </ProtectedRoute>
              }
            />

            {/* 6. Report Generation (Staff and Admin) */}
            <Route
              path="reports/generate"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_LABORATORY_STAFF']}>
                  <ReportGeneration />
                </ProtectedRoute>
              }
            />

            {/* 7. Report Approval (Admin only) */}
            <Route
              path="reports/approval"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <ReportApproval />
                </ProtectedRoute>
              }
            />

            {/* Reports List and Detail View */}
            <Route path="reports" element={<ReportList />} />
            <Route path="reports/:id" element={<ReportDetail />} />

            {/* 8. Customers Management (Admin and Staff) */}
            <Route
              path="customers"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_LABORATORY_STAFF']}>
                  <CustomerList />
                </ProtectedRoute>
              }
            />

            {/* 9. Staff Management (Admin only) */}
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />

            {/* 10. Settings (All roles) */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
