// ═══════════════════════════════════════════════════
// VetaDoc — State Management (Store)
// ═══════════════════════════════════════════════════

import { sampleOrders, sampleConsultations } from './data/orders.js';

const STORAGE_KEY = 'vetadoc_state';

const defaultState = {
    cart: [],
    theme: 'light',
    user: {
        name: 'Praveen',
        email: 'praveen@example.com',
        phone: '+91 98765 43210',
        address: '42 Green Park, Jubilee Hills, Hyderabad - 500033'
    },
    pets: [
        {
            id: 'pet-1',
            name: 'Bruno',
            species: 'dog',
            breed: 'Golden Retriever',
            age: 4,
            weight: 32,
            gender: 'Male',
            emoji: '🐕',
            vaccinations: [
                { name: 'Rabies', date: '2025-09-15', nextDue: '2026-09-15' },
                { name: 'DHPP', date: '2025-08-10', nextDue: '2026-08-10' },
                { name: 'Bordetella', date: '2025-11-20', nextDue: '2026-05-20' },
            ],
            healthNotes: 'Mild food allergy (chicken). Prefers lamb-based diet.'
        },
        {
            id: 'pet-2',
            name: 'Luna',
            species: 'cat',
            breed: 'Persian',
            age: 2,
            weight: 4.5,
            gender: 'Female',
            emoji: '🐈',
            vaccinations: [
                { name: 'FVRCP', date: '2025-07-05', nextDue: '2026-07-05' },
                { name: 'Rabies', date: '2025-07-05', nextDue: '2026-07-05' },
            ],
            healthNotes: 'Occasional hairball issues. Regular grooming schedule maintained.'
        }
    ],
    orders: sampleOrders,
    consultations: sampleConsultations,
    prescriptions: [],
};

let state = loadState();
const listeners = new Set();

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...defaultState, ...parsed };
        }
    } catch (e) { /* ignore */ }
    return { ...defaultState };
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
}

export function getState() {
    return state;
}

export function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

function notify() {
    saveState();
    listeners.forEach(fn => fn(state));
}

// ── Cart Actions ──

export function addToCart(product, qty = 1) {
    const existing = state.cart.find(i => i.productId === product.id);
    if (existing) {
        existing.qty += qty;
    } else {
        state.cart.push({
            productId: product.id,
            name: product.name,
            emoji: product.emoji,
            price: product.price,
            brand: product.brand,
            prescriptionRequired: product.prescriptionRequired,
            qty
        });
    }
    notify();
}

export function removeFromCart(productId) {
    state.cart = state.cart.filter(i => i.productId !== productId);
    notify();
}

export function updateCartQty(productId, qty) {
    const item = state.cart.find(i => i.productId === productId);
    if (item) {
        if (qty <= 0) {
            removeFromCart(productId);
        } else {
            item.qty = qty;
            notify();
        }
    }
}

export function clearCart() {
    state.cart = [];
    notify();
}

export function getCartTotal() {
    return state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function getCartCount() {
    return state.cart.reduce((sum, i) => sum + i.qty, 0);
}

// ── Theme ──

export function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    notify();
}

export function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

// ── Pets ──

export function addPet(pet) {
    state.pets.push(pet);
    notify();
}

export function removePet(petId) {
    state.pets = state.pets.filter(p => p.id !== petId);
    notify();
}

// ── Consultations ──

export function bookConsultation(consultation) {
    state.consultations.push(consultation);
    notify();
}

// ── Orders ──

export function placeOrder(orderData) {
    state.orders.unshift(orderData);
    state.cart = [];
    notify();
}

export function reorderItems(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.items.forEach(item => {
            const existing = state.cart.find(c => c.productId === item.productId);
            if (!existing) {
                state.cart.push({
                    productId: item.productId,
                    name: item.name,
                    emoji: item.emoji,
                    price: item.price,
                    brand: item.brand || '',
                    prescriptionRequired: false,
                    qty: item.qty
                });
            }
        });
        notify();
    }
}

// ── Reset ──
export function resetState() {
    localStorage.removeItem(STORAGE_KEY);
    state = { ...defaultState };
    notify();
}
