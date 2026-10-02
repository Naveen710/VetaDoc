// Bootstrap the first admin (run once, locally, with a service account):
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin.mjs +919876543210
// The phone number must have signed in to the app at least once.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const [, , who, role = 'admin'] = process.argv;
if (!who) { console.error('Usage: node scripts/set-admin.mjs <phone|email> [role]'); process.exit(1); }
initializeApp({ credential: applicationDefault() });
const auth = getAuth();
const user = who.includes('@') ? await auth.getUserByEmail(who) : await auth.getUserByPhoneNumber(who);
await auth.setCustomUserClaims(user.uid, { role });
await getFirestore().doc(`users/${user.uid}`).set({ role }, { merge: true });
console.log(`✔ ${who} (${user.uid}) is now ${role}. Ask them to sign out and back in.`);
