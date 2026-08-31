import * as React from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';
import { Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal = ({ isOpen, onClose }: TaskModalProps) => {
    const { projects, clients, teamMembers, clientContacts, refreshData } = useDatabase();
  const [taskType, setTaskType] = React.useState<'Intern' | 'Extern'>('Intern');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
    const [dueDate, setDueDate] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [assigneeId, setAssigneeId] = React.useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pId = projectId || (projects.length > 0 ? projects[0].id : null);
      const { error } = await supabase.from('tasks').insert([{
        name: title,
        description,
        type: taskType,
        priority: 'Gemiddeld',
        due_date: dueDate || null,
        status: 'Te Doen',
        project_id: pId,
        assignee_id: assigneeId || null
      }]);
      if (error) throw error;
      await refreshData();
      onClose();
    } catch(err) {
      console.error(err);
      alert('Fout bij opslaan taak');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-white w-full max-w-xl shadow-2xl overflow-hidden h-full flex flex-col"
          >
        <div className="p-8 border-b border-black/5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Nieuwe Taak Aanmaken</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Agency Werkstroom</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="flex-1 overflow-y-auto min-h-0" onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-500">Taak Intent</label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-50 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTaskType('Intern')}
                  className={cn(
                    "py-2.5 rounded-lg text-xs font-bold   transition-all",
                    taskType === 'Intern' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"
                  )}
                >
                  Intern
                </button>
                <button
                  type="button"
                  onClick={() => setTaskType('Extern')}
                  className={cn(
                    "py-2.5 rounded-lg text-xs font-bold   transition-all",
                    taskType === 'Extern' ? "bg-[#7b68ee] text-white shadow-lg" : "text-slate-400 hover:text-[#7b68ee]"
                  )}
                >
                  Extern
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500">Taaktitel</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="bijv. Brand Guidelines Afronden"
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500">Beschrijving</label>
              <textarea 
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Beschrijf kort de vereisten..."
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#7b68ee]/30 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500">Deadline</label>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500">Uitvoerende</label>
                {(() => {
                  const selectedProject = projects.find(p => p.id === projectId);
                  const clientObj = selectedProject ? clients.find(c => c.name === selectedProject.client || c.id === selectedProject.client) : null;
                  const projectContacts = clientObj ? clientContacts.filter(c => c.client_id === clientObj.id) : [];
                  
                  return (
                    <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all appearance-none">
                      <option value="">Niet toegewezen (Open)</option>
                      {taskType === 'Intern' ? (
                        teamMembers.map(member => (
                          <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                        ))
                      ) : (
                        <>
                          <optgroup label="Team Studio Graaf">
                            {teamMembers.map(member => (
                              <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                            ))}
                          </optgroup>
                          {projectContacts.length > 0 && (
                            <optgroup label={"Contacten: " + clientObj.name}>
                              {projectContacts.map(contact => (
                                <option key={contact.id} value={contact.id}>{contact.name} {contact.role ? '('+contact.role+')' : ''}</option>
                              ))}
                            </optgroup>
                          )}
                        </>
                      )}
                    </select>
                  );
                })()}
              </div>
            </div>

            {taskType === 'Extern' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
                <label className="text-[10px] font-bold text-slate-500">Gekoppeld aan</label>
                <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all appearance-none">
                  <optgroup label="Projecten">
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          <div className="p-8 pt-4 flex items-center justify-between border-t border-black/5 bg-white sticky bottom-0">
            <div className="flex items-center gap-2 text-[#7b68ee]">
              <Info size={16} />
              <span className="text-[10px] font-bold">Handmatige toewijzing vereist</span>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Annuleren</Button>
              <Button type="submit">Taak Aanmaken</Button>
            </div>
          </div>
        </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
