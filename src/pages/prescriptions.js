// ═══════════════════════════════════════════════════
// VetaDoc — My prescriptions
// ═══════════════════════════════════════════════════

import { getState, subscribe } from '../store.js';
import { formatDate } from '../utils/helpers.js';
import { navigate } from '../router.js';

const STATUS = {
  issued: { label: 'Issued by vet', cls: 'due' },
  uploaded: { label: 'Waiting for pharmacist', cls: 'due' },
  verified: { label: 'Verified', cls: 'done' },
  dispensed: { label: 'Dispensed', cls: 'upcoming' },
  rejected: { label: 'Rejected', cls: 'overdue' },
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default function renderPrescriptions(container) {
  function render() {
    const list = getState().prescriptions || [];
    container.innerHTML = `
      <div class="page-container">
        <div class="section-head">
          <div>
            <div class="section-kicker">Pharmacy</div>
            <h1 class="section-title">Prescriptions</h1>
            <p class="section-sub">Every prescription from a VetaDoc vet, plus the ones you uploaded. Rx medicines ship only against a verified prescription.</p>
          </div>
          <button class="btn btn-primary" id="rx-shop"><span class="material-icons-round">storefront</span> Shop medicines</button>
        </div>
        ${list.length ? `<div style="display:grid;gap:var(--space-4)">
          ${list.map(rx => `
            <article class="card" style="padding:var(--space-5)">
              <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start">
                <div>
                  <div style="font-weight:700;font-family:var(--font-display);font-size:1.05rem">${esc(rx.id)} · ${esc(rx.petName || 'Animal')}</div>
                  <div class="tl-meta">${formatDate(rx.date)} · ${rx.source === 'upload' ? 'Uploaded by you' : 'VetaDoc consult'}${rx.vetName ? ` · ${esc(rx.vetName)}` : ''}${rx.vetRegNo ? ` (${esc(rx.vetRegNo)})` : ''}</div>
                </div>
                <span class="pill ${STATUS[rx.status]?.cls || 'upcoming'}">${STATUS[rx.status]?.label || esc(rx.status)}</span>
              </div>
              ${(rx.items || []).length ? `<ul style="margin:12px 0 0 18px;font-size:var(--text-sm);color:var(--text-secondary);display:grid;gap:4px">
                ${rx.items.map(i => `<li><b style="color:var(--text-primary)">${esc(i.name)}</b>${i.dose ? ` — ${esc(i.dose)}` : ''}${i.days ? `, ${i.days} days` : ''}</li>`).join('')}
              </ul>` : ''}
              ${rx.notes ? `<p style="font-size:var(--text-sm);margin-top:10px">${esc(rx.notes)}</p>` : ''}
              ${rx.status === 'rejected' && rx.reviewNote ? `<p style="font-size:var(--text-sm);margin-top:10px;color:#c2410c">Pharmacist: ${esc(rx.reviewNote)}</p>` : ''}
              ${rx.file?.url ? `<a class="btn btn-ghost btn-sm" style="margin-top:10px" href="${esc(rx.file.url)}" target="_blank" rel="noopener"><span class="material-icons-round">attach_file</span> ${esc(rx.file.name || 'View file')}</a>` : ''}
            </article>`).join('')}
        </div>` : `<div class="empty-state"><span class="material-icons-round">medication</span><h3>No prescriptions yet</h3><p>After a consult your vet's e-prescription appears here.</p></div>`}
      </div>`;
    document.getElementById('rx-shop')?.addEventListener('click', () => navigate('/catalog'));
  }
  render();
  const unsub = subscribe(render);
  return () => unsub();
}
