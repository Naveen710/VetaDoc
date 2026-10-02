// ═══════════════════════════════════════════════════
// VetaDoc — Dashboard Page (Enhanced)
// ═══════════════════════════════════════════════════

import { getState, getCartCount } from '../store.js';
import { formatPrice, formatDate, daysUntil } from '../utils/helpers.js';
import { navigate } from '../router.js';
import { checkBackendHealth } from '../utils/api.js';
import { remindersDue } from '../../shared/vaccineSchedules.js';

export default async function renderDashboard(container) {
    const state = getState();
    const { user, pets, orders, consultations } = state;

    const upcomingConsultations = consultations.filter(c => c.status === 'upcoming');
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

    // Check backend status
    const health = await checkBackendHealth();
    const liveData = health.live;

    // Vaccination reminders
    // Species schedule (shared with the daily reminder function)
    const vaccReminders = [];
    pets.forEach(pet => {
        remindersDue(pet, new Date(), 60).forEach(item => {
            vaccReminders.push({ petName: pet.name, petEmoji: pet.emoji, vaccine: item.name, daysLeft: item.days, dueDate: item.dueDate });
        });
    });
    vaccReminders.sort((a, b) => a.daysLeft - b.daysLeft);

    container.innerHTML = `
    <div class="page-container">
      <!-- Welcome Header -->
      <div style="margin-bottom:var(--space-8)">
        <h1 style="font-size:var(--text-2xl)">Welcome back, <span style="color:var(--color-primary)">${state.session?.name || user.name}</span></h1>
        <p style="color:var(--text-secondary);margin-top:var(--space-2);font-size:var(--text-sm)">Here's what's happening with your pets and orders.</p>
        <div style="display:inline-flex;align-items:center;gap:var(--space-2);margin-top:var(--space-2);padding:var(--space-1) var(--space-3);background:var(--surface-tint);border-radius:var(--radius-full);font-size:var(--text-xs);color:var(--color-primary)">
          <span style="width:6px;height:6px;background:currentColor;border-radius:50%;display:inline-block"></span>
          ${liveData ? 'Synced to your VetaDoc account' : 'Demo mode · data is stored in this browser only'}
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="dashboard-grid">
        <div class="dashboard-stat-card">
          <div class="stat-icon green"><span class="material-icons-round">pets</span></div>
          <div class="stat-info">
            <div class="stat-value">${pets.length}</div>
            <div class="stat-label">Registered Pets</div>
          </div>
        </div>
        <div class="dashboard-stat-card">
          <div class="stat-icon blue"><span class="material-icons-round">local_shipping</span></div>
          <div class="stat-info">
            <div class="stat-value">${activeOrders.length}</div>
            <div class="stat-label">Active Orders</div>
          </div>
        </div>
        <div class="dashboard-stat-card">
          <div class="stat-icon purple"><span class="material-icons-round">video_call</span></div>
          <div class="stat-info">
            <div class="stat-value">${upcomingConsultations.length}</div>
            <div class="stat-label">Upcoming Consults</div>
          </div>
        </div>
        <div class="dashboard-stat-card">
          <div class="stat-icon amber"><span class="material-icons-round">account_balance_wallet</span></div>
          <div class="stat-info">
            <div class="stat-value">${formatPrice(totalSpent)}</div>
            <div class="stat-label">Total Spent</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="dashboard-section">
        <h3 style="margin-bottom:var(--space-4)">Quick Actions</h3>
        <div class="quick-actions">
          <div class="quick-action" id="qa-shop">
            <span class="material-icons-round">storefront</span>
            <span>Browse Products</span>
          </div>
          <div class="quick-action" id="qa-consult">
            <span class="material-icons-round">video_call</span>
            <span>Book Consultation</span>
          </div>
          <div class="quick-action" id="qa-samples">
            <span class="material-icons-round" style="color:#8b5cf6">science</span>
            <span>Lab Tests</span>
          </div>
          <div class="quick-action" id="qa-followups">
            <span class="material-icons-round" style="color:var(--color-secondary)">event_repeat</span>
            <span>Follow-ups</span>
          </div>
          <div class="quick-action" id="qa-pets">
            <span class="material-icons-round">pets</span>
            <span>Manage Pets</span>
          </div>
          <div class="quick-action" id="qa-orders">
            <span class="material-icons-round">local_shipping</span>
            <span>Track Orders</span>
          </div>
          <div class="quick-action" id="qa-rx">
            <span class="material-icons-round">upload_file</span>
            <span>Upload Prescription</span>
          </div>
          <div class="quick-action" id="qa-cart">
            <span class="material-icons-round">shopping_cart</span>
            <span>View Cart (${getCartCount()})</span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);margin-top:var(--space-8)">

        <!-- Vaccination Reminders -->
        <div class="card" style="padding:var(--space-6)">
          <h4 style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-4)">
            <span class="material-icons-round" style="color:var(--color-warning)">notifications_active</span>
            Vaccination Reminders
          </h4>
          ${vaccReminders.length > 0 ? `
            <div style="display:flex;flex-direction:column;gap:var(--space-3)">
              ${vaccReminders.map(r => `
                <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:${r.daysLeft <= 30 ? 'rgba(245,158,11,0.08)' : 'var(--bg-secondary)'};border-radius:var(--radius-lg)">
                  <span style="font-size:24px">${r.petEmoji}</span>
                  <div style="flex:1">
                    <div style="font-size:var(--text-sm);font-weight:var(--font-medium)">${r.petName} — ${r.vaccine}</div>
                    <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Due: ${formatDate(r.dueDate)}</div>
                  </div>
                  <span class="badge ${r.daysLeft <= 30 ? 'badge-warning' : 'badge-neutral'}">${r.daysLeft < 0 ? `${-r.daysLeft}d overdue` : r.daysLeft === 0 ? 'Today' : `${r.daysLeft}d left`}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="font-size:var(--text-sm);color:var(--text-tertiary)">No upcoming vaccinations. All pets are up to date! 🎉</p>
          `}
        </div>

        <!-- Recent Orders -->
        <div class="card" style="padding:var(--space-6)">
          <h4 style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-4)">
            <span class="material-icons-round" style="color:var(--color-info)">receipt_long</span>
            Recent Orders
          </h4>
          ${orders.length > 0 ? `
            <div style="display:flex;flex-direction:column;gap:var(--space-3)">
              ${orders.slice(0, 3).map(order => {
        const statusColors = { delivered: 'var(--color-success)', shipped: 'var(--color-info)', processing: 'var(--color-warning)', cancelled: 'var(--color-error)' };
        return `
                  <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-secondary);border-radius:var(--radius-lg);cursor:pointer" class="order-preview-item" data-order-nav>
                    <div style="display:flex;gap:var(--space-1)">
                      ${order.items.slice(0, 3).map(i => `<span style="font-size:18px">${i.emoji}</span>`).join('')}
                    </div>
                    <div style="flex:1">
                      <div style="font-size:var(--text-sm);font-weight:var(--font-medium)">${order.id}</div>
                      <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${formatDate(order.date)}</div>
                    </div>
                    <div style="text-align:right">
                      <div style="font-size:var(--text-sm);font-weight:var(--font-bold)">${formatPrice(order.total)}</div>
                      <div style="font-size:var(--text-xs);color:${statusColors[order.status]};font-weight:var(--font-medium)">${order.status}</div>
                    </div>
                  </div>
                `;
    }).join('')}
            </div>
            <button class="btn btn-ghost w-full" id="view-all-orders" style="margin-top:var(--space-3);font-size:var(--text-xs)">View All Orders</button>
          ` : `
            <p style="font-size:var(--text-sm);color:var(--text-tertiary)">No orders yet. Start shopping to see your orders here.</p>
          `}
        </div>
      </div>

      <!-- Upcoming Consultations -->
      ${upcomingConsultations.length > 0 ? `
        <div class="dashboard-section">
          <div class="card" style="padding:var(--space-6)">
            <h4 style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-4)">
              <span class="material-icons-round" style="color:var(--color-primary)">event</span>
              Upcoming Consultations
            </h4>
            <div style="display:flex;gap:var(--space-4);flex-wrap:wrap">
              ${upcomingConsultations.map(c => `
                <div style="flex:1;min-width:250px;padding:var(--space-4);background:var(--color-primary-50);border-radius:var(--radius-lg);border-left:3px solid var(--color-primary)">
                  <div style="font-weight:var(--font-semibold);font-size:var(--text-sm)">${c.vetName}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:var(--space-1)">For ${c.petName} · ${c.type}</div>
                  <div style="display:flex;gap:var(--space-4);margin-top:var(--space-2);font-size:var(--text-xs);color:var(--text-secondary)">
                    <span><span class="material-icons-round" style="font-size:12px;vertical-align:middle">calendar_today</span> ${c.date}</span>
                    <span><span class="material-icons-round" style="font-size:12px;vertical-align:middle">schedule</span> ${c.time} IST</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- User Info -->
      <div class="dashboard-section">
        <div class="card" style="padding:var(--space-6)">
          <h4 style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-4)">
            <span class="material-icons-round" style="color:var(--text-secondary)">person</span>
            Account Info
          </h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-4)">
            <div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px">Name</div>
              <div style="font-weight:var(--font-medium);margin-top:var(--space-1)">${user.name}</div>
            </div>
            <div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px">Email</div>
              <div style="font-weight:var(--font-medium);margin-top:var(--space-1)">${user.email}</div>
            </div>
            <div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px">Phone</div>
              <div style="font-weight:var(--font-medium);margin-top:var(--space-1)">${user.phone}</div>
            </div>
            <div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px">Address</div>
              <div style="font-weight:var(--font-medium);margin-top:var(--space-1)">${user.address}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Events
    document.getElementById('qa-shop')?.addEventListener('click', () => navigate('/catalog'));
    document.getElementById('qa-consult')?.addEventListener('click', () => navigate('/consultation'));
    document.getElementById('qa-pets')?.addEventListener('click', () => navigate('/pets'));
    document.getElementById('qa-orders')?.addEventListener('click', () => navigate('/orders'));
    document.getElementById('qa-cart')?.addEventListener('click', () => navigate('/cart'));
    document.getElementById('qa-rx')?.addEventListener('click', () => navigate('/catalog'));
    document.getElementById('qa-samples')?.addEventListener('click', () => navigate('/samples'));
    document.getElementById('qa-followups')?.addEventListener('click', () => navigate('/followups'));
    document.getElementById('view-all-orders')?.addEventListener('click', () => navigate('/orders'));
    document.querySelectorAll('[data-order-nav]').forEach(el => {
        el.addEventListener('click', () => navigate('/orders'));
    });
}
