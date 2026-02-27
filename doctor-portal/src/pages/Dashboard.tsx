import { useNavigate } from 'react-router-dom';
import { Lock, FilePlus } from 'lucide-react';
import {
  doctorProfile,
  dashboardStats,
  activeSessions,
  recentRecords,
} from '../data/mockData';

const statusBadge: Record<string, string> = {
  active: 'badge badge-green',
  expiring: 'badge badge-yellow',
  expired: 'badge badge-gray',
};

const recordStatusBadge: Record<string, string> = {
  sent: 'badge badge-green',
  pending: 'badge badge-yellow',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-MW', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <div className="welcome-card">
        <div>
          <h2>{getGreeting()}, {doctorProfile.name}</h2>
          <p>{doctorProfile.hospital} &bull; {today}</p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-white" onClick={() => navigate('/patient-access')}>
            <Lock size={16} /> Request Patient Access
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/create-record')}>
            <FilePlus size={16} /> Create New Record
          </button>
        </div>
      </div>

      <div className="stat-grid">
        {dashboardStats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2>Active Patient Sessions</h2>
            <button className="card-action" onClick={() => navigate('/patient-access')}>
              View All
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Access Type</th>
                  <th>Time Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeSessions.map((s) => (
                  <tr key={s.patientName}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      {s.patientName}
                    </td>
                    <td>{s.accessType}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          fontVariantNumeric: 'tabular-nums',
                          color:
                            s.status === 'active'
                              ? 'var(--color-primary)'
                              : s.status === 'expiring'
                                ? 'var(--color-warning)'
                                : 'var(--color-text-muted)',
                        }}
                      >
                        {s.timeRemaining}
                      </span>
                    </td>
                    <td>
                      <span className={statusBadge[s.status]}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent Records Created</h2>
            <button className="card-action" onClick={() => navigate('/create-record')}>
              Create New
            </button>
          </div>
          <ul className="activity-list">
            {recentRecords.map((r, i) => (
              <li className="activity-item" key={i}>
                <div
                  className="activity-icon"
                  style={{
                    background:
                      r.iconColor === 'green'
                        ? 'var(--color-primary-bg)'
                        : r.iconColor === 'blue'
                          ? 'var(--color-info-bg)'
                          : 'var(--color-warning-bg)',
                  }}
                >
                  {r.icon}
                </div>
                <div className="activity-body">
                  <strong>{r.title}</strong>
                  <p>{r.description}</p>
                </div>
                <span className={recordStatusBadge[r.status]}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
