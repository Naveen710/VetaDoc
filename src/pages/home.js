// ═══════════════════════════════════════════════════
// VetaDoc — Home Page
// ═══════════════════════════════════════════════════

import { products, categories } from '../data/products.js';
import { renderProductCard } from '../components/productCard.js';
import { addToCart } from '../store.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export default function renderHome(container) {
    const featuredProducts = products.filter(p => p.featured).slice(0, 6);

    container.innerHTML = `
    <div class="page-container">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-content">
          <h1>Your Pet's Health, <span class="highlight">Delivered.</span></h1>
          <p>India's most trusted veterinary pharmacy. Order medicines, book vet consultations, manage pet health profiles — all in one place.</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" id="hero-shop-btn">
              <span class="material-icons-round">storefront</span>
              Shop Now
            </button>
            <button class="btn btn-secondary btn-lg" id="hero-consult-btn" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.3);color:white;">
              <span class="material-icons-round">video_call</span>
              Consult a Vet
            </button>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <div class="stat-number">10K+</div>
              <div class="stat-label">Products</div>
            </div>
            <div class="hero-stat">
              <div class="stat-number">500+</div>
              <div class="stat-label">Veterinarians</div>
            </div>
            <div class="hero-stat">
              <div class="stat-number">2M+</div>
              <div class="stat-label">Happy Pets</div>
            </div>
            <div class="hero-stat">
              <div class="stat-number">4.8★</div>
              <div class="stat-label">Rating</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:var(--space-4);margin-bottom:var(--space-10)">
        <div class="card" style="padding:var(--space-5);display:flex;gap:var(--space-4);align-items:center">
          <div class="stat-icon green"><span class="material-icons-round">verified</span></div>
          <div><div style="font-weight:var(--font-semibold);font-size:var(--text-sm)">Prescription Verified</div><div style="font-size:var(--text-xs);color:var(--text-tertiary)">Licensed pharmacist verification</div></div>
        </div>
        <div class="card" style="padding:var(--space-5);display:flex;gap:var(--space-4);align-items:center">
          <div class="stat-icon blue"><span class="material-icons-round">local_shipping</span></div>
          <div><div style="font-weight:var(--font-semibold);font-size:var(--text-sm)">Free Delivery ₹499+</div><div style="font-size:var(--text-xs);color:var(--text-tertiary)">Fast & reliable doorstep delivery</div></div>
        </div>
        <div class="card" style="padding:var(--space-5);display:flex;gap:var(--space-4);align-items:center">
          <div class="stat-icon purple"><span class="material-icons-round">batch_prediction</span></div>
          <div><div style="font-weight:var(--font-semibold);font-size:var(--text-sm)">Batch Tracking</div><div style="font-size:var(--text-xs);color:var(--text-tertiary)">Full transparency on batch & expiry</div></div>
        </div>
        <div class="card" style="padding:var(--space-5);display:flex;gap:var(--space-4);align-items:center">
          <div class="stat-icon amber"><span class="material-icons-round">pets</span></div>
          <div><div style="font-weight:var(--font-semibold);font-size:var(--text-sm)">Pet Profiles</div><div style="font-size:var(--text-xs);color:var(--text-tertiary)">Smart recommendations for your pets</div></div>
        </div>
      </section>

      <!-- Categories -->
      <section>
        <div class="section-header">
          <h2><span class="material-icons-round">category</span> Shop by Category</h2>
          <button class="btn btn-ghost" id="view-all-cats-btn">View All <span class="material-icons-round" style="font-size:16px">arrow_forward</span></button>
        </div>
        <div class="categories-grid">
          ${categories.map(c => `
            <div class="category-card" data-cat-id="${c.id}">
              <span class="cat-icon">${c.icon}</span>
              <div class="cat-name">${c.name}</div>
              <div class="cat-count">${c.count} products</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Promo Banner -->
      <div class="promo-banner">
        <div class="promo-content">
          <h3>🩺 Book a Vet Consultation Today!</h3>
          <p>Get expert advice from certified veterinarians via video call. First consultation at ₹299 only!</p>
        </div>
        <button class="btn" id="promo-consult-btn">Book Now</button>
      </div>

      <!-- Featured Products -->
      <section>
        <div class="section-header">
          <h2><span class="material-icons-round">star</span> Featured Products</h2>
          <button class="btn btn-ghost" id="view-all-products-btn">View All <span class="material-icons-round" style="font-size:16px">arrow_forward</span></button>
        </div>
        <div class="product-grid">
          ${featuredProducts.map(p => renderProductCard(p)).join('')}
        </div>
      </section>

      <!-- Trust Banner -->
      <section style="margin-top:var(--space-12);text-align:center;padding:var(--space-10);background:var(--gradient-card);border-radius:var(--radius-2xl);border:1px solid var(--border-color)">
        <h2 style="margin-bottom:var(--space-3)">Trusted by 50,000+ Pet Parents & Farmers</h2>
        <p style="color:var(--text-secondary);max-width:600px;margin:0 auto var(--space-6)">VetaDoc ensures every product is genuine, backed by batch tracking and pharmacist-verified prescriptions.</p>
        <div style="display:flex;justify-content:center;gap:var(--space-8);flex-wrap:wrap">
          <div style="text-align:center"><span style="font-size:32px">🏥</span><div style="font-size:var(--text-sm);font-weight:var(--font-medium);margin-top:var(--space-2)">Licensed Pharmacy</div></div>
          <div style="text-align:center"><span style="font-size:32px">✅</span><div style="font-size:var(--text-sm);font-weight:var(--font-medium);margin-top:var(--space-2)">Genuine Products</div></div>
          <div style="text-align:center"><span style="font-size:32px">🔒</span><div style="font-size:var(--text-sm);font-weight:var(--font-medium);margin-top:var(--space-2)">Secure Payments</div></div>
          <div style="text-align:center"><span style="font-size:32px">↩️</span><div style="font-size:var(--text-sm);font-weight:var(--font-medium);margin-top:var(--space-2)">Easy Returns</div></div>
        </div>
      </section>
    </div>
  `;

    // Event listeners
    document.getElementById('hero-shop-btn')?.addEventListener('click', () => navigate('/catalog'));
    document.getElementById('hero-consult-btn')?.addEventListener('click', () => navigate('/consultation'));
    document.getElementById('promo-consult-btn')?.addEventListener('click', () => navigate('/consultation'));
    document.getElementById('view-all-cats-btn')?.addEventListener('click', () => navigate('/catalog'));
    document.getElementById('view-all-products-btn')?.addEventListener('click', () => navigate('/catalog'));

    // Category clicks
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            window.__vetadoc_category = card.dataset.catId;
            navigate('/catalog');
        });
    });

    // Product card clicks
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('[data-add-cart]') || e.target.closest('.product-card-wishlist')) return;
            navigate('/product/' + card.dataset.productId);
        });
    });

    // Add to cart
    document.querySelectorAll('[data-add-cart]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = products.find(p => p.id === parseInt(btn.dataset.addCart));
            if (product) {
                addToCart(product);
                showToast('Added to Cart', `${product.name} added to your cart`, 'success');
            }
        });
    });
}
