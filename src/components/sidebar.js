// ═══════════════════════════════════════════════════
// VetaDoc — Sidebar Component
// ═══════════════════════════════════════════════════

import { categories, species, brands } from '../data/products.js';

export function renderSidebar(activeFilters = {}) {
    return `
    <aside class="sidebar" id="catalog-sidebar">
      <div class="sidebar-section">
        <div class="sidebar-title">Species</div>
        <div class="sidebar-list">
          ${species.map(s => `
            <div class="sidebar-item ${activeFilters.species === s.id ? 'active' : ''}" data-filter-species="${s.id}">
              <span>${s.icon}</span>
              <span>${s.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-title">Categories</div>
        <div class="sidebar-list">
          ${categories.map(c => `
            <div class="sidebar-item ${activeFilters.category === c.id ? 'active' : ''}" data-filter-category="${c.id}">
              <span>${c.icon}</span>
              <span>${c.name}</span>
              <span class="count">${c.count}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-title">Price Range</div>
        <div class="price-range">
          <input type="range" id="price-range-slider" min="0" max="1100" value="${activeFilters.maxPrice || 1100}" step="50" />
          <div class="range-labels">
            <span>₹0</span>
            <span id="price-range-value">Up to ₹${activeFilters.maxPrice || 1100}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-title">Brand</div>
        <div class="sidebar-list">
          ${brands.map(b => `
            <div class="sidebar-item ${activeFilters.brand === b ? 'active' : ''}" data-filter-brand="${b}">
              <span class="material-icons-round" style="font-size:14px">business</span>
              <span>${b}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-title">Availability</div>
        <div class="sidebar-list">
          <div class="sidebar-item ${activeFilters.inStock ? 'active' : ''}" data-filter-stock="true">
            <span class="material-icons-round" style="font-size:14px;color:var(--color-success)">check_circle</span>
            <span>In Stock Only</span>
          </div>
          <div class="sidebar-item ${activeFilters.rxOnly ? 'active' : ''}" data-filter-rx="true">
            <span class="material-icons-round" style="font-size:14px;color:var(--color-secondary)">medication</span>
            <span>Prescription Items</span>
          </div>
        </div>
      </div>

      <button class="btn btn-secondary w-full" id="clear-filters-btn" style="margin-top:var(--space-2)">
        <span class="material-icons-round">filter_alt_off</span>
        Clear All Filters
      </button>
    </aside>
  `;
}
