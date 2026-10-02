// ═══════════════════════════════════════════════════
// VetaDoc — Firestore ⇄ store sync
// When a real (non-demo) user signs in, live listeners mirror the
// user's documents into the store, and store actions write back
// through the persistence adapter. Pages keep reading getState().
// ═══════════════════════════════════════════════════

import {
  collection, doc, setDoc, deleteDoc, onSnapshot, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db, firebaseEnabled } from '../firebase/config.js';
import { setState, setPersistenceAdapter, getState } from '../store.js';
import { onSessionChange, currentSession } from './auth.js';

let unsubs = [];
const recordUnsubs = new Map();

const clean = obj => JSON.parse(JSON.stringify(obj)); // drops undefined, functions

function stop() {
  unsubs.forEach(u => u());
  unsubs = [];
  recordUnsubs.forEach(u => u());
  recordUnsubs.clear();
  setPersistenceAdapter(null);
}

function start(uid) {
  stop();
  const mine = (name, field = 'ownerUid') => query(collection(db, name), where(field, '==', uid));

  // Pets + each pet's records subcollection
  unsubs.push(onSnapshot(mine('pets'), snap => {
    const pets = snap.docs.map(d => ({ id: d.id, records: [], ...d.data() }));
    const current = new Map(getState().pets.map(p => [p.id, p]));
    pets.forEach(p => { p.records = current.get(p.id)?.records || []; });
    setState({ pets });

    // attach/detach record listeners
    const ids = new Set(pets.map(p => p.id));
    recordUnsubs.forEach((u, id) => { if (!ids.has(id)) { u(); recordUnsubs.delete(id); } });
    pets.forEach(p => {
      if (recordUnsubs.has(p.id)) return;
      const q = query(collection(db, 'pets', p.id, 'records'), orderBy('date', 'desc'));
      recordUnsubs.set(p.id, onSnapshot(q, rs => {
        const records = rs.docs.map(r => ({ id: r.id, ...r.data() }));
        setState({ pets: getState().pets.map(x => (x.id === p.id ? { ...x, records } : x)) });
      }));
    });
  }, err => console.error('[sync] pets', err)));

  unsubs.push(onSnapshot(mine('orders'), snap => setState({ orders: snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.date).localeCompare(String(a.date))) })));
  unsubs.push(onSnapshot(mine('consultations'), snap => setState({ consultations: snap.docs.map(d => ({ id: d.id, ...d.data() })) })));
  unsubs.push(onSnapshot(mine('prescriptions'), snap => setState({ prescriptions: snap.docs.map(d => ({ id: d.id, ...d.data() })) })));

  setPersistenceAdapter({
    savePet: pet => {
      const { records, ...rest } = pet; // records live in the subcollection
      return setDoc(doc(db, 'pets', pet.id), { ...clean(rest), ownerUid: uid, updatedAt: serverTimestamp() }, { merge: true });
    },
    deletePet: id => deleteDoc(doc(db, 'pets', id)),
    addRecord: (petId, record) => setDoc(doc(db, 'pets', petId, 'records', record.id), clean({ ...record, ownerUid: uid, createdBy: uid, createdAt: Date.now() })),
    deleteRecord: (petId, recordId) => deleteDoc(doc(db, 'pets', petId, 'records', recordId)),
    // Status, payment and batch fields are owned by pharmacists/functions; rules reject client edits to them.
    saveOrder: order => setDoc(doc(db, 'orders', order.id), clean({ ...order, ownerUid: uid }), { merge: true }),
    saveConsultation: c => setDoc(doc(db, 'consultations', c.id), clean({ ...c, ownerUid: uid, consentAt: c.consentAt || Date.now() }), { merge: true }),
    savePrescription: rx => setDoc(doc(db, 'prescriptions', rx.id), clean({ ...rx, ownerUid: rx.ownerUid || uid }), { merge: true }),
  });
}

/** Wire sync to the auth session. Call once at startup. */
export function initSync() {
  if (!firebaseEnabled) return;
  const apply = s => (s && !s.demo ? start(s.uid) : stop());
  onSessionChange(apply);
  apply(currentSession());
}
