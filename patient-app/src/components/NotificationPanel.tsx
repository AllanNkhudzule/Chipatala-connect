import { useState, useEffect, useRef } from 'react';
import {
    getNotifications,
    markAllAsRead,
    dismissNotification,
    Notification,
    NotificationType,
} from '../services/notificationService';
import {
    Bell,
    UserCheck,
    ShieldCheck,
    AlertTriangle,
    ShieldOff,
    FileHeart,
    UserCog,
    Info,
    X,
} from 'lucide-react';
import { grantAccess } from '../services/relay';
import { toast } from 'react-hot-toast';

const iconMap: Record<NotificationType, React.ReactNode> = {
    access_request: <UserCheck size={16} strokeWidth={1.75} aria-hidden="true" />,
    session_approved: <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />,
    session_warning: <AlertTriangle size={16} strokeWidth={1.75} aria-hidden="true" />,
    session_expired: <ShieldOff size={16} strokeWidth={1.75} aria-hidden="true" />,
    record_received: <FileHeart size={16} strokeWidth={1.75} aria-hidden="true" />,
    profile_update: <UserCog size={16} strokeWidth={1.75} aria-hidden="true" />,
    info: <Info size={16} strokeWidth={1.75} aria-hidden="true" />,
};

const iconColorMap: Record<NotificationType, string> = {
    access_request: 'var(--color-info)',
    session_approved: 'var(--color-success, #16a34a)',
    session_warning: 'var(--color-warning, #d97706)',
    session_expired: 'var(--color-danger)',
    record_received: 'var(--color-primary)',
    profile_update: 'var(--color-text-secondary)',
    info: 'var(--color-info)',
};

function relativeTime(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function NotificationPanel() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const panelRef = useRef<HTMLDivElement>(null);

    const reload = () => setNotifications(getNotifications());

    useEffect(() => {
        reload();
        const iv = setInterval(reload, 3000);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        if (open) {
            markAllAsRead();
            reload();
        }
    }, [open]);

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const handleApprove = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const token = await grantAccess(30);
        if (token) {
            toast.success('Access granted successfully');
            dismissNotification(id);
            reload();
        } else {
            toast.error('Failed to grant access');
        }
    };

    const handleDecline = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        dismissNotification(id);
        reload();
        toast('Access request declined');
    };

    const handleDismiss = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        dismissNotification(id);
        reload();
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
        reload();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{ position: 'relative' }} ref={panelRef}>
            <button
                className="btn btn-icon topbar-btn"
                onClick={() => setOpen(!open)}
                aria-label="Open notifications"
                style={{ position: 'relative' }}
            >
                <Bell size={20} strokeWidth={1.75} aria-hidden="true" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        background: 'var(--color-danger)',
                        color: '#fff', borderRadius: '999px',
                        fontSize: '10px', fontWeight: 700,
                        minWidth: 16, height: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 3px', transform: 'translate(25%, -25%)',
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: '100%', right: 0, marginTop: 8,
                    width: 340,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000,
                    maxHeight: 440,
                    overflowY: 'auto',
                }}>
                    {/* Panel header */}
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        position: 'sticky', top: 0,
                        background: 'var(--color-surface)',
                    }}>
                        <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 600 }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '.8rem', color: 'var(--color-primary)', padding: 0 }}
                                onClick={handleMarkAllRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div>
                        {notifications.length === 0 ? (
                            <p style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)', margin: 0 }}>
                                No notifications right now.
                            </p>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} style={{
                                    padding: '14px 16px',
                                    borderBottom: '1px solid var(--color-border-light)',
                                    background: n.read ? 'transparent' : 'var(--color-surface-alt)',
                                }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'var(--color-surface-alt)',
                                            color: iconColorMap[n.type] || 'var(--color-primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            {iconMap[n.type] || iconMap.info}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h4 style={{ margin: '0 0 2px', fontSize: '.88rem', color: 'var(--color-text)', fontWeight: 600 }}>
                                                    {n.title}
                                                </h4>
                                                <button
                                                    aria-label="Dismiss notification"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-text-muted)', flexShrink: 0 }}
                                                    onClick={(e) => handleDismiss(n.id, e)}
                                                >
                                                    <X size={14} strokeWidth={1.75} aria-hidden="true" />
                                                </button>
                                            </div>
                                            <p style={{ margin: '0 0 4px', fontSize: '.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                                                {n.message}
                                            </p>
                                            <span style={{ fontSize: '.72rem', color: 'var(--color-text-muted)' }}>
                                                {relativeTime(n.date)}
                                            </span>

                                            {n.type === 'access_request' && (
                                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                                    <button className="btn btn-primary btn-sm" onClick={(e) => handleApprove(n.id, e)}>
                                                        Approve
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={(e) => handleDecline(n.id, e)}>
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
