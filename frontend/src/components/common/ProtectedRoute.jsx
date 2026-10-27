import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from './Loader';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Verifying session credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || '';
    const hasRole = allowedRoles.some(r => {
      if (r === 'ROLE_ADMIN') return userRole === 'ROLE_ADMIN' || userRole === 'admin';
      if (r === 'ROLE_LABORATORY_STAFF') return userRole === 'ROLE_LABORATORY_STAFF' || userRole === 'staff' || userRole === 'technician' || userRole === 'compliance_officer';
      if (r === 'ROLE_CUSTOMER') return userRole === 'ROLE_CUSTOMER' || userRole === 'customer';
      return userRole === r;
    });

    if (!hasRole) {
      return (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          margin: '2rem auto',
          maxWidth: '600px'
        }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your account role (<strong>{userRole}</strong>) does not have authorization to view this module.
          </p>
          <a
            href="/app/dashboard"
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.25rem',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Return to Dashboard
          </a>
        </div>
      );
    }
  }

  return children;
};
