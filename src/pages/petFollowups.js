// ═══════════════════════════════════════════════════
// VetaDoc — Pet Follow-ups Page
// ═══════════════════════════════════════════════════

import { getState } from '../store.js';
import { formatDate, daysUntil, generateId } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { sendFollowUpWhatsApp } from '../utils/api.js';
import { navigate } from '../router.js';

const followUpTypes = [
    { id: 'medication', label: 'Medication Check', icon: '💊', color: '#3b82f6' },
    { id: 'post-surgery', label: 'Post-Surgery Review', icon: '🩹', color: '#ef4444' },
    { id: 'vaccination', label: 'Vaccination Follow-up', icon: '💉', color: '#10b981' },
    { id: 'diet', label: 'Diet & Nutrition Review', icon: '🥗', color: '#f59e0b' },
    { id: 'dental', label: 'Dental Check-up', icon: '🦷', color: '#8b5cf6' },
    { id: 'wellness', label: 'General Wellness', icon: '❤️', color: '#ec4899' },
    { id: 'dermatology', label: 'Skin/Coat Follow-up', icon: '🧴', color: '#06b6d4' },
    { id: 'orthopedic', label: 'Orthopedic Review', icon: '🦴', color: '#78716c' }
];

// Sample follow-ups
const sampleFollowUps = [
    { id: 'FU-001', petId: 'pet-1', petName: 'Bruno', petEmoji: '🐕', type: 'dermatology', vetName: 'Dr. Sneha Gupta', date: '2026-02-20', notes: 'Check skin allergy treatment progress. Review medicated shampoo effectiveness.', status: 'active', createdAt: '2026-02-09' },
    { id: 'FU-002', petId: 'pet-2', petName: 'Luna', petEmoji: '🐈', type: 'vaccination', vetName: 'Dr. Priya Sharma', date: '2026-07-05', notes: 'Annual FVRCP and Rabies booster due.', status: 'active', createdAt: '2026-01-05' },
    { id: 'FU-003', petId: 'pet-1', petName: 'Bruno', petEmoji: '🐕', type: 'dental', vetName: 'Dr. Arjun Reddy', date: '2026-03-15', notes: 'Dental cleaning follow-up. Check for tartar buildup.', status: 'active', createdAt: '2026-01-15' },
    { id: 'FU-004', petId: 'pet-1', petName: 'Bruno', petEmoji: '🐕', type: 'medication', vetName: 'Dr. Priya Sharma', date: '2026-01-20', notes: 'Completed antihistamine course. Allergy under control.', status: 'completed', createdAt: '2025-12-20', completedAt: '2026-01-20', outcome: 'Allergy significantly improved. Continue with hypoallergenic diet.' }
];

export default function renderPetFollowups(container) {
    const state = getState();
    const pets = state.pets;

    const activeFollowUps = sampleFollowUps.filter(f => f.status === 'active').sort((a, b) => new Date(a.date) - new Date(b.date));
    const completedFollowUps = sampleFollowUps.filter(f => f.status === 'completed');

    container.innerHTML = `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-6);flex-wrap:wrap;gap:var(--space-4)">
        <div>
          <h1 style="font-size:var(--text-2xl);display:flex;align-items:center;gap:var(--space-3)">
            <span class="material-icons-round" style="color:var(--color-secondary)">event_repeat</span>
            Pet Follow-ups
          </h1>
          <p style="color:var(--text-secondary);margin-top:var(--space-2);font-size:var(--text-sm)">Track and manage follow-up appointments, medication schedules & wellness checks for your pets.</p>
        </div>
        <button class="btn btn-primary" id="schedule-followup-btn">
          <span class="material-icons-round">add</span>
          Schedule Follow-up
        </button>
      </div>

      <!-- Follow-up Type Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--space-3);margin-bottom:var(--space-8)">
        ${followUpTypes.map(t => {
        const count = activeFollowUps.filter(f => f.type === t.id).length;
        return `
            <div class="followup-type-card" style="border-top:3px solid ${t.color}">
              <span style="font-size:24px">${t.icon}</span>
              <div style="font-size:var(--text-xs);font-weight:var(--font-semibold)">${t.label}</div>
              ${count > 0 ? `<span class="badge" style="background:${t.color}20;color:${t.color}">${count} active</span>` : ''}
            </div>
          `;
    }).join('')}
      </div>

      <!-- Active Follow-ups -->
      <section>
        <div class="section-header">
          <h2><span class="material-icons-round">pending_actions</span> Active Follow-ups</h2>
          <span class="badge badge-info">${activeFollowUps.length} upcoming</span>
        </div>
        ${activeFollowUps.length > 0 ? `
          <div class="followup-timeline">
            ${activeFollowUps.map(f => {
        const typeInfo = followUpTypes.find(t => t.id === f.type) || followUpTypes[5];
        const days = daysUntil(f.date);
        const isUrgent = days <= 7;
        const isPast = days < 0;
        return `
                <div class="followup-timeline-item ${isUrgent ? 'urgent' : ''} ${isPast ? 'overdue' : ''}">
                  <div class="followup-timeline-dot" style="background:${typeInfo.color}"></div>
                  <div class="followup-timeline-content">
                    <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:var(--space-2)">
                      <div>
                        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1)">
                          <span style="font-size:18px">${f.petEmoji}</span>
                          <span style="font-weight:var(--font-semibold)">${f.petName}</span>
                          <span class="badge" style="background:${typeInfo.color}20;color:${typeInfo.color};font-size:10px">${typeInfo.icon} ${typeInfo.label}</span>
                        </div>
                        <div style="font-size:var(--text-xs);color:var(--text-tertiary)">🩺 ${f.vetName}</div>
                      </div>
                      <div style="text-align:right">
                        <div style="font-size:var(--text-sm);font-weight:var(--font-semibold);color:${isPast ? 'var(--color-error)' : isUrgent ? 'var(--color-warning)' : 'var(--text-primary)'}">
                          ${isPast ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today!' : `${days}d left`}
                        </div>
                        <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${formatDate(f.date)}</div>
                      </div>
                    </div>
                    ${f.notes ? `<p style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:var(--space-2);font-style:italic">${f.notes}</p>` : ''}
                    <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3)">
                      <button class="btn btn-primary btn-sm" data-complete-followup="${f.id}">
                        <span class="material-icons-round" style="font-size:14px">check</span> Complete
                      </button>
                      <button class="btn btn-secondary btn-sm" data-reschedule-followup="${f.id}">
                        <span class="material-icons-round" style="font-size:14px">event</span> Reschedule
                      </button>
                      <button class="btn btn-ghost btn-sm" data-whatsapp-followup="${f.id}" title="Send WhatsApp Reminder" style="color:#25D366">
                        <span class="material-icons-round" style="font-size:14px">chat</span>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              `;
    }).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <span class="material-icons-round">event_available</span>
            <h3>No active follow-ups</h3>
            <p>All follow-ups are up to date! Schedule a new one if needed.</p>
          </div>
        `}
      </section>

      <!-- Completed Follow-ups -->
      ${completedFollowUps.length > 0 ? `
        <section style="margin-top:var(--space-10)">
          <div class="section-header">
            <h2><span class="material-icons-round">task_alt</span> Completed</h2>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${completedFollowUps.map(f => {
        const typeInfo = followUpTypes.find(t => t.id === f.type) || followUpTypes[5];
        return `
                <div class="card" style="padding:var(--space-4);opacity:0.8">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <div style="display:flex;align-items:center;gap:var(--space-3)">
                      <span style="font-size:20px">${f.petEmoji}</span>
                      <div>
                        <div style="font-weight:var(--font-medium);font-size:var(--text-sm)">${f.petName} — ${typeInfo.label}</div>
                        <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Completed ${formatDate(f.completedAt)} · ${f.vetName}</div>
                      </div>
                    </div>
                    <span class="badge badge-success">
                      <span class="material-icons-round" style="font-size:12px">check</span> Done
                    </span>
                  </div>
                  ${f.outcome ? `<p style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:var(--space-2);padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-md)">${f.outcome}</p>` : ''}
                </div>
              `;
    }).join('')}
          </div>
        </section>
      ` : ''}
    </div>
  `;

    // Schedule new follow-up
    document.getElementById('schedule-followup-btn')?.addEventListener('click', () => {
        openModal('Schedule Follow-up', `
      <div style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="input-group">
          <label>Select Pet</label>
          <select class="select" id="fu-pet">
            ${pets.map(p => `<option value="${p.id}" data-emoji="${p.emoji}" data-name="${p.name}">${p.emoji} ${p.name} (${p.breed})</option>`).join('')}
          </select>
        </div>
        <div class="input-group">
          <label>Follow-up Type</label>
          <select class="select" id="fu-type">
            ${followUpTypes.map(t => `<option value="${t.id}">${t.icon} ${t.label}</option>`).join('')}
          </select>
        </div>
        <div class="input-group">
          <label>Follow-up Date</label>
          <input type="date" class="input" id="fu-date" min="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div class="input-group">
          <label>Veterinarian (optional)</label>
          <input type="text" class="input" id="fu-vet" placeholder="e.g., Dr. Priya Sharma" />
        </div>
        <div class="input-group">
          <label>Notes</label>
          <textarea class="input" id="fu-notes" rows="3" placeholder="Describe the reason for follow-up..."></textarea>
        </div>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
      <button class="btn btn-primary" id="confirm-followup-btn">
        <span class="material-icons-round">event_repeat</span>
        Schedule Follow-up
      </button>
    `);

        setTimeout(() => {
            document.getElementById('confirm-followup-btn')?.addEventListener('click', async () => {
                const date = document.getElementById('fu-date')?.value;
                if (!date) {
                    showToast('Missing Date', 'Please select a follow-up date', 'warning');
                    return;
                }

                const petSelect = document.getElementById('fu-pet');
                const selectedOpt = petSelect?.selectedOptions[0];
                const pet = pets.find(p => p.id === petSelect?.value);
                const typeId = document.getElementById('fu-type')?.value;
                const typeInfo = followUpTypes.find(t => t.id === typeId);
                const vetName = document.getElementById('fu-vet')?.value || '';

                const followUp = {
                    id: 'FU-' + generateId().slice(0, 6),
                    petId: pet?.id || 'unknown',
                    petName: pet?.name || 'Unknown',
                    petEmoji: pet?.emoji || '🐾',
                    type: typeId,
                    vetName: vetName || 'TBD',
                    date,
                    notes: document.getElementById('fu-notes')?.value || '',
                    status: 'active',
                    createdAt: new Date().toISOString()
                };

                sampleFollowUps.push(followUp);

                // Send WhatsApp
                if (vetName) {
                    await sendFollowUpWhatsApp({
                        customerPhone: state.user.phone,
                        petName: followUp.petName,
                        followUpType: typeInfo?.label || typeId,
                        date,
                        vetName
                    });
                }

                closeModal();
                showToast('Follow-up Scheduled!', `${typeInfo?.label} for ${followUp.petName} on ${date}`, 'success');
                renderPetFollowups(container);
            });
        }, 100);
    });

    // Complete follow-up
    document.querySelectorAll('[data-complete-followup]').forEach(btn => {
        btn.addEventListener('click', () => {
            const fu = sampleFollowUps.find(f => f.id === btn.dataset.completeFollowup);
            if (fu) {
                fu.status = 'completed';
                fu.completedAt = new Date().toISOString().split('T')[0];
                fu.outcome = 'Completed successfully.';
                showToast('Follow-up Completed', `${fu.petName} follow-up marked as done`, 'success');
                renderPetFollowups(container);
            }
        });
    });

    // WhatsApp reminder
    document.querySelectorAll('[data-whatsapp-followup]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const fu = sampleFollowUps.find(f => f.id === btn.dataset.whatsappFollowup);
            if (fu) {
                const typeInfo = followUpTypes.find(t => t.id === fu.type);
                await sendFollowUpWhatsApp({
                    customerPhone: state.user.phone,
                    petName: fu.petName,
                    followUpType: typeInfo?.label || fu.type,
                    date: fu.date,
                    vetName: fu.vetName
                });
                showToast('WhatsApp Sent!', `Follow-up reminder sent via WhatsApp`, 'success');
            }
        });
    });
}
