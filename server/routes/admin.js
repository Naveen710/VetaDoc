// ═══════════════════════════════════════════════════
// VetaDoc Backend — Admin Routes
// ═══════════════════════════════════════════════════

import { Router } from 'express';

export const adminRouter = Router();

// Simulated admin data store
const adminStats = {
    totalRevenue: 2847500,
    monthlyRevenue: 342800,
    totalOrders: 1247,
    activeOrders: 89,
    totalUsers: 5230,
    totalPets: 8450,
    totalConsultations: 3120,
    activeVets: 6,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    userGrowth: 15.2
};

const revenueChart = [
    { month: 'Sep', revenue: 245000 },
    { month: 'Oct', revenue: 268000 },
    { month: 'Nov', revenue: 289000 },
    { month: 'Dec', revenue: 312000 },
    { month: 'Jan', revenue: 298000 },
    { month: 'Feb', revenue: 342800 }
];

const topProducts = [
    { name: 'Amoxicillin Tablets 250mg', sales: 342, revenue: 119358 },
    { name: 'Omega-3 Fish Oil Supplement', sales: 289, revenue: 173011 },
    { name: 'Fipronil Spot-On (Dogs)', sales: 256, revenue: 89600 },
    { name: 'Canine Rabies Vaccine', sales: 234, revenue: 69966 },
    { name: 'Glucosamine Joint Support', sales: 198, revenue: 138402 }
];

const recentUsers = [
    { id: 'u-1', name: 'Praveen Kumar', email: 'praveen@example.com', pets: 2, orders: 5, joinDate: '2025-08-15', status: 'active' },
    { id: 'u-2', name: 'Anita Desai', email: 'anita.d@example.com', pets: 1, orders: 3, joinDate: '2025-09-20', status: 'active' },
    { id: 'u-3', name: 'Rahul Mehra', email: 'rahul.m@example.com', pets: 3, orders: 8, joinDate: '2025-10-05', status: 'active' },
    { id: 'u-4', name: 'Sanya Joshi', email: 'sanya.j@example.com', pets: 1, orders: 2, joinDate: '2025-11-12', status: 'active' },
    { id: 'u-5', name: 'Vikram Patel', email: 'vikram.p@example.com', pets: 4, orders: 12, joinDate: '2025-07-01', status: 'active' },
    { id: 'u-6', name: 'Deepa Nair', email: 'deepa.n@example.com', pets: 2, orders: 6, joinDate: '2025-12-18', status: 'active' },
    { id: 'u-7', name: 'Arjun Rao', email: 'arjun.r@example.com', pets: 1, orders: 1, joinDate: '2026-01-10', status: 'inactive' },
    { id: 'u-8', name: 'Kavitha Reddy', email: 'kavitha.r@example.com', pets: 2, orders: 4, joinDate: '2026-01-25', status: 'active' }
];

const sampleCollections = [
    { id: 'SC-001', petName: 'Bruno', ownerName: 'Praveen Kumar', sampleType: 'Blood - CBC', date: '2026-02-14', timeSlot: '09:00 - 10:00', status: 'scheduled', address: '42 Green Park, Jubilee Hills' },
    { id: 'SC-002', petName: 'Max', ownerName: 'Rahul Mehra', sampleType: 'Urine Analysis', date: '2026-02-13', timeSlot: '11:00 - 12:00', status: 'completed', address: '15 Banjara Hills' },
    { id: 'SC-003', petName: 'Luna', ownerName: 'Praveen Kumar', sampleType: 'Skin Scraping', date: '2026-02-15', timeSlot: '10:00 - 11:00', status: 'scheduled', address: '42 Green Park, Jubilee Hills' }
];

// ── Dashboard Stats ──
adminRouter.get('/stats', (req, res) => {
    res.json(adminStats);
});

// ── Revenue Chart Data ──
adminRouter.get('/revenue-chart', (req, res) => {
    res.json(revenueChart);
});

// ── Top Products ──
adminRouter.get('/top-products', (req, res) => {
    res.json(topProducts);
});

// ── Users ──
adminRouter.get('/users', (req, res) => {
    res.json({ users: recentUsers, total: recentUsers.length });
});

adminRouter.patch('/users/:id/status', (req, res) => {
    const user = recentUsers.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.status = req.body.status;
    res.json(user);
});

// ── Sample Collections ──
adminRouter.get('/sample-collections', (req, res) => {
    res.json({ collections: sampleCollections, total: sampleCollections.length });
});

adminRouter.post('/sample-collections', (req, res) => {
    const collection = {
        id: 'SC-' + String(sampleCollections.length + 1).padStart(3, '0'),
        ...req.body,
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };
    sampleCollections.push(collection);
    res.status(201).json(collection);
});

adminRouter.patch('/sample-collections/:id/status', (req, res) => {
    const coll = sampleCollections.find(c => c.id === req.params.id);
    if (!coll) return res.status(404).json({ error: 'Collection not found' });
    coll.status = req.body.status;
    res.json(coll);
});

// ── Doctor Stats ──
adminRouter.get('/doctor-stats/:vetId', (req, res) => {
    const vetId = parseInt(req.params.vetId);
    // Simulated per-doctor stats
    const doctorStats = {
        1: { todayAppointments: 4, weekAppointments: 18, monthConsultations: 68, totalEarnings: 156000, monthEarnings: 34000, rating: 4.9, completionRate: 96 },
        2: { todayAppointments: 3, weekAppointments: 14, monthConsultations: 52, totalEarnings: 198000, monthEarnings: 36400, rating: 4.8, completionRate: 94 },
        3: { todayAppointments: 2, weekAppointments: 10, monthConsultations: 38, totalEarnings: 98000, monthEarnings: 22800, rating: 4.7, completionRate: 97 },
        4: { todayAppointments: 5, weekAppointments: 22, monthConsultations: 85, totalEarnings: 245000, monthEarnings: 38250, rating: 4.6, completionRate: 93 },
        5: { todayAppointments: 4, weekAppointments: 20, monthConsultations: 72, totalEarnings: 178000, monthEarnings: 39600, rating: 4.9, completionRate: 98 },
        6: { todayAppointments: 2, weekAppointments: 8, monthConsultations: 28, totalEarnings: 89000, monthEarnings: 22400, rating: 4.5, completionRate: 91 }
    };
    res.json(doctorStats[vetId] || doctorStats[1]);
});

// ── Doctor Appointments ──
adminRouter.get('/doctor-appointments/:vetId', (req, res) => {
    const appointments = [
        { id: 'APT-001', petName: 'Bruno', ownerName: 'Praveen Kumar', ownerPhone: '+91 98765 43210', time: '09:00', type: 'Video Call', reason: 'Skin allergy follow-up', status: 'scheduled' },
        { id: 'APT-002', petName: 'Coco', ownerName: 'Anita Desai', ownerPhone: '+91 87654 32109', time: '10:00', type: 'Video Call', reason: 'Annual vaccination', status: 'scheduled' },
        { id: 'APT-003', petName: 'Max', ownerName: 'Rahul Mehra', ownerPhone: '+91 76543 21098', time: '11:00', type: 'Chat', reason: 'Digestive issues', status: 'in-progress' },
        { id: 'APT-004', petName: 'Daisy', ownerName: 'Sanya Joshi', ownerPhone: '+91 65432 10987', time: '14:00', type: 'Video Call', reason: 'Post-surgery check', status: 'scheduled' },
        { id: 'APT-005', petName: 'Rocky', ownerName: 'Vikram Patel', ownerPhone: '+91 54321 09876', time: '15:00', type: 'Video Call', reason: 'Limping - orthopedic consult', status: 'scheduled' }
    ];
    res.json({ appointments, date: new Date().toISOString().split('T')[0] });
});

// ── Doctor Patient History ──
adminRouter.get('/doctor-patients/:vetId', (req, res) => {
    const patients = [
        { petName: 'Bruno', species: 'dog', breed: 'Golden Retriever', ownerName: 'Praveen Kumar', lastVisit: '2026-02-09', visits: 5, notes: 'Chronic skin allergy. Responds well to antihistamines.' },
        { petName: 'Coco', species: 'dog', breed: 'Shih Tzu', ownerName: 'Anita Desai', lastVisit: '2026-01-15', visits: 3, notes: 'Regular vaccination schedule. Healthy.' },
        { petName: 'Max', species: 'dog', breed: 'German Shepherd', ownerName: 'Rahul Mehra', lastVisit: '2026-02-01', visits: 8, notes: 'Hip dysplasia management. On glucosamine supplements.' },
        { petName: 'Whiskers', species: 'cat', breed: 'Siamese', ownerName: 'Deepa Nair', lastVisit: '2026-01-28', visits: 2, notes: 'Urinary tract sensitivity. Special diet recommended.' },
        { petName: 'Luna', species: 'cat', breed: 'Persian', ownerName: 'Praveen Kumar', lastVisit: '2026-02-09', visits: 4, notes: 'Hairball issues. Uses medicated shampoo.' }
    ];
    res.json({ patients });
});
