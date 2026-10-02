// ═══════════════════════════════════════════════════
// VetaDoc — Product Card Component
// ═══════════════════════════════════════════════════

import { formatPrice, getDiscount, getStockStatus, getSpeciesIcons } from '../utils/helpers.js';

export function renderProductCard(product) {
    const stock = getStockStatus(product.stock);
    const discount = getDiscount(product.originalPrice, product.price);

    return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card-image tile-${product.category}">
        <span class="product-emoji">${product.emoji}</span>
        <div class="product-card-badges">
          ${discount > 0 ? `<span class="badge badge-success">${discount}% OFF</span>` : ''}
          ${product.prescriptionRequired ? `<span class="rx-badge"><span class="material-icons-round">medication</span> Rx Required</span>` : ''}
        </div>
        <button class="product-card-wishlist" title="Add to wishlist">
          <span class="material-icons-round">favorite_border</span>
        </button>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${product.category.replace('-', ' ')} · ${getSpeciesIcons(product.species)}</div>
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-brand">${product.brand}</div>
        <div class="stock-indicator ${stock.class}">
          <span class="stock-dot"></span> ${stock.label}
        </div>
        <div class="product-card-bottom">
          <div>
            <span class="product-card-price">${formatPrice(product.price)}</span>
            ${product.originalPrice > product.price ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
          </div>
          ${product.stock > 0 ? `
            <button class="add-to-cart-btn" data-add-cart="${product.id}" title="Add to cart">
              <span class="material-icons-round" style="font-size:18px">add_shopping_cart</span>
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
