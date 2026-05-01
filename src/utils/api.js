// ═══════════════════════════════════════════════════
// VetaDoc — API Client (connects to Express backend)
// ═══════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function apiRequest(path, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        return data;
    } catch (err) {
        console.warn(`API call failed: ${path}`, err.message);
        return { error: err.message, offline: true };
    }
}

// ── WhatsApp API ──

export async function sendBookingWhatsApp(bookingData) {
    return apiRequest('/whatsapp/send-booking', {
        method: 'POST',
        body: JSON.stringify(bookingData)
    });
}

export async function sendVaccineReminderWhatsApp(reminderData) {
    return apiRequest('/whatsapp/send-vaccine-reminder', {
        method: 'POST',
        body: JSON.stringify(reminderData)
    });
}

export async function sendOrderUpdateWhatsApp(orderData) {
    return apiRequest('/whatsapp/send-order-update', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
}

export async function sendSampleCollectionWhatsApp(collectionData) {
    return apiRequest('/whatsapp/send-sample-collection', {
        method: 'POST',
        body: JSON.stringify(collectionData)
    });
}

export async function sendFollowUpWhatsApp(followUpData) {
    return apiRequest('/whatsapp/send-followup-reminder', {
        method: 'POST',
        body: JSON.stringify(followUpData)
    });
}

// ── Notifications API ──

export async function getNotifications(userId = 'default') {
    return apiRequest(`/notifications/${userId}`);
}

export async function createNotification(notifData) {
    return apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify(notifData)
    });
}

export async function markNotificationRead(id) {
    return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(userId = 'default') {
    return apiRequest(`/notifications/read-all/${userId}`, { method: 'PATCH' });
}

export async function deleteNotification(id) {
    return apiRequest(`/notifications/${id}`, { method: 'DELETE' });
}

export async function generateVaccineReminders(pets, userId = 'default') {
    return apiRequest('/notifications/generate-vaccine-reminders', {
        method: 'POST',
        body: JSON.stringify({ pets, userId })
    });
}

// ── Admin API ──

export async function getAdminStats() {
    return apiRequest('/admin/stats');
}

export async function getRevenueChart() {
    return apiRequest('/admin/revenue-chart');
}

export async function getTopProducts() {
    return apiRequest('/admin/top-products');
}

export async function getAdminUsers() {
    return apiRequest('/admin/users');
}

export async function updateUserStatus(userId, status) {
    return apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
}

export async function getSampleCollections() {
    return apiRequest('/admin/sample-collections');
}

export async function createSampleCollection(data) {
    return apiRequest('/admin/sample-collections', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function updateSampleCollectionStatus(id, status) {
    return apiRequest(`/admin/sample-collections/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
}

export async function getDoctorStats(vetId) {
    return apiRequest(`/admin/doctor-stats/${vetId}`);
}

export async function getDoctorAppointments(vetId) {
    return apiRequest(`/admin/doctor-appointments/${vetId}`);
}

export async function getDoctorPatients(vetId) {
    return apiRequest(`/admin/doctor-patients/${vetId}`);
}

// ── Health Check ──
export async function checkBackendHealth() {
    return apiRequest('/health');
}
