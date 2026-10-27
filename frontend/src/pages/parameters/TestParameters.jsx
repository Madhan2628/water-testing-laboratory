import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import {
  Sliders,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  Layers,
  BookOpen
} from 'lucide-react';

export const TestParameters = () => {
  const { isAdmin } = useAuth();
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [formData, setFormData] = useState({
    parameterName: '',
    category: 'Chemical',
    unit: 'mg/L',
    minLimit: '',
    maxLimit: '',
    permittedQualitative: '',
    ruleType: 'RANGE',
    waterSource: 'All',
    referenceStandard: 'IS 10500:2012',
    testMethod: 'IS 3025',
    active: true
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchParameters = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tests');
      const data = res.data.data || res.data;
      setParameters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching parameters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  const handleOpenAdd = () => {
    setEditingParam(null);
    setFormData({
      parameterName: '',
      category: 'Chemical',
      unit: 'mg/L',
      minLimit: '',
      maxLimit: '',
      permittedQualitative: '',
      ruleType: 'RANGE',
      waterSource: 'All',
      referenceStandard: 'IS 10500:2012',
      testMethod: 'IS 3025',
      active: true
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingParam(p);
    setFormData({
      parameterName: p.parameterName || '',
      category: p.category || 'Chemical',
      unit: p.unit || '',
      minLimit: p.minLimit !== null && p.minLimit !== undefined ? p.minLimit : '',
      maxLimit: p.maxLimit !== null && p.maxLimit !== undefined ? p.maxLimit : '',
      permittedQualitative: p.permittedQualitative || '',
      ruleType: p.ruleType || 'RANGE',
      waterSource: p.waterSource || 'All',
      referenceStandard: p.referenceStandard || 'IS 10500:2012',
      testMethod: p.testMethod || '',
      active: p.active !== false
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      ...formData,
      minLimit: formData.minLimit !== '' ? parseFloat(formData.minLimit) : null,
      maxLimit: formData.maxLimit !== '' ? parseFloat(formData.maxLimit) : null
    };

    try {
      if (editingParam) {
        await api.put(`/tests/${editingParam.id}`, payload);
        setSuccessMsg(`Parameter ${formData.parameterName} updated successfully.`);
      } else {
        await api.post('/tests', payload);
        setSuccessMsg(`Parameter ${formData.parameterName} created successfully.`);
      }
      setModalOpen(false);
      fetchParameters();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save parameter definition.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete parameter ${name}?`)) return;
    try {
      await api.delete(`/tests/${id}`);
      setParameters(prev => prev.filter(p => p.id !== id));
      setSuccessMsg(`Parameter ${name} deleted.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete parameter.');
    }
  };

  const filtered = parameters.filter(p => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = p.parameterName?.toLowerCase().includes(q);
      const matchStd = p.referenceStandard?.toLowerCase().includes(q);
      const matchMeth = p.testMethod?.toLowerCase().includes(q);
      if (!matchName && !matchStd && !matchMeth) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Water Quality Parameter Limits & Standards
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Configure permissible baseline limits, applicable standards (IS 10500, WHO, EPA), and testing methods.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            style={{
              padding: '0.6rem 1rem',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Plus size={16} /> Add Test Parameter
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {successMsg}
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
            placeholder="Search parameter, test standard, or method..."
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

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="All">All Categories</option>
            <option value="Physical">Physical Parameters</option>
            <option value="Chemical">Chemical Parameters</option>
            <option value="Microbiological">Microbiological Parameters</option>
          </select>
        </div>
      </div>

      {/* Main Parameters Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <Loader message="Loading test parameter configurations..." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-alt)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Parameter</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Reference Limit Criteria</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Unit</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Standard</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Test Method</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Source Scope</th>
                  {isAdmin && <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      No parameter specifications found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => {
                    let limitText = 'N/A';
                    if (p.ruleType === 'MICROBIOLOGICAL') {
                      limitText = '0 (Absent in 100ml)';
                    } else if (p.ruleType === 'QUALITATIVE') {
                      limitText = p.permittedQualitative || 'Agreeable';
                    } else if (p.minLimit !== null && p.maxLimit !== null) {
                      limitText = `${p.minLimit} - ${p.maxLimit}`;
                    } else if (p.maxLimit !== null) {
                      limitText = `Max ${p.maxLimit}`;
                    } else if (p.minLimit !== null) {
                      limitText = `Min ${p.minLimit}`;
                    }

                    return (
                      <tr
                        key={p.id}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {p.parameterName}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: p.category === 'Microbiological' ? '#fee2e2' : p.category === 'Chemical' ? '#e0f2fe' : '#fef3c7',
                            color: p.category === 'Microbiological' ? '#991b1b' : p.category === 'Chemical' ? '#0369a1' : '#92400e'
                          }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                          {limitText}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                          {p.unit || '-'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {p.referenceStandard || 'IS 10500:2012'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                          {p.testMethod || 'Standard Assay'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {p.waterSource || 'All'}
                        </td>
                        {isAdmin && (
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                style={{ background: 'none', border: '1px solid var(--border)', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}
                                title="Edit Parameter"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id, p.parameterName)}
                                style={{ background: 'none', border: '1px solid var(--danger-border)', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--danger)' }}
                                title="Delete Parameter"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Parameter Modal */}
      {modalOpen && (
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {editingParam ? `Edit Limit: ${editingParam.parameterName}` : 'Add New Water Testing Parameter'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Define deterministic reference limit criteria and test methods.
            </p>

            {errorMsg && (
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Parameter Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parameterName}
                    onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                    placeholder="e.g. Total Dissolved Solids"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="Physical">Physical</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Microbiological">Microbiological</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Unit of Measurement
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="mg/L, NTU, pH units, Hazen"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Rule Type *
                  </label>
                  <select
                    value={formData.ruleType}
                    onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="RANGE">RANGE (Min and Max range)</option>
                    <option value="MAX_ONLY">MAX_ONLY (Upper permissible ceiling)</option>
                    <option value="MIN_ONLY">MIN_ONLY (Lower baseline floor)</option>
                    <option value="QUALITATIVE">QUALITATIVE (Agreeable / Unobjectionable)</option>
                    <option value="MICROBIOLOGICAL">MICROBIOLOGICAL (Zero-tolerance absent)</option>
                  </select>
                </div>
              </div>

              {formData.ruleType === 'QUALITATIVE' ? (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Permitted Qualitative String
                  </label>
                  <input
                    type="text"
                    value={formData.permittedQualitative}
                    onChange={(e) => setFormData({ ...formData, permittedQualitative: e.target.value })}
                    placeholder="Agreeable / Unobjectionable / Clear"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  />
                </div>
              ) : formData.ruleType !== 'MICROBIOLOGICAL' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Reference Minimum Limit
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.minLimit}
                      onChange={(e) => setFormData({ ...formData, minLimit: e.target.value })}
                      placeholder="e.g. 6.5"
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Reference Maximum Limit
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.maxLimit}
                      onChange={(e) => setFormData({ ...formData, maxLimit: e.target.value })}
                      placeholder="e.g. 8.5"
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Reference Standard
                  </label>
                  <input
                    type="text"
                    value={formData.referenceStandard}
                    onChange={(e) => setFormData({ ...formData, referenceStandard: e.target.value })}
                    placeholder="IS 10500:2012 / WHO / EPA"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Assay Test Method
                  </label>
                  <input
                    type="text"
                    value={formData.testMethod}
                    onChange={(e) => setFormData({ ...formData, testMethod: e.target.value })}
                    placeholder="e.g. IS 3025 (Part 11)"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '0.6rem 1rem', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '0.6rem 1.25rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save Parameter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
