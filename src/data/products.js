// ═══════════════════════════════════════════════════
// VetaDoc — Product Data
// ═══════════════════════════════════════════════════

export const categories = [
    { id: 'antibiotics', name: 'Antibiotics', icon: '💊', count: 5 },
    { id: 'vaccines', name: 'Vaccines', icon: '💉', count: 4 },
    { id: 'supplements', name: 'Supplements', icon: '🧴', count: 5 },
    { id: 'dewormers', name: 'Dewormers', icon: '🐛', count: 4 },
    { id: 'skincare', name: 'Skin & Coat', icon: '✨', count: 4 },
    { id: 'digestive', name: 'Digestive Care', icon: '🦠', count: 3 },
    { id: 'pain-relief', name: 'Pain Relief', icon: '💪', count: 3 },
    { id: 'eye-ear', name: 'Eye & Ear Care', icon: '👁️', count: 3 },
];

export const species = [
    { id: 'dog', name: 'Dogs', icon: '🐕' },
    { id: 'cat', name: 'Cats', icon: '🐈' },
    { id: 'bird', name: 'Birds', icon: '🐦' },
    { id: 'cattle', name: 'Cattle', icon: '🐄' },
    { id: 'horse', name: 'Horses', icon: '🐴' },
    { id: 'fish', name: 'Fish', icon: '🐟' },
];

export const brands = [
    'VetCare Pro', 'PetShield', 'ZoetisVet', 'BayerAnimal',
    'MerilLife', 'HimalayaPet', 'VenturaVet', 'IndiPet'
];

export const products = [
    {
        id: 1, name: 'Amoxicillin Tablets 250mg',
        category: 'antibiotics', species: ['dog', 'cat'],
        brand: 'VetCare Pro', price: 349, originalPrice: 420,
        emoji: '💊', prescriptionRequired: true,
        stock: 45, description: 'Broad-spectrum antibiotic for bacterial infections in dogs and cats. Effective against respiratory, urinary tract, skin, and soft tissue infections.',
        dosage: '10-20mg/kg body weight, twice daily for 5-7 days',
        batchNo: 'AMX-2026-0142', expiryDate: '2027-08-15',
        manufacturer: 'VetCare Pharmaceuticals Ltd.', rating: 4.5, reviews: 128,
        featured: true
    },
    {
        id: 2, name: 'Canine Rabies Vaccine',
        category: 'vaccines', species: ['dog'],
        brand: 'ZoetisVet', price: 299, originalPrice: 350,
        emoji: '💉', prescriptionRequired: true,
        stock: 120, description: 'Inactivated rabies vaccine for dogs. Provides immunity for up to 3 years. Essential for all dogs as per Indian veterinary regulations.',
        dosage: '1 ml subcutaneous injection, annual booster',
        batchNo: 'RBV-2026-0088', expiryDate: '2027-03-20',
        manufacturer: 'Zoetis India Pvt Ltd.', rating: 4.8, reviews: 256,
        featured: true
    },
    {
        id: 3, name: 'Omega-3 Fish Oil Supplement',
        category: 'supplements', species: ['dog', 'cat'],
        brand: 'HimalayaPet', price: 599, originalPrice: 750,
        emoji: '🐟', prescriptionRequired: false,
        stock: 200, description: 'Pure fish oil supplement rich in EPA & DHA for healthy skin, coat, joints, and heart. Cold-pressed for maximum potency.',
        dosage: '1 capsule per 10kg body weight daily with food',
        batchNo: 'OMG-2026-0231', expiryDate: '2027-11-30',
        manufacturer: 'Himalaya Pet Care', rating: 4.6, reviews: 342,
        featured: true
    },
    {
        id: 4, name: 'Praziquantel Dewormer Tabs',
        category: 'dewormers', species: ['dog', 'cat'],
        brand: 'BayerAnimal', price: 189, originalPrice: 230,
        emoji: '🐛', prescriptionRequired: false,
        stock: 8, description: 'Broad-spectrum dewormer effective against tapeworms, roundworms, and hookworms. Single dose treatment with high efficacy.',
        dosage: '1 tablet per 5kg body weight, single dose',
        batchNo: 'PRZ-2026-0567', expiryDate: '2027-06-10',
        manufacturer: 'Bayer Animal Health India', rating: 4.7, reviews: 189,
        featured: false
    },
    {
        id: 5, name: 'Chlorhexidine Shampoo 250ml',
        category: 'skincare', species: ['dog'],
        brand: 'VenturaVet', price: 425, originalPrice: 499,
        emoji: '🧴', prescriptionRequired: false,
        stock: 65, description: 'Medicated antiseptic shampoo for bacterial and fungal skin infections. Contains chlorhexidine gluconate 2% for effective treatment of pyoderma and dermatitis.',
        dosage: 'Apply to wet coat, lather for 5-10 minutes, rinse thoroughly. Use 2-3 times weekly.',
        batchNo: 'CHL-2026-0089', expiryDate: '2028-01-25',
        manufacturer: 'Ventura BioPharma', rating: 4.4, reviews: 97,
        featured: false
    },
    {
        id: 6, name: 'Probiotic Digestive Gel',
        category: 'digestive', species: ['dog', 'cat', 'bird'],
        brand: 'PetShield', price: 475, originalPrice: 550,
        emoji: '🦠', prescriptionRequired: false,
        stock: 150, description: 'Advanced probiotic gel containing 10 billion CFU with prebiotics for digestive health. Helps with diarrhea, bloating, and promotes gut flora balance.',
        dosage: '1 ml per 5kg body weight daily, mix with food',
        batchNo: 'PBG-2026-0344', expiryDate: '2027-05-18',
        manufacturer: 'PetShield Healthcare', rating: 4.3, reviews: 64,
        featured: true
    },
    {
        id: 7, name: 'Meloxicam Oral Suspension',
        category: 'pain-relief', species: ['dog'],
        brand: 'MerilLife', price: 320, originalPrice: 380,
        emoji: '💪', prescriptionRequired: true,
        stock: 30, description: 'Non-steroidal anti-inflammatory drug for pain relief and inflammation. Indicated for osteoarthritis, post-surgical pain, and musculoskeletal disorders.',
        dosage: '0.1mg/kg body weight once daily with food',
        batchNo: 'MLX-2026-0178', expiryDate: '2027-09-12',
        manufacturer: 'Meril Life Sciences', rating: 4.5, reviews: 76,
        featured: false
    },
    {
        id: 8, name: 'Ear Drops - Oticlean Plus',
        category: 'eye-ear', species: ['dog', 'cat'],
        brand: 'IndiPet', price: 265, originalPrice: 310,
        emoji: '👂', prescriptionRequired: false,
        stock: 0, description: 'Medicated ear drops for otitis externa treatment. Contains clotrimazole and beclomethasone for anti-fungal and anti-inflammatory action.',
        dosage: '4-5 drops in affected ear, twice daily for 7-14 days',
        batchNo: 'OTC-2026-0092', expiryDate: '2027-07-01',
        manufacturer: 'IndiPet Pharma', rating: 4.2, reviews: 53,
        featured: false
    },
    {
        id: 9, name: 'Calcium & Phosphorus Syrup',
        category: 'supplements', species: ['dog', 'cat', 'bird'],
        brand: 'HimalayaPet', price: 245, originalPrice: 299,
        emoji: '🦴', prescriptionRequired: false,
        stock: 180, description: 'Essential calcium and phosphorus supplement with Vitamin D3 for strong bones and teeth. Ideal for growing puppies, lactating mothers, and senior dogs.',
        dosage: '5-10ml daily depending on body weight, mix with food',
        batchNo: 'CAP-2026-0215', expiryDate: '2028-02-28',
        manufacturer: 'Himalaya Pet Care', rating: 4.6, reviews: 201,
        featured: false
    },
    {
        id: 10, name: 'Fipronil Spot-On (Dogs)',
        category: 'skincare', species: ['dog'],
        brand: 'BayerAnimal', price: 350, originalPrice: 420,
        emoji: '🛡️', prescriptionRequired: false,
        stock: 95, description: 'Topical flea and tick treatment. Single application provides protection for up to 30 days. Waterproof formula.',
        dosage: 'Apply entire pipette contents on skin between shoulder blades monthly',
        batchNo: 'FPN-2026-0401', expiryDate: '2028-04-15',
        manufacturer: 'Bayer Animal Health India', rating: 4.7, reviews: 312,
        featured: true
    },
    {
        id: 11, name: 'Feline FVRCP Vaccine',
        category: 'vaccines', species: ['cat'],
        brand: 'ZoetisVet', price: 450, originalPrice: 520,
        emoji: '💉', prescriptionRequired: true,
        stock: 50, description: 'Core combination vaccine for cats protecting against Feline Viral Rhinotracheitis, Calicivirus, and Panleukopenia. Essential for all cats.',
        dosage: '1 ml subcutaneous, initial series at 8-9 weeks, booster at 12 weeks',
        batchNo: 'FVR-2026-0055', expiryDate: '2027-01-30',
        manufacturer: 'Zoetis India Pvt Ltd.', rating: 4.9, reviews: 145,
        featured: false
    },
    {
        id: 12, name: 'Ivermectin Pour-On (Cattle)',
        category: 'dewormers', species: ['cattle'],
        brand: 'MerilLife', price: 890, originalPrice: 1050,
        emoji: '🐄', prescriptionRequired: true,
        stock: 40, description: 'Pour-on formulation for treatment and control of internal and external parasites in cattle. Effective against gastrointestinal roundworms, lungworms, and ectoparasites.',
        dosage: '1ml per 10kg body weight applied along the backline',
        batchNo: 'IVM-2026-0123', expiryDate: '2027-12-20',
        manufacturer: 'Meril Life Sciences', rating: 4.4, reviews: 67,
        featured: false
    },
    {
        id: 13, name: 'Eye Drops - Gentamicin 0.3%',
        category: 'eye-ear', species: ['dog', 'cat', 'horse'],
        brand: 'VetCare Pro', price: 185, originalPrice: 220,
        emoji: '👁️', prescriptionRequired: true,
        stock: 75, description: 'Ophthalmic antibiotic drops for bacterial conjunctivitis and corneal infections. Sterile solution with broad-spectrum activity.',
        dosage: '1-2 drops in affected eye, 3-4 times daily for 7-10 days',
        batchNo: 'GNT-2026-0067', expiryDate: '2027-04-30',
        manufacturer: 'VetCare Pharmaceuticals Ltd.', rating: 4.3, reviews: 41,
        featured: false
    },
    {
        id: 14, name: 'Multivitamin Tablets for Dogs',
        category: 'supplements', species: ['dog'],
        brand: 'PetShield', price: 520, originalPrice: 620,
        emoji: '🌟', prescriptionRequired: false,
        stock: 3, description: 'Complete daily multivitamin with 23 essential nutrients including vitamins A, B-complex, C, D, E, plus minerals zinc, iron, and selenium for overall health.',
        dosage: '1 tablet daily for dogs up to 20kg, 2 tablets for larger breeds',
        batchNo: 'MVT-2026-0289', expiryDate: '2027-10-15',
        manufacturer: 'PetShield Healthcare', rating: 4.5, reviews: 178,
        featured: true
    },
    {
        id: 15, name: 'Cefpodoxime Proxetil 200mg',
        category: 'antibiotics', species: ['dog'],
        brand: 'VenturaVet', price: 480, originalPrice: 560,
        emoji: '💊', prescriptionRequired: true,
        stock: 22, description: 'Third-generation cephalosporin antibiotic for treating skin infections, UTI, and respiratory infections in dogs. Palatable tablet for easy administration.',
        dosage: '5-10mg/kg body weight once daily for 5-7 days',
        batchNo: 'CFP-2026-0134', expiryDate: '2027-08-20',
        manufacturer: 'Ventura BioPharma', rating: 4.4, reviews: 89,
        featured: false
    },
    {
        id: 16, name: 'Horse Electrolyte Powder',
        category: 'supplements', species: ['horse'],
        brand: 'VetCare Pro', price: 750, originalPrice: 890,
        emoji: '🐴', prescriptionRequired: false,
        stock: 35, description: 'Electrolyte replacement powder for horses during intense exercise, hot weather, or illness. Contains sodium, potassium, chloride, and magnesium.',
        dosage: '30g mixed in feed or dissolved in water, daily during exertion',
        batchNo: 'ELP-2026-0045', expiryDate: '2028-03-10',
        manufacturer: 'VetCare Pharmaceuticals Ltd.', rating: 4.6, reviews: 34,
        featured: false
    },
    {
        id: 17, name: 'Anti-Fungal Cream (Miconazole)',
        category: 'skincare', species: ['dog', 'cat'],
        brand: 'IndiPet', price: 199, originalPrice: 240,
        emoji: '🧴', prescriptionRequired: false,
        stock: 110, description: 'Topical antifungal cream containing miconazole nitrate 2%. Effective against ringworm, yeast infections, and other fungal skin conditions.',
        dosage: 'Apply thin layer to affected area twice daily for 2-4 weeks',
        batchNo: 'MCN-2026-0178', expiryDate: '2027-11-05',
        manufacturer: 'IndiPet Pharma', rating: 4.1, reviews: 62,
        featured: false
    },
    {
        id: 18, name: 'Metoclopramide Injection 10ml',
        category: 'digestive', species: ['dog', 'cat'],
        brand: 'MerilLife', price: 145, originalPrice: 180,
        emoji: '💧', prescriptionRequired: true,
        stock: 60, description: 'Anti-emetic and prokinetic injection for nausea, vomiting, and gastric motility disorders. Fast-acting parenteral formulation.',
        dosage: '0.2-0.5mg/kg body weight IM or SC, 2-3 times daily',
        batchNo: 'MTC-2026-0099', expiryDate: '2027-02-28',
        manufacturer: 'Meril Life Sciences', rating: 4.2, reviews: 38,
        featured: false
    },
    {
        id: 19, name: 'Tramadol HCl Tablets 50mg',
        category: 'pain-relief', species: ['dog'],
        brand: 'VetCare Pro', price: 280, originalPrice: 340,
        emoji: '💊', prescriptionRequired: true,
        stock: 15, description: 'Centrally acting analgesic for moderate to severe pain management in dogs. Useful for post-operative pain, chronic pain, and cancer pain management.',
        dosage: '2-5mg/kg body weight, 2-3 times daily',
        batchNo: 'TRM-2026-0056', expiryDate: '2027-06-30',
        manufacturer: 'VetCare Pharmaceuticals Ltd.', rating: 4.3, reviews: 55,
        featured: false
    },
    {
        id: 20, name: 'Bird Vitamin Drops 30ml',
        category: 'supplements', species: ['bird'],
        brand: 'PetShield', price: 175, originalPrice: 210,
        emoji: '🐦', prescriptionRequired: false,
        stock: 140, description: 'Essential vitamin supplement for pet birds. Contains vitamins A, D3, E, and B-complex for feather health, breeding support, and immune function.',
        dosage: '2-4 drops in drinking water daily',
        batchNo: 'BVD-2026-0201', expiryDate: '2027-09-25',
        manufacturer: 'PetShield Healthcare', rating: 4.4, reviews: 72,
        featured: false
    },
    {
        id: 21, name: 'Doxycycline Capsules 100mg',
        category: 'antibiotics', species: ['dog', 'cat', 'bird'],
        brand: 'BayerAnimal', price: 220, originalPrice: 270,
        emoji: '💊', prescriptionRequired: true,
        stock: 85, description: 'Tetracycline class antibiotic for respiratory infections, tick-borne diseases, and urogenital infections. Also used for ehrlichiosis and leptospirosis.',
        dosage: '5-10mg/kg body weight once or twice daily for 7-14 days',
        batchNo: 'DXC-2026-0312', expiryDate: '2027-07-15',
        manufacturer: 'Bayer Animal Health India', rating: 4.5, reviews: 103,
        featured: false
    },
    {
        id: 22, name: 'Feline Leukemia Vaccine (FeLV)',
        category: 'vaccines', species: ['cat'],
        brand: 'ZoetisVet', price: 680, originalPrice: 780,
        emoji: '💉', prescriptionRequired: true,
        stock: 25, description: 'Vaccine against Feline Leukemia Virus. Recommended for cats that go outdoors or have contact with FeLV-positive cats.',
        dosage: '1 ml subcutaneous, 2 doses 3-4 weeks apart, annual booster',
        batchNo: 'FLV-2026-0033', expiryDate: '2027-03-10',
        manufacturer: 'Zoetis India Pvt Ltd.', rating: 4.8, reviews: 88,
        featured: false
    },
    {
        id: 23, name: 'Albendazole Cattle Bolus',
        category: 'dewormers', species: ['cattle'],
        brand: 'VenturaVet', price: 120, originalPrice: 150,
        emoji: '🐄', prescriptionRequired: false,
        stock: 250, description: 'Broad-spectrum anthelmintic bolus for cattle and buffalo. Active against liver flukes, tapeworms, and gastrointestinal nematodes.',
        dosage: '1 bolus per 150kg body weight, oral administration',
        batchNo: 'ALB-2026-0445', expiryDate: '2028-05-20',
        manufacturer: 'Ventura BioPharma', rating: 4.3, reviews: 156,
        featured: false
    },
    {
        id: 24, name: 'Glucosamine Joint Support',
        category: 'supplements', species: ['dog', 'horse'],
        brand: 'HimalayaPet', price: 699, originalPrice: 850,
        emoji: '🦴', prescriptionRequired: false,
        stock: 90, description: 'Advanced joint support formula with glucosamine, chondroitin, MSM, and turmeric extract. Supports cartilage health and mobility in aging dogs.',
        dosage: '1 tablet per 15kg body weight daily with food',
        batchNo: 'GLC-2026-0167', expiryDate: '2028-01-10',
        manufacturer: 'Himalaya Pet Care', rating: 4.7, reviews: 224,
        featured: true
    },
    {
        id: 25, name: 'Carprofen Tablets 75mg',
        category: 'pain-relief', species: ['dog'],
        brand: 'ZoetisVet', price: 560, originalPrice: 650,
        emoji: '💊', prescriptionRequired: true,
        stock: 38, description: 'NSAID for management of pain and inflammation associated with osteoarthritis and post-operative discomfort. Chewable liver-flavored tablets.',
        dosage: '2mg/kg body weight twice daily or 4mg/kg once daily',
        batchNo: 'CRP-2026-0091', expiryDate: '2027-10-05',
        manufacturer: 'Zoetis India Pvt Ltd.', rating: 4.6, reviews: 134,
        featured: false
    },
    {
        id: 26, name: 'Tick & Flea Collar (Cat)',
        category: 'skincare', species: ['cat'],
        brand: 'BayerAnimal', price: 399, originalPrice: 480,
        emoji: '📿', prescriptionRequired: false,
        stock: 70, description: 'Adjustable collar with sustained-release flea and tick protection for up to 8 months. Water-resistant with breakaway safety mechanism for cats.',
        dosage: 'Fit snugly around neck with 2-finger gap. Replace every 8 months.',
        batchNo: 'TFC-2026-0189', expiryDate: '2028-06-30',
        manufacturer: 'Bayer Animal Health India', rating: 4.5, reviews: 198,
        featured: false
    },
    {
        id: 27, name: 'Oral Rehydration Salts (Vet)',
        category: 'digestive', species: ['dog', 'cat', 'cattle', 'bird'],
        brand: 'IndiPet', price: 85, originalPrice: 110,
        emoji: '💧', prescriptionRequired: false,
        stock: 300, description: 'Veterinary ORS powder for dehydration management in diarrhea, vomiting, and heat stress. Contains glucose, sodium, potassium, and citrate.',
        dosage: 'Dissolve 1 sachet in 500ml clean water. Offer ad libitum.',
        batchNo: 'ORS-2026-0567', expiryDate: '2028-08-15',
        manufacturer: 'IndiPet Pharma', rating: 4.2, reviews: 87,
        featured: false
    },
    {
        id: 28, name: 'Canine Distemper Vaccine',
        category: 'vaccines', species: ['dog'],
        brand: 'VetCare Pro', price: 520, originalPrice: 600,
        emoji: '💉', prescriptionRequired: true,
        stock: 55, description: 'Modified live virus vaccine for canine distemper prevention. Part of essential core vaccination protocol for puppies and adult dogs.',
        dosage: '1 ml subcutaneous at 6-8 weeks, boosters at 3-4 week intervals until 16 weeks',
        batchNo: 'CDV-2026-0078', expiryDate: '2027-04-20',
        manufacturer: 'VetCare Pharmaceuticals Ltd.', rating: 4.7, reviews: 167,
        featured: false
    },
    {
        id: 29, name: 'Fish Antibacterial Solution',
        category: 'antibiotics', species: ['fish'],
        brand: 'PetShield', price: 310, originalPrice: 370,
        emoji: '🐟', prescriptionRequired: false,
        stock: 55, description: 'Broad-spectrum antibacterial solution for treating bacterial infections in ornamental and aquarium fish. Controls fin rot, dropsy, and ulcers.',
        dosage: '5ml per 20 liters of aquarium water. Treat for 5-7 days.',
        batchNo: 'FAB-2026-0034', expiryDate: '2027-12-10',
        manufacturer: 'PetShield Healthcare', rating: 4.0, reviews: 29,
        featured: false
    },
    {
        id: 30, name: 'Levamisole Dewormer (Poultry)',
        category: 'dewormers', species: ['bird'],
        brand: 'VenturaVet', price: 160, originalPrice: 195,
        emoji: '🐔', prescriptionRequired: false,
        stock: 180, description: 'Anthelmintic solution for poultry and cage birds. Effective against roundworms and gapeworms. Also has immunostimulatory properties.',
        dosage: '1ml per 2 liters drinking water for 1 day. Repeat after 14 days.',
        batchNo: 'LVM-2026-0223', expiryDate: '2028-02-15',
        manufacturer: 'Ventura BioPharma', rating: 4.1, reviews: 43,
        featured: false
    },
];
