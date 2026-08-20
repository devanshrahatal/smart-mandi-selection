/**
 * Multi-lingual localization dictionaries for Smart Mandi Portal.
 * Supported languages: English (en), Hindi (hi), Marathi (mr), Gujarati (gu).
 */

export const TRANSLATIONS = {
  en: {
    // Brand & Nav
    appName: "Smart Mandi",
    adminBadge: "ADMIN",
    landingPageLink: "Landing Page",
    overviewTab: "Overview",
    priceTrendsTab: "Price Trends",
    costParamsTab: "Cost Parameters",
    mapTab: "Profit Map",
    poolingTab: "Kisan Pool",
    voiceDemoBtn: "Voice AI Demo",
    adminDashboardBtn: "Admin Dashboard →",
    signInBtn: "Sign In",
    signOutBtn: "Sign Out",
    swaggerDocsBtn: "Swagger API Docs ↗",
    selectLang: "Language",

    // Hero
    heroTag: "Smart India Hackathon 2026",
    heroTitleLine1: "The highest price mandi",
    heroTitleLine2: "is rarely the most profitable.",
    heroSubtitle: "Smart Mandi calculates real take-home profit after transport, commission, loading, and transit spoilage are deducted across all candidate mandis.",
    openAdminBtn: "Open Admin Dashboard →",

    // Stats
    statMandis: "Mandis Tracked",
    statFarmers: "Active Farmers",
    statSavings: "Avg. Savings per Quintal",
    statQueries: "Queries Today",

    // Scenario Table
    scenarioTag: "Live Scenario",
    scenarioTitle: "Why raw price is misleading",
    scenarioDesc: "Farmer in Jaipur selling 20 quintals of tomatoes. Azadpur & Vashi offer higher gross prices — but after transport and commission, nearby Kota delivers ₹169/q more in net cash take-home.",
    thMandi: "Mandi",
    thGrossPrice: "Gross Price",
    thTransport: "Transport",
    thCommission: "Commission",
    thLoading: "Loading",
    thSpoilage: "Spoilage",
    thNetProfit: "Net Profit",
    badgeBest: "Best",

    // Features
    featuresTag: "Architecture",
    featuresTitle: "Platform Intelligence Engine",
    f1Title: "Net Profit Ranking",
    f1Desc: "Every mandi is ranked by actual take-home after transport, commission, loading, and spoilage costs are deducted.",
    f2Title: "Live Distance Matrix",
    f2Desc: "Real-time road distance and travel time from the farmer's location to each candidate mandi, powered by Google Maps.",
    f3Title: "Spoilage Intelligence",
    f3Desc: "Perishable crops lose value in transit. Our engine adjusts recommendations based on crop type and travel hours.",
    f4Title: "WhatsApp-First Interaction",
    f4Desc: "Farmers send a WhatsApp message, share location, name their crop — and get ranked mandi recommendations in seconds.",

    // Dashboard Overview
    overviewTitle: "Platform Intelligence Overview",
    overviewSubtitle: "Real-time farmer query volume, mandi recommendations, and price optimization metrics.",
    refreshBtn: "🔄 Refresh",
    exportCsvBtn: "Export Report (CSV)",
    topCropsTitle: "Most Queried Crops",
    topMandisTitle: "Top Recommended Mandis",
    liveStreamTitle: "Live Query Stream",
    liveStreamSubtitle: "Real-time audit log of incoming WhatsApp farmer queries and recommendations.",

    // Price Trends
    trendsTitle: "Mandi Price Trends & Intelligence",
    trendsSubtitle: "Historical 30-day commodity price trajectory, volatility, and market cost parameters.",
    selectMandiLabel: "Select Mandi",
    selectCropLabel: "Select Crop",
    kpiModalPrice: "Current Modal Price",
    kpiHigh: "30-Day High",
    kpiLow: "30-Day Low",
    kpiPerishability: "Perishability Index",

    // Cost Parameters
    costTitle: "Mandi Cost Parameters",
    costSubtitle: "Configure commission percentages, loading/unloading fees, and transport rates per mandi.",
    editCostsBtn: "Edit Costs",

    // Profit Map
    mapTitle: "Geospatial Mandi Net Profit Map",
    mapSubtitle: "Visual comparison of farmer dispatch location, candidate APMCs, and road haulage economics.",
    mapOriginLabel: "Farmer Origin Location",
    mapCropLabel: "Crop",
    mapQuantityLabel: "Quantity (Quintals)",
    mapBestMandiBadge: "Optimal Profit Route",
    mapDistanceLabel: "Distance",
    mapNetProfitLabel: "Net Take-Home",

    // Kisan Pool
    poolTitle: "Kisan Pool — Shared Agricultural Logistics",
    poolSubtitle: "Group smallholder farmer harvests (5-25q) into pooled commercial truckloads to slash freight costs by 45-60%.",
    poolActiveBatches: "Live Village Aggregation Batches",
    poolCalculatorTitle: "Shared Freight Savings Calculator",
    poolSoloQty: "Your Harvest Quantity (Quintals)",
    poolTotalQty: "Total Pooled Village Load (Quintals)",
    poolDistance: "Transport Distance (KM)",
    poolDestination: "Destination Mandi",
    poolCalculateBtn: "Calculate Shared Savings",
    poolMatchedVehicle: "Optimal Vehicle Matched",
    poolSoloCost: "Solo Vehicle Cost",
    poolPooledCost: "Pooled Share Cost",
    poolSavingsTotal: "Your Net Cash Savings",
  },

  hi: {
    // Brand & Nav
    appName: "स्मार्ट मंडी",
    adminBadge: "एडमिन",
    landingPageLink: "मुख्य पृष्ठ",
    overviewTab: "डैशबोर्ड अवलोकन",
    priceTrendsTab: "मंडी भाव रुझान",
    costParamsTab: "खर्च दरें (कमीशन/भाड़ा)",
    mapTab: "मुनाफा नक्शा",
    poolingTab: "किसान पूल (साझा गाड़ी)",
    voiceDemoBtn: "बोलकर पूछें (Voice AI)",
    adminDashboardBtn: "एडमिन पोर्टल →",
    signInBtn: "लॉग इन करें",
    signOutBtn: "लॉग आउट",
    swaggerDocsBtn: "एपीआई दस्तावेज़ ↗",
    selectLang: "भाषा बदलें",

    // Hero
    heroTag: "स्मार्ट इंडिया हैकाथॉन 2026",
    heroTitleLine1: "सबसे ऊंचे भाव वाली मंडी में",
    heroTitleLine2: "हमेशा सबसे ज्यादा मुनाफा नहीं होता।",
    heroSubtitle: "स्मार्ट मंडी सिर्फ कच्चा भाव नहीं, बल्कि गाड़ी भाड़ा, मंडी कमीशन, पल्लेदारी और रास्ते में फसल खराबी घटाकर 'असली शुद्ध मुनाफा' दिखाती है।",
    openAdminBtn: "एडमिन डैशबोर्ड खोलें →",

    // Stats
    statMandis: "सक्रिय मंडियां",
    statFarmers: "लाभार्थी किसान",
    statSavings: "औसत शुद्ध बचत (प्रति क्विंटल)",
    statQueries: "आज के व्हाट्सएप प्रश्न",

    // Scenario Table
    scenarioTag: "वास्तविक उदाहरण",
    scenarioTitle: "सिर्फ मंडी भाव देखना नुकसानदेह क्यों है?",
    scenarioDesc: "जयपुर का किसान 20 क्विंटल टमाटर बेचना चाहता है। दिल्ली (आजादपुर) का भाव अधिक दिखता है, परंतु भाड़ा और कमीशन कटने के बाद कोटा मंडी में प्रति क्विंटल ₹169 अधिक शुद्ध कमाई होती है।",
    thMandi: "मंडी का नाम",
    thGrossPrice: "मंडी भाव",
    thTransport: "गाड़ी भाड़ा",
    thCommission: "कमीशन",
    thLoading: "पल्लेदारी",
    thSpoilage: "खराबी नुकसान",
    thNetProfit: "शुद्ध कमाई (जेब में)",
    badgeBest: "सर्वश्रेष्ठ",

    // Features
    featuresTag: "तकनीकी संरचना",
    featuresTitle: "स्मार्ट निर्णय इंजन",
    f1Title: "शुद्ध मुनाफा रैंकिंग",
    f1Desc: "भाड़ा, आढ़त और रास्ते के नुकसान को घटाकर वास्तविक शुद्ध मुनाफे के आधार पर मंडियों की वरीयता तय की जाती है।",
    f2Title: "गूगल मैप्स दूरी गणना",
    f2Desc: "किसान के खेत से मंडी तक की सटीक सड़क दूरी और यात्रा समय की वास्तविक गणना।",
    f3Title: "फसल खराबी (पेरिशेबिलिटी) मॉडल",
    f3Desc: "टमाटर जैसी नाजुक फसलों के लंबे सफर में होने वाले नुकसान की सटीक कटौती।",
    f4Title: "व्हाट्सएप चैटबॉट सुविधा",
    f4Desc: "किसान बिना किसी ऐप डाउनलोड के सीधे व्हाट्सएप पर लोकेशन और फसल भेजकर तुरंत सही मंडी जान सकते हैं।",

    // Dashboard Overview
    overviewTitle: "मंडी प्लेटफॉर्म इंटेलिजेंस",
    overviewSubtitle: "किसानों द्वारा पूछे गए प्रश्न, शीर्ष अनुशंसित मंडियां और मुनाफा विश्लेषण।",
    refreshBtn: "🔄 रीफ्रेश करें",
    exportCsvBtn: "रिपोर्ट डाउनलोड करें (CSV)",
    topCropsTitle: "सबसे ज्यादा खोडी गई फसलें",
    topMandisTitle: "सर्वश्रेष्ठ अनुशंसित मंडियां",
    liveStreamTitle: "लाइव किसान प्रश्न ऑडिट स्ट्रीम",
    liveStreamSubtitle: "व्हाट्सएप चैटबॉट पर आ रहे किसान प्रश्नों का लाइव विवरण।",

    // Price Trends
    trendsTitle: "30-दिवसीय मंडी भाव एवं रुझान",
    trendsSubtitle: "विगत 30 दिनों का दैनिक मॉडल भाव, उतार-चढ़ाव और खर्च संरचना।",
    selectMandiLabel: "मंडी चुनें",
    selectCropLabel: "फसल चुनें",
    kpiModalPrice: "वर्तमान मॉडल भाव",
    kpiHigh: "30 दिनों का उच्चतम भाव",
    kpiLow: "30 दिनों का न्यूनतम भाव",
    kpiPerishability: "खराबी संवेदनशीलता सूचकांक",

    // Cost Parameters
    costTitle: "मंडी कमीशन एवं भाड़ा दरें",
    costSubtitle: "प्रत्येक मंडी के कमीशन प्रतिशत, लोडिंग/अनलोडिंग शुल्क और प्रति किमी परिवहन दर का प्रबंधन।",
    editCostsBtn: "दरें बदलें",

    // Profit Map
    mapTitle: "भू-स्थानिक शुद्ध मुनाफा नक्शा (Map)",
    mapSubtitle: "किसान के स्थान से विभिन्न मंडियों की दूरी, सड़क मार्ग और शुद्ध मुनाफे का दृश्य विश्लेषण।",
    mapOriginLabel: "किसान का स्थान",
    mapCropLabel: "फसल",
    mapQuantityLabel: "मात्रा (क्विंटल)",
    mapBestMandiBadge: "सर्वाधिक मुनाफे वाला रूट",
    mapDistanceLabel: "दूरी",
    mapNetProfitLabel: "शुद्ध कमाई",

    // Kisan Pool
    poolTitle: "किसान पूल — साझा गाड़ी एवं परिवहन बचत",
    poolSubtitle: "छोटे किसानों (5-25 क्विंटल) का माल एक साथ जोड़कर ट्रक का पूरा भाड़ा 45-60% तक कम करें।",
    poolActiveBatches: "सक्रिय ग्रामीण परिवहन समूह (Active Pools)",
    poolCalculatorTitle: "साझा भाड़ा बचत कैलकुलेटर",
    poolSoloQty: "आपकी फसल मात्रा (क्विंटल)",
    poolTotalQty: "कुल साझा मात्रा (क्विंटल)",
    poolDistance: "परिवहन दूरी (किमी)",
    poolDestination: "मंडी का नाम",
    poolCalculateBtn: "बचत की गणना करें",
    poolMatchedVehicle: "उपयुक्त वाहन",
    poolSoloCost: "अकेले गाड़ी का खर्च",
    poolPooledCost: "साझा गाड़ी में आपका हिस्सा",
    poolSavingsTotal: "आपकी कुल शुद्ध नकद बचत",
  },

  mr: {
    // Brand & Nav
    appName: "स्मार्ट मंडी",
    adminBadge: "प्रशासक",
    landingPageLink: "मुख्य पान",
    overviewTab: "डॅशबोर्ड आढावा",
    priceTrendsTab: "बाजारभाव कल",
    costParamsTab: "खर्च व कमिशन दर",
    mapTab: "नफा नकाशा",
    poolingTab: "किसान पूल (एकत्रित वाहतूक)",
    voiceDemoBtn: "आवाजाद्वारे विचारा (Voice AI)",
    adminDashboardBtn: "प्रशासक डॅशबोर्ड →",
    signInBtn: "साइन इन करा",
    signOutBtn: "बाहेर पडा",
    swaggerDocsBtn: "API माहिती ↗",
    selectLang: "भाषा निवडा",

    // Hero
    heroTag: "स्मार्ट इंडिया हॅकाथॉन 2026",
    heroTitleLine1: "सर्वात जास्त बाजारभाव असलेली मंडी",
    heroTitleLine2: "नेहमीच फायदेशीर नसते.",
    heroSubtitle: "स्मार्ट मंडी केवळ बाजारभाव नाही, तर वाहतूक भाडे, आडत (कमिशन), हमाली आणि नासाडी वजा करून 'हातात मिळणारा खरा निव्वळ नफा' मोजते.",
    openAdminBtn: "डॅशबोर्ड उघडा →",

    // Stats
    statMandis: "बाजार समित्या",
    statFarmers: "नोंदणीकृत शेतकरी",
    statSavings: "सरासरी निव्वळ नफा वाढ (प्रति क्विंटल)",
    statQueries: "आजचे व्हॉट्सॲप प्रश्न",

    // Scenario Table
    scenarioTag: "प्रत्यक्ष उदाहरण",
    scenarioTitle: "केवळ भाव पाहणे कसे तोट्याचे ठरते?",
    scenarioDesc: "शेतकऱ्याला २० क्विंटल माल विकायचा आहे. लांबच्या मार्केटमध्ये भाव जास्त दिसतो, पण वाहतूक आणि कमिशन कापून जवळच्या मार्केटमध्ये प्रति क्विंटल ₹१६९ जास्त नफा हातात मिळतो.",
    thMandi: "बाजार समिती",
    thGrossPrice: "बाजारभाव",
    thTransport: "वाहतूक भाडे",
    thCommission: "आडत (कमिशन)",
    thLoading: "हमाली/तोलाई",
    thSpoilage: "नासाडी नुकसान",
    thNetProfit: "निव्वळ नफा (हातात)",
    badgeBest: "सर्वोत्तम",

    // Features
    featuresTag: "कार्यपद्धती",
    featuresTitle: "स्मार्ट नफा निर्णय प्रणाली",
    f1Title: "निव्वळ नफा क्रमवारी",
    f1Desc: "वाहतूक, कमिशन आणि मालाची नासाडी वजा करून सर्वाधिक नफा देणाऱ्या बाजार समितीची शिफारस.",
    f2Title: "थेट अंतर व वेळ मोजणी",
    f2Desc: "गुगल मॅप्सद्वारे शेतातून बाजार समितीपर्यंतचे अचूक अंतर आणि प्रवासाचा वेळ.",
    f3Title: "नासाडी नियंत्रण मॉडेल",
    f3Desc: "नाशवंत शेतमालाच्या प्रवासातील नुकसान लक्षात घेऊन अचूक नफा मोजणी.",
    f4Title: "व्हॉट्सॲप बॉट सुविधा",
    f4Desc: "कोणतेही ॲप न वापरता थेट व्हॉट्सॲपवर लोकेशन पाठवून फायदेशीर बाजार समितीची माहिती मिळवा.",

    // Dashboard Overview
    overviewTitle: "प्लॅटफॉर्म इंटेलिजेंस आढावा",
    overviewSubtitle: "शेतकऱ्यांचे प्रश्न, पिकांची मागणी आणि नफा वाढीचे आकडे.",
    refreshBtn: "🔄 ताजे करा",
    exportCsvBtn: "अहवाल डाउनलोड करा (CSV)",
    topCropsTitle: "सर्वाधिक विचारलेली पिके",
    topMandisTitle: "अव्वल शिफारस बाजार समित्या",
    liveStreamTitle: "थेट शेतकरी प्रश्न स्ट्रीम",
    liveStreamSubtitle: "व्हॉट्सॲपवरून येणाऱ्या शेतकरी प्रश्नांचे थेट ऑडिट.",

    // Price Trends
    trendsTitle: "३० दिवसांचा बाजारभाव कल",
    trendsSubtitle: "मागील ३० दिवसांतील दैनंदिन बाजारभाव आणि चढ-उतार.",
    selectMandiLabel: "बाजार समिती निवडा",
    selectCropLabel: "पीक निवडा",
    kpiModalPrice: "आजचा सरासरी भाव",
    kpiHigh: "३० दिवसांतील सर्वोच्च भाव",
    kpiLow: "३० दिवसांतील नीचांकी भाव",
    kpiPerishability: "नाशवंतता निर्देशांक",

    // Cost Parameters
    costTitle: "कमिशन व वाहतूक दर व्यवस्थापन",
    costSubtitle: "प्रत्येक बाजार समितीचे कमिशन %, हमाली दर आणि वाहतूक दर अद्ययावत करा.",
    editCostsBtn: "दर बदला",

    // Profit Map
    mapTitle: "भौगोलिक निव्वळ नफा नकाशा (Map)",
    mapSubtitle: "शेतकऱ्याच्या गावापासून विविध बाजार समित्यांचे अंतर, मार्ग व प्रत्यक्ष निव्वळ नफा.",
    mapOriginLabel: "शेतकऱ्याचे ठिकाण",
    mapCropLabel: "शेतमाल/पीक",
    mapQuantityLabel: "प्रमाण (क्विंटल)",
    mapBestMandiBadge: "सर्वाधिक फायदेशीर मार्ग",
    mapDistanceLabel: "अंतर",
    mapNetProfitLabel: "हातात मिळणारा निव्वळ नफा",

    // Kisan Pool
    poolTitle: "किसान पूल — एकत्रित शेतमाल वाहतूक व बचत",
    poolSubtitle: "अल्पभूधारक शेतकऱ्यांचा माल एकत्र करून वाहतूक खर्च ४५-६०% कमी करा.",
    poolActiveBatches: "सक्रिय गाव पातळीवरील वाहतूक गट",
    poolCalculatorTitle: "एकत्रित वाहतूक बचत कॅल्क्युलेटर",
    poolSoloQty: "तुमचा शेतमाल (क्विंटल)",
    poolTotalQty: "एकूण एकत्रित शेतमाल (क्विंटल)",
    poolDistance: "वाहतूक अंतर (किमी)",
    poolDestination: "बाजार समितीचे नाव",
    poolCalculateBtn: "बचत मोजा",
    poolMatchedVehicle: "योग्य वाहन",
    poolSoloCost: "एकट्या वाहनाचा खर्च",
    poolPooledCost: "एकत्रित वाहनातील तुमचा हिस्सा",
    poolSavingsTotal: "तुमची प्रत्यक्ष नकद बचत",
  },

  gu: {
    // Brand & Nav
    appName: "સ્માર્ટ મંડી",
    adminBadge: "એડમિન",
    landingPageLink: "મુખ્ય પૃષ્ઠ",
    overviewTab: "ડેશબોર્ડ ઓવરવ્યૂ",
    priceTrendsTab: "ભાવના વલણો",
    costParamsTab: "ખર્ચ અને કમિશન",
    mapTab: "નફાનો નકશો",
    poolingTab: "કિસાન પૂલ (શેર્ડ વાહન)",
    voiceDemoBtn: "બોલીને પૂછો (Voice AI)",
    adminDashboardBtn: "એડમિન પોર્ટલ →",
    signInBtn: "સાઇન ઇન",
    signOutBtn: "સાઇન આઉટ",
    swaggerDocsBtn: "API દસ્તાવેજ ↗",
    selectLang: "ભાષા પસંદ કરો",

    // Hero
    heroTag: "સ્માર્ટ ઇન્ડિયા હેકાથોન 2026",
    heroTitleLine1: "સૌથી ઊંચા ભાવવાળા યાર્ડમાં",
    heroTitleLine2: "હંમેશા સૌથી વધુ નફો નથી મળતો.",
    heroSubtitle: "સ્માર્ટ મંડી માત્ર બજાર ભાવ નહીં, પણ વાહન ભાડું, કમિશન, મજૂરી અને બગાડ બાદ કરીને 'હાથમાં આવતો ચોખ્ખો નફો' બતાવે છે.",
    openAdminBtn: "એડમિન ડેશબોર્ડ ખોલો →",

    // Stats
    statMandis: "માર્કેટિંગ યાર્ડ",
    statFarmers: "સક્રિય ખેડૂતો",
    statSavings: "સરેરાશ ચોખ્ખી બચત (પ્રતિ ક્વિન્ટલ)",
    statQueries: "આજના વોટ્સએપ પ્રશ્નો",

    // Scenario Table
    scenarioTag: "લાઈવ ઉદાહરણ",
    scenarioTitle: "માત્ર કાચો ભાવ જોવો કેમ નુકસાનકારક છે?",
    scenarioDesc: "ખેડૂતને ૨૦ ક્વિન્ટલ ટામેટા વેચવા છે. દૂરના માર્કેટમાં ભાવ વધુ દેખાય છે, પણ ભાડું અને કમિશન કપાતા નજીકના યાર્ડમાં પ્રતિ ક્વિન્ટલ ₹૧૬૯ વધુ નફો મળે છે.",
    thMandi: "માર્કેટિંગ યાર્ડ",
    thGrossPrice: "બજાર ભાવ",
    thTransport: "વાહન ભાડું",
    thCommission: "કમિશન",
    thLoading: "મજૂરી",
    thSpoilage: "બગાડ નુકસાન",
    thNetProfit: "ચોખ્ખો નફો (હાથમાં)",
    badgeBest: "શ્રેષ્ઠ",

    // Features
    featuresTag: "ટેકનિકલ સિસ્ટમ",
    featuresTitle: "સ્માર્ટ નફો એન્જિન",
    f1Title: "ચોખ્ખો નફો રેન્કિંગ",
    f1Desc: "ભાડું, કમિશન અને બગાડ બાદ કર્યા પછી હાથમાં આવતી ચોખ્ખી રકમના આધારે યાર્ડની ભલામણ.",
    f2Title: "ગૂગલ મેપ્સ અંતર ગણતરી",
    f2Desc: "ખેડૂતના સ્થાનથી યાર્ડ સુધીનું સચોટ અંતર અને મુસાફરીનો સમય.",
    f3Title: "બગાડ નિયંત્રણ મોડેલ",
    f3Desc: "નાશવંત પાકોના લાંબા પ્રવાસમાં થતા નુકસાનની સચોટ બાદબાકી.",
    f4Title: "વોટ્સએપ બોટ સુવિધા",
    f4Desc: "કોઈપણ એપ ડાઉનલોડ કર્યા વિના સીધા વોટ્સએપ પર લોકેશન મોકલીને શ્રેષ્ઠ યાર્ડ જાણો.",

    // Dashboard Overview
    overviewTitle: "પ્લેટફોર્મ ઇન્ટેલિજન્સ ઓવરવ્યૂ",
    overviewSubtitle: "ખેડૂતોના પ્રશ્નો, લોકપ્રિય પાક અને ચોખ્ખા નફાનું વિશ્લેષણ.",
    refreshBtn: "🔄 રિફ્રેશ",
    exportCsvBtn: "રિપોર્ટ ડાઉનલોડ (CSV)",
    topCropsTitle: "સૌથી વધુ પૂછાયેલા પાક",
    topMandisTitle: "સૌથી વધુ ભલામણ કરાયેલ યાર્ડ",
    liveStreamTitle: "લાઈવ ખેડૂત પ્રશ્ન ઓડિટ",
    liveStreamSubtitle: "વોટ્સએપ બોટ પર આવતા પ્રશ્નોનું લાઈવ લિસ્ટ.",

    // Price Trends
    trendsTitle: "૩૦-દિવસીય ભાવ ઇન્ટેલિજન્સ",
    trendsSubtitle: "છેલ્લા ૩૦ દિવસના દૈનિક ભાવ અને બજાર વધઘટ.",
    selectMandiLabel: "યાર્ડ પસંદ કરો",
    selectCropLabel: "પાક પસંદ કરો",
    kpiModalPrice: "આજનો સરેરાશ ભાવ",
    kpiHigh: "૩૦ દિવસનો મહત્તમ ભાવ",
    kpiLow: "૩૦ દિવસનો લઘુત્તમ ભાવ",
    kpiPerishability: "બગાડ ઇન્ડેક્સ",

    // Cost Parameters
    costTitle: "કમિશન અને ભાડાના દરો",
    costSubtitle: "દરેક યાર્ડના કમિશન %, મજૂરી અને ટ્રાન્સપોર્ટ દરનું સંચાલન.",
    editCostsBtn: "દર બદલો",

    // Profit Map
    mapTitle: "ભૌગોલિક ચોખ્ખો નફો નકશો (Map)",
    mapSubtitle: "ખેડૂતના ગામથી વિવિધ માર્કેટિંગ યાર્ડનું અંતર, રસ્તો અને ચોખ્ખો નફો.",
    mapOriginLabel: "ખેડૂતનું સ્થળ",
    mapCropLabel: "પાક",
    mapQuantityLabel: "જથ્થો (ક્વિન્ટલ)",
    mapBestMandiBadge: "સૌથી વધુ નફાકારક રૂટ",
    mapDistanceLabel: "અંતર",
    mapNetProfitLabel: "ચોખ્ખો નફો (હાથમાં)",

    // Kisan Pool
    poolTitle: "કિસાન પૂલ — સંયુક્ત વાહન ભાડું અને બચત",
    poolSubtitle: "નાના ખેડૂતો (5-25 ક્વિન્ટલ) સાથે મળીને વાહન ભાડામાં 45-60% સુધી બચત કરો.",
    poolActiveBatches: "સક્રિય ગામ વાહન જૂથો",
    poolCalculatorTitle: "સંયુક્ત વાહન બચત કેલ્ક્યુલેટર",
    poolSoloQty: "તમારો પાક જથ્થો (ક્વિન્ટલ)",
    poolTotalQty: "કુલ સંયુક્ત જથ્થો (ક્વિન્ટલ)",
    poolDistance: "પરિવહન અંતર (KM)",
    poolDestination: "યાર્ડનું નામ",
    poolCalculateBtn: "બચત ગણો",
    poolMatchedVehicle: "યોગ્ય વાહન",
    poolSoloCost: "એકલ વાહન ખર્ચ",
    poolPooledCost: "સંયુક્ત વાહનમાં તમારો ભાગ",
    poolSavingsTotal: "તમારી કુલ રોકડ બચત",
  },
};
