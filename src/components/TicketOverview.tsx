import * as React from 'react';
import { 
  Ticket as TicketIcon, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Ticket, TicketStatus } from '../types';
import { AnimatePresence } from 'motion/react';

import { TicketModal } from './TicketModal';

export const TicketOverview = () => {
  const { tickets: dbTickets, clients, refreshData } = useDatabase();

  const [tickets, setTickets] = React.useState<Ticket[]>(dbTickets);
  React.useEffect(() => setTickets(dbTickets), [dbTickets]);
  const [filterStatus, setFilterStatus] = React.useState<string>('Alle');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleAddTicket = async (ticketData: any) => {
    try {
      if (selectedTicket) {
        // Update existing in DB
        const { error } = await supabase.from('tickets').update({
          title: ticketData.title,
          description: ticketData.description,
          type: ticketData.type,
          priority: ticketData.priority,
          status: ticketData.status,
        }).eq('id', selectedTicket.id);
        
        if (!error) {
          setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, ...ticketData } : t));
          refreshData(); // Refresh from DB
        }
      } else {
        // Add new to DB
        // We might not have a client_id in ticketData, so we can omit it or set it to null.
        const { data, error } = await supabase.from('tickets').insert({
          title: ticketData.title,
          description: ticketData.description,
          type: ticketData.type,
          priority: ticketData.priority,
          status: ticketData.status,
          // client_id: ... if we had it
        }).select().single();
        
        if (data && !error) {
          setTickets([{ ...ticketData, id: data.id, client: 'Internal', createdAt: data.created_at }, ...tickets]);
          refreshData();
        }
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleOpenModal = (ticket?: Ticket) => {
    if (ticket) {
      setSelectedTicket(ticket);
    } else {
      setSelectedTicket(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filterStatus === 'Alle' || t.status === filterStatus;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'Nieuw').length,
    inProgress: tickets.filter(t => t.status === 'Bezig').length,
    resolved: tickets.filter(t => t.status === 'Opgelost').length,
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'Nieuw': return 'on-hold';
      case 'Bezig': return 'default';
      case 'Opgelost': return 'healthy';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoog': return 'text-red-500 bg-red-50';
      case 'Gemiddeld': return 'text-amber-500 bg-amber-50';
      case 'Laag': return 'text-blue-500 bg-blue-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <span className="text-[#7b68ee] font-bold tracking-[0.2em] text-[10px]">Service & Support</span>
          <h1 className="text-5xl font-bold text-slate-900 leading-none mb-4">Support Tickets</h1>
          <p className="text-slate-500 max-w-2xl text-sm leading-relaxed font-medium">Blijf op de hoogte van alle klantvragen en problemen.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-3 shadow-xl">
          <PlusCircle size={20} />
          Nieuw Ticket
        </Button>
      </header>

      <section>
        <div className="flex bg-[#f1f5f9] p-1 rounded-2xl w-fit">
          {['Alle', 'Nieuw', 'Bezig', 'Opgelost'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-6 py-2 text-[10px] font-bold rounded-xl transition-all  ",
                filterStatus === status 
                  ? "bg-white text-[#7b68ee] shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Totaal', value: stats.total, icon: TicketIcon, color: 'text-[#7b68ee]' },
          { label: 'Nieuw', value: stats.new, icon: AlertCircle, color: 'text-amber-500' },
          { label: 'In Behandeling', value: stats.inProgress, icon: Clock, color: 'text-blue-500' },
          { label: 'Opgelost', value: stats.resolved, icon: CheckCircle2, color: 'text-[#2dd4bf]' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-[#f1f5f9]", stat.color)}>
              <stat.icon size={24} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tickets List */}
      <Card className="overflow-hidden border-none shadow-xl shadow-black/[0.02]">
        <div className="bg-[#f1f5f9]/30 p-6 border-b border-black/5 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Zoeken naar tickets..." 
              className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#7b68ee]/10 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="tertiary" size="sm" className="gap-2">
            <Filter size={16} /> Filters
          </Button>
        </div>
        
        <div className="divide-y divide-black/5">
          {filteredTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="group hover:bg-[#f1f5f9]/40 transition-colors p-6 cursor-pointer"
              onClick={() => handleOpenModal(ticket)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-xs",
                    getPriorityColor(ticket.priority)
                  )}>
                    {ticket.priority.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">{ticket.id}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-[10px] font-bold text-[#7b68ee]">{ticket.client}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{ticket.title}</h3>
                    <p className="text-slate-500 text-xs line-clamp-1">{ticket.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">Status</p>
                    <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">Datum</p>
                    <p className="text-xs font-bold text-slate-900">{ticket.updatedAt}</p>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-slate-400 hover:text-[#7b68ee] hover:border-[#7b68ee]/20 transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="p-20 text-center text-slate-500">Geen tickets gevonden.</div>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <TicketModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleAddTicket}
            ticket={selectedTicket}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
