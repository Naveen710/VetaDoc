// ═══════════════════════════════════════════════════
// VetaDoc — Vet Consultation Page (with WhatsApp)
// ═══════════════════════════════════════════════════

import { vets } from '../data/vets.js';
import { bookConsultation, getState } from '../store.js';
import { renderStars, formatPrice, generateId } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { sendBookingWhatsApp, createPaymentOrder } from '../utils/api.js';
import { collectPayment } from '../utils/payments.js';

const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
/** Next calendar date (YYYY-MM-DD, local) for a weekday label like 'Mon'. */
function nextDateFor(day) {
    const d = new Date();
    const target = DAY_INDEX[day];
    if (target !== undefined) d.setDate(d.getDate() + ((target - d.getDay() + 7) % 7 || 7));
    else d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function renderConsultation(container) {
    const state = getState();
    const pets = state.pets;

    container.innerHTML = `
    <div class="page-container">
      <div style="margin-bottom:var(--space-8)">
        <h1 style="font-size:var(--text-2xl);display:flex;align-items:center;gap:var(--space-3)">
          <span class="material-icons-round" style="color:var(--color-primary)">video_call</span>
          Vet Consultation
        </h1>
        <p style="color:var(--text-secondary);margin-top:var(--space-2)">Book a video consultation with certified veterinarians. Get expert advice from the comfort of your home.</p>
      </div>

      <!-- Upcoming Consultations -->
      ${state.consultations.filter(c => c.status === 'upcoming').length > 0 ? `
        <section style="margin-bottom:var(--space-8)">
          <h3 style="margin-bottom:var(--space-4);display:flex;align-items:center;gap:var(--space-2)">
            <span class="material-icons-round" style="color:var(--color-info)">event</span>
            Upcoming Consultations
          </h3>
          <div style="display:flex;gap:var(--space-4);flex-wrap:wrap">
            ${state.consultations.filter(c => c.status === 'upcoming').map(c => `
              <div class="card" style="padding:var(--space-5);flex:1;min-width:280px; border-left:3px solid var(--color-primary)">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-3)">
                  <div>
                    <div style="font-weight:var(--font-semibold)">${c.vetName}</div>
                    <div style="font-size:var(--text-xs);color:var(--text-tertiary)">For ${c.petName} · ${c.type}</div>
                  </div>
                  <span class="badge badge-info badge-dot">Upcoming</span>
                </div>
                <div style="font-size:var(--text-sm);color:var(--text-secondary)">
                  <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1)">
                    <span class="material-icons-round" style="font-size:16px">calendar_today</span> ${c.date}
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-2)">
                    <span class="material-icons-round" style="font-size:16px">schedule</span> ${c.time} IST
                  </div>
                </div>
                ${c.notes ? `<p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:var(--space-3);font-style:italic">${c.notes}</p>` : ''}
                <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3)">
                  <button class="whatsapp-btn" data-whatsapp-consult="${c.id}">
                    <span class="material-icons-round">chat</span>
                    Chat on WhatsApp
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Vet Listings -->
      <div class="section-header">
        <h2><span class="material-icons-round">medical_services</span> Our Veterinarians</h2>
      </div>
      <div class="vet-grid">
        ${vets.map(vet => `
          <div class="vet-card" data-vet-id="${vet.id}">
            <div class="vet-card-header">
              <div class="avatar avatar-lg">${vet.avatar}</div>
              <div class="vet-card-info">
                <h4>${vet.name}</h4>
                <div class="vet-card-specialization">${vet.specialization}</div>
                <div style="display:flex;align-items:center;gap:var(--space-2);margin-top:var(--space-1)">
                  ${renderStars(vet.rating)}
                  <span style="font-size:var(--text-xs);font-weight:var(--font-semibold)">${vet.rating}</span>
                  <span style="font-size:var(--text-xs);color:var(--text-tertiary)">(${vet.reviews})</span>
                </div>
              </div>
            </div>

            <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-3)">${vet.about}</p>

            <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-3)">
              ${vet.species.map(s => {
        const icons = { dog: '🐕', cat: '🐈', bird: '🐦', cattle: '🐄', horse: '🐴', fish: '🐟' };
        return `<span class="tag">${icons[s] || ''} ${s}</span>`;
    }).join('')}
            </div>

            <div class="vet-card-stats">
              <div class="vet-stat">
                <div class="stat-value">${vet.experience}+</div>
                <div class="stat-label">Years Exp.</div>
              </div>
              <div class="vet-stat">
                <div class="stat-value">${vet.consultations.toLocaleString()}</div>
                <div class="stat-label">Consults</div>
              </div>
              <div class="vet-stat">
                <div class="stat-value">${formatPrice(vet.consultationFee)}</div>
                <div class="stat-label">Fee</div>
              </div>
            </div>

            <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-3)">
              <span class="material-icons-round" style="font-size:14px;vertical-align:middle">translate</span>
              ${vet.languages.join(', ')}
            </div>

            <div style="font-size:var(--text-xs);font-weight:var(--font-semibold);color:var(--text-secondary);margin-bottom:var(--space-2)">Available Slots</div>
            <div class="vet-availability">
              ${vet.availability.slice(0, 3).flatMap(a => a.slots.slice(0, 3).map(s => `
                <div class="time-slot" data-vet="${vet.id}" data-day="${a.day}" data-time="${s}">
                  ${a.day} ${s}
                </div>
              `)).join('')}
              ${vet.availability.length > 3 ? `<span class="tag" style="cursor:default">+more</span>` : ''}
            </div>

            <button class="btn btn-primary w-full" data-book-vet="${vet.id}" style="margin-top:var(--space-4)">
              <span class="material-icons-round">event</span>
              Book Consultation
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

    // Time slot selection
    let selectedSlots = {};
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            const vetId = slot.dataset.vet;
            document.querySelectorAll(`.time-slot[data-vet="${vetId}"]`).forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            selectedSlots[vetId] = { day: slot.dataset.day, time: slot.dataset.time };
        });
    });

    // WhatsApp for existing consultations
    document.querySelectorAll('[data-whatsapp-consult]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const consultId = btn.dataset.whatsappConsult;
            const consult = state.consultations.find(c => c.id === consultId);
            if (consult) {
                await sendBookingWhatsApp({
                    customerPhone: state.user.phone,
                    customerName: state.user.name,
                    vetName: consult.vetName,
                    petName: consult.petName,
                    date: consult.date,
                    time: consult.time,
                    consultationType: consult.type,
                    bookingId: consult.id
                });
                showToast('WhatsApp Sent!', 'Booking details sent via WhatsApp', 'success');
            }
        });
    });

    // Book consultation
    document.querySelectorAll('[data-book-vet]').forEach(btn => {
        btn.addEventListener('click', () => {
            const vetId = parseInt(btn.dataset.bookVet);
            const vet = vets.find(v => v.id === vetId);
            const selected = selectedSlots[vetId];

            openModal(`Book with ${vet.name}`, `
        <div style="display:flex;flex-direction:column;gap:var(--space-4)">
          <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4);background:var(--bg-secondary);border-radius:var(--radius-lg)">
            <div class="avatar avatar-lg">${vet.avatar}</div>
            <div>
              <div style="font-weight:var(--font-semibold)">${vet.name}</div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${vet.specialization} · ${formatPrice(vet.consultationFee)}</div>
            </div>
          </div>

          ${selected ? `
            <div style="padding:var(--space-3);background:var(--color-primary-50);border-radius:var(--radius-lg);font-size:var(--text-sm)">
              <span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:var(--color-primary)">event</span>
              <strong>${selected.day} at ${selected.time} IST</strong>
            </div>
          ` : `
            <div style="padding:var(--space-3);background:rgba(245,158,11,0.08);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--color-warning)">
              <span class="material-icons-round" style="font-size:16px;vertical-align:middle">info</span>
              Please select a time slot first, or choose one below
            </div>
          `}

          <div class="input-group">
            <label>Select Pet</label>
            <select class="select" id="consult-pet">
              ${pets.map(p => `<option value="${p.id}">${p.emoji} ${p.name} (${p.breed})</option>`).join('')}
              <option value="other">Other / New Pet</option>
            </select>
          </div>

          <div class="input-group">
            <label>Consultation Type</label>
            <select class="select" id="consult-type">
              <option value="Video Call">📹 Video Call</option>
              <option value="Chat">💬 Chat</option>
            </select>
          </div>

          <div class="input-group">
            <label>Reason / Notes</label>
            <textarea class="input" id="consult-notes" rows="3" placeholder="Describe your pet's symptoms or reason for consultation..."></textarea>
          </div>

          <label style="display:flex;align-items:flex-start;gap:var(--space-2);cursor:pointer;font-size:var(--text-sm);line-height:1.5">
            <input type="checkbox" id="consult-consent" style="margin-top:3px" />
            <span>I consent to a remote consultation. I understand the vet may ask for an in-clinic visit, and that certificates, euthanasia and trauma cases cannot be handled online. In an emergency I will use SOS.</span>
          </label>

          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;font-size:var(--text-sm)">
            <input type="checkbox" id="consult-whatsapp" checked />
            <span class="material-icons-round" style="font-size:16px;color:#25D366">chat</span>
            Send booking confirmation via WhatsApp
          </label>
        </div>
      `, `
        <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
        <button class="btn btn-primary" id="confirm-booking-btn">
          <span class="material-icons-round">check</span>
          Confirm Booking — ${formatPrice(vet.consultationFee)}
        </button>
      `);

            setTimeout(() => {
                document.getElementById('confirm-booking-btn')?.addEventListener('click', async () => {
                    const petSelect = document.getElementById('consult-pet');
                    const pet = pets.find(p => p.id === petSelect?.value);
                    const typeSelect = document.getElementById('consult-type');
                    const notesInput = document.getElementById('consult-notes');
                    const sendWhatsApp = document.getElementById('consult-whatsapp')?.checked;
                    if (!document.getElementById('consult-consent')?.checked) {
                        showToast('Consent needed', 'Please confirm consent for a remote consultation', 'warning');
                        return;
                    }
                    const payment = await createPaymentOrder({ amount: vet.consultationFee, purpose: 'consultation', refId: vet.id });
                    if (payment?.error) {
                        showToast('Payment failed', payment.error, 'error');
                        return;
                    }
                    let paid;
                    try {
                        paid = await collectPayment(payment, `Consultation with ${vet.name}`);
                    } catch (err) {
                        showToast('Payment not completed', err.message, 'warning');
                        return;
                    }

                    const bookingId = 'VC-' + Date.now().toString(36).toUpperCase();
                    const consultation = {
                        id: bookingId,
                        vetId: vet.id,
                        vetName: vet.name,
                        petName: pet ? pet.name : 'Other',
                        date: nextDateFor(selected?.day),
                        time: selected ? selected.time : '10:00',
                        type: typeSelect?.value || 'Video Call',
                        status: 'upcoming',
                        notes: notesInput?.value || '',
                        petId: pet?.id || null,
                        fee: vet.consultationFee,
                        paymentOrderId: payment?.orderId || null,
                        paymentStatus: paid.demo ? 'demo' : 'paid',
                        paymentId: paid.paymentId,
                        consentAt: Date.now(),
                        whatsappOptIn: Boolean(sendWhatsApp),
                        ownerPhone: state.session?.phone || state.user.phone
                    };

                    bookConsultation(consultation);

                    // Send WhatsApp confirmation via backend
                    if (sendWhatsApp) {
                        const whatsappResult = await sendBookingWhatsApp({
                            customerPhone: state.user.phone,
                            customerName: state.user.name,
                            vetName: vet.name,
                            petName: consultation.petName,
                            date: consultation.date,
                            time: consultation.time,
                            consultationType: consultation.type,
                            bookingId: bookingId,
                            consultationFee: vet.consultationFee
                        });

                        if (whatsappResult && !whatsappResult.error) {
                            console.log('✅ WhatsApp booking sent:', whatsappResult);
                        }
                    }

                    closeModal();

                    // Show success with WhatsApp confirmation
                    showToast(
                        '🎉 Consultation Booked!',
                        `${vet.name} on ${consultation.date} at ${consultation.time}${sendWhatsApp ? ' · WhatsApp confirmation sent' : ''}`,
                        'success'
                    );

                    renderConsultation(container);
                });
            }, 100);
        });
    });
}
