// ═══════════════════════════════════════════════════
// VetaDoc — Admin Entry Point (Separate URL)
// ═══════════════════════════════════════════════════

import { initTheme } from './store.js';
import { registerRoute, initRouter } from './router.js';
import renderAdminPortal from './pages/adminPortal.js';
import renderDoctorPortal from './pages/doctorPortal.js';

function init() {
    initTheme();

    const app = document.getElementById('app');
    app.innerHTML = `<main id="page-content"></main>`;

    // Admin routes — no navbar/footer (admin has its own sidebar)
    registerRoute('/', renderAdminPortal);
    registerRoute('/admin', renderAdminPortal);
    registerRoute('/doctor', renderDoctorPortal);

    initRouter('page-content');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
