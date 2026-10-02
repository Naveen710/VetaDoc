// ═══════════════════════════════════════════════════
// VetaDoc — Cloud Functions (replaces the Express server)
// Region: asia-south1 (Mumbai) — data stays in India.
// ═══════════════════════════════════════════════════

import crypto from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { setGlobalOptions, logger } from 'firebase-functions';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret, defineString } from 'firebase-functions/params';
import * as functionsV1 from 'firebase-functions/v1';
import Razorpay from 'razorpay';
import { sendWhatsApp, messages } from './whatsapp.js';
import { remindersDue } from './shared/vaccineSchedules.js';

initializeApp();
const db = getFirestore();
setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

const RAZORPAY_KEY_ID = defineString('RAZORPAY_KEY_ID', { default: '' });
const RAZORPAY_KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET');
const WHATSAPP_VERIFY_TOKEN = defineString('WHATSAPP_VERIFY_TOKEN', { default: 'vetadoc_verify_token' });

const ROLES = ['parent', 'vet', 'pharmacist', 'admin'];

// ── helpers ──
function requireRole(req, ...roles) {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  const role = req.auth.token.role || 'parent';
  if (!roles.includes(role)) throw new HttpsError('permission-denied', 'Not allowed for your role.');
  return role;
}
async function phoneOf(uid) {
  if (!uid) return null;
  const snap = await db.doc(`users/${uid}`).get();
  if (snap.exists && snap.data().whatsappOptIn === false) return null;
  return snap.exists && snap.data().phone ? snap.data().phone : (await getAuth().getUser(uid).catch(() => null))?.phoneNumber;
}
async function notify(uid, n) {
  if (!uid) return;
  await db.collection('notifications').add({ uid, read: false, createdAt: new Date().toISOString(), metadata: {}, ...n });
}

// ═════════ Auth & roles ═════════

/** New account → users/{uid} profile with the default role. */
export const onUserCreated = functionsV1.region('asia-south1').auth.user().onCreate(async user => {
  await getAuth().setCustomUserClaims(user.uid, { role: 'parent' });
  await db.doc(`users/${user.uid}`).set({
    name: user.displayName || '', phone: user.phoneNumber || '', email: user.email || '',
    role: 'parent', status: 'active', whatsappOptIn: true, createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
});

/** Admin-only: change a user's role. The first admin is set with scripts/set-admin.js. */
export const setUserRole = onCall(async req => {
  requireRole(req, 'admin');
  const { uid, role } = req.data || {};
  if (!uid || !ROLES.includes(role)) throw new HttpsError('invalid-argument', 'uid and a valid role are required.');
  await getAuth().setCustomUserClaims(uid, { role });
  await db.doc(`users/${uid}`).set({ role }, { merge: true });
  return { ok: true, uid, role };
});

export const setUserStatus = onCall(async req => {
  requireRole(req, 'admin');
  const { uid, status } = req.data || {};
  if (!uid || !['active', 'inactive'].includes(status)) throw new HttpsError('invalid-argument', 'Bad request.');
  await getAuth().updateUser(uid, { disabled: status === 'inactive' });
  await db.doc(`users/${uid}`).set({ status }, { merge: true });
  return { id: uid, status };
});

export const listUsers = onCall(async req => {
  requireRole(req, 'admin');
  const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(200).get();
  const users = snap.docs.map(d => {
    const u = d.data();
    return { id: d.id, name: u.name || '—', email: u.email || u.phone || '', role: u.role, status: u.status || 'active', joinDate: u.createdAt?.toDate?.().toISOString().slice(0, 10) || '', pets: u.petCount || 0, orders: u.orderCount || 0 };
  });
  return { users, total: users.length };
});

// ═════════ Dashboards ═════════

export const adminStats = onCall(async req => {
  requireRole(req, 'admin');
  const count = async q => (await q.count().get()).data().count;
  const since = new Date(); since.setMonth(since.getMonth() - 5, 1);
  const orders = await db.collection('orders').where('date', '>=', since.toISOString().slice(0, 10)).get();
  const byMonth = new Map();
  const productSales = new Map();
  let monthlyRevenue = 0;
  const thisMonth = new Date().toISOString().slice(0, 7);
  orders.forEach(d => {
    const o = d.data();
    if (o.paymentStatus !== 'paid') return;
    const m = String(o.date).slice(0, 7);
    byMonth.set(m, (byMonth.get(m) || 0) + (o.total || 0));
    if (m === thisMonth) monthlyRevenue += o.total || 0;
    (o.items || []).forEach(i => {
      const p = productSales.get(i.name) || { name: i.name, sales: 0, revenue: 0 };
      p.sales += i.qty || 1; p.revenue += (i.price || 0) * (i.qty || 1);
      productSales.set(i.name, p);
    });
  });
  const monthName = m => new Date(`${m}-01T00:00:00Z`).toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' });
  return {
    totalOrders: await count(db.collection('orders')),
    activeOrders: await count(db.collection('orders').where('status', 'in', ['awaiting_rx', 'processing', 'shipped'])),
    totalUsers: await count(db.collection('users')),
    totalPets: await count(db.collection('pets')),
    totalConsultations: await count(db.collection('consultations')),
    activeVets: await count(db.collection('vets').where('verified', '==', true)),
    pendingRx: await count(db.collection('prescriptions').where('status', 'in', ['uploaded', 'issued'])),
    monthlyRevenue,
    totalRevenue: [...byMonth.values()].reduce((a, b) => a + b, 0),
    revenueGrowth: 0, orderGrowth: 0, userGrowth: 0,
    revenueChart: [...byMonth.entries()].sort().map(([m, revenue]) => ({ month: monthName(m), revenue })),
    topProducts: [...productSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
  };
});

export const doctorStats = onCall(async req => {
  requireRole(req, 'vet', 'admin');
  const vetId = String(req.data?.vetId || '');
  const today = new Date().toISOString().slice(0, 10);
  const all = await db.collection('consultations').where('vetId', '==', vetId).get();
  const list = all.docs.map(d => d.data());
  const month = today.slice(0, 7);
  const done = list.filter(c => c.status === 'completed');
  return {
    todayAppointments: list.filter(c => c.date === today).length,
    weekAppointments: list.filter(c => c.date >= today && c.date <= new Date(Date.now() + 6 * 864e5).toISOString().slice(0, 10)).length,
    monthConsultations: list.filter(c => String(c.date).startsWith(month)).length,
    totalEarnings: done.reduce((s, c) => s + (c.fee || 0), 0),
    monthEarnings: done.filter(c => String(c.date).startsWith(month)).reduce((s, c) => s + (c.fee || 0), 0),
    completionRate: list.length ? Math.round((done.length / list.length) * 100) : 0,
    rating: null,
  };
});

export const doctorPatients = onCall(async req => {
  requireRole(req, 'vet', 'admin');
  const vetId = String(req.data?.vetId || '');
  const consults = await db.collection('consultations').where('vetId', '==', vetId).orderBy('date', 'desc').limit(200).get();
  const byPet = new Map();
  consults.forEach(d => {
    const c = d.data();
    const key = c.petId || c.petName;
    const p = byPet.get(key) || { petName: c.petName, ownerName: c.ownerName || '', lastVisit: c.date, visits: 0, notes: c.notes || '', petId: c.petId };
    p.visits += 1;
    byPet.set(key, p);
  });
  const patients = await Promise.all([...byPet.values()].map(async p => {
    if (!p.petId) return p;
    const pet = (await db.doc(`pets/${p.petId}`).get()).data() || {};
    return { ...p, species: pet.species, breed: pet.breed };
  }));
  return { patients };
});

// ═════════ Prescriptions ═════════

/** Pharmacist approves/rejects; linked orders are released or held. */
export const reviewPrescription = onCall(async req => {
  requireRole(req, 'pharmacist', 'admin');
  const { rxId, decision, note = '' } = req.data || {};
  if (!rxId || !['verified', 'rejected'].includes(decision)) throw new HttpsError('invalid-argument', 'rxId and decision are required.');
  if (decision === 'rejected' && !note.trim()) throw new HttpsError('invalid-argument', 'A reason is required when rejecting.');

  const rxRef = db.doc(`prescriptions/${rxId}`);
  const reviewer = req.auth.token.name || req.auth.uid;
  const rx = await db.runTransaction(async tx => {
    const snap = await tx.get(rxRef);
    if (!snap.exists) throw new HttpsError('not-found', 'Prescription not found.');
    const data = snap.data();
    if (!['uploaded', 'issued'].includes(data.status)) throw new HttpsError('failed-precondition', `Already ${data.status}.`);
    const orders = await tx.get(db.collection('orders').where('rxId', '==', rxId).where('status', '==', 'awaiting_rx'));
    tx.update(rxRef, { status: decision, reviewNote: note, reviewedBy: reviewer, reviewedByUid: req.auth.uid, reviewedAt: FieldValue.serverTimestamp() });
    orders.forEach(o => tx.update(o.ref, {
      status: decision === 'verified' ? 'processing' : 'rx_rejected',
      rxReviewedAt: FieldValue.serverTimestamp(),
    }));
    return { id: snap.id, ...data };
  });

  const phone = await phoneOf(rx.ownerUid);
  if (phone) await sendWhatsApp(phone, messages.rxReviewed(rx, decision, note));
  await notify(rx.ownerUid, { type: 'order', title: decision === 'verified' ? 'Prescription verified' : 'Prescription not accepted', message: decision === 'verified' ? `${rx.id} for ${rx.petName} is verified.` : note });
  return { ok: true };
});

// ═════════ Payments (Razorpay) ═════════

function razorpay() {
  const key_id = RAZORPAY_KEY_ID.value();
  const key_secret = RAZORPAY_KEY_SECRET.value();
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

export const createPaymentOrder = onCall({ secrets: [RAZORPAY_KEY_SECRET] }, async req => {
  requireRole(req, 'parent', 'admin', 'vet', 'pharmacist');
  const amount = Math.round(Number(req.data?.amount));
  if (!(amount > 0 && amount < 200000)) throw new HttpsError('invalid-argument', 'Invalid amount.');
  const rzp = razorpay();
  if (!rzp) {
    logger.warn('Razorpay keys not set — returning a demo order.');
    return { demo: true, orderId: `order_demo_${Date.now()}`, amount };
  }
  const order = await rzp.orders.create({ amount: amount * 100, currency: 'INR', notes: { uid: req.auth.uid, purpose: req.data?.purpose || '', refId: String(req.data?.refId || '') } });
  await db.doc(`payments/${order.id}`).set({ ownerUid: req.auth.uid, amount, purpose: req.data?.purpose || '', status: 'created', createdAt: FieldValue.serverTimestamp() });
  return { orderId: order.id, amountPaise: order.amount, keyId: RAZORPAY_KEY_ID.value() };
});

export const verifyPayment = onCall({ secrets: [RAZORPAY_KEY_SECRET] }, async req => {
  requireRole(req, 'parent', 'admin', 'vet', 'pharmacist');
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.data || {};
  if (!orderId || !paymentId || !signature) throw new HttpsError('invalid-argument', 'Missing payment fields.');
  const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET.value()).update(`${orderId}|${paymentId}`).digest('hex');
  const valid = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) throw new HttpsError('permission-denied', 'Signature mismatch.');
  const ref = db.doc(`payments/${orderId}`);
  const snap = await ref.get();
  if (!snap.exists || snap.data().ownerUid !== req.auth.uid) throw new HttpsError('not-found', 'Payment not found.');
  await ref.update({ status: 'paid', paymentId, paidAt: FieldValue.serverTimestamp() });
  await markPaid('orders', orderId, paymentId);
  await markPaid('consultations', orderId, paymentId);
  return { ok: true };
});

async function markPaid(col, paymentOrderId, paymentId) {
  const q = await db.collection(col).where('paymentOrderId', '==', paymentOrderId).get();
  await Promise.all(q.docs.map(d => d.ref.update({ paymentStatus: 'paid', paymentId })));
}

/** The order doc may be written after verifyPayment ran: reconcile on create. */
async function reconcilePayment(ref, data) {
  if (!data.paymentOrderId || data.paymentStatus === 'paid') return;
  const pay = await db.doc(`payments/${data.paymentOrderId}`).get();
  if (pay.exists && pay.data().status === 'paid' && pay.data().ownerUid === data.ownerUid) {
    await ref.update({ paymentStatus: 'paid', paymentId: pay.data().paymentId });
  }
}

// ═════════ Firestore triggers → WhatsApp ═════════

export const onConsultationCreated = onDocumentCreated('consultations/{id}', async event => {
  const c = event.data?.data();
  if (!c) return;
  await reconcilePayment(event.data.ref, c);
  if (c.whatsappOptIn !== false) await sendWhatsApp(c.ownerPhone || (await phoneOf(c.ownerUid)), messages.booking({ id: event.params.id, ...c }));
  await notify(c.ownerUid, { type: 'booking', title: 'Consultation booked', message: `${c.vetName} · ${c.date} ${c.time}` });
});

export const onOrderCreated = onDocumentCreated('orders/{id}', async event => {
  const o = event.data?.data();
  if (!o) return;
  await reconcilePayment(event.data.ref, o);
  await db.doc(`users/${o.ownerUid}`).set({ orderCount: FieldValue.increment(1) }, { merge: true });
});

export const onOrderUpdated = onDocumentUpdated('orders/{id}', async event => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  if (before.status === after.status) return;
  const phone = await phoneOf(after.ownerUid);
  if (phone) await sendWhatsApp(phone, messages.orderStatus({ id: event.params.id, ...after }));
  await notify(after.ownerUid, { type: 'order', title: `Order ${event.params.id}`, message: `Status: ${after.status.replace(/_/g, ' ')}` });
});

export const onSampleCollectionCreated = onDocumentCreated('sampleCollections/{id}', async event => {
  const s = event.data?.data();
  if (!s) return;
  const phone = await phoneOf(s.ownerUid);
  if (phone) await sendWhatsApp(phone, messages.sample({ id: event.params.id, ...s }));
});

export const onPetWritten = onDocumentCreated('pets/{id}', async event => {
  const p = event.data?.data();
  if (p?.ownerUid) await db.doc(`users/${p.ownerUid}`).set({ petCount: FieldValue.increment(1) }, { merge: true });
});

// ═════════ Daily reminders (08:00 IST) ═════════

export const dailyReminders = onSchedule({ schedule: '0 8 * * *', timeZone: 'Asia/Kolkata' }, async () => {
  const today = new Date();
  const key = today.toISOString().slice(0, 10);
  let sent = 0;
  const pets = await db.collection('pets').get();
  for (const doc of pets.docs) {
    const pet = { id: doc.id, ...doc.data() };
    const recs = await doc.ref.collection('records').where('type', 'in', ['vaccine', 'deworming']).get();
    pet.records = recs.docs.map(r => r.data());
    // Remind 7 days before, on the day, and weekly while overdue.
    const due = remindersDue(pet, today, 7).filter(i => i.days === 7 || i.days === 0 || (i.days < 0 && i.days % 7 === 0));
    for (const item of due) {
      const marker = db.doc(`pets/${doc.id}/reminders/${item.id}_${key}`);
      if ((await marker.get()).exists) continue;
      await marker.set({ at: FieldValue.serverTimestamp() });
      await notify(pet.ownerUid, { type: 'vaccine', title: `${pet.emoji || '🐾'} ${item.name} for ${pet.name}`, message: `${item.dueLabel} (${item.dueDate}).`, metadata: { petId: doc.id, item: item.id } });
      const phone = await phoneOf(pet.ownerUid);
      if (phone) await sendWhatsApp(phone, messages.reminder(pet, item));
      sent += 1;
    }
  }
  logger.info(`dailyReminders: ${sent} reminders sent`);
});

// ═════════ WhatsApp webhook (inbound replies) ═════════

export const whatsappWebhook = onRequest(async (req, res) => {
  if (req.method === 'GET') {
    const ok = req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === WHATSAPP_VERIFY_TOKEN.value();
    res.status(ok ? 200 : 403).send(ok ? req.query['hub.challenge'] : 'Forbidden');
    return;
  }
  const entries = req.body?.entry || [];
  for (const e of entries) {
    for (const ch of e.changes || []) {
      for (const msg of ch.value?.messages || []) {
        await db.collection('inboundMessages').add({ from: msg.from, type: msg.type, text: msg.text?.body || '', raw: msg, at: FieldValue.serverTimestamp() });
        const word = (msg.text?.body || '').trim().toUpperCase();
        if (word === 'STOP') {
          const users = await db.collection('users').where('phone', '==', `+${msg.from}`).get();
          await Promise.all(users.docs.map(u => u.ref.update({ whatsappOptIn: false })));
        }
      }
    }
  }
  res.sendStatus(200);
});
