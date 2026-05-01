// ═══════════════════════════════════════════════════
// VetaDoc — Orders Page
// ═══════════════════════════════════════════════════

import { getState, reorderItems } from '../store.js';
import { formatPrice, formatDate } from '../utils/helpers.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export default function renderOrders(container) {
    const state = getState();
    const orders = state.orders;

    const statusColors = {
        delivered: 'badge-success',
        shipped: 'badge-info',
        processing: 'badge-warning',
        cancelled: 'badge-error'
    };

    const statusIcons = {
        delivered: 'check_circle',
        shipped: 'local_shipping',
        processing: 'hourglass_top',
        cancelled: 'cancel'
    };

    container.innerHTML = `
    <div class="page-container">
      <div style="margin-bottom:var(--space-6)">
        <h1 style="font-size:var(--text-2xl);display:flex;align-items:center;gap:var(--space-3)">
          <span class="material-icons-round" style="color:var(--color-primary)">local_shipping</span>
          My Orders
        </h1>
        <p style="color:var(--text-secondary);margin-top:var(--space-2);font-size:var(--text-sm)">Track your orders, view details, and quickly reorder previous purchases.</p>
      </div>

      ${orders.length === 0 ? `
        <div class="empty-state">
          <span class="material-icons-round">shopping_bag</span>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here.</p>
          <button class="btn btn-primary" id="orders-shop-btn">Shop Now</button>
        </div>
      ` : `
        <div class="orders-list">
          ${orders.map(order => `
            <div class="order-card animate-slideUp">
              <div class="order-card-header">
                <div>
                  <div style="font-weight:var(--font-bold);font-size:var(--text-base)">${order.id}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Placed on ${formatDate(order.date)}</div>
                </div>
                <span class="badge ${statusColors[order.status]} badge-dot">
                  ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <div style="font-weight:var(--font-bold);font-family:var(--font-display)">${formatPrice(order.total)}</div>
                <button class="btn btn-sm btn-secondary" data-reorder="${order.id}">
                  <span class="material-icons-round" style="font-size:14px">replay</span>
                  Reorder
                </button>
              </div>
              <div class="order-card-body">
                <div class="order-items-preview">
                  ${order.items.map(item => `
                    <div class="order-item-mini tooltip" data-tooltip="${item.name} × ${item.qty}">
                      ${item.emoji}
                    </div>
                  `).join('')}
                </div>

                ${order.prescriptionUploaded ? `
                  <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-4);font-size:var(--text-xs)">
                    <span class="material-icons-round" style="font-size:16px;color:var(--color-success)">verified</span>
                    <span style="color:var(--color-success);font-weight:var(--font-medium)">Prescription verified</span>
                  </div>
                ` : ''}

                <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-3)">
                  <span class="material-icons-round" style="font-size:14px;vertical-align:middle">location_on</span>
                  ${order.address}
                </div>

                <!-- Order Tracking Timeline -->
                <div class="timeline">
                  ${order.tracking.map((step, i) => `
                    <div class="timeline-item ${step.completed ? 'completed' : ''} ${step.completed && (!order.tracking[i + 1] || !order.tracking[i + 1].completed) ? 'active' : ''}">
                      <div class="timeline-dot"></div>
                      <div>
                        <div style="font-weight:var(--font-semibold);font-size:var(--text-sm);display:flex;align-items:center;gap:var(--space-2)">
                          <span class="material-icons-round" style="font-size:16px">${step.completed ? 'check_circle' : 'radio_button_unchecked'}</span>
                          ${step.status}
                        </div>
                        ${step.detail ? `<div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:2px">${step.detail}</div>` : ''}
                        ${step.time ? `<div class="timeline-time">${step.time}</div>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

    // Events
    document.getElementById('orders-shop-btn')?.addEventListener('click', () => navigate('/catalog'));

    document.querySelectorAll('[data-reorder]').forEach(btn => {
        btn.addEventListener('click', () => {
            reorderItems(btn.dataset.reorder);
            showToast('Items Added to Cart', 'Previous order items have been added to your cart', 'success');
            navigate('/cart');
        });
    });
}
