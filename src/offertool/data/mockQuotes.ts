import { QuoteData } from '../types';
import { INITIAL_QUOTE, DEFAULT_CATEGORIES, DEFAULT_SERVICES, DEFAULT_TIMELINE_PHASES } from './defaultCatalog';

export const INITIAL_QUOTES_LIST: QuoteData[] = [
  // 1. Lumio Solar NV
  INITIAL_QUOTE,

  // 2. Vanderstraeten Logistics BV
  {
    id: 'quote-sg-2026-002',
    quoteNumber: 'SG-2026-085',
    version: 1,
    status: 'verzonden',
    createdAt: '2026-08-14',
    validUntil: '2026-09-14',
    projectName: 'B2B Klantenportaal & Webapplicatie',
    projectSummary: 'Ontwerp en modulaire ontwikkeling van een beveiligd B2B transportportaal voor real-time tracking en orderbeheer.',
    salesRepresentative: {
      name: 'Warre Geerts',
      email: 'warre@studio-graaf.be',
      phone: '',
      role: 'Co-Founder'
    },
    client: {
      companyName: 'Vanderstraeten Logistics BV',
      contactPerson: 'Mark Vanderstraeten',
      jobTitle: 'Algemeen Directeur',
      email: 'm.vanderstraeten@vls-group.be',
      phone: '+32 495 55 12 34',
      vatNumber: 'BE 0456.123.890',
      address: 'Havenlaan 88',
      postalCode: '2000',
      city: 'Antwerpen',
      country: 'België',
      website: 'https://vanderstraeten-logistics.be'
    },
    categories: DEFAULT_CATEGORIES,
    items: DEFAULT_SERVICES.map(item => {
      if (['srv-app-custom-tool', 'srv-app-api-integratie', 'srv-app-roles', 'srv-app-maintenance-monthly'].includes(item.id)) {
        return { ...item, selected: true };
      }
      return { ...item, selected: false };
    }),
    overallDiscountType: 'percentage',
    overallDiscountValue: 5,
    vatRate: 21,
    paymentTerms: '30% bij start project, rest bij oplevering. Facturen zijn betaalbaar binnen 14 dagen.',
    timelinePhases: DEFAULT_TIMELINE_PHASES,
    customIntroMessage: 'Beste Mark,\n\nHierbij het voorstel voor de ontwikkeling van het nieuwe B2B portaal.',
    generalTermsAccepted: false
  },

  // 3. Graafwerk Architecten & Ingenieurs
  {
    id: 'quote-sg-2026-003',
    quoteNumber: 'SG-2026-086',
    version: 2,
    status: 'akkoord',
    createdAt: '2026-08-02',
    validUntil: '2026-09-02',
    projectName: 'Architecturaal Portfolio & Branding',
    projectSummary: 'Nieuwe merkidentiteit, responsive website en professionele hosting voor een toonaangevend architectenbureau.',
    salesRepresentative: {
      name: 'Warre Geerts',
      email: 'warre@studio-graaf.be',
      phone: '',
      role: 'Co-Founder'
    },
    client: {
      companyName: 'Graafwerk Architecten & Ingenieurs',
      contactPerson: 'Eline Claeys',
      jobTitle: 'Partner & Lead Architect',
      email: 'eline@graafwerk-architecten.be',
      phone: '+32 472 88 99 00',
      vatNumber: 'BE 0812.334.556',
      address: 'Brabantdam 112',
      postalCode: '9000',
      city: 'Gent',
      country: 'België',
      website: 'https://graafwerk-architecten.be'
    },
    categories: DEFAULT_CATEGORIES,
    items: DEFAULT_SERVICES.map(item => {
      if (['srv-brand-basis', 'srv-web-basis', 'srv-web-meertalig', 'srv-sub-hosting'].includes(item.id)) {
        return { ...item, selected: true };
      }
      return { ...item, selected: false };
    }),
    overallDiscountType: 'percentage',
    overallDiscountValue: 0,
    vatRate: 21,
    paymentTerms: '30% bij start project, rest bij oplevering. Facturen zijn betaalbaar binnen 14 dagen.',
    timelinePhases: DEFAULT_TIMELINE_PHASES,
    customIntroMessage: 'Beste Eline,\n\nHierbij ons voorstel voor het nieuwe architecturale portfolio en de visuele huisstijl.',
    generalTermsAccepted: true
  }
];
