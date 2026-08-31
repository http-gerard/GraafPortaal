import * as React from 'react';
import { X, Trash2, Shield, Globe, MapPin, Building2, User, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Button, Badge } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { Client, ClientStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (client: Client) => void;
  onDelete?: (id: string) => void;
}

export const ClientModal = ({ isOpen, onClose, client, onSave, onDelete }: ClientModalProps) => {
  const { teamMembers } = useDatabase();

  const [formData, setFormData] = React.useState<Partial<Client>>({
    name: '',
    industry: '',
    address: '',
    status: 'Actief' as ClientStatus,
    activeProjects: 0,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA83dVKy2Ehv_RKnm_HihluAPsF6dFrXDrZJ3duLwHyR6ujZHPr4Wm88PQrxGuxMkGdlM0BCGpZG88V308p4h7i0rXtOQTBJoOGWuazrh8_GaZX5glqyhuVkDG3JlGg07xH7fat2kj9XscbaRBwkUtJv8xUK65WCnona7u__kmlws_aRPhKaLb6j02PSJZVB_5lFvIGPOK0CfRmUN-mu5-nPqphI-UzbVag9wKpy2xfUrXaVujN6KDkqDuJO6n77O0GxTIuAOzKUUnl',
    contactPerson: teamMembers[0],
    lastActivity: 'Zojuist',
  });

  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: '',
        industry: '',
        address: '',
        status: 'Actief' as ClientStatus,
        activeProjects: 0,
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA83dVKy2Ehv_RKnm_HihluAPsF6dFrXDrZJ3duLwHyR6ujZHPr4Wm88PQrxGuxMkGdlM0BCGpZG88V308p4h7i0rXtOQTBJoOGWuazrh8_GaZX5glqyhuVkDG3JlGg07xH7fat2kj9XscbaRBwkUtJv8xUK65WCnona7u__kmlws_aRPhKaLb6j02PSJZVB_5lFvIGPOK0CfRmUN-mu5-nPqphI-UzbVag9wKpy2xfUrXaVujN6KDkqDuJO6n77O0GxTIuAOzKUUnl',
        contactPerson: teamMembers[0],
        lastActivity: 'Zojuist',
      });
    }
  }, [client, isOpen]);

  const generatePortalLink = () => {
    if (!client?.id && !formData.name) return 'Link wordt gegenereerd...';
    const id = client?.id || 'NEW-ID';
    return `${window.location.origin}/?portal=${id}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatePortalLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: client?.id || `CLI-${Math.floor(Math.random() * 10000)}`,
    } as Client);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="p-10 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {client ? 'Klantrecord Wijzigen' : 'Nieuwe Klant Registreren'}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={formData.status === 'Actief' ? 'healthy' : 'on-hold'}>
                {formData.status}
              </Badge>
              <span className="text-[10px] text-slate-500 font-bold leading-none">
                {client ? `ID: ${client.id}` : 'Profiel Concept'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="flex-1 overflow-y-auto" onSubmit={handleSubmit}>
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                  <Building2 size={12} className="text-[#7b68ee]" />
                  Bedrijfsnaam
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="bijv. Luminary Digital"
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                  <Globe size={12} className="text-[#7b68ee]" />
                  Industrie
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="bijv. Fintech, Vastgoed"
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                <MapPin size={12} className="text-[#7b68ee]" />
                Hoofdkantoor Adres
              </label>
              <input 
                required
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Volledig kantooradres..."
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                  <Shield size={12} className="text-[#7b68ee]" />
                  Account Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all appearance-none"
                >
                  <option value="Actief">Actief</option>
                  <option value="Niet-actief">Niet-actief</option>
                  
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                  <User size={12} className="text-[#7b68ee]" />
                  Primair Contactpersoon
                </label>
                <select 
                  value={formData.contactPerson?.id}
                  onChange={(e) => {
                    const person = teamMembers.find(t => t.id === e.target.value);
                    if (person) setFormData({ ...formData, contactPerson: person });
                  }}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all appearance-none"
                >
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Portal Link Section */}
            <div className="p-6 bg-[#7b68ee]/5 rounded-[2rem] border border-[#7b68ee]/10 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#7b68ee] flex items-center gap-2">
                  <LinkIcon size={12} />
                  Gegenereerde Portaal Link
                </label>
                {client && (
                  <Badge variant="healthy" className="text-[8px] h-4">Actief Portaal</Badge>
                )}
              </div>
              <div className="relative group">
                <input 
                  readOnly
                  type="text" 
                  value={generatePortalLink()}
                  className="w-full bg-white border border-[#7b68ee]/20 rounded-xl p-4 pr-24 text-xs font-mono text-slate-600 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={cn(
                    "absolute right-2 top-2 bottom-2 px-4 rounded-lg flex items-center gap-2 text-[10px] font-bold   transition-all",
                    copied ? "bg-[#2dd4bf] text-white" : "bg-[#7b68ee] text-white hover:bg-[#005a50]"
                  )}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Gekopieerd' : 'Kopieer'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">
                Deel deze link met de klant om ze toegang te geven tot hun afgeschermde omgeving.
              </p>
            </div>

            </div>


            
          <div className="p-8 border-t border-black/5 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 sticky bottom-0">
              {client && onDelete && (
                <button 
                  type="button"
                  onClick={() => { onDelete(client.id); onClose(); }}
                  className="text-red-500 flex items-center gap-2 text-xs font-bold hover:opacity-70 transition-opacity"
                >
                  <Trash2 size={16} />
                  Account Beëindigen
                </button>
              )}
              {!client && <div className="flex-1" />}
              <div className="flex gap-4 w-full md:w-auto">
                <Button type="button" variant="secondary" className="flex-1 md:flex-none" onClick={onClose}>Annuleren</Button>
                <Button type="submit" className="flex-1 md:flex-none">
                  {client ? 'Record Bijwerken' : 'Account Aanmaken'}
                </Button>
              </div>
            </div>
        </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

