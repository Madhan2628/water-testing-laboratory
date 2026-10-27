import React from 'react';

const STATUS_CONFIG = {
  'REQUESTED': { label: 'Requested', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  'REGISTERED': { label: 'Registered', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
  'SAMPLE_RECEIVED': { label: 'Sample Received', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' },
  'TESTING_IN_PROGRESS': { label: 'Testing in Progress', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  'TESTING_COMPLETED': { label: 'Testing Completed', bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  'REPORT_PENDING_APPROVAL': { label: 'Report Pending Approval', bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' },
  'APPROVED': { label: 'Approved', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  'REJECTED': { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  'CANCELLED': { label: 'Cancelled', bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' },
  // Report statuses
  'DRAFT': { label: 'Draft', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  'PENDING_APPROVAL': { label: 'Pending QA Approval', bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' }
};

export const StatusBadge = ({ status }) => {
  const normalized = status ? status.toUpperCase().replace(/\s+/g, '_') : 'REGISTERED';
  const config = STATUS_CONFIG[normalized] || {
    label: status || 'Unknown',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1'
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.72rem',
      fontWeight: 700,
      backgroundColor: config.bg,
      color: config.color,
      border: `1px solid ${config.border}`,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap'
    }}>
      {config.label}
    </span>
  );
};
