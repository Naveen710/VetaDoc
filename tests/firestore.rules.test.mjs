// Security-rule tests. Run with the emulator:
//   firebase emulators:exec --only firestore "node --test tests/"
import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

let env;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-vetadoc', firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'pets/p1'), { ownerUid: 'alice', name: 'Bruno', species: 'dog' });
    await setDoc(doc(db, 'prescriptions/rx1'), { ownerUid: 'alice', status: 'uploaded', petName: 'Bruno' });
    await setDoc(doc(db, 'orders/o1'), { ownerUid: 'alice', status: 'awaiting_rx', paymentStatus: 'pending', rxId: 'rx1', total: 349 });
  });
});
after(() => env.cleanup());

const as = (uid, role) => env.authenticatedContext(uid, role ? { role } : {}).firestore();

test('owners read their pets; strangers cannot', async () => {
  await assertSucceeds(getDoc(doc(as('alice'), 'pets/p1')));
  await assertFails(getDoc(doc(as('bob'), 'pets/p1')));
});

test('vets can read any pet (care team)', async () => {
  await assertSucceeds(getDoc(doc(as('vet1', 'vet'), 'pets/p1')));
});

test('parents cannot self-verify a prescription', async () => {
  await assertFails(updateDoc(doc(as('alice'), 'prescriptions/rx1'), { status: 'verified' }));
});

test('pharmacists can verify a prescription', async () => {
  await assertSucceeds(updateDoc(doc(as('ph1', 'pharmacist'), 'prescriptions/rx1'), { status: 'verified' }));
});

test('orders cannot be created as already paid', async () => {
  await assertFails(setDoc(doc(as('alice'), 'orders/o2'), { ownerUid: 'alice', status: 'processing', paymentStatus: 'paid', total: 10 }));
  await assertSucceeds(setDoc(doc(as('alice'), 'orders/o3'), { ownerUid: 'alice', status: 'processing', paymentStatus: 'pending', total: 10 }));
});

test('owners cannot release their own Rx order', async () => {
  await assertFails(updateDoc(doc(as('alice'), 'orders/o1'), { status: 'processing' }));
});

test('nobody can grant themselves a role via users doc', async () => {
  await assertFails(setDoc(doc(as('carol'), 'users/carol'), { name: 'C', role: 'admin' }));
  assert.ok(true);
});
