// ═══════════════════════════════════════════════════
// VetaDoc — Staff workspace entry (admin.html)
// Admin + pharmacist → #/admin, vets → #/doctor.
// Every route requires a signed-in user with the right role
// (custom claims in Firebase; chosen role in demo mode).
// ═══════════════════════════════════════════════════

import { initTheme, getState } from './store.js';
import { registerRoute, initRouter } from './router.js';
import { initAuth, onSessionChange } from './services/auth.js';
import { initSync } from './services/sync.js';
import renderAdminPortal from './pages/adminPortal.js';
import renderDoctorPortal from './pages/doctorPortal.js';
import renderLogin from './pages/login.js';

const STAFF = ['admin', 'pharmacist', 'vet'];

const guard = (roles, handler) => (container, params) => {
    const s = getState().session;
    if (s && roles.includes(s.role)) return handler(container, params);
    if (s && STAFF.includes(s.role)) {
        // Signed in as staff, wrong area: send to their own workspace.
        window.location.hash = s.role === 'vet' ? '/doctor' : '/admin';
        return;
    }
    return renderLogin(container, params, {
        allowedRoles: roles.includes('vet') && roles.length === 1 ? ['vet'] : ['admin', 'pharmacist', 'vet'],
        afterLogin: session => {
            const target = session.role === 'vet' ? '/doctor' : '/admin';
            if (window.location.hash !== `#${target}`) window.location.hash = target;
        },
    });
};

function init() {
    initTheme();
    initAuth();
    initSync();

    const app = document.getElementById('app');
    app.innerHTML = `<main id="page-content"></main>`;

    registerRoute('/', guard(['admin', 'pharmacist'], renderAdminPortal));
    registerRoute('/admin', guard(['admin', 'pharmacist'], renderAdminPortal));
    registerRoute('/doctor', guard(['vet', 'admin'], renderDoctorPortal));

    initRouter('page-content');

    // Re-run the current route when the session changes (sign-in / sign-out).
    onSessionChange(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
