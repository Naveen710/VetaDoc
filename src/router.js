// ═══════════════════════════════════════════════════
// VetaDoc — Hash-based SPA Router
// ═══════════════════════════════════════════════════

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = path;
}

export function getCurrentRoute() {
    return window.location.hash.slice(1) || '/';
}

export function getRouteParams() {
    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);
    return parts;
}

export function initRouter(containerId) {
    const container = document.getElementById(containerId);

    async function handleRoute() {
        const path = getCurrentRoute();
        const parts = path.split('/').filter(Boolean);
        const base = '/' + (parts[0] || '');

        // Cleanup previous page
        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }

        // Find matching route
        let handler = routes[base] || routes[path] || routes['/'];

        if (handler) {
            container.innerHTML = '<div class="page-loading" style="display:flex;align-items:center;justify-content:center;padding:4rem;"><div class="loading-spinner"></div></div>';
            try {
                const result = await handler(container, parts.slice(1));
                if (typeof result === 'function') {
                    currentCleanup = result;
                }
            } catch (err) {
                console.error('Route error:', err);
                container.innerHTML = `
          <div class="empty-state">
            <span class="material-icons-round">error_outline</span>
            <h3>Something went wrong</h3>
            <p>Please try again or go back to the home page.</p>
            <button class="btn btn-primary" onclick="location.hash='/'">Go Home</button>
          </div>
        `;
            }
        } else {
            container.innerHTML = `
        <div class="empty-state">
          <span class="material-icons-round">explore_off</span>
          <h3>Page Not Found</h3>
          <p>The page you're looking for doesn't exist.</p>
          <button class="btn btn-primary" onclick="location.hash='/'">Go Home</button>
        </div>
      `;
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update active nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('data-route');
            if (href === base || (href === '/' && base === '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    return () => window.removeEventListener('hashchange', handleRoute);
}
