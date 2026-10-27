import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Droplet,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FlaskConical,
  User,
  Phone,
  Mail,
  FileText,
  Clock
} from 'lucide-react';

const WATER_SOURCES = [
  'Drinking water',
  'Borewell water',
  'Groundwater',
  'River water',
  'Lake water',
  'Pond water',
  'Industrial wastewater',
  'Treated water'
];

const SAMPLE_CONDITIONS = [
  'Good (Cold chain preserved at 4°C)',
  'Ambient Temperature (Sealed container)',
  'Partially Preserved',
  'Leaking / Questionable Seal',
  'Compromised (Turbid sediment present)'
];

const DEFAULT_TEST_PARAMETERS = [
  'Colour',
  'Odour',
  'Turbidity',
  'TDS (Total Dissolved Solids)',
  'pH',
  'Total Hardness (as CaCO3)',
  'Chloride (as Cl)',
  'Fluoride (as F)',
  'Nitrate (as NO3)',
  'Iron (as Fe)',
  'Total Coliform',
  'E. coli'
];

export const SampleRegistration = () => {
  const { user, isCustomer, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    customerId: user?.id || '',
    collectionDateTime: new Date().toISOString().slice(0, 16),
    collectionLocation: '',
    waterSource: 'Drinking water',
    sampleType: 'Potable Water',
    sampleDescription: '',
    requestedTests: ['pH', 'Turbidity', 'TDS (Total Dissolved Solids)', 'Total Coliform'],
    sampleReceivedDate: new Date().toISOString().slice(0, 16),
    sampleReceivedBy: isStaff ? user?.fullName : 'Lab Intake Desk',
    sampleCondition: 'Good (Cold chain preserved at 4°C)',
    priority: 'Normal',
    additionalRemarks: ''
  });

  const [availableParameters, setAvailableParameters] = useState(DEFAULT_TEST_PARAMETERS);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Attempt to fetch dynamically configured parameters from backend
    api.get('/tests')
      .then(res => {
        const list = res.data.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          setAvailableParameters(list.map(p => p.parameterName));
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_TEST_PARAMETERS
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestToggle = (param) => {
    setFormData(prev => {
      const exists = prev.requestedTests.includes(param);
      if (exists) {
        return { ...prev, requestedTests: prev.requestedTests.filter(t => t !== param) };
      } else {
        return { ...prev, requestedTests: [...prev.requestedTests, param] };
      }
    });
  };

  const selectAllTests = () => {
    setFormData(prev => ({ ...prev, requestedTests: [...availableParameters] }));
  };

  const clearAllTests = () => {
    setFormData(prev => ({ ...prev, requestedTests: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.requestedTests.length === 0) {
      setErrorMsg('Please select at least one water quality test parameter.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/samples', formData);
      const created = res.data.data || res.data;
      setSuccessMsg(`Sample successfully registered! Assigned tracking ID: ${created.sampleId}`);
      setTimeout(() => {
        navigate('/app/samples/tracking');
      }, 1500);
    } catch (err) {
      console.error('Error registering sample:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to register sample. Please verify all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          {isCustomer ? 'Submit Water Testing Request' : 'Laboratory Sample Intake Registration'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          {isCustomer
            ? 'Complete the form below to register a water sample for certified laboratory analysis.'
            : 'Formally record incoming sample metadata, chain-of-custody, and requested assay profiles.'}
        </p>
      </div>

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-sm)',
          color: '#065f46',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <CheckCircle2 size={20} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-sm)',
          color: '#991b1b',
          fontSize: '0.9rem',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle size={20} color="#ef4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Customer & Submitter Information */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <User size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Customer & Submitter Details
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Customer Name / Entity *
              </label>
              <input
                type="text"
                required
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="e.g. GreenValley Agriculture Farms"
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Contact Email Address
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="client@domain.com"
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Contact Phone Number
              </label>
              <input
                type="text"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="+1 555-0104"
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Water Sample Metadata & Source */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <Droplet size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Water Source & Sampling Logistics
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Water Source *
              </label>
              <select
                name="waterSource"
                value={formData.waterSource}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
              >
                {WATER_SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Sample Type / Classification
              </label>
              <input
                type="text"
                name="sampleType"
                value={formData.sampleType}
                onChange={handleChange}
                placeholder="e.g. Potable Water, Raw Groundwater, Industrial"
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
              >
                <option value="Normal">Normal (Standard 48h Turnaround)</option>
                <option value="High">High (Express 24h Turnaround)</option>
                <option value="Urgent">Urgent (Emergency Priority Assay)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Collection Location / GPS Point *
              </label>
              <input
                type="text"
                required
                name="collectionLocation"
                value={formData.collectionLocation}
                onChange={handleChange}
                placeholder="e.g. Main Plant Intake Valve B, Well No. 4"
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Collection Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                name="collectionDateTime"
                value={formData.collectionDateTime}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
              />
            </div>

            {!isCustomer && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Sample Received Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="sampleReceivedDate"
                  value={formData.sampleReceivedDate}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isCustomer ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Sample Condition on Receipt
              </label>
              <select
                name="sampleCondition"
                value={formData.sampleCondition}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
              >
                {SAMPLE_CONDITIONS.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {!isCustomer && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Received By (Staff Member)
                </label>
                <input
                  type="text"
                  name="sampleReceivedBy"
                  value={formData.sampleReceivedBy}
                  onChange={handleChange}
                  placeholder="Staff Chemist Name"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Requested Testing Profile */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FlaskConical size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Requested Testing Parameters ({formData.requestedTests.length} Selected)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={selectAllTests}
                style={{ background: 'none', border: '1px solid var(--border)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllTests}
                style={{ background: 'none', border: '1px solid var(--border)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}
              >
                Clear
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.6rem', marginBottom: '1.25rem' }}>
            {availableParameters.map(param => {
              const isChecked = formData.requestedTests.includes(param);
              return (
                <label
                  key={param}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: isChecked ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: isChecked ? 600 : 400,
                    color: isChecked ? 'var(--primary-dark)' : 'var(--text-main)',
                    transition: 'all 0.15s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleTestToggle(param)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{param}</span>
                </label>
              );
            })}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Additional Sampling Remarks / Chain-of-Custody Notes
            </label>
            <textarea
              name="additionalRemarks"
              rows={3}
              value={formData.additionalRemarks}
              onChange={handleChange}
              placeholder="e.g. Sample collected after 10-minute purge of well line. Specific test requested for potable compliance check."
              style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Submit Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/app/samples/tracking')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.75rem',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Submitting Registration...' : isCustomer ? 'Submit Testing Request' : 'Complete Intake Registration'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
};
