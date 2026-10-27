import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    Urgent: { bg: '#fee2e2', text: '#991b1b', label: 'Urgent' },
    High: { bg: '#ffedd5', text: '#9a3412', label: 'High' },
    Normal: { bg: '#f1f5f9', text: '#334155', label: 'Normal' },
    Low: { bg: '#f8fafc', text: '#64748b', label: 'Low' }
  };

  const current = styles[priority] || styles.Normal;

  return (
    <span
      style={{
        backgroundColor: current.bg,
        color: current.text,
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        display: 'inline-block'
      }}
    >
      {current.label}
    </span>
  );
};
