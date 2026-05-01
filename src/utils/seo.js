// ═══════════════════════════════════════════════════
// VetaDoc — SEO Manager (Dynamic Meta Tags)
// ═══════════════════════════════════════════════════

const routeMeta = {
    '/': {
        title: 'VetaDoc — India\'s #1 Online Veterinary Pharmacy & Pet Care',
        description: 'Order veterinary medicines, book online vet consultations, manage pet health profiles & track vaccinations. Trusted by 50,000+ pet parents. Free delivery on ₹499+.',
        keywords: 'veterinary pharmacy, online vet consultation, pet medicines India, animal healthcare, dog medicines, cat medicines, vet consultation online, pet health'
    },
    '/catalog': {
        title: 'Shop Veterinary Medicines & Pet Supplies | VetaDoc',
        description: 'Browse 10,000+ veterinary medicines, supplements, vaccines, dewormers & pet care products. Prescription verified. Fast delivery across India.',
        keywords: 'buy veterinary medicines online, pet supplements, animal vaccines, dewormers, pet pharmacy India'
    },
    '/consultation': {
        title: 'Book Online Vet Consultation — Video Call with Certified Veterinarians | VetaDoc',
        description: 'Consult certified veterinarians via video call from home. Get expert advice for your pets — dogs, cats, birds, cattle & horses. Starting ₹299.',
        keywords: 'online vet consultation, video call veterinarian, pet doctor online, vet consultation India, veterinary telemedicine'
    },
    '/pets': {
        title: 'My Pet Profiles — Track Vaccinations & Health Records | VetaDoc',
        description: 'Manage pet profiles, track vaccination schedules, view health timelines & get personalized product recommendations for your pets.',
        keywords: 'pet health records, vaccination tracker, pet profile management, dog vaccination schedule'
    },
    '/cart': {
        title: 'Shopping Cart | VetaDoc',
        description: 'Review your veterinary medicine cart, apply coupons & proceed to checkout. Free delivery on orders above ₹499.',
        keywords: 'veterinary medicines cart, pet pharmacy checkout'
    },
    '/orders': {
        title: 'My Orders — Track Veterinary Medicine Deliveries | VetaDoc',
        description: 'Track your veterinary medicine orders, view order history, reorder medicines & manage prescriptions.',
        keywords: 'track vet medicine delivery, order history, pet medicine delivery'
    },
    '/dashboard': {
        title: 'My Dashboard — Pet Parent Hub | VetaDoc',
        description: 'Your personal dashboard — view pet health summaries, upcoming consultations, orders & vaccination reminders in one place.',
        keywords: 'pet parent dashboard, pet health summary, vaccination reminders'
    },
    '/samples': {
        title: 'At-Home Pet Sample Collection — Blood, Urine & Lab Tests | VetaDoc',
        description: 'Book at-home sample collection for your pets. Blood tests, urine analysis, skin scraping & more. Results delivered digitally.',
        keywords: 'pet lab tests, animal blood test, veterinary sample collection, pet diagnostics India'
    },
    '/followups': {
        title: 'Pet Follow-Up Schedule — Track Appointments & Medication | VetaDoc',
        description: 'Manage follow-up appointments, medication schedules, post-surgery checks & wellness visits for your pets.',
        keywords: 'pet follow up appointment, veterinary follow up, pet medication schedule'
    },
    '/admin': {
        title: 'Admin Portal — VetaDoc Management Dashboard',
        description: 'VetaDoc admin dashboard for managing orders, products, users, consultations & analytics.',
        keywords: 'vetadoc admin, veterinary pharmacy management'
    },
    '/doctor': {
        title: 'Doctor Portal — Veterinarian Dashboard | VetaDoc',
        description: 'Doctor dashboard for managing appointments, patient records, prescriptions & earnings.',
        keywords: 'veterinarian dashboard, vet appointment management'
    }
};

export function updateSEO(route) {
    const base = '/' + (route.split('/').filter(Boolean)[0] || '');
    const meta = routeMeta[base] || routeMeta['/'];

    // Update title
    document.title = meta.title;

    // Update or create meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
        descTag.setAttribute('content', meta.description);
    }

    // Update or create meta keywords
    let kwTag = document.querySelector('meta[name="keywords"]');
    if (!kwTag) {
        kwTag = document.createElement('meta');
        kwTag.name = 'keywords';
        document.head.appendChild(kwTag);
    }
    kwTag.setAttribute('content', meta.keywords);

    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = `https://vetadoc.in${route === '/' ? '' : '/#' + route}`;
}

export function injectStructuredData() {
    // Remove existing
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    const schemas = [
        {
            "@context": "https://schema.org",
            "@type": "VeterinaryPharmacy",
            "name": "VetaDoc",
            "description": "India's most trusted online veterinary pharmacy. Order medicines, book vet consultations, manage pet health profiles.",
            "url": "https://vetadoc.in",
            "logo": "https://vetadoc.in/logo.png",
            "telephone": "+91-9876543210",
            "email": "support@vetadoc.in",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Hyderabad",
                "addressRegion": "Telangana",
                "postalCode": "500033",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": "17.4065",
                "longitude": "78.4772"
            },
            "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
            },
            "priceRange": "₹₹",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "2340",
                "bestRating": "5"
            },
            "sameAs": [
                "https://www.facebook.com/vetadoc",
                "https://www.instagram.com/vetadoc",
                "https://twitter.com/vetadoc"
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": "VetaDoc Vet Consultation",
            "description": "Online video consultations with certified veterinarians for dogs, cats, birds, cattle, and horses.",
            "medicalSpecialty": "Veterinary Medicine",
            "availableService": {
                "@type": "MedicalProcedure",
                "name": "Online Vet Consultation",
                "procedureType": "Telemedicine"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "VetaDoc",
            "url": "https://vetadoc.in",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://vetadoc.in/#/catalog?search={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        }
    ];

    schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    });
}
