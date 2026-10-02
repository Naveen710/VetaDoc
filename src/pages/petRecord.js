// ═══════════════════════════════════════════════════
// VetaDoc — Pet health record (EMR) + vaccine planner
// Route: #/pets/<petId>
// ═══════════════════════════════════════════════════

import { getState, updatePet, addHealthRecord, removeHealthRecord, subscribe } from '../store.js';
import { buildSchedule, SUPPORTED_SPECIES, petBirthDate } from '../../shared/vaccineSchedules.js';
import { formatDate, generateId } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

const RECORD_TYPES = {
  visit: { label: 'Vet visit', icon: 'medical_services' },
  vaccine: { label: 'Vaccination', icon: 'vaccines' },
  deworming: { label: 'Deworming', icon: 'bug_report' },
  weight: { label: 'Weight', icon: 'monitor_weight' },
  lab: { label: 'Lab result', icon: 'science' },
  note: { label: 'Note', icon: 'edit_note' },
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function ageText(pet) {
  const dob = petBirthDate(pet);
  const months = Math.max(0, Math.floor((Date.now() - dob) / (30.44 * 864e5)));
  if (months < 1) return 'Under 1 month';
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`;
  return `${Math.floor(months / 12)} years`;
}

/** Inline SVG weight trend from weight records (oldest → newest). */
function weightChart(records) {
  const pts = records.filter(r => r.type === 'weight' && Number(r.value)).sort((a, b) => a.date.localeCompare(b.date));
  if (pts.length < 2) return `<p class="tl-meta">Add at least two weights to see the trend.</p>`;
  const W = 320, H = 90, pad = 18;
  const vals = pts.map(p => Number(p.value));
  const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1;
  const t0 = Date.parse(pts[0].date), t1 = Date.parse(pts.at(-1).date), ts = t1 - t0 || 1;
  const x = d => pad + ((Date.parse(d) - t0) / ts) * (W - 2 * pad);
  const y = v => H - pad - ((v - lo) / span) * (H - 2 * pad);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const last = pts.at(-1), first = pts[0];
  const delta = (Number(last.value) - Number(first.value)).toFixed(1);
  return `
    <svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight trend from ${first.value} to ${last.value} kg">
      <path d="${path}" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map(p => `<circle cx="${x(p.date).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="3.5" fill="var(--bg-card)" stroke="var(--color-primary)" stroke-width="2"><title>${formatDate(p.date)}: ${p.value} kg</title></circle>`).join('')}
    </svg>
    <div class="tl-meta">${formatDate(first.date)} → ${formatDate(last.date)} · ${delta >= 0 ? '+' : ''}${delta} kg</div>`;
}

export default function renderPetRecord(container, params) {
  const petId = params[0];
  let filter = 'all';

  function render() {
    const pet = getState().pets.find(p => p.id === petId);
    if (!pet) {
      container.innerHTML = `<div class="page-container"><div class="empty-state"><span class="material-icons-round">pets</span><h3>Animal not found</h3><button class="btn btn-primary" onclick="location.hash='/pets'">Back to my animals</button></div></div>`;
      return;
    }
    const records = [...(pet.records || [])].sort((a, b) => b.date.localeCompare(a.date));
    const shown = filter === 'all' ? records : records.filter(r => r.type === filter);
    const schedule = buildSchedule(pet);
    const supported = SUPPORTED_SPECIES.includes(pet.species);
    const nextItems = schedule.filter(s => s.status !== 'done');
    const overdue = schedule.filter(s => s.status === 'overdue').length;

    container.innerHTML = `
      <div class="page-container">
        <button class="btn btn-ghost btn-sm" id="back-btn" style="margin-bottom:var(--space-4)"><span class="material-icons-round">arrow_back</span> My animals</button>

        <section class="card" style="padding:var(--space-6);display:flex;gap:var(--space-6);align-items:center;flex-wrap:wrap;margin-bottom:var(--space-6)">
          <div class="hv-avatar" style="width:72px;height:72px;font-size:40px;border-radius:20px">${pet.emoji || '🐾'}</div>
          <div style="flex:1;min-width:220px">
            <h1 style="font-size:1.75rem">${esc(pet.name)}</h1>
            <div style="color:var(--text-secondary)">${esc(pet.breed)} · ${esc(pet.gender)} · ${ageText(pet)} · ${pet.weight} kg</div>
            <div class="hv-chips" style="margin-top:10px">
              ${(pet.allergies || []).map(a => `<span class="hv-chip warn">Allergy: ${esc(a)}</span>`).join('')}
              ${(pet.conditions || []).map(c => `<span class="hv-chip">${esc(c)}</span>`).join('')}
              ${!(pet.allergies || []).length ? '<span class="hv-chip" style="background:var(--bg-tertiary);color:var(--text-secondary)">No known allergies</span>' : ''}
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary" id="edit-profile-btn"><span class="material-icons-round">edit</span> Edit profile</button>
            <button class="btn btn-primary" id="add-record-btn"><span class="material-icons-round">add</span> Add record</button>
          </div>
        </section>

        <div style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:var(--space-6)" class="emr-grid">
          <section>
            <div class="section-head" style="margin-bottom:var(--space-4)">
              <div>
                <div class="section-kicker">Health record</div>
                <h2 class="section-title" style="font-size:1.35rem">Timeline</h2>
              </div>
              <div class="species-row" style="gap:6px">
                ${['all', ...Object.keys(RECORD_TYPES)].map(t => `<button class="tag ${filter === t ? 'active' : ''}" data-filter="${t}">${t === 'all' ? 'All' : RECORD_TYPES[t].label}</button>`).join('')}
              </div>
            </div>
            ${shown.length ? `
              <div class="timeline">
                ${shown.map(r => `
                  <div class="tl-item ${r.type}">
                    <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
                      <div>
                        <div style="font-weight:600;display:flex;align-items:center;gap:6px">
                          <span class="material-icons-round" style="font-size:18px;color:var(--text-tertiary)">${RECORD_TYPES[r.type]?.icon || 'description'}</span>
                          ${esc(r.title || RECORD_TYPES[r.type]?.label)}${r.type === 'weight' ? ` · ${r.value} kg` : ''}
                        </div>
                        ${r.notes ? `<div style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:4px">${esc(r.notes)}</div>` : ''}
                        <div class="tl-meta" style="margin-top:4px">${formatDate(r.date)}${r.vetName ? ` · ${esc(r.vetName)}` : ''}${r.withdrawalDays ? ` · milk safe after ${formatDate(new Date(Date.parse(r.date) + r.withdrawalDays * 864e5))}` : ''}</div>
                      </div>
                      <button class="btn-icon" data-del="${r.id}" title="Delete record"><span class="material-icons-round" style="font-size:18px">delete_outline</span></button>
                    </div>
                  </div>`).join('')}
              </div>` : `<div class="empty-state" style="padding:var(--space-8)"><span class="material-icons-round">history_edu</span><h3>No records yet</h3><p>Add a visit, vaccine, weight or lab result.</p></div>`}
          </section>

          <aside style="display:flex;flex-direction:column;gap:var(--space-6)">
            <section class="card" style="padding:var(--space-5)">
              <div class="section-kicker">Vaccine &amp; deworming plan</div>
              <h3 style="font-size:1.1rem;margin-bottom:4px">${supported ? (overdue ? `${overdue} overdue` : nextItems.length ? `Next: ${esc(nextItems[0].name)}` : 'All up to date') : 'Plan not available yet'}</h3>
              <p class="tl-meta" style="margin-bottom:12px">${supported ? 'Built from species and age. Your vet can change any date.' : `We don't have a standard plan for ${esc(pet.species)} yet — ask your vet.`}</p>
              ${supported ? `
                <table class="sched-table">
                  <thead><tr><th>Item</th><th>Due</th><th></th></tr></thead>
                  <tbody>
                    ${schedule.map(s => `
                      <tr>
                        <td>${esc(s.name)}</td>
                        <td style="white-space:nowrap">${s.status === 'done' ? (s.lastGiven ? formatDate(s.lastGiven) : '—') : formatDate(s.dueDate)}</td>
                        <td style="text-align:right">
                          ${s.status === 'done' ? '<span class="pill done">Done</span>' : `<button class="pill ${s.status}" data-mark="${s.id}" title="Mark as given today">${s.status === 'overdue' ? 'Overdue' : s.status === 'due' ? 'Due' : 'Upcoming'}</button>`}
                        </td>
                      </tr>`).join('')}
                  </tbody>
                </table>
                <p class="tl-meta" style="margin-top:10px">Tap a status to record it as given today. WhatsApp reminders go out 7 days before and on the due date.</p>` : ''}
            </section>

            <section class="card" style="padding:var(--space-5)">
              <div class="section-kicker">Weight</div>
              ${weightChart(records)}
            </section>

            <section class="card" style="padding:var(--space-5)">
              <div class="section-kicker">Share with a vet</div>
              <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:12px">Bring this record to any clinic. The printout includes vaccines, allergies and the last five visits.</p>
              <button class="btn btn-secondary w-full" id="print-btn"><span class="material-icons-round">print</span> Print / save as PDF</button>
            </section>
          </aside>
        </div>
      </div>`;

    document.getElementById('back-btn').addEventListener('click', () => navigate('/pets'));
    document.getElementById('print-btn').addEventListener('click', () => window.print());
    container.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; render(); }));
    container.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      removeHealthRecord(pet.id, b.dataset.del);
      showToast('Record deleted', '', 'info');
    }));
    container.querySelectorAll('[data-mark]').forEach(b => b.addEventListener('click', () => {
      const item = schedule.find(s => s.id === b.dataset.mark);
      addHealthRecord(pet.id, { id: generateId(), type: item.type === 'deworming' ? 'deworming' : 'vaccine', date: new Date().toISOString().slice(0, 10), title: item.name.replace(/ \(.*\)$/, '') });
      showToast('Recorded', `${item.name} given today`, 'success');
    }));
    document.getElementById('add-record-btn').addEventListener('click', () => openRecordModal(pet));
    document.getElementById('edit-profile-btn').addEventListener('click', () => openProfileModal(pet));
  }

  function openRecordModal(pet) {
    const today = new Date().toISOString().slice(0, 10);
    const dairy = ['cattle', 'buffalo', 'goat', 'sheep'].includes(pet.species);
    openModal(`Add record for ${esc(pet.name)}`, `
      <div style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
          <div class="input-group"><label>Type</label>
            <select class="select" id="rec-type">${Object.entries(RECORD_TYPES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select>
          </div>
          <div class="input-group"><label>Date</label><input type="date" class="input" id="rec-date" value="${today}" max="${today}" /></div>
        </div>
        <div class="input-group" id="rec-title-wrap"><label>Title</label><input class="input" id="rec-title" placeholder="e.g., Anti-rabies booster, Skin check, CBC" /></div>
        <div class="input-group" id="rec-value-wrap" hidden><label>Weight (kg)</label><input type="number" step="0.1" min="0" class="input" id="rec-value" /></div>
        <div class="input-group"><label>Notes</label><textarea class="input" id="rec-notes" rows="3" placeholder="Findings, medicines, dose, advice"></textarea></div>
        <div class="input-group"><label>Vet (optional)</label><input class="input" id="rec-vet" placeholder="Dr. name" /></div>
        ${dairy ? `<div class="input-group"><label>Milk/meat withdrawal (days, from the medicine label)</label><input type="number" min="0" class="input" id="rec-withdrawal" placeholder="e.g., 4" /></div>` : ''}
      </div>`, `
      <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
      <button class="btn btn-primary" id="save-rec-btn"><span class="material-icons-round">save</span> Save</button>`);

    setTimeout(() => {
      const typeSel = document.getElementById('rec-type');
      const sync = () => {
        const w = typeSel.value === 'weight';
        document.getElementById('rec-value-wrap').hidden = !w;
        document.getElementById('rec-title-wrap').hidden = w;
      };
      typeSel.addEventListener('change', sync);
      document.getElementById('save-rec-btn').addEventListener('click', () => {
        const type = typeSel.value;
        const value = parseFloat(document.getElementById('rec-value').value);
        const title = type === 'weight' ? 'Weight' : document.getElementById('rec-title').value.trim();
        if (type === 'weight' && !(value > 0)) { showToast('Missing weight', 'Enter the weight in kg', 'warning'); return; }
        if (type !== 'weight' && !title) { showToast('Missing title', 'Give the record a short title', 'warning'); return; }
        const withdrawal = parseInt(document.getElementById('rec-withdrawal')?.value, 10);
        addHealthRecord(pet.id, {
          id: generateId(), type, title,
          date: document.getElementById('rec-date').value || today,
          notes: document.getElementById('rec-notes').value.trim(),
          vetName: document.getElementById('rec-vet').value.trim(),
          ...(type === 'weight' ? { value } : {}),
          ...(withdrawal > 0 ? { withdrawalDays: withdrawal } : {}),
        });
        closeModal();
        showToast('Record saved', `${RECORD_TYPES[type].label} added to ${pet.name}'s record`, 'success');
      });
    }, 50);
  }

  function openProfileModal(pet) {
    openModal(`Edit ${esc(pet.name)}`, `
      <div style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
          <div class="input-group"><label>Date of birth</label><input type="date" class="input" id="pf-dob" value="${pet.dob || ''}" /></div>
          <div class="input-group"><label>Sex</label><select class="select" id="pf-gender"><option ${pet.gender === 'Male' ? 'selected' : ''}>Male</option><option ${pet.gender === 'Female' ? 'selected' : ''}>Female</option></select></div>
        </div>
        <div class="input-group"><label>Allergies (comma separated)</label><input class="input" id="pf-allergies" value="${esc((pet.allergies || []).join(', '))}" /></div>
        <div class="input-group"><label>Ongoing conditions (comma separated)</label><input class="input" id="pf-conditions" value="${esc((pet.conditions || []).join(', '))}" /></div>
        <div class="input-group"><label>Notes</label><textarea class="input" id="pf-notes" rows="2">${esc(pet.healthNotes || '')}</textarea></div>
      </div>`, `
      <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
      <button class="btn btn-primary" id="save-pf-btn">Save</button>`);
    setTimeout(() => {
      document.getElementById('save-pf-btn').addEventListener('click', () => {
        const list = id => document.getElementById(id).value.split(',').map(s => s.trim()).filter(Boolean);
        updatePet(pet.id, {
          dob: document.getElementById('pf-dob').value || pet.dob || null,
          gender: document.getElementById('pf-gender').value,
          allergies: list('pf-allergies'),
          conditions: list('pf-conditions'),
          healthNotes: document.getElementById('pf-notes').value.trim(),
        });
        closeModal();
        showToast('Profile updated', '', 'success');
      });
    }, 50);
  }

  render();
  const unsub = subscribe(() => { if (location.hash.startsWith(`#/pets/${petId}`)) render(); });
  return () => unsub();
}
