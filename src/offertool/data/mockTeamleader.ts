import { TeamleaderCompany } from '../types';

export const MOCK_TEAMLEADER_COMPANIES: TeamleaderCompany[] = [
  {
    id: 'tl-comp-101',
    name: 'Lumio Solar NV',
    vatNumber: 'BE 0789.654.321',
    email: 'info@lumiosolar.be',
    phone: '+32 9 245 88 10',
    website: 'https://lumiosolar.be',
    street: 'Kortrijksesteenweg 245',
    zip: '9000',
    city: 'Gent',
    country: 'België',
    primaryContact: {
      name: 'Sophie De Meyer',
      jobTitle: 'Commercieel Directeur',
      email: 'sophie.demeyer@lumiosolar.be',
      phone: '+32 478 12 34 56'
    },
    deals: [
      {
        id: 'tl-deal-201',
        title: 'Lumio Solar - Nieuwe Website & Merkidentiteit 2026',
        estimatedValue: 12500,
        phase: 'Offerte opmaken',
        probability: 80,
        responsibleUser: 'Warre Geerts'
      },
      {
        id: 'tl-deal-202',
        title: 'Lumio Solar - Google Ads Campagne Q3/Q4',
        estimatedValue: 3500,
        phase: 'Gekwalificeerd',
        probability: 60,
        responsibleUser: 'Warre Geerts'
      }
    ]
  },
  {
    id: 'tl-comp-102',
    name: 'Vanderstraeten Logistics BV',
    vatNumber: 'BE 0456.123.890',
    email: 'contact@vanderstraeten-logistics.be',
    phone: '+32 3 201 44 00',
    website: 'https://vanderstraeten-logistics.be',
    street: 'Havenlaan 88',
    zip: '2000',
    city: 'Antwerpen',
    country: 'België',
    primaryContact: {
      name: 'Mark Vanderstraeten',
      jobTitle: 'Algemeen Directeur',
      email: 'm.vanderstraeten@vls-group.be',
      phone: '+32 495 55 12 34'
    },
    deals: [
      {
        id: 'tl-deal-203',
        title: 'VLS - B2B Klantenportaal & Branding',
        estimatedValue: 18500,
        phase: 'Voorstel presenteren',
        probability: 75,
        responsibleUser: 'Warre Geerts'
      }
    ]
  },
  {
    id: 'tl-comp-103',
    name: 'Graafwerk Architecten & Ingenieurs',
    vatNumber: 'BE 0812.334.556',
    email: 'studio@graafwerk-architecten.be',
    phone: '+32 9 329 70 80',
    website: 'https://graafwerk-architecten.be',
    street: 'Brabantdam 112',
    zip: '9000',
    city: 'Gent',
    country: 'België',
    primaryContact: {
      name: 'Eline Claeys',
      jobTitle: 'Partner & Lead Architect',
      email: 'eline@graafwerk-architecten.be',
      phone: '+32 472 88 99 00'
    },
    deals: [
      {
        id: 'tl-deal-204',
        title: 'Portfolio Website & Fotografie Shoot Traject',
        estimatedValue: 9800,
        phase: 'Offerte opmaken',
        probability: 85,
        responsibleUser: 'Warre Geerts'
      }
    ]
  },
  {
    id: 'tl-comp-104',
    name: 'TechFlow Solutions BV',
    vatNumber: 'NL 8542.19.452.B01',
    email: 'hello@techflow-solutions.nl',
    phone: '+31 20 894 3300',
    website: 'https://techflow-solutions.nl',
    street: 'Keizersgracht 421',
    zip: '1016 EK',
    city: 'Amsterdam',
    country: 'Nederland',
    primaryContact: {
      name: 'Daan de Vries',
      jobTitle: 'Head of Growth',
      email: 'daan@techflow-solutions.nl',
      phone: '+31 6 12345678'
    },
    deals: [
      {
        id: 'tl-deal-205',
        title: 'TechFlow - SaaS Launch Rebrand & Lead Engine',
        estimatedValue: 14200,
        phase: 'Onderhandeling',
        probability: 90,
        responsibleUser: 'Warre Geerts'
      }
    ]
  },
  {
    id: 'tl-comp-105',
    name: 'Artisan Chocolaterie Delvaux',
    vatNumber: 'BE 0633.987.210',
    email: 'info@delvaux-chocolates.com',
    phone: '+32 2 511 22 33',
    website: 'https://delvaux-chocolates.com',
    street: 'Grote Markt 14',
    zip: '1000',
    city: 'Brussel',
    country: 'België',
    primaryContact: {
      name: 'Laurent Delvaux',
      jobTitle: 'Eigenaar / Meester-Chocolatier',
      email: 'laurent@delvaux-chocolates.com',
      phone: '+32 476 33 44 55'
    },
    deals: [
      {
        id: 'tl-deal-206',
        title: 'Delvaux - Luxe E-commerce & Brand Story Video',
        estimatedValue: 11900,
        phase: 'Offerte opmaken',
        probability: 70,
        responsibleUser: 'Warre Geerts'
      }
    ]
  }
];
