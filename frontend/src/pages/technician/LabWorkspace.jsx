import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ResultStatusBadge } from '../../components/common/ComplianceBadge';
import { Loader } from '../../components/common/Loader';
import {
  FlaskConical,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Droplet,
  Layers,
  ArrowRight
} from 'lucide-react';

export const LabWorkspace = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedSampleId = searchParams.get('sampleId');

  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [testDefinitions, setTestDefinitions] = useState([]);
  const [existingResults, setExistingResults] = useState([]);
  const [resultsForm, setResultsForm] = useState({});
  const [generalRemarks, setGeneralRemarks] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch available samples and test definitions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [samplesRes, testsRes] = await Promise.all([
          api.get('/samples'),
          api.get('/tests')
        ]);

        const sampleList = samplesRes.data.data || samplesRes.data;
        const testList = testsRes.data.data || testsRes.data;

        setSamples(Array.isArray(sampleList) ? sampleList : []);
        setTestDefinitions(Array.isArray(testList) ? testList : []);

        // Preselect sample if provided in query param or pick first active
        if (preselectedSampleId) {
          const match = sampleList.find(s => s.sampleId === preselectedSampleId || s.id === preselectedSampleId);
          if (match) setSelectedSample(match);
        } else if (sampleList.length > 0) {
          const pending = sampleList.find(s =>
            s.status === 'TESTING_IN_PROGRESS' || s.status === 'SAMPLE_RECEIVED' || s.status === 'REGISTERED'
          );
          setSelectedSample(pending || sampleList[0]);
        }
      } catch (err) {
        console.error('Error initializing workspace:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [preselectedSampleId]);

  // 2. Fetch existing results when selectedSample changes
  useEffect(() => {
    if (!selectedSample) return;

    const fetchResults = async () => {
      try {
        const res = await api.get(`/results/sample/${selectedSample.sampleId}`);
        const list = res.data.data || res.data;
        const currentResults = Array.isArray(list) ? list : [];
        setExistingResults(currentResults);

        // Populate results form with existing or blank requested tests
        const formState = {};
        const requested = selectedSample.requestedTests || [];

        // Combine requested tests and already recorded results
        const allParamsToDisplay = Array.from(new Set([
          ...requested,
          ...currentResults.map(r => r.parameterName)
        ]));

        allParamsToDisplay.forEach(paramName => {
          const existing = currentResults.find(r => r.parameterName === paramName);
          const def = testDefinitions.find(d => d.parameterName === paramName);

          formState[paramName] = {
            parameterName,
            measuredValue: existing?.measuredValue || '',
            category: existing?.category || def?.category || 'Chemical',
            unit: existing?.unit || def?.unit || '',
            testMethod: existing?.testMethod || def?.testMethod || '',
            referenceStandard: existing?.referenceStandard || def?.referenceStandard || 'IS 10500:2012',
            laboratoryRemarks: existing?.laboratoryRemarks || '',
            complianceStatus: existing?.complianceStatus || 'NOT_TESTED'
          };
        });

        setResultsForm(formState);
      } catch (err) {
        console.error('Error fetching sample results:', err);
      }
    };

    fetchResults();
  }, [selectedSample, testDefinitions]);

  const handleInputChange = (paramName, field, value) => {
    setResultsForm(prev => {
      const updatedItem = { ...prev[paramName], [field]: value };

      // Optional live client feedback for compliance status
      if (field === 'measuredValue') {
        const def = testDefinitions.find(d => d.parameterName === paramName);
        if (def && value) {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            let pass = true;
            if (def.minLimit !== null && num < def.minLimit) pass = false;
            if (def.maxLimit !== null && num > def.maxLimit) pass = false;
            updatedItem.complianceStatus = pass ? 'COMPLIANT' : 'NON_COMPLIANT';
          }
        }
      }

      return {
        ...prev,
        [paramName]: updatedItem
      };
    });
  };

  const handleSave = async (submitForReview = false) => {
    if (!selectedSample) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const resultsArray = Object.values(resultsForm)
      .filter(item => item.measuredValue && item.measuredValue.trim() !== '')
      .map(item => ({
        parameterName: item.parameterName,
        category: item.category,
        measuredValue: item.measuredValue,
        unit: item.unit,
        testMethod: item.testMethod,
        referenceStandard: item.referenceStandard,
        laboratoryRemarks: item.laboratoryRemarks
      }));

    if (resultsArray.length === 0) {
      setErrorMsg('Please enter at least one test measurement before saving.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        sampleId: selectedSample.sampleId,
        results: resultsArray,
        submitForReview,
        generalRemarks
      };

      const res = await api.post('/results/batch', payload);
      const saved = res.data.data || res.data;

      // Automatically generate draft report if submitting for review
      if (submitForReview) {
        await api.post(`/reports/generate/${selectedSample.sampleId}`);
        setSuccessMsg(`Test results submitted for QA approval! Draft report created for ${selectedSample.sampleId}.`);
      } else {
        setSuccessMsg(`Saved ${resultsArray.length} test measurements as draft.`);
      }

      // Refresh sample details
      const sampleRes = await api.get(`/samples/${selectedSample.id}`);
      setSelectedSample(sampleRes.data.data || sampleRes.data);
    } catch (err) {
      console.error('Save error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save test results.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Laboratory Staff Testing Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Record analytical water assay measurements, evaluate deterministic thresholds, and submit draft findings for QA review.
          </p>
        </div>
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
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
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
          fontSize: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle size={18} color="#ef4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Sample Assignment Queue */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Assigned Sample Queue ({samples.length})
            </h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Select a sample to record measurements
            </span>
          </div>

          <div style={{ maxHeight: '680px', overflowY: 'auto' }}>
            {samples.map(s => {
              const isSelected = selectedSample?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSample(s)}
                  style={{
                    padding: '0.85rem 1.25rem',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                    borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)' }}>
                      {s.sampleId}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: s.priority === 'High' ? '#dc2626' : '#64748b' }}>
                      {s.priority || 'Normal'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.customerName}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.waterSource}</span>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Result Entry Matrix */}
        {selectedSample ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            padding: '1.75rem'
          }}>
            {/* Active Sample Summary Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {selectedSample.sampleId}
                  </h2>
                  <StatusBadge status={selectedSample.status} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Customer: <strong>{selectedSample.customerName}</strong> • Source: <strong>{selectedSample.waterSource}</strong> • Intake: <strong>{selectedSample.collectionLocation}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>Standard Reference</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>IS 10500:2012 / WHO</span>
              </div>
            </div>

            {/* Assay Parameter Entry Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-alt)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Parameter</th>
                    <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Permissible Limit</th>
                    <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600, width: '180px' }}>Measured Result *</th>
                    <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Unit</th>
                    <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Live Status</th>
                    <th style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Technician Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(resultsForm).length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        No requested test parameters found for this sample.
                      </td>
                    </tr>
                  ) : (
                    Object.values(resultsForm).map(item => {
                      const def = testDefinitions.find(d => d.parameterName === item.parameterName);
                      let limitDisplay = '-';
                      if (def) {
                        if (def.ruleType === 'MICROBIOLOGICAL') limitDisplay = '0 / Absent in 100ml';
                        else if (def.ruleType === 'QUALITATIVE') limitDisplay = def.permittedQualitative || 'Agreeable';
                        else if (def.minLimit !== null && def.maxLimit !== null) limitDisplay = `${def.minLimit} - ${def.maxLimit}`;
                        else if (def.maxLimit !== null) limitDisplay = `Max ${def.maxLimit}`;
                      }

                      return (
                        <tr key={item.parameterName} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {item.parameterName}
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 400 }}>
                              {item.testMethod || 'Standard'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {limitDisplay}
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem' }}>
                            <input
                              type="text"
                              value={item.measuredValue}
                              onChange={(e) => handleInputChange(item.parameterName, 'measuredValue', e.target.value)}
                              placeholder="Enter value"
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {item.unit || '-'}
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem' }}>
                            <ResultStatusBadge status={item.complianceStatus} />
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem' }}>
                            <input
                              type="text"
                              value={item.laboratoryRemarks}
                              onChange={(e) => handleInputChange(item.parameterName, 'laboratoryRemarks', e.target.value)}
                              placeholder="e.g. Verified by duplicate"
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.8rem'
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* General Observations */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Overall Assay Observations & Laboratory Remarks
              </label>
              <textarea
                rows={2}
                value={generalRemarks}
                onChange={(e) => setGeneralRemarks(e.target.value)}
                placeholder="e.g. Temperature stabilized at 25°C. Blank calibrated against ASTM Type I reagent water."
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
              />
            </div>

            {/* Save & Submit Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size={16} /> Save Draft Results
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.5rem',
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                }}
              >
                <Send size={16} /> Submit for QA Approval
              </button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center', color: 'var(--text-light)', border: '1px solid var(--border)' }}>
            Select an assigned sample from the left queue to open result entry matrix.
          </div>
        )}
      </div>
    </div>
  );
};
