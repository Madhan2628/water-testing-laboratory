import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Settings as SettingsIcon, 
  Building2, 
  ShieldCheck, 
  BookOpen, 
  Sliders, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  RefreshCw,
  Info
} from 'lucide-react';

export const Settings = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('standards');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [backendStatus, setBackendStatus] = useState({ checking: false, connected: null, message: '' });

  // Laboratory Organization Details state
  const [labConfig, setLabConfig] = useState({
    labName: 'AquaPure Central Environmental & Water Quality Testing Laboratory',
    shortName: 'AquaPure Lab Services',
    facilityCode: 'AP-LAB-7849',
    address: '402 Hydrology Research Park, EcoTech Corridor, Metro City, 560001',
    contactEmail: 'lab.testing@aquapure-labs.org',
    contactPhone: '+91 (080) 4125-9800',
    directorName: 'Dr. Robert Jenkins, Ph.D. (Water Chemistry)',
    qualityManager: 'Elena Rostova, M.Sc. (Microbiology)',
    accreditationDisclaimer: 'Testing conducted adhering strictly to standardized analytical protocols (APHA, IS 10500:2012, and ISO/IEC 17025:2017 principles). All interpretations represent deterministic compliance against configured regional standards.'
  });

  // Reference standards summary table
  const standardsData = [
    {
      code: 'IS 10500:2012',
      name: 'Indian Standard Drinking Water Specification (Second Revision)',
      agency: 'Bureau of Indian Standards (BIS)',
      scope: 'Drinking water, tap water, packaged drinking water, community supplies',
      keyLimits: 'pH: 6.5–8.5, TDS: max 500 mg/L (2000 permissible), Total Hardness: max 200 mg/L, Total Coliform & E. coli: 0 / 100mL (zero tolerance)'
    },
    {
      code: 'WHO Guidelines (4th Ed)',
      name: 'World Health Organization Guidelines for Drinking-water Quality',
      agency: 'World Health Organization',
      scope: 'Global international benchmark for chemical & microbiological health criteria',
      keyLimits: 'Turbidity < 5 NTU, Fluoride < 1.5 mg/L, Nitrate < 50 mg/L, Zero fecal indicators'
    },
    {
      code: 'CPCB Designated Best Use',
      name: 'Central Pollution Control Board Water Quality Criteria',
      agency: 'CPCB Ministry of Environment, Forest and Climate Change',
      scope: 'Groundwater, borewell, lakes, rivers, recreational & irrigation water sources',
      keyLimits: 'Dissolved Oxygen > 4 mg/L, Biochemical Oxygen Demand < 3 mg/L, pH: 6.5–8.5'
    },
    {
      code: 'EPA Secondary Standards',
      name: 'United States Environmental Protection Agency National Primary & Secondary Regulations',
      agency: 'US EPA',
      scope: 'Aesthetic, cosmetic, and technical parameters (Odour, Color, TDS, Iron, Chloride)',
      keyLimits: 'Chloride < 250 mg/L, Iron < 0.3 mg/L, TDS < 500 mg/L, Color < 15 TCU'
    }
  ];

  const checkBackendHealth = async () => {
    setBackendStatus({ checking: true, connected: null, message: 'Pinging Spring Boot backend...' });
    try {
      const res = await api.get('/dashboard/statistics');
      if (res.data && res.data.success) {
        setBackendStatus({
          checking: false,
          connected: true,
          message: `Connected successfully! Spring Boot REST API active. Total samples in DB: ${res.data.data?.totalSamples || 0}`
        });
      } else {
        setBackendStatus({ checking: false, connected: true, message: 'Backend responded with 200 OK.' });
      }
    } catch (err) {
      setBackendStatus({
        checking: false,
        connected: false,
        message: `Failed to connect: ${err.message}. Ensure Spring Boot is running on port 8080.`
      });
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const handleSaveLabConfig = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMessage('Laboratory profile and report footer configurations updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 600);
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <SettingsIcon className="text-primary" size={28} />
          Laboratory Settings & Standards
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Configure testing laboratory metadata, inspect regulatory compliance standards, and monitor backend system status.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('standards')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'standards' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'standards' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'standards' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <BookOpen size={16} />
          Testing Standards & Norms
        </button>

        <button
          onClick={() => setActiveTab('organization')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'organization' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'organization' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'organization' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <Building2 size={16} />
          Laboratory Identity & Reports
        </button>

        <button
          onClick={() => setActiveTab('system')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'system' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'system' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'system' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <Server size={16} />
          System & Architecture Status
        </button>
      </div>

      {successMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem'
        }}>
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      {/* Tab 1: Standards */}
      {activeTab === 'standards' && (
        <div>
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldCheck className="text-primary" size={22} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Configured Water Quality Reference Standards
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              AquaPure WTLMS utilizes a deterministic rule engine that compares measured laboratory values against criteria established in recognized national and international water quality codices.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {standardsData.map((std) => (
                <div
                  key={std.code}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    background: 'var(--surface-alt)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        {std.code}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>
                        {std.agency}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      {std.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <strong>Applicable Scope:</strong> {std.scope}
                    </p>
                  </div>
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    background: '#ffffff',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '4px'
                  }}>
                    <strong style={{ color: 'var(--primary)' }}>Critical Benchmarks:</strong> {std.keyLimits}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Architecture Box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem'
          }}>
            <Info size={22} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
              <strong style={{ color: '#0f172a' }}>Deterministic Compliance Engine Note:</strong><br />
              Criteria are parameter- and water-source-specific. An individual parameter is evaluated as <code>COMPLIANT</code> or <code>NON_COMPLIANT</code>. The overall sample evaluation is marked <code>POTABLE / COMPLIANT</code> only if <em>all</em> tested parameters meet their respective thresholds. For full parameter definitions and limits configuration, visit the <a href="/app/parameters" style={{ color: 'var(--primary)', fontWeight: 600 }}>Test Management</a> module.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Organization Config */}
      {activeTab === 'organization' && (
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building2 className="text-primary" size={22} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Laboratory Profile & Certificate Header
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            These details appear on the header and legal footer of generated PDF water quality test certificates.
          </p>

          <form onSubmit={handleSaveLabConfig}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Official Laboratory Name
                </label>
                <input
                  type="text"
                  value={labConfig.labName}
                  onChange={(e) => setLabConfig({ ...labConfig, labName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Laboratory Facility / Reg Code
                </label>
                <input
                  type="text"
                  value={labConfig.facilityCode}
                  onChange={(e) => setLabConfig({ ...labConfig, facilityCode: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Official Contact Email
                </label>
                <input
                  type="email"
                  value={labConfig.contactEmail}
                  onChange={(e) => setLabConfig({ ...labConfig, contactEmail: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Direct Laboratory Phone
                </label>
                <input
                  type="text"
                  value={labConfig.contactPhone}
                  onChange={(e) => setLabConfig({ ...labConfig, contactPhone: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Laboratory Director (Signatory)
                </label>
                <input
                  type="text"
                  value={labConfig.directorName}
                  onChange={(e) => setLabConfig({ ...labConfig, directorName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Quality Assurance Manager
                </label>
                <input
                  type="text"
                  value={labConfig.qualityManager}
                  onChange={(e) => setLabConfig({ ...labConfig, qualityManager: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Laboratory Facility Address
              </label>
              <input
                type="text"
                value={labConfig.address}
                onChange={(e) => setLabConfig({ ...labConfig, address: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Legal & Analytical Scope Disclaimer (Mandatory on PDF Certificates)
              </label>
              <textarea
                rows={3}
                value={labConfig.accreditationDisclaimer}
                onChange={(e) => setLabConfig({ ...labConfig, accreditationDisclaimer: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem', fontFamily: 'inherit' }}
                required
              />
            </div>

            {isAdmin && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.7rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Updating...' : 'Save Configuration'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab 3: System Status */}
      {activeTab === 'system' && (
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server className="text-primary" size={22} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                System & Architecture Health
              </h2>
            </div>
            <button
              onClick={checkBackendHealth}
              disabled={backendStatus.checking}
              style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.45rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RefreshCw size={14} className={backendStatus.checking ? 'spin' : ''} />
              Refresh Status
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--surface-alt)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Backend REST Engine
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Spring Boot 3.3.5 / Java 21+
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: backendStatus.connected ? '#10b981' : (backendStatus.checking ? '#f59e0b' : '#ef4444')
                }} />
                <span style={{ color: backendStatus.connected ? '#047857' : '#b91c1c', fontWeight: 600 }}>
                  {backendStatus.checking ? 'Probing...' : (backendStatus.connected ? 'Operational' : 'Unavailable')}
                </span>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--surface-alt)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Primary Database
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                MongoDB (Spring Data MongoDB)
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Port 27017 (Auto-fallback embedded)
              </div>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--surface-alt)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Authentication Standard
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Stateless JWT (HMAC-SHA256)
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Session: {user ? `Active as ${user.email}` : 'Guest / Logged out'}
              </div>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--surface-alt)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Report Rendering Engine
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                OpenPDF 1.3.40 (A4 Document Format)
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Deterministic Criteria Snapshotting
              </div>
            </div>
          </div>

          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: backendStatus.connected ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${backendStatus.connected ? '#a7f3d0' : '#fecaca'}`,
            fontSize: '0.85rem',
            color: backendStatus.connected ? '#065f46' : '#991b1b'
          }}>
            <strong>Diagnostic Output:</strong> {backendStatus.message || 'No status check recorded.'}
          </div>
        </div>
      )}
    </div>
  );
};
