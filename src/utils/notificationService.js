// ═══════════════════════════════════════════════════
// VetaDoc — Notification Service
// ═══════════════════════════════════════════════════

import { getState } from '../store.js';
import { generateVaccineReminders, getNotifications } from './api.js';

let refreshInterval = null;

export async function initNotificationService() {
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        try {
            await Notification.requestPermission();
        } catch (e) { /* user denied or API unavailable */ }
    }

    // Generate initial vaccine reminders
    await checkVaccineReminders();

    // Periodic check every 30 minutes
    refreshInterval = setInterval(checkVaccineReminders, 30 * 60 * 1000);
}

export function destroyNotificationService() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

async function checkVaccineReminders() {
    const state = getState();
    if (!state.pets || state.pets.length === 0) return;

    const result = await generateVaccineReminders(state.pets);
    if (result && result.generated > 0) {
        // Show browser notification for urgent ones
        result.notifications?.forEach(n => {
            if (n.metadata?.urgency === 'urgent') {
                showBrowserNotification(n.title, n.message);
            }
        });
    }
}

export function showBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'vetadoc-' + Date.now(),
                requireInteraction: false
            });
        } catch (e) {
            console.warn('Browser notification failed:', e);
        }
    }
}

export async function fetchNotifications(userId = 'default') {
    const result = await getNotifications(userId);
    if (result && !result.error) {
        return result;
    }
    return { notifications: [], unreadCount: 0 };
}
