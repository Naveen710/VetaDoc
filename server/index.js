// ═══════════════════════════════════════════════════
// VetaDoc Backend — Express Server
// ═══════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { whatsappRouter } from './routes/whatsapp.js';
import { notificationsRouter } from './routes/notifications.js';
import { adminRouter } from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware — CORS whitelist
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
].filter(Boolean);
app.use(cors({
    origin: (origin, cb) => {
        // Allow requests with no origin (server-to-server, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ── Routes ──
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'VetaDoc Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        whatsapp: process.env.WHATSAPP_PHONE_NUMBER_ID !== 'DEMO_PHONE_ID' ? 'configured' : 'demo-mode'
    });
});

// ── WhatsApp Webhook (for receiving messages) ──
app.get('/api/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'vetadoc_verify_token';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/api/webhook', (req, res) => {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
        body.entry?.forEach(entry => {
            entry.changes?.forEach(change => {
                if (change.field === 'messages') {
                    const message = change.value?.messages?.[0];
                    if (message) {
                        console.log('📩 Received WhatsApp message:', message);
                        // Handle incoming messages (auto-reply, etc.)
                    }
                }
            });
        });
    }
    res.sendStatus(200);
});

// Error handler (CORS rejections, etc.)
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({ error: 'CORS: Origin not allowed' });
    } else {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start
app.listen(PORT, () => {
    console.log(`\n🐾 VetaDoc Backend running on http://localhost:${PORT}`);
    console.log(`   WhatsApp: ${process.env.WHATSAPP_PHONE_NUMBER_ID !== 'DEMO_PHONE_ID' ? '✅ Live' : '⚠️ Demo mode'}`);
    console.log(`   Frontend: ${process.env.FRONTEND_URL}\n`);
});
