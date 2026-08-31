import * as React from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, CheckCircle2, Lock, 
  User, 
  Link as LinkIcon, 
  Calendar,
  LayoutGrid,
  ClipboardCheck,
  Ticket as TicketIcon,
  Search,
  ArrowUpRight,
  Clock,
  FileText,
  Plus,
  X,
  Mail,
  Phone,
  Users,
  CreditCard
} from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Project, Task, Ticket, Meeting, Client } from '../types';
import { ClientModal } from './ClientModal';

interface ClientDetailsProps {
  clientId?: string;
}

export const ClientDetails = ({ clientId }: ClientDetailsProps) => {
  const { clients, projects, tasks, tickets, meetings, invoices, clientContacts, refreshData } = useDatabase();

  const [activeTab, setActiveTab] = React.useState('projects');
  const [isAddingContact, setIsAddingContact] = React.useState(false);
  const [newContact, setNewContact] = React.useState({ name: '', email: '', role: '', phone: '' });
  const [isSubmittingContact, setIsSubmittingContact] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [isInviting, setIsInviting] = React.useState(false);
  const [inviteSuccess, setInviteSuccess] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  const handleInviteClient = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    setInviteError(null);
    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, clientName: displayClient.name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Er is een fout opgetreden');
      
      setInviteSuccess(true);
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess(false);
        setInviteEmail('');
      }, 3000);
    } catch (e: any) {
      setInviteError(e.message);
    } finally {
      setIsInviting(false);
    }
  };
  const [localClient, setLocalClient] = React.useState<Client | null>(null);
  
  if (!clientId) return null;
  const initialClient = clients.find(c => c.id === clientId);
  if (!initialClient) return <div className="p-8 text-center text-slate-500">Klant niet gevonden.</div>;

  React.useEffect(() => {
    if (initialClient && !localClient) {
      setLocalClient(initialClient);
    }
  }, [initialClient]);

  const displayClient = localClient || initialClient;

  const handleSaveClient = (updatedClient: Client) => {
    setLocalClient(updatedClient);
    setIsEditModalOpen(false);
  };

  const clientProjects = projects.filter(p => p.client === displayClient.name);
  const clientTasks = tasks.filter(t => clientProjects.some(cp => cp.name === t.project));
  const clientTickets = tickets.filter(t => t.client === displayClient.name);
  const clientMeetings = meetings.filter(m => m.clientId === displayClient.id);

  const clientInvoices = invoices; // Mocked for now

  const tabs = [
    { id: 'projects', label: 'Projecten', count: clientProjects.length, icon: LayoutGrid },
    { id: 'tasks', label: 'Taken', count: clientTasks.length, icon: ClipboardCheck },
    { id: 'tickets', label: 'Tickets', count: clientTickets.length, icon: TicketIcon },
    { id: 'meetings', label: 'Meetings', count: clientMeetings.length, icon: Calendar },
    // { id: 'documents', label: 'Documenten', count: 5, icon: FileText },
    { id: 'invoices', label: 'Facturen', count: clientInvoices.length, icon: CreditCard },
    { id: 'contacts', label: 'Contactpersonen', count: clientContacts.filter(c => c.client_id === displayClient.id).length, icon: Users },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-3xl font-bold text-[#7b68ee]">
            {displayClient.logo ? <img src={displayClient.logo} alt={displayClient.name} className="w-full h-full object-cover rounded-2xl" /> : displayClient.name.charAt(0)}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold text-slate-900 leading-none">{displayClient.name}</h2>
              <Badge variant={displayClient.status === 'Actief' ? 'healthy' : 'on-hold'}>
                {displayClient.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><Building2 size={16}/> {displayClient.industry}</span>
              <span className="flex items-center gap-1.5"><MapPin size={16}/> {displayClient.address}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 border-[#7b68ee] text-[#7b68ee] hover:bg-[#7b68ee]/5" onClick={() => { setIsInviteModalOpen(true); setInviteEmail(displayClient.email || ''); }}>
              <Lock size={16} />
              Activeer Portaal
            </Button>
            <Button variant="secondary" className="gap-2" onClick={() => setIsEditModalOpen(true)}>
              Bewerk Klant
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all",
              activeTab === tab.id 
                ? "border-[#7b68ee] text-[#7b68ee]" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] ml-1",
              activeTab === tab.id ? "bg-[#7b68ee]/10" : "bg-slate-100"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        
        

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Contactpersonen</h3>
              <Button onClick={() => setIsAddingContact(true)} size="sm" className="gap-2">
                <Plus size={16} /> Contact toevoegen
              </Button>
            {isAddingContact && (
              <Card className="p-6 bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4">Nieuw contact toevoegen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Naam *</label>
                    <input type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#7b68ee]/30 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">E-mail (vereist voor portaal)</label>
                    <input type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#7b68ee]/30 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Functie</label>
                    <input type="text" value={newContact.role} onChange={e => setNewContact({...newContact, role: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#7b68ee]/30 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Telefoon</label>
                    <input type="text" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#7b68ee]/30 outline-none transition-all" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setIsAddingContact(false)}>Annuleren</Button>
                  <Button 
                    size="sm" 
                    disabled={!newContact.name || isSubmittingContact}
                    onClick={async () => {
                      setIsSubmittingContact(true);
                      try {
                        const { supabase } = await import('../lib/supabase');
                        const { error } = await supabase.from('client_contacts').insert([{
                          client_id: displayClient.id,
                          name: newContact.name,
                          email: newContact.email,
                          role: newContact.role,
                          phone: newContact.phone
                        }]);
                        if (error) throw error;
                        
                        if (newContact.email) {
                          try {
                            const inviteRes = await fetch('/api/auth/invite', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                email: newContact.email,
                                data: {
                                  role: 'client',
                                  client_id: displayClient.id,
                                  name: newContact.name
                                }
                              })
                            });
                            if (!inviteRes.ok) console.error("Kon email niet uitnodigen");
                          } catch(e) {}
                        }
                        
                        await refreshData();
                        setIsAddingContact(false);
                        setNewContact({ name: '', email: '', role: '', phone: '' });
                      } catch (err: any) {
                        alert('Fout bij toevoegen: ' + err.message);
                      } finally {
                        setIsSubmittingContact(false);
                      }
                    }}
                  >
                    {isSubmittingContact ? 'Bezig...' : 'Opslaan & Uitnodigen'}
                  </Button>
                </div>
              </Card>
            )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientContacts.filter(c => c.client_id === displayClient.id).length > 0 ? (
                clientContacts.filter(c => c.client_id === displayClient.id).map(contact => (
                  <Card key={contact.id} className="p-6 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">
                          {contact.name.substring(0,2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{contact.name}</h4>
                          <p className="text-[10px] font-bold text-[#7b68ee] uppercase tracking-wider">{contact.role || 'Contact'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if(window.confirm('Verwijderen?')) {
                            import('../lib/supabase').then(({ supabase }) => {
                              supabase.from('client_contacts').delete().eq('id', contact.id).then(() => refreshData());
                            });
                          }
                        }}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="space-y-2 mt-4 text-xs text-slate-500 font-medium">
                      {contact.email && <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {contact.email}</div>}
                      {contact.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {contact.phone}</div>}
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic col-span-full">Geen contactpersonen gevonden.</p>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientProjects.length > 0 ? clientProjects.map(project => (
              <Card key={project.id} className="p-6 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-[#7b68ee] transition-colors">{project.name}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">{project.category}</p>
                  </div>
                  <Badge variant={project.status === 'Klaar' ? 'healthy' : 'default'}>{project.status}</Badge>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                      <span>Voortgang</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7b68ee]" style={{width: `${project.progress}%`}} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-4 border-t border-slate-100">
                    <span className="flex items-center gap-1.5"><Calendar size={14}/> {project.deadline || 'Geen deadline'}</span>
                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#7b68ee] transition-colors" />
                  </div>
                </div>
              </Card>
            )) : (
              <p className="text-slate-400 text-sm italic col-span-full">Geen projecten gevonden.</p>
            )}
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="space-y-4">
            {clientMeetings.length > 0 ? clientMeetings.map(meeting => (
              <Card key={meeting.id} className="p-6 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group border-none ring-1 ring-black/5">
                <div className="flex items-center gap-6">
                  <div className="bg-[#7b68ee]/5 p-4 rounded-xl text-center min-w-[100px]">
                    <p className="text-[#7b68ee] text-xs font-bold mb-1">{meeting.date}</p>
                    <p className="text-slate-900 text-lg font-bold leading-none">{meeting.time}</p>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-[#7b68ee] transition-colors">{meeting.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5"><MapPin size={14}/> {meeting.location}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14}/> {meeting.duration} min</span>
                    </div>
                  </div>
                </div>
                <Badge variant={meeting.status === 'Voltooid' ? 'healthy' : meeting.status === 'Gepland' ? 'default' : 'on-hold'}>
                  {meeting.status}
                </Badge>
              </Card>
            )) : (
              <p className="text-slate-400 text-sm italic">Geen meetings gevonden.</p>
            )}
          </div>
        )}

        {/* Tasks & Tickets */}
        {(activeTab === 'tasks' || activeTab === 'tickets') && (
          <Card className="p-12 text-center border-dashed border-2 bg-slate-50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {activeTab === 'tasks' ? 'Lijst met taken' : 'Lijst met tickets'}
            </h3>
            <p className="text-slate-500 text-sm">
              Hier komt een overzicht (tabel) van alle {activeTab === 'tasks' ? 'taken' : 'tickets'} gekoppeld aan {displayClient.name}.
            </p>
          </Card>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <Card className="p-12 text-center border-dashed border-2 bg-slate-50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="text-[#7b68ee]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Documenten</h3>
            <p className="text-slate-500 text-sm mb-6">Beheer offertes, contracten en opleverdocumenten voor {displayClient.name}.</p>
            <Button className="mx-auto gap-2">
              <Search size={16} /> Upload Document
            </Button>
          </Card>
        )}

        {/* Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {clientInvoices.length > 0 ? clientInvoices.map(invoice => (
              <Card key={invoice.id} className="p-6 flex items-center justify-between hover:shadow-md transition-all cursor-pointer border-none ring-1 ring-black/5">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-[#7b68ee]/10 flex items-center justify-center text-[#7b68ee]">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{invoice.id}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-1">Gefactureerd op {invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-lg font-bold text-slate-900">€{invoice.amount.toLocaleString('nl-BE')}</span>
                  <Badge variant={invoice.status === 'Betaald' ? 'healthy' : 'on-hold'}>
                    {invoice.status}
                  </Badge>
                </div>
              </Card>
            )) : (
              <p className="text-slate-400 text-sm italic">Geen facturen gevonden.</p>
            )}
          </div>
        )}

      </div>
      <ClientModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={displayClient}
        onSave={handleSaveClient}
      />
    
      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#7b68ee]" />
                Geef Klant Portaal Toegang
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {inviteSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Uitnodiging Verzonden!</h4>
                  <p className="text-sm text-slate-500">De klant ontvangt nu een e-mail om veilig een eigen wachtwoord in te stellen.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600">
                    Stuur een uitnodiging naar <strong>{displayClient.name}</strong>. Zij ontvangen een e-mail met een eenmalige link om hun wachtwoord in te stellen.
                  </p>
                  {inviteError && (
                    <div className="p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg border border-rose-100">
                      {inviteError}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">E-mailadres Klant</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#7b68ee]"
                      placeholder="naam@bedrijf.be"
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)}>Annuleren</Button>
                    <Button 
                      variant="primary" 
                      onClick={handleInviteClient} 
                      disabled={isInviting || !inviteEmail}
                      className="bg-[#7b68ee] hover:bg-[#6a5ad6]"
                    >
                      {isInviting ? 'Verzenden...' : 'Verstuur Uitnodiging'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
