import * as React from 'react';
import { Search, Plus, Clock, ArrowUpRight } from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { Project } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ProjectModal } from './ProjectModal';
import { supabase } from '../lib/supabase';

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

interface ProjectsProps {
  onViewProject: (id: string) => void;
}

export const Projects = ({ onViewProject }: ProjectsProps) => {
  const { projects, clients, refreshData } = useDatabase();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('Alle');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Alle' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);

  const handleSave = async (p: Project) => {
    try {
      const clientId = clients.find(c => c.name === p.client)?.id;
      const { data: proj, error } = await supabase.from('projects').insert([{
        name: p.name,
        description: p.description,
        status: p.status,
        progress: p.progress,
        client_id: clientId,
        deadline: p.deadline,
        category: p.category,
        phase: p.phase
      }]).select().single();
      
      if (!error && proj) {
         await supabase.from('project_activities').insert([{
           project_id: proj.id,
           text: "Project succesvol opgestart",
           type: 'start'
         }]);
      }
      if (error) throw error;
      await refreshData();
      setIsProjectModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('Fout bij opslaan');
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Project Portfolio</h1>
          <p className="text-slate-500 font-medium">Volledig overzicht van alle lopende en voltooide opdrachten.</p>
        </div>
        <Button className="w-full md:w-auto flex items-center gap-2" onClick={() => setIsProjectModalOpen(true)}>
          <Plus size={18} /> Nieuw Project
        </Button>
      </header>

      {/* Modern Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-[2rem] shadow-sm border border-black/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Zoeken op project of klant..."
            className="w-full bg-slate-50/50 border-none rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-[#7b68ee]/30 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 p-2">
          {['Alle', 'Open', 'In Uitvoering', 'Klaar'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-bold   transition-all",
                statusFilter === status 
                  ? "bg-[#7b68ee] text-white" 
                  : "bg-transparent text-slate-400 hover:text-[#7b68ee] hover:bg-[#7b68ee]/5"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <Card 
            key={project.id} 
            className="relative p-0 overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer border-none shadow-sm ring-1 ring-black/5"
            onClick={() => onViewProject(project.id)}
          >
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <Badge variant={project.status === 'Klaar' ? 'healthy' : project.status === 'In Uitvoering' ? 'default' : 'on-hold'}>
                  {project.status}
                </Badge>
                <div className="text-xs text-slate-500 font-medium truncate max-w-[150px] text-right">
                  {project.team.slice(0, 3).map(m => m.name.split(' ')[0]).join(', ')}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#7b68ee] transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <span className="text-[#7b68ee]">{project.client}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{project.id}</span>
                </div>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 h-8 font-medium">
                {project.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>Voortgang</span>
                  <span className="text-slate-900">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    className="bg-gradient-to-r from-[#7b68ee] to-[#2dd4bf] h-full rounded-full transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-[#f8fafc] border-t border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Clock size={12} className="text-[#7b68ee]" />
                {formatLastUpdated(project.lastUpdated)}
              </div>
              <ArrowUpRight size={18} className="text-slate-300 group-hover:text-[#7b68ee] transition-colors" />
            </div>
          </Card>
        ))}
      </div>
      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onSave={handleSave} 
      />
    </div>
  );
};
