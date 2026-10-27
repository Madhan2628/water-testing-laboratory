import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loader } from '../../components/common/Loader';
import {
  Activity,
  Search,
  Filter,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  FileText,
  X,
  Calendar,
  MapPin,
  User,
  Droplet
} from 'lucide-react';

const WORKFLOW_STEPS = [
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'REGISTERED', label: 'Registered' },
  { key: 'SAMPLE_RECEIVED', label: 'Received' },
  { key: 'TESTING_IN_PROGRESS', label: 'In Testing' },
  { key: 'TESTING_COMPLETED', label: 'Completed' },
  { key: 'REPORT_PENDING_APPROVAL', label: 'QA Review' },
  { key: 'APPROVED', label: 'Approved' }
];

export const SampleTracking = () => {
  const { user, isAdmin, isStaff, isCustomer } = useAuth();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected sample modal for timeline details & status update
  const [selectedSample, setSelectedSample] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComments, setStatusComments] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (sourceFilter !== 'All') params.waterSource = sourceFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/samples', { params });
      const data = res.data.data || res.data;
      setSamples(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching samples:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, [search, sourceFilter, statusFilter]);

  const handleOpenStatusModal = (sample) => {
    setSelectedSample(sample);
    setNewStatus(sample.status);
    setStatusComments('');
    setStatusError('');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedSample) return;
    setUpdatingStatus(true);
    setStatusError('');

    try {
      const res = await api.patch(`/samples/${selectedSample.id}/status`, {
        status: newStatus,
        comments: statusComments
      });
      const updated = res.data.data || res.data;
      setShowStatusModal(false);
      setSelectedSample(updated);
      fetchSamples();
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update sample status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStepIndex = (status) => {
    if (!status) return 0;
    const idx = WORKFLOW_STEPS.findIndex(s => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Sample Lifecycle Tracking
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {isCustomer
              ? 'Real-time timeline progression and testing milestone updates for your submitted samples.'
              : 'Track laboratory sample workflow transitions from intake receipt to final certification.'}
          </p>
        </div>

        <Link
          to="/app/samples/register"
          style={{
            padding: '0.6rem 1rem',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
          }}
        >
          {isCustomer ? '+ Submit New Request' : '+ Register Sample'}
        </Link>
      </div>

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
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search by Sample ID, Customer Name, or Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.4rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Source Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="All">All Water Sources</option>
            <option value="Drinking water">Drinking water</option>
            <option value="Borewell water">Borewell water</option>
            <option value="Groundwater">Groundwater</option>
            <option value="River water">River water</option>
            <option value="Lake water">Lake water</option>
            <option value="Pond water">Pond water</option>
            <option value="Industrial wastewater">Industrial wastewater</option>
            <option value="Treated water">Treated water</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="All">All Lifecycle Statuses</option>
            <option value="REQUESTED">REQUESTED</option>
            <option value="REGISTERED">REGISTERED</option>
            <option value="SAMPLE_RECEIVED">SAMPLE RECEIVED</option>
            <option value="TESTING_IN_PROGRESS">TESTING IN PROGRESS</option>
            <option value="TESTING_COMPLETED">TESTING COMPLETED</option>
            <option value="REPORT_PENDING_APPROVAL">REPORT PENDING APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <Loader message="Fetching tracking records..." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-alt)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Sample ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Customer Name</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Water Source</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Collection Point</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Registered</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Lifecycle Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {samples.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      No matching water samples found.
                    </td>
                  </tr>
                ) : (
                  samples.map(sample => (
                    <tr
                      key={sample.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background-color 0.15s'
                      }}
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
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sample.collectionLocation}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-light)', fontSize: '0.78rem' }}>
                        {sample.createdAt ? new Date(sample.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <StatusBadge status={sample.status} />
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setSelectedSample(sample)}
                            title="View Lifecycle Timeline"
                            style={{
                              padding: '0.35rem 0.6rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              background: '#ffffff',
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <Activity size={14} /> Timeline
                          </button>

                          {(isAdmin || isStaff) && (
                            <button
                              onClick={() => handleOpenStatusModal(sample)}
                              title="Update Status"
                              style={{
                                padding: '0.35rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: '#f8fafc',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              <Edit size={14} /> Status
                            </button>
                          )}

                          {(isAdmin || isStaff) && (
                            <Link
                              to={`/app/technician/workspace?sampleId=${sample.sampleId}`}
                              title="Enter Test Results"
                              style={{
                                padding: '0.35rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid #bae6fd',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              <FlaskConical size={14} /> Assays
                            </Link>
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

      {/* Selected Sample Detail & Visual Progress Timeline Drawer/Modal */}
      {selectedSample && !showStatusModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '780px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedSample(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-light)'
              }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplet size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Sample #{selectedSample.sampleId}
                  </h2>
                  <StatusBadge status={selectedSample.status} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedSample.waterSource} • {selectedSample.customerName}
                </p>
              </div>
            </div>

            {/* Visual Workflow Progress Tracker */}
            <div style={{ backgroundColor: 'var(--surface-alt)', padding: '1.5rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', textAlign: 'center' }}>
                Workflow Progress Pipeline
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                {WORKFLOW_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(selectedSample.status);
                  const isDone = idx < currentIdx || selectedSample.status === 'APPROVED';
                  const isCurrent = idx === currentIdx && selectedSample.status !== 'APPROVED';

                  return (
                    <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#10b981' : isCurrent ? '#0284c7' : '#ffffff',
                        border: `2px solid ${isDone ? '#10b981' : isCurrent ? '#0284c7' : '#cbd5e1'}`,
                        color: isDone || isCurrent ? '#ffffff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: isCurrent ? '0 0 0 4px #e0f2fe' : 'none',
                        transition: 'all 0.2s'
                      }}>
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? 'var(--primary)' : isDone ? 'var(--text-main)' : 'var(--text-light)',
                        marginTop: '0.4rem',
                        textAlign: 'center'
                      }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sample Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>Collection Point</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedSample.collectionLocation}</span>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>Collection Time</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {selectedSample.collectionDateTime ? new Date(selectedSample.collectionDateTime).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>Condition on Intake</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedSample.sampleCondition || 'Good'}</span>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>Priority Flag</span>
                <span style={{ fontWeight: 700, color: selectedSample.priority === 'High' ? '#dc2626' : 'var(--text-main)' }}>
                  {selectedSample.priority || 'Normal'}
                </span>
              </div>
            </div>

            {/* Status History & Audit Log */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                Status Transition History & Chain-of-Custody
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedSample.statusHistory?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '6px' }}>
                    <div style={{ marginTop: '0.15rem' }}>
                      <Clock size={16} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.status}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {item.comments}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                        Action by: {item.updatedBy || 'System'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setSelectedSample(null)}
                style={{ padding: '0.6rem 1.25rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                Close
              </button>

              {(isAdmin || isStaff) && (
                <button
                  type="button"
                  onClick={() => setShowStatusModal(true)}
                  style={{ padding: '0.6rem 1.25rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', cursor: 'pointer' }}
                >
                  Update Stage
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Transition Modal */}
      {showStatusModal && selectedSample && (
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
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Transition Sample Status
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Update workflow stage for {selectedSample.sampleId}. Allowed transitions are strictly validated.
            </p>

            {statusError && (
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {statusError}
              </div>
            )}

            <form onSubmit={handleUpdateStatus}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Target Status Stage *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                >
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="REGISTERED">REGISTERED</option>
                  <option value="SAMPLE_RECEIVED">SAMPLE RECEIVED</option>
                  <option value="TESTING_IN_PROGRESS">TESTING IN PROGRESS</option>
                  <option value="TESTING_COMPLETED">TESTING COMPLETED</option>
                  <option value="REPORT_PENDING_APPROVAL">REPORT PENDING APPROVAL</option>
                  <option value="APPROVED">APPROVED (Requires QA Review)</option>
                  <option value="REJECTED">REJECTED / COMPROMISED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Reason / Technical Comments
                </label>
                <textarea
                  rows={3}
                  value={statusComments}
                  onChange={(e) => setStatusComments(e.target.value)}
                  placeholder="e.g. Sample verified at laboratory cold store intake line."
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  style={{ padding: '0.6rem 1rem', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  style={{ padding: '0.6rem 1.25rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', cursor: updatingStatus ? 'not-allowed' : 'pointer' }}
                >
                  {updatingStatus ? 'Saving...' : 'Apply Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
