import { useState, useEffect, useCallback } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import type { AccessGrant } from '../types';
import { requestAccess } from '../services/relay';

type Tab = 'diagnoses' | 'prescriptions' | 'lab' | 'vitals';

const tabLabels: { key: Tab; label: string }[] = [
  { key: 'diagnoses', label: 'Diagnoses' },
  { key: 'prescriptions', label: 'Prescriptions' },
  { key: 'lab', label: 'Lab Results' },
  { key: 'vitals', label: 'Vitals' },
];

const statusBadge: Record<string, string> = {
  active: 'badge badge-green',
  resolved: 'badge badge-blue',
  managed: 'badge badge-yellow',
  ongoing: 'badge badge-red',
  normal: 'badge badge-green',
  abnormal: 'badge badge-yellow',
  critical: 'badge badge-red',
};

export default function PatientAccess() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [grant, setGrant] = useState<AccessGrant | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('diagnoses');

  const endSession = useCallback(() => {
    setGrant(null);
    setRemaining(0);
    setToken('');
    setError('');
  }, []);

  useEffect(() => {
    if (!grant) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [grant, endSession]);

  const handleRequest = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    const data = await requestAccess(token.trim());
    setLoading(false);
    if (!data) {
      setError('Invalid or expired consent token. Please check and try again.');
      return;
    }
    setGrant(data);
    setRemaining(data.expiresIn);
    setActiveTab('diagnoses');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const fillPercent = grant ? (remaining / grant.expiresIn) * 100 : 0;

  if (!grant) {
    return (
      <>
        <div className="content-header">
          <h1>Request Temporary Access</h1>
          <p>Enter a patient consent token to access their medical records</p>
        </div>

        <div className="card center-card" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div style={{ marginBottom: 24 }}>
            <Lock size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
              Patient Consent Token
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '.88rem' }}>
              Ask the patient to share their consent token from the Chipatala app
            </p>
          </div>

          <div className="code-input-wrap">
            <input
              className="code-input"
              type="text"
              placeholder="PAT-7291-CONSENT-XK"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRequest()}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--color-danger)', fontSize: '.88rem', marginTop: 16 }}>
              {error}
            </p>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: 24 }}
            onClick={handleRequest}
            disabled={loading || !token.trim()}
          >
            {loading ? 'Requesting...' : 'Request Access'}
          </button>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '.82rem', marginTop: 16 }}>
            Session duration: 30 minutes &bull; Read-only access to patient records
          </p>
        </div>
      </>
    );
  }

  const patient = grant.patient;
  const records = grant.records;

  const diagnoses = records.filter((r) => r.type === 'diagnosis' || r.type === 'consultation');
  const prescriptions = records.filter((r) => r.type === 'prescription');
  const labResults = patient.labResults;
  const vitals = patient.vitals;

  return (
    <>
      <div className="content-header">
        <h1>Patient Records</h1>
        <p>Temporary access granted via consent token</p>
      </div>

      <div className="session-timer">
        <span className="timer-value">{formatTime(remaining)}</span>
        <span style={{ fontSize: '.85rem', color: 'var(--color-text-secondary)' }}>remaining</span>
        <div className="timer-bar">
          <div className="timer-fill" style={{ width: `${fillPercent}%` }} />
        </div>
        <button className="btn btn-danger btn-sm" onClick={endSession}>
          End Session
        </button>
      </div>

      <div className="patient-info">
        <div className="patient-avatar">{patient.initials}</div>
        <div className="patient-details">
          <h3>{patient.name}</h3>
          <p>
            {patient.gender}, {patient.age} years &bull; Blood Type: {patient.bloodType} &bull;
            ID: {patient.nationalId}
          </p>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {patient.allergies.map((a) => (
              <span className="badge badge-red" key={a}>{a}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          {tabLabels.map(({ key, label }) => (
            <button
              key={key}
              className={`tab-btn${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={`tab-panel${activeTab === 'diagnoses' ? ' active' : ''}`}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Diagnosis</th>
                  <th>Hospital</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {diagnoses.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{r.diagnosis}</td>
                    <td>{r.hospital}</td>
                    <td>{r.doctor}</td>
                    <td>
                      <span className={statusBadge[r.status] || 'badge badge-gray'}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {diagnoses.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No diagnoses found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`tab-panel${activeTab === 'prescriptions' ? ' active' : ''}`}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Prescribed By</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((r) =>
                  r.prescriptions.map((rx, idx) => (
                    <tr key={`${r.id}-${idx}`}>
                      <td>{r.date}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{rx.medication}</td>
                      <td>{rx.dosage}</td>
                      <td>{rx.frequency}</td>
                      <td>{r.doctor}</td>
                    </tr>
                  ))
                )}
                {prescriptions.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No prescriptions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`tab-panel${activeTab === 'lab' ? ' active' : ''}`}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Test</th>
                  <th>Result</th>
                  <th>Reference Range</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {labResults.map((lr, i) => (
                  <tr key={i}>
                    <td>{lr.date}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{lr.test}</td>
                    <td>{lr.result}</td>
                    <td>{lr.referenceRange}</td>
                    <td>
                      <span className={statusBadge[lr.status] || 'badge badge-gray'}>
                        {lr.status.charAt(0).toUpperCase() + lr.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {labResults.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No lab results found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`tab-panel${activeTab === 'vitals' ? ' active' : ''}`}>
          <div className="vitals-grid" style={{ marginBottom: 20 }}>
            {vitals.map((v, i) => (
              <div className="vital-card" key={i}>
                <div className="vital-icon">{v.icon}</div>
                <div className="vital-value">{v.value}</div>
                <div className="vital-label">{v.label}</div>
              </div>
            ))}
          </div>

          {patient.allergies.length > 0 && (
            <div className="allergy-alert">
              <AlertTriangle size={20} color="var(--color-danger)" />
              <div>
                <strong style={{ color: 'var(--color-danger)' }}>Allergy Alert</strong>
                <p style={{ fontSize: '.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Patient is allergic to: {patient.allergies.join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
