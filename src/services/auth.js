// ═══════════════════════════════════════════════════
// VetaDoc — Authentication & roles
// Firebase: phone OTP (primary for India) and Google sign-in.
// Roles come from custom claims set by the `setUserRole` function,
// so a user can never promote themselves from the browser.
// Demo mode: a local session with a chosen role, clearly labelled.
// ═══════════════════════════════════════════════════

import {
  RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup,
  onIdTokenChanged, signOut as fbSignOut,
} from 'firebase/auth';
import { auth, firebaseEnabled } from '../firebase/config.js';
import { getState, setSession } from '../store.js';

export const ROLES = {
  parent: { label: 'Pet parent / farmer', home: '#/' },
  vet: { label: 'Veterinarian', home: '/admin.html#/doctor' },
  pharmacist: { label: 'Pharmacist', home: '/admin.html#/admin' },
  admin: { label: 'Admin', home: '/admin.html#/admin' },
};

let confirmation = null;
let recaptcha = null;
const listeners = new Set();

export function currentSession() {
  return getState().session;
}

export function hasRole(...roles) {
  const s = currentSession();
  return Boolean(s && roles.includes(s.role));
}

export function onSessionChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(session) {
  setSession(session);
  listeners.forEach(fn => fn(session));
}

/** Start listening to Firebase auth. Safe to call in demo mode. */
export function initAuth() {
  if (!firebaseEnabled) {
    // Keep any demo session from a previous visit.
    return;
  }
  onIdTokenChanged(auth, async (user) => {
    if (!user) { emit(null); return; }
    const token = await user.getIdTokenResult();
    emit({
      uid: user.uid,
      name: user.displayName || getState().user?.name || 'VetaDoc user',
      phone: user.phoneNumber || '',
      email: user.email || '',
      role: token.claims.role || 'parent',
      demo: false,
    });
  });
}

/** Normalise an Indian mobile number to E.164 (+91XXXXXXXXXX). */
export function toE164(raw) {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return raw.startsWith('+') ? raw : `+${digits}`;
}

export async function sendOtp(phone, buttonId) {
  const e164 = toE164(phone);
  if (!/^\+91[6-9]\d{9}$/.test(e164)) throw new Error('Enter a valid 10-digit Indian mobile number.');
  if (!firebaseEnabled) { confirmation = { demoPhone: e164 }; return { demo: true }; }
  if (!recaptcha) recaptcha = new RecaptchaVerifier(auth, buttonId, { size: 'invisible' });
  confirmation = await signInWithPhoneNumber(auth, e164, recaptcha);
  return { demo: false };
}

export async function verifyOtp(code, demoRole = 'parent', demoName = '') {
  if (!confirmation) throw new Error('Request an OTP first.');
  if (!firebaseEnabled) {
    if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit code (any 6 digits work in demo mode).');
    emit({ uid: `demo-${demoRole}`, name: demoName || defaultName(demoRole), phone: confirmation.demoPhone, email: '', role: demoRole, demo: true });
    return currentSession();
  }
  await confirmation.confirm(code);
  return currentSession();
}

export async function signInWithGoogle(demoRole = 'parent') {
  if (!firebaseEnabled) {
    emit({ uid: `demo-${demoRole}`, name: defaultName(demoRole), phone: '', email: 'demo@vetadoc.in', role: demoRole, demo: true });
    return currentSession();
  }
  await signInWithPopup(auth, new GoogleAuthProvider());
  return currentSession();
}

export async function signOut() {
  if (firebaseEnabled) await fbSignOut(auth);
  emit(null);
}

function defaultName(role) {
  return { parent: getState().user?.name || 'Pet parent', vet: 'Dr. Priya Sharma', pharmacist: 'Pharmacist on duty', admin: 'VetaDoc Admin' }[role];
}
