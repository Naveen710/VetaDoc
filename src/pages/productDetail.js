// ═══════════════════════════════════════════════════
// VetaDoc — Product Detail Page
// ═══════════════════════════════════════════════════

import { products } from '../data/products.js';
import { addToCart } from '../store.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { formatPrice, getDiscount, getStockStatus, renderStars, formatDate, getSpeciesIcons } from '../utils/helpers.js';
import { renderProductCard } from '../components/productCard.js';

export default function renderProductDetail(container, params) {
    const productId = parseInt(params[0]);
    const product = products.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = `
      <div class="page-container">
        <div class="empty-state">
          <span class="material-icons-round">error_outline</span>
          <h3>Product Not Found</h3>
          <p>The product you're looking for doesn't exist.</p>
          <button class="btn btn-primary" onclick="location.hash='/catalog'">Browse Products</button>
        </div>
      </div>
    `;
        return;
    }

    const stock = getStockStatus(product.stock);
    const discount = getDiscount(product.originalPrice, product.price);
    const relatedProducts = products.filter(p => p.id !== product.id && (p.category === product.category || p.species.some(s => product.species.includes(s)))).slice(0, 4);

    container.innerHTML = `
    <div class="page-container">
      <div style="margin-bottom:var(--space-4)">
        <button class="btn btn-ghost" id="back-btn">
          <span class="material-icons-round">arrow_back</span> Back to Shop
        </button>
      </div>

      <div class="product-detail">
        <div class="product-image-main">
          <span class="product-emoji">${product.emoji}</span>
        </div>

        <div class="product-info">
          <div class="product-category">${product.category.replace('-', ' ')}</div>
          <h1 class="product-title">${product.name}</h1>
          <div class="product-brand">by <strong>${product.brand}</strong> · ${getSpeciesIcons(product.species)} For ${product.species.map(s => s.charAt(0).toUpperCase() + s.slice(1) + 's').join(', ')}</div>
          
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            ${renderStars(product.rating)}
            <span style="font-size:var(--text-sm);font-weight:var(--font-semibold)">${product.rating}</span>
            <span style="font-size:var(--text-sm);color:var(--text-tertiary)">(${product.reviews} reviews)</span>
          </div>

          <div class="product-price-section">
            <span class="product-price-main">${formatPrice(product.price)}</span>
            ${product.originalPrice > product.price ? `
              <span class="price-original" style="font-size:var(--text-lg)">${formatPrice(product.originalPrice)}</span>
              <span class="badge badge-success">${discount}% OFF</span>
            ` : ''}
          </div>

          <div class="stock-indicator ${stock.class}" style="font-size:var(--text-sm)">
            <span class="stock-dot"></span> ${stock.label}
          </div>

          ${product.prescriptionRequired ? `
            <div style="padding:var(--space-3) var(--space-4);background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:var(--radius-lg);display:flex;align-items:center;gap:var(--space-3)">
              <span class="material-icons-round" style="color:var(--color-secondary)">medication</span>
              <div>
                <div style="font-size:var(--text-sm);font-weight:var(--font-semibold);color:var(--color-secondary)">Prescription Required</div>
                <div style="font-size:var(--text-xs);color:var(--text-secondary)">Upload a valid vet prescription during checkout</div>
              </div>
            </div>
          ` : ''}

          <p class="product-description">${product.description}</p>

          <div class="product-meta-grid">
            <div class="meta-item">
              <span class="meta-label">Dosage</span>
              <span class="meta-value" style="font-size:var(--text-xs)">${product.dosage}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Batch No.</span>
              <span class="meta-value">${product.batchNo}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Expiry Date</span>
              <span class="meta-value">${formatDate(product.expiryDate)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Manufacturer</span>
              <span class="meta-value" style="font-size:var(--text-xs)">${product.manufacturer}</span>
            </div>
          </div>

          ${product.stock > 0 ? `
            <div class="product-actions">
              <div class="qty-control" id="detail-qty">
                <button id="detail-qty-minus"><span class="material-icons-round" style="font-size:16px">remove</span></button>
                <span id="detail-qty-value">1</span>
                <button id="detail-qty-plus"><span class="material-icons-round" style="font-size:16px">add</span></button>
              </div>
              <button class="btn btn-primary btn-lg" id="detail-add-cart" style="flex:1">
                <span class="material-icons-round">add_shopping_cart</span>
                Add to Cart — ${formatPrice(product.price)}
              </button>
            </div>
            ${product.prescriptionRequired ? `
              <button class="btn btn-secondary w-full" id="upload-rx-btn">
                <span class="material-icons-round">upload_file</span>
                Upload Prescription
              </button>
            ` : ''}
          ` : `
            <div class="product-actions">
              <button class="btn btn-secondary btn-lg w-full" disabled style="opacity:0.6">
                <span class="material-icons-round">remove_shopping_cart</span>
                Out of Stock
              </button>
            </div>
          `}
        </div>
      </div>

      <!-- Related Products -->
      ${relatedProducts.length > 0 ? `
        <section style="margin-top:var(--space-12)">
          <div class="section-header">
            <h2><span class="material-icons-round">recommend</span> Related Products</h2>
          </div>
          <div class="product-grid">
            ${relatedProducts.map(p => renderProductCard(p)).join('')}
          </div>
        </section>
      ` : ''}
    </div>
  `;

    // Events
    document.getElementById('back-btn')?.addEventListener('click', () => navigate('/catalog'));

    let qty = 1;
    document.getElementById('detail-qty-minus')?.addEventListener('click', () => {
        if (qty > 1) {
            qty--;
            document.getElementById('detail-qty-value').textContent = qty;
        }
    });
    document.getElementById('detail-qty-plus')?.addEventListener('click', () => {
        qty++;
        document.getElementById('detail-qty-value').textContent = qty;
    });

    document.getElementById('detail-add-cart')?.addEventListener('click', () => {
        addToCart(product, qty);
        showToast('Added to Cart', `${qty}x ${product.name}`, 'success');
    });

    // Upload prescription modal
    document.getElementById('upload-rx-btn')?.addEventListener('click', () => {
        openModal('Upload Prescription', `
      <div style="display:flex;flex-direction:column;gap:var(--space-4)">
        <p style="font-size:var(--text-sm);color:var(--text-secondary)">
          Upload a valid veterinary prescription for <strong>${product.name}</strong>. 
          Accepted formats: JPG, PNG, PDF (max 5MB).
        </p>
        <div style="border:2px dashed var(--border-color);border-radius:var(--radius-xl);padding:var(--space-8);text-align:center;cursor:pointer;transition:all var(--transition-fast)" 
             onmouseover="this.style.borderColor='var(--color-primary)';this.style.background='var(--color-primary-50)'" 
             onmouseout="this.style.borderColor='var(--border-color)';this.style.background='transparent'">
          <span class="material-icons-round" style="font-size:48px;color:var(--text-tertiary)">cloud_upload</span>
          <p style="margin-top:var(--space-2);font-weight:var(--font-medium)">Click to upload or drag & drop</p>
          <p style="font-size:var(--text-xs);color:var(--text-tertiary)">JPG, PNG, PDF up to 5MB</p>
        </div>
        <div class="input-group">
          <label>Prescribing Vet Name (optional)</label>
          <input type="text" class="input" placeholder="Dr. Name" />
        </div>
        <div class="input-group">
          <label>Notes (optional)</label>
          <textarea class="input" rows="2" placeholder="Any additional notes..."></textarea>
        </div>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
      <button class="btn btn-primary" id="submit-rx-btn">
        <span class="material-icons-round">check</span> Submit Prescription
      </button>
    `);

        setTimeout(() => {
            document.getElementById('submit-rx-btn')?.addEventListener('click', () => {
                closeModal();
                showToast('Prescription Uploaded', 'Your prescription has been submitted for verification', 'success');
            });
        }, 100);
    });

    // Related product clicks
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('[data-add-cart]') || e.target.closest('.product-card-wishlist')) return;
            navigate('/product/' + card.dataset.productId);
        });
    });

    document.querySelectorAll('[data-add-cart]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const p = products.find(p => p.id === parseInt(btn.dataset.addCart));
            if (p) {
                addToCart(p);
                showToast('Added to Cart', p.name, 'success');
            }
        });
    });
}
