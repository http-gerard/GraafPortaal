import * as React from 'react';
import { X, Briefcase, Users, Layout, FileText, Info } from 'lucide-react';
import { Button, Badge } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { Project, ProjectStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
}

export const ProjectModal = ({ isOpen, onClose, onSave }: ProjectModalProps) => {
  const { clients, teamMembers } = useDatabase();

  const [formData, setFormData] = React.useState<Partial<Project>>({
    name: '',
    client: clients[0]?.name || "",
    description: '',
    status: 'Open' as ProjectStatus,
    progress: 0,
    category: 'Design Systemen',
    phase: 'Ontdekking',
    team: teamMembers.length > 0 ? [teamMembers[0]] : [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: `PRJ-${Math.floor(Math.random() * 10000)}`,
      lastUpdated: 'Zojuist',
    } as Project);
    onClose();
  };

  const categories = ['Design Systemen', 'E-Commerce', 'Merkidentiteit', 'Productontwerp', 'Marketing'];
  const statuses: ProjectStatus[] = ['Open', 'In Uitvoering', 'Klaar'];
  const phases = ['Ontdekking', 'Strategie', 'Ontwerp', 'Ontwikkeling', 'QA', 'Lancering'];

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
        <div className="p-10 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-[#f8fafc] to-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Nieuw Project Initialiseren</h2>
            <p className="text-xs text-slate-500 font-bold mt-1">Creatief Productieproces</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="flex-1 overflow-y-auto min-h-0 flex flex-col" onSubmit={handleSubmit}>
          <div className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
              <Briefcase size={12} className="text-[#7b68ee]" />
              Projecttitel
            </label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="bijv. Website Herontwerp 2024"
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                <Users size={12} className="text-[#7b68ee]" />
                Klant
              </label>
              <select 
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all appearance-none"
              >
                {clients.map(client => (
                  <option key={client.id} value={client.name}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                <Layout size={12} className="text-[#7b68ee]" />
                Categorie
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
              <FileText size={12} className="text-[#7b68ee]" />
              Beschrijving
            </label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschrijf de belangrijkste doelstellingen en opleveringen..."
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#7b68ee]/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500">Huidige Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all appearance-none"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500">Projectfase</label>
              <select 
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all appearance-none"
              >
                {phases.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          </div>
          <div className="p-8 border-t border-black/5 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 sticky bottom-0">
            <div className="flex items-center gap-2 text-[#8d4f00]">
              <Info size={16} />
              <span className="text-[10px] font-bold">Standaard Lead: {teamMembers[0]?.name || "Niet toegewezen"}</span>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Button type="button" variant="secondary" className="flex-1 md:flex-none" onClick={onClose}>Annuleren</Button>
              <Button type="submit" className="flex-1 md:flex-none shadow-xl">Project Starten</Button>
            </div>
          </div>
        </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
