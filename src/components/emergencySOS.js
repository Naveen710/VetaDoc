// ═══════════════════════════════════════════════════
// VetaDoc — Emergency SOS Component
// ═══════════════════════════════════════════════════

import { openModal, closeModal } from './modal.js';

export function renderEmergencySOS() {
    return `
    <div class="sos-fab" id="sos-fab" title="Emergency SOS">
      <span class="material-icons-round">emergency</span>
      <div class="sos-pulse"></div>
    </div>
  `;
}

export function initEmergencySOS() {
    const fab = document.getElementById('sos-fab');
    fab?.addEventListener('click', () => {
        openModal('🚨 Pet Emergency SOS', `
      <div style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div style="padding:var(--space-4);background:rgba(239,68,68,0.08);border-radius:var(--radius-lg);border-left:3px solid var(--color-error)">
          <div style="font-weight:var(--font-bold);color:var(--color-error);margin-bottom:var(--space-2)">
            <span class="material-icons-round" style="font-size:18px;vertical-align:middle">warning</span>
            If your pet is in immediate danger, call emergency services now!
          </div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary)">Time is critical in emergencies. Don't delay seeking help.</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
          <a href="tel:+919876543210" class="sos-action-card" style="text-decoration:none;color:inherit">
            <div class="stat-icon" style="background:rgba(239,68,68,0.1)">
              <span class="material-icons-round" style="color:var(--color-error)">call</span>
            </div>
            <div style="font-weight:var(--font-semibold);font-size:var(--text-sm)">Emergency Hotline</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">+91 98765 43210</div>
          </a>
          <a href="tel:+911234567890" class="sos-action-card" style="text-decoration:none;color:inherit">
            <div class="stat-icon" style="background:rgba(59,130,246,0.1)">
              <span class="material-icons-round" style="color:var(--color-info)">local_hospital</span>
            </div>
            <div style="font-weight:var(--font-semibold);font-size:var(--text-sm)">Nearest Vet Clinic</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">+91 12345 67890</div>
          </a>
        </div>

        <div class="card" style="padding:var(--space-4)">
          <h4 style="margin-bottom:var(--space-3);display:flex;align-items:center;gap:var(--space-2)">
            <span class="material-icons-round" style="color:var(--color-warning);font-size:18px">medical_information</span>
            Quick First Aid Guide
          </h4>
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            <details class="first-aid-item">
              <summary>🩸 Bleeding / Wound</summary>
              <p>Apply firm, direct pressure with a clean cloth. Keep your pet calm. Do NOT apply tourniquets. Seek vet care immediately for deep wounds.</p>
            </details>
            <details class="first-aid-item">
              <summary>🤢 Poisoning / Toxic Ingestion</summary>
              <p>Do NOT induce vomiting unless directed by a vet. Note what was ingested and the quantity. Call the emergency hotline immediately.</p>
            </details>
            <details class="first-aid-item">
              <summary>🦴 Suspected Fracture</summary>
              <p>Keep the pet still and calm. Support the injured area with a padded splint if possible. Transport carefully to the nearest vet.</p>
            </details>
            <details class="first-aid-item">
              <summary>🥵 Heatstroke</summary>
              <p>Move to a cool area immediately. Apply cool (not cold) water to body. Offer small sips of water. Rush to the vet — heatstroke can be fatal.</p>
            </details>
            <details class="first-aid-item">
              <summary>😵 Seizure</summary>
              <p>Do NOT restrain your pet. Move away objects that could cause injury. Time the seizure. If it lasts more than 3 minutes, seek emergency vet care.</p>
            </details>
            <details class="first-aid-item">
              <summary>🫁 Choking</summary>
              <p>Check the mouth for visible objects. For dogs: open mouth wide and sweep with finger. For small pets: hold upside down and give gentle back blows.</p>
            </details>
          </div>
        </div>

        <div class="card" style="padding:var(--space-4)">
          <h4 style="margin-bottom:var(--space-3);display:flex;align-items:center;gap:var(--space-2)">
            <span class="material-icons-round" style="color:var(--color-primary);font-size:18px">quick_reference</span>
            Symptom Urgency Checker
          </h4>
          <div style="display:flex;flex-direction:column;gap:var(--space-2)">
            <div class="urgency-item critical">
              <span class="urgency-dot"></span>
              <span><strong>CRITICAL:</strong> Unconscious, severe bleeding, difficulty breathing, suspected poisoning</span>
            </div>
            <div class="urgency-item high">
              <span class="urgency-dot"></span>
              <span><strong>HIGH:</strong> Vomiting blood, inability to stand, seizures, eye injuries</span>
            </div>
            <div class="urgency-item medium">
              <span class="urgency-dot"></span>
              <span><strong>MODERATE:</strong> Persistent vomiting, limping, swelling, loss of appetite (2+ days)</span>
            </div>
            <div class="urgency-item low">
              <span class="urgency-dot"></span>
              <span><strong>LOW:</strong> Mild diarrhea, minor scratches, occasional coughing, slight lethargy</span>
            </div>
          </div>
        </div>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Close</button>
      <a href="tel:+919876543210" class="btn btn-primary" style="background:var(--color-error)">
        <span class="material-icons-round">call</span>
        Call Emergency Now
      </a>
    `);
    });
}
