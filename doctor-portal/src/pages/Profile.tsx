import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorProfile as mockProfile, activeSessions } from '../data/mockData';
import type { Session } from '../types';
import { toast } from 'react-hot-toast';
import {
    User,
    BadgeCheck,
    Hospital,
    Stethoscope,
    Mail,
} from 'lucide-react';

function ReadOnlyField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'flex' }} aria-hidden="true">{icon}</span>
                {label}
            </label>
            <input
                className="form-control"
                value={value}
                readOnly
                style={{
                    background: 'var(--color-surface-alt)',
                    color: 'var(--color-text-muted)',
                    cursor: 'not-allowed',
                    border: '1px solid var(--color-border)',
                }}
            />
        </div>
    );
}

function EditableField({ icon, label, value, onChange, type = 'text' }: {
    icon: React.ReactNode; label: string; value: string;
    onChange: (v: string) => void; type?: string;
}) {
    return (
        <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ color: 'var(--color-primary)', display: 'flex' }} aria-hidden="true">{icon}</span>
                {label}
            </label>
            <input
                className="form-control"
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(() => {
        const local = localStorage.getItem('doctor_profile');
        return local ? JSON.parse(local) : {
            name: mockProfile.name,
            license: 'MD-998877',
            hospital: mockProfile.hospital,
            specialty: mockProfile.specialty,
            email: 'grace.banda@qech.mw',
        };
    });

    const [sessions, setSessions] = useState<Session[]>(activeSessions);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        if (!profile.hospital.trim()) { toast.error('Facility name is required.'); return; }
        if (!profile.specialty.trim()) { toast.error('Specialisation is required.'); return; }
        localStorage.setItem('doctor_profile', JSON.stringify(profile));
        setSaved(true);
        toast.success('Profile updated.');
        setTimeout(() => { setSaved(false); }, 2000);
    };

    const handleRevokeAll = () => {
        if (window.confirm('Are you sure you want to revoke all active sessions immediately?')) {
            setSessions([]);
            toast.success('All sessions revoked');
        }
    };

    const handleRevoke = (index: number) => {
        setSessions((prev) => prev.filter((_, i) => i !== index));
        toast.success('Session revoked');
    };

    return (
        <>
            <div className="content-header">
                <h1>Doctor Profile</h1>
                <p>Manage your facility details and active session history.</p>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 20 }}>Personal Details</h2>

                <div className="grid-2" style={{ gap: 16 }}>
                    <ReadOnlyField
                        icon={<User size={16} strokeWidth={1.75} />}
                        label="Full Name (read-only)"
                        value={profile.name}
                    />
                    <ReadOnlyField
                        icon={<BadgeCheck size={16} strokeWidth={1.75} />}
                        label="Medical Licence Number (read-only)"
                        value={profile.license}
                    />
                </div>

                <ReadOnlyField
                    icon={<Mail size={16} strokeWidth={1.75} />}
                    label="Contact Email (read-only)"
                    value={profile.email}
                />

                <div className="grid-2" style={{ gap: 16 }}>
                    <EditableField
                        icon={<Hospital size={16} strokeWidth={1.75} />}
                        label="Facility / Hospital Name"
                        value={profile.hospital}
                        onChange={(v) => setProfile((p: typeof profile) => ({ ...p, hospital: v }))}
                    />
                    <EditableField
                        icon={<Stethoscope size={16} strokeWidth={1.75} />}
                        label="Specialisation"
                        value={profile.specialty}
                        onChange={(v) => setProfile((p: typeof profile) => ({ ...p, specialty: v }))}
                    />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saved}>
                        {saved ? 'Saved!' : 'Save Details'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        Back
                    </button>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Session History</h2>
                    <button className="btn btn-outline btn-sm" onClick={handleRevokeAll} disabled={sessions.length === 0}>
                        Revoke All Access
                    </button>
                </div>

                {sessions.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
                        No active sessions linked to this account.
                    </p>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient Name</th>
                                    <th>Access Scope</th>
                                    <th>Time Remaining</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: 'var(--color-primary-bg)',
                                                    color: 'var(--color-primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 13, fontWeight: 'bold',
                                                }}>
                                                    {session.patientName.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <strong>{session.patientName}</strong>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-gray">{session.accessType}</span></td>
                                        <td style={{ fontFamily: 'monospace' }}>{session.timeRemaining}</td>
                                        <td>
                                            <span className={`badge badge-${session.status === 'active' ? 'green' : 'yellow'}`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-outline btn-sm" onClick={() => handleRevoke(i)}>
                                                Revoke
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
