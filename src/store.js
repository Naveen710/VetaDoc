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
            healthNotes: 'Mild food allergy (chicken). Prefers lamb-based diet.',
            dob: '2022-06-10',
            allergies: ['Chicken protein'],
            conditions: ['Seasonal atopic dermatitis'],
            records: [
                { id: 'r-b5', type: 'visit', date: '2026-09-02', title: 'Itchy paws, ear scratching', notes: 'Otitis externa (L). Ear cleaner + topical drops 7 days. Recheck if not better.', vetName: 'Dr. Priya Sharma' },
                { id: 'r-b4', type: 'weight', date: '2026-09-02', title: 'Weight', value: 32 },
                { id: 'r-b3', type: 'lab', date: '2026-06-18', title: 'CBC + LFT', notes: 'All values within reference range.' },
                { id: 'r-b2', type: 'weight', date: '2026-03-10', title: 'Weight', value: 30.5 },
                { id: 'r-b1', type: 'weight', date: '2025-11-20', title: 'Weight', value: 29.8 },
            ],
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
            healthNotes: 'Occasional hairball issues. Regular grooming schedule maintained.',
            dob: '2024-03-02',
            allergies: [],
            conditions: [],
            records: [
                { id: 'r-l1', type: 'weight', date: '2026-07-05', title: 'Weight', value: 4.5 },
            ],
        }
    ],
    orders: sampleOrders,
    consultations: sampleConsultations,
    prescriptions: [
        { id: 'RX-1042', petId: 'pet-1', petName: 'Bruno', source: 'vetadoc', vetName: 'Dr. Priya Sharma', vetRegNo: 'TSVC/2014/1182', date: '2026-09-02', items: [{ name: 'Ear drops (ofloxacin + clotrimazole)', dose: '4 drops left ear, twice daily', days: 7 }], status: 'verified', verifiedBy: 'Pharmacist on duty', notes: 'Recheck in 10 days if itching continues.' },
    ],
    // Auth session: { uid, name, phone, email, role, demo }
    session: null,
    language: 'en',
};

let state = loadState();
const listeners = new Set();

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...structuredClone(defaultState), ...parsed };
        }
    } catch (e) { /* ignore */ }
    return structuredClone(defaultState);
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

// ── Remote persistence adapter (Firestore). Set by services/sync.js when a
// real Firebase user is signed in; null in demo mode. Writes are optimistic:
// the local state updates at once, the snapshot listener reconciles later.
let adapter = null;
export function setPersistenceAdapter(a) { adapter = a; }
function remote(method, ...args) {
    if (!adapter || typeof adapter[method] !== 'function') return;
    Promise.resolve(adapter[method](...args)).catch(err => console.error(`[sync] ${method} failed`, err));
}

/** Replace slices of state (used by snapshot listeners and auth). */
export function setState(patch) {
    state = { ...state, ...patch };
    notify();
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
    state.pets.push({ records: [], ...pet });
    notify();
    remote('savePet', pet);
}

export function updatePet(petId, patch) {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return;
    Object.assign(pet, patch);
    notify();
    remote('savePet', pet);
}

export function removePet(petId) {
    state.pets = state.pets.filter(p => p.id !== petId);
    notify();
    remote('deletePet', petId);
}

// ── Health records (EMR) ──
// record: { id, type: visit|vaccine|deworming|weight|lab|note, date, title, notes, value?, vetName?, attachments? }
export function addHealthRecord(petId, record) {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return;
    pet.records = [...(pet.records || []), record].sort((a, b) => b.date.localeCompare(a.date));
    if (record.type === 'weight' && record.value) pet.weight = record.value;
    if (record.type === 'vaccine') {
        pet.vaccinations = [...(pet.vaccinations || []), { name: record.title, date: record.date, nextDue: record.nextDue || '' }];
    }
    notify();
    remote('addRecord', petId, record);
    if (record.type === 'weight' || record.type === 'vaccine') remote('savePet', pet);
}

export function removeHealthRecord(petId, recordId) {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return;
    pet.records = (pet.records || []).filter(r => r.id !== recordId);
    notify();
    remote('deleteRecord', petId, recordId);
}

// ── Prescriptions (Rx loop) ──
// status: uploaded|issued → verified | rejected → dispensed
export function addPrescription(rx) {
    state.prescriptions = [rx, ...(state.prescriptions || [])];
    notify();
    remote('savePrescription', rx);
}

export function updatePrescription(rxId, patch) {
    const rx = (state.prescriptions || []).find(r => r.id === rxId);
    if (!rx) return;
    Object.assign(rx, patch);
    notify();
    remote('savePrescription', rx);
}

// ── Session / language ──
export function setSession(session) {
    state.session = session;
    notify();
}

export function setLanguage(lang) {
    state.language = lang;
    document.documentElement.lang = lang;
    notify();
}

// ── Consultations ──

export function bookConsultation(consultation) {
    state.consultations.push(consultation);
    notify();
    remote('saveConsultation', consultation);
}

// ── Orders ──

export function placeOrder(orderData) {
    state.orders.unshift(orderData);
    state.cart = [];
    notify();
    remote('saveOrder', orderData);
}

export function updateOrder(orderId, patch) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    Object.assign(order, patch);
    notify();
    remote('saveOrder', order);
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
    state = structuredClone(defaultState);
    notify();
}
