import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplianceBadge } from '../../components/common/ComplianceBadge';
import { Loader } from '../../components/common/Loader';
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Calendar,
  MapPin,
  User,
  Droplet,
  Printer
} from 'lucide-react';

export const ReportDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/${id}`);
        const data = res.data.data || res.data;
        setReport(data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err.response?.data?.message || 'Report not found or not yet approved.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloading(true);
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
      setDownloading(false);
    }
  };

  if (loading) {
    return <Loader message="Compiling verified report details..." />;
  }

  if (error || !report) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <AlertTriangle size={36} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Report Unavailable
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error || 'The requested laboratory report could not be found or is not yet published.'}
        </p>
        <Link to="/app/reports" style={{ padding: '0.6rem 1.25rem', backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 600 }}>
          Back to Reports List
        </Link>
      </div>
    );
  }

  const isApproved = report.status === 'APPROVED';
  const isCompliant = report.overallAssessment === 'COMPLIANT';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Action Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to={isAdmin ? "/app/reports/approval" : "/app/reports"} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Reports
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} /> Print
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.25rem',
              backgroundColor: 'var(--primary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: downloading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Download size={16} /> {downloading ? 'Downloading...' : 'Download Official PDF Report'}
          </button>
        </div>
      </div>

      {/* Main Report Document Sheet */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        padding: '2.5rem',
        position: 'relative'
      }}>
        {/* Watermark for DRAFT */}
        {!isApproved && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
            fontSize: '5rem',
            fontWeight: 900,
            color: 'rgba(239, 68, 68, 0.08)',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap'
          }}>
            DRAFT REPORT
          </div>
        )}

        {/* Laboratory Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--primary)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplet size={22} />
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                AquaPure Water Quality Testing Laboratories
              </h1>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Environmental & Drinking Water Analysis Wing • ISO/IEC 17025 Accredited Facility<br />
              100 Science City Road, Sector 5, Tech Corridor • info@watertest.com
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {report.reportNumber}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Sample: {report.sampleId}
            </div>
            <div style={{ marginTop: '0.35rem' }}>
              <StatusBadge status={report.status} />
            </div>
          </div>
        </div>

        {/* Customer & Sampling Logistics Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', backgroundColor: 'var(--surface-alt)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Customer Name</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{report.customerName}</span>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{report.customerOrganization || 'Individual'}</span>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{report.customerEmail}</span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Sample Source & Type</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{report.waterSource}</span>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem' }}>Type: {report.sampleType}</span>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem' }}>Condition: {report.sampleCondition || 'Good'}</span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Collection & Testing Dates</span>
            <span style={{ display: 'block', color: 'var(--text-main)' }}>Collected: <strong>{report.collectionDate ? new Date(report.collectionDate).toLocaleDateString() : 'N/A'}</strong></span>
            <span style={{ display: 'block', color: 'var(--text-main)' }}>Received: <strong>{report.receivedDate ? new Date(report.receivedDate).toLocaleDateString() : 'N/A'}</strong></span>
            <span style={{ display: 'block', color: 'var(--text-main)' }}>Completed: <strong>{report.testingCompletedDate ? new Date(report.testingCompletedDate).toLocaleDateString() : 'N/A'}</strong></span>
          </div>
        </div>

        {/* Section: Test Parameters Table */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--primary)" />
            Analytical Results & Permissible Standards Evaluation
          </h2>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Parameter Name</th>
                  <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Test Method</th>
                  <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600, textAlign: 'center' }}>Measured Result</th>
                  <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Unit</th>
                  <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Reference Standard Limits</th>
                  <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.parametersSnapshot?.map((item, idx) => {
                  const isPass = item.complianceStatus === 'COMPLIANT';
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}
                    >
                      <td style={{ padding: '0.7rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.parameterName}
                      </td>
                      <td style={{ padding: '0.7rem 0.85rem', color: 'var(--text-muted)' }}>
                        {item.category}
                      </td>
                      <td style={{ padding: '0.7rem 0.85rem', color: 'var(--text-light)', fontSize: '0.78rem' }}>
                        {item.testMethod || 'Standard Assay'}
                      </td>
                      <td style={{ padding: '0.7rem 0.85rem', fontWeight: 700, textAlign: 'center', color: isPass ? 'var(--text-main)' : '#dc2626' }}>
                        {item.measuredValue}
                      </td>
                      <td style={{ padding: '0.7rem 0.85rem', color: 'var(--text-muted)' }}>
                        {item.unit || '-'}
                      </td>
                      <td style={{ padding: '0.7rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {item.referenceLimitDisplay || 'Standard'}
                      </td>
                      <td style={{ padding: '0.7rem 0.85rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: isPass ? '#dcfce7' : '#fee2e2',
                          color: isPass ? '#15803d' : '#b91c1c'
                        }}>
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overall Assessment Banner */}
        <div style={{
          backgroundColor: isCompliant ? '#ecfdf5' : '#fef2f2',
          border: `1.5px solid ${isCompliant ? '#10b981' : '#ef4444'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            {isCompliant ? <CheckCircle2 size={20} color="#10b981" /> : <AlertTriangle size={20} color="#ef4444" />}
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: isCompliant ? '#065f46' : '#991b1b' }}>
              OVERALL ASSESSMENT: {isCompliant ? 'COMPLIANT / POTABLE WITH RESPECT TO TESTED PARAMETERS' : 'NON-COMPLIANT WITH SPECIFIED LIMITS'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: isCompliant ? '#047857' : '#b91c1c', lineHeight: 1.45 }}>
            {report.assessmentSummary || (isCompliant
              ? `All ${report.totalParameters} analyzed parameters comply with standard baseline requirements.`
              : `${report.failedParameters} of ${report.totalParameters} parameters exceeded permissible criteria.`)}
          </p>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '0.4rem' }}>
            <strong>Laboratory Remarks:</strong> {report.laboratoryObservations || 'Sample analyzed under calibrated laboratory atmospheric conditions.'}
          </div>
        </div>

        {/* Verification and Reviewer Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Analyst / Prepared By</span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem', display: 'block' }}>
              {report.preparedBy || 'Laboratory Testing Staff'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Date: {report.preparedDate ? new Date(report.preparedDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Authorized QA Reviewer</span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem', display: 'block' }}>
              {report.reviewedBy || 'Dr. Elizabeth Shaw (QA Officer)'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              {report.reviewerDesignation || 'Quality Assurance & Regulatory Audits'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Status: <strong>{isApproved ? 'Approved & Certified' : 'Review Pending'}</strong> • {report.reviewedDate ? new Date(report.reviewedDate).toLocaleDateString() : ''}
            </span>
          </div>
        </div>

        {/* Official Disclaimer */}
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-light)', lineHeight: 1.4, borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          {report.disclaimer}
          <div style={{ marginTop: '0.25rem' }}>
            Digitally certified document • Generated via AquaPure WTLMS • Verifiable ID: {report.reportNumber}
          </div>
        </div>
      </div>
    </div>
  );
};
