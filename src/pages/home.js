// ═══════════════════════════════════════════════════
// VetaDoc — Home Page (2026 refresh)
// ═══════════════════════════════════════════════════

import { products, categories, species } from '../data/products.js';
import { renderProductCard } from '../components/productCard.js';
import { addToCart, getState } from '../store.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';
import { buildSchedule } from '../../shared/vaccineSchedules.js';

const tileClass = id => `tile-${id}`;

export default function renderHome(container) {
  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  const pet = getState().pets?.[0];
  const nextDue = pet ? buildSchedule(pet).find(s => s.status !== 'done') : null;

  container.innerHTML = `
    <div class="page-container">

      <!-- Hero -->
      <section class="hero-v2">
        <div>
          <div class="hero-eyebrow"><span class="dot">New</span> Vet-verified prescriptions · WhatsApp reminders</div>
          <h1>Care for every animal, <em>from pet to herd.</em></h1>
          <p class="lead">Talk to a registered veterinarian in minutes, get genuine batch-tracked medicines at your door, and keep every vaccine and visit in one health record.</p>
          <div class="hero-actions">
            <button class="btn btn-coral btn-lg" id="hero-consult-btn">
              <span class="material-icons-round">video_call</span> Consult a vet
            </button>
            <button class="btn btn-glass btn-lg" id="hero-shop-btn">
              <span class="material-icons-round">storefront</span> Shop medicines
            </button>
          </div>
          <div class="hero-proof">
            <span><span class="material-icons-round">verified_user</span> Registered vets only</span>
            <span><span class="material-icons-round">fact_check</span> Pharmacist-checked Rx</span>
            <span><span class="material-icons-round">translate</span> English · తెలుగు · हिंदी</span>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="hv-card hv-pet">
            <div class="hv-row">
              <div class="hv-avatar">${pet?.emoji || '🐕'}</div>
              <div>
                <div class="hv-title">${pet?.name || 'Bruno'}</div>
                <div class="hv-sub">${pet ? `${pet.breed} · ${pet.age} yrs · ${pet.weight} kg` : 'Golden Retriever · 4 yrs'}</div>
              </div>
            </div>
            <div class="hv-chips">
              <span class="hv-chip">Health record</span>
              <span class="hv-chip">3 vaccines on file</span>
              ${pet?.healthNotes ? '<span class="hv-chip warn">Allergy noted</span>' : ''}
            </div>
          </div>
          <div class="hv-card hv-vax">
            <div class="hv-title">Next vaccine</div>
            <div class="hv-sub">${nextDue ? `${nextDue.name} · ${nextDue.dueLabel}` : 'Rabies booster · due soon'}</div>
            <div class="hv-bar"><i></i></div>
          </div>
          <div class="hv-card hv-rx">
            <span class="material-icons-round">medication</span>
            <div>
              <div class="hv-title" style="font-size:14px">Prescription verified</div>
              <div class="hv-sub">Pharmacist approved · dispatching</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust strip -->
      <section class="trust-strip">
        <div class="trust-item"><span class="material-icons-round">badge</span><div><b>Council-registered vets</b><span>Registration checked at onboarding</span></div></div>
        <div class="trust-item"><span class="material-icons-round">qr_code_2</span><div><b>Batch &amp; expiry tracked</b><span>Recorded on every dispatch</span></div></div>
        <div class="trust-item"><span class="material-icons-round">local_shipping</span><div><b>Free delivery ₹499+</b><span>Cold-chain for vaccines</span></div></div>
        <div class="trust-item"><span class="material-icons-round">lock</span><div><b>Your data stays yours</b><span>Consent-first, export any time</span></div></div>
      </section>

      <!-- Services -->
      <section class="section">
        <div class="section-head">
          <div>
            <div class="section-kicker">Everything in one place</div>
            <h2 class="section-title">What would you like to do today?</h2>
          </div>
        </div>
        <div class="service-grid">
          <div class="service-tile" data-go="/consultation">
            <div class="ico coral"><span class="material-icons-round">video_call</span></div>
            <h3>Consult a vet</h3>
            <p>Video or audio call with a registered vet. Prescription and notes saved to your pet's record.</p>
            <span class="go">Book a slot <span class="material-icons-round" style="font-size:16px">arrow_forward</span></span>
          </div>
          <div class="service-tile" data-go="/catalog">
            <div class="ico teal"><span class="material-icons-round">medication</span></div>
            <h3>Order medicines</h3>
            <p>Genuine veterinary medicines and supplements. Rx items are checked by our pharmacist.</p>
            <span class="go">Shop now <span class="material-icons-round" style="font-size:16px">arrow_forward</span></span>
          </div>
          <div class="service-tile" data-go="/samples">
            <div class="ico blue"><span class="material-icons-round">science</span></div>
            <h3>Lab tests at home</h3>
            <p>Blood, urine and skin samples collected from home. Reports land in the health record.</p>
            <span class="go">Book pickup <span class="material-icons-round" style="font-size:16px">arrow_forward</span></span>
          </div>
          <div class="service-tile" data-go="/pets">
            <div class="ico amber"><span class="material-icons-round">vaccines</span></div>
            <h3>Vaccine planner</h3>
            <p>A schedule built for your animal's species and age, with WhatsApp reminders before each dose.</p>
            <span class="go">See schedule <span class="material-icons-round" style="font-size:16px">arrow_forward</span></span>
          </div>
        </div>
      </section>

      <!-- Species -->
      <section class="section">
        <div class="section-head">
          <div>
            <div class="section-kicker">Shop by animal</div>
            <h2 class="section-title">Care for every species</h2>
          </div>
        </div>
        <div class="species-row">
          ${species.map(s => `<button class="species-chip" data-species="${s.id}"><span class="e">${s.icon}</span>${s.name}</button>`).join('')}
        </div>
      </section>

      <!-- Categories -->
      <section class="section">
        <div class="section-head">
          <div>
            <div class="section-kicker">Pharmacy</div>
            <h2 class="section-title">Shop by category</h2>
          </div>
          <button class="btn btn-ghost" id="view-all-cats-btn">View all <span class="material-icons-round" style="font-size:16px">arrow_forward</span></button>
        </div>
        <div class="categories-grid">
          ${categories.map(c => `
            <div class="category-card ${tileClass(c.id)}" data-cat-id="${c.id}">
              <span class="cat-icon">${c.icon}</span>
              <div class="cat-name">${c.name}</div>
              <div class="cat-count">${c.count} products</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Featured Products -->
      <section class="section">
        <div class="section-head">
          <div>
            <div class="section-kicker">Vet picks</div>
            <h2 class="section-title">Featured products</h2>
          </div>
          <button class="btn btn-ghost" id="view-all-products-btn">View all <span class="material-icons-round" style="font-size:16px">arrow_forward</span></button>
        </div>
        <div class="product-grid">
          ${featuredProducts.map(p => renderProductCard(p)).join('')}
        </div>
      </section>

      <!-- How it works -->
      <section class="section">
        <div class="section-head">
          <div>
            <div class="section-kicker">How prescriptions work</div>
            <h2 class="section-title">Safe medicines in three steps</h2>
            <p class="section-sub">Prescription-only medicines are never sold without a valid prescription. That protects your animal and slows antimicrobial resistance.</p>
          </div>
        </div>
        <div class="steps">
          <div class="step"><h4>Vet prescribes</h4><p>Your VetaDoc vet issues an e-prescription after the consult, or you upload one from your own vet.</p></div>
          <div class="step"><h4>Pharmacist verifies</h4><p>A licensed pharmacist checks the drug, dose and species before the order is packed.</p></div>
          <div class="step"><h4>Delivered and recorded</h4><p>Batch number and expiry are saved, and the course is added to your pet's health record.</p></div>
        </div>
      </section>

      <!-- Farmers -->
      <section class="section farm-band">
        <div>
          <div class="section-kicker">For dairy farmers</div>
          <h2>Your herd's health, on WhatsApp</h2>
          <p class="section-sub">Built with vets who have worked in villages across Telangana and Andhra Pradesh.</p>
          <ul>
            <li><span class="material-icons-round">event_available</span> Seasonal FMD, HS and BQ vaccination reminders for every animal</li>
            <li><span class="material-icons-round">water_drop</span> Milk-withdrawal dates after antibiotics, so you know when milk is safe to sell</li>
            <li><span class="material-icons-round">record_voice_over</span> Send a voice note in Telugu and get a call back from a vet</li>
          </ul>
          <button class="btn btn-primary" id="farm-cta"><span class="material-icons-round">agriculture</span> Register my animals</button>
        </div>
        <div class="farm-stat-grid">
          <div class="farm-stat"><b>🐄 Cattle &amp; buffalo</b><span>Mastitis, deworming, mineral mixtures</span></div>
          <div class="farm-stat"><b>🐐 Sheep &amp; goats</b><span>PPR, ET vaccines, dewormers</span></div>
          <div class="farm-stat"><b>🐔 Poultry</b><span>Ranikhet, gumboro schedules</span></div>
          <div class="farm-stat"><b>🚑 Emergency</b><span>Bloat, calving trouble — tap SOS</span></div>
        </div>
      </section>
    </div>
  `;

  // Event listeners
  const go = (id, path) => document.getElementById(id)?.addEventListener('click', () => navigate(path));
  go('hero-shop-btn', '/catalog');
  go('hero-consult-btn', '/consultation');
  go('view-all-cats-btn', '/catalog');
  go('view-all-products-btn', '/catalog');
  go('farm-cta', '/pets');

  container.querySelectorAll('.service-tile').forEach(t => t.addEventListener('click', () => navigate(t.dataset.go)));

  container.querySelectorAll('.species-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      window.__vetadoc_species = chip.dataset.species;
      navigate('/catalog');
    });
  });

  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      window.__vetadoc_category = card.dataset.catId;
      navigate('/catalog');
    });
  });

  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-add-cart]') || e.target.closest('.product-card-wishlist')) return;
      navigate('/product/' + card.dataset.productId);
    });
  });

  container.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const product = products.find(p => p.id === parseInt(btn.dataset.addCart));
      if (product) {
        addToCart(product);
        showToast('Added to cart', `${product.name} added to your cart`, 'success');
      }
    });
  });
}
