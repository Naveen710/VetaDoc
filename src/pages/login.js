// ═══════════════════════════════════════════════════
// VetaDoc — Sign in (phone OTP / Google)
// ═══════════════════════════════════════════════════

import { sendOtp, verifyOtp, signInWithGoogle, ROLES } from '../services/auth.js';
import { firebaseEnabled } from '../firebase/config.js';
import { showToast } from '../components/toast.js';

/**
 * @param {HTMLElement} container
 * @param {string[]} _params
 * @param {{ allowedRoles?: string[], afterLogin?: (session) => void }} opts
 */
export default function renderLogin(container, _params = [], opts = {}) {
  const allowed = opts.allowedRoles || Object.keys(ROLES);
  let role = allowed[0];
  let step = 'phone';

  function afterLogin(session) {
    showToast('Signed in', `Welcome, ${session.name}`, 'success');
    if (opts.afterLogin) return opts.afterLogin(session);
    const target = ROLES[session.role]?.home || '#/';
    if (target.startsWith('#')) window.location.hash = target.slice(1);
    else window.location.href = target;
  }

  function render() {
    container.innerHTML = `
      <div class="page-container">
        <div class="auth-wrap">
          <aside class="auth-side">
            <div>
              <div class="hero-eyebrow"><span class="dot">VetaDoc</span> One login for the whole family's animals</div>
              <h2>Welcome back</h2>
              <p>Your pets' records, prescriptions and reminders stay with you — on any phone.</p>
            </div>
            <div class="hero-proof" style="flex-direction:column;gap:10px">
              <span><span class="material-icons-round">sms</span> Sign in with a one-time code — no password</span>
              <span><span class="material-icons-round">lock</span> We never share your number</span>
              <span><span class="material-icons-round">badge</span> Vets and pharmacists get their own workspace</span>
            </div>
          </aside>

          <form class="auth-form" id="login-form" novalidate>
            <div>
              <h1 style="font-size:1.6rem">Sign in</h1>
              <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:4px">${step === 'phone' ? 'We will send a 6-digit code by SMS.' : 'Enter the code we sent you.'}</p>
            </div>

            ${allowed.length > 1 && !firebaseEnabled ? `
              <div class="role-tabs">
                ${allowed.map(r => `<button type="button" class="role-tab ${r === role ? 'active' : ''}" data-role="${r}"><b>${ROLES[r].label}</b><span>${roleHint(r)}</span></button>`).join('')}
              </div>` : ''}

            ${step === 'phone' ? `
              <div class="input-group">
                <label for="login-phone">Mobile number</label>
                <div class="input-with-icon">
                  <span class="material-icons-round">phone_iphone</span>
                  <input class="input" id="login-phone" inputmode="numeric" autocomplete="tel" placeholder="98765 43210" maxlength="14" />
                </div>
              </div>
              <button class="btn btn-primary btn-lg w-full" id="send-otp-btn" type="submit">Send code</button>
              <div style="display:flex;align-items:center;gap:10px;color:var(--text-tertiary);font-size:var(--text-xs)"><hr style="flex:1;border:none;border-top:1px solid var(--border-color)"/>or<hr style="flex:1;border:none;border-top:1px solid var(--border-color)"/></div>
              <button class="btn btn-secondary btn-lg w-full" id="google-btn" type="button">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
                Continue with Google
              </button>
            ` : `
              <div class="input-group">
                <label for="login-otp">6-digit code</label>
                <input class="input" id="login-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" style="letter-spacing:.5em;font-size:1.25rem;text-align:center" />
              </div>
              <button class="btn btn-primary btn-lg w-full" type="submit">Verify and sign in</button>
              <button class="btn btn-ghost w-full" type="button" id="back-btn">Use a different number</button>
            `}

            ${!firebaseEnabled ? `<div class="demo-note"><b>Demo mode.</b> Firebase is not connected, so any valid mobile number and any 6 digits will sign you in with the role you pick. Data stays in this browser.</div>` : ''}
            <p style="font-size:var(--text-xs);color:var(--text-tertiary)">By continuing you agree to our Terms and Privacy Policy, and consent to VetaDoc storing your animals' health records to provide care.</p>
          </form>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => { role = b.dataset.role; render(); }));
    document.getElementById('back-btn')?.addEventListener('click', () => { step = 'phone'; render(); });

    document.getElementById('google-btn')?.addEventListener('click', async () => {
      try { afterLogin(await signInWithGoogle(role)); } catch (err) { showToast('Sign-in failed', err.message, 'error'); }
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submit = e.submitter || container.querySelector('button[type=submit]');
      submit.disabled = true;
      try {
        if (step === 'phone') {
          await sendOtp(document.getElementById('login-phone').value, 'send-otp-btn');
          step = 'otp';
          render();
          document.getElementById('login-otp')?.focus();
        } else {
          const session = await verifyOtp(document.getElementById('login-otp').value.trim(), role);
          if (session && !allowed.includes(session.role)) {
            showToast('No access', 'This account does not have access here.', 'warning');
            return;
          }
          afterLogin(session);
        }
      } catch (err) {
        showToast('Could not sign in', err.message, 'error');
      } finally {
        if (submit.isConnected) submit.disabled = false;
      }
    });
  }

  render();
}

function roleHint(r) {
  return { parent: 'Pets, orders, consults', vet: 'Patients and e-Rx', pharmacist: 'Verify prescriptions', admin: 'Run the platform' }[r];
}
