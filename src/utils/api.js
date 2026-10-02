// ═══════════════════════════════════════════════════
// VetaDoc — Data API (Firebase-backed, demo fallback)
// Same function names as the old Express client so pages did not
// need rewriting. With Firebase configured everything goes to
// Firestore / Storage / callable Cloud Functions; without it,
// in-browser demo data is used.
// ═══════════════════════════════════════════════════

import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, limit, writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions, firebaseEnabled } from '../firebase/config.js';
import { getState } from '../store.js';
import { remindersDue } from '../../shared/vaccineSchedules.js';
import * as demo from '../data/demoAdmin.js';

const live = () => firebaseEnabled && getState().session && !getState().session.demo;
const uid = () => getState().session?.uid;
const call = (name, data) => httpsCallable(functions, name)(data).then(r => r.data);
const ok = (extra = {}) => ({ success: true, mode: live() ? 'firebase' : 'demo', ...extra });

async function safe(fn, fallback) {
  try { return await fn(); } catch (err) {
    console.warn('[api]', err.message);
    return typeof fallback === 'function' ? fallback(err) : { error: err.message };
  }
}

// ── WhatsApp ──
// Messages are sent server-side by Firestore-triggered Cloud Functions
// (booking created, order status changed, reminders due). The client
// only records the event; these remain for backwards compatibility.
export const sendBookingWhatsApp = async () => ok({ via: 'onConsultationCreated' });
export const sendVaccineReminderWhatsApp = async () => ok({ via: 'dailyReminders' });
export const sendOrderUpdateWhatsApp = async () => ok({ via: 'onOrderUpdated' });
export const sendSampleCollectionWhatsApp = async () => ok({ via: 'onSampleCollectionCreated' });
export const sendFollowUpWhatsApp = async () => ok({ via: 'dailyReminders' });

// ── Notifications ──
const demoNotifs = [];

export async function getNotifications() {
  if (!live()) {
    const list = [...demoNotifs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { notifications: list, unreadCount: list.filter(n => !n.read).length };
  }
  return safe(async () => {
    const q = query(collection(db, 'notifications'), where('uid', '==', uid()), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { notifications: list, unreadCount: list.filter(n => !n.read).length };
  }, { notifications: [], unreadCount: 0 });
}

export async function createNotification(n) {
  const notif = { uid: uid() || 'demo', read: false, createdAt: new Date().toISOString(), metadata: {}, ...n };
  if (!live()) { notif.id = `n-${Date.now()}-${demoNotifs.length}`; demoNotifs.push(notif); return notif; }
  return safe(async () => ({ id: (await addDoc(collection(db, 'notifications'), notif)).id, ...notif }));
}

export async function markNotificationRead(id) {
  if (!live()) { const n = demoNotifs.find(x => x.id === id); if (n) n.read = true; return ok(); }
  return safe(() => updateDoc(doc(db, 'notifications', id), { read: true }).then(() => ok()));
}

export async function markAllNotificationsRead() {
  if (!live()) { demoNotifs.forEach(n => { n.read = true; }); return ok(); }
  return safe(async () => {
    const snap = await getDocs(query(collection(db, 'notifications'), where('uid', '==', uid()), where('read', '==', false)));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
    return ok();
  });
}

export async function deleteNotification(id) {
  if (!live()) { const i = demoNotifs.findIndex(x => x.id === id); if (i >= 0) demoNotifs.splice(i, 1); return ok(); }
  return safe(() => deleteDoc(doc(db, 'notifications', id)).then(() => ok()));
}

/**
 * In-app vaccine/deworming reminders from the species schedule.
 * Live mode: the `dailyReminders` function writes these server-side,
 * so the client only builds them in demo mode.
 */
export async function generateVaccineReminders(pets) {
  if (live()) return { generated: 0, notifications: [] };
  const generated = [];
  (pets || []).forEach(pet => {
    remindersDue(pet, new Date(), 30).forEach(item => {
      const key = `${pet.id}:${item.id}`;
      if (demoNotifs.some(n => n.metadata?.key === key)) return;
      const urgency = item.days <= 7 ? 'urgent' : 'soon';
      const n = {
        id: `n-${key}`, uid: 'demo', type: 'vaccine', read: false, createdAt: new Date().toISOString(),
        title: `${pet.emoji || '🐾'} ${item.name} for ${pet.name}`,
        message: `${item.dueLabel} (${item.dueDate}). Book a vet or order it from VetaDoc.`,
        metadata: { key, petId: pet.id, vaccineName: item.name, dueDate: item.dueDate, urgency },
      };
      demoNotifs.push(n);
      generated.push(n);
    });
  });
  return { generated: generated.length, notifications: generated };
}

// ── Admin ──
export const getAdminStats = () => (live() ? safe(() => call('adminStats')) : Promise.resolve(demo.adminStats));
export const getRevenueChart = () => (live() ? safe(() => call('adminStats').then(s => s.revenueChart || [])) : Promise.resolve(demo.revenueChart));
export const getTopProducts = () => (live() ? safe(() => call('adminStats').then(s => s.topProducts || [])) : Promise.resolve(demo.topProducts));
export const getAdminUsers = () => (live() ? safe(() => call('listUsers')) : Promise.resolve({ users: demo.recentUsers, total: demo.recentUsers.length }));

export async function updateUserStatus(userId, status) {
  if (!live()) { const u = demo.recentUsers.find(x => x.id === userId); if (u) u.status = status; return u || { error: 'User not found' }; }
  return safe(() => call('setUserStatus', { uid: userId, status }));
}

export async function setUserRole(userId, role) {
  if (!live()) return { error: 'Roles can only be changed with Firebase connected.' };
  return safe(() => call('setUserRole', { uid: userId, role }));
}

// ── Sample collections ──
export async function getSampleCollections() {
  if (!live()) return { collections: demo.sampleCollections, total: demo.sampleCollections.length };
  return safe(async () => {
    const snap = await getDocs(query(collection(db, 'sampleCollections'), orderBy('date', 'desc'), limit(100)));
    const collections = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { collections, total: collections.length };
  });
}

export async function createSampleCollection(data) {
  const item = { ...data, status: 'scheduled', createdAt: new Date().toISOString() };
  if (!live()) { item.id = 'SC-' + String(demo.sampleCollections.length + 1).padStart(3, '0'); demo.sampleCollections.push(item); return item; }
  return safe(async () => ({ id: (await addDoc(collection(db, 'sampleCollections'), { ...item, ownerUid: uid() })).id, ...item }));
}

export async function updateSampleCollectionStatus(id, status) {
  if (!live()) { const c = demo.sampleCollections.find(x => x.id === id); if (c) c.status = status; return c; }
  return safe(() => updateDoc(doc(db, 'sampleCollections', id), { status }).then(() => ({ id, status })));
}

// ── Doctor portal ──
export async function getDoctorStats(vetId) {
  if (!live()) return demo.doctorStats[vetId] || demo.doctorStats[1];
  return safe(() => call('doctorStats', { vetId }));
}

export async function getDoctorAppointments(vetId) {
  if (!live()) return { appointments: demo.appointments, date: new Date().toISOString().slice(0, 10) };
  return safe(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const snap = await getDocs(query(collection(db, 'consultations'), where('vetId', '==', String(vetId)), where('date', '==', today)));
    return { appointments: snap.docs.map(d => ({ id: d.id, ...d.data() })), date: today };
  });
}

export async function getDoctorPatients(vetId) {
  if (!live()) return { patients: demo.patients };
  return safe(() => call('doctorPatients', { vetId }));
}

// ── Prescriptions (pharmacist queue) ──
export async function getRxQueue(status = 'pending') {
  const pending = ['uploaded', 'issued'];
  if (!live()) {
    const all = getState().prescriptions || [];
    return { prescriptions: status === 'pending' ? all.filter(r => pending.includes(r.status)) : all };
  }
  return safe(async () => {
    const q = status === 'pending'
      ? query(collection(db, 'prescriptions'), where('status', 'in', pending), orderBy('date', 'desc'))
      : query(collection(db, 'prescriptions'), orderBy('date', 'desc'), limit(100));
    const snap = await getDocs(q);
    return { prescriptions: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
  });
}

export async function reviewPrescription(rxId, decision, note = '') {
  if (!live()) return ok({ demo: true });
  return safe(() => call('reviewPrescription', { rxId, decision, note }));
}

/** Upload a prescription image/PDF to Storage under the user's folder. */
export async function uploadPrescriptionFile(file) {
  if (!file) return null;
  if (!live()) {
    // Demo: keep a local object URL so the pharmacist view can preview it.
    return { path: `demo/${file.name}`, url: URL.createObjectURL(file), name: file.name };
  }
  const path = `prescriptions/${uid()}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type });
  return { path, url: await getDownloadURL(r), name: file.name };
}

// ── Payments (Razorpay via Cloud Function) ──
export async function createPaymentOrder({ amount, purpose, refId }) {
  if (!live()) return { demo: true, orderId: `order_demo_${Date.now()}`, amount };
  return safe(() => call('createPaymentOrder', { amount, purpose, refId }));
}

// ── Vets directory (verified only) ──
export async function getVerifiedVets() {
  if (!live()) return null; // pages fall back to src/data/vets.js
  return safe(async () => {
    const snap = await getDocs(query(collection(db, 'vets'), where('verified', '==', true)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }, null);
}

// ── Health ──
export async function checkBackendHealth() {
  return { status: 'ok', service: firebaseEnabled ? 'firebase' : 'demo', live: Boolean(live()) };
}

