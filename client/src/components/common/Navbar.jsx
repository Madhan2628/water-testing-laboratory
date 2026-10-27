import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, User, LogOut, CheckCheck, AlertTriangle, FileText, CheckCircle2, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const popoverRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role) => {
    const mapping = {
      admin: { label: 'Admin', bg: '#fef3c7', text: '#92400e' },
      technician: { label: 'Technician', bg: '#e0f2fe', text: '#0369a1' },
      compliance_officer: { label: 'Compliance QA', bg: '#ede9fe', text: '#6d28d9' },
      customer: { label: 'Client / User', bg: '#dcfce7', text: '#15803d' }
    };
    const c = mapping[role] || mapping.customer;
    return (
      <span style={{ backgroundColor: c.bg, color: c.text, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
        {c.label}
      </span>
    );
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'NON_COMPLIANT_ALERT':
        return <AlertTriangle size={18} color="#ef4444" />;
      case 'REPORT_APPROVED':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'REPORT_GENERATED':
        return <FileText size={18} color="#0284c7" />;
      default:
        return <FlaskConical size={18} color="#6366f1" />;
    }
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>
          AquaPure Lab System
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={popoverRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="notif-popover">
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`notif-item ${!n.isRead ? 'notif-unread' : ''}`}
                      onClick={() => markAsRead(n._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ marginTop: '0.2rem' }}>{getNotifIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                          {n.title}
                        </p>
                        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.35rem', display: 'block' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ marginTop: '0.1rem' }}>
              {getRoleBadge(user?.role)}
            </div>
          </div>

          <Link
            to="/app/profile"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-dark)',
              textDecoration: 'none'
            }}
            title="Profile"
          >
            <User size={18} />
          </Link>

          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
