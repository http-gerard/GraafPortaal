import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Client, Project, Task, TeamMember, Ticket, Meeting, Invoice, AppNotification, ClientContact } from '../types';

interface DatabaseContextType {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  tickets: Ticket[];
  meetings: Meeting[];
  invoices: Invoice[];
  notifications: AppNotification[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  clientContacts: ClientContact[];
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientContacts, setClientContacts] = useState<ClientContact[]>([]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: clientsData },
        { data: projectsData },
        { data: tasksData },
        { data: teamData },
        { data: ticketsData },
        { data: meetingsData },
        { data: invoicesData },
        { data: contactsData, error: contactsError }
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('tickets').select('*'),
        supabase.from('meetings').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('client_contacts').select('*')
      ]);

      const mappedTeam = (teamData || []).map(t => ({
        id: t.id,
        name: t.name,
        avatar: t.avatar || '',
        role: t.role
      }));
      setTeamMembers(mappedTeam);

      const mappedClients = (clientsData || []).map(c => ({
        id: c.id,
        name: c.name,
        industry: c.industry || '',
        logo: c.logo || '',
        status: c.status,
        activeProjects: 0,
        address: c.address || '',
        contactPerson: mappedTeam.find(t => t.id === c.contact_person_id) || mappedTeam[0],
        lastActivity: c.last_activity
      }));
      setClients(mappedClients);

      const mappedProjects = (projectsData || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        status: p.status,
        progress: p.progress,
        client: mappedClients.find(c => c.id === p.client_id)?.name || '',
        team: [], 
        lastUpdated: p.last_updated,
        deadline: p.deadline,
        category: p.category || '',
        phase: p.phase || ''
      }));
      setProjects(mappedProjects);

      const mappedTasks = (tasksData || []).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        project: mappedProjects.find(p => p.id === t.project_id)?.name || '',
        priority: t.priority,
        status: t.status,
        dueDate: t.due_date,
        assignee: mappedTeam.find(member => member.id === t.assignee_id),
        type: t.type
      }));
      setTasks(mappedTasks);
      
      const mappedTickets = (ticketsData || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        type: t.type,
        priority: t.priority,
        client: mappedClients.find(c => c.id === t.client_id)?.name || '',
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }));
      setTickets(mappedTickets);

      const mappedMeetings = (meetingsData || []).map(m => ({
        id: m.id,
        title: m.title,
        date: m.date,
        time: m.time,
        duration: m.duration || 60,
        clientId: m.client_id,
        projectId: m.project_id,
        location: m.location || '',
        notes: m.notes || '',
        attachments: m.attachments || [],
        status: m.status,
        outlook_uid: m.outlook_uid,
        isOutlook: !!m.outlook_uid
      }));
      setMeetings(mappedMeetings);

      const mappedInvoices = (invoicesData || []).map(i => ({
        id: i.id,
        client: mappedClients.find(c => c.id === i.client_id)?.name || '',
        amount: i.amount,
        date: i.date,
        status: i.status,
        dueDate: i.due_date,
        pdfUrl: i.pdf_url
      }));
      setInvoices(mappedInvoices);
      
      if (contactsData && !contactsError) setClientContacts(contactsData);
      else if (contactsError && contactsError.code === '42P01') console.warn('No client_contacts table yet');

    } catch (error) {
      console.error("Fout bij laden van Supabase data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <DatabaseContext.Provider value={{
      clients, projects, tasks, teamMembers, tickets, meetings, invoices, notifications,
      isLoading, refreshData: fetchAllData, clientContacts
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
