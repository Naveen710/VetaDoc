// ═══════════════════════════════════════════════════
// VetaDoc — Notification Center Component
// ═══════════════════════════════════════════════════

import { fetchNotifications, showBrowserNotification } from '../utils/notificationService.js';
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '../utils/api.js';
import { navigate } from '../router.js';

let isOpen = false;
let notifData = { notifications: [], unreadCount: 0 };
let refreshTimer = null;

export function renderNotificationBell() {
    return `
    <div class="notification-bell-wrapper" id="notification-bell-wrapper">
      <button class="btn-icon" id="notification-bell-btn" title="Notifications">
        <span class="material-icons-round">notifications</span>
        <span class="notif-badge" id="notif-badge" style="display:none">0</span>
      </button>
      <div class="notification-dropdown" id="notification-dropdown">
        <div class="notif-header">
          <h4>Notifications</h4>
          <button class="btn btn-ghost btn-sm" id="mark-all-read-btn">Mark all read</button>
        </div>
        <div class="notif-list" id="notif-list">
          <div class="notif-empty">
            <span class="material-icons-round">notifications_off</span>
            <p>No notifications yet</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initNotificationCenter() {
    const bellBtn = document.getElementById('notification-bell-btn');
    const dropdown = document.getElementById('notification-dropdown');

    bellBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        dropdown?.classList.toggle('open', isOpen);
        if (isOpen) refreshNotifications();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (isOpen && !e.target.closest('#notification-bell-wrapper')) {
            isOpen = false;
            dropdown?.classList.remove('open');
        }
    });

    document.getElementById('mark-all-read-btn')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await markAllNotificationsRead('default');
        await refreshNotifications();
    });

    // Initial load & periodic refresh
    refreshNotifications();
    refreshTimer = setInterval(refreshNotifications, 60000);
}

export function destroyNotificationCenter() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

async function refreshNotifications() {
    notifData = await fetchNotifications('default');
    updateBadge();
    if (isOpen) renderNotificationList();
}

function updateBadge() {
    const badge = document.getElementById('notif-badge');
    if (badge) {
        if (notifData.unreadCount > 0) {
            badge.textContent = notifData.unreadCount > 99 ? '99+' : notifData.unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function renderNotificationList() {
    const list = document.getElementById('notif-list');
    if (!list) return;

    if (!notifData.notifications || notifData.notifications.length === 0) {
        list.innerHTML = `
      <div class="notif-empty">
        <span class="material-icons-round">notifications_off</span>
        <p>No notifications yet</p>
      </div>
    `;
        return;
    }

    const typeIcons = {
        vaccine: { icon: 'vaccines', color: 'var(--color-warning)' },
        booking: { icon: 'event_available', color: 'var(--color-primary)' },
        order: { icon: 'local_shipping', color: 'var(--color-info)' },
        followup: { icon: 'repeat', color: 'var(--color-secondary)' },
        sample: { icon: 'science', color: '#8b5cf6' },
        emergency: { icon: 'emergency', color: 'var(--color-error)' }
    };

    list.innerHTML = notifData.notifications.slice(0, 20).map(n => {
        const t = typeIcons[n.type] || { icon: 'info', color: 'var(--text-tertiary)' };
        const timeAgo = getTimeAgo(n.createdAt);
        return `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
        <div class="notif-icon" style="color:${t.color}">
          <span class="material-icons-round">${t.icon}</span>
        </div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-message">${n.message}</div>
          <div class="notif-time">${timeAgo}</div>
        </div>
        <button class="notif-dismiss" data-dismiss-notif="${n.id}" title="Dismiss">
          <span class="material-icons-round">close</span>
        </button>
      </div>
    `;
    }).join('');

    // Attach events
    list.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            if (e.target.closest('.notif-dismiss')) return;
            const id = parseInt(item.dataset.notifId);
            await markNotificationRead(id);
            item.classList.remove('unread');
            notifData.unreadCount = Math.max(0, notifData.unreadCount - 1);
            updateBadge();
        });
    });

    list.querySelectorAll('.notif-dismiss').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.dismissNotif);
            await deleteNotification(id);
            await refreshNotifications();
        });
    });
}

function getTimeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
