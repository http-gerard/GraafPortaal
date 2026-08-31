import * as React from 'react';
import { CheckCircle, Clock, Circle, MoreHorizontal, Filter, SortAsc, X, Info, ChevronRight, Users, User, UserCircle, PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Task, TaskStatus, TeamMember } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { TaskDetailOverlay } from './TaskDetailOverlay';

export const Tasks = ({ 
  onNavigateToProject, 
  onNavigateToClient,
  onAddTask
}: { 
  onNavigateToProject: (id: string) => void, 
  onNavigateToClient: (id: string) => void,
  onAddTask?: () => void
}) => {
  const { tasks: dbTasks, projects, clients, teamMembers, refreshData } = useDatabase();
  const [taskType, setTaskType] = React.useState<'Alle' | 'Extern' | 'Intern'>('Alle');
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>(dbTasks);
  React.useEffect(() => setTasks(dbTasks), [dbTasks]);
  const [selectedAssigneeId, setSelectedAssigneeId] = React.useState<string | 'all'>('all');

  const filteredByType = tasks.filter((t) => taskType === 'Alle' || (t.type || 'Extern') === taskType);
  const filteredByAssignee = filteredByType.filter(t => 
    selectedAssigneeId === 'all' || t.assignee?.id === selectedAssigneeId
  );

  const toStartTasks = filteredByAssignee.filter(t => t.status === 'Te Doen');
  const inProgressTasks = filteredByAssignee.filter(t => t.status === 'In Uitvoering');
  const completedTasks = filteredByAssignee.filter(t => t.status === 'Klaar');

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    }
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      await refreshData();
      if (error) {
        console.error("Supabase update error:", error);
        alert('Fout bij updaten status: ' + error.message);
      }
    } catch (err) {
      console.error('Kon status niet updaten', err);
    }
  };

  const statusOptions: TaskStatus[] = ['Te Doen', 'In Uitvoering', 'Klaar'];

  const getLinkedEntity = (task: Task) => {
    const project = projects.find(p => p.id === task.project);
    if (project) return { type: 'Project', name: project.name, id: project.id, client: project.client };
    
    // If not a project, check if it's a client directly (using task.project as name or ID)
    const client = clients.find(c => c.id === task.project || c.name === task.project);
    if (client) return { type: 'Client', name: client.name, id: client.id };

    return { type: 'Intern', name: task.project };
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (window.confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
        await refreshData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditTask = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setSelectedTask(task);
  };

  const TaskTable = ({ taskList }: { taskList: Task[] }) => (
    <Card className="p-0 overflow-hidden shadow-sm border-none ring-1 ring-black/5 w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="bg-[#f1f5f9]/50">
              <th className="w-1 px-0"></th>
              <th className="px-4 py-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider w-1/3">Taaknaam</th>
              <th className="px-4 py-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider w-1/4">Gekoppeld aan</th>
              <th className="px-4 py-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider w-[120px]">Uitvoerende</th>
              <th className="px-4 py-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider w-[100px]">Deadline</th>
              <th className="px-4 py-3 w-[100px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e8ea]">
            {taskList.map((task) => {
              const entity = getLinkedEntity(task);
              const statusColor = 
                task.status === 'Te Doen' ? 'bg-red-500' : 
                task.status === 'In Uitvoering' ? 'bg-orange-500' : 
                'bg-[#7b68ee]';

              return (
                <tr 
                  key={task.id} 
                  className="group hover:bg-[#f1f5f9]/80 transition-all duration-150 cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <td className={cn("w-1 p-0 transition-colors", statusColor)}></td>
                  <td className="px-4 py-3 overflow-hidden">
                    <div className="flex items-center gap-3 truncate">
                      <CheckCircle size={18} className={cn("flex-shrink-0 transition-colors", task.status === 'Klaar' ? "text-[#7b68ee]" : "text-slate-300 group-hover:text-[#7b68ee]")} />
                      <span className={cn("font-semibold text-sm truncate", task.status === 'Klaar' ? "text-slate-400 line-through" : "text-slate-900")}>{task.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 overflow-hidden">
                    <div className="flex items-center gap-2 truncate">
                      <Badge variant="default" className="text-[9px] shrink-0 truncate max-w-[120px]">{entity.name}</Badge>
                      {entity.client && (
                        <span className="text-[9px] font-bold text-slate-400 truncate">
                          {entity.client}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 overflow-hidden">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs text-slate-500 font-bold truncate">
                        {task.assignee?.name.split(' ')[0] || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-sm font-medium">{task.dueDate}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleEditTask(e, task)}
                        className="p-1.5 text-slate-400 hover:text-[#7b68ee] hover:bg-slate-100 rounded-md transition-colors"
                        title="Taak bewerken"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteTask(e, task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Taak verwijderen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <span className="text-[#7b68ee] font-bold tracking-[0.2em] text-[10px]">Werkstroom Beheer</span>
          <h1 className="text-5xl font-bold text-slate-900 leading-none mb-2">Takenoverzicht</h1>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#2dd4bf]"></span>
            <p className="text-slate-500 font-medium text-sm">
              {(toStartTasks.length + inProgressTasks.length)} openstaande {taskType === 'Alle' ? 'taken' : taskType === 'Extern' ? 'externe taken' : 'interne taken'}
            </p>
          </div>
        </div>
        {onAddTask && (
          <Button onClick={onAddTask} className="gap-3 shadow-xl">
            <PlusCircle size={20} />
            Nieuwe Taak
          </Button>
        )}
      </header>

      <section>
        <div className="flex flex-wrap items-center gap-4">
          {/* Assignee Filter */}
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-black/5 shadow-sm overflow-x-auto max-w-full no-scrollbar">
              <button
                onClick={() => setSelectedAssigneeId('all')}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold   transition-all whitespace-nowrap",
                  selectedAssigneeId === 'all' 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                Iedereen
              </button>
              <div className="w-px h-4 bg-black/5 mx-1" />
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedAssigneeId(member.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap group",
                    selectedAssigneeId === member.id 
                      ? "bg-[#7b68ee]/10 text-[#7b68ee] ring-1 ring-[#7b68ee]/20" 
                      : "text-slate-400 hover:text-slate-900"
                  )}
                  title={member.name}
                >

                  <span className="text-[10px] font-bold">
                    {member.id === '1' ? 'Ik' : member.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-black/5 shadow-inner">
              <button
                onClick={() => setTaskType('Alle')}
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-bold   transition-all",
                  taskType === 'Alle' ? "bg-white text-[#7b68ee] shadow-sm" : "text-slate-500 hover:text-[#7b68ee]"
                )}
              >
                Alle
              </button>
              <button
                onClick={() => setTaskType('Extern')}
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-bold   transition-all",
                  taskType === 'Extern' ? "bg-white text-[#7b68ee] shadow-sm" : "text-slate-500 hover:text-[#7b68ee]"
                )}
              >
                Extern
              </button>
              <button
                onClick={() => setTaskType('Intern')}
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-bold   transition-all",
                  taskType === 'Intern' ? "bg-white text-[#7b68ee] shadow-sm" : "text-slate-500 hover:text-[#7b68ee]"
                )}
              >
                Intern
              </button>
            </div>
          </div>
      </section>

      <div className="space-y-12">
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
          <div className="bg-white rounded-xl p-12 text-center border border-black/5">
            <p className="text-slate-400 text-sm italic">Geen taken gevonden in deze selectie.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTask && (
          <TaskDetailOverlay 
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStatusChange={handleStatusChange}
            onNavigateToProject={onNavigateToProject}
            onNavigateToClient={onNavigateToClient}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

