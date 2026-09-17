import * as React from 'react';
import { UserPlus, Search, Filter, PlusCircle, Link as LinkIcon, Copy, Check, RefreshCw, Building2 } from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { supabase } from '../lib/supabase';
import { ClientModal } from './ClientModal';
import { Client } from '../types';
import { AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ClientsProps {
  onViewClient: (id: string) => void;
}

export const Clients = ({ onViewClient }: ClientsProps) => {
  const { clients, refreshData } = useDatabase();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [copyingId, setCopyingId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncToast, setSyncToast] = React.useState<string | null>(null);

  const handleSyncTeamleader = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/teamleader', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncToast(data.message || 'Teamleader gesynchroniseerd!');
        await refreshData();
      } else {
        setSyncToast('Fout bij syncen: ' + (data.error || 'Onbekende fout'));
      }
    } catch (e: any) {
      setSyncToast('Fout: ' + e.message);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncToast(null), 5000);
    }
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCopyPortalLink = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    const link = `${window.location.origin}/?portal=${clientId}`;
    
    const fallbackCopy = () => {
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
        setCopyingId(clientId);
        setTimeout(() => setCopyingId(null), 2000);
      } catch(e) {
        window.prompt('Kopieer deze link:', link);
      }
      document.body.removeChild(input);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setCopyingId(clientId);
        setTimeout(() => setCopyingId(null), 2000);
      }).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const handleSave = async (client: Client) => {
    try {
      const isNew = client.id.startsWith('new-') || client.id.length < 10;
      
      if (!isNew) {
        await supabase.from('clients').update({
          name: client.name,
          industry: client.industry,
          status: client.status,
          address: client.address
        }).eq('id', client.id);
      } else {
        const { error } = await supabase.from('clients').insert([{
          name: client.name,
          industry: client.industry,
          status: client.status,
          address: client.address
        }]);
        if (error) throw error;
      }
      await refreshData();
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('Fout bij opslaan');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('clients').delete().eq('id', id);
      await refreshData();
      setIsModalOpen(false);
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {syncToast && (
        <div className="p-4 rounded-xl bg-[#7b68ee]/10 border border-[#7b68ee]/20 flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#7b68ee]" />
            <span className="text-xs font-bold text-slate-800">{syncToast}</span>
          </div>
          <button 
            onClick={() => setSyncToast(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-700"
          >
            Sluiten
          </button>
        </div>
      )}

      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <span className="text-[#7b68ee] font-bold tracking-[0.2em] text-[10px]">Strategische Samenwerkings Hub</span>
          <h2 className="text-6xl font-bold text-slate-900 leading-none mb-2">Client Hub</h2>
          <p className="text-slate-500 max-w-2xl text-sm leading-relaxed font-medium">Beheer actieve partnerschappen, manage verwachtingen en volg groeimetrieken in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary"
            onClick={handleSyncTeamleader}
            disabled={isSyncing}
            className="gap-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
          >
            <RefreshCw size={16} className={`text-[#7b68ee] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Teamleader Syncen...' : 'Sync Teamleader'}</span>
          </Button>
          <Button onClick={handleOpenAdd} className="gap-3 shadow-xl">
            <PlusCircle size={20} />
            Nieuwe Klant
          </Button>
        </div>
      </header>

      <section className="flex flex-col items-end gap-4">
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl ring-1 ring-black/5 text-slate-400">
             <Search size={16} />
             <input type="text" placeholder="Klanten zoeken..." className="bg-transparent border-none text-xs font-bold outline-none placeholder:text-slate-300 w-32" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
           </div>
           <Button variant="secondary" size="sm" className="gap-2 px-4">
              <Filter size={16} />
              <span className="text-[10px]">Filter</span>
           </Button>
        </div>
      </section>

      <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-teal-900/5 ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-black/5 text-[10px] font-bold text-[#7b68ee]">
                <th className="px-6 py-4">Bedrijfsnaam</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Portaal Toegang</th>
                <th className="px-4 py-4">Locatie</th>
                <th className="px-6 py-4 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  onClick={() => onViewClient(client.id)}
                  className="group hover:bg-[#f1f5f9]/60 transition-all duration-300 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">{client.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{client.industry}</div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={client.status === 'Actief' ? 'healthy' : 'on-hold'}>
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={(e) => handleCopyPortalLink(e, client.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-bold   transition-all",
                        copyingId === client.id 
                          ? "bg-[#2dd4bf] border-[#2dd4bf] text-white" 
                          : "bg-white border-black/10 text-slate-500 hover:text-[#7b68ee] hover:border-[#7b68ee]/30"
                      )}
                    >
                      {copyingId === client.id ? <Check size={12} /> : <LinkIcon size={12} />}
                      {copyingId === client.id ? 'Gekopieerd' : 'Kopieer Link'}
                    </button>
                  </td>
                  <td className="px-4 py-4 font-bold text-xs text-slate-600 truncate max-w-[150px]">
                    {client.address}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-900 leading-none mb-0.5">{client.contactPerson?.name || "Geen contactpersoon"}</span>
                      <span className="text-[9px] font-bold text-slate-400">{client.contactPerson?.role || ""}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length > 20 && (
          <div className="px-10 py-6 bg-[#f8fafc] border-t border-black/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-900">Pagina 01</span>
               <span className="text-[10px] font-bold text-slate-400 opacity-60">Toont {filteredClients.length} actieve records</span>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-2.5 rounded-xl border border-black/10 text-[10px] font-bold text-slate-400 hover:bg-[#e2e8f0] transition-all disabled:opacity-30" disabled>Vorige</button>
              <button className="px-6 py-2.5 rounded-xl border border-black/10 text-[10px] font-bold text-slate-900 hover:bg-[#e2e8f0] transition-all">Volgende</button>
            </div>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <ClientModal 
            isOpen={isModalOpen}
            client={selectedClient}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

