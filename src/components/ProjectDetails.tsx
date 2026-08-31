import * as React from 'react';
import { ChevronRight, CloudUpload, Download, FileEdit, FileText, Info, X, Calendar, Users, FileIcon, Trash2, CheckCircle, Check, UserCircle, Activity, MessageSquare, Rocket, RefreshCw } from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TaskDetailOverlay } from './TaskDetailOverlay';
import { ClientFeedbackRequest } from './ClientFeedbackRequest';
import { TaskStatus, Task } from '../types';

const formatLastUpdated = (dateStr: string) => {
  if (!dateStr) return 'Onbekend';
  if (dateStr.includes('T')) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' om');
      }
    } catch(e) {}
  }
  return dateStr;
};

interface ProjectDetailsProps {
  projectId?: string;
  onAddTask?: () => void;
  onNavigateToProject?: (id: string) => void;
  onNavigateToClient?: (id: string) => void;
  viewMode?: 'agency' | 'client';
}

export const ProjectDetails = ({ 
  projectId, 
  onAddTask,
  onNavigateToProject,
  onNavigateToClient,
  viewMode = 'agency'
}: ProjectDetailsProps) => {
  const { projects, teamMembers, tasks: dbTasks, refreshData } = useDatabase();

  const project = projects.find(p => p.id === projectId) || projects[0];
  if (!project) return <div className="p-12 text-center font-bold text-slate-500">Geen projecten gevonden.</div>;
  const [showNotification, setShowNotification] = React.useState(false);
  const phases = ['Ontdekking', 'Ontwerp', 'Ontwikkeling', 'Laatste Beoordeling', 'Lancering'];
  const [currentPhase, setCurrentPhase] = React.useState(project.phase || 'Ontdekking');
  const activeIndex = phases.indexOf(currentPhase);
  
  const [isEditingProject, setIsEditingProject] = React.useState(false);
  const [editedProject, setEditedProject] = React.useState(project);
  const [projectBadgeStatus, setProjectBadgeStatus] = React.useState<'Bezig' | 'Wachten op klant'>('Bezig');
  
  const [tasks, setTasks] = React.useState<Task[]>(dbTasks.filter(t => t.project === project.id || t.project === project.name));
  React.useEffect(() => {
    setTasks(dbTasks.filter(t => t.project === project.id || t.project === project.name));
  }, [dbTasks, project.id, project.name]);
  
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const [uploadedFiles, setUploadedFiles] = React.useState<{id: string, name: string, size: string, date: string}[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [notes, setNotes] = React.useState("");
  const [isNoteClientFacing, setIsNoteClientFacing] = React.useState(false);
    const [noteHistory, setNoteHistory] = React.useState<{id: string, author: string, timestamp: Date, text: string, isClientFacing: boolean}[]>([]);
  const [activities, setActivities] = React.useState<{id: string, text: string, type: string, time: string}[]>([]);

  React.useEffect(() => {
    if (!project) return;
    const loadProjectData = async () => {
      const { data: notesData, error: notesError } = await supabase.from('project_notes').select('*').eq('project_id', project.id).order('created_at', { ascending: false });
      if (notesError) console.error("Error fetching notes:", notesError);
      if (notesData) {
        setNoteHistory(notesData.map((n: any) => ({
          id: n.id,
          author: n.author,
          timestamp: new Date(n.created_at),
          text: n.text,
          isClientFacing: n.is_client_facing
        })));
      }

      const { data: actData, error: actError } = await supabase.from('project_activities').select('*').eq('project_id', project.id).order('created_at', { ascending: false });
      if (actError) console.error("Error fetching activities:", actError);
      if (actData) {
        setActivities(actData.map((a: any) => ({
          id: a.id,
          text: a.text,
          type: a.type,
          time: new Date(a.created_at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        })));
      }
    };
    loadProjectData();
  }, [project?.id]);
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);

  const handleSaveNotes = async () => {
    if (!notes.trim() || !project) return;
    
    setIsSavingNotes(true);
    try {
      const { data, error } = await supabase.from('project_notes').insert([{
        project_id: project.id,
        author: viewMode === 'client' ? 'Klant' : 'Ik (Ingelogd)',
        text: notes,
        is_client_facing: viewMode === 'client' ? true : isNoteClientFacing
      }]).select().single();
      
      if (error) throw error;
      
      const { data: act } = await supabase.from('project_activities').insert([{
        project_id: project.id,
        text: `Notitie toegevoegd: "${notes.substring(0, 30)}${notes.length > 30 ? '...' : ''}"`,
        type: 'feedback'
      }]).select().single();

      if (act) {
        setActivities(prev => [{
          id: act.id,
          text: act.text,
          type: act.type,
          time: new Date(act.created_at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        }, ...prev]);
      }
      
      const newEntry = {
        id: data.id,
        author: data.author,
        timestamp: new Date(data.created_at),
        text: data.text,
        isClientFacing: data.is_client_facing
      };
      
      setNoteHistory(prev => [newEntry, ...prev]);
      setNotes("");
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch(err) {
      console.error(err);
      alert('Fout bij opslaan notitie');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })
    }));
    setUploadedFiles(prev => [...newFiles, ...prev]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    }
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
      await refreshData();
    } catch(err) {
      console.error(err);
      alert('Fout bij updaten status: ' + err.message);
    }
  };

  const handlePhaseClick = async (phase: string) => {
    setCurrentPhase(phase);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    
    // Calculate new progress based on phase index
    const phaseIndex = phases.indexOf(phase);
    const newProgress = Math.min(100, Math.max(0, (phaseIndex + 1) * 20));
    
    try {
      // 1. Update project phase and progress
      const { error } = await supabase.from('projects').update({ phase, progress: newProgress }).eq('id', project.id);
      if (error) throw error;
      
      // 2. Add activity log
      await supabase.from('project_activities').insert([{
        project_id: project.id,
        text: `Gerard heeft de fase gewijzigd naar "${phase}"`,
        type: 'start'
      }]);
      
      // 3. Refresh context
      await refreshData();
      
      // Also update local activities immediately for the visual feedback
      setActivities(prev => [{
        id: Math.random().toString(),
        text: `Gerard heeft de fase gewijzigd naar "${phase}"`,
        type: 'start',
        time: new Date().toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      }, ...prev]);
      
    } catch (err) {
      console.error('Fout bij opslaan projectfase:', err);
      setCurrentPhase(project.phase || 'Ontdekking');
    }
  };

  const toStartTasks = tasks.filter(t => t.status === 'Te Doen');
  const inProgressTasks = tasks.filter(t => t.status === 'In Uitvoering');
  const completedTasks = tasks.filter(t => t.status === 'Klaar');

  const TaskTable = ({ taskList }: { taskList: Task[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-[#f1f5f9]/50">
            <th className="w-1 px-0"></th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500">Taaknaam</th>
            <th className="w-[140px] px-4 py-3 text-[10px] font-bold text-slate-500 text-center">Prioriteit</th>
            <th className="w-[160px] px-4 py-3 text-[10px] font-bold text-slate-500">Uitvoerende</th>
            <th className="w-[140px] px-4 py-3 text-[10px] font-bold text-slate-500">Deadline</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {taskList.map((task) => {
            const statusColor = 
              task.status === 'Te Doen' ? 'bg-red-500' : 
              task.status === 'In Uitvoering' ? 'bg-orange-500' : 
              'bg-[#7b68ee]';

            return (
              <tr 
                key={task.id}
                className="group hover:bg-slate-50 transition-all duration-150 cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <td className={cn("w-1 p-0 transition-colors", statusColor)}></td>
                <td className="px-4 py-3 overflow-hidden">
                  <div className="flex items-center gap-3 truncate">
                    <button
                      className="focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, task.status === 'Klaar' ? 'Te Doen' : 'Klaar');
                      }}
                    >
                      <CheckCircle size={18} className={cn("flex-shrink-0 transition-colors", task.status === 'Klaar' ? "text-[#7b68ee]" : "text-slate-300 group-hover:text-[#7b68ee]")} />
                    </button>
                    <span className={cn("font-semibold text-sm truncate", task.status === 'Klaar' ? "text-slate-400 line-through" : "text-slate-800")}>
                      {task.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <Badge variant={task.priority === 'Hoog' ? 'review' : 'default'} className="px-2 py-0.5 text-[10px]">
                      <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", task.priority === 'Hoog' ? 'bg-[#ba1a1a]' : 'bg-slate-400')}></span>
                      {task.priority}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3 overflow-hidden">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs text-slate-600 font-bold truncate">
                      {task.assignee?.name.split(' ')[0] || 'Unassigned'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-sm font-medium">{task.dueDate}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-8 flex flex-col justify-between min-h-[160px] relative">
          {viewMode === 'agency' && (
            <button 
              onClick={() => setIsEditingProject(!isEditingProject)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#7b68ee] transition-colors"
              title={isEditingProject ? "Opslaan" : "Bewerk Project"}
            >
              {isEditingProject ? <CheckCircle size={20} className="text-[#7b68ee]" /> : <FileEdit size={20} />}
            </button>
          )}
          <div>
            <nav className="flex items-center gap-2 text-slate-500 mb-2">
              <span className="text-[10px] font-bold">Projecten</span>
              <ChevronRight size={14} />
              <span className="text-[10px] font-bold">{project.id}</span>
            </nav>
            {isEditingProject ? (
              <input 
                value={editedProject.name}
                onChange={(e) => setEditedProject({...editedProject, name: e.target.value})}
                className="text-4xl font-bold text-slate-900 mb-4 bg-slate-50 p-2 rounded-lg border-2 border-slate-200 outline-none focus:border-[#7b68ee] w-full max-w-lg"
              />
            ) : (
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{editedProject.name}</h1>
            )}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full relative", 
                projectBadgeStatus === 'Wachten op klant' ? 'bg-amber-100 text-amber-700' : 'bg-[#7b68ee]/10 text-[#7b68ee]'
            )}>
              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", projectBadgeStatus === 'Wachten op klant' ? 'bg-amber-500' : 'bg-[#7b68ee]')}></span>
              {viewMode === 'agency' ? (
                <>
                  <select 
                    value={projectBadgeStatus}
                    onChange={(e) => setProjectBadgeStatus(e.target.value as 'Bezig' | 'Wachten op klant')}
                    className="text-[10px] font-bold bg-transparent outline-none cursor-pointer appearance-none pr-4 z-10"
                  >
                    <option value="Bezig">Bezig</option>
                    <option value="Wachten op klant">Wachten op klant</option>
                  </select>
                  <ChevronRight size={12} className="absolute right-2 opacity-50 pointer-events-none rotate-90" />
                </>
              ) : (
                <span className="text-[10px] font-bold">{projectBadgeStatus}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-slate-700 text-sm font-medium bg-slate-100 px-3 py-1 rounded-md">
              <Calendar size={14} className="text-slate-500" /> 
              Deadline: 
              {isEditingProject ? (
                <input 
                  type="date"
                  value={editedProject.deadline || ''}
                  onChange={(e) => setEditedProject({...editedProject, deadline: e.target.value})}
                  className="bg-white border border-slate-300 rounded px-2 py-0.5 ml-1 outline-none text-xs"
                />
              ) : (
                <span className="ml-1">{editedProject.deadline || 'Geen deadline'}</span>
              )}
            </div>
            
            <span className="text-slate-500 text-sm font-medium ml-auto">Laatst bijgewerkt {formatLastUpdated(project.lastUpdated)}</span>
          </div>
        </Card>

        <Card className="bg-slate-900 p-8 flex flex-col justify-center text-white relative">
          {isEditingProject && (
             <div className="absolute inset-0 bg-[#7b68ee]/10 border-2 border-[#7b68ee] rounded-xl pointer-events-none" />
          )}
          <p className="text-[10px] font-bold text-slate-400 mb-2">Klant</p>
          {isEditingProject ? (
             <input 
               value={editedProject.client}
               onChange={(e) => setEditedProject({...editedProject, client: e.target.value})}
               className="text-xl font-bold bg-white/10 p-1 rounded border border-white/20 outline-none text-white w-full"
             />
          ) : (
             <p className="text-xl font-bold">{editedProject.client}</p>
          )}
          
          <div className="mt-6 flex flex-wrap gap-1 text-sm font-medium text-slate-300">
            {editedProject.team.map(m => m.name.split(' ')[0]).join(', ')}
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-xl p-2 border border-black/5 shadow-sm overflow-hidden">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between">
          {phases.map((step, i) => (
            <button 
              key={step} 
              onClick={() => viewMode === 'agency' && handlePhaseClick(step)}
              className={cn(
                "flex-1 group py-4 px-2 flex flex-col items-center gap-2 transition-all rounded-lg",
                viewMode === 'agency' ? "hover:bg-[#f1f5f9] cursor-pointer" : "cursor-default"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                  i < activeIndex ? "bg-[#7b68ee]/20 text-[#7b68ee]" : i === activeIndex ? "bg-[#2dd4bf] text-[#00574d]" : "bg-[#e2e8f0] text-slate-500"
                )}>
                  0{i + 1}
                </span>
                <span className={cn(
                  "text-[10px] font-bold   transition-colors",
                  i === activeIndex ? "text-[#7b68ee]" : "text-slate-500 group-hover:text-[#7b68ee]"
                )}>
                  {step}
                </span>
              </div>
              <div className={cn(
                "w-full h-1 rounded-full mt-1",
                i <= activeIndex ? "bg-[#2dd4bf]" : "bg-[#e2e8f0]"
              )}></div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-xl border border-black/5 shadow-sm">
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-[#7b68ee]" size={20} />
                <h2 className="text-lg font-bold text-slate-900">Taakbeheer</h2>
              </div>
              {viewMode === 'agency' && (
                <button 
                  onClick={onAddTask}
                  className="text-sm font-bold text-[#7b68ee] hover:underline"
                >
                  Taak Toevoegen
                </button>
              )}
            </div>
            
            <div className="p-6 space-y-8">
              {toStartTasks.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-6 pb-2 border-b border-black/5">
                    <h3 className="text-[10px] font-bold text-red-500">Te Starten</h3>
                  </div>
                  <TaskTable taskList={toStartTasks} />
                </div>
              )}

              {inProgressTasks.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-6 pb-2 border-b border-black/5">
                    <h3 className="text-[10px] font-bold text-orange-500">Bezig</h3>
                  </div>
                  <TaskTable taskList={inProgressTasks} />
                </div>
              )}

              {completedTasks.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-6 pb-2 border-b border-black/5">
                    <h3 className="text-[10px] font-bold text-[#7b68ee]">Afgerond</h3>
                  </div>
                  <div className="opacity-70">
                    <TaskTable taskList={completedTasks} />
                  </div>
                </div>
              )}

              {toStartTasks.length === 0 && inProgressTasks.length === 0 && completedTasks.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm italic">Geen taken gevonden voor dit project.</p>
              )}
            </div>
          </section>
          <section className="bg-white p-8 rounded-xl border border-black/5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <CloudUpload className="text-[#7b68ee]" size={20} />
              Nieuwe Opleveringen
            </h2>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden" 
              multiple
            />

            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group mb-6",
                isDragging 
                  ? "border-[#7b68ee] bg-[#7b68ee]/5" 
                  : "border-[#bacac5]/30 bg-[#f1f5f9] hover:bg-[#e6e8ea]"
              )}
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <CloudUpload className={cn("text-3xl transition-colors", isDragging ? "text-[#7b68ee]" : "text-[#7b68ee]")} size={32} />
              </div>
              <h3 className="text-slate-900 font-semibold mb-1">Klik om te uploaden of sleep bestanden hierheen</h3>
              <p className="text-slate-500 text-sm max-w-xs">PDF, Figma, PNG of ZIP bestanden tot 50MB per bestand</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 mb-2">Recent Geüpload</h4>
                <AnimatePresence initial={false}>
                  {uploadedFiles.map((file) => (
                    <motion.div 
                      key={file.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-black/5 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-black/5 text-[#7b68ee]">
                          <FileIcon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{file.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{file.size} • Geüpload op {file.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-[#7b68ee] transition-colors"
                          title="Downloaden"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          title="Verwijderen"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
          
          {/* Main Column: Feedback & Beoordelingen */}
          <ClientFeedbackRequest viewMode={viewMode} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-xl shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileEdit className="text-[#7b68ee]" size={20} />
                Projectnotities
              </h2>
            </div>
            
            <div className="space-y-4">
              <textarea 
                className="w-full bg-[#f1f5f9] border border-black/5 rounded-lg p-4 text-slate-900 text-sm focus:ring-2 focus:ring-[#7b68ee]/30 transition-all placeholder:text-slate-500/50 resize-none" 
                placeholder="Nieuwe notitie toevoegen..." 
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="client_facing" 
                    checked={viewMode === 'client' ? true : isNoteClientFacing}
                    onChange={(e) => viewMode !== 'client' && setIsNoteClientFacing(e.target.checked)}
                    disabled={viewMode === 'client'}
                    className="rounded border-slate-300 text-[#7b68ee] focus:ring-[#7b68ee] disabled:opacity-50" 
                  />
                  <label htmlFor="client_facing" className="text-[10px] font-semibold text-slate-500 cursor-pointer">Zichtbaar voor klant</label>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || !notes.trim()}
                  className="relative"
                >
                  {isSavingNotes ? "Opslaan..." : "Notitie Opslaan"}
                </Button>
              </div>

              {noteHistory.length > 0 && (
                <div className="pt-6 border-t border-black/5">
                  <h4 className="text-[10px] font-bold text-slate-500 mb-4">Historiek</h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {noteHistory.map((entry) => (
                      <div key={entry.id} className="bg-slate-50 rounded-xl p-4 border border-black/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{entry.author}</span>
                            <span className="text-[10px] text-slate-400">— {entry.timestamp.toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {entry.isClientFacing ? (
                            <Badge variant="healthy" className="text-[8px] py-0 px-1.5 h-4">Klant</Badge>
                          ) : (
                            <Badge variant="on-hold" className="text-[8px] py-0 px-1.5 h-4">Intern</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm border border-black/5">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="text-[#7b68ee]" size={20} />
              Activiteiten
            </h2>
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
              {activities.map(activity => (
                <div key={activity.id} className="relative pl-8">
                  <div className="absolute -left-[10px] top-0 bg-white p-1 rounded-full border border-slate-200 shadow-sm text-slate-500 flex items-center justify-center">
                    {activity.type === 'status' && <RefreshCw size={12} className="text-blue-500" />}
                    {activity.type === 'feedback' && <MessageSquare size={12} className="text-emerald-500" />}
                    {activity.type === 'start' && <Rocket size={12} className="text-[#7b68ee]" />}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{activity.text}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </section>


        </div>
      </div>

      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-8 z-[100]"
          >
            <div className="bg-[#7b68ee] text-white shadow-xl rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} />
              <p className="text-sm font-bold">Notities succesvol opgeslagen</p>
            </div>
          </motion.div>
        )}
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-8 z-[100]"
          >
            <div className="bg-white shadow-xl rounded-xl border border-black/5 p-4 flex items-center gap-4 max-w-sm">
              <div className="w-10 h-10 rounded-full bg-[#7b68ee]/10 flex items-center justify-center shrink-0">
                <Info className="text-[#7b68ee]" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Fase bijgewerkt</p>
                <p className="text-xs text-slate-500">De klant is automatisch op de hoogte gebracht.</p>
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="ml-auto text-slate-500 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
        {selectedTask && (
          <TaskDetailOverlay 
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStatusChange={handleStatusChange}
            onNavigateToProject={onNavigateToProject}
            onNavigateToClient={onNavigateToClient}
            viewMode={viewMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
