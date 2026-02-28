import { toast } from 'react-hot-toast';

export type NotificationType =
    | 'access_granted'
    | 'session_warning'
    | 'session_expired'
    | 'profile_update'
    | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    date: string;
    read: boolean;
    actionPayload?: Record<string, unknown>;
}

const NOTIFICATIONS_KEY = 'chipatala-doctor-notifications';

export function getNotifications(): Notification[] {
    try {
        const raw = localStorage.getItem(NOTIFICATIONS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveNotifications(notifications: Notification[]) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function addNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>) {
    const notifications = getNotifications();
    const newNotif: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        read: false,
    };
    notifications.unshift(newNotif);
    saveNotifications(notifications);

    toast(notification.title);
}

export function dismissNotification(id: string) {
    const notifications = getNotifications();
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
}

export function markAsRead(id: string) {
    const notifications = getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
}

export function markAllAsRead() {
    const notifications = getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
}

// Typed helpers for each session lifecycle event
export function notifySessionApproved(duration: number, token: string) {
    addNotification({
        type: 'access_granted',
        title: 'Access Granted',
        message: `Patient has granted access. Session active for ${duration} minutes.`,
        actionPayload: { token },
    });
}

export function notifySessionWarning() {
    addNotification({
        type: 'session_warning',
        title: 'Session Expiring Soon',
        message: 'Warning: Your access session expires in 5 minutes.',
    });
}

export function notifySessionExpired() {
    addNotification({
        type: 'session_expired',
        title: 'Session Ended',
        message: 'The session has ended. Access has been revoked.',
    });
}

export function notifyProfileUpdate() {
    addNotification({
        type: 'profile_update',
        title: 'Profile Updated',
        message: 'Your profile has been updated.',
    });
}
