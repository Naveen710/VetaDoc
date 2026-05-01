// ═══════════════════════════════════════════════════
// VetaDoc — Admin Portal Page
// ═══════════════════════════════════════════════════

import { formatPrice, formatDate } from '../utils/helpers.js';
import { getAdminStats, getRevenueChart, getTopProducts, getAdminUsers, getSampleCollections, updateUserStatus } from '../utils/api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

let activeTab = 'overview';

export default async function renderAdminPortal(container) {
    container.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-brand">
          <div class="logo-icon" style="background:var(--gradient-primary)">
            <span class="material-icons-round" style="color:white">admin_panel_settings</span>
          </div>
          <div>
            <div class="logo-text">Veta<span>Doc</span></div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Admin Portal</div>
          </div>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${activeTab === 'overview' ? 'active' : ''}" data-admin-tab="overview">
            <span class="material-icons-round">dashboard</span> Overview
          </button>
          <button class="admin-nav-item ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">
            <span class="material-icons-round">receipt_long</span> Orders
          </button>
          <button class="admin-nav-item ${activeTab === 'products' ? 'active' : ''}" data-admin-tab="products">
            <span class="material-icons-round">inventory_2</span> Products
          </button>
          <button class="admin-nav-item ${activeTab === 'users' ? 'active' : ''}" data-admin-tab="users">
            <span class="material-icons-round">people</span> Users
          </button>
          <button class="admin-nav-item ${activeTab === 'consultations' ? 'active' : ''}" data-admin-tab="consultations">
            <span class="material-icons-round">video_call</span> Consultations
          </button>
          <button class="admin-nav-item ${activeTab === 'samples' ? 'active' : ''}" data-admin-tab="samples">
            <span class="material-icons-round">science</span> Sample Collections
          </button>
          <button class="admin-nav-item ${activeTab === 'settings' ? 'active' : ''}" data-admin-tab="settings">
            <span class="material-icons-round">settings</span> Settings
          </button>
          <div style="flex:1"></div>
          <button class="admin-nav-item" id="admin-back-btn">
            <span class="material-icons-round">arrow_back</span> Back to Site
          </button>
        </nav>
      </aside>
      <main class="admin-main" id="admin-main-content">
        <div style="display:flex;align-items:center;justify-content:center;padding:4rem"><div class="loading-spinner"></div></div>
      </main>
    </div>
  `;

    // Tab switching
    document.querySelectorAll('[data-admin-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.adminTab;
            document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderActiveTab(document.getElementById('admin-main-content'));
        });
    });

    document.getElementById('admin-back-btn')?.addEventListener('click', () => navigate('/'));

    // Render initial tab
    await renderActiveTab(document.getElementById('admin-main-content'));
}

async function renderActiveTab(mainEl) {
    if (!mainEl) return;

    switch (activeTab) {
        case 'overview': await renderOverview(mainEl); break;
        case 'orders': renderOrdersTab(mainEl); break;
        case 'products': renderProductsTab(mainEl); break;
        case 'users': await renderUsersTab(mainEl); break;
        case 'consultations': renderConsultationsTab(mainEl); break;
        case 'samples': await renderSamplesTab(mainEl); break;
        case 'settings': renderSettingsTab(mainEl); break;
    }
}

async function renderOverview(el) {
    const stats = await getAdminStats();
    const chart = await getRevenueChart();
    const topProds = await getTopProducts();

    const s = stats.error ? { totalRevenue: 2847500, monthlyRevenue: 342800, totalOrders: 1247, activeOrders: 89, totalUsers: 5230, totalPets: 8450, revenueGrowth: 12.5, orderGrowth: 8.3, userGrowth: 15.2 } : stats;
    const chartData = chart.error ? [{ month: 'Sep', revenue: 245000 }, { month: 'Oct', revenue: 268000 }, { month: 'Nov', revenue: 289000 }, { month: 'Dec', revenue: 312000 }, { month: 'Jan', revenue: 298000 }, { month: 'Feb', revenue: 342800 }] : chart;
    const prods = topProds.error ? [] : topProds;

    const maxRev = Math.max(...chartData.map(d => d.revenue));

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Dashboard Overview</h1>
        <div style="font-size:var(--text-sm);color:var(--text-tertiary)">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <!-- Stat Cards -->
      <div class="admin-stats-grid">
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(16,185,129,0.1);color:var(--color-primary)">
            <span class="material-icons-round">account_balance_wallet</span>
          </div>
          <div>
            <div class="admin-stat-label">Total Revenue</div>
            <div class="admin-stat-value">${formatPrice(s.totalRevenue)}</div>
            <div class="admin-stat-change positive">↑ ${s.revenueGrowth}% vs last month</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(59,130,246,0.1);color:var(--color-info)">
            <span class="material-icons-round">shopping_bag</span>
          </div>
          <div>
            <div class="admin-stat-label">Total Orders</div>
            <div class="admin-stat-value">${s.totalOrders.toLocaleString()}</div>
            <div class="admin-stat-change positive">↑ ${s.orderGrowth}% · ${s.activeOrders} active</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(139,92,246,0.1);color:var(--color-secondary)">
            <span class="material-icons-round">people</span>
          </div>
          <div>
            <div class="admin-stat-label">Total Users</div>
            <div class="admin-stat-value">${s.totalUsers.toLocaleString()}</div>
            <div class="admin-stat-change positive">↑ ${s.userGrowth}% growth</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(245,158,11,0.1);color:var(--color-warning)">
            <span class="material-icons-round">pets</span>
          </div>
          <div>
            <div class="admin-stat-label">Total Pets</div>
            <div class="admin-stat-value">${s.totalPets.toLocaleString()}</div>
            <div class="admin-stat-change neutral">Registered</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:var(--space-6);margin-top:var(--space-6)">
        <!-- Revenue Chart -->
        <div class="card" style="padding:var(--space-6)">
          <h3 style="margin-bottom:var(--space-4)">Revenue Trend</h3>
          <div class="mini-chart">
            ${chartData.map(d => `
              <div class="mini-chart-bar-wrap">
                <div class="mini-chart-bar" style="height:${(d.revenue / maxRev) * 100}%">
                  <div class="mini-chart-tooltip">${formatPrice(d.revenue)}</div>
                </div>
                <span class="mini-chart-label">${d.month}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Top Products -->
        <div class="card" style="padding:var(--space-6)">
          <h3 style="margin-bottom:var(--space-4)">Top Products</h3>
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${prods.slice(0, 5).map((p, i) => `
              <div style="display:flex;align-items:center;gap:var(--space-3)">
                <span style="font-size:var(--text-xs);color:var(--text-tertiary);width:16px">${i + 1}.</span>
                <div style="flex:1">
                  <div style="font-size:var(--text-sm);font-weight:var(--font-medium)">${p.name}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${p.sales} sales</div>
                </div>
                <span style="font-size:var(--text-sm);font-weight:var(--font-bold)">${formatPrice(p.revenue)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Monthly Revenue -->
      <div class="card" style="padding:var(--space-6);margin-top:var(--space-6)">
        <h3 style="margin-bottom:var(--space-2)">This Month</h3>
        <div style="font-size:var(--text-3xl);font-weight:var(--font-extrabold);color:var(--color-primary)">${formatPrice(s.monthlyRevenue)}</div>
        <div style="font-size:var(--text-sm);color:var(--text-tertiary);margin-top:var(--space-1)">Monthly Revenue · February 2026</div>
      </div>
    </div>
  `;
}

function renderOrdersTab(el) {
    const orders = [
        { id: 'VD-2026-00201', customer: 'Praveen Kumar', items: 3, total: 1380, date: '2026-02-11', status: 'processing' },
        { id: 'VD-2026-00183', customer: 'Praveen Kumar', items: 3, total: 924, date: '2026-02-10', status: 'shipped' },
        { id: 'VD-2026-00147', customer: 'Praveen Kumar', items: 2, total: 1148, date: '2026-02-08', status: 'delivered' },
        { id: 'VD-2026-00142', customer: 'Anita Desai', items: 1, total: 599, date: '2026-02-07', status: 'delivered' },
        { id: 'VD-2026-00138', customer: 'Rahul Mehra', items: 4, total: 2150, date: '2026-02-06', status: 'delivered' },
        { id: 'VD-2026-00135', customer: 'Vikram Patel', items: 2, total: 780, date: '2026-02-05', status: 'cancelled' }
    ];

    const statusColors = { processing: 'var(--color-warning)', shipped: 'var(--color-info)', delivered: 'var(--color-success)', cancelled: 'var(--color-error)' };

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Orders Management</h1>
        <div style="display:flex;gap:var(--space-2)">
          <select class="select" style="width:auto;font-size:var(--text-sm)">
            <option>All Orders</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td style="font-weight:var(--font-semibold)">${o.id}</td>
                <td>${o.customer}</td>
                <td>${o.items}</td>
                <td style="font-weight:var(--font-bold)">${formatPrice(o.total)}</td>
                <td style="font-size:var(--text-xs);color:var(--text-tertiary)">${formatDate(o.date)}</td>
                <td><span class="badge" style="background:${statusColors[o.status]}20;color:${statusColors[o.status]}">${o.status}</span></td>
                <td>
                  <button class="btn btn-ghost btn-sm"><span class="material-icons-round" style="font-size:16px">visibility</span></button>
                  <button class="btn btn-ghost btn-sm"><span class="material-icons-round" style="font-size:16px">edit</span></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderProductsTab(el) {
    const products = [
        { name: 'Amoxicillin 250mg', category: 'Antibiotics', price: 349, stock: 145, status: 'active' },
        { name: 'Canine Rabies Vaccine', category: 'Vaccines', price: 299, stock: 78, status: 'active' },
        { name: 'Omega-3 Fish Oil', category: 'Supplements', price: 599, stock: 234, status: 'active' },
        { name: 'Praziquantel Tabs', category: 'Dewormers', price: 189, stock: 312, status: 'active' },
        { name: 'Fipronil Spot-On', category: 'Anti-parasitic', price: 350, stock: 8, status: 'low-stock' },
        { name: 'Ketoprofen Injection', category: 'Pain Relief', price: 180, stock: 0, status: 'out-of-stock' }
    ];

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Products Management</h1>
        <button class="btn btn-primary"><span class="material-icons-round">add</span> Add Product</button>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td style="font-weight:var(--font-medium)">${p.name}</td>
                <td><span class="tag">${p.category}</span></td>
                <td style="font-weight:var(--font-bold)">${formatPrice(p.price)}</td>
                <td>${p.stock}</td>
                <td>
                  <span class="badge ${p.status === 'active' ? 'badge-success' : p.status === 'low-stock' ? 'badge-warning' : 'badge-error'}">
                    ${p.status.replace('-', ' ')}
                  </span>
                </td>
                <td>
                  <button class="btn btn-ghost btn-sm"><span class="material-icons-round" style="font-size:16px">edit</span></button>
                  <button class="btn btn-ghost btn-sm" style="color:var(--color-error)"><span class="material-icons-round" style="font-size:16px">delete</span></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderUsersTab(el) {
    const result = await getAdminUsers();
    const users = result.error ? [] : (result.users || []);

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Users (${users.length})</h1>
        <div class="navbar-search" style="max-width:300px">
          <span class="material-icons-round search-icon">search</span>
          <input type="text" class="input" placeholder="Search users..." />
        </div>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Pets</th>
              <th>Orders</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td style="font-weight:var(--font-medium)">${u.name}</td>
                <td style="font-size:var(--text-xs);color:var(--text-secondary)">${u.email}</td>
                <td>${u.pets}</td>
                <td>${u.orders}</td>
                <td style="font-size:var(--text-xs);color:var(--text-tertiary)">${formatDate(u.joinDate)}</td>
                <td><span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-neutral'}">${u.status}</span></td>
                <td>
                  <button class="btn btn-ghost btn-sm"><span class="material-icons-round" style="font-size:16px">visibility</span></button>
                  <button class="btn btn-ghost btn-sm"><span class="material-icons-round" style="font-size:16px">mail</span></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderConsultationsTab(el) {
    const consultations = [
        { id: 'VC-001', vet: 'Dr. Priya Sharma', pet: 'Bruno', owner: 'Praveen', date: '2026-02-13', time: '10:00', type: 'Video Call', status: 'upcoming' },
        { id: 'VC-002', vet: 'Dr. Sneha Gupta', pet: 'Luna', owner: 'Praveen', date: '2026-02-09', time: '14:00', type: 'Video Call', status: 'completed' },
        { id: 'VC-003', vet: 'Dr. Arjun Reddy', pet: 'Max', owner: 'Rahul', date: '2026-02-14', time: '11:00', type: 'Chat', status: 'upcoming' },
        { id: 'VC-004', vet: 'Dr. Vikram Singh', pet: 'Ganga', owner: 'Vikram', date: '2026-02-15', time: '09:00', type: 'Video Call', status: 'upcoming' }
    ];

    const statusColors = { upcoming: 'var(--color-info)', 'in-progress': 'var(--color-warning)', completed: 'var(--color-success)', cancelled: 'var(--color-error)' };

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Consultations</h1>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Veterinarian</th>
              <th>Pet</th>
              <th>Owner</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${consultations.map(c => `
              <tr>
                <td style="font-weight:var(--font-semibold)">${c.id}</td>
                <td>${c.vet}</td>
                <td>${c.pet}</td>
                <td>${c.owner}</td>
                <td style="font-size:var(--text-xs)">${formatDate(c.date)} ${c.time}</td>
                <td><span class="tag">${c.type}</span></td>
                <td><span class="badge" style="background:${statusColors[c.status]}20;color:${statusColors[c.status]}">${c.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderSamplesTab(el) {
    const result = await getSampleCollections();
    const collections = result.error ? [] : (result.collections || []);

    const statusColors = { scheduled: 'var(--color-info)', 'in-transit': 'var(--color-warning)', 'at-lab': 'var(--color-secondary)', completed: 'var(--color-success)' };

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Sample Collections</h1>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pet</th>
              <th>Owner</th>
              <th>Sample Type</th>
              <th>Date & Time</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${collections.map(c => `
              <tr>
                <td style="font-weight:var(--font-semibold)">${c.id}</td>
                <td>${c.petName}</td>
                <td>${c.ownerName}</td>
                <td>${c.sampleType}</td>
                <td style="font-size:var(--text-xs)">${c.date} ${c.timeSlot}</td>
                <td style="font-size:var(--text-xs);max-width:150px;overflow:hidden;text-overflow:ellipsis">${c.address}</td>
                <td><span class="badge" style="background:${statusColors[c.status] || 'var(--text-tertiary)'}20;color:${statusColors[c.status] || 'var(--text-tertiary)'}">${c.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSettingsTab(el) {
    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Settings</h1>
      </div>

      <div style="display:grid;gap:var(--space-6);max-width:600px">
        <div class="card" style="padding:var(--space-6)">
          <h3 style="margin-bottom:var(--space-4)">
            <span class="material-icons-round" style="vertical-align:middle;color:#25D366">chat</span>
            WhatsApp Integration
          </h3>
          <div style="display:flex;flex-direction:column;gap:var(--space-4)">
            <div class="input-group">
              <label>Business Phone Number</label>
              <input type="text" class="input" value="+91 98765 43210" />
            </div>
            <div class="input-group">
              <label>WhatsApp API Status</label>
              <div style="display:flex;align-items:center;gap:var(--space-2)">
                <span class="badge badge-warning">⚠️ Demo Mode</span>
                <span style="font-size:var(--text-xs);color:var(--text-tertiary)">Configure API credentials in server/.env</span>
              </div>
            </div>
            <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
              <input type="checkbox" checked /> Send booking confirmations
            </label>
            <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
              <input type="checkbox" checked /> Send vaccine reminders
            </label>
            <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
              <input type="checkbox" checked /> Send order updates
            </label>
          </div>
        </div>

        <div class="card" style="padding:var(--space-6)">
          <h3 style="margin-bottom:var(--space-4)">
            <span class="material-icons-round" style="vertical-align:middle;color:var(--color-info)">notifications</span>
            Notification Settings
          </h3>
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
              <input type="checkbox" checked /> Browser push notifications
            </label>
            <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
              <input type="checkbox" checked /> Vaccine reminder notifications
            </label>
            <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
              <input type="checkbox" checked /> Follow-up reminders
            </label>
            <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
              <input type="checkbox" /> Email notifications
            </label>
          </div>
        </div>

        <div class="card" style="padding:var(--space-6)">
          <h3 style="margin-bottom:var(--space-4)">
            <span class="material-icons-round" style="vertical-align:middle;color:var(--text-secondary)">business</span>
            Business Info
          </h3>
          <div style="display:flex;flex-direction:column;gap:var(--space-4)">
            <div class="input-group">
              <label>Business Name</label>
              <input type="text" class="input" value="VetaDoc" />
            </div>
            <div class="input-group">
              <label>Support Email</label>
              <input type="email" class="input" value="support@vetadoc.in" />
            </div>
            <div class="input-group">
              <label>Support Phone</label>
              <input type="tel" class="input" value="+91 98765 43210" />
            </div>
            <button class="btn btn-primary">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
