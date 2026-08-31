import { motion, AnimatePresence } from 'motion/react';
import * as React from 'react';
import { X, AlertCircle, HelpCircle, Settings } from 'lucide-react';
import { Card, Button, Badge } from './UI';
import { cn } from '../lib/utils';
import { TicketType, Priority, TicketStatus } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: any) => void;
  ticket?: any; // Add ticket prop for editing
}

export const TicketModal = ({ isOpen, onClose, onSubmit, ticket }: TicketModalProps) => {
  const [title, setTitle] = React.useState(ticket?.title || '');
  const [description, setDescription] = React.useState(ticket?.description || '');
  const [type, setType] = React.useState<TicketType>(ticket?.type || 'Probleem');
  const [priority, setPriority] = React.useState<Priority>(ticket?.priority || 'Gemiddeld');
  const [status, setStatus] = React.useState<TicketStatus>(ticket?.status || 'Nieuw');

  React.useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || '');
      setDescription(ticket.description || '');
      setType(ticket.type || 'Probleem');
      setPriority(ticket.priority || 'Gemiddeld');
      setStatus(ticket.status === 'Gesloten' ? 'Opgelost' : ticket.status || 'Nieuw');
    } else {
      setTitle('');
      setDescription('');
      setType('Probleem');
      setPriority('Gemiddeld');
      setStatus('Nieuw');
    }
  }, [ticket, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...ticket,
      title,
      description,
      type,
      priority,
      status,
      updatedAt: new Date().toLocaleDateString('nl-BE'),
      createdAt: ticket?.createdAt || new Date().toLocaleDateString('nl-BE'),
    });
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
          <div className="p-8 border-b border-black/5 bg-gradient-to-r from-[#f8fafc] to-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {ticket ? 'Ticket Aanpassen' : 'Support Ticket Loggen'}
              </h2>
              <p className="text-slate-500 text-xs font-medium">Hulp nodig? Laat het ons team weten.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#7b68ee] transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 flex flex-col">
            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400">Onderwerp</label>
                <input 
                  required
                  className="w-full bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7b68ee]/20 transition-all outline-none"
                  placeholder="Bijv. Login werkt niet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400">Type aanvraag</label>
                  <select 
                    className="w-full bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7b68ee]/20 transition-all outline-none appearance-none font-bold"
                    value={type}
                    onChange={(e) => setType(e.target.value as TicketType)}
                  >
                    <option value="Probleem">Probleem</option>
                    <option value="Wijziging">Wijziging</option>
                    <option value="Vraag">Vraag</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400">Prioriteit</label>
                  <select 
                    className="w-full bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7b68ee]/20 transition-all outline-none appearance-none font-bold"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                  >
                    <option value="Laag">Laag</option>
                    <option value="Gemiddeld">Gemiddeld</option>
                    <option value="Hoog">Hoog</option>
                  </select>
                </div>
              </div>

              {ticket && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400">Status</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                    {(['Nieuw', 'Bezig', 'Opgelost'] as TicketStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all  ",
                          status === s 
                            ? "bg-white text-[#7b68ee] shadow-sm" 
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400">Beschrijving</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7b68ee]/20 transition-all outline-none resize-none"
                  placeholder="Beschrijf het probleem..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="p-8 border-t border-black/5 bg-slate-50 flex gap-4 mt-auto sticky bottom-0">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Annuleren</Button>
              <Button type="submit" className="flex-1">{ticket ? 'Opslaan' : 'Ticket Verzenden'}</Button>
            </div>
          </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
