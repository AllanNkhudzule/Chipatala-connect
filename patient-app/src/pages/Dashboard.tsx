import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientProfile, recentActivity } from '../data/mockData';
import { grantAccess } from '../services/relay';

const statusBadge: Record<string, string> = {
  managed: 'badge badge-green',
  ongoing: 'badge badge-yellow',
  resolved: 'badge badge-blue',
};

const activityIconBg: Record<string, string> = {
  green: 'var(--color-primary-bg)',
  blue: 'var(--color-info-bg)',
  yellow: 'var(--color-warning-bg)',
  red: 'var(--color-danger-bg)',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantLoading, setGrantLoading] = useState(false);
  const [consentToken, setConsentToken] = useState<string | null>(null);

  async function handleGrantAccess() {
    setShowGrantModal(true);
    setGrantLoading(true);
    setConsentToken(null);
    const token = await grantAccess(30);
    setGrantLoading(false);
    setConsentToken(token);
  }

  function closeModal() {
    setShowGrantModal(false);
    setConsentToken(null);
  }

  const { name, nationalId, vitals, conditions, medications } = patientProfile;
  const firstName = name.split(' ')[0];

  return (
    <>
      {/* Welcome card */}
      <div className="welcome-card">
        <div>
          <h2>Welcome back, {firstName}</h2>
          <p>National ID: {nationalId}</p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-white" onClick={() => navigate('/retrieve')}>
            Retrieve New Record
          </button>
          <button className="btn btn-ghost" onClick={handleGrantAccess}>
            Grant Access
          </button>
        </div>
      </div>

      {/* Vitals */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2>Current Health Status</h2>
          <button className="card-action">View Details</button>
        </div>
        <div className="vitals-grid">
          {vitals.map((v) => (
            <div className="vital-card" key={v.label}>
              <div className="vital-icon">{v.icon}</div>
              <div className="vital-value">{v.value}</div>
              <div className="vital-label">{v.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conditions + Medications */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Active Conditions */}
        <div className="card">
          <div className="card-header">
            <h2>Active Conditions</h2>
          </div>
          <ul className="activity-list">
            {conditions.map((c) => (
              <li className="activity-item" key={c.name}>
                <span
                  className="activity-icon"
                  style={{ background: 'var(--color-primary-bg)' }}
                >
                  {c.icon}
                </span>
                <div className="activity-body">
                  <strong>{c.name}</strong>
                  <p>
                    {c.hospital} &middot; {c.date}
                  </p>
                </div>
                <span className={statusBadge[c.status] ?? 'badge badge-gray'}>
                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Current Medications */}
        <div className="card">
          <div className="card-header">
            <h2>Current Medications</h2>
          </div>
          <ul className="activity-list">
            {medications.map((m) => (
              <li className="activity-item" key={m.name}>
                <span
                  className="activity-icon"
                  style={{ background: 'var(--color-info-bg)', fontSize: '1rem' }}
                >
                  💊
                </span>
                <div className="activity-body">
                  <strong>{m.name}</strong>
                  <p>
                    {m.dosage} &middot; {m.prescribedBy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Activity</h2>
          <button className="card-action">View All</button>
        </div>
        <ul className="activity-list">
          {recentActivity.map((a, i) => (
            <li className="activity-item" key={i}>
              <span
                className="activity-icon"
                style={{ background: activityIconBg[a.iconColor] }}
              >
                {a.icon}
              </span>
              <div className="activity-body">
                <strong>{a.title}</strong>
                <p>{a.description}</p>
              </div>
              <span className="activity-time">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Grant Access Modal */}
      {showGrantModal && (
        <div className="grant-modal-overlay" onClick={closeModal}>
          <div
            className={`grant-modal${consentToken ? ' success-animation' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {grantLoading ? (
              <>
                <div className="loading-spinner" style={{ marginBottom: 20 }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Generating Access Token…</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '.9rem' }}>
                  Packaging your records for the doctor
                </p>
              </>
            ) : consentToken ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Access Token Generated</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '.85rem', marginBottom: 16 }}>
                  Share this token with your doctor. It expires in 30 minutes.
                </p>
                <div
                  style={{
                    background: 'var(--color-surface-alt)',
                    borderRadius: 'var(--radius)',
                    padding: '20px',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    letterSpacing: '.12em',
                    color: 'var(--color-primary)',
                    marginBottom: 20,
                    wordBreak: 'break-all',
                  }}
                >
                  {consentToken}
                </div>
                <button className="btn btn-primary" onClick={closeModal}>
                  Done
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>❌</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Failed to Generate Token</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '.85rem', marginBottom: 16 }}>
                  The relay service may be offline. Please try again later.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={handleGrantAccess}>
                    Retry
                  </button>
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
