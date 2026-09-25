export type BillingType = 'one_off' | 'monthly' | 'yearly' | 'hourly';

export interface ServiceItem {
  id: string;
  categoryId: string;
  name: string;
  code?: string;
  shortDescription: string;
  detailedScope: string[];
  deliverables?: string[];
  billingType: BillingType;
  defaultPrice: number;
  price: number;
  quantity: number;
  unit: string; // e.g. "project", "uur", "maand", "concept"
  selected: boolean;
  isOptional?: boolean;
  discountPercent?: number;
  isCustom?: boolean;
  estimatedDays?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  color: string; // e.g. "#BAF800", "#7C3AED", "#3B82F6", "#EC4899"
  badge: string;
  shortDescription: string;
  valueProposition: {
    title: string;
    description: string;
    businessImpacts: string[];
    whyStudioGraaf: string;
    roiFocus: string;
  };
  defaultExpanded?: boolean;
}

export interface ClientInfo {
  companyName: string;
  contactPerson: string;
  jobTitle?: string;
  email: string;
  phone: string;
  vatNumber: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  website?: string;
  teamleaderId?: string;
  teamleaderDealId?: string;
}

export type QuoteStatus = 'concept' | 'in_review' | 'gepresenteerd' | 'verzonden' | 'akkoord';

export interface TimelinePhase {
  id: string;
  phaseNumber: number;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
}

export interface DigitalSignature {
  signedBy: string;
  jobTitle: string;
  email: string;
  signedAt: string;
  signatureImage?: string; // base64 or drawn
  ipAddress?: string;
  termsAccepted: boolean;
  confirmationSentToClient: boolean;
  confirmationSentToStudioGraaf: boolean;
}

export interface QuoteInvoice {
  id: string;
  invoiceNumber: string;
  type: 'advance_30' | 'advance_50' | 'advance_custom' | 'final' | 'full_100';
  percentage: number;
  description: string;
  amountExclVat: number;
  vatAmount: number;
  amountInclVat: number;
  platform: 'teamleader' | 'billit';
  status: 'synced' | 'draft' | 'paid';
  structuredMessage: string;
  peppolCompliant: boolean;
  createdAt: string;
  dueDate: string;
}

export interface SectionAnalytics {
  sectionId: string;
  name: string;
  percentage: number;
  timeSpentMinutes: number;
  interestLevel: 'high' | 'medium' | 'normal';
}

export interface TrackingEvent {
  id: string;
  timestamp: string;
  action: string;
  device: string;
  location: string;
  icon: string;
  details?: string;
}

export interface QuoteAnalytics {
  totalViews: number;
  uniqueDevices: number;
  totalTimeMinutes: number;
  firstViewedAt: string;
  lastViewedAt: string;
  lastDevice: string;
  engagementScore: number; // 0 - 100
  sections: SectionAnalytics[];
  events: TrackingEvent[];
}

export interface QuoteData {
  id: string;
  quoteNumber: string;
  version: number;
  status: QuoteStatus;
  createdAt: string;
  validUntil: string;
  projectName: string;
  projectSummary: string;
  salesRepresentative: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  client: ClientInfo;
  categories: ServiceCategory[];
  items: ServiceItem[];
  overallDiscountType: 'percentage' | 'fixed';
  overallDiscountValue: number;
  vatRate: number; // e.g. 21 for 21%
  paymentTerms: string;
  
  timelinePhases: TimelinePhase[];
  customTexts?: {
    introduction?: string;
    approach?: string;
    aboutUs?: string;
  };

  customIntroMessage?: string;
  generalTermsAccepted?: boolean;
  digitalSignature?: DigitalSignature;
  invoices?: QuoteInvoice[];
  analytics?: QuoteAnalytics;
}

export interface TeamleaderCompany {
  id: string;
  name: string;
  vatNumber: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  deals: TeamleaderDeal[];
  primaryContact: {
    name: string;
    jobTitle: string;
    email: string;
    phone: string;
  };
}

export interface TeamleaderDeal {
  id: string;
  title: string;
  estimatedValue: number;
  phase: string;
  probability: number;
  responsibleUser: string;
}
