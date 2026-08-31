export type Priority = 'Laag' | 'Gemiddeld' | 'Hoog';
export type TaskStatus = 'Te Doen' | 'In Uitvoering' | 'Klaar';
export type ProjectStatus = 'Open' | 'In Uitvoering' | 'Klaar';
export type ClientStatus = 'Actief' | 'Niet-actief';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  client: string;
  team: TeamMember[];
  lastUpdated: string;
  deadline?: string;
  category: string;
  phase?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  project: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  assignee?: TeamMember;
  type?: 'Intern' | 'Extern';
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  logo: string;
  status: ClientStatus;
  activeProjects: number;
  address: string;
  contactPerson: TeamMember;
  lastActivity: string;
}

export type InvoiceStatus = 'Betaald' | 'In afwachting';
export type TicketStatus = 'Nieuw' | 'Bezig' | 'Opgelost';
export type TicketType = 'Probleem' | 'Wijziging' | 'Vraag';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  priority: Priority;
  client: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
}
export type MeetingStatus = 'Gepland' | 'Voltooid' | 'Geannuleerd';

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number; // in minutes
  clientId?: string;
  projectId?: string;
  location: string;
  notes: string;
  attachments: { name: string; url: string }[]; // Document links
  outlook_uid?: string;
  isOutlook?: boolean;
  status: MeetingStatus;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'mention';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  read: boolean;
  link?: string;
}

export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  email?: string;
  role?: string;
  phone?: string;
}
