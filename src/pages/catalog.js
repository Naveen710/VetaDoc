// ═══════════════════════════════════════════════════
// VetaDoc — Product Catalog Page
// ═══════════════════════════════════════════════════

import { products } from '../data/products.js';
import { renderProductCard } from '../components/productCard.js';
import { renderSidebar } from '../components/sidebar.js';
import { addToCart } from '../store.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';
import { debounce } from '../utils/helpers.js';

export default function renderCatalog(container) {
    let filters = {
        search: window.__vetadoc_search || '',
        category: window.__vetadoc_category || '',
        species: window.__vetadoc_species || '',
        brand: '',
        maxPrice: 1100,
        inStock: false,
        rxOnly: false,
        sort: 'popular'
    };

    // Clear globals
    window.__vetadoc_search = '';
    window.__vetadoc_category = '';
    window.__vetadoc_species = '';

    function getFilteredProducts() {
        return products.filter(p => {
            if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
                !p.category.toLowerCase().includes(filters.search.toLowerCase()) &&
                !p.brand.toLowerCase().includes(filters.search.toLowerCase())) return false;
            if (filters.category && p.category !== filters.category) return false;
            if (filters.species && !p.species.includes(filters.species)) return false;
            if (filters.brand && p.brand !== filters.brand) return false;
            if (p.price > filters.maxPrice) return false;
            if (filters.inStock && p.stock === 0) return false;
            if (filters.rxOnly && !p.prescriptionRequired) return false;
            return true;
        }).sort((a, b) => {
            switch (filters.sort) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'rating': return b.rating - a.rating;
                case 'name': return a.name.localeCompare(b.name);
                default: return b.reviews - a.reviews; // popular
            }
        });
    }

    function render() {
        const filtered = getFilteredProducts();

        container.innerHTML = `
      <div class="page-container">
        <div class="section-header" style="margin-bottom:var(--space-4)">
          <div>
            <h1 style="font-size:var(--text-2xl)">
              <span class="material-icons-round" style="color:var(--color-primary)">inventory_2</span>
              Product Catalog
            </h1>
            <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:var(--space-1)">${filtered.length} products found</p>
          </div>
        </div>
        <div class="page-with-sidebar">
          ${renderSidebar(filters)}
          <main>
            <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-6);flex-wrap:wrap;align-items:center">
              <div class="input-with-icon" style="flex:1;min-width:250px">
                <span class="material-icons-round">search</span>
                <input type="text" class="input" id="catalog-search" placeholder="Search products..." value="${filters.search}" />
              </div>
              <select class="select" id="catalog-sort" style="width:200px">
                <option value="popular" ${filters.sort === 'popular' ? 'selected' : ''}>Most Popular</option>
                <option value="price-low" ${filters.sort === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price-high" ${filters.sort === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
                <option value="rating" ${filters.sort === 'rating' ? 'selected' : ''}>Highest Rated</option>
                <option value="name" ${filters.sort === 'name' ? 'selected' : ''}>Name A-Z</option>
              </select>
            </div>

            ${filters.search || filters.category || filters.species || filters.brand || filters.inStock || filters.rxOnly ?
                `<div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-4);flex-wrap:wrap">
                ${filters.search ? `<span class="tag active">🔍 "${filters.search}" <span class="material-icons-round" style="font-size:12px;cursor:pointer" data-clear="search">close</span></span>` : ''}
                ${filters.category ? `<span class="tag active">📁 ${filters.category} <span class="material-icons-round" style="font-size:12px;cursor:pointer" data-clear="category">close</span></span>` : ''}
                ${filters.species ? `<span class="tag active">🐾 ${filters.species} <span class="material-icons-round" style="font-size:12px;cursor:pointer" data-clear="species">close</span></span>` : ''}
                ${filters.brand ? `<span class="tag active">🏷️ ${filters.brand} <span class="material-icons-round" style="font-size:12px;cursor:pointer" data-clear="brand">close</span></span>` : ''}
                ${filters.inStock ? `<span class="tag active">✅ In Stock <span class="material-icons-round" style="font-size:12px;cursor:pointer" data-clear="inStock">close</span></span>` : ''}
                ${filters.rxOnly ? `<span class="tag active">💊 Rx Only <span class="material-icons-round" style="font-size:12px;cursor:pointer" data-clear="rxOnly">close</span></span>` : ''}
              </div>` : ''}

            ${filtered.length > 0 ? `
              <div class="product-grid">
                ${filtered.map(p => renderProductCard(p)).join('')}
              </div>
            ` : `
              <div class="empty-state">
                <span class="material-icons-round">search_off</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button class="btn btn-primary" id="reset-search-btn">Clear Filters</button>
              </div>
            `}
          </main>
        </div>
      </div>
    `;

        bindEvents();
    }

    function bindEvents() {
        // Search
        const searchInput = document.getElementById('catalog-search');
        if (searchInput) {
            const searchHandler = debounce((e) => {
                filters.search = e.target.value;
                render();
            }, 300);
            searchInput.addEventListener('input', searchHandler);
            // Keep focus after re-render
            searchInput.focus();
            searchInput.selectionStart = searchInput.value.length;
        }

        // Sort
        document.getElementById('catalog-sort')?.addEventListener('change', (e) => {
            filters.sort = e.target.value;
            render();
        });

        // Sidebar filters
        document.querySelectorAll('[data-filter-species]').forEach(el => {
            el.addEventListener('click', () => {
                filters.species = filters.species === el.dataset.filterSpecies ? '' : el.dataset.filterSpecies;
                render();
            });
        });
        document.querySelectorAll('[data-filter-category]').forEach(el => {
            el.addEventListener('click', () => {
                filters.category = filters.category === el.dataset.filterCategory ? '' : el.dataset.filterCategory;
                render();
            });
        });
        document.querySelectorAll('[data-filter-brand]').forEach(el => {
            el.addEventListener('click', () => {
                filters.brand = filters.brand === el.dataset.filterBrand ? '' : el.dataset.filterBrand;
                render();
            });
        });
        document.querySelector('[data-filter-stock]')?.addEventListener('click', () => {
            filters.inStock = !filters.inStock;
            render();
        });
        document.querySelector('[data-filter-rx]')?.addEventListener('click', () => {
            filters.rxOnly = !filters.rxOnly;
            render();
        });

        // Price range
        document.getElementById('price-range-slider')?.addEventListener('input', (e) => {
            filters.maxPrice = parseInt(e.target.value);
            document.getElementById('price-range-value').textContent = `Up to ₹${filters.maxPrice}`;
        });
        document.getElementById('price-range-slider')?.addEventListener('change', () => render());

        // Clear filters
        document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
            filters = { search: '', category: '', species: '', brand: '', maxPrice: 1100, inStock: false, rxOnly: false, sort: filters.sort };
            render();
        });
        document.getElementById('reset-search-btn')?.addEventListener('click', () => {
            filters = { search: '', category: '', species: '', brand: '', maxPrice: 1100, inStock: false, rxOnly: false, sort: 'popular' };
            render();
        });

        // Clear individual filter tags
        document.querySelectorAll('[data-clear]').forEach(el => {
            el.addEventListener('click', () => {
                const key = el.dataset.clear;
                if (key === 'inStock') filters.inStock = false;
                else if (key === 'rxOnly') filters.rxOnly = false;
                else filters[key] = '';
                render();
            });
        });

        // Product clicks
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
                    showToast('Added to Cart', `${product.name}`, 'success');
                }
            });
        });
    }

    render();
}
