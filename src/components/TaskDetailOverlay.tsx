import * as React from 'react';
import { X, Info, Users, Clock, Circle, FileEdit, CheckCircle2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Badge, Button } from './UI';
import { Task, TaskStatus } from '../types';
import { useDatabase } from '../contexts/DatabaseContext';
import { cn } from '../lib/utils';

interface TaskDetailOverlayProps {
  task: Task;
  onClose: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onNavigateToProject?: (id: string) => void;
  onNavigateToClient?: (id: string) => void;
  viewMode?: 'agency' | 'client';
}

export const TaskDetailOverlay = ({ 
  task, 
  onClose, 
  onStatusChange, 
  onNavigateToProject, 
  onNavigateToClient,
  viewMode = 'agency'
}: TaskDetailOverlayProps) => {
  const { projects, clients, teamMembers, clientContacts, refreshData } = useDatabase();

    const handleDelete = async () => {
    if (window.confirm('Weet je zeker dat je deze taak wilt verwijderen? Deze actie is onomkeerbaar.')) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', task.id);
        if (error) throw error;
        await refreshData();
        onClose();
      } catch (err) {
        console.error('Kon taak niet verwijderen:', err);
        alert('Er is een fout opgetreden bij het verwijderen van de taak.');
      }
    }
  };
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTask, setEditedTask] = React.useState(task);
  const statusOptions: TaskStatus[] = ['Te Doen', 'In Uitvoering', 'Klaar'];

  // Permission check: clients can only edit tasks assigned to them
  // For this prototype, we assume agency members are defined in teamMembers
  // If viewMode is client, and assignee is an agency member, disable editing
  const isReadOnly = viewMode === 'client' && task.assignee && ['Agency Beheerder', 'Creative Director', 'Software Ontwikkelaar', 'Projectmanager'].includes(task.assignee.role);

  const getLinkedEntity = (task: Task) => {
    const project = projects.find(p => p.id === task.project);
    if (project) return { type: 'Project', name: project.name, id: project.id, client: project.client };
    
    const client = clients.find(c => c.id === task.project || c.name === task.project);
    if (client) return { type: 'Client', name: client.name, id: client.id };

    return { type: 'Intern', name: task.project };
  };

  const entity = getLinkedEntity(task);
  const projectObj = projects.find(p => p.id === task.project);
  const clientObj = projectObj ? clients.find(c => c.name === projectObj.client) : clients.find(c => c.id === task.project || c.name === task.project);

  return (
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
        className="relative w-full max-w-2xl h-full bg-white shadow-2xl shadow-slate-900/20 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 flex-1 overflow-y-auto">
          <header className="flex justify-between items-start mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-[10px] text-slate-400 font-bold">{task.id}</Badge>
                <Badge variant="healthy" className="text-[10px] font-bold">{task.type === 'Extern' ? 'Extern' : 'Intern'}</Badge>
              </div>
              {isEditing ? (
                <div className="space-y-4 w-full">
                  <input 
                    type="text" 
                    value={editedTask.name}
                    onChange={(e) => setEditedTask({...editedTask, name: e.target.value})}
                    className="text-3xl font-bold text-slate-900 leading-none bg-slate-50 border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-[#7b68ee]/30 transition-all outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    {(() => {
                      const projectContacts = clientObj ? clientContacts.filter(c => c.client_id === clientObj.id) : [];
                      
                      return (
                        <select 
                          value={editedTask.assignee?.id || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const member = teamMembers.find(m => m.id === val);
                            if (member) {
                              setEditedTask({...editedTask, assignee: member});
                            } else {
                              const contact = clientContacts.find(c => c.id === val);
                              if (contact) {
                                // Maps a contact to a generic 'assignee' object format compatible with the UI
                                setEditedTask({...editedTask, assignee: { id: contact.id, name: contact.name, role: contact.role || 'Klant Contact', avatar: '' }});
                              } else {
                                setEditedTask({...editedTask, assignee: undefined});
                              }
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-50 text-slate-900 rounded-lg text-xs font-bold border border-black/5 outline-none"
                        >
                          <option value="">Kies uitvoerende...</option>
                          {task.type === 'Intern' ? (
                            teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)
                          ) : (
                            <>
                              <optgroup label="Team Studio Graaf">
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                              </optgroup>
                              {projectContacts.length > 0 && (
                                <optgroup label={"Contacten: " + clientObj.name}>
                                  {projectContacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>{contact.name}</option>
                                  ))}
                                </optgroup>
                              )}
                            </>
                          )}
                        </select>
                      );
                    })()}
                    <input 
                      type="text"
                      value={editedTask.dueDate}
                      onChange={(e) => setEditedTask({...editedTask, dueDate: e.target.value})}
                      className="px-3 py-1.5 bg-slate-50 text-slate-900 rounded-lg text-xs font-bold border border-black/5 outline-none"
                      placeholder="Deadline (bijv. 30 Apr)"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-slate-900 leading-none">
                    {task.name}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-900 rounded-lg text-xs font-bold border border-black/5">

                      <span>Toegewezen: <span className="text-[#7b68ee]">{task.assignee?.name || 'Onbekend'}</span></span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 mx-2" />
                    {entity.type === 'Project' && onNavigateToProject && (
                      <button 
                        onClick={() => { onClose(); onNavigateToProject(entity.id); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#7b68ee]/5 text-[#7b68ee] rounded-lg text-xs font-bold hover:bg-[#7b68ee]/10 transition-colors"
                      >
                        <Info size={14} />
                        Project: {entity.name}
                      </button>
                    )}
                    {clientObj && onNavigateToClient && (
                      <button 
                        onClick={() => { onClose(); onNavigateToClient(clientObj.id); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        <Users size={14} />
                        Klant: {clientObj.name}
                      </button>
                    )}
                    {!clientObj && entity.type === 'Client' && onNavigateToClient && (
                      <button 
                        onClick={() => { onClose(); onNavigateToClient(entity.id); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        <Users size={14} />
                        Klant: {entity.name}
                      </button>
                    )}
                    <div className="h-4 w-px bg-slate-200 mx-2" />
                    <div className="text-xs font-bold text-slate-400">Deadline: {task.dueDate}</div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isEditing ? "bg-[#7b68ee] text-white" : "hover:bg-slate-50 text-slate-400"
                  )}
                >
                  <FileEdit size={24} />
                </button>
              )}
              {!isReadOnly && (
                <button 
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-colors mr-1"
                  title="Taak verwijderen"
                >
                  <Trash2 size={24} />
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                title="Sluiten"
              >
                <X size={24} />
              </button>
            </div>
          </header>

          <div className="space-y-10">
            <section className="space-y-3">
              <h4 className="text-[10px] font-bold text-[#7b68ee]">Beschrijving</h4>
              {isEditing ? (
                <textarea 
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#7b68ee]/30 transition-all outline-none"
                  placeholder="Beschrijf de taak..."
                />
              ) : (
                <p className="text-slate-600 text-base leading-relaxed">
                  {task.description || "Geen beschrijving beschikbaar voor deze taak."}
                </p>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-[#7b68ee]">Status Beheer</h4>
                {isReadOnly && (
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                    <Info size={10} />
                    Alleen-lezen: Taak toegewezen aan agency
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => !isReadOnly && onStatusChange(task.id, status)}
                    disabled={isReadOnly}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-xs font-bold transition-all text-center",
                      task.status === status
                        ? "bg-[#7b68ee] border-[#7b68ee] text-white shadow-lg shadow-teal-900/20"
                        : "bg-white border-black/5 text-slate-500 hover:border-[#7b68ee]/30 hover:text-[#7b68ee]",
                      isReadOnly && task.status !== status && "opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
        
        <div className="mt-auto bg-slate-50 p-6 flex justify-end gap-3 border-t border-black/5 sticky bottom-0">
          {isEditing ? (
            <>
              <Button variant="secondary" size="md" onClick={() => setIsEditing(false)}>Annuleren</Button>
              <Button 
                size="md" 
                onClick={async () => {
                  try {
                    const { error } = await supabase.from('tasks').update({
                      name: editedTask.name,
                      description: editedTask.description,
                      due_date: editedTask.dueDate || null,
                      assignee_id: editedTask.assignee?.id || null,
                    }).eq('id', task.id);
                    if (error) throw error;
                    await refreshData();
                    setIsEditing(false);
                    onClose();
                  } catch (err) {
                    console.error('Kon taak niet opslaan:', err);
                    alert('Er is een fout opgetreden bij het opslaan.');
                  }
                }}
              >
                Wijzigingen Opslaan
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="md" onClick={onClose}>Sluiten</Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
