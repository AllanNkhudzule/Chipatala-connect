import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderHeart,
    ScanLine,
    ShieldCheck,
    Bell,
    UserCircle,
    LogOut,
    HeartPulse,
    X,
} from 'lucide-react';
import { getNotifications } from '../services/notificationService';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/history', label: 'My Records', icon: FolderHeart, end: false },
    { to: '/retrieve', label: 'Scan QR Code', icon: ScanLine, end: false },
    { to: '/retrieve', label: 'Grant Access', icon: ShieldCheck, end: false },
    { to: '/profile', label: 'Profile', icon: UserCircle, end: false },
];

export default function PatientSidebar({ open, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const [profileName, setProfileName] = useState('');
    const [profileInitials, setProfileInitials] = useState('PA');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Load patient name from localStorage profile
        try {
            const raw = localStorage.getItem('profile:local');
            if (raw) {
                const parsed = JSON.parse(raw);
                // profile:local stores an encrypted object; fall back gracefully
                if (parsed?.name) {
                    setProfileName(parsed.name);
                    setProfileInitials(
                        parsed.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    );
                }
            }
            // Also try plain-text profile key for development
            const plain = localStorage.getItem('chipatala-patient-profile');
            if (plain) {
                const p = JSON.parse(plain);
                if (p?.name) {
                    setProfileName(p.name);
                    setProfileInitials(p.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
                }
            }
        } catch {
            // Ignore decryption errors — use defaults
        }
        // Load unread count
        setUnreadCount(getNotifications().filter(n => !n.read).length);
        const iv = setInterval(() => {
            setUnreadCount(getNotifications().filter(n => !n.read).length);
        }, 3000);
        return () => clearInterval(iv);
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <>
            <div
                className={`sidebar-overlay${open ? ' active' : ''}`}
                onClick={onClose}
            />
            <aside className={`sidebar${open ? ' open' : ''}`}>
                {/* Brand header */}
                <div className="sidebar-brand">
                    <HeartPulse size={22} strokeWidth={1.75} style={{ color: 'var(--color-primary)', flexShrink: 0 }} aria-hidden="true" />
                    <div className="brand-text">
                        Chipatala Connect
                        <small>Digital Health Passport</small>
                    </div>
                    <button
                        className="mobile-menu-btn"
                        style={{ marginLeft: 'auto', display: open ? 'flex' : undefined }}
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <X size={18} strokeWidth={1.75} />
                    </button>
                </div>

                {/* Patient identity */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '.85rem', flexShrink: 0,
                        letterSpacing: '.02em',
                    }}>
                        {profileInitials}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--color-text)', lineHeight: 1.2 }}>
                            {profileName || 'Patient'}
                        </div>
                        <div style={{ fontSize: '.73rem', color: 'var(--color-text-muted)' }}>Patient Account</div>
                    </div>
                </div>

                <div className="sidebar-section-label">Navigation</div>

                <ul className="sidebar-nav">
                    {navItems.map(({ to, label, icon: Icon, end }, idx) => (
                        <li key={`${to}-${idx}`}>
                            <NavLink
                                to={to}
                                end={end}
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={onClose}
                            >
                                <div style={{ position: 'relative', display: 'inline-flex' }}>
                                    <Icon size={20} strokeWidth={1.75} className="nav-icon" aria-hidden="true" />
                                    {label === 'Notifications' && unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -4, right: -6,
                                            background: 'var(--color-danger)',
                                            color: '#fff', borderRadius: '999px',
                                            fontSize: '10px', fontWeight: 700,
                                            minWidth: 16, height: 16,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '0 3px',
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Notification bell shortcut */}
                <div className="sidebar-section-label" style={{ marginTop: 8 }}>Account</div>
                <ul className="sidebar-nav">
                    <li>
                        <button
                            className="btn"
                            style={{
                                width: '100%', textAlign: 'left', padding: '10px 16px',
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-text-secondary)', fontSize: '.9rem',
                                borderRadius: 'var(--radius)',
                            }}
                            onClick={() => { onClose(); navigate('/profile'); }}
                        >
                            <div style={{ position: 'relative', display: 'inline-flex' }}>
                                <Bell size={20} strokeWidth={1.75} aria-hidden="true" />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: -4, right: -6,
                                        background: 'var(--color-danger)',
                                        color: '#fff', borderRadius: '999px',
                                        fontSize: '10px', fontWeight: 700,
                                        minWidth: 16, height: 16,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '0 3px',
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            Notifications
                        </button>
                    </li>
                    <li>
                        <button
                            className="btn"
                            style={{
                                width: '100%', textAlign: 'left', padding: '10px 16px',
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-danger)', fontSize: '.9rem',
                                borderRadius: 'var(--radius)',
                            }}
                            onClick={handleSignOut}
                            aria-label="Sign out"
                        >
                            <LogOut size={20} strokeWidth={1.75} aria-hidden="true" />
                            Sign Out
                        </button>
                    </li>
                </ul>

                <div className="sidebar-footer">&copy; 2026 Chipatala Connect</div>
            </aside>
        </>
    );
}
