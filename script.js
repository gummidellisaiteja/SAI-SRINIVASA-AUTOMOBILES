/* ==========================================================================
   SAI SRINIVASA AUTOMOBILES - MAIN JAVASCRIPT LOGIC
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. SPARE PARTS CATALOG DATABASE
// --------------------------------------------------------------------------
const sparePartsData = [
    // --- TWO WHEELER PARTS ---
    {
        id: "tw-1",
        name: "Front & Rear Brake Pad Kit",
        vehicle: "Two Wheeler",
        category: "Brake",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Hero Splendor, HF Deluxe, Bajaj Pulsar, TVS Apache, Honda Shine, Activa",
        desc: "High friction long-lasting ceramic/metallic brake pads for superior stopping power.",
        image: "https://images.unsplash.com/photo-1600706432502-7788f46ef136?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-2",
        name: "Heavy Duty Clutch Plate Set",
        vehicle: "Two Wheeler",
        category: "Clutch",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Hero Passion, Pulsar 150/180/220, TVS Rider, Honda CB Unicorn",
        desc: "High heat resistant friction plates ensuring smooth gear pickup and torque transmission.",
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-3",
        name: "High Flow Air Filter",
        vehicle: "Two Wheeler",
        category: "Filters",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Honda Activa 3G/4G/5G/6G, Jupiter, Access 125, Hero Maestro",
        desc: "Multi-layer micro-mesh air filter preventing dust intrusion and enhancing engine life.",
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-4",
        name: "Premium 4T Engine Oil Filter",
        vehicle: "Two Wheeler",
        category: "Filters",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Yamaha FZ, KTM Duke, Royal Enfield Classic 350, Pulsar NS200",
        desc: "Synthetic media oil filter trapping micro contaminants and preserving engine lubrication.",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-5",
        name: "Chain & Sprocket Kit",
        vehicle: "Two Wheeler",
        category: "Engine",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Hero Glamour, Passion Pro, Pulsar 150, TVS Apache RTR",
        desc: "Durable hardened steel sprockets with O-ring drive chain for silent long-distance riding.",
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-6",
        name: "Power Spark Plug (NGK / Bosch)",
        vehicle: "Two Wheeler",
        category: "Electrical",
        price: "Contact Shop",
        availability: "Available",
        compatible: "All 100cc - 250cc Motorbikes & Scooters",
        desc: "Iridium core spark plug offering instant cold start and optimal fuel combustion.",
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-7",
        name: "Maintenance Free 12V Battery",
        vehicle: "Two Wheeler",
        category: "Battery",
        price: "Contact Shop",
        availability: "Confirm with Shop",
        compatible: "Exide / Amaron for all Scooters & Motorcycles",
        desc: "Vibration resistant VRLA battery with high cranking power and zero maintenance.",
        image: "https://images.unsplash.com/photo-1600706432502-7788f46ef136?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-8",
        name: "Crystal Lens Headlight Assembly",
        vehicle: "Two Wheeler",
        category: "Electrical",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Hero Splendor, HF Deluxe, Honda Shine, TVS XL 100",
        desc: "Impact resistant polycarbonate reflector headlight assembly with clear focus beam.",
        image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-9",
        name: "Flexible Turn Indicator Set",
        vehicle: "Two Wheeler",
        category: "Electrical",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Universal fit for Pulsar, Apache, FZ, Bullet",
        desc: "Waterproof flexible stem orange lens indicators built for Indian road conditions.",
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-10",
        name: "Brake & Clutch Cable Assembly",
        vehicle: "Two Wheeler",
        category: "Brake",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Splendor, Passion, Platina, Pulsar, Shine",
        desc: "Teflon lined smooth inner wire cable preventing friction snapping.",
        image: "https://images.unsplash.com/photo-1600706432502-7788f46ef136?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tw-11",
        name: "All-Terrain Motorcycle Tyre",
        vehicle: "Two Wheeler",
        category: "Tyres",
        price: "Contact Shop",
        availability: "Confirm with Shop",
        compatible: "MRF / CEAT 2.75-18, 3.00-18, 100/90-17",
        desc: "Deep tread pattern tyre delivering max grip on rural, mud and asphalt roads.",
        image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80"
    },

    // --- FOUR WHEELER / CAR PARTS (PARTS ONLY) ---
    {
        id: "fw-1",
        name: "Car Engine Oil Filter Assembly",
        vehicle: "Four Wheeler",
        category: "Filters",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Maruti Swift, Dzire, WagonR, Alto, Hyundai i10, i20, Tata Tiago",
        desc: "OEM specification spin-on oil filter for car engines. (Parts Only - Repair not available).",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "fw-2",
        name: "Heavy Duty Car Air Filter Element",
        vehicle: "Four Wheeler",
        category: "Filters",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Swift Diesel/Petrol, Creta, Brezza, Innova, Bolero",
        desc: "High efficiency pleated paper air filter boosting engine mileage and performance.",
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "fw-3",
        name: "Front Brake Disc Pad Set",
        vehicle: "Four Wheeler",
        category: "Brake",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Maruti Swift, Baleno, Ertiga, Hyundai Verna, Honda City",
        desc: "Low dust noise-free disc brake pads engineered for passenger cars.",
        image: "https://images.unsplash.com/photo-1600706432502-7788f46ef136?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "fw-4",
        name: "Car Clutch Pressure Plate & Assembly",
        vehicle: "Four Wheeler",
        category: "Clutch",
        price: "Contact Shop",
        availability: "Confirm with Shop",
        compatible: "Maruti Alto 800, WagonR, Swift, Mahindra Bolero, Scorpio",
        desc: "Genuine replacement clutch kit ensuring smooth clutch release and longevity.",
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "fw-5",
        name: "Car Battery (Amaron / Exide)",
        vehicle: "Four Wheeler",
        category: "Battery",
        price: "Contact Shop",
        availability: "Confirm with Shop",
        compatible: "35Ah, 45Ah, 65Ah for all Hatchbacks, Sedans & SUVs",
        desc: "High performance automotive battery with quick start technology.",
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "fw-6",
        name: "Car Halogen & LED Headlight Bulb",
        vehicle: "Four Wheeler",
        category: "Electrical",
        price: "Contact Shop",
        availability: "Available",
        compatible: "H4, H7, H11 bulbs for Maruti, Hyundai, Tata, Toyota",
        desc: "Ultra white high beam headlight bulbs for night visibility.",
        image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "fw-7",
        name: "All-Weather Frameless Wiper Blades",
        vehicle: "Four Wheeler",
        category: "Accessories",
        price: "Contact Shop",
        availability: "Available",
        compatible: "14\", 16\", 18\", 20\", 22\", 24\" sizes for all cars",
        desc: "Aerodynamic silicone wiper blades delivering streak-free windshield cleaning.",
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "fw-8",
        name: "Engine Fan & Alternator Belt",
        vehicle: "Four Wheeler",
        category: "Engine",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Bolero, Scorpio, Swift, Tiago, Eeco",
        desc: "High tensile synthetic rubber ribbed V-belts.",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "fw-9",
        name: "Ventilated Front Brake Disc Rotor",
        vehicle: "Four Wheeler",
        category: "Brake",
        price: "Contact Shop",
        availability: "Confirm with Shop",
        compatible: "Swift, Baleno, Creta, EcoSport, Nexon",
        desc: "Cast iron precision machined brake rotor disc.",
        image: "https://images.unsplash.com/photo-1600706432502-7788f46ef136?auto=format&fit=crop&w=400&q=80"
    },

    // --- TRACTOR PARTS ---
    {
        id: "tr-1",
        name: "Heavy Duty Tractor Hydraulic Oil Filter",
        vehicle: "Tractor",
        category: "Filters",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Mahindra 275/575, John Deere 5050D, Swaraj 744, Massey Ferguson, Sonalika",
        desc: "High pressure hydraulic fluid filter protecting hydraulic pumps and lift arms.",
        image: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tr-2",
        name: "Dual Clutch Plate Assembly for Tractor",
        vehicle: "Tractor",
        category: "Clutch",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Mahindra 575 DI, Swaraj 855, John Deere 5310, Eicher 380, Farmtrac",
        desc: "Heavy duty ceramic dual clutch plate engineered for heavy agricultural towing.",
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tr-3",
        name: "Tractor Hydraulic Pump Assembly",
        vehicle: "Tractor",
        category: "Suspension",
        price: "Contact Shop",
        availability: "Confirm with Shop",
        compatible: "Mahindra, Swaraj, Tafe, New Holland, Kubota",
        desc: "High flow gear pump for smooth hydraulic lifting of plows and trolleys.",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tr-4",
        name: "Dry Type Engine Air Filter Cartridge",
        vehicle: "Tractor",
        category: "Filters",
        price: "Contact Shop",
        availability: "Available",
        compatible: "John Deere, Mahindra Arjun, Swaraj 735, Powertrac",
        desc: "Dual stage outer and inner primary air cleaner filter for dusty farm fields.",
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tr-5",
        name: "Heavy Duty Tractor Rear Tyre",
        vehicle: "Tractor",
        category: "Tyres",
        price: "Contact Shop",
        availability: "Confirm with Shop",
        compatible: "Apollo / BKT / MRF 13.6-28, 14.9-28, 16.9-28 sizes",
        desc: "Deep lug agricultural tractor tyre providing max traction in puddle mud fields.",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tr-6",
        name: "Tractor Oil Immersed Brake Disc Kit",
        vehicle: "Tractor",
        category: "Brake",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Mahindra 575/605, Swaraj 744/855, John Deere",
        desc: "Oil immersed multi-disc brake friction plates for heavy load braking safety.",
        image: "https://images.unsplash.com/photo-1600706432502-7788f46ef136?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tr-7",
        name: "High Ampere Heavy Duty Battery",
        vehicle: "Tractor",
        category: "Battery",
        price: "Contact Shop",
        availability: "Available",
        compatible: "88Ah, 100Ah Amaron / Exide for all Tractors",
        desc: "Rugged casing heavy battery built for high compression diesel engines.",
        image: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tr-8",
        name: "Tractor Front Work Lamp / Headlight",
        vehicle: "Tractor",
        category: "Electrical",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Mahindra, Swaraj, Eicher, Massey Ferguson",
        desc: "Heavy metal housing front reflector work lamp for night farming operations.",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80"
    }
];

const STORAGE_KEY = "sai_spare_parts";
const AUTH_KEY = "sai_owner_logged_in";

function getStoredParts() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sparePartsData));
        return sparePartsData;
    }
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    } catch (e) {
        console.error("Error parsing stored parts:", e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sparePartsData));
    return sparePartsData;
}

function saveStoredParts(parts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
}

// --------------------------------------------------------------------------
// 2. BILINGUAL TRANSLATIONS DICTIONARY (ENGLISH & TELUGU)
// --------------------------------------------------------------------------
const translations = {
    en: {
        topAddress: "Wyra Road, Siripuram, Near Mallavaram Stage, Nemali X Road, Madhira",
        topAddressMobile: "Wyra Road, Siripuram, Madhira",
        topHours: "7:30 AM – 8:30 PM",
        topLocationTooltip: "Open shop location in Google Maps",
        tooltipRamBabu: "RamBabu — Proprietor",
        tooltipVeerababu: "Veerababu — Mechanic",
        roleProprietor: "Proprietor",
        roleMechanic: "Mechanic",
        headerRamBabuLabel: "RamBabu",
        headerVeerababuLabel: "Veerababu",
        navHome: "Home",
        navAbout: "About",
        navTeam: "Meet Our Team",
        navServices: "Services",
        navSpareParts: "Spare Parts",
        navRequestPart: "Request Part",
        navContact: "Contact",
        callNow: "Call Now",
        heroTitle: `Your Trusted <span class="text-red">Automobile Service &amp;</span> <br><span class="text-red">Spare Parts Partner</span>`,
        heroSubtitle: "Two Wheeler Repairing • Four Wheeler Spare Parts • Complete Tractor Works",
        btnExploreParts: "Explore Spare Parts",
        btnRequestService: "Request a Service",
        heroLocation: "Nemali X Road, Madhira",
        heroHoursPill: "Open Today • 7:30 AM – 8:30 PM",
        allPartsAvailable: "All Spare Parts Available",
        forAllVehicles: "For Two Wheeler, Four Wheeler & Tractors",
        card1Title: "TWO WHEELER",
        card1Sub: "Repairing & Spare Parts",
        card1Desc: "Complete repair, service and spare parts support.",
        card2Title: "FOUR WHEELER",
        card2Sub: "Spare Parts Available",
        card2Desc: "Spare parts for cars and four wheelers.",
        badgePartsOnly: "PARTS ONLY - NO CAR REPAIRING",
        card3Title: "TRACTOR",
        card3Sub: "Complete Tractor Works",
        card3Desc: "Repairing, service and spare parts.",
        explore: "Explore",
        exploreParts: "Explore Parts",
        searchParts: "Search Parts",
        catalogHeading: "SPARE PARTS CATALOG",
        catalogSubtitle: "Find the part you need and contact us for availability.",
        searchPlaceholder: "Search spare parts...",
        filterAllVehicles: "All Vehicles",
        filterTwoWheeler: "Two Wheeler",
        filterFourWheeler: "Four Wheeler",
        filterTractor: "Tractor",
        filterAllCategories: "All Categories",
        catEngine: "Engine",
        catBrake: "Brake",
        catClutch: "Clutch",
        catElectrical: "Electrical",
        catBattery: "Battery",
        catFilters: "Filters",
        catTyres: "Tyres",
        catSuspension: "Suspension",
        catAccessories: "Accessories",
        catOther: "Other",
        filterAllAvailability: "All Availability",
        statusAvailable: "Available",
        statusConfirm: "Confirm with Shop",
        disclaimerText: "* Availability subject to confirmation at shop",
        noResultsTitle: "Part not found in our online catalog.",
        noResultsDesc: "Please contact us directly. We stock extensive inventory and can source your required part quickly.",
        whatsappUs: "WhatsApp Us",
        cantFindTitle: "Can't find your part?",
        cantFindDesc: "Contact us, we may have it available at our physical shop.",
        reqFormTitle: "REQUEST A SPARE PART / SERVICE",
        reqFormSub: "Fill out the details below and get instant confirmation via WhatsApp or Call.",
        lblYourName: "Your Name *",
        lblMobileNumber: "Mobile Number *",
        lblVehicleType: "Vehicle Type *",
        lblVehicleBrand: "Vehicle Brand",
        lblVehicleModel: "Vehicle Model",
        lblPartName: "Part Name / Service Required *",
        lblQuantity: "Quantity",
        lblNotes: "Additional Requirements / Description",
        btnSendPartRequest: "Send Request via WhatsApp",
        servicesHeading: "OUR SERVICES",
        servicesSub: "Accurate & Reliable Automobile Solutions",
        srv2WRepair: "Two Wheeler Repairing",
        srv2WRepairDesc: "Engine tuning, brake service, clutch repair, and complete general maintenance for all bike models.",
        srv2WParts: "Two Wheeler Spare Parts",
        srv2WPartsDesc: "Genuine OEM and high quality replacement spare parts for all major two-wheeler brands.",
        srv4WParts: "Four Wheeler Spare Parts",
        srv4WPartsDesc: "Full stock of car spare parts, filters, brake pads, electricals & fluids. (Car repairing not available).",
        srvTractorWorks: "Complete Tractor Works",
        srvTractorWorksDesc: "Full tractor mechanical repair, hydraulic system overhauling, clutch, brake & engine servicing.",
        srvTractorParts: "Tractor Spare Parts",
        srvTractorPartsDesc: "Genuine heavy duty tractor spares, hydraulic components, filters, bearings & belts.",
        srvGeneralSpares: "General Automobile Spare Parts",
        srvGeneralSparesDesc: "Automotive lubricants, batteries, bulbs, indicators, bearings, fasteners, and maintenance supplies.",
        tractorTag: "TRACTOR SPECIALIST",
        completeTractorWorksHeading: "COMPLETE TRACTOR WORKS",
        tractorWorksDesc: "Expert technicians providing comprehensive repair, overhauling, servicing & genuine spare parts for all tractor brands.",
        featEngine: "Engine Related Work",
        featClutch: "Clutch & Brake Work",
        featHydraulic: "Hydraulic Work",
        featElectrical: "Electrical Work",
        featSteering: "Steering & Suspension",
        featGeneral: "General Maintenance",
        featTractorSpares: "Tractor Spare Parts",
        btnRequestTractor: "Request Tractor Service",
        carTag: "FOUR WHEELER / CARS",
        carHeading: "FOUR WHEELER SPARE PARTS",
        carDesc: "Spare parts available for cars and four wheelers. Quality guaranteed genuine lubricants, filters, pads & electrical items.",
        carWarningTitle: "PARTS ONLY",
        carWarningSub: "CAR REPAIRING NOT AVAILABLE",
        btnBrowseCarParts: "Browse Car Parts",
        btnRequestPart: "Request a Part",
        aboutHeading: "ABOUT SAI SRINIVASA AUTOMOBILES",
        aboutSub: "Your One-Stop Auto Shop in Madhira",
        aboutP1: "Located conveniently at Nemali X Road, Madhira (Wyra Road, Siripuram, Near Mallavaram Stage), Sai Srinivasa Automobiles is a dedicated provider of automotive services and spare parts. We specialize in comprehensive two-wheeler repairs, complete tractor mechanical overhauls, and supply high quality genuine spare parts for two-wheelers, four-wheelers, and tractors.",
        aboutTeamInfo: "Owned by RamBabu and supported by Veerababu, our mechanic who primarily handles tractor-related mechanical works.",
        aboutP2: "We take pride in transparent service, genuine replacement parts, and quick customer support through phone and WhatsApp.",
        whyChooseTitle: "WHY CHOOSE US",
        why1Title: "Wide Range of Spare Parts",
        why1Desc: "Extensive stock of parts for Two Wheeler, Four Wheeler, and Tractors.",
        why2Title: "Two Wheeler Repairing",
        why2Desc: "Skilled technicians for complete motor bike repair & servicing.",
        why3Title: "Complete Tractor Works",
        why3Desc: "Expert heavy vehicle mechanics for tractor servicing & repairs.",
        why4Title: "Easy Call & WhatsApp Enquiry",
        why4Desc: "Instant stock availability confirmation over phone or chat.",
        teamHeading: "MEET OUR TEAM",
        teamSub: "The dedicated professionals behind Sai Srinivasa Automobiles",
        team1Name: "RamBabu",
        team1Role: "Proprietor / Shop Owner",
        team1Desc: "RamBabu is the proprietor and owner of Sai Srinivasa Automobiles.",
        team2Name: "Veerababu",
        team2Role: "Mechanic / Automobile Technician",
        team2Desc: "Veerababu handles the mechanical works at the shop, with a major focus on complete tractor works.",
        galleryHeading: "WORKSHOP & SPARE PARTS GALLERY",
        gallerySub: "Take a visual tour of our shop, parts inventory and servicing works.",
        galAll: "All",
        galShop: "Shop",
        galSpareParts: "Spare Parts",
        galTwoWheeler: "Two Wheeler",
        galTractor: "Tractor",
        galItem1: "Shop Front & Counter",
        galItem2: "Genuine Spare Parts Inventory",
        galItem3: "Two Wheeler Maintenance",
        galItem4: "Tractor Overhauling Work",
        galItem5: "Automotive Oils & Filters",
        galItem6: "Tractor Hydraulic Service",
        faqHeading: "FREQUENTLY ASKED QUESTIONS",
        faqSub: "Find quick answers to common questions about our services and parts.",
        faqQ1: "Do you provide car repairing?",
        faqA1: "No. We provide four wheeler/car spare parts, but car repairing and servicing are not available.",
        faqQ2: "Do you repair two wheelers?",
        faqA2: "Yes, two wheeler repairing and servicing are available.",
        faqQ3: "Do you repair tractors?",
        faqA3: "Yes. Complete tractor works are available.",
        faqQ4: "Can I request a spare part through WhatsApp?",
        faqA4: "Yes. Send us the part details through WhatsApp and contact the shop for availability.",
        cntPhoneHeading: "SHOP PHONE NUMBERS",
        cntWaHeading: "WHATSAPP ENQUIRIES",
        cntAddress: "Shop Location (Click for Google Maps)",
        cntHours: "Shop Hours",
        getDirections: "Get Directions",
        openInGoogleMaps: "Open Directions in Google Maps",
        footerDesc: "Your trusted destination for Two Wheeler Repairing, Four Wheeler Spare Parts, and Complete Tractor Works in Madhira.",
        footerServices: "Our Offerings",
        footerQuickLinks: "Quick Links",
        footerContactInfo: "Contact Info",
        footFeat1: "Wide Range of Spare Parts",
        footFeat2: "Quality & Genuine Parts",
        footFeat3: "Experienced Technicians",
        footFeat4: "Easy Call & WhatsApp Support",
        modalCompatible: "Compatible Models:",
        modalDesc: "Description:",
        modalPrice: "Price:",
        modalStatus: "Availability:",
        btnRequestThisPart: "Request This Part",
        btnExploreMoreParts: "Explore More Parts",
        allPartsHeading: "ALL SPARE PARTS CATALOG",
        allPartsSubtitle: "Search our complete inventory, filter by vehicle or category, and contact us for instant availability.",
        ownerLoginBtn: "Owner Login",
        ownerDashboardBtn: "Owner Dashboard",
        ownerLogoutBtn: "Logout",
        loginModalTitle: "Owner Login",
        loginModalSubtitle: "Enter credentials to manage spare parts inventory.",
        lblUsername: "Username",
        lblPassword: "Password",
        btnLogin: "Login",
        loginErrorMsg: "Invalid username or password. Please try again.",
        dashboardTitle: "Owner / Admin Dashboard",
        dashboardSubtitle: "Add new spare parts, edit details, or remove inventory.",
        tabAddPart: "Add Spare Part",
        tabManageParts: "Manage Inventory",
        formAddHeading: "Add New Spare Part",
        formEditHeading: "Edit Spare Part",
        lblPartNameForm: "Part Name *",
        lblVehicleTypeForm: "Vehicle Type *",
        lblCategoryForm: "Category *",
        lblCompatibleForm: "Compatible Models *",
        lblDescForm: "Description",
        lblPriceForm: "Price",
        lblAvailabilityForm: "Availability",
        lblDragDrop: "Drag & Drop Part Image Here",
        lblChooseImage: "Choose Image",
        btnSavePart: "Save Spare Part",
        btnCancelEdit: "Cancel",
        thPart: "Part",
        thVehicle: "Vehicle",
        thCategory: "Category",
        thPrice: "Price",
        thAvailability: "Availability",
        thActions: "Actions",
        btnEdit: "Edit",
        btnDelete: "Delete",
        confirmDelete: "Are you sure you want to delete this spare part?",
        backToHome: "Back to Home",
        adminSearchPlaceholder: "Search parts in dashboard..."
    },
    te: {
        topAddress: "వైరా రోడ్, సిరిపురం, మల్లావరం స్టేజ్ దగ్గర, నెమలి X రోడ్, మధిర",
        topAddressMobile: "వైరా రోడ్, సిరిపురం, మధిర",
        topHours: "ఉదయం 7:30 – రాత్రి 8:30",
        topLocationTooltip: "గూగుల్ మ్యాప్స్‌లో షాప్ చిరునామా తెరవండి",
        tooltipRamBabu: "రాంబాబు — యజమాని / ప్రొప్రైటర్",
        tooltipVeerababu: "వీరబాబు — మెకానిక్",
        roleProprietor: "యజమాని / ప్రొప్రైటర్",
        roleMechanic: "మెకానిక్",
        headerRamBabuLabel: "రాంబాబు",
        headerVeerababuLabel: "వీరబాబు",
        navHome: "హోమ్",
        navAbout: "మా గురించి",
        navTeam: "మా టీమ్",
        navServices: "సేవలు",
        navSpareParts: "స్పేర్ పార్ట్స్",
        navRequestPart: "విడిభాగం కోసం అభ్యర్థించండి",
        navContact: "సంప్రదించండి",
        callNow: "ఇప్పుడే కాల్ చేయండి",
        heroTitle: `మీ నమ్మకమైన <span class="text-red">ఆటోమొబైల్ సర్వీస్ &amp;</span> <br><span class="text-red">స్పేర్ పార్ట్స్ భాగస్వామి</span>`,
        heroSubtitle: "రెండు చక్రాల వాహనాల రిపేరింగ్ • నాలుగు చక్రాల వాహనాల స్పేర్ పార్ట్స్ • పూర్తి ట్రాక్టర్ పనులు",
        btnExploreParts: "స్పేర్ పార్ట్స్ చూడండి",
        btnRequestService: "సర్వీస్ అడగండి",
        heroLocation: "నెమలి X రోడ్, మధిర",
        heroHoursPill: "ఈరోజు తెరిచి ఉంది • 7:30 AM – 8:30 PM",
        allPartsAvailable: "అన్ని రకాల స్పేర్ పార్ట్స్ అందుబాటులో ఉన్నాయి",
        forAllVehicles: "రెండు చక్రాలు, నాలుగు చక్రాలు & ట్రాక్టర్ల కొరకు",
        card1Title: "రెండు చక్రాల వాహనాలు",
        card1Sub: "రిపేరింగ్ & స్పేర్ పార్ట్స్",
        card1Desc: "సంపూర్ణ బైక్ రిపేరింగ్, సర్వీసింగ్ మరియు స్పేర్ పార్ట్స్ లభించును.",
        card2Title: "నాలుగు చక్రాల వాహనాలు",
        card2Sub: "స్పేర్ పార్ట్స్ అందుబాటులో ఉన్నాయి",
        card2Desc: "కార్లు మరియు ఫోర్ వీలర్ల జెన్యూన్ స్పేర్ పార్ట్స్ లభించును.",
        badgePartsOnly: "స్పేర్ పార్ట్స్ మాత్రమే - కార్ రిపేరింగ్ లేదు",
        card3Title: "ట్రాక్టర్",
        card3Sub: "పూర్తి ట్రాక్టర్ పనులు",
        card3Desc: "ట్రాక్టర్ పూర్తి మెకానికల్ రిపేరింగ్, సర్వీసింగ్ మరియు స్పేర్ పార్ట్స్.",
        explore: "చూడండి",
        exploreParts: "పార్ట్స్ చూడండి",
        searchParts: "పార్ట్స్ వెతకండి",
        catalogHeading: "స్పేర్ పార్ట్స్ క్యాటలాగ్",
        catalogSubtitle: "మీకు కావలసిన పార్ట్ వెతకండి మరియు వివరాల కోసం షాప్ లో సంప్రదించండి.",
        searchPlaceholder: "స్పేర్ పార్ట్స్ వెతకండి...",
        filterAllVehicles: "అన్ని వాహనాలు",
        filterTwoWheeler: "రెండు చక్రాల వాహనాలు",
        filterFourWheeler: "నాలుగు చక్రాల వాహనాలు",
        filterTractor: "ట్రాక్టర్",
        filterAllCategories: "అన్ని వర్గాలు",
        catEngine: "ఇంజిన్",
        catBrake: "బ్రేక్",
        catClutch: "క్లచ్",
        catElectrical: "ఎలక్ట్రికల్",
        catBattery: "బ్యాటరీ",
        catFilters: "ఫిల్టర్లు",
        catTyres: "టైర్లు",
        catSuspension: "సస్పెన్షన్",
        catAccessories: "యాక్సెసరీస్",
        catOther: "ఇతర",
        filterAllAvailability: "అన్ని రకాలు",
        statusAvailable: "అందుబాటులో ఉంది",
        statusConfirm: "షాప్ లో విచారించండి",
        disclaimerText: "* స్టాక్ లభ్యత షాప్ వద్ద నిర్ధారణకు లోబడి ఉంటుంది",
        noResultsTitle: "మా ఆన్‌లైన్ క్యాటలాగ్‌లో పార్ట్ దొరకలేదు.",
        noResultsDesc: "దయచేసి నేరుగా మమ్మల్ని సంప్రదించండి. మా వద్ద పెద్ద స్టాక్ ఉంది మరియు మీ పార్ట్ త్వరగా తెప్పించగలము.",
        whatsappUs: "వాట్సాప్ చేయండి",
        cantFindTitle: "మీకు కావలసిన పార్ట్ దొరకలేదా?",
        cantFindDesc: "మమ్మల్ని సంప్రదించండి, మా షాప్‌లో అందుబాటులో ఉండవచ్చు.",
        reqFormTitle: "స్పేర్ పార్ట్ / సర్వీస్ కోసం అడగండి",
        reqFormSub: "క్రింది వివరాలు నింపండి, వాట్సాప్ లేదా కాల్ ద్వారా వెంటనే సమాచారం పొందండి.",
        lblYourName: "మీ పేరు *",
        lblMobileNumber: "మొబైల్ నెంబర్ *",
        lblVehicleType: "వాహనం రకం *",
        lblVehicleBrand: "వాహనం బ్రాండ్",
        lblVehicleModel: "వాహనం మోడల్",
        lblPartName: "కావలసిన పార్ట్ / సర్వీస్ పేరు *",
        lblQuantity: "పరిమాణం (Quantity)",
        lblNotes: "ఇతర వివరాలు",
        btnSendPartRequest: "వాట్సాప్ ద్వారా అడగండి",
        servicesHeading: "మా సేవలు",
        servicesSub: "ఖచ్చితమైన & నమ్మకమైన ఆటోమొబైల్ పరిష్కారాలు",
        srv2WRepair: "రెండు చక్రాల వాహనాల రిపేరింగ్",
        srv2WRepairDesc: "అన్ని రకాల బైక్‌లకు ఇంజిన్ వర్క్, బ్రేక్ వర్క్, క్లచ్ వర్క్ మరియు జనరల్ సర్వీస్.",
        srv2WParts: "రెండు చక్రాల స్పేర్ పార్ట్స్",
        srv2WPartsDesc: "ప్రధాన బైక్ బ్రాండ్‌లకు జెన్యూన్ స్పేర్ పార్ట్స్.",
        srv4WParts: "నాలుగు చక్రాల స్పేర్ పార్ట్స్",
        srv4WPartsDesc: "కార్లకు కావలసిన జెన్యూన్ స్పేర్ పార్ట్స్, ఫిల్టర్లు, ఆయిల్స్ లభించును. (కార్ రిపేరింగ్ చేయబడదు).",
        srvTractorWorks: "పూర్తి ట్రాక్టర్ పనులు",
        srvTractorWorksDesc: "ట్రాక్టర్ల ఇంజిన్ వర్క్, హైడ్రాలిక్ సిస్టమ్ వర్క్, క్లచ్, బ్రేక్ మరియు సంపూర్ణ సర్వీస్.",
        srvTractorParts: "ట్రాక్టర్ స్పేర్ పార్ట్స్",
        srvTractorPartsDesc: "ట్రాక్టర్లకు కావలసిన హెవీ డ్యూటీ స్పేర్ పార్ట్స్, హైడ్రాలిక్ భాగాలు, ఫిల్టర్లు లభించును.",
        srvGeneralSpares: "జనరల్ ఆటోమొబైల్ స్పేర్ పార్ట్స్",
        srvGeneralSparesDesc: "ఆటోమోటివ్ లూబ్రికెంట్స్, ఆయిల్స్, బ్యాటరీలు, లైట్లు, బేరింగ్‌లు మరియు మెయింటెనెన్స్ సామాగ్రి.",
        tractorTag: "ట్రాక్టర్ స్పెషలిస్ట్",
        completeTractorWorksHeading: "పూర్తి ట్రాక్టర్ పనులు",
        tractorWorksDesc: "అన్ని రకాల ట్రాక్టర్లకు నిపుణులైన మెకానిక్‌ల ద్వారా పూర్తి రిపేరింగ్, సర్వీసింగ్ మరియు జెన్యూన్ స్పేర్ పార్ట్స్.",
        featEngine: "ఇంజిన్ సంబంధిత పనులు",
        featClutch: "క్లచ్ & బ్రేక్ పనులు",
        featHydraulic: "హైడ్రాలిక్ వర్క్",
        featElectrical: "ఎలక్ట్రికల్ పనులు",
        featSteering: "స్టీరింగ్ & సస్పెన్షన్",
        featGeneral: "జనరల్ మెయింటెనెన్స్",
        featTractorSpares: "ట్రాక్టర్ స్పేర్ పార్ట్స్",
        btnRequestTractor: "ట్రాక్టర్ సర్వీస్ అడగండి",
        carTag: "నాలుగు చక్రాల వాహనాలు",
        carHeading: "నాలుగు చక్రాల స్పేర్ పార్ట్స్",
        carDesc: "కార్లకు కావలసిన క్వాలిటీ స్పేర్ పార్ట్స్, లూబ్రికెంట్స్, ఫిల్టర్లు, బ్రేక్ పాడ్లు లభించును.",
        carWarningTitle: "స్పేర్ పార్ట్స్ మాత్రమే లభించును",
        carWarningSub: "కార్ రిపేరింగ్ సేవలు అందుబాటులో లేవు",
        btnBrowseCarParts: "కార్ పార్ట్స్ చూడండి",
        btnRequestPart: "పార్ట్ కోసం అడగండి",
        aboutHeading: "సాయి శ్రీనివాస ఆటోమొబైల్స్ గురించి",
        aboutSub: "మధిరలో మీ నమ్మకమైన ఆటోమొబైల్ షాప్",
        aboutP1: "మధిరలోని నెమలి X రోడ్ (వైరా రోడ్, సిరిపురం, మల్లావరం స్టేజ్ దగ్గర) లో ఉన్న సాయి శ్రీనివాస ఆటోమొబైల్స్ రెండు చక్రాల వాహనాల రిపేరింగ్, పూర్తి ట్రాక్టర్ పనులకు మరియు జెన్యూన్ స్పేర్ పార్ట్స్‌కు పేరుగాంచింది.",
        aboutTeamInfo: "రాంబాబు గారి (యజమాని / ప్రొప్రైటర్) యాజమాన్యంలో, ట్రాక్టర్ వర్క్స్ నిర్వహించే నిపుణుడైన మెకానిక్ వీరబాబు గారి సహకారంతో షాప్ నిర్వహించబడుతోంది.",
        aboutP2: "మేము నాణ్యమైన పార్ట్స్ మరియు ఫోన్/వాట్సాప్ ద్వారా వేగవంతమైన కస్టమర్ సేవలను అందిస్తున్నాము.",
        whyChooseTitle: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",
        why1Title: "విస్తృత శ్రేణి స్పేర్ పార్ట్స్",
        why1Desc: "రెండు చక్రాలు, నాలుగు చక్రాలు మరియు ట్రాక్టర్లకు భారీ స్పేర్ పార్ట్స్ నిల్వ.",
        why2Title: "రెండు చక్రాల వాహనాల రిపేరింగ్",
        why2Desc: "బైక్ రిపేరింగ్ మరియు సర్వీసింగ్ చేయు అనుభవజ్ఞులైన మెకానిక్‌లు.",
        why3Title: "పూర్తి ట్రాక్టర్ పనులు",
        why3Desc: "ట్రాక్టర్ వర్క్స్ మరియు హైడ్రాలిక్ వర్క్స్ చేయు నిపుణులు.",
        why4Title: "సులభమైన కాల్ & వాట్సాప్ విచారణ",
        why4Desc: "ఫోన్ లేదా వాట్సాప్ ద్వారా వెంటనే స్టాక్ సమాచారం.",
        teamHeading: "మా టీమ్",
        teamSub: "సాయి శ్రీనివాస ఆటోమొబైల్స్ నిర్వాహకులు",
        team1Name: "రాంబాబు",
        team1Role: "యజమాని / ప్రొప్రైటర్",
        team1Desc: "రాంబాబు గారు సాయి శ్రీనివాస ఆటోమొబైల్స్ ప్రొప్రైటర్ మరియు యజమాని.",
        team2Name: "వీరబాబు",
        team2Role: "మెకానిక్ / ఆటోమొబైల్ టెక్నీషియన్",
        team2Desc: "వీరబాబు గారు షాప్లో మెకానికల్ పనులను నిర్వహిస్తారు. ముఖ్యంగా పూర్తి ట్రాక్టర్ పనుల్లో ప్రధానంగా పనిచేస్తారు.",
        galleryHeading: "వర్క్‌షాప్ & స్పేర్ పార్ట్స్ గ్యాలరీ",
        gallerySub: "మా షాప్ మరియు స్పేర్ పార్ట్స్ ఫోటోలు చూడండి.",
        galAll: "అన్నీ",
        galShop: "షాప్",
        galSpareParts: "స్పేర్ పార్ట్స్",
        galTwoWheeler: "రెండు చక్రాల వాహనాలు",
        galTractor: "ట్రాక్టర్",
        galItem1: "షాప్ ముఖద్వారం",
        galItem2: "స్పేర్ పార్ట్స్ నిల్వ",
        galItem3: "బైక్ సర్వీసింగ్",
        galItem4: "ట్రాక్టర్ రిపేరింగ్ వర్క్",
        galItem5: "ఆటోమోటివ్ ఆయిల్స్ & ఫిల్టర్లు",
        galItem6: "ట్రాక్టర్ హైడ్రాలిక్ సర్వీస్",
        faqHeading: "తరచుగా అడిగే ప్రశ్నలు (FAQ)",
        faqSub: "మా సేవలు మరియు పార్ట్స్‌పై సాధారణ ప్రశ్నలకు సమాధానాలు.",
        faqQ1: "మీరు కార్ రిపేరింగ్ చేస్తారా?",
        faqA1: "లేదు. మేము నాలుగు చక్రాల వాహనాల స్పేర్ పార్ట్స్ మాత్రమే అందిస్తాము, కార్ రిపేరింగ్ మరియు సర్వీసింగ్ అందుబాటులో లేవు.",
        faqQ2: "మీరు బైక్స్ / టూ వీలర్స్ రిపేర్ చేస్తారా?",
        faqA2: "అవును, రెండు చక్రాల వాహనాల రిపేరింగ్ మరియు సర్వీసింగ్ అందుబాటులో ఉన్నాయి.",
        faqQ3: "మీరు ట్రాక్టర్లు రిపేర్ చేస్తారా?",
        faqA3: "అవును. పూర్తి ట్రాక్టర్ పనులు అందుబాటులో ఉన్నాయి.",
        faqQ4: "వాట్సాప్ ద్వారా స్పేర్ పార్ట్ విచారించవచ్చా?",
        faqA4: "అవును. పార్ట్ వివరాలు వాట్సాప్ చేసి షాప్ వద్ద లభ్యత తెలుసుకోవచ్చు.",
        cntPhoneHeading: "షాప్ ఫోన్ నెంబర్లు",
        cntWaHeading: "వాట్సాప్ సంప్రదింపులు",
        cntAddress: "షాప్ చిరునామా (గూగుల్ మ్యాప్స్ కొరకు క్లిక్ చేయండి)",
        cntHours: "షాప్ సమయం",
        getDirections: "రూట్ మ్యాప్ చూడండి",
        openInGoogleMaps: "గూగుల్ మ్యాప్స్‌లో తెరవండి",
        footerDesc: "మధిరలో రెండు చక్రాల వాహనాల రిపేరింగ్, నాలుగు చక్రాల వాహనాల స్పేర్ పార్ట్స్, మరియు పూర్తి ట్రాక్టర్ పనుల కొరకు మీ నమ్మకమైన షాప్.",
        footerServices: "మా ఆఫరింగ్స్",
        footerQuickLinks: "ముఖ్యమైన లింకులు",
        footerContactInfo: "చిరునామా వివరాలు",
        footFeat1: "విస్తృత శ్రేణి స్పేర్ పార్ట్స్",
        footFeat2: "క్వాలిటీ & జెన్యూన్ పార్ట్స్",
        footFeat3: "అనుభవజ్ఞులైన మెకానిక్స్",
        footFeat4: "సులభమైన కాల్ & వాట్సాప్ సపోర్ట్",
        modalCompatible: "సరిపోయే మోడల్స్:",
        modalDesc: "వివరాలు:",
        modalPrice: "ధర:",
        modalStatus: "లభ్యత:",
        btnRequestThisPart: "ఈ పార్ట్ కోసం అడగండి",
        btnExploreMoreParts: "మరిన్ని స్పేర్ పార్ట్స్ చూడండి",
        allPartsHeading: "అన్ని స్పేర్ పార్ట్స్ క్యాటలాగ్",
        allPartsSubtitle: "మా పూర్తి స్పేర్ పార్ట్స్ నిల్వను వెతకండి, వాహనం లేదా కేటగిరీ ద్వారా ఫిల్టర్ చేయండి.",
        ownerLoginBtn: "యజమాని లాగిన్",
        ownerDashboardBtn: "యజమాని డాష్‌బోర్డ్",
        ownerLogoutBtn: "లాగౌట్",
        loginModalTitle: "యజమాని లాగిన్",
        loginModalSubtitle: "స్పేర్ పార్ట్స్ ఇన్వెంటరీ నిర్వహణ కోసం వివరాలు నమోదు చేయండి.",
        lblUsername: "యూజర్ పేరు",
        lblPassword: "పాస్‌వర్డ్",
        btnLogin: "లాగిన్",
        loginErrorMsg: "తప్పుడు యూజర్ పేరు లేదా పాస్‌వర్డ్. దయచేసి మళ్ళీ ప్రయత్నించండి.",
        dashboardTitle: "యజమాని / అడ్మిన్ డాష్‌బోర్డ్",
        dashboardSubtitle: "కొత్త స్పేర్ పార్ట్స్ జోడించండి, వివరాలు సవరించండి లేదా తొలగించండి.",
        tabAddPart: "స్పేర్ పార్ట్ జోడించండి",
        tabManageParts: "స్టాక్ నిర్వహణ",
        formAddHeading: "కొత్త స్పేర్ పార్ట్ జోడించండి",
        formEditHeading: "స్పేర్ పార్ట్ వివరాలు సవరించండి",
        lblPartNameForm: "స్పేర్ పార్ట్ పేరు *",
        lblVehicleTypeForm: "వాహనం రకం *",
        lblCategoryForm: "కేటగిరీ *",
        lblCompatibleForm: "సరిపోయే మోడల్స్ *",
        lblDescForm: "వివరణ",
        lblPriceForm: "ధర",
        lblAvailabilityForm: "లభ్యత",
        lblDragDrop: "ఇక్కడ ఫోటోను డ్రాగ్ & డ్రాప్ చేయండి",
        lblChooseImage: "ఫోటో ఎంచుకోండి",
        btnSavePart: "స్పేర్ పార్ట్ సేవ్ చేయండి",
        btnCancelEdit: "రద్దు చేయండి",
        thPart: "స్పేర్ పార్ట్",
        thVehicle: "వాహనం",
        thCategory: "కేటగిరీ",
        thPrice: "ధర",
        thAvailability: "లభ్యత",
        thActions: "చర్యలు",
        btnEdit: "మార్చండి",
        btnDelete: "తొలగించండి",
        confirmDelete: "మీరు ఖచ్చితంగా ఈ స్పేర్ పార్ట్‌ను తొలగించాలనుకుంటున్నారా?",
        backToHome: "హోమ్",
        adminSearchPlaceholder: "డాష్‌బోర్డ్‌లో వెతకండి..."
    }
};

let currentLang = "en";
let activeModalPart = null;

// --------------------------------------------------------------------------
// 3. INITIALIZATION & EVENT LISTENERS
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("sai_lang");
    if (savedLang && (savedLang === "en" || savedLang === "te")) {
        currentLang = savedLang;
    }
    
    // Check URL parameters for initial filters (e.g. ?vehicle=Two+Wheeler)
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleParam = urlParams.get("vehicle");
    const searchParam = urlParams.get("search");
    const selectVehicle = document.getElementById("vehicleFilter");
    const searchInput = document.getElementById("searchInput");
    if (vehicleParam && selectVehicle) {
        selectVehicle.value = vehicleParam;
    }
    if (searchParam && searchInput) {
        searchInput.value = searchParam;
    }

    updateLanguageToggleUI();
    applyTranslations();
    updateLiveShopStatus();
    applyFilters();
    updateOwnerAuthState();
    setupDragAndDrop();
    
    // Update live status every 30 seconds
    setInterval(updateLiveShopStatus, 30000);
    
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mainNav = document.getElementById("mainNav");
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            mainNav.classList.toggle("open");
        });
    }

    document.addEventListener("click", (e) => {
        if (mainNav && mainNav.classList.contains("open")) {
            if (!mainNav.contains(e.target) && e.target !== hamburgerBtn) {
                mainNav.classList.remove("open");
            }
        }
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            if (mainNav && mainNav.classList.contains("open")) {
                mainNav.classList.remove("open");
            }
        });
    });

    window.addEventListener("scroll", () => {
        const topBtn = document.getElementById("backToTopBtn");
        if (topBtn) {
            if (window.scrollY > 400) {
                topBtn.style.display = "flex";
            } else {
                topBtn.style.display = "none";
            }
        }
        highlightActiveNavLink();
    });
});

// --------------------------------------------------------------------------
// 4. DYNAMIC SHOP LIVE OPEN / CLOSED STATUS
// --------------------------------------------------------------------------
function updateLiveShopStatus() {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const openMins = 7 * 60 + 30;   // 7:30 AM = 450
    const closeMins = 20 * 60 + 30; // 8:30 PM = 1230

    const isOpen = (currentMins >= openMins && currentMins < closeMins);

    const heroLiveStatusPill = document.getElementById("heroLiveStatusPill");
    const liveStatusText = document.getElementById("liveStatusText");
    const topHoursText = document.getElementById("topHoursText");

    if (isOpen) {
        if (heroLiveStatusPill) heroLiveStatusPill.className = "info-pill status-live-pill status-open";
        if (liveStatusText) {
            liveStatusText.innerHTML = currentLang === "te" 
                ? `<span class="pulse-dot green-dot"></span> ప్రస్తుతం తెరిచి ఉంది • 7:30 AM – 8:30 PM` 
                : `<span class="pulse-dot green-dot"></span> Open Now • 7:30 AM – 8:30 PM`;
        }
        if (topHoursText) {
            topHoursText.innerHTML = currentLang === "te"
                ? `7:30 AM – 8:30 PM (తెరిచి ఉంది)`
                : `7:30 AM – 8:30 PM (Open Now)`;
        }
    } else {
        if (heroLiveStatusPill) heroLiveStatusPill.className = "info-pill status-live-pill status-closed";
        if (liveStatusText) {
            liveStatusText.innerHTML = currentLang === "te" 
                ? `<span class="pulse-dot red-dot"></span> ప్రస్తుతం మూసివేయబడింది • ఉదయం 7:30 కి తెరుస్తుంది` 
                : `<span class="pulse-dot red-dot"></span> Closed Now • Opens at 7:30 AM`;
        }
        if (topHoursText) {
            topHoursText.innerHTML = currentLang === "te"
                ? `7:30 AM – 8:30 PM (మూసివేయబడింది)`
                : `7:30 AM – 8:30 PM (Closed Now)`;
        }
    }
}

// --------------------------------------------------------------------------
// 5. BILINGUAL LANGUAGE SYSTEM
// --------------------------------------------------------------------------
function switchLanguage(lang) {
    if (lang !== "en" && lang !== "te") return;
    currentLang = lang;
    localStorage.setItem("sai_lang", lang);
    updateLanguageToggleUI();
    applyTranslations();
    updateLiveShopStatus();
    applyFilters();
    if (typeof renderAdminPartsTable === "function") {
        renderAdminPartsTable();
    }
}

function updateLanguageToggleUI() {
    document.querySelectorAll(".lang-en-btn").forEach(btn => {
        if (currentLang === "en") btn.classList.add("active");
        else btn.classList.remove("active");
    });
    document.querySelectorAll(".lang-te-btn").forEach(btn => {
        if (currentLang === "te") btn.classList.add("active");
        else btn.classList.remove("active");
    });
}

function applyTranslations() {
    const langDict = translations[currentLang];
    if (!langDict) return;

    document.body.classList.toggle("lang-te", currentLang === "te");

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (langDict[key]) {
            el.innerHTML = langDict[key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (langDict[key]) {
            el.setAttribute("placeholder", langDict[key]);
        }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (langDict[key]) {
            el.setAttribute("title", langDict[key]);
        }
    });
}

// --------------------------------------------------------------------------
// 6. CATALOG RENDERING & FILTERING
// --------------------------------------------------------------------------
function renderCatalogGrid(partsList) {
    const grid = document.getElementById("productsGrid");
    const countEl = document.getElementById("resultsCount");
    const noResults = document.getElementById("noResultsCard");
    const exploreContainer = document.getElementById("exploreMoreContainer");
    
    if (!grid) return;
    grid.innerHTML = "";

    const isHomepage = document.body.classList.contains("page-home") || exploreContainer !== null;
    const itemsToDisplay = isHomepage ? partsList.slice(0, 11) : partsList;

    if (countEl) {
        countEl.textContent = `${currentLang === 'te' ? 'లభించిన విడిభాగాలు:' : 'Showing'} ${itemsToDisplay.length} ${currentLang === 'te' ? '' : 'parts'}`;
    }

    if (itemsToDisplay.length === 0) {
        grid.classList.add("hidden");
        if (noResults) noResults.classList.remove("hidden");
        if (exploreContainer) exploreContainer.style.display = "none";
        return;
    }

    grid.classList.remove("hidden");
    if (noResults) noResults.classList.add("hidden");
    if (exploreContainer) exploreContainer.style.display = "block";

    itemsToDisplay.forEach(item => {
        const card = document.createElement("div");
        card.className = "part-card";

        let tagClass = "tag-blue";
        let vehicleTagText = item.vehicle;

        if (item.vehicle === "Four Wheeler") {
            tagClass = "tag-red";
            if (currentLang === "te") vehicleTagText = "ఫోర్ వీలర్";
        } else if (item.vehicle === "Tractor") {
            tagClass = "tag-green";
            if (currentLang === "te") vehicleTagText = "ట్రాక్టర్";
        } else if (item.vehicle === "Two Wheeler") {
            if (currentLang === "te") vehicleTagText = "టూ వీలర్";
        }

        const statusClass = item.availability === "Available" ? "badge-available" : "badge-confirm";
        const statusText = item.availability === "Available" 
            ? (currentLang === "te" ? "అందుబాటులో ఉంది" : "Available") 
            : (currentLang === "te" ? "షాప్ లో విచారించండి" : "Confirm with Shop");

        const priceDisplay = item.price && item.price !== "Contact Shop" 
            ? item.price 
            : (currentLang === "te" ? "షాప్ ను సంప్రదించండి" : "Contact Shop");

        card.innerHTML = `
            <div class="part-card-img-wrap">
                <span class="part-tag ${tagClass}">${vehicleTagText}</span>
                <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src=getVehicleSVG('${item.vehicle.toLowerCase().includes('tractor') ? 'tractor' : (item.vehicle.toLowerCase().includes('four') ? 'car' : 'bike')}');">
            </div>
            <div>
                <h4 class="part-name">${item.name}</h4>
                <div class="part-price-row">
                    ${currentLang === "te" ? "ధర:" : "Price:"} <strong>${priceDisplay}</strong>
                </div>
                <div class="part-status-row">
                    <span class="${statusClass}">${statusText}</span>
                </div>
            </div>
            <div class="part-card-actions">
                <button class="btn-card-details" onclick="openPartModal('${item.id}')">${currentLang === "te" ? "వివరాలు" : "View Details"}</button>
                <button class="btn-card-request" onclick="prefillFormForPart('${item.name.replace(/'/g, "\\'")}', '${item.vehicle}')">${currentLang === "te" ? "అడగండి" : "Request Part"}</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

function applyFilters() {
    const searchInput = document.getElementById("searchInput");
    const vehicleFilter = document.getElementById("vehicleFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const availabilityFilter = document.getElementById("availabilityFilter");

    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const vehicleVal = vehicleFilter ? vehicleFilter.value : "All";
    const categoryVal = categoryFilter ? categoryFilter.value : "All";
    const availabilityVal = availabilityFilter ? availabilityFilter.value : "All";

    const allParts = getStoredParts();

    const filtered = allParts.filter(item => {
        const matchesSearch = !searchVal || 
            (item.name && item.name.toLowerCase().includes(searchVal)) ||
            (item.vehicle && item.vehicle.toLowerCase().includes(searchVal)) ||
            (item.category && item.category.toLowerCase().includes(searchVal)) ||
            (item.compatible && item.compatible.toLowerCase().includes(searchVal)) ||
            (item.desc && item.desc.toLowerCase().includes(searchVal));

        const matchesVehicle = (vehicleVal === "All" || item.vehicle === vehicleVal);
        const matchesCategory = (categoryVal === "All" || item.category === categoryVal);
        const matchesAvailability = (availabilityVal === "All" || item.availability === availabilityVal);

        return matchesSearch && matchesVehicle && matchesCategory && matchesAvailability;
    });

    renderCatalogGrid(filtered);
}

function handleSearchInput() {
    applyFilters();
}

function executeSearch() {
    applyFilters();
}

function filterByVehicle(vehicleType) {
    const select = document.getElementById("vehicleFilter");
    if (select) {
        select.value = vehicleType;
        applyFilters();
    }
}

// --------------------------------------------------------------------------
// 7. MODAL HANDLERS
// --------------------------------------------------------------------------
function openPartModal(partId) {
    const parts = getStoredParts();
    const part = parts.find(p => String(p.id) === String(partId));
    if (!part) return;

    activeModalPart = part;
    const modal = document.getElementById("partModal");
    if (!modal) return;
    
    const modalImg = document.getElementById("modalPartImg");
    if (modalImg) modalImg.src = part.image;
    const modalTitle = document.getElementById("modalPartTitle");
    if (modalTitle) modalTitle.textContent = part.name;
    const modalVeh = document.getElementById("modalVehicleBadge");
    if (modalVeh) modalVeh.textContent = part.vehicle;
    const modalCat = document.getElementById("modalCategoryBadge");
    if (modalCat) modalCat.textContent = part.category;
    const modalComp = document.getElementById("modalCompatibleText");
    if (modalComp) modalComp.textContent = part.compatible || "All standard models";
    const modalDesc = document.getElementById("modalDescText");
    if (modalDesc) modalDesc.textContent = part.desc || "";
    
    const statusBadge = document.getElementById("modalAvailabilityBadge");
    if (statusBadge) {
        statusBadge.className = part.availability === "Available" ? "badge-available" : "badge-confirm";
        statusBadge.textContent = part.availability === "Available" 
            ? (currentLang === "te" ? "అందుబాటులో ఉంది" : "Available")
            : (currentLang === "te" ? "షాప్ లో విచారించండి" : "Confirm with Shop");
    }

    const priceValEl = modal.querySelector(".price-val");
    if (priceValEl) {
        priceValEl.textContent = part.price && part.price !== "Contact Shop" 
            ? part.price 
            : (currentLang === "te" ? "షాప్ ను సంప్రదించండి" : "Contact Shop");
    }

    const waText = encodeURIComponent(`Hello Sai Srinivasa Automobiles,\nI would like to enquire about spare part: ${part.name} (${part.vehicle}). Please confirm availability.`);
    const modalWaBtn = document.getElementById("modalWaBtn");
    if (modalWaBtn) modalWaBtn.href = `https://wa.me/918790460012?text=${waText}`;

    modal.classList.remove("hidden");
}

function closePartModal() {
    const modal = document.getElementById("partModal");
    if (modal) modal.classList.add("hidden");
}

function requestFromModal() {
    if (!activeModalPart) return;
    closePartModal();
    prefillFormForPart(activeModalPart.name, activeModalPart.vehicle);
}

function prefillFormForPart(partName, vehicleType) {
    const section = document.getElementById("request-part");
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        const partInput = document.getElementById("reqPartName");
        const vehicleSelect = document.getElementById("reqVehicleType");

        if (partInput) partInput.value = partName;
        if (vehicleSelect && vehicleType) {
            if (vehicleType.includes("Two")) vehicleSelect.value = "Two Wheeler";
            else if (vehicleType.includes("Four")) vehicleSelect.value = "Four Wheeler";
            else if (vehicleType.includes("Tractor")) vehicleSelect.value = "Tractor";
        }
    } else {
        const waText = encodeURIComponent(`Hello Sai Srinivasa Automobiles,\nI would like to request/enquire about spare part: ${partName} (${vehicleType}). Please confirm availability.`);
        window.open(`https://wa.me/918790460012?text=${waText}`, "_blank");
    }
}

function prefillService(vehicleType, serviceName) {
    const section = document.getElementById("request-part");
    if (section) section.scrollIntoView({ behavior: "smooth" });

    const vehicleSelect = document.getElementById("reqVehicleType");
    const partInput = document.getElementById("reqPartName");

    if (vehicleSelect) vehicleSelect.value = vehicleType;
    if (partInput) partInput.value = serviceName;
}

// --------------------------------------------------------------------------
// 7. REQUEST FORM & WHATSAPP GENERATOR (MAIN NUMBER: 8790460012 STRICTLY)
// --------------------------------------------------------------------------
function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("reqName").value.trim();
    const phone = document.getElementById("reqPhone").value.trim();
    const vehicle = document.getElementById("reqVehicleType").value;
    const brand = document.getElementById("reqBrand").value.trim() || "N/A";
    const model = document.getElementById("reqModel").value.trim() || "N/A";
    const partName = document.getElementById("reqPartName").value.trim();
    const qty = document.getElementById("reqQuantity").value || "1";
    const notes = document.getElementById("reqNotes").value.trim() || "None";

    if (!name || !phone || !partName) {
        alert(currentLang === "te" ? "దయచేసి అవసరమైన అన్ని వివరాలు నింపండి." : "Please fill in all required fields.");
        return;
    }

    let message = "";

    if (vehicle === "Tractor" && (partName.toLowerCase().includes("work") || partName.toLowerCase().includes("service") || partName.toLowerCase().includes("repair"))) {
        message = `Hello Sai Srinivasa Automobiles,

I would like to enquire about tractor service.

Name: ${name}
Mobile: ${phone}
Tractor Model: ${brand} ${model}
Service Required: ${partName}
Additional Notes: ${notes}

Please contact me regarding the service.`;
    } else {
        message = `Hello Sai Srinivasa Automobiles,

I would like to enquire about a spare part.

Name: ${name}
Mobile: ${phone}
Vehicle: ${vehicle}
Model: ${brand} ${model}
Part: ${partName}
Quantity: ${qty}
Additional Requirement: ${notes}

Please confirm availability.`;
    }

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918790460012?text=${encodedMsg}`;

    window.open(whatsappUrl, "_blank");
}

// --------------------------------------------------------------------------
// 8. FAQ ACCORDION HANDLER
// --------------------------------------------------------------------------
function toggleFaq(element) {
    const item = element.parentElement;
    const isActive = item.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));

    if (!isActive) {
        item.classList.add("active");
    }
}

// --------------------------------------------------------------------------
// 9. GALLERY & LIGHTBOX
// --------------------------------------------------------------------------
function filterGallery(category) {
    const tabs = document.querySelectorAll(".gallery-tab");
    tabs.forEach(t => t.classList.remove("active"));
    event.target.classList.add("active");

    const items = document.querySelectorAll(".gallery-item");
    items.forEach(item => {
        const cat = item.getAttribute("data-category");
        if (category === "all" || cat === category) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

function openLightbox(element) {
    const img = element.querySelector("img");
    const caption = element.querySelector(".gallery-overlay span");
    
    if (img) {
        document.getElementById("lightboxImg").src = img.src;
        document.getElementById("lightboxCaption").textContent = caption ? caption.textContent : "";
        document.getElementById("lightboxModal").classList.remove("hidden");
    }
}

function closeLightbox() {
    document.getElementById("lightboxModal").classList.add("hidden");
}

// --------------------------------------------------------------------------
// 10. UTILITIES & SVG FALLBACK GENERATORS
// --------------------------------------------------------------------------
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function highlightActiveNavLink() {
    const sections = document.querySelectorAll("section[id]");
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute("id");
        const navItem = document.querySelector(`.main-nav a[href*=${sectionId}]`);

        if (navItem) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
                navItem.classList.add("active");
            }
        }
    });
}

// Fallback SVG generator for Team Members (RamBabu & Veerababu)
function getTeamSVG(person) {
    const isRamBabu = person === "rambabu";
    const name = isRamBabu ? "RamBabu" : "Veerababu";
    const color = isRamBabu ? "#e62e2d" : "#16a34a";
    const icon = isRamBabu ? "👔" : "🔧";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <rect width="300" height="300" fill="#0f141d" rx="150"/>
        <circle cx="150" cy="110" r="55" fill="${color}" opacity="0.2"/>
        <circle cx="150" cy="100" r="40" fill="${color}"/>
        <path d="M70 240c0-40 35-65 80-65s80 25 80 65" fill="${color}"/>
        <text x="150" y="108" font-size="28" text-anchor="middle" fill="#ffffff">${icon}</text>
        <text x="150" y="270" font-family="Outfit, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">${name}</text>
    </svg>`;

    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// Custom Fallback SVG Generator for high resolution vehicle icons
function getVehicleSVG(type) {
    let color = "#0b2240";
    let iconPath = "";

    if (type.includes("car")) {
        color = "#e62e2d";
        iconPath = `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3C13.1 7.1 12 7 12 7H5c-.6 0-1.1.4-1.3.9L2.1 11.1C1.4 11.4 1 12.1 1 13v3c0 .6.4 1 1 1h2m13 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="none" stroke="#fff" stroke-width="2"/>`;
    } else if (type.includes("tractor")) {
        color = "#16a34a";
        iconPath = `<path d="M4 17h4M12 17h8M7 11V6h5l3 5M3 17a3 3 0 1 0 6 0 3 3 0 1 0-6 0zm11 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0z" fill="none" stroke="#fff" stroke-width="2"/>`;
    } else {
        color = "#0b2240";
        iconPath = `<path d="M5 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0zm10 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0zm-7-4l2-4h4l3 4" fill="none" stroke="#fff" stroke-width="2"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#f1f5f9"/>
        <circle cx="200" cy="130" r="60" fill="${color}"/>
        <g transform="translate(180, 110)">
            <svg width="40" height="40" viewBox="0 0 24 24">${iconPath}</svg>
        </g>
        <text x="200" y="220" font-family="Outfit, sans-serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">SAI SRINIVASA AUTOMOBILES</text>
        <text x="200" y="240" font-family="Roboto, sans-serif" font-size="13" fill="#64748b" text-anchor="middle">Genuine Parts &amp; Service</text>
    </svg>`;

    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function getGallerySVG(label) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#0f141d"/>
        <circle cx="300" cy="180" r="50" fill="#e62e2d" opacity="0.2"/>
        <text x="300" y="185" font-family="Outfit, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
        <text x="300" y="220" font-family="Roboto, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Sai Srinivasa Automobiles - Nemali X Road</text>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// --------------------------------------------------------------------------
// 11. OWNER / ADMIN AUTHENTICATION & DASHBOARD SYSTEM
// --------------------------------------------------------------------------
function openOwnerLoginModal() {
    const modal = document.getElementById("ownerLoginModal");
    if (modal) {
        modal.classList.remove("hidden");
        const userInp = document.getElementById("loginUsername");
        if (userInp) userInp.focus();
        const errEl = document.getElementById("loginErrorMsg");
        if (errEl) errEl.classList.add("hidden");
    }
}

function closeOwnerLoginModal() {
    const modal = document.getElementById("ownerLoginModal");
    if (modal) modal.classList.add("hidden");
}

function handleOwnerLogin(event) {
    event.preventDefault();
    const userInp = document.getElementById("loginUsername");
    const passInp = document.getElementById("loginPassword");
    const errEl = document.getElementById("loginErrorMsg");

    const username = userInp ? userInp.value.trim() : "";
    const password = passInp ? passInp.value : "";

    // Default demo credentials as specified:
    // Username: Ram gummidelli
    // Password: Ram@123
    if (username === "Ram gummidelli" && password === "Ram@123") {
        sessionStorage.setItem(AUTH_KEY, "true");
        closeOwnerLoginModal();
        if (userInp) userInp.value = "";
        if (passInp) passInp.value = "";
        if (errEl) errEl.classList.add("hidden");
        updateOwnerAuthState();
        
        const dashboard = document.getElementById("ownerDashboardSection");
        if (dashboard) {
            dashboard.scrollIntoView({ behavior: "smooth" });
        }
    } else {
        if (errEl) {
            errEl.textContent = currentLang === "te" 
                ? "తప్పుడు యూజర్ పేరు లేదా పాస్‌వర్డ్. దయచేసి మళ్ళీ ప్రయత్నించండి." 
                : "Invalid username or password. Please try again.";
            errEl.classList.remove("hidden");
        }
    }
}

function handleOwnerLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    updateOwnerAuthState();
}

function updateOwnerAuthState() {
    const isLoggedIn = sessionStorage.getItem(AUTH_KEY) === "true";
    const loginBtn = document.getElementById("ownerLoginBtn");
    const dashBtn = document.getElementById("ownerDashboardToggleBtn");
    const logoutBtn = document.getElementById("ownerLogoutBtn");
    const dashboardSection = document.getElementById("ownerDashboardSection");

    if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "inline-flex";
    if (dashBtn) dashBtn.style.display = isLoggedIn ? "inline-flex" : "none";
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? "inline-flex" : "none";
    
    if (dashboardSection) {
        if (isLoggedIn) {
            dashboardSection.classList.remove("hidden");
            renderAdminPartsTable();
        } else {
            dashboardSection.classList.add("hidden");
        }
    }
}

// Drag and drop image upload setup
function setupDragAndDrop() {
    const dropzone = document.getElementById("imageDropzone");
    const fileInput = document.getElementById("partImageFile");
    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('drag-over');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files[0]) {
            handleImageFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0]);
        }
    });
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert(currentLang === 'te' ? 'దయచేసి సరైన ఫోటో ఫైల్ ఎంచుకోండి.' : 'Please select a valid image file.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        setPartImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

function setPartImage(src) {
    const previewContainer = document.getElementById("imagePreviewContainer");
    const previewImg = document.getElementById("imagePreviewImg");
    const dataInput = document.getElementById("adminImageData");
    const dropzonePrompt = document.getElementById("dropzonePrompt");

    if (dataInput) dataInput.value = src;
    if (previewImg) previewImg.src = src;
    if (previewContainer) previewContainer.classList.remove("hidden");
    if (dropzonePrompt) dropzonePrompt.classList.add("hidden");
}

function removePartImage() {
    const previewContainer = document.getElementById("imagePreviewContainer");
    const previewImg = document.getElementById("imagePreviewImg");
    const dataInput = document.getElementById("adminImageData");
    const dropzonePrompt = document.getElementById("dropzonePrompt");
    const fileInput = document.getElementById("partImageFile");

    if (dataInput) dataInput.value = "";
    if (previewImg) previewImg.src = "";
    if (fileInput) fileInput.value = "";
    if (previewContainer) previewContainer.classList.add("hidden");
    if (dropzonePrompt) dropzonePrompt.classList.remove("hidden");
}

function handlePartFormSubmit(event) {
    event.preventDefault();
    const editId = document.getElementById("adminEditId").value;
    const name = document.getElementById("adminPartName").value.trim();
    const vehicle = document.getElementById("adminVehicleType").value;
    const category = document.getElementById("adminCategory").value;
    const compatible = document.getElementById("adminCompatible").value.trim() || "All standard models";
    const desc = document.getElementById("adminDesc").value.trim() || "Genuine high quality spare part.";
    
    // Default values as required:
    // Price: Contact Shop
    // Availability: Available
    const priceVal = document.getElementById("adminPrice").value.trim();
    const price = priceVal || "Contact Shop";
    const availVal = document.getElementById("adminAvailability").value;
    const availability = availVal || "Available";
    
    let image = document.getElementById("adminImageData").value;

    if (!name) {
        alert(currentLang === 'te' ? 'దయచేసి స్పేర్ పార్ట్ పేరు నమోదు చేయండి.' : 'Please enter the part name.');
        return;
    }

    if (!image) {
        const vType = vehicle.toLowerCase().includes("tractor") ? "tractor" : (vehicle.toLowerCase().includes("four") ? "car" : "bike");
        image = getVehicleSVG(vType);
    }

    let parts = getStoredParts();

    if (editId) {
        const index = parts.findIndex(p => String(p.id) === String(editId));
        if (index !== -1) {
            parts[index] = {
                ...parts[index],
                name,
                vehicle,
                category,
                compatible,
                desc,
                price,
                availability,
                image
            };
        }
    } else {
        const newPart = {
            id: "part-" + Date.now(),
            name,
            vehicle,
            category,
            compatible,
            desc,
            price,
            availability,
            image
        };
        parts.unshift(newPart);
    }

    saveStoredParts(parts);
    resetPartForm();
    applyFilters();
    renderAdminPartsTable();

    alert(currentLang === 'te' ? 'స్పేర్ పార్ట్ విజయవంతంగా సేవ్ చేయబడింది!' : 'Spare part saved successfully!');
}

function resetPartForm() {
    const form = document.getElementById("adminPartForm");
    if (form) form.reset();
    document.getElementById("adminEditId").value = "";
    document.getElementById("adminPrice").value = "Contact Shop";
    document.getElementById("adminAvailability").value = "Available";
    removePartImage();
    
    const formTitle = document.getElementById("formHeading");
    if (formTitle) {
        formTitle.textContent = currentLang === 'te' ? 'కొత్త స్పేర్ పార్ట్ జోడించండి' : 'Add New Spare Part';
    }
    const cancelBtn = document.getElementById("btnCancelEdit");
    if (cancelBtn) cancelBtn.classList.add("hidden");
}

function editPart(id) {
    const parts = getStoredParts();
    const part = parts.find(p => String(p.id) === String(id));
    if (!part) return;

    document.getElementById("adminEditId").value = part.id;
    document.getElementById("adminPartName").value = part.name;
    document.getElementById("adminVehicleType").value = part.vehicle;
    document.getElementById("adminCategory").value = part.category;
    document.getElementById("adminCompatible").value = part.compatible || "";
    document.getElementById("adminDesc").value = part.desc || "";
    document.getElementById("adminPrice").value = part.price || "Contact Shop";
    document.getElementById("adminAvailability").value = part.availability || "Available";
    
    if (part.image) {
        setPartImage(part.image);
    } else {
        removePartImage();
    }

    const formTitle = document.getElementById("formHeading");
    if (formTitle) {
        formTitle.textContent = currentLang === 'te' ? 'స్పేర్ పార్ట్ వివరాలు సవరించండి' : 'Edit Spare Part';
    }
    const cancelBtn = document.getElementById("btnCancelEdit");
    if (cancelBtn) cancelBtn.classList.remove("hidden");

    switchAdminTab("add");
    document.getElementById("adminPartForm").scrollIntoView({ behavior: "smooth" });
}

function deletePart(id) {
    const confirmMsg = currentLang === 'te' 
        ? 'మీరు ఖచ్చితంగా ఈ స్పేర్ పార్ట్‌ను తొలగించాలనుకుంటున్నారా?' 
        : 'Are you sure you want to delete this spare part?';
    if (!confirm(confirmMsg)) return;

    let parts = getStoredParts();
    parts = parts.filter(p => String(p.id) !== String(id));
    saveStoredParts(parts);
    applyFilters();
    renderAdminPartsTable();
}

function renderAdminPartsTable() {
    const tbody = document.getElementById("adminPartsTableBody");
    const countEl = document.getElementById("adminPartsCount");
    const searchInp = document.getElementById("adminSearchInput");
    const q = searchInp ? searchInp.value.toLowerCase().trim() : "";

    if (!tbody) return;
    const parts = getStoredParts();
    
    const filtered = parts.filter(p => {
        if (!q) return true;
        return (p.name && p.name.toLowerCase().includes(q)) ||
               (p.vehicle && p.vehicle.toLowerCase().includes(q)) ||
               (p.category && p.category.toLowerCase().includes(q)) ||
               (p.compatible && p.compatible.toLowerCase().includes(q));
    });

    if (countEl) {
        countEl.textContent = `${currentLang === 'te' ? 'మొత్తం స్పేర్ పార్ట్స్:' : 'Total parts:'} ${filtered.length}`;
    }

    tbody.innerHTML = "";

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 24px; color: var(--text-gray-light); font-weight: 500;">${currentLang === 'te' ? 'స్పేర్ పార్ట్స్ ఏవీ కనుగొనబడలేదు.' : 'No spare parts found.'}</td></tr>`;
        return;
    }

    filtered.forEach(p => {
        const tr = document.createElement("tr");
        let vehicleTag = p.vehicle;
        let vehicleClass = "tag-blue";
        if (p.vehicle === "Four Wheeler") {
            vehicleClass = "tag-red";
            if (currentLang === "te") vehicleTag = "ఫోర్ వీలర్";
        } else if (p.vehicle === "Tractor") {
            vehicleClass = "tag-green";
            if (currentLang === "te") vehicleTag = "ట్రాక్టర్";
        } else if (p.vehicle === "Two Wheeler") {
            if (currentLang === "te") vehicleTag = "టూ వీలర్";
        }

        const priceDisplay = p.price && p.price !== "Contact Shop" 
            ? p.price 
            : (currentLang === "te" ? "షాప్ ను సంప్రదించండి" : "Contact Shop");

        const statusClass = p.availability === "Available" ? "badge-available" : "badge-confirm";
        const statusText = p.availability === "Available" 
            ? (currentLang === "te" ? "అందుబాటులో ఉంది" : "Available") 
            : (currentLang === "te" ? "షాప్ లో విచారించండి" : "Confirm with Shop");

        tr.innerHTML = `
            <td>
                <div class="admin-part-cell">
                    <img src="${p.image}" alt="${p.name}" class="admin-part-thumb" onerror="this.onerror=null; this.src=getVehicleSVG('${p.vehicle.toLowerCase().includes('tractor') ? 'tractor' : (p.vehicle.toLowerCase().includes('four') ? 'car' : 'bike')}');">
                    <div class="admin-part-info">
                        <strong>${p.name}</strong>
                        <small class="text-gray">${p.compatible || ''}</small>
                    </div>
                </div>
            </td>
            <td><span class="part-tag ${vehicleClass}">${vehicleTag}</span></td>
            <td>${p.category}</td>
            <td><strong>${priceDisplay}</strong></td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <div class="admin-actions-cell">
                    <button class="btn btn-navy-sm btn-action-edit" onclick="editPart('${p.id}')" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i> <span>${currentLang === 'te' ? 'మార్చండి' : 'Edit'}</span>
                    </button>
                    <button class="btn btn-red btn-action-del" onclick="deletePart('${p.id}')" title="Delete">
                        <i class="fa-solid fa-trash"></i> <span>${currentLang === 'te' ? 'తొలగించండి' : 'Delete'}</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function switchAdminTab(tab) {
    const tabAdd = document.getElementById("adminTabAdd");
    const tabManage = document.getElementById("adminTabManage");
    const paneAdd = document.getElementById("adminPaneAdd");
    const paneManage = document.getElementById("adminPaneManage");

    if (!tabAdd || !tabManage || !paneAdd || !paneManage) return;

    if (tab === "add") {
        tabAdd.classList.add("active");
        tabManage.classList.remove("active");
        paneAdd.classList.remove("hidden");
        paneManage.classList.add("hidden");
    } else {
        tabManage.classList.add("active");
        tabAdd.classList.remove("active");
        paneManage.classList.remove("hidden");
        paneAdd.classList.add("hidden");
        renderAdminPartsTable();
    }
}
