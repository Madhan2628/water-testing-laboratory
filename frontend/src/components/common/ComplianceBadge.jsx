import React from 'react';

export const ComplianceBadge = ({ status }) => {
  const norm = (status || '').toUpperCase().replace('-', '_');

  if (norm === 'COMPLIANT' || norm === 'PASS') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 700,
        backgroundColor: '#dcfce7',
        color: '#15803d',
        border: '1px solid #bbf7d0'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
        Compliant
      </span>
    );
  }

  if (norm === 'NON_COMPLIANT' || norm === 'FAIL') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 700,
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fecaca'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }}></span>
        Non-Compliant
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.2rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.72rem',
      fontWeight: 700,
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: '1px solid #e2e8f0'
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
      Pending Review
    </span>
  );
};

export const ResultStatusBadge = ({ status }) => {
  const norm = (status || '').toUpperCase().replace('-', '_');

  if (norm === 'COMPLIANT' || norm === 'PASS') {
    return (
      <span style={{
        padding: '0.15rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 800,
        backgroundColor: '#dcfce7',
        color: '#15803d',
        border: '1px solid #bbf7d0'
      }}>
        PASS
      </span>
    );
  }

  if (norm === 'NON_COMPLIANT' || norm === 'FAIL') {
    return (
      <span style={{
        padding: '0.15rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 800,
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fecaca'
      }}>
        FAIL
      </span>
    );
  }

  return (
    <span style={{
      padding: '0.15rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: 600,
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: '1px solid #e2e8f0'
    }}>
      NOT TESTED
    </span>
  );
};
