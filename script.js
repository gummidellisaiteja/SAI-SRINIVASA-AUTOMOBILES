/* ==========================================================================
   SAI SRINIVASA AUTOMOBILES - MAIN JAVASCRIPT LOGIC
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. SPARE PARTS CATALOG DATA & API INTEGRATION
// --------------------------------------------------------------------------
const fallbackSparePartsData = [
    {
        id: "tw-1",
        name: "Front & Rear Brake Pad Kit",
        teluguName: "ఫ్రంట్ & రియర్ బ్రేక్ ప్యాడ్ కిట్",
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
        teluguName: "హెవీ డ్యూటీ క్లచ్ ప్లేట్ సెట్",
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
        teluguName: "హై ఫ్లో ఎయిర్ ఫిల్టర్",
        vehicle: "Two Wheeler",
        category: "Filters",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Honda Activa 3G/4G/5G/6G, Jupiter, Access 125, Hero Maestro",
        desc: "Multi-layer micro-mesh air filter preventing dust intrusion and enhancing engine life.",
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "fw-1",
        name: "Car Engine Oil Filter Assembly",
        teluguName: "కార్ ఇంజిన్ ఆయిల్ ఫిల్టర్",
        vehicle: "Four Wheeler",
        category: "Filters",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Maruti Swift, Dzire, WagonR, Alto, Hyundai i10, i20, Tata Tiago",
        desc: "OEM specification spin-on oil filter for car engines. (Parts Only - Repair not available).",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "tr-1",
        name: "Heavy Duty Tractor Hydraulic Oil Filter",
        teluguName: "ట్రాక్టర్ హైడ్రాలిక్ ఆయిల్ ఫిల్టర్",
        vehicle: "Tractor",
        category: "Filters",
        price: "Contact Shop",
        availability: "Available",
        compatible: "Mahindra 275/575, John Deere 5050D, Swaraj 744, Massey Ferguson, Sonalika",
        desc: "High pressure hydraulic fluid filter protecting hydraulic pumps and lift arms.",
        image: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=400&q=80"
    }
];

let sparePartsData = [];
const API_BASE = "/api";
const AUTH_KEY = "sai_owner_logged_in";
const AUTH_TOKEN_KEY = "sai_owner_token";

function getOwnerAuthHeaders(extra = {}) {
    const headers = { Accept: "application/json", ...extra };
    try {
        const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
        if (token) headers.Authorization = `Bearer ${token}`;
    } catch (err) {
        /* sessionStorage may be unavailable */
    }
    return headers;
}

function ownerApi(path, options = {}) {
    return fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: "include",
        headers: getOwnerAuthHeaders(options.headers || {})
    });
}

function clearOwnerSession() {
    try {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (err) {
        /* ignore */
    }
}

function normalizePartFromApi(item) {
    if (!item) return null;

    return {
        id: String(item.id ?? item.part_id ?? ""),
        name: item.name ?? item.part_name ?? "Unnamed Part",
        teluguName: item.telugu_name ?? item.teluguName ?? "",
        vehicle: item.vehicle_type ?? item.vehicleType ?? item.vehicle ?? "Two Wheeler",
        category: item.category ?? "Other",
        price: item.price ?? "Contact Shop",
        availability: item.availability ?? "Available",
        compatible: item.compatible_models ?? item.compatibleModels ?? item.compatible ?? "",
        desc: item.description ?? item.desc ?? "",
        image: item.image_url ?? item.imageUrl ?? item.image ?? ""
    };
}

async function loadSpareParts() {
    try {
        const response = await fetch(`${API_BASE}/parts`, {
            method: "GET",
            headers: { "Accept": "application/json" },
            credentials: "same-origin",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Parts API returned HTTP ${response.status}`);
        }

        const payload = await response.json();
        const apiParts = Array.isArray(payload)
            ? payload
            : (Array.isArray(payload.parts) ? payload.parts :
               (Array.isArray(payload.data) ? payload.data : []));

        sparePartsData = apiParts.map(normalizePartFromApi).filter(part => part && part.id);

        if (sparePartsData.length === 0) {
            throw new Error("Parts API returned no parts");
        }
    } catch (error) {
        console.warn("Could not load spare parts from REST API. Using fallback catalog.", error);
        sparePartsData = fallbackSparePartsData;
    }

    renderCatalogGrid(sparePartsData);
    applyFilters();
}

// --------------------------------------------------------------------------
// 2. BILINGUAL TRANSLATIONS DICTIONARY (ENGLISH & TELUGU)
// --------------------------------------------------------------------------
const translations = {
    en: {
        topAddress: "Wyra Road, Siripuram, Near Mallavaram Stage, Nemali X Road, Madhira",
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
        btnSendPartRequest: "Submit Request",
        ownerLoginBtn: "Owner Login"
    },
    te: {
        topAddress: "వైరా రోడ్, సిరిపురం, మల్లావరం స్టేజ్ దగ్గర, నెమలి X రోడ్, మధిర",
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
        reqFormSub: "క్రింది వివరాలు నింపండి, కాల్ లేదా ఆన్‌లైన్ ద్వారా వెంటనే సమాచారం పొందండి.",
        lblYourName: "మీ పేరు *",
        lblMobileNumber: "మొబైల్ నెంబర్ *",
        lblVehicleType: "వాహనం రకం *",
        lblVehicleBrand: "వాహనం బ్రాండ్",
        lblVehicleModel: "వాహనం మోడల్",
        lblPartName: "కావలసిన పార్ట్ / సర్వీస్ పేరు *",
        lblQuantity: "పరిమాణం (Quantity)",
        lblNotes: "ఇతర వివరాలు",
        btnSendPartRequest: "అభ్యర్థనను సమర్పించండి",
        ownerLoginBtn: "యజమాని లాగిన్"
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

    const urlParams = new URLSearchParams(window.location.search);
    const vehicleParam = urlParams.get("vehicle");
    const searchParam = urlParams.get("search");
    const selectVehicle = document.getElementById("vehicleFilter");
    const searchInput = document.getElementById("searchInput");
    if (vehicleParam && selectVehicle) selectVehicle.value = vehicleParam;
    if (searchParam && searchInput) searchInput.value = searchParam;

    updateLanguageToggleUI();
    applyTranslations();
    updateLiveShopStatus();
    loadSpareParts();

    if (document.body.classList.contains("page-owner-console")) {
        initOwnerConsolePage();
    }

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
});

// --------------------------------------------------------------------------
// 4. DYNAMIC SHOP LIVE OPEN / CLOSED STATUS
// --------------------------------------------------------------------------
function updateLiveShopStatus() {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const openMins = 7 * 60 + 30;   // 7:30 AM
    const closeMins = 20 * 60 + 30; // 8:30 PM

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
            topHoursText.innerHTML = currentLang === "te" ? `7:30 AM – 8:30 PM (తెరిచి ఉంది)` : `7:30 AM – 8:30 PM (Open Now)`;
        }
    } else {
        if (heroLiveStatusPill) heroLiveStatusPill.className = "info-pill status-live-pill status-closed";
        if (liveStatusText) {
            liveStatusText.innerHTML = currentLang === "te" 
                ? `<span class="pulse-dot red-dot"></span> ప్రస్తుతం మూసివేయబడింది • ఉదయం 7:30 కి తెరుస్తుంది` 
                : `<span class="pulse-dot red-dot"></span> Closed Now • Opens at 7:30 AM`;
        }
        if (topHoursText) {
            topHoursText.innerHTML = currentLang === "te" ? `7:30 AM – 8:30 PM (మూసివేయబడింది)` : `7:30 AM – 8:30 PM (Closed Now)`;
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
        if (langDict[key]) el.innerHTML = langDict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (langDict[key]) el.setAttribute("placeholder", langDict[key]);
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (langDict[key]) el.setAttribute("title", langDict[key]);
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

    const filtered = sparePartsData.filter(item => {
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

function handleSearchInput() { applyFilters(); }
function executeSearch() { applyFilters(); }

// --------------------------------------------------------------------------
// 7. REQUEST FORM & WHATSAPP GENERATOR
// MAIN WHATSAPP NUMBER: 8790460012
// --------------------------------------------------------------------------
async function handleFormSubmit(event) {
    event.preventDefault();

    const getValue = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };

    const name = getValue("reqName");
    const phone = getValue("reqPhone");
    const vehicle = getValue("reqVehicleType") || "Two Wheeler";
    const brand = getValue("reqBrand") || "";
    const model = getValue("reqModel") || "";
    const partName = getValue("reqPartName");
    const qty = getValue("reqQuantity") || "1";
    const notes = getValue("reqNotes") || "";

    // 1. Client-Side Validation (Telugu + English)
    if (!name) {
        alert(currentLang === "te"
            ? "దయచేసి మీ పూర్తి పేరును ఎంటర్ చేయండి."
            : "Please enter your full name.");
        return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (!phone || cleanPhone.length !== 10) {
        alert(currentLang === "te"
            ? "దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ సంఖ్యను ఎంటర్ చేయండి."
            : "Please enter a valid 10-digit mobile number.");
        return;
    }

    if (!partName) {
        alert(currentLang === "te"
            ? "దయచేసి స్పేర్ పార్ట్ పేరును లేదా సర్వీస్ విభాగాన్ని ఎంటర్ చేయండి."
            : "Please enter the spare part name or service required.");
        return;
    }

    if (!vehicle) {
        alert(currentLang === "te"
            ? "దయచేసి వాహనం రకాన్ని ఎంచుకోండి."
            : "Please select a vehicle type.");
        return;
    }

    const vehicleModelCombined = `${brand} ${model}`.trim();

    // Disable submit button to prevent duplicate submissions
    const form = document.getElementById("partRequestForm");
    const submitBtn = form
        ? form.querySelector("button[type='submit']")
        : null;

    const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> ' +
            '<span>Saving to Database...</span>';
    }

    // Open a tab before the asynchronous request to reduce popup blocking.
    // If blocked, WhatsApp will open in the current tab after saving.
    const whatsappTab = window.open("about:blank", "_blank");

    try {
        // 2. SAVE TO SQL SERVER FIRST via the existing REST API
        const response = await fetch(`${API_BASE}/requests/spare-part`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerName: name,
                mobileNumber: cleanPhone,
                partName: partName,
                vehicleType: vehicle,
                vehicleModel: vehicleModelCombined || "General",
                brand: brand,
                quantity: parseInt(qty, 10) || 1,
                description: notes
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            if (whatsappTab && !whatsappTab.closed) {
                whatsappTab.close();
            }

            alert(data.error ||
                (currentLang === "te"
                    ? "మీ అభ్యర్థనను డేటాబేస్‌లో సేవ్ చేయలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి."
                    : "Database insertion failed. Unable to save your request right now. Please try again."));
            return;
        }

        const requestId = data.requestId;

        // 3. PREPARE WHATSAPP MESSAGE AFTER SUCCESSFUL DATABASE SAVE
        const message = [
            "NEW SPARE PART REQUEST",
            "Sai Srinivasa Automobiles",
            "",
            `Request ID: ${requestId ?? "N/A"}`,
            `Customer Name: ${name}`,
            `Customer Mobile: ${cleanPhone}`,
            `Part / Service: ${partName}`,
            `Vehicle Type: ${vehicle}`,
            `Brand: ${brand || "Not provided"}`,
            `Model: ${model || "Not provided"}`,
            `Quantity: ${parseInt(qty, 10) || 1}`,
            `Description: ${notes || "Not provided"}`,
            "",
            "Please contact the customer."
        ].join("\n");

        const whatsappUrl =
            "https://wa.me/918790460012?text=" +
            encodeURIComponent(message);

        // 4. DISPLAY THE EXISTING DATABASE SUCCESS CARD
        if (form) {
            form.style.display = "none";
        }

        const formattedReqId = String(requestId ?? "N/A")
            .startsWith("REQ-")
            ? requestId
            : `REQ-${requestId ?? "N/A"}`;

        const successBox =
            document.getElementById("requestSuccessBox");
        const successReqId =
            document.getElementById("successReqId");

        if (successReqId) {
            successReqId.textContent = `#${formattedReqId}`;
        }

        if (successBox) {
            successBox.classList.remove("hidden");
            successBox.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        // 5. OPEN WHATSAPP WITH THE PREFILLED MESSAGE
        if (whatsappTab && !whatsappTab.closed) {
            whatsappTab.location.href = whatsappUrl;
        } else {
            alert(currentLang === "te"
                ? "మీ అభ్యర్థన సేవ్ అయింది. WhatsAppలో సందేశాన్ని తెరుస్తున్నాము."
                : "Your request was saved successfully. Opening WhatsApp with your message.");

            window.location.href = whatsappUrl;
        }

    } catch (error) {
        if (whatsappTab && !whatsappTab.closed) {
            whatsappTab.close();
        }

        console.error("Spare part request DB submission error:", error);

        alert(currentLang === "te"
            ? "సర్వర్‌తో కనెక్షన్ సమస్య ఉంది. మీ అభ్యర్థన సేవ్ అయిందో లేదో Owner Dashboardలో తనిఖీ చేయండి."
            : "We could not confirm your request. Please check your connection and the Owner Dashboard before submitting again.");

    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

// --------------------------------------------------------------------------
// 8. OWNER AUTHENTICATION & LOGIN HANDLERS
// --------------------------------------------------------------------------
async function handleStandaloneLogin(event) {
    event.preventDefault();
    const userInp = document.getElementById("standaloneUsername");
    const passInp = document.getElementById("standalonePassword");
    const errAlert = document.getElementById("loginErrorAlert");

    const username = userInp ? userInp.value.trim() : "";
    const password = passInp ? passInp.value : "";

    if (!username || !password) {
        if (errAlert) {
            errAlert.textContent = "Please enter both username and password.";
            errAlert.classList.remove("hidden");
        }
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        let resData = {};
        try {
            resData = await response.json();
        } catch (parseErr) {
            if (errAlert) {
                errAlert.textContent = "Login failed because the server returned an unexpected response.";
                errAlert.classList.remove("hidden");
            }
            return;
        }

        if (response.ok && resData.success && (resData.user || resData.token)) {
            sessionStorage.setItem(AUTH_KEY, "true");
            if (resData.token) sessionStorage.setItem(AUTH_TOKEN_KEY, resData.token);
            if (errAlert) errAlert.classList.add("hidden");
            window.location.replace("owner.html");
            return;
        } else {
            if (errAlert) {
                errAlert.textContent = resData.error || "Invalid username or password.";
                errAlert.classList.remove("hidden");
            }
        }
    } catch (apiErr) {
        if (errAlert) {
            errAlert.textContent = "Server connection error. Please try again.";
            errAlert.classList.remove("hidden");
        }
    }
}

async function handleOwnerLogout() {
    try {
        await ownerApi("/auth/logout", { method: "POST" });
    } catch (err) {
        console.warn("Logout API call warning:", err);
    }
    clearOwnerSession();
    window.location.replace("login.html");
}

// --------------------------------------------------------------------------
// 9. OWNER CONSOLE ENGINE & DATA MANAGEMENT
// --------------------------------------------------------------------------
let currentOwnerTab = "dashboard";
let activeReqStatusFilter = "All";

async function initOwnerConsolePage() {
    // Session Verification
    try {
        const meRes = await ownerApi("/auth/me");
        if (!meRes.ok) {
            clearOwnerSession();
            window.location.replace("login.html");
            return;
        }
        const meData = await meRes.json();
        if (!meData.user && !meData.authenticated) {
            clearOwnerSession();
            window.location.replace("login.html");
            return;
        }

        const u = meData.user || meData;
        const nameInput = document.getElementById("settingsName");
        const emailInput = document.getElementById("settingsEmail");
        const usernameInput = document.getElementById("settingsCurrentUsername");

        if (nameInput && u.name) nameInput.value = u.name;
        if (emailInput && u.email) emailInput.value = u.email;
        if (usernameInput && u.username) usernameInput.value = u.username;

        const ownerLoginText = document.querySelector(".owner-login-text");
        if (ownerLoginText) {
            ownerLoginText.innerHTML = `Logged in as: <strong class="text-white">${u.name || 'RamBabu'} (${u.username})</strong>`;
        }
    } catch (err) {
        console.warn("Authentication check failed:", err);
        clearOwnerSession();
        window.location.replace("login.html");
        return;
    }

    setupOwnerDragAndDrop();
    await renderOwnerConsoleData();
    switchOwnerTab("dashboard");
}

function switchOwnerTab(tabName) {
    currentOwnerTab = tabName;

    document.querySelectorAll(".sidebar-item").forEach(item => {
        item.classList.remove("active");
    });

    const tabMap = {
        "dashboard": "sideNavDashboard",
        "inventory": "sideNavInventory",
        "add-part": "sideNavAddPart",
        "requests": "sideNavRequests",
        "payments": "sideNavPayments",
        "settings": "sideNavSettings"
    };

    const activeNavId = tabMap[tabName];
    if (activeNavId) {
        const navBtn = document.getElementById(activeNavId);
        if (navBtn) navBtn.classList.add("active");
    }

    const views = ["viewDashboard", "viewInventory", "viewAddPart", "viewRequests", "viewPayments", "viewSettings"];
    views.forEach(vId => {
        const panel = document.getElementById(vId);
        if (panel) panel.classList.add("hidden");
    });

    const targetViewMap = {
        "dashboard": "viewDashboard",
        "inventory": "viewInventory",
        "add-part": "viewAddPart",
        "requests": "viewRequests",
        "payments": "viewPayments",
        "settings": "viewSettings"
    };

    const targetId = targetViewMap[tabName];
    if (targetId) {
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.remove("hidden");
    }

    const sidebar = document.getElementById("ownerSidebar");
    const overlay = document.getElementById("ownerSidebarOverlay");
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.add("hidden");

    renderOwnerConsoleData();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleOwnerMobileSidebar() {
    const sidebar = document.getElementById("ownerSidebar");
    const overlay = document.getElementById("ownerSidebarOverlay");
    if (sidebar) sidebar.classList.toggle("open");
    if (overlay) overlay.classList.toggle("hidden");
}

async function renderOwnerConsoleData() {
    // Load Dashboard Stats from REST API
    try {
        const statsRes = await ownerApi("/dashboard/stats");
        if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.success && statsData.data) {
                const s = statsData.data;
                const mParts = document.getElementById("metricPartsCount");
                if (mParts) mParts.textContent = s.totalPartsCatalogued;

                const mAvailParts = document.getElementById("metricAvailablePartsCount");
                if (mAvailParts) mAvailParts.textContent = s.availableParts;

                const mInq = document.getElementById("metricInquiriesCount");
                if (mInq) mInq.textContent = s.customerInquiries;

                const mTractor = document.getElementById("metricTractorQueueCount");
                if (mTractor) mTractor.textContent = s.tractorWorksQueue;

                const partsCountEl = document.getElementById("sidebarPartsCount");
                if (partsCountEl) partsCountEl.textContent = s.totalPartsCatalogued;

                const reqCountEl = document.getElementById("sidebarRequestsCount");
                if (reqCountEl) reqCountEl.textContent = s.customerInquiries;
            }
        }
    } catch (err) {
        console.warn("Could not fetch dashboard stats:", err);
    }

    if (currentOwnerTab === "dashboard") {
        await loadAndRenderDashboardRequests();
    } else if (currentOwnerTab === "inventory") {
        await renderOwnerInventory();
    } else if (currentOwnerTab === "requests") {
        await loadAndRenderOwnerRequests();
    }
}

async function loadAndRenderDashboardRequests() {
    const container = document.getElementById("recentRequestsList");
    if (!container) return;

    try {
        const res = await ownerApi("/requests");
        if (res.ok) {
            const data = await res.json();
            const requests = data.data || [];

            if (requests.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 20px;">No recent customer requests found.</div>`;
                return;
            }

            container.innerHTML = "";
            requests.slice(0, 5).forEach(req => {
                const status = req.status || "Pending";
                const phone = req.mobile_number || req.phone || "";
                const partName = req.part_name || req.part_service || "Spare part request";
                const model = req.vehicle_model || req.brand_model || "General";
                const badgeClass = getStatusBadgeClass(status);

                const row = document.createElement("div");
                row.className = "request-item-row";
                row.innerHTML = `
                    <div class="req-item-left">
                        <div class="req-meta-line">
                            <span class="req-customer-name">${escapeHtml(req.customer_name || "")}</span>
                            <span class="req-phone">• ${escapeHtml(phone)}</span>
                            <span class="req-badge-vehicle">${escapeHtml(req.vehicle_type || "")}</span>
                        </div>
                        <p class="req-part-text">${escapeHtml(partName)} (${escapeHtml(model)})</p>
                    </div>
                    <div class="req-item-right">
                        <span class="badge-status ${badgeClass}">${escapeHtml(status)}</span>
                        <a href="tel:${phone}" class="btn-req-call" title="Call Customer ${phone}">
                            <i class="fa-solid fa-phone"></i>
                        </a>
                    </div>
                `;
                container.appendChild(row);
            });
        }
    } catch (err) {
        container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 20px;">No recent customer requests found.</div>`;
    }
}

async function renderOwnerInventory() {
    const tbody = document.getElementById("ownerInventoryTableBody");
    const mobileCards = document.getElementById("ownerInventoryMobileCards");
    const searchInp = document.getElementById("ownerSearchInput");
    const vehicleFilter = document.getElementById("ownerVehicleFilter");

    const q = searchInp ? searchInp.value.toLowerCase().trim() : "";
    const vehVal = vehicleFilter ? vehicleFilter.value : "All";

    try {
        const res = await ownerApi(`/parts?vehicle=${encodeURIComponent(vehVal)}&search=${encodeURIComponent(q)}`);
        if (res.ok) {
            const data = await res.json();
            const parts = (data.data || []).map(normalizePartFromApi);

            // Render Desktop Table Rows
            if (tbody) {
                tbody.innerHTML = "";
                if (parts.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">No matching spare parts in inventory.</td></tr>`;
                } else {
                    parts.forEach(p => {
                        let vehicleClass = "tag-blue";
                        if (p.vehicle === "Four Wheeler") vehicleClass = "tag-red";
                        else if (p.vehicle === "Tractor") vehicleClass = "tag-green";

                        const statusClass = p.availability === "Available" ? "badge-available" : "badge-confirm";

                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>
                                <div class="admin-part-cell">
                                    <img src="${p.image}" alt="${p.name}" class="admin-part-thumb" onerror="this.onerror=null; this.src=getVehicleSVG('${p.vehicle.toLowerCase().includes('tractor') ? 'tractor' : (p.vehicle.toLowerCase().includes('four') ? 'car' : 'bike')}');">
                                    <div class="admin-part-info">
                                        <strong>${p.name}</strong>
                                        <small>Fits: ${p.compatible || 'All standard models'}</small>
                                    </div>
                                </div>
                            </td>
                            <td><span class="part-tag ${vehicleClass}">${p.vehicle}</span></td>
                            <td>${p.category || 'General'}</td>
                            <td><strong>${p.price || 'Contact Shop'}</strong></td>
                            <td><span class="${statusClass}">${p.availability || 'Available'}</span></td>
                            <td>
                                <button class="btn-action-icon btn-action-edit" onclick="editOwnerPart('${p.id}')" title="Edit Part">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn-action-icon" onclick="deleteOwnerPart('${p.id}')" title="Delete Part">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }

            // Render Mobile Cards View
            if (mobileCards) {
                mobileCards.innerHTML = "";
                if (parts.length === 0) {
                    mobileCards.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 20px;">No matching spare parts found.</div>`;
                } else {
                    parts.forEach(p => {
                        let vehicleClass = "tag-blue";
                        if (p.vehicle === "Four Wheeler") vehicleClass = "tag-red";
                        else if (p.vehicle === "Tractor") vehicleClass = "tag-green";

                        const statusClass = p.availability === "Available" ? "badge-available" : "badge-confirm";

                        const card = document.createElement("div");
                        card.className = "owner-card-item-mobile";
                        card.innerHTML = `
                            <div class="owner-card-item-top">
                                <img src="${p.image}" alt="${p.name}" class="admin-part-thumb" onerror="this.onerror=null; this.src=getVehicleSVG('${p.vehicle.toLowerCase().includes('tractor') ? 'tractor' : (p.vehicle.toLowerCase().includes('four') ? 'car' : 'bike')}');">
                                <div class="owner-card-item-meta">
                                    <strong>${p.name}</strong>
                                    <span class="part-tag ${vehicleClass}">${p.vehicle}</span>
                                </div>
                            </div>
                            <div style="font-size: 0.8rem; color: #64748b;">
                                <strong>Fits:</strong> ${p.compatible || 'All standard models'}<br>
                                <strong>Category:</strong> ${p.category}<br>
                                <strong>Price:</strong> ${p.price || 'Contact Shop'}
                            </div>
                            <div class="owner-card-item-bottom">
                                <span class="${statusClass}">${p.availability || 'Available'}</span>
                                <div>
                                    <button class="btn-action-icon btn-action-edit" onclick="editOwnerPart('${p.id}')" title="Edit">
                                        <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button class="btn-action-icon" onclick="deleteOwnerPart('${p.id}')" title="Delete">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                        mobileCards.appendChild(card);
                    });
                }
            }
        } else if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">Unable to load inventory from the database. Please log in again if your session expired.</td></tr>`;
        }
    } catch (err) {
        console.warn("Could not fetch inventory parts:", err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">Unable to load inventory from the database.</td></tr>`;
        }
    }
}

async function handleOwnerFormSubmit(event) {
    event.preventDefault();
    const editId = document.getElementById("ownerEditId").value;
    const nameEn = document.getElementById("ownerPartName").value.trim();
    const nameTe = document.getElementById("ownerPartNameTe") ? document.getElementById("ownerPartNameTe").value.trim() : "";
    const vehicle = document.getElementById("ownerVehicleType").value;
    const category = document.getElementById("ownerCategory").value;
    const compatible = document.getElementById("ownerCompatible").value.trim() || "All standard models";
    const desc = document.getElementById("ownerDesc").value.trim() || "Genuine high quality spare part.";
    const priceVal = document.getElementById("ownerPrice").value.trim() || "Contact Shop";
    const availVal = document.getElementById("ownerAvailability").value || "Available";
    let image = document.getElementById("ownerImageData").value;

    if (!nameEn) {
        alert("Please enter the part name in English.");
        return;
    }

    if (!image) {
        const vType = vehicle.toLowerCase().includes("tractor") ? "tractor" : (vehicle.toLowerCase().includes("four") ? "car" : "bike");
        image = getVehicleSVG(vType);
    }

    const payload = {
        name: nameEn,
        telugu_name: nameTe,
        vehicle_type: vehicle,
        category,
        compatible_models: compatible,
        description: desc,
        price: priceVal,
        availability: availVal,
        image_url: image
    };

    try {
        const url = editId ? `${API_BASE}/parts/${editId}` : `${API_BASE}/parts`;
        const method = editId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            credentials: "include",
            headers: getOwnerAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload)
        });

        const resData = await res.json();
        if (res.ok && resData.success) {
            alert(editId ? "Spare part updated successfully!" : "Spare part added to inventory successfully!");
            resetOwnerForm();
            switchOwnerTab("inventory");
        } else {
            alert(resData.error || "Failed to save spare part.");
        }
    } catch (err) {
        alert("Server connection error while saving part.");
    }
}

function resetOwnerForm() {
    const form = document.getElementById("ownerPartForm");
    if (form) form.reset();
    document.getElementById("ownerEditId").value = "";
    document.getElementById("ownerPrice").value = "Contact Shop";
    document.getElementById("ownerAvailability").value = "Available";
    removeOwnerImage();

    const formTitle = document.getElementById("ownerFormHeading") || document.getElementById("formHeading");
    if (formTitle) formTitle.textContent = "Add New Spare Part";
    const btnSaveText = document.getElementById("btnOwnerSaveText");
    if (btnSaveText) btnSaveText.textContent = "Add to Inventory";
    const cancelBtn = document.getElementById("btnCancelOwnerEdit");
    if (cancelBtn) cancelBtn.classList.add("hidden");
}

async function editOwnerPart(id) {
    try {
        const res = await ownerApi(`/parts/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        const part = normalizePartFromApi(data.data);
        if (!part) return;

        document.getElementById("ownerEditId").value = part.id;
        document.getElementById("ownerPartName").value = part.name;
        if (document.getElementById("ownerPartNameTe")) {
            document.getElementById("ownerPartNameTe").value = part.teluguName || "";
        }
        document.getElementById("ownerVehicleType").value = part.vehicle;
        document.getElementById("ownerCategory").value = part.category;
        document.getElementById("ownerCompatible").value = part.compatible || "";
        document.getElementById("ownerDesc").value = part.desc || "";
        document.getElementById("ownerPrice").value = part.price || "Contact Shop";
        document.getElementById("ownerAvailability").value = part.availability || "Available";

        if (part.image) setOwnerImage(part.image);
        else removeOwnerImage();

        const formTitle = document.getElementById("ownerFormHeading") || document.getElementById("formHeading");
        if (formTitle) formTitle.textContent = "Edit Spare Part";
        const btnSaveText = document.getElementById("btnOwnerSaveText");
        if (btnSaveText) btnSaveText.textContent = "Save Spare Part";
        const cancelBtn = document.getElementById("btnCancelOwnerEdit");
        if (cancelBtn) cancelBtn.classList.remove("hidden");

        switchOwnerTab("add-part");
    } catch (err) {
        console.warn("Error fetching part details for edit:", err);
    }
}

async function deleteOwnerPart(id) {
    if (!confirm("Are you sure you want to delete this spare part from SQL Server inventory?")) return;
    try {
        const res = await ownerApi(`/parts/${id}`, { method: "DELETE" });
        if (res.ok) {
            renderOwnerConsoleData();
        } else {
            alert("Failed to delete spare part.");
        }
    } catch (err) {
        alert("Server error deleting spare part.");
    }
}

// Settings: Update Profile
async function handleOwnerUpdateProfile(event) {
    event.preventDefault();
    const alertEl = document.getElementById("settingsProfileAlert");
    if (alertEl) alertEl.classList.add("hidden");

    const name = document.getElementById("settingsName").value.trim();
    const email = document.getElementById("settingsEmail").value.trim();

    if (!name) {
        if (alertEl) {
            alertEl.textContent = "Owner full name is required.";
            alertEl.classList.remove("hidden");
        }
        return;
    }

    try {
        const res = await ownerApi("/auth/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            alert(data.message || "Profile updated successfully.");
            initOwnerConsolePage();
        } else {
            if (alertEl) {
                alertEl.textContent = data.error || "Failed to update profile.";
                alertEl.classList.remove("hidden");
            }
        }
    } catch (err) {
        if (alertEl) {
            alertEl.textContent = "Server connection error.";
            alertEl.classList.remove("hidden");
        }
    }
}

// Settings: Change Username
async function handleOwnerChangeUsername(event) {
    event.preventDefault();
    const alertEl = document.getElementById("settingsUsernameAlert");
    if (alertEl) alertEl.classList.add("hidden");

    const newUsername = document.getElementById("settingsNewUsername").value.trim();
    const currentPassword = document.getElementById("settingsUsernameCurrentPassword").value;

    if (!newUsername || !currentPassword) {
        if (alertEl) {
            alertEl.textContent = "Both new username and current password are required.";
            alertEl.classList.remove("hidden");
        }
        return;
    }

    try {
        const res = await ownerApi("/auth/username", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newUsername })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            alert(data.message || "Username changed successfully. Please log in again.");
            clearOwnerSession();
            window.location.replace("login.html");
        } else {
            if (alertEl) {
                alertEl.textContent = data.error || "Failed to change username.";
                alertEl.classList.remove("hidden");
            }
        }
    } catch (err) {
        if (alertEl) {
            alertEl.textContent = "Server connection error.";
            alertEl.classList.remove("hidden");
        }
    }
}

// Settings: Change Password
async function handleOwnerChangePassword(event) {
    event.preventDefault();
    const alertEl = document.getElementById("settingsPasswordAlert");
    if (alertEl) alertEl.classList.add("hidden");

    const currentPassword = document.getElementById("settingsCurrentPassword").value;
    const newPassword = document.getElementById("settingsNewPassword").value;
    const confirmPassword = document.getElementById("settingsConfirmNewPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        if (alertEl) {
            alertEl.textContent = "All password fields are required.";
            alertEl.classList.remove("hidden");
        }
        return;
    }

    if (newPassword !== confirmPassword) {
        if (alertEl) {
            alertEl.textContent = "New Password and Confirm Password do not match.";
            alertEl.classList.remove("hidden");
        }
        return;
    }

    if (newPassword.length < 8) {
        if (alertEl) {
            alertEl.textContent = "New password must be at least 8 characters long.";
            alertEl.classList.remove("hidden");
        }
        return;
    }

    try {
        const res = await ownerApi("/auth/password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            alert(data.message || "Password changed successfully. Please log in again.");
            clearOwnerSession();
            window.location.replace("login.html");
        } else {
            if (alertEl) {
                alertEl.textContent = data.error || "Failed to change password.";
                alertEl.classList.remove("hidden");
            }
        }
    } catch (err) {
        if (alertEl) {
            alertEl.textContent = "Server connection error.";
            alertEl.classList.remove("hidden");
        }
    }
}

let currentActiveRequestDetails = null;

function formatIndianDateTime(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Pending': return 'badge-status-pending';
        case 'Contacted': return 'badge-status-contacted';
        case 'Available': return 'badge-status-available';
        case 'Not Available': return 'badge-status-not-available';
        case 'Completed': return 'badge-status-completed';
        case 'Cancelled': return 'badge-status-cancelled';
        default: return 'badge-status-pending';
    }
}

async function fetchRequestCounts() {
    try {
        const res = await ownerApi("/requests/spare-parts/count");
        if (res.ok) {
            const data = await res.json();
            const countEl = document.getElementById("sidebarRequestsCount");
            if (countEl) {
                countEl.textContent = data.pendingCount !== undefined ? data.pendingCount : 0;
            }
        }
    } catch (err) {
        console.warn("Could not fetch request count:", err);
    }
}

async function loadAndRenderOwnerRequests() {
    const tbody = document.getElementById("ownerRequestsTableBody");
    const mobileCards = document.getElementById("ownerRequestsMobileCards");
    const searchInp = document.getElementById("ownerReqSearchInput");
    const vehicleFilter = document.getElementById("ownerReqVehicleFilter");

    const searchVal = searchInp ? searchInp.value.trim() : "";
    const vehVal = vehicleFilter ? vehicleFilter.value : "All";

    // Fetch live pending count for sidebar badge
    fetchRequestCounts();

    try {
        const queryParams = new URLSearchParams({
            status: activeReqStatusFilter,
            vehicle: vehVal,
            search: searchVal
        });

        const res = await ownerApi(`/requests/spare-parts?${queryParams.toString()}`);
        if (res.ok) {
            const data = await res.json();
            const requests = data.data || [];

            if (tbody) {
                tbody.innerHTML = "";
                if (requests.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: #94a3b8; padding: 24px;">No customer requests found matching criteria.</td></tr>`;
                } else {
                    requests.forEach(req => {
                        const formattedDate = formatIndianDateTime(req.created_at);
                        const badgeClass = getStatusBadgeClass(req.status);
                        const tr = document.createElement("tr");

                        tr.innerHTML = `
                            <td><strong style="color: #0f172a;">#${req.id}</strong></td>
                            <td><strong>${escapeHtml(req.customer_name)}</strong></td>
                            <td>
                                <a href="tel:${req.mobile_number}" class="text-gray" style="font-size: 0.85rem; font-weight: 600;">
                                    <i class="fa-solid fa-phone"></i> ${req.mobile_number}
                                </a>
                            </td>
                            <td><strong class="text-red">${escapeHtml(req.part_name)}</strong></td>
                            <td><span class="badge-tag">${escapeHtml(req.vehicle_type)}</span></td>
                            <td><small class="text-gray">${escapeHtml(req.vehicle_model || 'N/A')}</small></td>
                            <td><strong>${req.quantity || 1}</strong></td>
                            <td><small class="text-gray" style="white-space: nowrap;">${formattedDate}</small></td>
                            <td>
                                <select class="req-status-select ${badgeClass}" onchange="updateRequestStatus(${req.id}, this.value)">
                                    <option value="Pending" ${req.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Contacted" ${req.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                                    <option value="Available" ${req.status === 'Available' ? 'selected' : ''}>Available</option>
                                    <option value="Not Available" ${req.status === 'Not Available' ? 'selected' : ''}>Not Available</option>
                                    <option value="Completed" ${req.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                    <option value="Cancelled" ${req.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>
                                <div style="display: flex; gap: 6px; align-items: center;">
                                    <button onclick="openRequestDetailsModal(${req.id})" class="btn btn-red btn-pill" style="padding: 4px 10px !important; font-size: 0.78rem !important;" title="View Details">
                                        <i class="fa-solid fa-eye"></i> View
                                    </button>
                                    <a href="tel:${req.mobile_number}" class="btn-req-call" title="Call Customer ${req.mobile_number}">
                                        <i class="fa-solid fa-phone"></i>
                                    </a>
                                    <a href="https://wa.me/91${req.mobile_number}?text=${encodeURIComponent(`Hello ${req.customer_name}, regarding your spare part request #${req.id} for ${req.part_name} at Sai Srinivasa Automobiles...`)}" target="_blank" class="btn-req-call" style="background: #dcfce7; color: #16a34a; border-color: #86efac;" title="WhatsApp Customer">
                                        <i class="fa-brands fa-whatsapp"></i>
                                    </a>
                                </div>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }

            if (mobileCards) {
                mobileCards.innerHTML = "";
                if (requests.length === 0) {
                    mobileCards.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 20px;">No customer requests found matching criteria.</div>`;
                } else {
                    requests.forEach(req => {
                        const formattedDate = formatIndianDateTime(req.created_at);
                        const badgeClass = getStatusBadgeClass(req.status);
                        const card = document.createElement("div");
                        card.className = "owner-card-item-mobile";

                        card.innerHTML = `
                            <div class="owner-card-item-top flex-between">
                                <div>
                                    <span class="badge-req" style="font-size: 0.8rem; background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 4px;">#${req.id}</span>
                                    <strong style="font-size: 1rem; margin-left: 6px;">${escapeHtml(req.customer_name)}</strong>
                                </div>
                                <span class="badge-tag">${escapeHtml(req.vehicle_type)}</span>
                            </div>
                            <div style="font-size: 0.88rem; color: #334155;">
                                <div><strong class="text-red">Part:</strong> ${escapeHtml(req.part_name)} (Qty: ${req.quantity || 1})</div>
                                <small class="text-gray">Model: ${escapeHtml(req.vehicle_model || 'N/A')}</small><br>
                                <small class="text-gray"><i class="fa-regular fa-clock"></i> ${formattedDate}</small>
                            </div>
                            <div class="owner-card-item-bottom flex-between align-center" style="gap: 8px; margin-top: 5px;">
                                <select class="req-status-select ${badgeClass}" onchange="updateRequestStatus(${req.id}, this.value)" style="flex: 1;">
                                    <option value="Pending" ${req.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Contacted" ${req.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                                    <option value="Available" ${req.status === 'Available' ? 'selected' : ''}>Available</option>
                                    <option value="Not Available" ${req.status === 'Not Available' ? 'selected' : ''}>Not Available</option>
                                    <option value="Completed" ${req.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                    <option value="Cancelled" ${req.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                                <div style="display: flex; gap: 6px;">
                                    <button onclick="openRequestDetailsModal(${req.id})" class="btn btn-red btn-pill" style="padding: 4px 10px !important; font-size: 0.78rem !important;">
                                        View
                                    </button>
                                    <a href="tel:${req.mobile_number}" class="btn-req-call">
                                        <i class="fa-solid fa-phone"></i>
                                    </a>
                                </div>
                            </div>
                        `;
                        mobileCards.appendChild(card);
                    });
                }
            }
        }
    } catch (err) {
        console.warn("Could not fetch requests:", err);
    }
}

async function updateRequestStatus(reqId, newStatus) {
    try {
        const res = await ownerApi(`/requests/spare-parts/${reqId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            renderOwnerConsoleData();
            fetchRequestCounts();
            if (currentActiveRequestDetails && currentActiveRequestDetails.id === reqId) {
                currentActiveRequestDetails.status = newStatus;
                const modalStatusSelect = document.getElementById("modalReqStatusSelect");
                if (modalStatusSelect) modalStatusSelect.value = newStatus;
                const badgeEl = document.getElementById("modalReqStatusBadge");
                if (badgeEl) {
                    badgeEl.className = `badge-status ${getStatusBadgeClass(newStatus)}`;
                    badgeEl.textContent = newStatus;
                }
            }
        } else {
            alert("Failed to update request status.");
        }
    } catch (err) {
        alert("Server connection error updating request status.");
    }
}

async function openRequestDetailsModal(reqId) {
    try {
        const res = await ownerApi(`/requests/spare-parts/${reqId}`);
        if (!res.ok) {
            alert("Could not load request details.");
            return;
        }
        const resData = await res.json();
        const req = resData.data;
        if (!req) return;

        currentActiveRequestDetails = req;

        document.getElementById("modalReqIdBadge").textContent = `#${req.id}`;
        document.getElementById("modalReqCustomerName").textContent = req.customer_name;
        document.getElementById("modalReqMobileNumber").textContent = req.mobile_number;
        document.getElementById("modalReqPartName").textContent = req.part_name;
        document.getElementById("modalReqVehicleType").textContent = req.vehicle_type;
        document.getElementById("modalReqVehicleModel").textContent = req.vehicle_model || "N/A";
        document.getElementById("modalReqQuantity").textContent = req.quantity || 1;
        document.getElementById("modalReqDescription").textContent = req.description || "No additional description provided.";

        const formattedCreated = formatIndianDateTime(req.created_at);
        document.getElementById("modalReqCreatedDate").textContent = formattedCreated;

        const modalStatusSelect = document.getElementById("modalReqStatusSelect");
        if (modalStatusSelect) modalStatusSelect.value = req.status;

        const badgeEl = document.getElementById("modalReqStatusBadge");
        if (badgeEl) {
            badgeEl.className = `badge-status ${getStatusBadgeClass(req.status)}`;
            badgeEl.textContent = req.status;
        }

        const imgWrap = document.getElementById("modalReqImgWrap");
        const imgEl = document.getElementById("modalReqImage");
        if (req.image_url && imgWrap && imgEl) {
            imgEl.src = req.image_url;
            imgWrap.classList.remove("hidden");
        } else if (imgWrap) {
            imgWrap.classList.add("hidden");
        }

        const callBtn = document.getElementById("modalReqCallBtn");
        if (callBtn) callBtn.href = `tel:${req.mobile_number}`;

        const waBtn = document.getElementById("modalReqWaBtn");
        if (waBtn) {
            const msg = `Hello ${req.customer_name}, regarding your spare part request #${req.id} for ${req.part_name} at Sai Srinivasa Automobiles...`;
            waBtn.href = `https://wa.me/91${req.mobile_number}?text=${encodeURIComponent(msg)}`;
        }

        const modal = document.getElementById("requestDetailsModal");
        if (modal) modal.classList.remove("hidden");

    } catch (err) {
        alert("Failed to load request details.");
    }
}

function closeRequestDetailsModal() {
    const modal = document.getElementById("requestDetailsModal");
    if (modal) modal.classList.add("hidden");
    currentActiveRequestDetails = null;
}

function handleModalStatusChange(newStatus) {
    if (currentActiveRequestDetails) {
        updateRequestStatus(currentActiveRequestDetails.id, newStatus);
    }
}

async function confirmDeleteCurrentRequest() {
    if (!currentActiveRequestDetails) return;
    const reqId = currentActiveRequestDetails.id;
    if (!confirm(`Are you sure you want to delete spare part request #${reqId}?`)) return;

    try {
        const res = await ownerApi(`/requests/spare-parts/${reqId}`, {
            method: "DELETE"
        });
        if (res.ok) {
            closeRequestDetailsModal();
            renderOwnerConsoleData();
            fetchRequestCounts();
        } else {
            alert("Failed to delete request.");
        }
    } catch (err) {
        alert("Server error deleting request.");
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function filterRequestsByStatus(status, btnEl) {
    activeReqStatusFilter = status;
    if (btnEl) {
        document.querySelectorAll(".req-tab").forEach(t => t.classList.remove("active"));
        btnEl.classList.add("active");
    }
    renderOwnerConsoleData();
}

function setupOwnerDragAndDrop() {
    const dropzone = document.getElementById("ownerDropzone");
    const fileInp = document.getElementById("ownerFileInp");
    if (!dropzone || !fileInp) return;

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
        if (files && files[0]) handleOwnerImageFile(files[0]);
    });

    dropzone.addEventListener('click', (e) => {
        if (e.target !== fileInp) fileInp.click();
    });

    fileInp.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) handleOwnerImageFile(e.target.files[0]);
    });
}

function handleOwnerImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) { setOwnerImage(e.target.result); };
    reader.readAsDataURL(file);
}

function setOwnerImage(src) {
    const previewWrap = document.getElementById("ownerPreviewWrap");
    const previewImg = document.getElementById("ownerPreviewImg");
    const dataInput = document.getElementById("ownerImageData");
    const dropPrompt = document.getElementById("ownerDropPrompt");

    if (dataInput) dataInput.value = src;
    if (previewImg) previewImg.src = src;
    if (previewWrap) previewWrap.classList.remove("hidden");
    if (dropPrompt) dropPrompt.classList.add("hidden");
}

function removeOwnerImage() {
    const previewWrap = document.getElementById("ownerPreviewWrap");
    const previewImg = document.getElementById("ownerPreviewImg");
    const dataInput = document.getElementById("ownerImageData");
    const dropPrompt = document.getElementById("ownerDropPrompt");
    const fileInp = document.getElementById("ownerFileInp");

    if (dataInput) dataInput.value = "";
    if (previewImg) previewImg.src = "";
    if (fileInp) fileInp.value = "";
    if (previewWrap) previewWrap.classList.add("hidden");
    if (dropPrompt) dropPrompt.classList.remove("hidden");
}

function openPartModal(partId) {
    const part = sparePartsData.find(p => String(p.id) === String(partId));
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

function filterGallery(category, clickedTab = null) {
    const tabs = document.querySelectorAll(".gallery-tab");
    tabs.forEach(t => t.classList.remove("active"));
    const target = clickedTab || (typeof event !== "undefined" ? event.target : null);
    if (target) target.classList.add("active");

    const items = document.querySelectorAll(".gallery-item");
    items.forEach(item => {
        const cat = item.getAttribute("data-category");
        if (category === "all" || cat === category) item.style.display = "block";
        else item.style.display = "none";
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

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

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
