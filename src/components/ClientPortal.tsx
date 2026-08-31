import * as React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Download, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ArrowUpRight,
  User,
  Ticket as TicketIcon,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  Mail,
  Phone
} from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { cn } from '../lib/utils';
import { TicketModal } from './TicketModal';
import { Ticket } from '../types';

interface ClientPortalProps {
  onViewProject?: (id: string) => void;
  onViewAllProjects?: () => void;
  clientId?: string;
}

export const ClientPortal = ({ onViewProject, onViewAllProjects, clientId }: ClientPortalProps) => {
  const { projects, teamMembers, tickets: dbTickets, clients, tasks } = useDatabase();

  // Find current client based on clientId or default to first one
  const currentClient = clients.find(c => c.id === clientId) || clients[0];
  const clientName = currentClient?.name || '';
  
  const [tickets, setTickets] = React.useState<Ticket[]>(dbTickets.filter(t => t.client === clientName));
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);

  if (!currentClient) return <div className="p-12 text-center text-slate-500 font-bold">Geen klanten gevonden.</div>;

  const clientProjects = projects.filter(p => p.client === clientName);
  const clientProjectIds = clientProjects.map(p => p.id);
  const accountManager = currentClient.contactPerson || teamMembers[0] || { name: 'Support', avatar: '' };
  
  // Filter tasks for this client's projects
  const clientTasks = tasks.filter(t => clientProjectIds.includes(t.project) && t.status !== 'Klaar');

  const handleLogTicket = (ticketData: any) => {
    if (selectedTicket) {
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, ...ticketData } : t));
    } else {
      const ticket: Ticket = {
        id: `TIC-${Math.floor(1000 + Math.random() * 9000)}`,
        client: clientName,
        updatedAt: new Date().toLocaleDateString('nl-BE'),
        ...ticketData
      };
      setTickets([ticket, ...tickets]);
    }
  };

  const handleOpenTicket = (ticket?: Ticket) => {
    setSelectedTicket(ticket || null);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="healthy" className="mb-2">Klant Toegang: {currentClient.industry}</Badge>
          <h1 className="text-5xl font-bold text-slate-900">
            Welkom terug, <span className="text-[#7b68ee]">{clientName.split(' ')[0]}</span>.
          </h1>
          <p className="text-slate-500 max-w-xl text-sm font-medium">
            Uw creatieve partnerportaal voor <span className="text-slate-900 font-bold">{clientName}</span>. Bekijk actieve projecten en beheer uw support tickets.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm min-w-[200px]">
          <div className="w-10 h-10 rounded-full bg-[#7b68ee]/10 flex items-center justify-center overflow-hidden shrink-0">
            {accountManager.avatar ? (
              <img src={accountManager.avatar} alt={accountManager.name} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-[#7b68ee]" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400">Account Manager</p>
            <p className="text-sm font-bold text-slate-900">{accountManager.name}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <a href={`mailto:contact@graaf.be`} className="text-slate-400 hover:text-[#7b68ee] transition-colors" title="Stuur e-mail">
                <Mail size={14} />
              </a>
              <a href="tel:+3212345678" className="text-slate-400 hover:text-[#7b68ee] transition-colors" title="Bel">
                <Phone size={14} />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Projects & Tasks */}
        <div className="lg:col-span-2 space-y-12">
          {/* Projects Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <LayoutDashboard size={20} className="text-[#7b68ee]" />
                Actieve Projecten
              </h2>
              <button 
                onClick={onViewAllProjects}
                className="text-xs font-bold text-[#7b68ee] hover:underline"
              >
                Alles Bekijken
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {clientProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="p-6 hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => onViewProject?.(project.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                        <Badge variant="default">{project.id}</Badge>
                      </div>
                      <p className="text-slate-500 text-xs max-w-md">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 mb-1">Voortgang</p>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-[#7b68ee] to-[#2dd4bf] h-full rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-900">{project.progress}%</span>
                        </div>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center text-slate-400 group-hover:bg-[#7b68ee] group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
              {clientProjects.length === 0 && (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                  <HelpCircle className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-medium italic">Geen actieve projecten gevonden voor uw account.</p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle size={20} className="text-[#7b68ee]" />
              Uw Openstaande Taken
            </h2>
            
            <Card className="p-0 overflow-hidden border-none shadow-sm ring-1 ring-black/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-black/5">
                      <th className="w-1 px-0"></th>
                      <th className="px-6 py-4 text-[10px] font-bold text-[#7b68ee]">Taak</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-[#7b68ee]">Toegewezen op</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-[#7b68ee]">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 bg-white">
                    {clientTasks.map((task) => {
                      const statusColor = 
                        task.status === 'Te Doen' ? 'bg-red-500' : 
                        task.status === 'In Uitvoering' ? 'bg-orange-500' : 
                        'bg-[#7b68ee]';

                      return (
                        <tr key={task.id} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                          <td className={cn("w-1 p-0 transition-colors", statusColor)}></td>
                          <td className="px-6 py-4 overflow-hidden">
                            <div className="flex items-center gap-3 truncate">
                              <CheckCircle size={16} className="flex-shrink-0 text-slate-300 group-hover:text-[#7b68ee] transition-colors" />
                              <div className="flex flex-col truncate">
                                <span className="text-xs font-bold text-slate-900 truncate">{task.name}</span>
                                {task.priority === 'Hoog' && (
                                  <span className="text-[8px] font-bold text-red-500">Dringend</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                              <Clock size={12} className="text-slate-300" />
                              20 okt 2023
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">

                              <span className="text-[10px] font-bold text-slate-500 truncate">{(task.assignee?.name || 'Onbekend').split(' ')[0]}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {clientTasks.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs italic">
                          Geen openstaande taken gevonden.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar / Support */}
        <div className="space-y-8">
          <Card className="p-8 border-l-4 border-[#2dd4bf]">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Ondersteuning nodig?</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Heeft u een vraag of een technisch probleem? Log een ticket en ons team gaat er direct mee aan de slag voor <span className="text-slate-900 font-bold">{clientName}</span>.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => setIsTicketModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#f1f5f9] hover:bg-[#e6e8ea] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <TicketIcon size={18} className="text-[#7b68ee]" />
                  <span className="text-xs font-bold text-slate-900">Support Ticket Loggen</span>
                </div>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#7b68ee] transition-transform" />
              </button>
            </div>
          </Card>

          {/* Ticket Status Section */}
          <Card className="p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock size={18} className="text-[#7b68ee]" />
              Ticket Status
            </h3>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => handleOpenTicket(ticket)}
                  className="p-4 rounded-xl bg-slate-50 border border-black/5 space-y-2 cursor-pointer hover:bg-slate-100 hover:border-[#7b68ee]/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="text-[9px]">{ticket.id}</Badge>
                    <Badge 
                      variant={ticket.status === 'Opgelost' ? 'healthy' : ticket.status === 'Nieuw' ? 'on-hold' : 'default'}
                      className="text-[8px] py-0 h-4"
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{ticket.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Laatste update: {ticket.updatedAt}</p>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 italic">Geen actieve tickets</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      <TicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => {
          setIsTicketModalOpen(false);
          setSelectedTicket(null);
        }} 
        onSubmit={handleLogTicket} 
        ticket={selectedTicket}
      />
    </div>
  );
};

