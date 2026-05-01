// ═══════════════════════════════════════════════════
// VetaDoc — Utility Helpers
// ═══════════════════════════════════════════════════

export function formatPrice(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

export function getDiscount(original, current) {
    return Math.round(((original - current) / original) * 100);
}

export function generateId() {
    return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

export function getStockStatus(stock) {
    if (stock === 0) return { class: 'stock-out', label: 'Out of Stock' };
    if (stock <= 10) return { class: 'stock-low', label: `Only ${stock} left` };
    return { class: 'stock-in', label: 'In Stock' };
}

export function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function daysUntil(dateStr) {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '<div class="stars">';
    for (let i = 0; i < full; i++) html += '<span class="material-icons-round">star</span>';
    if (half) html += '<span class="material-icons-round">star_half</span>';
    for (let i = 0; i < empty; i++) html += '<span class="material-icons-round empty">star</span>';
    html += '</div>';
    return html;
}

export function getSpeciesIcons(speciesArr) {
    const icons = { dog: '🐕', cat: '🐈', bird: '🐦', cattle: '🐄', horse: '🐴', fish: '🐟' };
    return speciesArr.map(s => icons[s] || '').join(' ');
}

export function animateElement(el, animationClass = 'animate-slideUp') {
    el.classList.remove(animationClass);
    void el.offsetWidth; // trigger reflow
    el.classList.add(animationClass);
}

export function truncateText(text, maxLen = 80) {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trim() + '…';
}
