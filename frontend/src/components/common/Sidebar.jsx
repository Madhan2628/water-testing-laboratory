import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Activity,
  Sliders,
  FlaskConical,
  FileText,
  CheckSquare,
  Users,
  UserCheck,
  Settings,
  LogOut,
  Droplet
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, isStaff, isCustomer, logout } = useAuth();

  const getRoleLabel = () => {
    if (isAdmin) return 'System Administrator';
    if (isStaff) return 'Laboratory Specialist';
    if (isCustomer) return 'Verified Client';
    return 'User';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/app/dashboard" className="sidebar-logo">
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            borderRadius: '10px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)'
          }}>
            <Droplet size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              AquaPure
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              WTLMS Portal
            </div>
          </div>
        </NavLink>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Operations Menu
        </div>

        {/* 1. Dashboard - All Roles */}
        <NavLink to="/app/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {/* 2. Sample Registration / Request */}
        <NavLink to="/app/samples/register" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <PlusCircle size={18} />
          <span>{isCustomer ? 'New Testing Request' : 'Sample Registration'}</span>
        </NavLink>

        {/* 3. Sample Tracking - All Roles */}
        <NavLink to="/app/samples/tracking" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Activity size={18} />
          <span>Sample Tracking</span>
        </NavLink>

        {/* 4. Test Management - Admin Only */}
        {isAdmin && (
          <NavLink to="/app/parameters" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Sliders size={18} />
            <span>Test Management</span>
          </NavLink>
        )}

        {/* 5. Test Results - Staff and Admin */}
        {(isAdmin || isStaff) && (
          <NavLink to="/app/technician/workspace" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FlaskConical size={18} />
            <span>Test Results</span>
          </NavLink>
        )}

        {/* 6. Report Generation - Staff and Admin (or My Reports for Customer) */}
        {(isAdmin || isStaff) ? (
          <NavLink to="/app/reports/generate" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FileText size={18} />
            <span>Report Generation</span>
          </NavLink>
        ) : (
          <NavLink to="/app/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FileText size={18} />
            <span>My Test Reports</span>
          </NavLink>
        )}

        {/* 7. Report Approval - Admin Only */}
        {isAdmin && (
          <NavLink to="/app/reports/approval" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <CheckSquare size={18} />
            <span>Report Approval</span>
          </NavLink>
        )}

        {/* 8. Customers - Admin and Staff */}
        {(isAdmin || isStaff) && (
          <NavLink to="/app/customers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Customers</span>
          </NavLink>
        )}

        {/* 9. Staff Management - Admin Only */}
        {isAdmin && (
          <NavLink to="/app/staff" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <UserCheck size={18} />
            <span>Staff Management</span>
          </NavLink>
        )}

        <div style={{ marginTop: '1.25rem', padding: '0.25rem 0.75rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Preferences
        </div>

        {/* 10. Settings - All Roles */}
        <NavLink to="/app/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* User profile block & logout */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--surface-alt)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || 'User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {getRoleLabel()}
            </div>
          </div>
        </div>

        {/* 11. Logout */}
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: '#ffffff',
            color: 'var(--danger)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
