import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplianceBadge } from '../../components/common/ComplianceBadge';
import { Loader } from '../../components/common/Loader';
import {
  FileText,
  Download,
  Eye,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Droplet
} from 'lucide-react';

export const ReportList = () => {
  const { user, isCustomer, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
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

    fetchReports();
  }, []);

  const handleDownloadPdf = async (report) => {
    setDownloadingId(report.id);
    try {
      const response = await api.get(`/reports/${report.id}/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `WaterTestReport_${report.reportNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download PDF report.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = reports.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      const matchNum = r.reportNumber?.toLowerCase().includes(q);
      const matchSample = r.sampleId?.toLowerCase().includes(q);
      const matchCust = r.customerName?.toLowerCase().includes(q);
      const matchSrc = r.waterSource?.toLowerCase().includes(q);
      if (!matchNum && !matchSample && !matchCust && !matchSrc) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {isCustomer ? 'My Certified Water Quality Reports' : 'Water Quality Test Reports'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {isCustomer
              ? 'Access and download official ISO/IEC accredited test certificates for your water samples.'
              : 'Browse all laboratory test reports, review compliance outcomes, and download PDF certificates.'}
          </p>
        </div>
      </div>

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
            placeholder="Search by Report #, Sample ID, or Water Source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
          />
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
          <Loader message="Loading certified reports..." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-alt)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Report Number</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Sample ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Water Source</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Collection Point</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Compliance Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Certification Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      No reports available.
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
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {report.waterSource}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.collectionLocation}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <ComplianceBadge status={report.overallAssessment} />
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-light)', fontSize: '0.78rem' }}>
                        {report.reviewedDate ? new Date(report.reviewedDate).toLocaleDateString() : 'Draft'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <Link
                            to={`/app/reports/${report.id}`}
                            title="View Full Report"
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
                            <Eye size={14} /> View
                          </Link>

                          <button
                            onClick={() => handleDownloadPdf(report)}
                            disabled={downloadingId === report.id}
                            title="Download Certified PDF"
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: 'none',
                              background: 'var(--primary)',
                              color: '#ffffff',
                              cursor: downloadingId === report.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <Download size={14} />
                            {downloadingId === report.id ? 'PDF...' : 'PDF'}
                          </button>
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
    </div>
  );
};
