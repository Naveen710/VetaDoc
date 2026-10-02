// Seed the catalogue and vet directory into Firestore (products + vets).
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/seed.mjs
// Vets are seeded as verified=false; an admin verifies each registration number.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { products } from '../src/data/products.js';
import { vets } from '../src/data/vets.js';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();
const batch = db.batch();
products.forEach(p => batch.set(db.doc(`products/${p.id}`), { ...p, rxRequired: Boolean(p.prescriptionRequired) }));
vets.forEach(v => batch.set(db.doc(`vets/${v.id}`), { ...v, verified: false, registrationNo: '', council: '' }));
await batch.commit();
console.log(`Seeded ${products.length} products and ${vets.length} vets.`);
