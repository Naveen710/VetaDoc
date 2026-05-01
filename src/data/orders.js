// ═══════════════════════════════════════════════════
// VetaDoc — Sample Order Data
// ═══════════════════════════════════════════════════

export const sampleOrders = [
    {
        id: 'VD-2026-00147',
        date: '2026-02-08',
        status: 'delivered',
        total: 1148,
        items: [
            { productId: 1, name: 'Amoxicillin Tablets 250mg', emoji: '💊', qty: 2, price: 349 },
            { productId: 3, name: 'Omega-3 Fish Oil Supplement', emoji: '🐟', qty: 1, price: 599 },
        ],
        prescriptionUploaded: true,
        tracking: [
            { status: 'Order Placed', time: '2026-02-08 10:30 AM', detail: 'Your order has been placed successfully', completed: true },
            { status: 'Prescription Verified', time: '2026-02-08 11:15 AM', detail: 'Your prescription has been verified by our pharmacist', completed: true },
            { status: 'Processing', time: '2026-02-08 02:00 PM', detail: 'Your order is being prepared for shipment', completed: true },
            { status: 'Shipped', time: '2026-02-09 09:00 AM', detail: 'Package picked up by courier partner — Tracking: DTDC-784521963', completed: true },
            { status: 'Out for Delivery', time: '2026-02-10 08:30 AM', detail: 'Your package is out for delivery', completed: true },
            { status: 'Delivered', time: '2026-02-10 01:45 PM', detail: 'Package delivered successfully. Signed by: Priya', completed: true },
        ],
        address: '42 Green Park, Jubilee Hills, Hyderabad - 500033'
    },
    {
        id: 'VD-2026-00183',
        date: '2026-02-10',
        status: 'shipped',
        total: 924,
        items: [
            { productId: 10, name: 'Fipronil Spot-On (Dogs)', emoji: '🛡️', qty: 1, price: 350 },
            { productId: 9, name: 'Calcium & Phosphorus Syrup', emoji: '🦴', qty: 1, price: 245 },
            { productId: 4, name: 'Praziquantel Dewormer Tabs', emoji: '🐛', qty: 1, price: 189 },
        ],
        prescriptionUploaded: false,
        tracking: [
            { status: 'Order Placed', time: '2026-02-10 03:20 PM', detail: 'Your order has been placed successfully', completed: true },
            { status: 'Processing', time: '2026-02-10 04:00 PM', detail: 'Your order is being prepared', completed: true },
            { status: 'Shipped', time: '2026-02-11 10:00 AM', detail: 'Package shipped — Tracking: BW-56789012', completed: true },
            { status: 'Out for Delivery', time: '', detail: 'Expected delivery by Feb 12', completed: false },
            { status: 'Delivered', time: '', detail: '', completed: false },
        ],
        address: '15 Banjara Hills Road No. 12, Hyderabad - 500034'
    },
    {
        id: 'VD-2026-00201',
        date: '2026-02-11',
        status: 'processing',
        total: 1380,
        items: [
            { productId: 2, name: 'Canine Rabies Vaccine', emoji: '💉', qty: 1, price: 299 },
            { productId: 7, name: 'Meloxicam Oral Suspension', emoji: '💪', qty: 1, price: 320 },
            { productId: 24, name: 'Glucosamine Joint Support', emoji: '🦴', qty: 1, price: 699 },
        ],
        prescriptionUploaded: true,
        tracking: [
            { status: 'Order Placed', time: '2026-02-11 09:45 AM', detail: 'Your order has been placed', completed: true },
            { status: 'Prescription Verification', time: '2026-02-11 10:30 AM', detail: 'Your prescription is under review', completed: true },
            { status: 'Processing', time: '2026-02-11 12:00 PM', detail: 'Order is being packed at warehouse', completed: false },
            { status: 'Shipped', time: '', detail: '', completed: false },
            { status: 'Delivered', time: '', detail: '', completed: false },
        ],
        address: '8 Madhapur Main Road, Hyderabad - 500081'
    }
];

export const sampleConsultations = [
    {
        id: 'VC-001',
        vetId: 1,
        vetName: 'Dr. Priya Sharma',
        petName: 'Bruno',
        date: '2026-02-13',
        time: '10:00',
        type: 'Video Call',
        status: 'upcoming',
        notes: 'Follow-up on skin allergy treatment'
    },
    {
        id: 'VC-002',
        vetId: 5,
        vetName: 'Dr. Sneha Gupta',
        petName: 'Luna',
        date: '2026-02-09',
        time: '14:00',
        type: 'Video Call',
        status: 'completed',
        notes: 'Dermatology consultation for persistent itching. Prescribed medicated shampoo.',
        prescription: 'Chlorhexidine shampoo + antihistamine tablets for 7 days'
    }
];
