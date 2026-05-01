// ═══════════════════════════════════════════════════
// VetaDoc — Sample Collection Page
// ═══════════════════════════════════════════════════

import { getState } from '../store.js';
import { formatPrice, generateId } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { createSampleCollection, sendSampleCollectionWhatsApp } from '../utils/api.js';

const sampleTests = [
    { id: 'cbc', name: 'Complete Blood Count (CBC)', icon: '🩸', price: 450, description: 'Evaluates overall health, detects infections, anemia, and blood disorders.', turnaround: '24 hrs' },
    { id: 'liver', name: 'Liver Function Panel', icon: '🫀', price: 650, description: 'Assesses liver health — ALT, AST, ALP, bilirubin levels.', turnaround: '24-48 hrs' },
    { id: 'kidney', name: 'Kidney Function Panel', icon: '💧', price: 600, description: 'Measures BUN, creatinine, and electrolytes for kidney health.', turnaround: '24-48 hrs' },
    { id: 'thyroid', name: 'Thyroid Panel (T3/T4/TSH)', icon: '🦋', price: 800, description: 'Screens for hypothyroidism or hyperthyroidism.', turnaround: '48 hrs' },
    { id: 'urinalysis', name: 'Urinalysis', icon: '🧪', price: 350, description: 'Examines urine for infections, diabetes, kidney issues.', turnaround: '12-24 hrs' },
    { id: 'stool', name: 'Fecal Examination', icon: '🔬', price: 300, description: 'Detects parasites, worms, and digestive abnormalities.', turnaround: '12-24 hrs' },
    { id: 'skin', name: 'Skin Scraping & Culture', icon: '🧫', price: 550, description: 'Identifies fungal infections, mites, and bacterial skin issues.', turnaround: '48-72 hrs' },
    { id: 'glucose', name: 'Blood Glucose Test', icon: '📊', price: 250, description: 'Measures blood sugar levels — essential for diabetic pets.', turnaround: '4-6 hrs' },
    { id: 'allergy', name: 'Allergy Panel', icon: '🌿', price: 1200, description: 'Comprehensive allergy testing — food and environmental allergens.', turnaround: '5-7 days' },
    { id: 'heartworm', name: 'Heartworm Test', icon: '🪱', price: 400, description: 'Detects heartworm disease — critical for dogs in endemic areas.', turnaround: '24 hrs' }
];

const sampleHistory = [
    { id: 'SC-001', petName: 'Bruno', test: 'Complete Blood Count (CBC)', date: '2026-02-14', timeSlot: '09:00 - 10:00', status: 'scheduled', address: '42 Green Park, Jubilee Hills' },
    { id: 'SC-002', petName: 'Luna', test: 'Skin Scraping & Culture', date: '2026-02-10', timeSlot: '11:00 - 12:00', status: 'completed', address: '42 Green Park, Jubilee Hills', results: { status: 'normal', summary: 'No fungal or parasitic infection detected. Mild bacterial presence — recommend medicated shampoo.' } }
];

export default function renderSampleCollection(container) {
    const state = getState();
    const pets = state.pets;

    const statusColors = { scheduled: 'var(--color-info)', 'in-transit': 'var(--color-warning)', 'at-lab': 'var(--color-secondary)', completed: 'var(--color-success)', cancelled: 'var(--color-error)' };

    container.innerHTML = `
    <div class="page-container">
      <div style="margin-bottom:var(--space-8)">
        <h1 style="font-size:var(--text-2xl);display:flex;align-items:center;gap:var(--space-3)">
          <span class="material-icons-round" style="color:#8b5cf6">science</span>
          Sample Collection & Lab Tests
        </h1>
        <p style="color:var(--text-secondary);margin-top:var(--space-2);font-size:var(--text-sm)">Book at-home sample collection for your pets. Our trained technicians collect samples at your doorstep.</p>
      </div>

      <!-- How It Works -->
      <div class="sample-how-it-works">
        <div class="how-step">
          <div class="how-step-num">1</div>
          <div class="how-step-icon"><span class="material-icons-round">science</span></div>
          <div class="how-step-text">Choose Test</div>
        </div>
        <div class="how-step-arrow"><span class="material-icons-round">arrow_forward</span></div>
        <div class="how-step">
          <div class="how-step-num">2</div>
          <div class="how-step-icon"><span class="material-icons-round">schedule</span></div>
          <div class="how-step-text">Schedule Visit</div>
        </div>
        <div class="how-step-arrow"><span class="material-icons-round">arrow_forward</span></div>
        <div class="how-step">
          <div class="how-step-num">3</div>
          <div class="how-step-icon"><span class="material-icons-round">home</span></div>
          <div class="how-step-text">Home Collection</div>
        </div>
        <div class="how-step-arrow"><span class="material-icons-round">arrow_forward</span></div>
        <div class="how-step">
          <div class="how-step-num">4</div>
          <div class="how-step-icon"><span class="material-icons-round">description</span></div>
          <div class="how-step-text">Get Results</div>
        </div>
      </div>

      <!-- Available Tests -->
      <section>
        <div class="section-header">
          <h2><span class="material-icons-round">biotech</span> Available Tests</h2>
        </div>
        <div class="sample-tests-grid">
          ${sampleTests.map(test => `
            <div class="sample-test-card" data-test-id="${test.id}">
              <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-3)">
                <span style="font-size:28px">${test.icon}</span>
                <span class="badge badge-neutral">${test.turnaround}</span>
              </div>
              <h4 style="margin-bottom:var(--space-2);font-size:var(--text-sm)">${test.name}</h4>
              <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-3);line-height:1.5">${test.description}</p>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-weight:var(--font-bold);color:var(--color-primary)">${formatPrice(test.price)}</span>
                <button class="btn btn-primary btn-sm" data-book-test="${test.id}">
                  <span class="material-icons-round" style="font-size:14px">add</span>
                  Book Now
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Collection History -->
      <section style="margin-top:var(--space-10)">
        <div class="section-header">
          <h2><span class="material-icons-round">history</span> Collection History</h2>
        </div>
        ${sampleHistory.length > 0 ? `
          <div style="display:flex;flex-direction:column;gap:var(--space-4)">
            ${sampleHistory.map(s => `
              <div class="card" style="padding:var(--space-5)">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-3)">
                  <div>
                    <div style="font-weight:var(--font-semibold)">${s.test}</div>
                    <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${s.id} · For ${s.petName}</div>
                  </div>
                  <span class="badge" style="background:${statusColors[s.status]}20;color:${statusColors[s.status]}">${s.status}</span>
                </div>
                <div style="display:flex;gap:var(--space-6);font-size:var(--text-sm);color:var(--text-secondary)">
                  <div><span class="material-icons-round" style="font-size:14px;vertical-align:middle">calendar_today</span> ${s.date}</div>
                  <div><span class="material-icons-round" style="font-size:14px;vertical-align:middle">schedule</span> ${s.timeSlot}</div>
                  <div><span class="material-icons-round" style="font-size:14px;vertical-align:middle">location_on</span> ${s.address}</div>
                </div>
                ${s.results ? `
                  <div style="margin-top:var(--space-4);padding:var(--space-4);background:${s.results.status === 'normal' ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)'};border-radius:var(--radius-lg);border-left:3px solid ${s.results.status === 'normal' ? 'var(--color-success)' : 'var(--color-warning)'}">
                    <div style="font-weight:var(--font-semibold);font-size:var(--text-sm);color:${s.results.status === 'normal' ? 'var(--color-success)' : 'var(--color-warning)'}">
                      <span class="material-icons-round" style="font-size:16px;vertical-align:middle">${s.results.status === 'normal' ? 'check_circle' : 'warning'}</span>
                      Results: ${s.results.status.charAt(0).toUpperCase() + s.results.status.slice(1)}
                    </div>
                    <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:var(--space-2)">${s.results.summary}</p>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <span class="material-icons-round">science</span>
            <h3>No sample collections yet</h3>
            <p>Book your first at-home sample collection above.</p>
          </div>
        `}
      </section>
    </div>
  `;

    // Book test
    document.querySelectorAll('[data-book-test]').forEach(btn => {
        btn.addEventListener('click', () => {
            const test = sampleTests.find(t => t.id === btn.dataset.bookTest);
            if (!test) return;

            openModal(`Book ${test.name}`, `
        <div style="display:flex;flex-direction:column;gap:var(--space-4)">
          <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4);background:var(--bg-secondary);border-radius:var(--radius-lg)">
            <span style="font-size:32px">${test.icon}</span>
            <div>
              <div style="font-weight:var(--font-semibold)">${test.name}</div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${test.turnaround} turnaround · ${formatPrice(test.price)}</div>
            </div>
          </div>
          
          <div class="input-group">
            <label>Select Pet</label>
            <select class="select" id="sample-pet">
              ${pets.map(p => `<option value="${p.id}">${p.emoji} ${p.name} (${p.breed})</option>`).join('')}
              <option value="other">Other / New Pet</option>
            </select>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
            <div class="input-group">
              <label>Preferred Date</label>
              <input type="date" class="input" id="sample-date" min="${new Date().toISOString().split('T')[0]}" />
            </div>
            <div class="input-group">
              <label>Preferred Time Slot</label>
              <select class="select" id="sample-time">
                <option value="08:00 - 09:00">08:00 - 09:00 AM</option>
                <option value="09:00 - 10:00">09:00 - 10:00 AM</option>
                <option value="10:00 - 11:00">10:00 - 11:00 AM</option>
                <option value="11:00 - 12:00">11:00 - 12:00 PM</option>
                <option value="14:00 - 15:00">02:00 - 03:00 PM</option>
                <option value="15:00 - 16:00">03:00 - 04:00 PM</option>
                <option value="16:00 - 17:00">04:00 - 05:00 PM</option>
              </select>
            </div>
          </div>

          <div class="input-group">
            <label>Collection Address</label>
            <textarea class="input" id="sample-address" rows="2" placeholder="Enter your full address...">${state.user.address}</textarea>
          </div>

          <div class="input-group">
            <label>Special Instructions (optional)</label>
            <textarea class="input" id="sample-notes" rows="2" placeholder="e.g., Pet is anxious, ring doorbell twice..."></textarea>
          </div>

          <div style="padding:var(--space-3);background:rgba(59,130,246,0.06);border-radius:var(--radius-lg);font-size:var(--text-xs);color:var(--text-secondary)">
            <span class="material-icons-round" style="font-size:14px;vertical-align:middle;color:var(--color-info)">info</span>
            Our trained technician will arrive at your doorstep. The collection takes 10-15 minutes. Keep your pet calm and hydrated.
          </div>
        </div>
      `, `
        <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
        <button class="btn btn-primary" id="confirm-sample-btn">
          <span class="material-icons-round">science</span>
          Confirm — ${formatPrice(test.price)}
        </button>
      `);

            setTimeout(() => {
                document.getElementById('confirm-sample-btn')?.addEventListener('click', async () => {
                    const petSelect = document.getElementById('sample-pet');
                    const pet = pets.find(p => p.id === petSelect?.value);
                    const date = document.getElementById('sample-date')?.value;
                    const timeSlot = document.getElementById('sample-time')?.value;
                    const address = document.getElementById('sample-address')?.value;

                    if (!date) {
                        showToast('Missing Date', 'Please select a preferred date', 'warning');
                        return;
                    }

                    const collectionId = 'SC-' + String(Math.floor(Math.random() * 999)).padStart(3, '0');
                    const collectionData = {
                        petName: pet ? pet.name : 'Other',
                        ownerName: state.user.name,
                        sampleType: test.name,
                        date,
                        timeSlot: timeSlot || '09:00 - 10:00',
                        address: address || state.user.address
                    };

                    // Create on backend
                    await createSampleCollection(collectionData);

                    // Send WhatsApp confirmation
                    await sendSampleCollectionWhatsApp({
                        customerPhone: state.user.phone,
                        petName: collectionData.petName,
                        sampleType: test.name,
                        date,
                        timeSlot: collectionData.timeSlot,
                        collectionId
                    });

                    closeModal();
                    showToast('Sample Collection Booked!', `${test.name} for ${collectionData.petName} on ${date}`, 'success');
                    renderSampleCollection(container);
                });
            }, 100);
        });
    });
}
