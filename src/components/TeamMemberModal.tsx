import * as React from 'react';
import { X, User, Shield, Mail, Phone, Info } from 'lucide-react';
import { Button } from './UI';
import { TeamMember } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TeamMemberModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSave: (member: TeamMember) => void;
  onDelete?: (id: string) => void;
}

export const TeamMemberModal = ({ isOpen, member, onClose, onSave, onDelete }: TeamMemberModalProps) => {
  const [formData, setFormData] = React.useState<Partial<TeamMember>>({
    name: '',
    role: 'Creatief Ontwerper',
    avatar: '', // We don't use photos, but keeping field for type compatibility
  });

  React.useEffect(() => {
    if (member) {
      setFormData(member);
    } else {
      setFormData({
        name: '',
        role: 'Creatief Ontwerper',
        avatar: '',
      });
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: member?.id || `TM-${Math.floor(Math.random() * 10000)}`,
    } as TeamMember);
    onClose();
  };

  const roles = [
    'Agency Beheerder',
    'Creatief Directeur',
    'Senior Ontwerper',
    'Junior Ontwerper',
    'Software Ontwikkelaar',
    'Projectmanager',
    'Copywriter',
    'Marketingspecialist'
  ];

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
        <div className="p-10 border-b border-black/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {member ? 'Bewerk Teamlid' : 'Nieuw Teamlid'}
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-1">Teambeheer</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          <div className="p-10 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                <User size={12} className="text-[#7b68ee]" />
                Volledige Naam
              </label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all placeholder:font-normal placeholder:text-slate-400"
                placeholder="Bijv. Sarah Peeters"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                <Mail size={12} className="text-[#7b68ee]" />
                E-mailadres
              </label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all placeholder:font-normal placeholder:text-slate-400"
                placeholder="sarah@agency.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                <Shield size={12} className="text-[#7b68ee]" />
                Rol / Functie
              </label>
              <select 
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all appearance-none"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-10 border-t border-black/5 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 sticky bottom-0">
             {member && onDelete && (
               <button 
                 type="button" 
                 onClick={() => {
                   if (confirm('Weet je zeker dat je dit teamlid wilt verwijderen?')) {
                     onDelete(member.id);
                     onClose();
                   }
                 }}
                 className="text-[10px] font-bold text-red-500 hover:underline"
               >
                 Teamlid verwijderen
               </button>
             )}
             
             {!member && <div className="flex-1" />}
             
             <div className="flex gap-4 w-full md:w-auto">
               <Button type="button" variant="secondary" className="flex-1 md:flex-none" onClick={onClose}>Annuleren</Button>
               <Button type="submit" className="flex-1 md:flex-none shadow-xl">
                 {member ? 'Wijzigingen Opslaan' : 'Teamlid Toevoegen'}
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
