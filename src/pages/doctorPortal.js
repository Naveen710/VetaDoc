// ═══════════════════════════════════════════════════
// VetaDoc — Doctor Portal Page
// ═══════════════════════════════════════════════════

import { vets } from '../data/vets.js';
import { formatPrice, formatDate } from '../utils/helpers.js';
import { getDoctorStats, getDoctorAppointments, getDoctorPatients } from '../utils/api.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { navigate } from '../router.js';

let activeTab = 'schedule';
let selectedVet = vets[0];

export default async function renderDoctorPortal(container) {
    container.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar doctor-sidebar">
        <div class="admin-sidebar-brand">
          <div class="logo-icon" style="background:linear-gradient(135deg,#6366f1,#4f46e5)">
            <span class="material-icons-round" style="color:white">medical_services</span>
          </div>
          <div>
            <div class="logo-text">Veta<span>Doc</span></div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Doctor Portal</div>
          </div>
        </div>

        <!-- Doctor Selector -->
        <div style="padding:0 var(--space-4) var(--space-4)">
          <select class="select" id="doctor-selector" style="font-size:var(--text-sm)">
            ${vets.map(v => `<option value="${v.id}">${v.avatar} ${v.name}</option>`).join('')}
          </select>
        </div>

        <nav class="admin-nav">
          <button class="admin-nav-item ${activeTab === 'schedule' ? 'active' : ''}" data-doc-tab="schedule">
            <span class="material-icons-round">calendar_today</span> My Schedule
          </button>
          <button class="admin-nav-item ${activeTab === 'patients' ? 'active' : ''}" data-doc-tab="patients">
            <span class="material-icons-round">folder_shared</span> Patient Records
          </button>
          <button class="admin-nav-item ${activeTab === 'prescriptions' ? 'active' : ''}" data-doc-tab="prescriptions">
            <span class="material-icons-round">medication</span> Prescriptions
          </button>
          <button class="admin-nav-item ${activeTab === 'earnings' ? 'active' : ''}" data-doc-tab="earnings">
            <span class="material-icons-round">account_balance_wallet</span> Earnings
          </button>
          <button class="admin-nav-item ${activeTab === 'profile' ? 'active' : ''}" data-doc-tab="profile">
            <span class="material-icons-round">person</span> My Profile
          </button>
          <div style="flex:1"></div>
          <button class="admin-nav-item" id="doctor-back-btn">
            <span class="material-icons-round">arrow_back</span> Back to Site
          </button>
        </nav>
      </aside>
      <main class="admin-main" id="doctor-main-content">
        <div style="display:flex;align-items:center;justify-content:center;padding:4rem"><div class="loading-spinner"></div></div>
      </main>
    </div>
  `;

    // Tab switching
    document.querySelectorAll('[data-doc-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.docTab;
            document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderDocTab(document.getElementById('doctor-main-content'));
        });
    });

    // Doctor selector
    document.getElementById('doctor-selector')?.addEventListener('change', (e) => {
        selectedVet = vets.find(v => v.id === parseInt(e.target.value)) || vets[0];
        renderDocTab(document.getElementById('doctor-main-content'));
    });

    document.getElementById('doctor-back-btn')?.addEventListener('click', () => navigate('/'));

    await renderDocTab(document.getElementById('doctor-main-content'));
}

async function renderDocTab(el) {
    if (!el) return;
    switch (activeTab) {
        case 'schedule': await renderScheduleTab(el); break;
        case 'patients': await renderPatientsTab(el); break;
        case 'prescriptions': renderPrescriptionsTab(el); break;
        case 'earnings': await renderEarningsTab(el); break;
        case 'profile': renderProfileTab(el); break;
    }
}

async function renderScheduleTab(el) {
    const stats = await getDoctorStats(selectedVet.id);
    const apptData = await getDoctorAppointments(selectedVet.id);

    const s = stats.error ? { todayAppointments: 4, weekAppointments: 18, monthConsultations: 68, completionRate: 96 } : stats;
    const appointments = apptData.error ? [] : (apptData.appointments || []);

    const statusColors = { scheduled: '#3b82f6', 'in-progress': '#f59e0b', completed: '#10b981', cancelled: '#ef4444' };

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Welcome, ${selectedVet.name} ${selectedVet.avatar}</h1>
          <p style="color:var(--text-tertiary);font-size:var(--text-sm)">${selectedVet.specialization} · ${selectedVet.qualifications}</p>
        </div>
        <div style="text-align:right">
          <div style="font-size:var(--text-sm);color:var(--text-tertiary)">${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="admin-stats-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(59,130,246,0.1);color:var(--color-info)">
            <span class="material-icons-round">event</span>
          </div>
          <div>
            <div class="admin-stat-label">Today</div>
            <div class="admin-stat-value">${s.todayAppointments}</div>
            <div class="admin-stat-change neutral">appointments</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(16,185,129,0.1);color:var(--color-primary)">
            <span class="material-icons-round">date_range</span>
          </div>
          <div>
            <div class="admin-stat-label">This Week</div>
            <div class="admin-stat-value">${s.weekAppointments}</div>
            <div class="admin-stat-change neutral">appointments</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(139,92,246,0.1);color:var(--color-secondary)">
            <span class="material-icons-round">trending_up</span>
          </div>
          <div>
            <div class="admin-stat-label">This Month</div>
            <div class="admin-stat-value">${s.monthConsultations}</div>
            <div class="admin-stat-change neutral">consultations</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(245,158,11,0.1);color:var(--color-warning)">
            <span class="material-icons-round">verified</span>
          </div>
          <div>
            <div class="admin-stat-label">Completion</div>
            <div class="admin-stat-value">${s.completionRate}%</div>
            <div class="admin-stat-change positive">rate</div>
          </div>
        </div>
      </div>

      <!-- Today's Appointments -->
      <div class="card" style="padding:var(--space-6);margin-top:var(--space-6)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
          <h3><span class="material-icons-round" style="vertical-align:middle;color:var(--color-info)">today</span> Today's Schedule</h3>
          <span class="badge badge-info">${appointments.length} appointments</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3)">
          ${appointments.map(apt => `
            <div class="doctor-appointment-card">
              <div class="apt-time">
                <span class="material-icons-round" style="font-size:16px">schedule</span>
                ${apt.time}
              </div>
              <div class="apt-info">
                <div style="font-weight:var(--font-semibold)">${apt.petName}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${apt.ownerName} · ${apt.ownerPhone}</div>
                <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:var(--space-1)">${apt.reason}</div>
              </div>
              <div style="display:flex;align-items:center;gap:var(--space-2)">
                <span class="tag">${apt.type === 'Video Call' ? '📹' : '💬'} ${apt.type}</span>
                <span class="badge" style="background:${statusColors[apt.status]}20;color:${statusColors[apt.status]}">${apt.status}</span>
              </div>
              <div style="display:flex;gap:var(--space-2)">
                <button class="btn btn-primary btn-sm" ${apt.status === 'completed' ? 'disabled' : ''}>
                  <span class="material-icons-round" style="font-size:14px">${apt.type === 'Video Call' ? 'videocam' : 'chat'}</span>
                  ${apt.status === 'in-progress' ? 'Continue' : 'Start'}
                </button>
                <button class="btn btn-ghost btn-sm" title="Write Prescription">
                  <span class="material-icons-round" style="font-size:14px">edit_note</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

async function renderPatientsTab(el) {
    const result = await getDoctorPatients(selectedVet.id);
    const patients = result.error ? [] : (result.patients || []);

    const speciesEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', cattle: '🐄', horse: '🐴' };

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Patient Records</h1>
        <div class="navbar-search" style="max-width:300px">
          <span class="material-icons-round search-icon">search</span>
          <input type="text" class="input" placeholder="Search patients..." />
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-4)">
        ${patients.map(p => `
          <div class="card" style="padding:var(--space-5)">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div style="display:flex;gap:var(--space-3);align-items:center">
                <span style="font-size:32px">${speciesEmoji[p.species] || '🐾'}</span>
                <div>
                  <div style="font-weight:var(--font-semibold);font-size:var(--text-lg)">${p.petName}</div>
                  <div style="font-size:var(--text-sm);color:var(--text-secondary)">${p.breed} · Owner: ${p.ownerName}</div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:var(--text-sm);font-weight:var(--font-medium)">${p.visits} visits</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Last: ${formatDate(p.lastVisit)}</div>
              </div>
            </div>
            ${p.notes ? `
              <div style="margin-top:var(--space-3);padding:var(--space-3);background:var(--bg-secondary);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-secondary)">
                <span class="material-icons-round" style="font-size:14px;vertical-align:middle;color:var(--color-info)">notes</span>
                ${p.notes}
              </div>
            ` : ''}
            <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3)">
              <button class="btn btn-secondary btn-sm">
                <span class="material-icons-round" style="font-size:14px">history</span> Full History
              </button>
              <button class="btn btn-ghost btn-sm">
                <span class="material-icons-round" style="font-size:14px">edit_note</span> Add Note
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPrescriptionsTab(el) {
    const prescriptions = [
        { id: 'RX-001', petName: 'Bruno', owner: 'Praveen Kumar', date: '2026-02-09', medicines: ['Cetirizine 10mg - 1 tab daily x 7 days', 'Chlorhexidine Shampoo - 2x/week'], diagnosis: 'Allergic Dermatitis', status: 'active' },
        { id: 'RX-002', petName: 'Max', owner: 'Rahul Mehra', date: '2026-02-01', medicines: ['Glucosamine 500mg - 1 tab daily', 'Omega-3 Fish Oil - 1 cap daily'], diagnosis: 'Hip Dysplasia Management', status: 'active' },
        { id: 'RX-003', petName: 'Coco', owner: 'Anita Desai', date: '2026-01-15', medicines: ['Rabies Vaccine - administered', 'DHPP Booster - administered'], diagnosis: 'Annual Vaccination', status: 'completed' }
    ];

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Prescriptions</h1>
        <button class="btn btn-primary" id="new-rx-btn">
          <span class="material-icons-round">edit_note</span> New Prescription
        </button>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-4)">
        ${prescriptions.map(rx => `
          <div class="card" style="padding:var(--space-5);border-left:3px solid ${rx.status === 'active' ? 'var(--color-primary)' : 'var(--text-tertiary)'}">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-3)">
              <div>
                <div style="font-weight:var(--font-semibold)">${rx.id} · ${rx.petName}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Owner: ${rx.owner} · ${formatDate(rx.date)}</div>
              </div>
              <span class="badge ${rx.status === 'active' ? 'badge-success' : 'badge-neutral'}">${rx.status}</span>
            </div>
            <div style="font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--color-primary);margin-bottom:var(--space-2)">
              Dx: ${rx.diagnosis}
            </div>
            <div style="padding:var(--space-3);background:var(--bg-secondary);border-radius:var(--radius-lg)">
              ${rx.medicines.map(m => `
                <div style="font-size:var(--text-sm);color:var(--text-secondary);padding:var(--space-1) 0">
                  <span class="material-icons-round" style="font-size:14px;vertical-align:middle;color:var(--color-primary)">medication</span>
                  ${m}
                </div>
              `).join('')}
            </div>
            <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3)">
              <button class="btn btn-ghost btn-sm"><span class="material-icons-round" style="font-size:14px">print</span> Print</button>
              <button class="btn btn-ghost btn-sm"><span class="material-icons-round" style="font-size:14px">share</span> Share</button>
              <button class="btn btn-ghost btn-sm"><span class="material-icons-round" style="font-size:14px">edit</span> Edit</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

    document.getElementById('new-rx-btn')?.addEventListener('click', () => {
        openModal('Write Prescription', `
      <div style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="input-group"><label>Patient (Pet Name)</label><input type="text" class="input" placeholder="e.g., Bruno" /></div>
        <div class="input-group"><label>Owner Name</label><input type="text" class="input" placeholder="e.g., Praveen Kumar" /></div>
        <div class="input-group"><label>Diagnosis</label><input type="text" class="input" placeholder="e.g., Allergic Dermatitis" /></div>
        <div class="input-group"><label>Medicines & Instructions</label><textarea class="input" rows="4" placeholder="One medicine per line..."></textarea></div>
        <div class="input-group"><label>Follow-up Date (optional)</label><input type="date" class="input" /></div>
        <div class="input-group"><label>Additional Notes</label><textarea class="input" rows="2" placeholder="Diet recommendations, precautions..."></textarea></div>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
      <button class="btn btn-primary" onclick="document.getElementById('modal-close-btn').click()">
        <span class="material-icons-round">save</span> Save Prescription
      </button>
    `);
    });
}

async function renderEarningsTab(el) {
    const stats = await getDoctorStats(selectedVet.id);
    const s = stats.error ? { totalEarnings: 156000, monthEarnings: 34000, monthConsultations: 68, rating: 4.9 } : stats;

    const monthlyEarnings = [
        { month: 'Sep', earned: 28000 }, { month: 'Oct', earned: 30500 },
        { month: 'Nov', earned: 31200 }, { month: 'Dec', earned: 33800 },
        { month: 'Jan', earned: 32000 }, { month: 'Feb', earned: s.monthEarnings }
    ];
    const maxE = Math.max(...monthlyEarnings.map(d => d.earned));

    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Earnings</h1>
        <select class="select" style="width:auto;font-size:var(--text-sm)">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
          <option>Last 6 Months</option>
        </select>
      </div>

      <div class="admin-stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(16,185,129,0.1);color:var(--color-primary)">
            <span class="material-icons-round">account_balance_wallet</span>
          </div>
          <div>
            <div class="admin-stat-label">Total Earnings</div>
            <div class="admin-stat-value">${formatPrice(s.totalEarnings)}</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(59,130,246,0.1);color:var(--color-info)">
            <span class="material-icons-round">calendar_month</span>
          </div>
          <div>
            <div class="admin-stat-label">This Month</div>
            <div class="admin-stat-value">${formatPrice(s.monthEarnings)}</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:rgba(245,158,11,0.1);color:var(--color-warning)">
            <span class="material-icons-round">per_unit</span>
          </div>
          <div>
            <div class="admin-stat-label">Per Consultation</div>
            <div class="admin-stat-value">${formatPrice(selectedVet.consultationFee)}</div>
          </div>
        </div>
      </div>

      <!-- Earnings Chart -->
      <div class="card" style="padding:var(--space-6);margin-top:var(--space-6)">
        <h3 style="margin-bottom:var(--space-4)">Monthly Earnings</h3>
        <div class="mini-chart">
          ${monthlyEarnings.map(d => `
            <div class="mini-chart-bar-wrap">
              <div class="mini-chart-bar" style="height:${(d.earned / maxE) * 100}%;background:var(--gradient-primary)">
                <div class="mini-chart-tooltip">${formatPrice(d.earned)}</div>
              </div>
              <span class="mini-chart-label">${d.month}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="card" style="padding:var(--space-6);margin-top:var(--space-6)">
        <h3 style="margin-bottom:var(--space-4)">Recent Earnings</h3>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Date</th><th>Patient</th><th>Type</th><th>Amount</th></tr></thead>
            <tbody>
              <tr><td>Feb 13</td><td>Bruno (Praveen)</td><td>Video Call</td><td style="font-weight:var(--font-bold);color:var(--color-primary)">${formatPrice(selectedVet.consultationFee)}</td></tr>
              <tr><td>Feb 12</td><td>Coco (Anita)</td><td>Video Call</td><td style="font-weight:var(--font-bold);color:var(--color-primary)">${formatPrice(selectedVet.consultationFee)}</td></tr>
              <tr><td>Feb 11</td><td>Max (Rahul)</td><td>Chat</td><td style="font-weight:var(--font-bold);color:var(--color-primary)">${formatPrice(Math.round(selectedVet.consultationFee * 0.7))}</td></tr>
              <tr><td>Feb 10</td><td>Daisy (Sanya)</td><td>Video Call</td><td style="font-weight:var(--font-bold);color:var(--color-primary)">${formatPrice(selectedVet.consultationFee)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderProfileTab(el) {
    el.innerHTML = `
    <div class="admin-content">
      <div class="admin-header"><h1>My Profile</h1></div>
      
      <div style="max-width:600px;display:flex;flex-direction:column;gap:var(--space-6)">
        <div class="card" style="padding:var(--space-6)">
          <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-6)">
            <div class="avatar avatar-lg" style="font-size:40px">${selectedVet.avatar}</div>
            <div>
              <h2>${selectedVet.name}</h2>
              <div style="color:var(--text-secondary);font-size:var(--text-sm)">${selectedVet.specialization}</div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${selectedVet.qualifications}</div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
            <div class="input-group"><label>Experience</label><input type="text" class="input" value="${selectedVet.experience} years" /></div>
            <div class="input-group"><label>Consultation Fee</label><input type="text" class="input" value="₹${selectedVet.consultationFee}" /></div>
            <div class="input-group"><label>Languages</label><input type="text" class="input" value="${selectedVet.languages.join(', ')}" /></div>
            <div class="input-group"><label>Rating</label><input type="text" class="input" value="${selectedVet.rating} ★ (${selectedVet.reviews} reviews)" disabled /></div>
          </div>
          <div class="input-group" style="margin-top:var(--space-4)">
            <label>About</label>
            <textarea class="input" rows="3">${selectedVet.about}</textarea>
          </div>
          <button class="btn btn-primary" style="margin-top:var(--space-4)">Save Profile</button>
        </div>

        <div class="card" style="padding:var(--space-6)">
          <h3 style="margin-bottom:var(--space-4)">Availability Schedule</h3>
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${selectedVet.availability.map(a => `
              <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-secondary);border-radius:var(--radius-lg)">
                <span style="font-weight:var(--font-semibold);width:40px">${a.day}</span>
                <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
                  ${a.slots.map(s => `<span class="tag">${s}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
