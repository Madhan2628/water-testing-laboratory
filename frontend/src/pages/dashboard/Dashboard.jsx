import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplianceBadge } from '../../components/common/ComplianceBadge';
import { Loader } from '../../components/common/Loader';
import {
  Droplet,
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const Dashboard = () => {
  const { user, isAdmin, isStaff, isCustomer } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/statistics');
      const data = res.data.data || res.data;
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard metrics. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return <Loader message="Analyzing laboratory operations & sample status..." />;
  }

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
  const COMPLIANCE_COLORS = {
    'Compliant / Potable': '#10b981',
    'Non-Compliant': '#ef4444',
    'Under Analysis / Pending': '#f59e0b'
  };

  return (
    <div>
      {/* Top Welcome & Quick Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Laboratory Overview & Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            {isCustomer
              ? `Welcome back, ${user?.fullName}! Track testing stages and view verified compliance reports.`
              : `Real-time laboratory workflow, sample diagnostics, and compliance reporting.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchStats}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 0.9rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <Link
            to="/app/samples/register"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              backgroundColor: 'var(--primary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
            }}
          >
            <PlusCircle size={16} />
            <span>{isCustomer ? 'Submit New Sample' : 'Register Sample'}</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* 7 KPI Operational Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Total Samples */}
        <div className="stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Samples</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7' }}>
              <Droplet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            {stats?.totalSamples || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>All registered entries</div>
        </div>

        {/* Awaiting Testing */}
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Awaiting Tests</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: '#fef3c7', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            {stats?.awaitingTesting || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>In intake queue</div>
        </div>

        {/* In Progress */}
        <div className="stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>In Analysis</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5' }}>
              <FlaskConical size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            {stats?.inProgressTests || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>Assays active</div>
        </div>

        {/* Completed Tests */}
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Completed Tests</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            {stats?.completedTests || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>Ready for drafting</div>
        </div>

        {/* Reports Pending Review */}
        <div className="stat-card" style={{ borderLeft: '4px solid #f97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pending Approval</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: '#ffedd5', color: '#ea580c' }}>
              <FileCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            {stats?.reportsPendingApproval || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>Awaiting QA sign-off</div>
        </div>

        {/* Approved Reports */}
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Approved Reports</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            {stats?.approvedReports || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>Officially certified</div>
        </div>

        {/* Non-Compliant Alerts */}
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Non-Compliant</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: '#fef2f2', color: '#dc2626' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>
            {stats?.nonCompliantSamples || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>Exceeded limit alerts</div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Monthly Sample Registration Trend */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Sample Registration Volume</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chronological intake history</p>
            </div>
            <TrendingUp size={18} color="var(--primary)" />
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            {stats?.monthlyRegistrations?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRegistrations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sampleVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                  <Area type="monotone" dataKey="samples" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#sampleVolume)" name="Samples" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                No monthly data available
              </div>
            )}
          </div>
        </div>

        {/* Water Quality Compliance Status Breakdown */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Water Quality Compliance</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assessed against configured reference standards</p>
            </div>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            {stats?.waterQualityCompliance?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.waterQualityCompliance}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="status"
                  >
                    {stats.waterQualityCompliance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COMPLIANCE_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                No compliance data evaluated
              </div>
            )}
          </div>
        </div>

        {/* Water Source Distribution */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Water Source Distribution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Samples categorized by hydrological source</p>
            </div>
            <Droplet size={18} color="#0369a1" />
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            {stats?.sourceDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.sourceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="source" tick={{ fontSize: 9, fill: '#64748b' }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Samples" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                No source distribution data
              </div>
            )}
          </div>
        </div>

        {/* Test Completion Lifecycle Distribution */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Lifecycle Stage Distribution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workflow status distribution</p>
            </div>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            {stats?.testCompletionStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.testCompletionStatus} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#475569' }} width={95} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                No stage data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Sample Registrations */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Recent Sample Submissions</h3>
            <Link to="/app/samples/tracking" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Sample ID</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Source</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentSamples?.length > 0 ? (
                  stats.recentSamples.map(sample => (
                    <tr key={sample.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                        <Link to={`/app/samples/tracking`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {sample.sampleId}
                        </Link>
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-main)', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sample.customerName}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>{sample.waterSource}</td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>
                        <StatusBadge status={sample.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      No recent sample records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Laboratory Tasks */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {isCustomer ? 'My Active In-Progress Samples' : 'Pending Laboratory Tasks'}
            </h3>
            <Link to={isCustomer ? "/app/samples/tracking" : "/app/technician/workspace"} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
              {isCustomer ? 'Track Status' : 'Open Lab Workspace'} <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Sample ID</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Location</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Current Stage</th>
                </tr>
              </thead>
              <tbody>
                {stats?.pendingTasks?.length > 0 ? (
                  stats.pendingTasks.map(task => (
                    <tr key={task.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {task.sampleId}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-main)', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.collectionLocation}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: task.priority === 'High' ? '#fee2e2' : '#f1f5f9',
                          color: task.priority === 'High' ? '#b91c1c' : '#475569'
                        }}>
                          {task.priority || 'Normal'}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>
                        <StatusBadge status={task.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      No tasks awaiting analysis
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
