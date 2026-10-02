// ═══════════════════════════════════════════════════
// WhatsApp Business Cloud API helper + message templates
// Free-form text works only inside the 24h customer-service window;
// for reminders outside it, register templates in Meta Business
// Manager and set WHATSAPP_TEMPLATES=true to send them instead.
// ═══════════════════════════════════════════════════

import { logger } from 'firebase-functions';

const API = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v20.0';

export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
}

/** Send a WhatsApp message. Logs instead of sending when not configured. */
export async function sendWhatsApp(to, { text, template }) {
  const phone = String(to || '').replace(/\D/g, '');
  if (!phone) return { skipped: 'no-phone' };
  if (!whatsappConfigured()) {
    logger.info('[whatsapp:demo]', { to: phone, text: text?.slice(0, 160), template: template?.name });
    return { demo: true };
  }
  const body = template && process.env.WHATSAPP_TEMPLATES === 'true'
    ? { messaging_product: 'whatsapp', to: phone, type: 'template', template }
    : { messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: text } };
  const res = await fetch(`${API}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    logger.error('[whatsapp] send failed', data);
    return { error: data.error?.message || `HTTP ${res.status}` };
  }
  return { id: data.messages?.[0]?.id };
}

const tpl = (name, params) => ({
  name, language: { code: 'en' },
  components: [{ type: 'body', parameters: params.map(p => ({ type: 'text', text: String(p) })) }],
});

export const messages = {
  booking: c => ({
    text: `🐾 *VetaDoc booking confirmed*\n\nBooking: ${c.id}\nAnimal: ${c.petName}\nVet: ${c.vetName}\nDate: ${c.date} at ${c.time} IST\nType: ${c.type}\n\nWe'll send the call link 10 minutes before. Reply HELP for support.`,
    template: tpl('booking_confirmed', [c.petName, c.vetName, c.date, c.time]),
  }),
  orderStatus: o => ({
    text: `📦 *VetaDoc order ${o.id}*\nStatus: ${String(o.status).replace(/_/g, ' ')}${o.trackingId ? `\nTracking: ${o.trackingId}` : ''}`,
    template: tpl('order_update', [o.id, String(o.status).replace(/_/g, ' ')]),
  }),
  rxReviewed: (rx, decision, note) => ({
    text: decision === 'verified'
      ? `✅ Your prescription ${rx.id} for ${rx.petName} is verified. We are packing your order.`
      : `⚠️ We could not accept prescription ${rx.id} for ${rx.petName}.\nReason: ${note}\nPlease upload a clearer or current prescription, or book a VetaDoc consult.`,
    template: tpl(decision === 'verified' ? 'rx_verified' : 'rx_rejected', [rx.id, rx.petName, note || '-']),
  }),
  reminder: (pet, item) => ({
    text: `💉 *VetaDoc reminder for ${pet.name}*\n${item.name}: ${item.dueLabel} (${item.dueDate}).\nReply BOOK to talk to a vet, or ORDER to get it delivered.`,
    template: tpl('care_reminder', [pet.name, item.name, item.dueDate]),
  }),
  sample: s => ({
    text: `🧪 *Sample pickup scheduled*\nID: ${s.id}\nAnimal: ${s.petName}\nTests: ${s.sampleType || (s.tests || []).join(', ')}\nDate: ${s.date}, ${s.timeSlot}\nOur technician will call before arriving.`,
    template: tpl('sample_scheduled', [s.petName, s.date, s.timeSlot]),
  }),
};
