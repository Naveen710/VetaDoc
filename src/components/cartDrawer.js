// ═══════════════════════════════════════════════════
// VetaDoc — Cart Drawer Component
// ═══════════════════════════════════════════════════

import { getState, removeFromCart, updateCartQty, getCartTotal, getCartCount } from '../store.js';
import { formatPrice } from '../utils/helpers.js';
import { navigate } from '../router.js';

let isOpen = false;

export function renderCartDrawer() {
    const state = getState();
    const items = state.cart;
    const total = getCartTotal();

    return `
    <div class="cart-drawer-backdrop ${isOpen ? 'open' : ''}" id="cart-backdrop"></div>
    <div class="cart-drawer ${isOpen ? 'open' : ''}" id="cart-drawer">
      <div class="cart-drawer-header">
        <h3>
          <span class="material-icons-round">shopping_cart</span>
          Cart (${getCartCount()})
        </h3>
        <button class="btn-icon btn-ghost" id="close-cart-drawer">
          <span class="material-icons-round">close</span>
        </button>
      </div>
      <div class="cart-drawer-body">
        ${items.length === 0 ? `
          <div class="empty-state" style="padding: var(--space-8) 0;">
            <span class="material-icons-round">remove_shopping_cart</span>
            <h3>Cart is empty</h3>
            <p>Browse our products and add items to your cart.</p>
          </div>
        ` : items.map(item => `
          <div class="cart-item" style="margin-bottom: var(--space-3); padding: var(--space-3) var(--space-4); flex-direction: row;">
            <div class="cart-item-image" style="width:50px;height:50px;font-size:24px">${item.emoji}</div>
            <div class="cart-item-info" style="flex:1;min-width:0;">
              <div class="cart-item-name" style="font-size:var(--text-sm)">${item.name}</div>
              <div class="cart-item-brand">${item.brand}</div>
              ${item.prescriptionRequired ? '<span class="rx-badge" style="margin-top:4px"><span class="material-icons-round">medication</span> Rx</span>' : ''}
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-2)">
              <div class="cart-item-price" style="font-size:var(--text-sm)">${formatPrice(item.price * item.qty)}</div>
              <div class="qty-control">
                <button data-qty-minus="${item.productId}"><span class="material-icons-round" style="font-size:14px">remove</span></button>
                <span>${item.qty}</span>
                <button data-qty-plus="${item.productId}"><span class="material-icons-round" style="font-size:14px">add</span></button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ${items.length > 0 ? `
        <div class="cart-drawer-footer">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-4)">
            <span style="font-weight:var(--font-semibold)">Subtotal</span>
            <span style="font-weight:var(--font-bold);font-family:var(--font-display)">${formatPrice(total)}</span>
          </div>
          <button class="btn btn-primary w-full btn-lg" id="drawer-checkout-btn">
            <span class="material-icons-round">shopping_bag</span>
            Checkout
          </button>
          <button class="btn btn-ghost w-full" id="drawer-view-cart-btn" style="margin-top:var(--space-2)">
            View Full Cart
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

export function toggleCartDrawer() {
    isOpen = !isOpen;
    updateCartDrawerDOM();
}

export function openCartDrawer() {
    isOpen = true;
    updateCartDrawerDOM();
}

export function closeCartDrawer() {
    isOpen = false;
    updateCartDrawerDOM();
}

function updateCartDrawerDOM() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.classList.toggle('open', isOpen);
    if (backdrop) backdrop.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

export function initCartDrawer() {
    document.getElementById('close-cart-drawer')?.addEventListener('click', closeCartDrawer);
    document.getElementById('cart-backdrop')?.addEventListener('click', closeCartDrawer);
    document.getElementById('drawer-checkout-btn')?.addEventListener('click', () => {
        closeCartDrawer();
        navigate('/cart');
    });
    document.getElementById('drawer-view-cart-btn')?.addEventListener('click', () => {
        closeCartDrawer();
        navigate('/cart');
    });

    // Qty controls
    document.querySelectorAll('[data-qty-minus]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.qtyMinus);
            const item = getState().cart.find(i => i.productId === id);
            if (item) updateCartQty(id, item.qty - 1);
            refreshDrawer();
        });
    });
    document.querySelectorAll('[data-qty-plus]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.qtyPlus);
            const item = getState().cart.find(i => i.productId === id);
            if (item) updateCartQty(id, item.qty + 1);
            refreshDrawer();
        });
    });
}

function refreshDrawer() {
    const container = document.getElementById('cart-drawer')?.parentElement;
    if (!container) return;
    // Re-render the drawer in place
    const drawerWrapper = document.createElement('div');
    drawerWrapper.innerHTML = renderCartDrawer();

    const oldDrawer = document.getElementById('cart-drawer');
    const oldBackdrop = document.getElementById('cart-backdrop');

    if (oldDrawer) oldDrawer.replaceWith(drawerWrapper.querySelector('.cart-drawer'));
    if (oldBackdrop) oldBackdrop.replaceWith(drawerWrapper.querySelector('.cart-drawer-backdrop'));

    initCartDrawer();
}
