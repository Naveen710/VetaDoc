// ═══════════════════════════════════════════════════
// VetaDoc Backend — WhatsApp Business API Routes
// ═══════════════════════════════════════════════════

import { Router } from 'express';

export const whatsappRouter = Router();

const WHATSAPP_API = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const isDemoMode = PHONE_ID === 'DEMO_PHONE_ID';

// ── Send booking confirmation via WhatsApp ──
whatsappRouter.post('/send-booking', async (req, res) => {
    try {
        const { customerPhone, customerName, vetName, petName, date, time, consultationType, bookingId, consultationFee } = req.body;

        if (!customerPhone || !vetName || !bookingId) {
            return res.status(400).json({ error: 'Missing required fields: customerPhone, vetName, bookingId' });
        }

        const message = `🐾 *VetaDoc Booking Confirmed!*\n\n` +
            `📋 *Booking ID:* ${bookingId}\n` +
            `👤 *Patient:* ${petName || 'N/A'}\n` +
            `🩺 *Doctor:* ${vetName}\n` +
            `📅 *Date:* ${date}\n` +
            `⏰ *Time:* ${time} IST\n` +
            `📹 *Type:* ${consultationType || 'Video Call'}\n` +
            `💰 *Fee:* ₹${consultationFee || 'N/A'}\n\n` +
            `Thank you for choosing VetaDoc! 🐕\n` +
            `For any changes, reply to this message or call us.`;

        if (isDemoMode) {
            console.log('📱 [DEMO] WhatsApp booking message:');
            console.log(`   To: ${customerPhone}`);
            console.log(`   Message: ${message.substring(0, 100)}...`);
            return res.json({
                success: true,
                mode: 'demo',
                message: 'WhatsApp message simulated (demo mode). Configure WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN for live messages.',
                payload: { to: customerPhone, text: message }
            });
        }

        // Live WhatsApp Business Cloud API call
        const response = await fetch(`${WHATSAPP_API}/${PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: customerPhone.replace(/[^0-9]/g, ''),
                type: 'text',
                text: { body: message }
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ WhatsApp booking confirmation sent:', data);
            res.json({ success: true, mode: 'live', messageId: data.messages?.[0]?.id });
        } else {
            console.error('❌ WhatsApp API error:', data);
            res.status(500).json({ success: false, error: data.error?.message || 'WhatsApp API error' });
        }
    } catch (err) {
        console.error('❌ WhatsApp send error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Send vaccine reminder via WhatsApp ──
whatsappRouter.post('/send-vaccine-reminder', async (req, res) => {
    try {
        const { customerPhone, petName, vaccineName, dueDate, daysLeft } = req.body;

        const urgency = daysLeft <= 7 ? '🔴 URGENT' : daysLeft <= 30 ? '🟡 Coming Soon' : '🟢 Upcoming';

        const message = `💉 *VetaDoc Vaccine Reminder*\n\n` +
            `${urgency}\n\n` +
            `🐾 *Pet:* ${petName}\n` +
            `💊 *Vaccine:* ${vaccineName}\n` +
            `📅 *Due Date:* ${dueDate}\n` +
            `⏳ *Days Left:* ${daysLeft} days\n\n` +
            `📞 Book your appointment now at VetaDoc!\n` +
            `Reply "BOOK" to schedule an appointment.`;

        if (isDemoMode) {
            console.log('📱 [DEMO] WhatsApp vaccine reminder:');
            console.log(`   To: ${customerPhone}`);
            console.log(`   Pet: ${petName}, Vaccine: ${vaccineName}`);
            return res.json({ success: true, mode: 'demo', payload: { to: customerPhone, text: message } });
        }

        const response = await fetch(`${WHATSAPP_API}/${PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: customerPhone.replace(/[^0-9]/g, ''),
                type: 'text',
                text: { body: message }
            })
        });

        const data = await response.json();
        res.json({ success: response.ok, mode: 'live', data });
    } catch (err) {
        console.error('❌ Vaccine reminder error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Send order update via WhatsApp ──
whatsappRouter.post('/send-order-update', async (req, res) => {
    try {
        const { customerPhone, orderId, status, trackingId } = req.body;

        const statusEmoji = {
            'processing': '📦', 'shipped': '🚚', 'out_for_delivery': '🏍️',
            'delivered': '✅', 'cancelled': '❌'
        };

        const message = `${statusEmoji[status] || '📋'} *VetaDoc Order Update*\n\n` +
            `🆔 *Order:* ${orderId}\n` +
            `📊 *Status:* ${status.replace(/_/g, ' ').toUpperCase()}\n` +
            `${trackingId ? `📍 *Tracking:* ${trackingId}\n` : ''}` +
            `\nTrack your order at VetaDoc!`;

        if (isDemoMode) {
            return res.json({ success: true, mode: 'demo', payload: { to: customerPhone, text: message } });
        }

        const response = await fetch(`${WHATSAPP_API}/${PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: customerPhone.replace(/[^0-9]/g, ''),
                type: 'text',
                text: { body: message }
            })
        });

        const data = await response.json();
        res.json({ success: response.ok, mode: 'live', data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Send sample collection confirmation ──
whatsappRouter.post('/send-sample-collection', async (req, res) => {
    try {
        const { customerPhone, petName, sampleType, date, timeSlot, collectionId } = req.body;

        const message = `🧪 *VetaDoc Sample Collection Scheduled*\n\n` +
            `🆔 *ID:* ${collectionId}\n` +
            `🐾 *Pet:* ${petName}\n` +
            `🔬 *Sample:* ${sampleType}\n` +
            `📅 *Date:* ${date}\n` +
            `⏰ *Time:* ${timeSlot}\n\n` +
            `Our technician will arrive at your doorstep.\n` +
            `Please keep your pet calm and ready. 🏠`;

        if (isDemoMode) {
            return res.json({ success: true, mode: 'demo', payload: { to: customerPhone, text: message } });
        }

        const response = await fetch(`${WHATSAPP_API}/${PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: customerPhone.replace(/[^0-9]/g, ''),
                type: 'text',
                text: { body: message }
            })
        });

        const data = await response.json();
        res.json({ success: response.ok, mode: 'live', data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Send follow-up reminder ──
whatsappRouter.post('/send-followup-reminder', async (req, res) => {
    try {
        const { customerPhone, petName, followUpType, date, vetName } = req.body;

        const message = `📋 *VetaDoc Follow-Up Reminder*\n\n` +
            `🐾 *Pet:* ${petName}\n` +
            `📌 *Type:* ${followUpType}\n` +
            `📅 *Date:* ${date}\n` +
            `${vetName ? `🩺 *Doctor:* ${vetName}\n` : ''}` +
            `\nDon't miss your follow-up! Reply "RESCHEDULE" to change the date.`;

        if (isDemoMode) {
            return res.json({ success: true, mode: 'demo', payload: { to: customerPhone, text: message } });
        }

        const response = await fetch(`${WHATSAPP_API}/${PHONE_ID}/messages`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: customerPhone.replace(/[^0-9]/g, ''),
                type: 'text',
                text: { body: message }
            })
        });

        const data = await response.json();
        res.json({ success: response.ok, mode: 'live', data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
