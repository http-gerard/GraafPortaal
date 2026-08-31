import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MapPin, FileText, Paperclip, CheckCircle } from 'lucide-react';
import { Button, Badge } from './UI';
import { Meeting } from '../types';
import { useDatabase } from '../contexts/DatabaseContext';
import { cn } from '../lib/utils';

interface MeetingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onSave?: (meeting: Meeting) => void;
}

export const MeetingDrawer = ({ isOpen, onClose, meeting, onSave }: MeetingDrawerProps) => {
  const { clients, projects } = useDatabase();

  const [notes, setNotes] = React.useState('');
  const [projectId, setProjectId] = React.useState<string | undefined>(undefined);
  const [attachments, setAttachments] = React.useState<{name: string, url: string}[]>([]);
  const [isAddingLink, setIsAddingLink] = React.useState(false);
  const [newLinkName, setNewLinkName] = React.useState('');
  const [newLinkUrl, setNewLinkUrl] = React.useState('');
  
  React.useEffect(() => {
    if (meeting) {
      setNotes(meeting.notes || '');
      setProjectId(meeting.projectId);
      setAttachments(meeting.attachments || []);
    }
  }, [meeting, isOpen]);

  if (!meeting) return null;

  const client = clients.find(c => c.id === meeting.clientId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        ...meeting,
        notes,
        projectId,
        attachments
      });
    }
    onClose();
  };

  const handleAddLink = () => {
    setIsAddingLink(true);
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
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
            <div className="p-8 border-b border-black/5 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {meeting.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={meeting.status === 'Voltooid' ? 'healthy' : meeting.status === 'Gepland' ? 'default' : 'on-hold'}>
                    {meeting.status}
                  </Badge>
                  {client && (
                    <span className="text-[10px] font-bold text-slate-500">
                      KLANT: {client.name}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#7b68ee] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto min-h-0 flex flex-col">
              <div className="p-8 space-y-8">
                
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Calendar size={16} className="text-[#7b68ee]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5">Datum</p>
                      <p className="text-sm font-semibold text-slate-700">{meeting.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Clock size={16} className="text-[#7b68ee]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5">Tijd & Duur</p>
                      <p className="text-sm font-semibold text-slate-700">{meeting.time} ({meeting.duration} min)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 col-span-2 mt-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <MapPin size={16} className="text-[#7b68ee]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5">Locatie</p>
                      <p className="text-sm font-semibold text-slate-700">{meeting.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 col-span-2 mt-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText size={16} className="text-[#7b68ee]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5">Gekoppeld Project</p>
                      <select 
                        value={projectId || ''}
                        onChange={(e) => setProjectId(e.target.value || undefined)}
                        className="w-full bg-transparent border-none p-0 text-sm font-semibold text-slate-700 focus:ring-0 cursor-pointer"
                      >
                        <option value="">-- Geen project gekoppeld --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText size={16} className="text-[#7b68ee]" />
                      Gespreksnotities
                    </h3>
                  </div>
                  <textarea 
                    rows={8}
                    className="w-full bg-slate-50 border border-black/5 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#7b68ee]/20 transition-all outline-none resize-none"
                    placeholder="Typ hier de notulen, gemaakte afspraken of actiepunten..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Paperclip size={16} className="text-[#7b68ee]" />
                      Bijlagen
                    </h3>
                    <Button type="button" variant="secondary" onClick={handleAddLink} className="px-3 py-1.5 h-auto text-[10px] gap-1.5">
                      <FileText size={12} />
                      Voeg bijlage toe
                    </Button>
                  </div>
                  
                  {isAddingLink ? (
                    <div className="mt-3 p-4 rounded-xl border border-[#7b68ee]/30 bg-[#7b68ee]/5 space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Naam document</label>
                        <input type="text" value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder="Bijv. Briefing of Pitch" className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#7b68ee]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">URL / Link</label>
                        <input type="url" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#7b68ee]" />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button type="button" onClick={(e) => {
                          e.preventDefault();
                          if (newLinkUrl.trim()) {
                            setAttachments(prev => [...prev, { name: newLinkName.trim() || 'Document', url: newLinkUrl.trim() }]);
                            setNewLinkName('');
                            setNewLinkUrl('');
                            setIsAddingLink(false);
                          }
                        }} className="px-4 py-2 h-auto text-xs flex-1 justify-center">Toevoegen</Button>
                        <Button type="button" variant="secondary" onClick={(e) => {
                          e.preventDefault();
                          setIsAddingLink(false);
                          setNewLinkName('');
                          setNewLinkUrl('');
                        }} className="px-4 py-2 h-auto text-xs flex-1 justify-center">Annuleren</Button>
                      </div>
                    </div>
                  ) : attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-black/5 bg-white shadow-sm group hover:border-[#7b68ee]/30 transition-colors">
                          <a href={att.url.startsWith('http') ? att.url : 'https://'+att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-[#7b68ee]/10 transition-colors shrink-0">
                              <FileText size={14} className="text-slate-400 group-hover:text-[#7b68ee]" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#7b68ee] transition-colors">{att.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{att.url}</p>
                            </div>
                          </a>
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveAttachment(idx); }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      onClick={handleAddLink}
                      className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#7b68ee]/50 transition-colors mt-2"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <Paperclip size={20} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Geen bijlagen</p>
                      <p className="text-xs text-slate-400 mt-1">Sleep bestanden hierheen of klik om te uploaden</p>
                    </div>
                  )}
                </div>

              </div>

              <div className="p-8 border-t border-black/5 bg-slate-50 flex gap-4 mt-auto sticky bottom-0">
                <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Annuleren</Button>
                <Button type="submit" className="flex-1 flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Opslaan
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
