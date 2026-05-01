// ═══════════════════════════════════════════════════
// VetaDoc — Main Entry Point
// ═══════════════════════════════════════════════════

import { initTheme, getState } from './store.js';
import { registerRoute, initRouter } from './router.js';
import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderCartDrawer, initCartDrawer } from './components/cartDrawer.js';
import { renderEmergencySOS, initEmergencySOS } from './components/emergencySOS.js';
import { initNotificationService } from './utils/notificationService.js';
import { updateSEO, injectStructuredData } from './utils/seo.js';

// Pages
import renderHome from './pages/home.js';
import renderCatalog from './pages/catalog.js';
import renderProductDetail from './pages/productDetail.js';
import renderCart from './pages/cart.js';
import renderConsultation from './pages/consultation.js';
import renderOrders from './pages/orders.js';
import renderPetProfiles from './pages/petProfiles.js';
import renderDashboard from './pages/dashboard.js';
import renderSampleCollection from './pages/sampleCollection.js';
import renderPetFollowups from './pages/petFollowups.js';

// ── Initialize App ──

function init() {
    // Apply saved theme
    initTheme();

    // Build app shell
    const app = document.getElementById('app');
    app.innerHTML = `
    ${renderNavbar()}
    <div class="app-layout">
      <main id="page-content"></main>
      ${renderFooter()}
    </div>
    ${renderCartDrawer()}
    ${renderEmergencySOS()}
  `;

    // Init interactive components
    initNavbar();
    initCartDrawer();
    initEmergencySOS();

    // Register routes
    registerRoute('/', renderHome);
    registerRoute('/catalog', renderCatalog);
    registerRoute('/product', renderProductDetail);
    registerRoute('/cart', renderCart);
    registerRoute('/consultation', renderConsultation);
    registerRoute('/orders', renderOrders);
    registerRoute('/pets', renderPetProfiles);
    registerRoute('/dashboard', renderDashboard);
    registerRoute('/samples', renderSampleCollection);
    registerRoute('/followups', renderPetFollowups);

    // Start router
    initRouter('page-content');

    // Inject SEO structured data
    injectStructuredData();

    // SEO on route changes
    window.addEventListener('hashchange', () => {
        const route = window.location.hash.slice(1) || '/';
        updateSEO(route);
    });
    updateSEO(window.location.hash.slice(1) || '/');

    // Initialize notification service (connects to backend)
    initNotificationService();
}

// ── Start ──
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
