// ═══════════════════════════════════════════════════
// VetaDoc Backend — Notifications Routes
// ═══════════════════════════════════════════════════

import { Router } from 'express';

export const notificationsRouter = Router();

// In-memory notification store (would be a database in production)
const notifications = [];
let nextId = 1;

// ── Get all notifications for a user ──
notificationsRouter.get('/:userId', (req, res) => {
    const userNotifs = notifications
        .filter(n => n.userId === req.params.userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ notifications: userNotifs, unreadCount: userNotifs.filter(n => !n.read).length });
});

// ── Create a notification ──
notificationsRouter.post('/', (req, res) => {
    const { userId, type, title, message, metadata } = req.body;
    const notif = {
        id: nextId++,
        userId: userId || 'default',
        type, // vaccine, booking, order, followup, sample, emergency
        title,
        message,
        metadata: metadata || {},
        read: false,
        createdAt: new Date().toISOString()
    };
    notifications.push(notif);
    console.log(`🔔 Notification created: [${type}] ${title}`);
    res.status(201).json(notif);
});

// ── Mark notification as read ──
notificationsRouter.patch('/:id/read', (req, res) => {
    const notif = notifications.find(n => n.id === parseInt(req.params.id));
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    notif.read = true;
    res.json(notif);
});

// ── Mark all as read ──
notificationsRouter.patch('/read-all/:userId', (req, res) => {
    notifications.filter(n => n.userId === req.params.userId).forEach(n => n.read = true);
    res.json({ success: true });
});

// ── Delete a notification ──
notificationsRouter.delete('/:id', (req, res) => {
    const idx = notifications.findIndex(n => n.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Notification not found' });
    notifications.splice(idx, 1);
    res.json({ success: true });
});

// ── Generate vaccine reminders (cron-like endpoint) ──
notificationsRouter.post('/generate-vaccine-reminders', (req, res) => {
    const { pets, userId } = req.body;
    const generated = [];

    (pets || []).forEach(pet => {
        (pet.vaccinations || []).forEach(v => {
            const dueDate = new Date(v.nextDue);
            const now = new Date();
            const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

            if (daysLeft > 0 && daysLeft <= 60) {
                const exists = notifications.find(n =>
                    n.type === 'vaccine' &&
                    n.metadata?.petId === pet.id &&
                    n.metadata?.vaccineName === v.name &&
                    !n.read
                );

                if (!exists) {
                    const urgency = daysLeft <= 7 ? 'urgent' : daysLeft <= 30 ? 'soon' : 'upcoming';
                    const notif = {
                        id: nextId++,
                        userId: userId || 'default',
                        type: 'vaccine',
                        title: `${pet.emoji} ${v.name} due for ${pet.name}`,
                        message: daysLeft <= 7
                            ? `URGENT: ${v.name} vaccination is due in ${daysLeft} day(s)! Book now.`
                            : `${v.name} vaccination is due on ${v.nextDue}. ${daysLeft} days remaining.`,
                        metadata: { petId: pet.id, petName: pet.name, vaccineName: v.name, dueDate: v.nextDue, daysLeft, urgency },
                        read: false,
                        createdAt: new Date().toISOString()
                    };
                    notifications.push(notif);
                    generated.push(notif);
                }
            }
        });
    });

    console.log(`💉 Generated ${generated.length} vaccine reminders`);
    res.json({ generated: generated.length, notifications: generated });
});
