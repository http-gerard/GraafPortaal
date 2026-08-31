import * as React from 'react';
import { 

  AlertCircle, 
  Clock, 
  ArrowUpRight,
  Target,
  Ticket as TicketIcon,
  CheckCircle,
  Calendar, Bell, MessageSquare, AlertTriangle, Info, CheckCircle2,
} from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Project, Ticket, Task, Meeting } from '../types';
import { AnimatePresence } from 'motion/react';
import { TicketModal } from './TicketModal';
import { MeetingDrawer } from './MeetingDrawer';
import { TaskDetailOverlay } from './TaskDetailOverlay';

interface DashboardProps {
  onViewProject: (id: string) => void;
}

export const Dashboard = ({ onViewProject }: DashboardProps) => {
  const { projects, clients, tasks, tickets: dbTickets, meetings, notifications, refreshData } = useDatabase();

    const [tickets, setTickets] = React.useState<Ticket[]>(dbTickets);
  const [liveNotifications, setLiveNotifications] = React.useState<any[]>([]);
  React.useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.notifications) setLiveNotifications(data.notifications);
      }).catch(console.error);
  }, []);

  React.useEffect(() => setTickets(dbTickets), [dbTickets]);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
  const [selectedMeeting, setSelectedMeeting] = React.useState<Meeting | null>(null);
  const [isMeetingDrawerOpen, setIsMeetingDrawerOpen] = React.useState(false);

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };
  const [readNotifications, setReadNotifications] = React.useState<string[]>([]);


  
  const handleUpdateTicket = (updatedTicket: any) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t));
  };
  
  const handleTaskStatusChange = async (taskId: string, newStatus: any) => {
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      await refreshData();
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch(e) {
      console.error(e);
    }
  };



  const pendingTasks = tasks.filter(t => t.status !== 'Klaar');
  const notStartedTasks = tasks.filter(t => t.status === 'Te Doen').slice(0, 6);
  const highPriorityTickets = tickets.filter(t => t.priority === 'Hoog' && t.status !== 'Opgelost');
  const newTickets = tickets.filter(t => t.status === 'Nieuw');
  
  // Projects within 7 days of deadline
  const today = new Date('2026-04-28');
  const projectsNearDeadline = projects.filter(p => {
    if (!p.deadline) return false;
    const deadline = new Date(p.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Agency Dashboard</h1>
          <p className="text-slate-500 font-medium">Real-time overzicht van uw bureau-prestaties en prioriteiten.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* High Priority Tasks Table */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Target size={20} className="text-red-500" />
                Nog te starten taken
              </h2>
            </div>
            
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-600">Taak</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-600">Project</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-600">Deadline</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {notStartedTasks.map((task) => (
                      <tr key={task.id} onClick={() => setSelectedTask(task)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-900">{task.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default">{task.project}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-red-500">{task.dueDate}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={task.status === 'In Uitvoering' ? 'default' : 'review'}>
                            {task.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Projects Near Deadline */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-[#7b68ee]" />
                Project Deadlines (Binnen 7 dagen)
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {projectsNearDeadline.length > 0 ? (
                projectsNearDeadline.map((project) => (
                  <div key={project.id}>
                    <ProjectDeadlineCard 
                      project={project} 
                      onClick={() => onViewProject(project.id)} 
                    />
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic py-4">Geen projecten met naderende deadlines.</p>
              )}
            </div>
          </section>
          {/* Recent Notifications */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Bell size={20} className="text-[#7b68ee]" />
              Recente Notificaties
            </h2>
            <div className="space-y-3">
              {liveNotifications.slice(0, 4).map(notification => {
                const isRead = notification.read || readNotifications.includes(notification.id);
                return (
                <div 
                  key={notification.id} 
                  onClick={() => !isRead && setReadNotifications(prev => [...prev, notification.id])}
                  className={cn(
                    "p-4 bg-white border rounded-lg transition-all",
                    !isRead ? "cursor-pointer border-[#7b68ee]/30 shadow-sm bg-[#7b68ee]/5 hover:bg-[#7b68ee]/10" : "border-slate-100 shadow-none"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      notification.type === 'info' ? 'bg-blue-50 text-blue-500' :
                      notification.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                      notification.type === 'alert' || notification.type === 'warning' ? 'bg-orange-50 text-orange-500' :
                      notification.type === 'error' ? 'bg-red-50 text-red-500' :
                      'bg-slate-100 text-slate-500'
                    )}>
                      {notification.type === 'success' && <CheckCircle2 size={16} />}
                      {notification.type === 'alert' || notification.type === 'alert' && <AlertTriangle size={16} />}
                      {notification.type === 'error' && <AlertCircle size={16} />}
                      {notification.type === 'mention' && <MessageSquare size={16} />}
                      {notification.type === 'info' && <Info size={16} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn("text-sm font-semibold", isRead ? "text-slate-700" : "text-slate-900")}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">{notification.time}</span>
                      </div>
                      <p className="text-xs text-slate-500">{notification.description}</p>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </section>
        </div>

        {/* Sidebar: Priority Tickets */}
        <div className="space-y-12">
          {/* Priority Tickets */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TicketIcon size={20} className="text-orange-500" />
              Nieuwe Tickets
            </h2>
            <div className="space-y-3">
              {newTickets.slice(0, 4).map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => handleOpenTicket(ticket)}
                  className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-[#7b68ee]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="bg-orange-50 text-orange-600">{ticket.id}</Badge>
                    <span className="text-[10px] font-bold text-red-500">{ticket.priority}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-[#7b68ee] transition-colors">{ticket.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mb-2">{ticket.client}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{ticket.createdAt}</span>
                    <Badge 
                      variant={ticket.status === 'Opgelost' ? 'healthy' : ticket.status === 'Nieuw' ? 'on-hold' : 'default'} 
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {highPriorityTickets.length === 0 && (
                <p className="text-slate-400 text-sm italic">Geen hoge prioriteit tickets.</p>
              )}
            </div>
          </section>

          {/* Upcoming Meetings */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-[#7b68ee]" />
              Geplande Meetings
            </h2>
            <div className="space-y-3">
              {(() => {
                const upcoming = meetings.filter(m => m.status === 'Gepland').slice(0, 3);
                if (upcoming.length === 0) {
                  return <p className="text-slate-400 text-sm italic">Geen aankomende meetings.</p>;
                }
                return upcoming.map(meeting => {
                  const client = clients.find(c => c.id === meeting.clientId);
                  return (
                    <div 
                      key={meeting.id} 
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setIsMeetingDrawerOpen(true);
                      }}
                      className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-[#7b68ee]/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#7b68ee] transition-colors">{meeting.title}</h4>
                        <Badge variant="default">{meeting.time}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {meeting.date}
                        </span>
                        {client && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7b68ee]" />
                            {client.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </section>

        </div>
      </div>

      <AnimatePresence>
        {isTicketModalOpen && (
          <TicketModal 
            isOpen={isTicketModalOpen}
            onClose={() => {
              setIsTicketModalOpen(false);
              setSelectedTicket(null);
            }}
            onSubmit={handleUpdateTicket}
            ticket={selectedTicket}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailOverlay 
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStatusChange={handleTaskStatusChange}
            onNavigateToProject={onViewProject}
            onNavigateToClient={() => {}}
          />
        )}
      </AnimatePresence>
      <MeetingDrawer 
        isOpen={isMeetingDrawerOpen}
        onClose={() => setIsMeetingDrawerOpen(false)}
        meeting={selectedMeeting}
      />
    </div>
  );
};




const ProjectDeadlineCard = ({ project, onClick }: { project: Project, onClick: () => void }) => (
  <Card 
    className="p-5 hover:shadow-md transition-all group cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          {project.name}
          <Badge variant="on-hold">Deadline Naderend</Badge>
        </h3>
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-red-500 font-semibold"><Clock size={12} /> Deadline: {project.deadline}</span>
          <span className="flex items-center gap-1"><Target size={12} /> {project.client}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500 mb-1">{project.progress}%</p>
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        <button className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#7b68ee] group-hover:text-white transition-all">
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  </Card>
);


