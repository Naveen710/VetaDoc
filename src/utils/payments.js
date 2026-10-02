// ═══════════════════════════════════════════════════
// VetaDoc — Razorpay Checkout (UPI, cards, netbanking)
// The order is created server-side by the `createPaymentOrder`
// function; the payment is confirmed by `verifyPayment`, never
// trusted from the browser alone.
// ═══════════════════════════════════════════════════

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config.js';
import { getState } from '../store.js';

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load the payment window. Check your connection.'));
    document.head.appendChild(s);
  });
}

/**
 * Opens Razorpay for an order from createPaymentOrder and verifies it.
 * Resolves { paid: true, paymentId } or rejects when cancelled/failed.
 * Demo orders resolve immediately.
 */
export async function collectPayment(order, description = 'VetaDoc') {
  if (!order || order.demo) return { paid: true, paymentId: 'demo', demo: true };
  await loadCheckout();
  const { session, user } = getState();
  const result = await new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amountPaise,
      currency: 'INR',
      name: 'VetaDoc',
      description,
      prefill: { name: session?.name || user?.name, contact: session?.phone || user?.phone, email: session?.email || '' },
      theme: { color: '#0f766e' },
      handler: resolve,
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.on('payment.failed', r => reject(new Error(r.error?.description || 'Payment failed')));
    rzp.open();
  });
  const verified = await httpsCallable(functions, 'verifyPayment')(result).then(r => r.data);
  if (!verified?.ok) throw new Error('Payment could not be verified');
  return { paid: true, paymentId: result.razorpay_payment_id };
}
