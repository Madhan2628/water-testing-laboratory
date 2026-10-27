import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplianceBadge } from '../../components/common/ComplianceBadge';
import { Loader } from '../../components/common/Loader';
import {
  FileText,
  FilePlus,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Droplet
} from 'lucide-react';

export const ReportGeneration = () => {
  const { user } = useAuth();
  const [samples, setSamples] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sampleRes, repRes] = await Promise.all([
        api.get('/samples'),
        api.get('/reports')
      ]);

      const sList = sampleRes.data.data || sampleRes.data;
      const rList = repRes.data.data || repRes.data;

      setSamples(Array.isArray(sList) ? sList : []);
      setReports(Array.isArray(rList) ? rList : []);
    } catch (err) {
      console.error('Error fetching data for report generation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateReport = async (sampleId) => {
    setGeneratingId(sampleId);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post(`/reports/generate/${sampleId}`);
      const rep = res.data.data || res.data;
      setSuccessMsg(`Draft report ${rep.reportNumber} compiled successfully!`);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate report. Ensure test results are entered.');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSubmitForReview = async (reportId) => {
    try {
      await api.post(`/reports/${reportId}/submit`);
      setSuccessMsg(`Report submitted for QA review and approval.`);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit report.');
    }
  };

  // Filter samples that have at least reached testing stage
  const eligibleSamples = samples.filter(s => {
    const validStages = [
      'TESTING_IN_PROGRESS',
      'TESTING_COMPLETED',
      'REPORT_PENDING_APPROVAL',
      'APPROVED'
    ];
    if (!validStages.includes(s.status)) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchId = s.sampleId?.toLowerCase().includes(q);
      const matchCust = s.customerName?.toLowerCase().includes(q);
      const matchSrc = s.waterSource?.toLowerCase().includes(q);
      if (!matchId && !matchCust && !matchSrc) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Laboratory Report Generation
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Compile analyzed water parameter results into standardized compliance draft reports.
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

      {/* Search Input */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search by Sample ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Samples Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <Loader message="Loading report generation queue..." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-alt)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Sample ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Customer Name</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Water Source</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Sample Stage</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Report Number</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Report Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eligibleSamples.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      No samples currently in or past the testing stage.
                    </td>
                  </tr>
                ) : (
                  eligibleSamples.map(sample => {
                    const existingReport = reports.find(r => r.sampleId === sample.sampleId);

                    return (
                      <tr
                        key={sample.id}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {sample.sampleId}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)', fontWeight: 500 }}>
                          {sample.customerName}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                          {sample.waterSource}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <StatusBadge status={sample.status} />
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: existingReport ? 'var(--text-main)' : 'var(--text-light)' }}>
                          {existingReport ? existingReport.reportNumber : 'Not Generated'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {existingReport ? (
                            <StatusBadge status={existingReport.status} />
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Pending Generation</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleGenerateReport(sample.sampleId)}
                              disabled={generatingId === sample.sampleId}
                              title="Generate / Update Draft Report"
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid #bae6fd',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              <FilePlus size={14} />
                              {existingReport ? 'Recompile' : 'Generate'}
                            </button>

                            {existingReport && (
                              <Link
                                to={`/app/reports/${existingReport.id}`}
                                title="Preview Report"
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
                            )}

                            {existingReport && existingReport.status === 'DRAFT' && (
                              <button
                                onClick={() => handleSubmitForReview(existingReport.id)}
                                title="Submit for QA Approval"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: 'none',
                                  background: 'var(--primary)',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
                              >
                                <Send size={14} /> Submit QA
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
