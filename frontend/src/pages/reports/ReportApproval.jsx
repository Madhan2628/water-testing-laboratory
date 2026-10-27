import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplianceBadge } from '../../components/common/ComplianceBadge';
import { Loader } from '../../components/common/Loader';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

export const ReportApproval = () => {
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [decision, setDecision] = useState('APPROVE');
  const [reviewerComments, setReviewerComments] = useState('');
  const [reviewerDesignation, setReviewerDesignation] = useState('Senior Quality Assurance Officer');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      const data = res.data.data || res.data;
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenReview = (report) => {
    setSelectedReport(report);
    setDecision('APPROVE');
    setReviewerComments('Verified calibration blanks, duplicate concordance, and certified against IS 10500:2012 criteria.');
    setReviewerDesignation('Senior Quality Assurance Officer');
    setErrorMsg('');
    setReviewModalOpen(true);
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post(`/reports/${selectedReport.id}/review`, {
        decision,
        reviewerComments,
        reviewerDesignation
      });

      setSuccessMsg(`Report ${selectedReport.reportNumber} has been successfully ${decision.toLowerCase()}d!`);
      setReviewModalOpen(false);
      fetchReports();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit review decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reports.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNum = r.reportNumber?.toLowerCase().includes(q);
      const matchCust = r.customerName?.toLowerCase().includes(q);
      const matchSample = r.sampleId?.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchSample) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Report Review & Quality Assurance Approval
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Authorized QA reviewer portal: verify measured assay thresholds and publish certified final reports.
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} color="#ef4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search Report #, Sample ID, or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
          >
            <option value="ALL">All Review Statuses</option>
            <option value="PENDING_APPROVAL">Pending QA Approval</option>
            <option value="DRAFT">Draft Reports</option>
            <option value="APPROVED">Certified / Approved</option>
            <option value="REJECTED">Returned / Rejected</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <Loader message="Loading reports awaiting QA review..." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-alt)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Report Number</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Sample ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Customer Name</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Water Source</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Compliance Assessment</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Approval Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Review Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      No reports match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(report => (
                    <tr
                      key={report.id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>
                        <Link to={`/app/reports/${report.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {report.reportNumber}
                        </Link>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {report.sampleId}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                        {report.customerName}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {report.waterSource}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <ComplianceBadge status={report.overallAssessment} />
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
                          {report.passedParameters}/{report.totalParameters} pass ({report.compliancePercentage}%)
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <StatusBadge status={report.status} />
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <Link
                            to={`/app/reports/${report.id}`}
                            title="Inspect Report Data"
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              background: '#ffffff',
                              color: 'var(--text-main)',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <Eye size={14} /> Preview
                          </Link>

                          {isAdmin && (
                            <button
                              onClick={() => handleOpenReview(report)}
                              title="QA Decision"
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: report.status === 'APPROVED' ? '#f1f5f9' : 'var(--primary)',
                                color: report.status === 'APPROVED' ? 'var(--text-muted)' : '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              <CheckSquare size={14} /> {report.status === 'APPROVED' ? 'Revise' : 'Review'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Approval Modal */}
      {reviewModalOpen && selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            maxWidth: '560px',
            width: '100%',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              QA Approval Review: {selectedReport.reportNumber}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Sample: {selectedReport.sampleId} • Source: {selectedReport.waterSource} • {selectedReport.customerName}
            </p>

            {/* Assessment Summary Snapshot */}
            <div style={{
              backgroundColor: selectedReport.overallAssessment === 'COMPLIANT' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${selectedReport.overallAssessment === 'COMPLIANT' ? '#a7f3d0' : '#fecaca'}`,
              borderRadius: '6px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ fontWeight: 700, color: selectedReport.overallAssessment === 'COMPLIANT' ? '#065f46' : '#991b1b', marginBottom: '0.2rem' }}>
                Outcome: {selectedReport.overallAssessment} ({selectedReport.passedParameters}/{selectedReport.totalParameters} compliant)
              </div>
              <div style={{ color: selectedReport.overallAssessment === 'COMPLIANT' ? '#047857' : '#b91c1c', fontSize: '0.8rem' }}>
                {selectedReport.assessmentSummary}
              </div>
            </div>

            <form onSubmit={handleDecisionSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Review Decision *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1.5px solid ${decision === 'APPROVE' ? '#10b981' : 'var(--border)'}`,
                    backgroundColor: decision === 'APPROVE' ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: decision === 'APPROVE' ? '#065f46' : 'var(--text-main)'
                  }}>
                    <input
                      type="radio"
                      name="decision"
                      value="APPROVE"
                      checked={decision === 'APPROVE'}
                      onChange={() => setDecision('APPROVE')}
                    />
                    <span>Approve & Certify</span>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1.5px solid ${decision === 'REJECT' ? '#ef4444' : 'var(--border)'}`,
                    backgroundColor: decision === 'REJECT' ? '#fef2f2' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: decision === 'REJECT' ? '#991b1b' : 'var(--text-main)'
                  }}>
                    <input
                      type="radio"
                      name="decision"
                      value="REJECT"
                      checked={decision === 'REJECT'}
                      onChange={() => setDecision('REJECT')}
                    />
                    <span>Return for Correction</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Reviewer Official Designation
                </label>
                <input
                  type="text"
                  value={reviewerDesignation}
                  onChange={(e) => setReviewerDesignation(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  QA Verification Comments & Technical Remarks
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewerComments}
                  onChange={(e) => setReviewerComments(e.target.value)}
                  placeholder="e.g. Verified analytical quality control data. Released for client consumption."
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  style={{ padding: '0.6rem 1rem', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.6rem 1.5rem',
                    backgroundColor: decision === 'APPROVE' ? '#10b981' : '#ef4444',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Recording Decision...' : decision === 'APPROVE' ? 'Confirm Approval' : 'Return for Re-assay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
