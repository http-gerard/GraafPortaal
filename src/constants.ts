import { Project, Task, Client, TeamMember, Invoice, Ticket, Meeting, AppNotification } from './types';

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: '',
    role: 'Agency Beheerder',
  },
  {
    id: '2',
    name: 'Sarah Miller',
    avatar: '',
    role: 'Creative Director',
  },
  {
    id: '3',
    name: 'Jordan Smith',
    avatar: '',
    role: 'Software Ontwikkelaar',
  },
  {
    id: '4',
    name: 'Elena Rossi',
    avatar: '',
    role: 'Projectmanager',
  },
  {
    id: '5',
    name: 'Klant (Luminary)',
    avatar: '',
    role: 'Klant',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'PRJ-4829',
    name: 'Website Herontwerp',
    description: 'Volledige vernieuwing van de digitale aanwezigheid op alle kanalen en de visuele identiteit.',
    status: 'In Uitvoering',
    progress: 68,
    client: 'Luminary Digital',
    team: [TEAM_MEMBERS[1], TEAM_MEMBERS[2]],
    lastUpdated: '2 uur geleden',
    deadline: '2026-05-02',
    category: 'Design Systemen',
    phase: 'Ontwerp',
  },
  {
    id: 'PRJ-4830',
    name: 'Q4 Groeistrategie',
    description: 'Marktanalyse en strategische roadmap voor Europese expansie.',
    status: 'Open',
    progress: 12,
    client: 'Vanguard Properties',
    team: [TEAM_MEMBERS[0], TEAM_MEMBERS[3]],
    lastUpdated: 'Gisteren',
    deadline: '2026-06-15',
    category: 'E-Commerce',
    phase: 'Ontdekking',
  },
];

export const CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Luminary Digital',
    industry: 'Digitaal Bureau',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA83dVKy2Ehv_RKnm_HihluAPsF6dFrXDrZJ3duLwHyR6ujZHPr4Wm88PQrxGuxMkGdlM0BCGpZG88V308p4h7i0rXtOQTBJoOGWuazrh8_GaZX5glqyhuVkDG3JlGg07xH7fat2kj9XscbaRBwkUtJv8xUK65WCnona7u__kmlws_aRPhKaLb6j02PSJZVB_5lFvIGPOK0CfRmUN-mu5-nPqphI-UzbVag9wKpy2xfUrXaVujN6KDkqDuJO6n77O0GxTIuAOzKUUnl',
    status: 'Actief',
    activeProjects: 8,
    address: '482 Tech Plaza, San Francisco, CA',
    contactPerson: TEAM_MEMBERS[1],
    lastActivity: '2 uur geleden',
  },
  {
    id: '2',
    name: 'Vanguard Properties',
    industry: 'Vastgoed',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0NTCyDJq6XrMcgYwQttI-hgvpZcFFpfjbFtETKOQXhDKyATG5xGgwNFQZ-le059avR-gqjkK1zAaLyNkwCZ4ocI_D94ppZHHH64877B4eY89rfCNjFiwiFoA9bFqYuY4NGtYtptxsKz-Y9-YAIb-sCeIs7iEf3ZOYXEsyXe98TIuMqMycQvTwZGt6dSOO-nP2l78cCrxXKUb1yN3LWGKfSyffWlK6p6F6m-_1hsWOnc_fvIybs67QqOj7KcjyuugUDOjRvC4o0TOc',
    status: 'Niet-actief',
    activeProjects: 3,
    address: '12 Green St, London, UK',
    contactPerson: TEAM_MEMBERS[3],
    lastActivity: 'Gisteren',
  },
  {
    id: '3',
    name: 'BioSphere Inc.',
    industry: 'Wellness',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbnOhRAhxSjg5VHWwwTwVF_o3g_kOBAnHaZMfCIiSTQXZSrovbMMXxgM65czcBJvVDuKiucXh0mcUptuTyhfVclod5vfjFbDMNE1nD19hetKIvTw-ZNoNQD5WUo6v4KPyW8e-pI1OYOEQGKcZHPaROm8-cDeLPGIqfYKmG_d92d0jhDal-Lx1WPcxx73SNHa1lXkZ6WBmCZeTjN4j15cVBQ7zSl_HuCx2Q2Rv4yrye6O63P6TSua2gKd9css30k3-AF-32KQw28eKO',
    status: 'Actief',
    activeProjects: 12,
    address: 'Wall Street 101, New York, NY',
    contactPerson: TEAM_MEMBERS[2],
    lastActivity: '3 dagen geleden',
  },
];

export const TASKS: Task[] = [
  {
    id: '1',
    name: 'Typografie van design system afronden',
    description: 'Zorg ervoor dat alle koppen en body-tekststijlen zijn gedocumenteerd in het Figma-bestand.',
    project: 'PRJ-4829', 
    priority: 'Hoog',
    status: 'In Uitvoering',
    dueDate: '24 okt 2023',
    assignee: TEAM_MEMBERS[1],
    type: 'Extern',
  },
  {
    id: '2',
    name: 'Onboarding flow wireframes',
    description: 'Maak low-fidelity wireframes voor de gebruikersregistratie en login flow.',
    project: 'PRJ-4830',
    priority: 'Gemiddeld',
    status: 'Te Doen',
    dueDate: '26 okt 2023',
    assignee: TEAM_MEMBERS[2],
    type: 'Extern',
  },
  {
    id: '3',
    name: 'Documentatie audit',
    description: 'Bestaande interne documentatie beoordelen op consistentie en nauwkeurigheid.',
    project: 'Intern',
    priority: 'Laag',
    status: 'Te Doen',
    dueDate: '30 okt 2023',
    assignee: TEAM_MEMBERS[3],
    type: 'Intern',
  },
  {
    id: '4',
    name: 'Mobiele responsieve QA',
    description: 'Test de applicatie op verschillende mobiele schermformaten en fix layout bugs.',
    project: 'PRJ-4829',
    priority: 'Hoog',
    status: 'In Uitvoering',
    dueDate: 'Vandaag',
    assignee: TEAM_MEMBERS[0],
    type: 'Intern',
  },
  {
    id: '5',
    name: 'Eerste moodboard maken',
    description: 'Stel de visuele koers vast voor de komende merkvernieuwing.',
    project: 'PRJ-4830',
    priority: 'Gemiddeld',
    status: 'Klaar',
    dueDate: '15 okt 2023',
    assignee: TEAM_MEMBERS[1],
    type: 'Extern',
  },
];

export const INVOICES: Invoice[] = [
  { id: 'INV-2024-042', date: '12 okt 2023', amount: 4200, status: 'Betaald' },
  { id: 'INV-2024-045', date: '28 okt 2023', amount: 8250, status: 'In afwachting' },
  { id: 'INV-2024-039', date: '15 sep 2023', amount: 3100, status: 'Betaald' },
];

export const TICKETS: Ticket[] = [
  {
    id: 'TIC-1024',
    title: 'Login werkt niet op mobiel',
    description: 'Wanneer ik probeer in te loggen via mijn iPhone 13, blijft de knop laden en gebeurt er niets.',
    status: 'Bezig',
    type: 'Probleem',
    priority: 'Hoog',
    client: 'Luminary Digital',
    createdAt: '22 okt 2023',
    updatedAt: '23 okt 2023'
  },
  {
    id: 'TIC-1025',
    title: 'Nieuwe knop toevoegen aan dashboard',
    description: 'Graag een knop toevoegen om snel rapporten te kunnen downloaden.',
    status: 'Nieuw',
    type: 'Wijziging',
    priority: 'Gemiddeld',
    client: 'Luminary Digital',
    createdAt: '23 okt 2023',
    updatedAt: '23 okt 2023'
  }
];

export const MEETINGS: Meeting[] = [
  {
    id: 'MTG-001',
    title: 'Project Kick-off',
    date: '10 nov 2023',
    time: '10:00',
    duration: 60,
    clientId: 'CLI-001',
    location: 'Google Meet',
    notes: 'Doelen besproken. Startdatum vastgelegd op 15 nov.',
    attachments: [{ name: 'briefing_v1.pdf', url: '#' }],
    status: 'Gepland'
  },
  {
    id: 'MTG-002',
    title: 'Kwartaal Review',
    date: '12 nov 2023',
    time: '14:30',
    duration: 45,
    clientId: 'CLI-002',
    location: 'Kantoor Klant',
    notes: '',
    attachments: [],
    status: 'Gepland'
  },
  {
    id: 'MTG-003',
    title: 'Design Presentatie',
    date: '02 nov 2023',
    time: '11:00',
    duration: 90,
    clientId: 'CLI-001',
    location: 'Microsoft Teams',
    notes: 'Klant was zeer tevreden over het homepage design. Aanpassingen gevraagd voor de contactpagina.',
    attachments: [
      { name: 'design_feedback.docx', url: '#' },
      { name: 'presentation.pdf', url: '#' }
    ],
    status: 'Voltooid'
  }
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Nieuwe reactie op offerte',
    message: 'Klant "TechCorp" heeft een opmerking geplaatst bij de offerte voor de nieuwe website.',
    timestamp: '10 min geleden',
    type: 'info',
    read: false,
  },
  {
    id: 'n2',
    title: 'Offerte goedgekeurd',
    message: 'Innovate BV heeft de offerte voor de marketingcampagne digitaal ondertekend.',
    timestamp: '1 uur geleden',
    type: 'success',
    read: false,
  },
  {
    id: 'n3',
    title: 'Deadline naderend',
    message: 'Het project "Website Redesign - AlphaCorp" heeft een naderende deadline (morgen).',
    timestamp: '2 uur geleden',
    type: 'warning',
    read: true,
  },
  {
    id: 'n4',
    title: 'Taak toegewezen',
    message: 'Sarah Miller heeft je toegewezen aan de taak "Logo concepten uitwerken".',
    timestamp: '3 uur geleden',
    type: 'mention',
    read: true,
  },
  {
    id: 'n5',
    title: 'Factuur betaald',
    message: 'Factuur #2024-081 voor klant "EcoSolutions" is succesvol betaald.',
    timestamp: 'Gisteren',
    type: 'success',
    read: true,
  },
  {
    id: 'n6',
    title: 'Nieuw ticket aangemaakt',
    message: 'BetaCorp heeft een nieuw ticket aangemaakt: "Server geeft 500 error".',
    timestamp: 'Gisteren',
    type: 'error',
    read: true,
  },
  {
    id: 'n7',
    title: 'Bestand geüpload',
    message: 'Nieuwe bestanden beschikbaar voor het project "Branding 2024".',
    timestamp: '2 dagen geleden',
    type: 'info',
    read: true,
  },
  {
    id: 'n8',
    title: 'Meeting verplaatst',
    message: 'De wekelijkse sync met Delta Inc is verplaatst naar donderdag om 14:00.',
    timestamp: '2 dagen geleden',
    type: 'warning',
    read: true,
  },
  {
    id: 'n9',
    title: 'Systeem update voltooid',
    message: 'De Graaf applicatie is succesvol bijgewerkt naar versie 2.1.',
    timestamp: '3 dagen geleden',
    type: 'info',
    read: true,
  },
  {
    id: 'n10',
    title: 'Offerte bekeken',
    message: 'Zeta Group heeft de offerte voor "SEO Optimalisatie" zojuist bekeken.',
    timestamp: '3 dagen geleden',
    type: 'info',
    read: true,
  },
  {
    id: 'n11',
    title: 'Oude notificatie',
    message: 'Dit is een oude notificatie die niet getoond zou moeten worden als we limiteren tot 10.',
    timestamp: 'Vorige week',
    type: 'info',
    read: true,
  }
];
