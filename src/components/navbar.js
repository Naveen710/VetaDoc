// ═══════════════════════════════════════════════════
// VetaDoc — Navbar Component
// ═══════════════════════════════════════════════════

import { getState, getCartCount, subscribe, toggleTheme } from '../store.js';
import { signOut } from '../services/auth.js';
import { navigate } from '../router.js';
import { debounce } from '../utils/helpers.js';
import { renderNotificationBell, initNotificationCenter } from './notificationCenter.js';

function accountHTML(state) {
    const s = state.session;
    if (!s) return `<a class="btn btn-primary btn-sm" href="#/login" id="nav-signin">Sign in</a>`;
    return `
      <button class="account-btn" id="nav-dashboard-btn" title="${s.name}" aria-haspopup="menu">
        <span class="account-initial">${(s.name || '?').trim().charAt(0).toUpperCase()}</span>
      </button>
      <div class="account-menu" id="account-menu" role="menu" hidden>
        <div class="account-head"><b>${s.name}</b><span>${s.phone || s.email || ''}${s.demo ? ' · demo' : ''}</span></div>
        <a href="#/dashboard" role="menuitem"><span class="material-icons-round">dashboard</span> Dashboard</a>
        <a href="#/pets" role="menuitem"><span class="material-icons-round">pets</span> Health records</a>
        <a href="#/prescriptions" role="menuitem"><span class="material-icons-round">medication</span> Prescriptions</a>
        <a href="#/orders" role="menuitem"><span class="material-icons-round">local_shipping</span> Orders</a>
        ${s.role !== 'parent' ? `<a href="/admin.html" role="menuitem"><span class="material-icons-round">admin_panel_settings</span> Staff workspace</a>` : ''}
        <button id="nav-signout" role="menuitem"><span class="material-icons-round">logout</span> Sign out</button>
      </div>`;
}

function bindAccount() {
    const menu = document.getElementById('account-menu');
    document.getElementById('nav-dashboard-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (menu) menu.hidden = !menu.hidden;
    });
    document.getElementById('nav-signout')?.addEventListener('click', async () => {
        await signOut();
        navigate('/');
    });
}

export function renderNavbar() {
    const state = getState();
    const cartCount = getCartCount();

    return `
    <nav class="navbar" id="main-navbar">
      <div class="navbar-inner">
        <a class="navbar-logo" href="#/" data-route="/">
          <div class="logo-icon">
            <span class="material-icons-round">pets</span>
          </div>
          <div class="logo-text">Veta<span>Doc</span></div>
        </a>

        <div class="navbar-search">
          <span class="material-icons-round search-icon">search</span>
          <input type="text" class="input" id="global-search" placeholder="Search medicines, supplements, pet care..." />
        </div>

        <nav class="navbar-nav">
          <a class="nav-link" href="#/" data-route="/">
            <span class="material-icons-round">home</span>
            Home
          </a>
          <a class="nav-link" href="#/catalog" data-route="/catalog">
            <span class="material-icons-round">inventory_2</span>
            Shop
          </a>
          <a class="nav-link" href="#/consultation" data-route="/consultation">
            <span class="material-icons-round">video_call</span>
            Consult Vet
          </a>
          <a class="nav-link" href="#/samples" data-route="/samples">
            <span class="material-icons-round">science</span>
            Lab Tests
          </a>
          <a class="nav-link" href="#/pets" data-route="/pets">
            <span class="material-icons-round">pets</span>
            My Pets
          </a>
        </nav>

        <div class="navbar-actions">
          <button class="btn-icon" id="theme-toggle-btn" data-tooltip="Toggle theme" title="Toggle theme">
            <span class="material-icons-round">${state.theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
          </button>
          ${renderNotificationBell()}
          <button class="btn-icon" id="nav-orders-btn" title="My Orders">
            <span class="material-icons-round">local_shipping</span>
          </button>
          <button class="btn-icon" id="nav-cart-btn" title="Cart">
            <span class="material-icons-round">shopping_cart</span>
            ${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}
          </button>
          <div class="account-wrap" id="account-wrap" style="position:relative">${accountHTML(state)}</div>
          <button class="btn-icon mobile-menu-btn" id="mobile-menu-btn">
            <span class="material-icons-round">menu</span>
          </button>
        </div>
      </div>
    </nav>
  `;
}

export function initNavbar() {
    // Theme toggle
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
        toggleTheme();
        const icon = document.querySelector('#theme-toggle-btn .material-icons-round');
        const state = getState();
        if (icon) icon.textContent = state.theme === 'light' ? 'dark_mode' : 'light_mode';
    });

    // Navigation buttons
    document.getElementById('nav-cart-btn')?.addEventListener('click', () => navigate('/cart'));
    document.getElementById('nav-orders-btn')?.addEventListener('click', () => navigate('/orders'));
    bindAccount();
    document.addEventListener('click', () => { const m = document.getElementById('account-menu'); if (m) m.hidden = true; });
    let lastUid = getState().session?.uid || null;
    subscribe((st) => {
        const uid = st.session?.uid || null;
        if (uid === lastUid) return;
        lastUid = uid;
        const wrap = document.getElementById('account-wrap');
        if (wrap) { wrap.innerHTML = accountHTML(st); bindAccount(); }
    });

    // Global search
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                navigate('/catalog');
                // Store search query to be picked up by catalog page
                window.__vetadoc_search = searchInput.value.trim();
                searchInput.value = '';
            }
        });
    }

    // Initialize notification center
    initNotificationCenter();

    // Subscribe to cart changes to update badge
    subscribe((state) => {
        const badge = document.querySelector('.cart-count');
        const count = getCartCount();
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        } else if (count > 0) {
            const cartBtn = document.getElementById('nav-cart-btn');
            if (cartBtn) {
                const span = document.createElement('span');
                span.className = 'cart-count';
                span.textContent = count;
                cartBtn.appendChild(span);
            }
        }
    });
}
