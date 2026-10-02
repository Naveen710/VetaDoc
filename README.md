# VetaDoc

Vet consultations, genuine batch-tracked veterinary medicines and lifelong health records for pets **and** farm animals — built for India, WhatsApp-first.

- **Pet parents & farmers:** book a registered vet, order medicines (Rx items need a verified prescription), track vaccines and deworming per species, keep a health record you can print for any clinic.
- **Vets:** appointments, patient history, e-prescriptions.
- **Pharmacists:** prescription verification queue that releases held orders.
- **Admins:** users, roles, orders, sample pickups, metrics.

## Stack

| Layer | Tech |
| --- | --- |
| Web app | Vanilla JS + Vite (multi-page: `index.html` public app, `admin.html` staff workspace) |
| Auth | Firebase Auth — phone OTP + Google; roles in custom claims |
| Data | Cloud Firestore (asia-south1, offline cache) |
| Files | Cloud Storage (prescriptions, lab reports) |
| Server | Cloud Functions v2 — payments, WhatsApp, reminders, role management |
| Payments | Razorpay (UPI, cards) — order + signature verified server-side |
| Messaging | WhatsApp Business Cloud API |

Without Firebase keys the app runs in **demo mode**: any number + any 6-digit code signs in with a role you pick, and data stays in the browser.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000 (demo mode)
```

Staff workspace: http://localhost:3000/admin.html

## Connect Firebase

1. Create a project at https://console.firebase.google.com (Blaze plan for Functions).
2. Enable **Authentication → Phone** and **Google**; add your domain to authorised domains.
3. Create **Firestore** and **Storage** in `asia-south1` (Mumbai).
4. Add a Web app and copy its config into `.env.local` (see `.env.example`).
5. Install the CLI and deploy:

```bash
npm i -g firebase-tools
firebase login
cp .firebaserc.example .firebaserc   # set your project id
cd functions && npm install && cd ..
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase deploy
```

6. Make yourself admin (after signing in once):

```bash
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin.mjs +91XXXXXXXXXX
npm run seed   # products + vet directory (vets start unverified)
```

### Function configuration

Set in `functions/.env` (non-secret) and with `firebase functions:secrets:set` (secret):

| Name | Kind | Purpose |
| --- | --- | --- |
| `RAZORPAY_KEY_ID` | env | Razorpay key id (public) |
| `RAZORPAY_KEY_SECRET` | secret | Razorpay key secret |
| `WHATSAPP_PHONE_NUMBER_ID` | env | WhatsApp Cloud API phone id |
| `WHATSAPP_ACCESS_TOKEN` | env/secret | WhatsApp token |
| `WHATSAPP_TEMPLATES` | env | `true` to send approved templates for reminders |
| `WHATSAPP_VERIFY_TOKEN` | env | Webhook verification token |

Unset keys put that integration in demo mode (logged, not sent).

## Tests

```bash
npm run test:unit    # vaccine/deworming schedule logic
npm run test:rules   # Firestore security rules (needs the emulator + Java)
```

## Project layout

```
shared/            schedule logic used by the app AND functions
src/firebase/      Firebase bootstrap (demo fallback)
src/services/      auth (OTP/Google, roles) and Firestore ⇄ store sync
src/pages/         screens (home, catalog, cart, consult, pet record, Rx queue…)
functions/         Cloud Functions (payments, WhatsApp, reminders, roles, stats)
firestore.rules    role-based security rules
storage.rules      file upload rules (5 MB, images/PDF)
tests/             security rule tests
```

## Clinical & compliance notes

Vaccine plans follow common Indian practice and are a planning aid — the treating vet can change any date. Teleconsults capture consent and exclude certificates, trauma and euthanasia. Prescription-only medicines ship only after pharmacist verification. Get legal review before launch (Drugs and Cosmetics rules, DPDP Act consent, advertising claims).
