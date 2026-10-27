import React from 'react';

export const ComplianceBadge = ({ status }) => {
  if (status === 'COMPLIANT') {
    return <span className="badge badge-pass">● Compliant</span>;
  }
  if (status === 'NON-COMPLIANT') {
    return <span className="badge badge-fail">▲ Non-Compliant</span>;
  }
  return <span className="badge badge-pending">◆ Pending</span>;
};

export const ResultStatusBadge = ({ status }) => {
  if (status === 'PASS') {
    return <span className="badge badge-pass">PASS</span>;
  }
  if (status === 'FAIL') {
    return <span className="badge badge-fail">FAIL</span>;
  }
  return <span className="badge badge-pending">NOT TESTED</span>;
};
