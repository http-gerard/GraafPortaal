import { ServiceCategory, ServiceItem, TimelinePhase, QuoteData } from '../types';

export const DEFAULT_CATEGORIES: ServiceCategory[] = [
  {
    id: 'website-ontwikkeling',
    name: 'Website ontwikkeling',
    iconName: 'Globe',
    color: '#7b68ee',
    badge: 'Website',
    shortDescription: 'Bliksemsnelle, conversiegerichte maatwerk websites inclusief SEO, Google koppeling en CRM integratie.',
    valueProposition: {
      title: 'Waarom een professionele website van Studio Graaf het verschil maakt',
      description: 'Uw website is het digitale visitekaartje en het fundament van uw online verkoop. Onze websites laden razendsnel, zijn 100% responsive en geoptimaliseerd om bezoekers om te zetten in concrete aanvragen.',
      businessImpacts: [
        'Professionele merkpositionering die onmiddellijk vertrouwen wekt',
        'Standaard voorzien van SEO fundament, Google koppeling en GDPR compliance',
        'Directe koppeling van formulieren aan uw CRM (bv. Teamleader)',
        'Eenvoudig uit te breiden met add-ons zoals meertaligheid en AI chatbots'
      ],
      whyStudioGraaf: 'Studio Graaf combineert minimalistische esthetiek met krachtige techniek en meetbare conversie.',
      roiFocus: 'Hogere conversie, sterke vindbaarheid en direct meetbare leadgeneratie.'
    },
    defaultExpanded: false
  },
  {
    id: 'webshop-ontwikkeling',
    name: 'Webshop ontwikkeling',
    iconName: 'ShoppingBag',
    color: '#3B82F6',
    badge: 'E-commerce',
    shortDescription: 'Schaalbare e-commerce platformen geoptimaliseerd voor soepele checkout, betalingen en logistieke koppelingen.',
    valueProposition: {
      title: 'Waarom een hoogwaardige webshop uw online verkoop maximaliseert',
      description: 'Een vlekkeloze klantervaring is cruciaal voor succesvolle online verkoop. Wij bouwen e-commerce oplossingen met intuïtieve navigatie, snelle afrekenprocessen en naadloze koppelingen met uw bedrijfssoftware.',
      businessImpacts: [
        'Frictieloos bestel- en betaalproces voor maximale conversie',
        'Volledig beheer van productvarianten, voorraad en verzendmethodes (bpost, DPD)',
        'Integraties met CRM, facturatie, boekhouding en kassasystemen',
        'Geavanceerde modules voor cadeaubonnen, reviews, abonnementen en downloads'
      ],
      whyStudioGraaf: 'Onze webshops zijn modulair opgezet en schalen moeiteloos mee met de groei van uw assortiment.',
      roiFocus: 'Hogere gemiddelde orderwaarde en minder verlaten winkelmandjes.'
    },
    defaultExpanded: false
  },
  {
    id: 'branding',
    name: 'Branding & Huisstijl',
    iconName: 'Sparkles',
    color: '#BAF800',
    badge: 'Merkidentiteit',
    shortDescription: 'Onderscheidende merkidentiteiten, logoconcepten, huisstijlgidsen en professionele grafische dragers.',
    valueProposition: {
      title: 'Waarom een sterke branding de basis vormt voor premiumprijzen',
      description: 'Zonder herkenbare visuele identiteit concurreert u louter op prijs. Een doordacht merkontwerp versterkt uw marktpositie, straalt autoriteit uit en zorgt voor een consistente ervaring over alle kanalen.',
      businessImpacts: [
        'Unieke logoconcepten met onbeperkte revisies tot 100% tevredenheid',
        'Compleet pakket inclusief kleurenpalet, typografie en huisstijlgids',
        'Aanlevering in alle professionele bestandsformaten voor web en drukwerk',
        'Aanvullende dragers zoals visitekaartjes, templates, rollup banners en verpakkingen'
      ],
      whyStudioGraaf: 'Wij ontwerpen tijdloze merkidentiteiten die direct opvallen in de markt.',
      roiFocus: 'Merkherkenning, hogere gepercipieerde waarde en loyaliteit.'
    },
    defaultExpanded: false
  },
  {
    id: 'social-media-beheer',
    name: 'Social media beheer',
    iconName: 'Share2',
    color: '#EC4899',
    badge: 'Social Media',
    shortDescription: 'Consistente aanwezigheid op Instagram en Facebook met copywriting, planning en maandrapportages.',
    valueProposition: {
      title: 'Waarom structureel social media beheer uw doelgroep bindt',
      description: 'Een actieve en consistente aanwezigheid op sociale media houdt uw merk top-of-mind bij bestaande en potentiële klanten. Wij nemen de copywriting, planning en rapportage volledig uit handen.',
      businessImpacts: [
        'Wekelijkse professionele posts met doordachte copywriting',
        'Maandelijkse rapportage van bereik, interactie en groei',
        'Flexibel uit te breiden met stories, community management en extra platforms',
        'Mogelijkheid tot professionele contentcreatie op locatie'
      ],
      whyStudioGraaf: 'Consistente kwaliteit en merkuitstraling zonder dat het uw eigen team tijd kost.',
      roiFocus: 'Groter bereik, merkbetrokkenheid en constante instroom van warme leads.'
    },
    defaultExpanded: false
  },
  {
    id: 'marketing-advertenties',
    name: 'Marketing & advertenties',
    iconName: 'TrendingUp',
    color: '#F59E0B',
    badge: 'Campagnes',
    shortDescription: 'Doelgerichte advertentiecampagnes, retargeting, conversieoptimalisatie en e-mailmarketing.',
    valueProposition: {
      title: 'Waarom doelgerichte advertenties uw groei versnellen',
      description: 'Met gerichte online marketing bereiken we uw ideale doelgroep exact op het moment van aankoopintentie. We optimaliseren continu op basis van data om uw kosten per lead te minimaliseren.',
      businessImpacts: [
        'Complete opzet van pixel tracking, doelgroepen en advertentiesets',
        'Actief maandelijks beheer met A/B-testen en conversiemeting',
        'E-mailmarketing campagnes en geautomatiseerde funnels',
        'Op maat gemaakte landingspagina’s voor maximale conversie'
      ],
      whyStudioGraaf: 'Wij sturen op keiharde zakelijke KPI’s: kosten per lead en return on ad spend (ROAS).',
      roiFocus: 'Voorspelbare stroom van nieuwe klanten en maximaal rendement op advertentiebudget.'
    },
    defaultExpanded: false
  },
  {
    id: 'web-applicaties',
    name: 'Web applicaties',
    iconName: 'Layers',
    color: '#10B981',
    badge: 'Maatwerk Tools',
    shortDescription: 'Maatwerk bedrijfsapplicaties, reservatiesystemen, configuratietools en API koppelingen.',
    valueProposition: {
      title: 'Waarom maatwerk software uw bedrijfsprocessen automatiseert',
      description: 'Standaardsoftware schiet vaak tekort bij unieke bedrijfsprocessen. Met een maatwerk webapplicatie automatiseert u repetitieve taken, verlaagt u operationele kosten en biedt u klanten een unieke ervaring.',
      businessImpacts: [
        'Geautomatiseerde reservatie- en planningtools',
        'Interactieve offerte- en productconfiguratoren',
        'Koppelingen met externe API’s en interne databases',
        'Rollen- en rechtenbeheer voor veilige interne en externe toegang'
      ],
      whyStudioGraaf: 'Robuuste en veilige architectuur, ontworpen om jarenlang soepel te draaien.',
      roiFocus: 'Directe tijdwinst, foutreductie en lagere administratieve kosten.'
    },
    defaultExpanded: false
  },
  {
    id: 'maandelijkse-abonnementen',
    name: 'Maandelijkse abonnementen & Bundels',
    iconName: 'ShieldCheck',
    color: '#6366F1',
    badge: 'Abonnementen & Bundels',
    shortDescription: 'Zorgeloze hosting, SEO trajecten, doorlopend beheer en voordelige alles-in-één combinatiepakketten.',
    valueProposition: {
      title: 'Waarom doorlopende ontzorging uw digitale voorsprong waarborgt',
      description: 'Digitale kanalen vereisen continu onderhoud, monitoring en optimalisatie. Met onze vaste maandelijkse abonnementen en all-in combinatiepakketten geniet u van maximale zekerheid en continuïteit.',
      businessImpacts: [
        'Betrouwbare hosting met SSL, domeinnaam, 5 mailboxen, back-ups en support',
        'Structurele SEO optimalisatie (Starter of Pro) voor duurzame topposities in Google',
        'All-in combinatiepakketten (Starter, Groei, Dominantie) met extra prijsvoordeel',
        'Vast aanspreekpunt en gegarandeerde reactietijden'
      ],
      whyStudioGraaf: 'Volledige gemoedsrust en een partner die proactief meedenkt met uw online groei.',
      roiFocus: 'Maximale uptime, continue vindbaarheid en ontzorging van uw team.'
    },
    defaultExpanded: false
  }
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  // ==========================================
  // 1. WEBSITE ONTWIKKELING
  // ==========================================
  {
    id: 'srv-web-basis',
    categoryId: 'website-ontwikkeling',
    name: 'Basispakket Website',
    code: 'WEB-BASIS',
    shortDescription: '5 pagina\'s, SEO fundament, Google koppeling, contactformulier + CRM integratie, GDPR conformiteit en professionele stockfoto\'s.',
    detailedScope: [
      'Maatwerk design en ontwikkeling van 5 kernpagina\'s (bv. Home, Over ons, Diensten, Portfolio, Contact)',
      'SEO basisinrichting (meta tags, sitemap, heading structuur)',
      'Google koppeling (Google Search Console & Google Analytics 4)',
      'Interactief contactformulier gekoppeld aan CRM (Teamleader, e-mail)',
      'GDPR-conforme cookiebanner en privacy instellingen',
      'Selectie en bewerking van kwalitatieve professionele stockfoto\'s',
      '100% responsive optimalisatie voor smartphone, tablet en desktop'
    ],
    deliverables: ['Live website op maat', 'Google & CRM koppelingen', 'SEO & GDPR inrichting'],
    billingType: 'one_off',
    defaultPrice: 2999,
    price: 2999,
    quantity: 1,
    unit: 'pakket',
    selected: true,
    estimatedDays: 14
  },
  {
    id: 'srv-web-extra-page',
    categoryId: 'website-ontwikkeling',
    name: 'Extra pagina',
    code: 'WEB-PAGE',
    shortDescription: 'Aanvullende pagina op maat ontworpen en ontwikkeld in de consistente stijl van de website.',
    detailedScope: [
      'Design en front-end ontwikkeling van een extra pagina',
      'Contentinvoer en responsive optimalisatie',
      'SEO meta tags en interne linkstructuur'
    ],
    deliverables: ['Extra responsive webpagina'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'pagina',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-web-afspraak',
    categoryId: 'website-ontwikkeling',
    name: 'Afspraakmodule',
    code: 'WEB-BOOK',
    shortDescription: 'Online boekings- en afspraaksysteem geïntegreerd in de website met automatische agenda-synchronisatie.',
    detailedScope: [
      'Integratie van online afsprakentool (bv. Calendly, Google Agenda, Microsoft Bookings)',
      'Afspraakbevestigingen en automatische herinneringsmails naar de klant',
      'Custom styling in de huisstijl van de website'
    ],
    deliverables: ['Werkende online afspraakmodule'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-web-meertalig',
    categoryId: 'website-ontwikkeling',
    name: 'Meertaligheid (Website)',
    code: 'WEB-LANG',
    shortDescription: 'Volledige meertalige structuur met taalswitcher en SEO-geoptimaliseerde URL-structuren per taal.',
    detailedScope: [
      'Inrichting van meertalige architectuur (bv. NL, FR, EN)',
      'Taalswitcher in navigatie en footer',
      'Hreflang tags en taal-specifieke SEO URL-structuur',
      'Duplicatie van websitestructuur voor extra taal'
    ],
    deliverables: ['Meertalige website setup', 'Taalswitcher'],
    billingType: 'one_off',
    defaultPrice: 749,
    price: 749,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 5
  },
  {
    id: 'srv-web-ai-chatbot',
    categoryId: 'website-ontwikkeling',
    name: 'AI chatbot',
    code: 'WEB-AICHA',
    shortDescription: 'Slimme AI chatbot getraind op uw bedrijfsdata die 24/7 vragen van websitebezoekers beantwoordt en leads verzamelt.',
    detailedScope: [
      'Setup en integratie van een interactieve AI chatbot widget',
      'Trainen van de chatbot op uw websiteteksten, FAQ en documentatie',
      'Lead-capturing functionaliteit (e-mail en telefoonnummer verzamelen)',
      'Custom styling passend bij uw merkidentiteit'
    ],
    deliverables: ['Geconfigureerde AI chatbot', 'Lead notificaties'],
    billingType: 'one_off',
    defaultPrice: 349,
    price: 349,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 4
  },

  // ==========================================
  // 2. WEBSHOP ONTWIKKELING
  // ==========================================
  {
    id: 'srv-shop-basis',
    categoryId: 'webshop-ontwikkeling',
    name: 'Basispakket Webshop',
    code: 'SHOP-BASIS',
    shortDescription: '5 pagina\'s, tot 25 producten, online betalingssysteem en conversiegerichte afrekenflow (excl. CRM/facturatiekoppeling).',
    detailedScope: [
      'Maatwerk design van 5 hoofdpagina\'s (Home, Shop overzicht, Product detail, Winkelmand, Checkout)',
      'Invoer en configuratie van tot 25 producten met foto\'s en beschrijvingen',
      'Koppeling met betaalprovider (Mollie / Stripe) voor Bancontact, iDEAL, creditcard',
      'Automatische orderbevestigingsmails en voorraadnotificaties',
      'SSL-beveiliging en responsive optimalisatie'
    ],
    deliverables: ['Volledige webshop live', 'Betaalmodule gekoppeld', '25 producten ingericht'],
    billingType: 'one_off',
    defaultPrice: 4999,
    price: 4999,
    quantity: 1,
    unit: 'pakket',
    selected: false,
    estimatedDays: 20
  },
  {
    id: 'srv-shop-extra-products',
    categoryId: 'webshop-ontwikkeling',
    name: 'Extra producten (per schijf van 25)',
    code: 'SHOP-PROD25',
    shortDescription: 'Invoer en configuratie van 25 extra producten inclusief afbeeldingen, categorieën en prijzen.',
    detailedScope: [
      'Invoer van 25 producten inclusief titels, beschrijvingen, SKU\'s en prijzen',
      'Optimalisatie van productafbeeldingen en categorie-indeling'
    ],
    deliverables: ['25 producten toegevoegd aan catalogus'],
    billingType: 'one_off',
    defaultPrice: 149,
    price: 149,
    quantity: 1,
    unit: 'schijf (25 stuks)',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-shop-variants',
    categoryId: 'webshop-ontwikkeling',
    name: 'Productvarianten instellen (maat, kleur,...)',
    code: 'SHOP-VAR',
    shortDescription: 'Geavanceerde variantenconfiguratie voor producten (zoals maten, kleuren, materialen of volumes).',
    detailedScope: [
      'Configuratie van productattributen en keuzelijsten',
      'Voorraad- en prijsbeheer per specifieke variant',
      'Dynamische afbeeldingwisseling op basis van geselecteerde variant'
    ],
    deliverables: ['Variantenstructuur geconfigureerd'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'instelling',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-shop-extra-page',
    categoryId: 'webshop-ontwikkeling',
    name: 'Extra pagina (Webshop)',
    code: 'SHOP-PAGE',
    shortDescription: 'Extra informatieve pagina of landingspagina voor de webshop (bv. Maattabel, FAQ, Verzendbeleid).',
    detailedScope: [
      'Design en opbouw van een extra pagina in webshopstijl',
      'Contentinvoer en responsive controle'
    ],
    deliverables: ['Extra webshoppagina'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'pagina',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-shop-payment-method',
    categoryId: 'webshop-ontwikkeling',
    name: 'Extra betaalmethode (per stuk)',
    code: 'SHOP-PAY',
    shortDescription: 'Configuratie en testen van een specifieke extra betaalmethode (bv. Klarna Achteraf Betalen, PayPal, Apple Pay).',
    detailedScope: [
      'Activering en API koppeling van extra betaalmethode',
      'Testtransactie en validatie van de afrekenflow'
    ],
    deliverables: ['Extra geactiveerde betaalmethode'],
    billingType: 'one_off',
    defaultPrice: 99,
    price: 99,
    quantity: 1,
    unit: 'per stuk',
    selected: false,
    estimatedDays: 1
  },
  {
    id: 'srv-shop-shipping',
    categoryId: 'webshop-ontwikkeling',
    name: 'Verzendkoppeling (bpost, DPD,...)',
    code: 'SHOP-SHIP',
    shortDescription: 'Automatische koppeling met bpost, DPD, PostNL of Sendcloud voor verzendlabels en tracking.',
    detailedScope: [
      'API integratie met gewenste vervoerder of verzendplatform',
      'Automatische generatie van verzendlabels',
      'Track & Trace notificaties naar de klant'
    ],
    deliverables: ['Geautomatiseerde verzendkoppeling'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'koppeling',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-shop-tax',
    categoryId: 'webshop-ontwikkeling',
    name: 'BTW-regels & tarieven configureren',
    code: 'SHOP-TAX',
    shortDescription: 'Instellen van internationale BTW-regels, OSS (One Stop Shop) tarieven en intracommunautaire vrijstellingen.',
    detailedScope: [
      'Inrichting van BTW-tarieven per EU-land',
      'Configuratie van BTW-nummer validatie voor B2B klanten (VIES)',
      'Correcte BTW-weergave op facturen en checkout'
    ],
    deliverables: ['Fiscaal conforme BTW instellingen'],
    billingType: 'one_off',
    defaultPrice: 149,
    price: 149,
    quantity: 1,
    unit: 'configuratie',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-shop-crm',
    categoryId: 'webshop-ontwikkeling',
    name: 'Koppeling met CRM (Teamleader,...)',
    code: 'SHOP-CRM',
    shortDescription: 'Automatische synchronisatie van webshopklanten en bestellingen naar uw CRM systeem.',
    detailedScope: [
      'Koppeling tussen webshop en CRM (bv. Teamleader)',
      'Automatische creatie van contacten, bedrijven en deals',
      'Data mapping en foutafhandeling'
    ],
    deliverables: ['Werkende CRM koppeling'],
    billingType: 'one_off',
    defaultPrice: 399,
    price: 399,
    quantity: 1,
    unit: 'integratie',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-shop-invoicing',
    categoryId: 'webshop-ontwikkeling',
    name: 'Koppeling met facturatiesoftware',
    code: 'SHOP-INV',
    shortDescription: 'Automatische aanmaak en verzending van PDF facturen via uw facturatiesoftware bij elke bestelling.',
    detailedScope: [
      'Integratie met facturatiepakket (bv. Teamleader, Billit, Exact, EenvoudigFactureren)',
      'Automatische facturatie bij succesvolle betaling',
      'Koppeling van creditnota\'s bij retours'
    ],
    deliverables: ['Geautomatiseerde facturatiekoppeling'],
    billingType: 'one_off',
    defaultPrice: 399,
    price: 399,
    quantity: 1,
    unit: 'integratie',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-shop-accounting',
    categoryId: 'webshop-ontwikkeling',
    name: 'Koppeling met boekhoudpakket',
    code: 'SHOP-ACC',
    shortDescription: 'Directe doorstroom van omzet- en betaalgegevens naar uw boekhoudpakket (bv. Yuki, Octopus, Exact Online).',
    detailedScope: [
      'Inrichting van de dataflow naar het boekhoudpakket',
      'Toewijzing van grootboekrekeningen en betalingsdagboeken',
      'Testexport en validatie met de boekhouder'
    ],
    deliverables: ['Boekhoudkoppeling ingericht'],
    billingType: 'one_off',
    defaultPrice: 399,
    price: 399,
    quantity: 1,
    unit: 'integratie',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-shop-pos',
    categoryId: 'webshop-ontwikkeling',
    name: 'Koppeling met kassasysteem',
    code: 'SHOP-POS',
    shortDescription: 'Synchronisatie van winkelvoorraad en online bestellingen met uw fysieke kassasysteem (POS).',
    detailedScope: [
      'Koppeling met compatibel kassasysteem (bv. Lightspeed, Shopify POS)',
      'Real-time synchronisatie van voorraad tussen fysieke winkel en webshop',
      'Voorkomen van oververkoop van producten'
    ],
    deliverables: ['Kassasysteem koppeling'],
    billingType: 'one_off',
    defaultPrice: 399,
    price: 399,
    quantity: 1,
    unit: 'integratie',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-shop-inventory',
    categoryId: 'webshop-ontwikkeling',
    name: 'Voorraadbeheersysteem',
    code: 'SHOP-STK',
    shortDescription: 'Uitgebreid voorraadbeheer met automatische notificaties bij lage voorraad en batchbeheer.',
    detailedScope: [
      'Inrichting van centraal voorraadbeheer met drempelwaarden',
      'Automatische e-mailnotificaties bij lage stock',
      'Export en rapportage van voorraadstanden'
    ],
    deliverables: ['Geavanceerd voorraadsysteem'],
    billingType: 'one_off',
    defaultPrice: 399,
    price: 399,
    quantity: 1,
    unit: 'systeem',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-shop-giftcards',
    categoryId: 'webshop-ontwikkeling',
    name: 'Cadeaubon module',
    code: 'SHOP-GIFT',
    shortDescription: 'Verkoop van digitale en fysieke cadeaubonnen met unieke vouchercodes en automatische saldo-afschrijving.',
    detailedScope: [
      'Setup van cadeaubon producttype en unieke code generator',
      'Automatische verzending van digitale cadeaubon per e-mail',
      'Verzilveringsmodule in de winkelmand en checkout'
    ],
    deliverables: ['Werkende cadeaubonmodule'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-shop-reviews',
    categoryId: 'webshop-ontwikkeling',
    name: 'Productreviews module',
    code: 'SHOP-REV',
    shortDescription: 'Klantbeoordelingen en sterrenratings op productpagina\'s voor maximale sociale bewijskracht en vertrouwen.',
    detailedScope: [
      'Inrichting van reviewmodule met sterren en tekstbeoordelingen',
      'Automatische review-verzoek e-mails na aankoop',
      'Moderatiemogelijkheid voor goedgekeurde reviews'
    ],
    deliverables: ['Review- en ratingmodule'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-shop-meertalig',
    categoryId: 'webshop-ontwikkeling',
    name: 'Meertaligheid (Webshop)',
    code: 'SHOP-LANG',
    shortDescription: 'Meertalige webshop met vertaalde productcatalogus, checkout en e-mails.',
    detailedScope: [
      'Inrichting van meertalige webshopstructuur (NL, FR, EN)',
      'Taalspecifieke productbeschrijvingen en e-mailnotificaties',
      'Valutakeuze indien gewenst'
    ],
    deliverables: ['Meertalige webshop setup'],
    billingType: 'one_off',
    defaultPrice: 749,
    price: 749,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 5
  },
  {
    id: 'srv-shop-subscriptions',
    categoryId: 'webshop-ontwikkeling',
    name: 'Abonnementsproducten (recurring verkoop)',
    code: 'SHOP-SUB',
    shortDescription: 'Verkoop van terugkerende producten of diensten met automatische periodieke incasso (maandelijks/jaarlijks).',
    detailedScope: [
      'Inrichting van periodieke abonnementen (SEPA / Creditcard)',
      'Klantportaal voor pauzeren, wijzigen of annuleren van abonnementen',
      'Automatische facturatie per periode'
    ],
    deliverables: ['Abonnementen- en recurringsysteem'],
    billingType: 'one_off',
    defaultPrice: 349,
    price: 349,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 4
  },
  {
    id: 'srv-shop-digital',
    categoryId: 'webshop-ontwikkeling',
    name: 'Digitale producten / downloads',
    code: 'SHOP-DIGI',
    shortDescription: 'Beveiligde verkoop van e-books, PDF-gidsen, software of digitale licenties met unieke downloadlinks.',
    detailedScope: [
      'Configuratie van beveiligde downloadlinks na betaling',
      'Beperking op aantal downloads of geldigheidstermijn',
      'Automatische licentiecode toewijzing'
    ],
    deliverables: ['Digitale downloadmodule'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-shop-ai-chatbot',
    categoryId: 'webshop-ontwikkeling',
    name: 'AI chatbot (Webshop)',
    code: 'SHOP-AICHA',
    shortDescription: 'AI e-commerce assistent die klanten helpt bij productkeuze, matenadvies en bestelvragen.',
    detailedScope: [
      'Integratie van AI shopping assistant gekoppeld aan de productcatalogus',
      'Productaanbevelingen op basis van klantvragen',
      'Ondersteuning bij veelgestelde vragen over levertijden en retourbeleid'
    ],
    deliverables: ['AI shopping chatbot'],
    billingType: 'one_off',
    defaultPrice: 349,
    price: 349,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 4
  },
  {
    id: 'srv-shop-booking',
    categoryId: 'webshop-ontwikkeling',
    name: 'Afspraakmodule gekoppeld aan shop',
    code: 'SHOP-BOOK',
    shortDescription: 'Directe combinatie van online betaling en afspraakboeking (bv. workshops, consultaties, behandelingen).',
    detailedScope: [
      'Koppeling tussen agenda/tijdsloten en directe checkout',
      'Automatische kalenderuitnodiging na afronding van de betaling',
      'Beheer van beschikbare capaciteit per tijdslot'
    ],
    deliverables: ['Geïntegreerde afspraak- en betaalmodule'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 2
  },

  // ==========================================
  // 3. BRANDING
  // ==========================================
  {
    id: 'srv-brand-basis',
    categoryId: 'branding',
    name: 'Basispakket Branding',
    code: 'BRAND-BASIS',
    shortDescription: 'Intake, 2 logoconcepten, kleurenpalet, typografie, huisstijlgids, alle bestandsformaten en onbeperkte revisies.',
    detailedScope: [
      'Uitgebreide intake en merkbriefing',
      'Ontwerp van 2 unieke, hoogwaardige logoconcepten',
      'Samenstelling van harmonieus kleurenpalet (HEX, RGB, CMYK, Pantone)',
      'Typografische hiërarchie en fontselectie',
      'Overzichtelijke digitale huisstijlgids (Brand Guide PDF)',
      'Alle professionele bestandsformaten (Vector SVG/EPS, PNG, PDF)',
      'Onbeperkte revisies op het gekozen concept tot 100% tevredenheid'
    ],
    deliverables: ['Logo Master Pack', 'Huisstijlgids PDF', 'Typografie- & kleurpalet'],
    billingType: 'one_off',
    defaultPrice: 1499,
    price: 1499,
    quantity: 1,
    unit: 'pakket',
    selected: false,
    estimatedDays: 10
  },
  {
    id: 'srv-brand-bizcard',
    categoryId: 'branding',
    name: 'Visitekaartje ontwerp',
    code: 'BRAND-CARD',
    shortDescription: 'Stijlvol dubbelzijdig visitekaartje ontwerp, drukklaar aangeleverd met snijlijnen.',
    detailedScope: [
      'Ontwerp van voor- en achterzijde in lijn met de huisstijl',
      'Drukklaar PDF bestand (High-res CMYK met 3mm afloop en snijtekens)'
    ],
    deliverables: ['Drukklaar visitekaartje bestand'],
    billingType: 'one_off',
    defaultPrice: 149,
    price: 149,
    quantity: 1,
    unit: 'ontwerp',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-brand-letterhead',
    categoryId: 'branding',
    name: 'Briefpapier ontwerp',
    code: 'BRAND-LETT',
    shortDescription: 'Professioneel digitaal en drukklaar briefpapier (Word template + drukklaar PDF).',
    detailedScope: [
      'Ontwerp briefpapier met correcte marges en bedrijfsgegevens',
      'Aanlevering als bewerkbare Word-template (.docx) en drukklaar PDF'
    ],
    deliverables: ['Word template', 'Drukklaar briefpapier PDF'],
    billingType: 'one_off',
    defaultPrice: 99,
    price: 99,
    quantity: 1,
    unit: 'ontwerp',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-brand-emailsig',
    categoryId: 'branding',
    name: 'E-mailhandtekening',
    code: 'BRAND-SIG',
    shortDescription: 'Strakke HTML e-mailhandtekening met klikbare links, logo en social icons voor Outlook, Apple Mail en Gmail.',
    detailedScope: [
      'Ontwerp en HTML-codering van interactieve e-mailhandtekening',
      'Installatiehandleiding voor Outlook, Gmail en Apple Mail'
    ],
    deliverables: ['HTML e-mailhandtekening code', 'Installatie-instructies'],
    billingType: 'one_off',
    defaultPrice: 99,
    price: 99,
    quantity: 1,
    unit: 'ontwerp',
    selected: false,
    estimatedDays: 1
  },
  {
    id: 'srv-brand-flyer',
    categoryId: 'branding',
    name: 'Flyer / folder ontwerp (per stuk)',
    code: 'BRAND-FLY',
    shortDescription: 'Opvallend ontwerp van een commerciële flyer, folder of brochure (per stuk), drukklaar opgeleverd.',
    detailedScope: [
      'Ontwerp van layout en visualisatie in huisstijl',
      'Drukklare oplevering conform specificaties van de drukkerij'
    ],
    deliverables: ['Drukklaar flyer/folder PDF'],
    billingType: 'one_off',
    defaultPrice: 149,
    price: 149,
    quantity: 1,
    unit: 'per stuk',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-brand-rollup',
    categoryId: 'branding',
    name: 'Rollup / banner ontwerp',
    code: 'BRAND-ROLL',
    shortDescription: 'Grootformaat ontwerp voor rollup banners, beursstands of buitenspandoeken.',
    detailedScope: [
      'Grootformaat visual design geoptimaliseerd voor leesbaarheid op afstand',
      'Drukklare high-res PDF met snijlijnen en afloop'
    ],
    deliverables: ['Drukklaar rollup banner bestand'],
    billingType: 'one_off',
    defaultPrice: 174,
    price: 174,
    quantity: 1,
    unit: 'ontwerp',
    selected: false,
    estimatedDays: 2
  },
  {
    id: 'srv-brand-social-templates',
    categoryId: 'branding',
    name: 'Sociale media templates (set van 5)',
    code: 'BRAND-SOC',
    shortDescription: 'Set van 5 herbruikbare Canva/Photoshop templates voor posts en stories in uw consistente huisstijl.',
    detailedScope: [
      '5 unieke template formats (bv. Quote, Nieuws, Tip, Case, Actie)',
      'Aanlevering als bewerkbare Canva-link of bronbestanden'
    ],
    deliverables: ['5 bewerkbare social media templates in Canva'],
    billingType: 'one_off',
    defaultPrice: 249,
    price: 249,
    quantity: 1,
    unit: 'set van 5',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-brand-presentation',
    categoryId: 'branding',
    name: 'Presentatietemplate (PowerPoint / Google Slides)',
    code: 'BRAND-PPT',
    shortDescription: 'Professioneel presentatiesjabloon met master slides, grafieken, tabellen en iconensets.',
    detailedScope: [
      'Ontwerp van titelslides, contentslides, quoteslides en afsluiters',
      'Aanlevering als .pptx en Google Slides sjabloon'
    ],
    deliverables: ['PowerPoint & Google Slides master template'],
    billingType: 'one_off',
    defaultPrice: 299,
    price: 299,
    quantity: 1,
    unit: 'template',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-brand-packaging',
    categoryId: 'branding',
    name: 'Verpakkingsontwerp',
    code: 'BRAND-PACK',
    shortDescription: 'Maatwerk verpakkings- of etiketontwerp conform de stansmessen en technische specificaties van de fabrikant.',
    detailedScope: [
      'Design op de officiële stansvorm (dieline)',
      'Controle op barcode, ingrediënten en wettelijke vermeldingen',
      'Drukklare high-res vector PDF'
    ],
    deliverables: ['Drukklaar verpakkingsbestand'],
    billingType: 'one_off',
    defaultPrice: 299,
    price: 299,
    quantity: 1,
    unit: 'ontwerp',
    selected: false,
    estimatedDays: 4
  },

  // ==========================================
  // 4. SOCIAL MEDIA BEHEER
  // ==========================================
  {
    id: 'srv-soc-basis',
    categoryId: 'social-media-beheer',
    name: 'Basispakket Social Media (Maandelijks)',
    code: 'SOC-BASIS',
    shortDescription: 'Instagram + Facebook, 1 post per week, copywriting, beeldmateriaal door klant, inplannen en maandrapport.',
    detailedScope: [
      'Beheer van 2 platforms (Instagram + Facebook)',
      '1 doordachte post per week (4 posts per maand)',
      'Pakkende copywriting en relevante hashtags',
      'Inplannen via professionele social media planning tools',
      'Maandelijks overzichtelijk rapport met bereik en interactiecijfers'
    ],
    deliverables: ['4 posts per maand ingepland', 'Maandelijks analytics rapport'],
    billingType: 'monthly',
    defaultPrice: 499,
    price: 499,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-soc-extra-platform',
    categoryId: 'social-media-beheer',
    name: 'Extra platform (per stuk)',
    code: 'SOC-PLAT',
    shortDescription: 'Uitbreiding van het social media beheer naar een extra kanaal (bv. LinkedIn, TikTok of Pinterest).',
    detailedScope: [
      'Aanpassing van content en copy naar de tone-of-voice van het extra kanaal',
      'Inplanning en monitoring per maand'
    ],
    deliverables: ['1 extra platform beheerd'],
    billingType: 'monthly',
    defaultPrice: 99,
    price: 99,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-soc-extra-post',
    categoryId: 'social-media-beheer',
    name: 'Extra post per week',
    code: 'SOC-POST',
    shortDescription: 'Verhoog de frequentie met 1 extra post per week (+4 posts per maand).',
    detailedScope: [
      'Copywriting en visuele opmaak van 4 extra posts per maand',
      'Inplanning en timing optimalisatie'
    ],
    deliverables: ['4 extra posts per maand'],
    billingType: 'monthly',
    defaultPrice: 99,
    price: 99,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-soc-stories',
    categoryId: 'social-media-beheer',
    name: 'Stories (2x per week)',
    code: 'SOC-STOR',
    shortDescription: 'Creatie en inplanning van 2 interactieve Stories per week op Instagram en Facebook (8 stories per maand).',
    detailedScope: [
      '2 dynamische Stories per week (polls, links, video snippets)',
      'Hogere dagelijkse zichtbaarheid bij volgers'
    ],
    deliverables: ['8 stories per maand'],
    billingType: 'monthly',
    defaultPrice: 149,
    price: 149,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-soc-community',
    categoryId: 'social-media-beheer',
    name: 'Community management (reacties beantwoorden)',
    code: 'SOC-COMM',
    shortDescription: 'Actieve opvolging en professionele beantwoording van reacties en privéberichten op uw kanalen.',
    detailedScope: [
      'Monitoring van reacties onder posts en advertenties',
      'Beantwoorden van vragen volgens vastgesteld antwoordprotocol',
      'Doorschakelen van verkoopkansen naar uw team'
    ],
    deliverables: ['Actief community beheer'],
    billingType: 'monthly',
    defaultPrice: 149,
    price: 149,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-soc-content-location',
    categoryId: 'social-media-beheer',
    name: 'Contentcreatie ter plaatse (per halve dag)',
    code: 'SOC-CREAT',
    shortDescription: 'Fotoshoot en video-opnames op locatie door onze content creator voor een voorraad authentieke beelden.',
    detailedScope: [
      'Halve dag (4 uur) op locatie bij uw bedrijf of project',
      'Maken van foto\'s, video snippets en reels/shorts',
      'Oplevering van bewerkte contentbibliotheek voor social media'
    ],
    deliverables: ['Mediapakket met foto\'s en reels'],
    billingType: 'one_off',
    defaultPrice: 399,
    price: 399,
    quantity: 1,
    unit: 'halve dag',
    selected: false,
    estimatedDays: 3
  },

  // ==========================================
  // 5. MARKETING & ADVERTENTIES
  // ==========================================
  {
    id: 'srv-mkt-opstart',
    categoryId: 'marketing-advertenties',
    name: 'Eenmalige opstart advertenties',
    code: 'MKT-START',
    shortDescription: '2 campagnes, 3 advertenties, volledige account setup, pixel & tracking implementatie en doelgroepen instellen.',
    detailedScope: [
      'Volledige inrichting van advertentie-account (Meta / Google Ads)',
      'Installatie en verificatie van tracking pixel en conversietags (GTM)',
      'Definiëren van custom doelgroepen en lookalikes',
      'Ontwerp en copywriting van 3 hoog-converterende advertenties',
      'Setup en lancering van 2 gerichte campagnes'
    ],
    deliverables: ['Werkend advertentie-account', '2 live campagnes', 'Tracking ingericht'],
    billingType: 'one_off',
    defaultPrice: 1499,
    price: 1499,
    quantity: 1,
    unit: 'opstart',
    selected: false,
    estimatedDays: 7
  },
  {
    id: 'srv-mkt-beheer',
    categoryId: 'marketing-advertenties',
    name: 'Maandelijks marketing beheer',
    code: 'MKT-MANAGE',
    shortDescription: 'Content optimalisatie, retargeting, A/B-testen, doelgroep optimalisatie, copywriting, conversiemeting en maandrapport.',
    detailedScope: [
      'Wekelijkse optimalisatie van biedingen, uitsluitingen en budgetten',
      'Continue A/B-testen van advertentiebeelden en advertentieteksten',
      'Inrichten van retargeting funnels voor websitebezoekers',
      'Doelgroepverfijning op basis van conversiedata',
      'Transparante maandelijkse rapportage van leads en kosten per resultaat'
    ],
    deliverables: ['Doorlopend advertentiebeheer', 'Maandrapportage'],
    billingType: 'monthly',
    defaultPrice: 999,
    price: 999,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-mkt-extra-platform',
    categoryId: 'marketing-advertenties',
    name: 'Extra platform advertenties (per stuk)',
    code: 'MKT-PLAT',
    shortDescription: 'Uitbreiding van advertentiebeheer naar een extra netwerk (bv. LinkedIn Ads, Google Search of TikTok Ads).',
    detailedScope: [
      'Campagnesetup en wekelijkse optimalisatie op extra advertentienetwerk'
    ],
    deliverables: ['Beheer op extra platform'],
    billingType: 'monthly',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-mkt-extra-ad',
    categoryId: 'marketing-advertenties',
    name: 'Extra advertentie ontwerp',
    code: 'MKT-AD',
    shortDescription: 'Creatie en copywriting van een extra advertentievariant voor A/B testing of seizoensactie.',
    detailedScope: [
      'Visual design en copywriting van een nieuwe advertentievariant'
    ],
    deliverables: ['Nieuwe advertentiecreatie'],
    billingType: 'monthly',
    defaultPrice: 99,
    price: 99,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-mkt-strategy-call',
    categoryId: 'marketing-advertenties',
    name: 'Maandelijks strategiegesprek',
    code: 'MKT-STRAT',
    shortDescription: 'Maandelijkse videocall (45 min) met uw vaste marketeer om resultaten te bespreken en nieuwe acties af te stemmen.',
    detailedScope: [
      'Bespreking van behaalde resultaten en leadkwaliteit',
      'Strategische planning voor de komende maand'
    ],
    deliverables: ['Maandelijkse strategiesessie call'],
    billingType: 'monthly',
    defaultPrice: 99,
    price: 99,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-mkt-email-monthly',
    categoryId: 'marketing-advertenties',
    name: 'E-mailmarketing campagne (per maand)',
    code: 'MKT-EMLM',
    shortDescription: 'Ontwerp, copywriting en verzending van 1 professionele e-mailnieuwsbrief per maand naar uw klantenbestand.',
    detailedScope: [
      'Pakkende copywriting en selectie van beeldmateriaal',
      'Responsieve e-mailopmaak in Mailchimp / Klaviyo / ActiveCampaign',
      'Testverzending en geplande livegang',
      'Rapportage van open rates en klikpercentages'
    ],
    deliverables: ['1 complete e-mailcampagne per maand'],
    billingType: 'monthly',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-mkt-landing-page',
    categoryId: 'marketing-advertenties',
    name: 'Landingspagina ontwerp & development',
    code: 'MKT-LAND',
    shortDescription: 'Conversiegerichte dedicated landingspagina specifiek ontworpen om maximale leads uit advertenties te halen.',
    detailedScope: [
      'UX/UI ontwerp gericht op 1 specifieke call-to-action (CTA)',
      'Snelle ontwikkeling met formulieren en conversietracking',
      'A/B-test klaar'
    ],
    deliverables: ['Live landingspagina'],
    billingType: 'one_off',
    defaultPrice: 399,
    price: 399,
    quantity: 1,
    unit: 'pagina',
    selected: false,
    estimatedDays: 4
  },
  {
    id: 'srv-mkt-email-auto',
    categoryId: 'marketing-advertenties',
    name: 'E-mailmarketing automatisatie opzetten',
    code: 'MKT-AUTO',
    shortDescription: 'Inrichten van geautomatiseerde e-mail funnels (bv. welkomstreeks, offerte follow-up of verlaten winkelwagen reeks).',
    detailedScope: [
      'Opzetten van trigger-gebaseerde e-mailreeksen (3 tot 5 opeenvolgende e-mails)',
      'Copywriting, template design en koppeling met uw CRM/website',
      'End-to-end testen van de flow'
    ],
    deliverables: ['Volledig geautomatiseerde e-mailflow'],
    billingType: 'one_off',
    defaultPrice: 499,
    price: 499,
    quantity: 1,
    unit: 'setup',
    selected: false,
    estimatedDays: 5
  },

  // ==========================================
  // 6. WEB APPLICATIES
  // ==========================================
  {
    id: 'srv-app-reservatie-setup',
    categoryId: 'web-applicaties',
    name: 'Reservatieplatform — installatie (eenmalig)',
    code: 'APP-RES-SETUP',
    shortDescription: 'Eenmalige configuratie en integratie van een compleet online reservatiesysteem op uw website.',
    detailedScope: [
      'Inrichting van reservatiesysteem met agenda, diensten en capaciteit',
      'Integratie in de website en afstemming op huisstijl',
      'Instellen van e-mail- en SMS-bevestigingen'
    ],
    deliverables: ['Geïnstalleerd reservatieplatform'],
    billingType: 'one_off',
    defaultPrice: 199,
    price: 199,
    quantity: 1,
    unit: 'installatie',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-app-reservatie-beheer',
    categoryId: 'web-applicaties',
    name: 'Reservatieplatform — beheer (maandelijks)',
    code: 'APP-RES-MTH',
    shortDescription: 'Doorlopende softwarelicentie, updates, serverondersteuning en monitoring van het reservatiesysteem.',
    detailedScope: [
      'Software updates en platformhosting',
      'Ondersteuning bij roosterwijzigingen en aanpassingen'
    ],
    deliverables: ['Doorlopend reservatiebeheer'],
    billingType: 'monthly',
    defaultPrice: 49,
    price: 49,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-app-configurator',
    categoryId: 'web-applicaties',
    name: 'Offerte- of configuratietool',
    code: 'APP-CONFIG',
    shortDescription: 'Interactieve calculator of productconfigurator waarmee klanten stapsgewijs een prijsindicatie of offerte berekenen.',
    detailedScope: [
      'Interactieve frontend calculatiemodule met dynamische prijsberekening',
      'Directe PDF offertegeneratie of verzending naar verkoopteam',
      'Responsive interface met heldere visualisatie van stappen'
    ],
    deliverables: ['Werkende interactieve configuratietool'],
    billingType: 'one_off',
    defaultPrice: 2999,
    price: 2999,
    quantity: 1,
    unit: 'applicatie',
    selected: false,
    estimatedDays: 14
  },
  {
    id: 'srv-app-custom-tool',
    categoryId: 'web-applicaties',
    name: 'Interne bedrijfstool op maat',
    code: 'APP-CUSTOM',
    shortDescription: 'Volledig op maat geprogrammeerde webapplicatie om specifieke interne bedrijfsprocessen te digitaliseren en stroomlijnen.',
    detailedScope: [
      'Analyse van bedrijfsprocessen en software-architectuur',
      'Database-inrichting en veilige back-end API ontwikkeling',
      'Maatwerk dashboard en gebruikersinterface',
      'Uitgebreide kwaliteitscontrole en implementatie'
    ],
    deliverables: ['Maatwerk bedrijfsapplicatie', 'Database & API backend'],
    billingType: 'one_off',
    defaultPrice: 4999,
    price: 4999,
    quantity: 1,
    unit: 'maatwerk (vanaf)',
    selected: false,
    estimatedDays: 25
  },
  {
    id: 'srv-app-api-integratie',
    categoryId: 'web-applicaties',
    name: 'Koppeling met externe API (per integratie)',
    code: 'APP-API',
    shortDescription: 'Koppeling met een extern softwarepakket via REST/GraphQL API of Webhooks.',
    detailedScope: [
      'Authenticatie en veilige communicatie met externe API',
      'Tweerichtings-synchronisatie van data en foutafhandeling',
      'Logging en monitoring van synchronisatiestatus'
    ],
    deliverables: ['Werkende API integratie'],
    billingType: 'one_off',
    defaultPrice: 499,
    price: 499,
    quantity: 1,
    unit: 'per integratie',
    selected: false,
    estimatedDays: 4
  },
  {
    id: 'srv-app-roles',
    categoryId: 'web-applicaties',
    name: 'Gebruikersbeheer & rollen',
    code: 'APP-ROLES',
    shortDescription: 'Beveiligd loginsysteem met verschillende rechten en rollen (bv. Admin, Manager, Klant, Medewerker).',
    detailedScope: [
      'Inrichting van authenticatie (e-mail/wachtwoord, 2FA)',
      'Rolgebaseerde toegangscontrole (RBAC) op paginaniveau en API-niveau'
    ],
    deliverables: ['Gebruikersbeheermodule met rollen'],
    billingType: 'one_off',
    defaultPrice: 299,
    price: 299,
    quantity: 1,
    unit: 'module',
    selected: false,
    estimatedDays: 3
  },
  {
    id: 'srv-app-maintenance-monthly',
    categoryId: 'web-applicaties',
    name: 'Maandelijks onderhoud & hosting web app',
    code: 'APP-MAINT',
    shortDescription: 'Dedicated applicatiehosting, databaseback-ups, uptime monitoring en security patches.',
    detailedScope: [
      'High-performance cloud server voor applicaties',
      'Dagelijkse database back-ups met herstelgarantie',
      'Beveiligingsupdates en servermonitoring'
    ],
    deliverables: ['Applicatiehosting en SLA support'],
    billingType: 'monthly',
    defaultPrice: 149,
    price: 149,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-app-extra-hourly',
    categoryId: 'web-applicaties',
    name: 'Extra feature na oplevering (per uur)',
    code: 'APP-HOUR',
    shortDescription: 'Maatwerk doorontwikkeling en extra feature verzoeken na definitieve oplevering van het project.',
    detailedScope: [
      'Senior development en design capaciteit per uur'
    ],
    deliverables: ['Ontwikkelde feature'],
    billingType: 'one_off',
    defaultPrice: 75,
    price: 75,
    quantity: 1,
    unit: 'per uur',
    selected: false,
    estimatedDays: 1
  },

  // ==========================================
  // 7. MAANDELIJKSE ABONNEMENTEN & BUNDELS
  // ==========================================
  {
    id: 'srv-sub-hosting',
    categoryId: 'maandelijkse-abonnementen',
    name: 'Hosting & onderhoud (Website)',
    code: 'SUB-HOST',
    shortDescription: 'Hosting, domeinnaam, 5 mailboxen, SSL certificaat, dagelijkse back-ups, updates, bugfixes en support.',
    detailedScope: [
      'Snelle en betrouwbare SSD cloud hosting',
      'Domeinnaam (.be / .nl / .com) inbegrepen',
      'Tot 5 professionele e-mail mailboxen',
      'SSL-beveiligingscertificaat (HTTPS)',
      'Dagelijkse automatische back-ups',
      'Wekelijkse software- en beveiligingsupdates',
      'Doorlopende bugfixes en technische helpdesk support'
    ],
    deliverables: ['Volledig beheerde cloud hosting & support'],
    billingType: 'monthly',
    defaultPrice: 99,
    price: 99,
    quantity: 1,
    unit: 'mnd',
    selected: true
  },
  {
    id: 'srv-sub-seo-starter',
    categoryId: 'maandelijkse-abonnementen',
    name: 'SEO Starter',
    code: 'SUB-SEO-START',
    shortDescription: 'On-page SEO, Google Business profiel, zoekwoordonderzoek, maandelijks rapport en aanpassingen tot 1u.',
    detailedScope: [
      'Continue optimalisatie van on-page teksten en metadata',
      'Beheer en optimalisatie van Google Bedrijfsprofiel',
      'Maandelijks zoekwoordonderzoek naar nieuwe kansen',
      'Transparant maandelijks ranking- en verkeersrapport',
      'Tot 1 uur maandelijkse website-aanpassingen inbegrepen'
    ],
    deliverables: ['Maandelijks SEO beheer', 'Rankingrapport'],
    billingType: 'monthly',
    defaultPrice: 299,
    price: 299,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-sub-seo-pro',
    categoryId: 'maandelijkse-abonnementen',
    name: 'SEO Pro',
    code: 'SUB-SEO-PRO',
    shortDescription: 'On-page + technische SEO, zoekwoordstrategie, actieve linkbuilding, uitgebreid rapport en concurrentieanalyse.',
    detailedScope: [
      'Diepgaande on-page en technische SEO audits',
      'Structurele zoekwoordstrategie en contentadvies',
      'Actieve opbouw van kwalitatieve backlinks (linkbuilding)',
      'Uitgebreide concurrentie- en marktpositie analyse',
      'Maandelijkse uitgebreide rapportage en strategische bijsturing'
    ],
    deliverables: ['Intensief SEO Pro traject', 'Linkbuilding & analyses'],
    billingType: 'monthly',
    defaultPrice: 499,
    price: 499,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-sub-social-basis',
    categoryId: 'maandelijkse-abonnementen',
    name: 'Social media basis',
    code: 'SUB-SOC-BASIS',
    shortDescription: 'Instagram + Facebook, 1 post per week, copywriting, beeldmateriaal door klant en maandrapport.',
    detailedScope: [
      'Beheer van Instagram en Facebook',
      '1 post per week (4 per maand)',
      'Professionele copywriting en planning',
      'Maandelijkse rapportage'
    ],
    deliverables: ['Social media beheer (1 post/week)'],
    billingType: 'monthly',
    defaultPrice: 499,
    price: 499,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-sub-mkt-manage',
    categoryId: 'maandelijkse-abonnementen',
    name: 'Marketing beheer',
    code: 'SUB-MKT-MANAGE',
    shortDescription: 'Content optimalisatie, retargeting, A/B-testen, doelgroep optimalisatie, conversiemeting en rapport.',
    detailedScope: [
      'Wekelijks beheer en optimalisatie van online advertenties',
      'Retargeting funnels en continue conversiemeting',
      'Maandelijks resultaatrapport'
    ],
    deliverables: ['Compleet marketingbeheer'],
    billingType: 'monthly',
    defaultPrice: 999,
    price: 999,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-sub-res-manage',
    categoryId: 'maandelijkse-abonnementen',
    name: 'Reservatieplatform beheer',
    code: 'SUB-RES-MAN',
    shortDescription: 'Maandelijks beheer en licentie van het reservatieplatform.',
    detailedScope: [
      'Hosting en onderhoud van het online boekingssysteem'
    ],
    deliverables: ['Reservatiebeheer'],
    billingType: 'monthly',
    defaultPrice: 49,
    price: 49,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },
  {
    id: 'srv-sub-app-maint',
    categoryId: 'maandelijkse-abonnementen',
    name: 'Maandelijks onderhoud & hosting web app',
    code: 'SUB-APP-MAN',
    shortDescription: 'Hosting, monitoring, updates en databaseback-ups voor webapplicaties.',
    detailedScope: [
      'Applicatiehosting, monitoring en support'
    ],
    deliverables: ['App hosting & SLA'],
    billingType: 'monthly',
    defaultPrice: 149,
    price: 149,
    quantity: 1,
    unit: 'mnd',
    selected: false
  },

  // Combinatiepakketten
  {
    id: 'srv-bundle-starter',
    categoryId: 'maandelijkse-abonnementen',
    name: 'Combinatiepakket Starter',
    code: 'BUNDLE-START',
    shortDescription: 'Hosting & onderhoud + Social media basis. Voordelige all-in bundel voor startende ondernemingen.',
    detailedScope: [
      'Volledige hosting & onderhoud (domein, 5 mailboxen, SSL, back-ups, support)',
      'Social media basis (Instagram + Facebook, 1 post/week, copy, planning, rapport)',
      'Gecombineerd voordeeltarief (€599/mnd i.p.v. €598/mnd los)'
    ],
    deliverables: ['Hosting & onderhoud', 'Social media beheer'],
    billingType: 'monthly',
    defaultPrice: 599,
    price: 599,
    quantity: 1,
    unit: 'mnd (bundel)',
    selected: false
  },
  {
    id: 'srv-bundle-groei',
    categoryId: 'maandelijkse-abonnementen',
    name: 'Combinatiepakket Groei',
    code: 'BUNDLE-GROEI',
    shortDescription: 'Hosting & onderhoud + SEO Starter + Social media basis. De ideale formule voor structurele online groei.',
    detailedScope: [
      'Volledige hosting & onderhoud (domein, 5 mailboxen, SSL, back-ups, support)',
      'SEO Starter (on-page SEO, Google Bedrijfsprofiel, zoekwoorden, 1u aanpassingen)',
      'Social media basis (Instagram + Facebook, 1 post/week, copy, planning, rapport)',
      'Voordeeltarief: totale ontzorging van uw online aanwezigheid'
    ],
    deliverables: ['Hosting & onderhoud', 'SEO Starter beheer', 'Social media beheer'],
    billingType: 'monthly',
    defaultPrice: 899,
    price: 899,
    quantity: 1,
    unit: 'mnd (bundel)',
    selected: false
  },
  {
    id: 'srv-bundle-dominantie',
    categoryId: 'maandelijkse-abonnementen',
    name: 'Combinatiepakket Dominantie',
    code: 'BUNDLE-DOMINANT',
    shortDescription: 'Hosting & onderhoud + SEO Pro + Social media basis + Marketing beheer. Het ultieme pakket voor marktleiderschap.',
    detailedScope: [
      'Volledige hosting & onderhoud (domein, 5 mailboxen, SSL, back-ups, support)',
      'SEO Pro (technische SEO, linkbuilding, zoekwoordstrategie, concurrentieanalyse)',
      'Social media basis (Instagram + Facebook, 1 post/week, copy, planning, rapport)',
      'Actief marketing beheer (advertentie-optimalisatie, retargeting, A/B-testen)',
      'Maandelijkse strategische rapportage en prioritair aanspreekpunt'
    ],
    deliverables: ['Hosting & onderhoud', 'SEO Pro beheer', 'Social media beheer', 'Marketing beheer'],
    billingType: 'monthly',
    defaultPrice: 2099,
    price: 2099,
    quantity: 1,
    unit: 'mnd (bundel)',
    selected: false
  }
];

export const DEFAULT_TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: 'phase-1',
    phaseNumber: 1,
    title: 'Intake, Strategie & Concept',
    duration: 'Week 1 - 2',
    description: 'We starten met een grondige kick-off meeting en doelgroepbepaling om alle wensen, vereisten en doelstellingen messcherp te stellen.',
    deliverables: ['Kick-off verslag', 'Sitemap & structuur', 'Inhoudelijke richtlijnen']
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    title: 'Design & Visualisatie',
    duration: 'Week 3 - 4',
    description: 'Vertaling van het concept naar hoogwaardige visuele ontwerpen en prototypes waarin u precies ervaart hoe het eindresultaat eruitziet en functioneert.',
    deliverables: ['Visual Design voorstellen', 'Revisieronde & goedkeuring']
  },
  {
    id: 'phase-3',
    phaseNumber: 3,
    title: 'Development & Koppelingen',
    duration: 'Week 5 - 7',
    description: 'Onze ontwikkelaars bouwen de schermen modulair op, integreren gevraagde modules (CRM, betalingen, SEO) en testen alle functionaliteiten.',
    deliverables: ['Staging testomgeving', 'Gekoppelde integraties', 'Snelheidstesten']
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    title: 'Testing, Oplevering & Go-Live',
    duration: 'Week 8',
    description: 'Uitgebreide kwaliteitscontrole op responsive weergave en formulieren, gevolgd door een zorgeloze lancering en eventuele instructies.',
    deliverables: ['Livegang op domeinnaam', 'Opleveringsdocument', 'Aanvang hosting & support']
  }
];

export const INITIAL_QUOTE: QuoteData = {
  id: 'quote-sg-2026-001',
  quoteNumber: 'SG-2026-084',
  version: 1,
  status: 'concept',
  createdAt: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  projectName: 'Nieuwe Website & Digitale Aanwezigheid',
  projectSummary: 'Ontwikkeling van een hoogwaardige, conversiegerichte website inclusief SEO, Google koppeling, CRM integratie en betrouwbare hosting.',
  salesRepresentative: {
    name: 'Warre Geerts',
    email: 'warre@studio-graaf.be',
    phone: '',
    role: 'Co-Founder'
  },
  client: {
    companyName: 'Lumio Solar NV',
    contactPerson: 'Sophie De Meyer',
    jobTitle: 'Commercieel Directeur',
    email: 'sophie.demeyer@lumiosolar.be',
    phone: '+32 478 12 34 56',
    vatNumber: 'BE 0789.654.321',
    address: 'Kortrijksesteenweg 245',
    postalCode: '9000',
    city: 'Gent',
    country: 'België',
    website: 'https://lumiosolar.be',
    teamleaderId: 'tl-comp-101',
    teamleaderDealId: 'tl-deal-201'
  },
  categories: DEFAULT_CATEGORIES,
  items: DEFAULT_SERVICES,
  overallDiscountType: 'percentage',
  overallDiscountValue: 0,
  vatRate: 21,
  paymentTerms: '30% bij start project, rest bij oplevering. Facturen zijn betaalbaar binnen 14 dagen.',
  timelinePhases: DEFAULT_TIMELINE_PHASES,
  customIntroMessage: 'Beste Sophie,\n\nBedankt voor het fijne gesprek. Wij zijn enorm enthousiast om jullie digitale aanwezigheid naar het hoogste niveau te tillen.\n\nIn deze offerte vindt u het overzicht van de geselecteerde diensten en bijhorende investering conform onze officiële prijslijst.',
  generalTermsAccepted: false
};
