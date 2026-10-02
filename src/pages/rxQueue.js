// ═══════════════════════════════════════════════════
// VetaDoc — Pharmacist prescription verification queue
// ═══════════════════════════════════════════════════

import { getState, updatePrescription, updateOrder } from '../store.js';
import { getRxQueue, reviewPrescription } from '../utils/api.js';
import { formatDate } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CHECKS = [
  'Vet name and registration number are visible',
  'Prescription is dated within the last 6 months',
  'Animal, species and weight match the order',
  'Drug, strength, dose and duration are clear and safe for the species',
  'Food animals: withdrawal period noted for the owner',
];

export async function renderRxQueue(el) {
  let view = 'pending';

  async function draw() {
    el.innerHTML = `<div style="display:flex;justify-content:center;padding:4rem"><div class="loading-spinner"></div></div>`;
    const { prescriptions = [], error } = await getRxQueue(view);
    const orders = getState().orders || [];
    el.innerHTML = `<div class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Prescription checks</h1>
          <p style="color:var(--text-secondary);font-size:var(--text-sm)">Rx orders are held until a pharmacist approves the prescription. Approving releases linked orders for packing.</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn ${view === 'pending' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-view="pending">Pending</button>
          <button class="btn ${view === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-view="all">All</button>
        </div>
      </div>
      ${error ? `<div class="demo-note">Could not load: ${esc(error)}</div>` : ''}
      ${prescriptions.length ? `<div style="display:grid;gap:16px;margin-top:16px">
        ${prescriptions.map(rx => {
          const linked = orders.filter(o => o.rxId === rx.id);
          const pending = ['uploaded', 'issued'].includes(rx.status);
          return `
          <article class="card" style="padding:20px;display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,300px);gap:20px">
            <div>
              <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">
                <div style="font-weight:700;font-family:var(--font-display)">${esc(rx.id)} · ${esc(rx.petName || 'Animal')}</div>
                <span class="pill ${pending ? 'due' : rx.status === 'rejected' ? 'overdue' : 'done'}">${esc(rx.status)}</span>
              </div>
              <div class="tl-meta">${formatDate(rx.date)} · ${rx.source === 'upload' ? 'Customer upload' : 'VetaDoc e-Rx'} · ${esc(rx.vetName || 'Vet not stated')}${rx.vetRegNo ? ` (${esc(rx.vetRegNo)})` : ''}</div>
              <ul style="margin:10px 0 0 18px;font-size:var(--text-sm);display:grid;gap:4px">${(rx.items || []).map(i => `<li>${esc(i.name)}${i.dose ? ` — ${esc(i.dose)}` : ''}</li>`).join('')}</ul>
              ${linked.length ? `<div class="tl-meta" style="margin-top:8px">Linked orders: ${linked.map(o => `${esc(o.id)} (${esc(o.status)})`).join(', ')}</div>` : ''}
              ${rx.file?.url ? `<a class="btn btn-ghost btn-sm" style="margin-top:8px" href="${esc(rx.file.url)}" target="_blank" rel="noopener"><span class="material-icons-round">attach_file</span> Open prescription file</a>` : ''}
            </div>
            ${pending ? `
            <div style="border-left:1px solid var(--border-color);padding-left:20px">
              <div style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:8px">Checklist</div>
              ${CHECKS.map((c, i) => `<label style="display:flex;gap:8px;font-size:var(--text-sm);margin-bottom:6px"><input type="checkbox" data-check="${rx.id}" /> ${c}</label>`).join('')}
              <textarea class="input" rows="2" id="note-${rx.id}" placeholder="Note to customer (required if rejecting)" style="margin:8px 0"></textarea>
              <div style="display:flex;gap:8px">
                <button class="btn btn-primary btn-sm" style="flex:1" data-approve="${rx.id}">Approve</button>
                <button class="btn btn-secondary btn-sm" style="flex:1;color:var(--color-error)" data-reject="${rx.id}">Reject</button>
              </div>
            </div>` : `<div class="tl-meta" style="align-self:center">${rx.reviewedBy ? `Reviewed by ${esc(rx.reviewedBy)}` : ''}${rx.reviewNote ? ` · ${esc(rx.reviewNote)}` : ''}</div>`}
          </article>`;
        }).join('')}
      </div>` : `<div class="empty-state"><span class="material-icons-round">task_alt</span><h3>Nothing waiting</h3><p>New uploads and vet e-prescriptions appear here.</p></div>`}</div>`;

    el.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { view = b.dataset.view; draw(); }));
    el.querySelectorAll('[data-approve]').forEach(b => b.addEventListener('click', () => decide(b.dataset.approve, 'verified')));
    el.querySelectorAll('[data-reject]').forEach(b => b.addEventListener('click', () => decide(b.dataset.reject, 'rejected')));
  }

  async function decide(rxId, decision) {
    const note = document.getElementById(`note-${rxId}`)?.value.trim() || '';
    const checks = [...el.querySelectorAll(`[data-check="${rxId}"]`)];
    if (decision === 'verified' && checks.some(c => !c.checked)) { showToast('Checklist incomplete', 'Tick every check before approving', 'warning'); return; }
    if (decision === 'rejected' && !note) { showToast('Add a note', 'Tell the customer why it was rejected', 'warning'); return; }
    const res = await reviewPrescription(rxId, decision, note);
    if (res?.error) { showToast('Could not save', res.error, 'error'); return; }
    if (res?.mode === 'demo' || res?.demo) {
      // Demo: apply locally (in Firebase mode the function does this server-side).
      const reviewer = getState().session?.name || 'Pharmacist';
      updatePrescription(rxId, { status: decision, reviewNote: note, reviewedBy: reviewer, reviewedAt: new Date().toISOString() });
      (getState().orders || []).filter(o => o.rxId === rxId && o.status === 'awaiting_rx').forEach(o => {
        const tracking = (o.tracking || []).map(t => (t.status === 'Prescription check' ? { ...t, completed: decision === 'verified', time: new Date().toLocaleString('en-IN'), detail: decision === 'verified' ? 'Prescription verified by pharmacist' : `Rejected: ${note}` } : t));
        updateOrder(o.id, { status: decision === 'verified' ? 'processing' : 'rx_rejected', tracking });
      });
    }
    showToast(decision === 'verified' ? 'Approved' : 'Rejected', `${rxId} updated`, decision === 'verified' ? 'success' : 'info');
    draw();
  }

  await draw();
}
