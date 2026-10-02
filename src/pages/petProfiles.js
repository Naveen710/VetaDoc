// ═══════════════════════════════════════════════════
// VetaDoc — Pet Profiles Page
// ═══════════════════════════════════════════════════

import { getState, addPet, removePet } from '../store.js';
import { formatDate, daysUntil, generateId } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { navigate } from '../router.js';

export default function renderPetProfiles(container) {
    function render() {
        const state = getState();
        const pets = state.pets;

        const speciesEmoji = { dog: '🐕', cat: '🐈', cattle: '🐄', buffalo: '🐃', goat: '🐐', sheep: '🐑', poultry: '🐔', bird: '🐦', horse: '🐴', fish: '🐟' };

        container.innerHTML = `
      <div class="page-container">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-6);flex-wrap:wrap;gap:var(--space-4)">
          <div>
            <h1 style="font-size:var(--text-2xl);display:flex;align-items:center;gap:var(--space-3)">
              <span class="material-icons-round" style="color:var(--color-primary)">pets</span>
              My Animals
            </h1>
            <p style="color:var(--text-secondary);margin-top:var(--space-2);font-size:var(--text-sm)">Health records, vaccine plans and reminders for every pet and farm animal.</p>
          </div>
          <button class="btn btn-primary" id="add-pet-btn">
            <span class="material-icons-round">add</span>
            Add animal
          </button>
        </div>

        ${pets.length === 0 ? `
          <div class="empty-state">
            <span class="material-icons-round">pets</span>
            <h3>No pets added yet</h3>
            <p>Add your first pet to get personalized recommendations and track their health.</p>
            <button class="btn btn-primary" id="add-first-pet-btn">Add a Pet</button>
          </div>
        ` : `
          <div class="pet-grid">
            ${pets.map(pet => `
              <div class="pet-card">
                <div class="pet-card-header">
                  <div class="pet-avatar">${pet.emoji || speciesEmoji[pet.species] || '🐾'}</div>
                  <div>
                    <h3 style="margin-bottom:2px">${pet.name}</h3>
                    <div style="font-size:var(--text-sm);color:var(--text-secondary)">${pet.breed} · ${pet.gender}</div>
                  </div>
                </div>
                <div class="pet-card-body">
                  <div class="pet-detail-row">
                    <span class="label">Species</span>
                    <span class="value">${pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}</span>
                  </div>
                  <div class="pet-detail-row">
                    <span class="label">Age</span>
                    <span class="value">${pet.age} year${pet.age !== 1 ? 's' : ''}</span>
                  </div>
                  <div class="pet-detail-row">
                    <span class="label">Weight</span>
                    <span class="value">${pet.weight} kg</span>
                  </div>

                  ${pet.healthNotes ? `
                    <div style="margin-top:var(--space-3);padding:var(--space-3);background:var(--bg-secondary);border-radius:var(--radius-md);font-size:var(--text-xs);color:var(--text-secondary)">
                      <span class="material-icons-round" style="font-size:14px;vertical-align:middle;color:var(--color-info)">info</span>
                      ${pet.healthNotes}
                    </div>
                  ` : ''}

                  ${pet.vaccinations && pet.vaccinations.length > 0 ? `
                    <div class="vaccination-list">
                      <div style="font-size:var(--text-xs);font-weight:var(--font-semibold);text-transform:uppercase;letter-spacing:0.5px;color:var(--text-tertiary);margin-bottom:var(--space-2)">Vaccinations</div>
                      ${pet.vaccinations.map(v => {
            const daysLeft = daysUntil(v.nextDue);
            const urgent = daysLeft <= 30;
            return `
                          <div class="vaccination-item">
                            <span class="material-icons-round" style="color:${urgent ? 'var(--color-warning)' : 'var(--color-success)'}">
                              ${urgent ? 'warning' : 'check_circle'}
                            </span>
                            <div style="flex:1">
                              <div style="font-weight:var(--font-medium)">${v.name}</div>
                              <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Done: ${formatDate(v.date)}</div>
                            </div>
                            <div style="text-align:right">
                              <div style="font-size:var(--text-xs);${urgent ? 'color:var(--color-warning);font-weight:var(--font-semibold)' : 'color:var(--text-tertiary)'}">
                                ${urgent ? `Due in ${daysLeft}d` : `Next: ${formatDate(v.nextDue)}`}
                              </div>
                            </div>
                          </div>
                        `;
        }).join('')}
                    </div>
                  ` : ''}

                  <div style="display:flex;gap:var(--space-2);margin-top:var(--space-4)">
                    <button class="btn btn-primary btn-sm" style="flex:1" data-open-record="${pet.id}">
                      <span class="material-icons-round" style="font-size:14px">folder_shared</span>
                      Health record
                    </button>
                    <button class="btn btn-secondary btn-sm" style="flex:1" data-shop-for="${pet.species}">
                      <span class="material-icons-round" style="font-size:14px">storefront</span>
                      Shop for ${pet.name}
                    </button>
                    <button class="btn btn-ghost btn-sm" data-remove-pet="${pet.id}" title="Remove pet" style="color:var(--color-error)">
                      <span class="material-icons-round" style="font-size:14px">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

        // Events
        const addPetHandler = () => {
            openModal('Add New Pet', `
        <div style="display:flex;flex-direction:column;gap:var(--space-4)">
          <div class="input-group">
            <label>Pet Name *</label>
            <input type="text" class="input" id="pet-name" placeholder="e.g., Max" required />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
            <div class="input-group">
              <label>Species *</label>
              <select class="select" id="pet-species">
                <option value="dog">🐕 Dog</option>
                <option value="cat">🐈 Cat</option>
                <option value="cattle">🐄 Cow / bull</option>
                <option value="buffalo">🐃 Buffalo</option>
                <option value="goat">🐐 Goat</option>
                <option value="sheep">🐑 Sheep</option>
                <option value="poultry">🐔 Poultry</option>
                <option value="bird">🐦 Pet bird</option>
                <option value="horse">🐴 Horse</option>
                <option value="fish">🐟 Fish</option>
              </select>
            </div>
            <div class="input-group">
              <label>Gender</label>
              <select class="select" id="pet-gender">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label>Breed</label>
            <input type="text" class="input" id="pet-breed" placeholder="e.g., Labrador Retriever" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
            <div class="input-group">
              <label>Date of birth (or best guess)</label>
              <input type="date" class="input" id="pet-dob" max="${new Date().toISOString().slice(0, 10)}" />
            </div>
            <div class="input-group">
              <label>Weight (kg)</label>
              <input type="number" class="input" id="pet-weight" placeholder="e.g., 25" min="0" step="0.5" />
            </div>
          </div>
          <div class="input-group">
            <label>Health Notes</label>
            <textarea class="input" id="pet-health" rows="2" placeholder="Any allergies, conditions, or special needs..."></textarea>
          </div>
        </div>
      `, `
        <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
        <button class="btn btn-primary" id="save-pet-btn">
          <span class="material-icons-round">pets</span>
          Add Pet
        </button>
      `);

            setTimeout(() => {
                document.getElementById('save-pet-btn')?.addEventListener('click', () => {
                    const name = document.getElementById('pet-name')?.value.trim();
                    if (!name) {
                        showToast('Missing Info', 'Please enter a pet name', 'warning');
                        return;
                    }
                    const species = document.getElementById('pet-species')?.value || 'dog';
                    const pet = {
                        id: generateId(),
                        name,
                        species,
                        breed: document.getElementById('pet-breed')?.value || 'Mixed',
                        dob: document.getElementById('pet-dob')?.value || null,
                        age: (() => { const d = document.getElementById('pet-dob')?.value; return d ? Math.max(0, Math.floor((Date.now() - Date.parse(d)) / 31557600000)) : 1; })(),
                        records: [],
                        allergies: [],
                        conditions: [],
                        weight: parseFloat(document.getElementById('pet-weight')?.value) || 5,
                        gender: document.getElementById('pet-gender')?.value || 'Male',
                        emoji: speciesEmoji[species] || '🐾',
                        vaccinations: [],
                        healthNotes: document.getElementById('pet-health')?.value || ''
                    };
                    addPet(pet);
                    closeModal();
                    showToast('Pet Added!', `${pet.name} has been added to your profiles`, 'success');
                    render();
                });
            }, 100);
        };

        document.getElementById('add-pet-btn')?.addEventListener('click', addPetHandler);
        document.getElementById('add-first-pet-btn')?.addEventListener('click', addPetHandler);

        document.querySelectorAll('[data-remove-pet]').forEach(btn => {
            btn.addEventListener('click', () => {
                removePet(btn.dataset.removePet);
                showToast('Pet Removed', '', 'info');
                render();
            });
        });

        document.querySelectorAll('[data-open-record]').forEach(btn => {
            btn.addEventListener('click', () => navigate('/pets/' + btn.dataset.openRecord));
        });

        document.querySelectorAll('[data-shop-for]').forEach(btn => {
            btn.addEventListener('click', () => {
                window.__vetadoc_category = '';
                window.__vetadoc_species = btn.dataset.shopFor;
                navigate('/catalog');
            });
        });
    }

    render();
}
