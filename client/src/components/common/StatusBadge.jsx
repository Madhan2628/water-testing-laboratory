import React from 'react';

const STATUS_CONFIG = {
  'REGISTERED': { label: 'Registered', className: 'badge-registered' },
  'RECEIVED': { label: 'Received', className: 'badge-received' },
  'UNDER ANALYSIS': { label: 'Under Analysis', className: 'badge-analysis' },
  'ANALYSIS COMPLETED': { label: 'Analysis Completed', className: 'badge-completed' },
  'REPORT GENERATED': { label: 'Report Generated', className: 'badge-report' },
  'APPROVED': { label: 'Approved', className: 'badge-approved' },
  'DELIVERED': { label: 'Delivered', className: 'badge-delivered' },
  'DRAFT': { label: 'Draft', className: 'badge-registered' },
  'UNDER REVIEW': { label: 'Under Review', className: 'badge-analysis' }
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-registered' };
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
};
