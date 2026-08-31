import * as React from 'react';
import { UserPlus, MoreVertical, Search, Filter, Mail, Shield, Users, PlusCircle } from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { useDatabase } from '../contexts/DatabaseContext';
import { supabase } from '../lib/supabase';
import { TeamMemberModal } from './TeamMemberModal';
import { TeamMember } from '../types';
import { AnimatePresence } from 'motion/react';

export const TeamMembers = () => {
  const { teamMembers, refreshData } = useDatabase();

  const [members, setMembers] = React.useState<TeamMember[]>(teamMembers);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  const handleOpenAdd = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleSave = async (member: any) => {
    try {
      if (member.id.startsWith('new-') || member.id.length < 10) {
        
        // 1. Stuur uitnodiging via server
        if (member.email) {
          const res = await fetch('/api/auth/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: member.email,
              data: { role: 'agency', name: member.name }
            })
          });
          if (!res.ok) {
            console.error("Fout bij uitnodigen:", await res.text());
          }
        }

        // 2. Opslaan in database
        const { error } = await supabase.from('team_members').insert([{
          name: member.name,
          role: member.role,
          avatar: member.avatar
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('team_members').update({
          name: member.name,
          role: member.role,
          avatar: member.avatar
        }).eq('id', member.id);
        if (error) throw error;
      }
      await refreshData();
      setIsModalOpen(false);
    } catch(err) {
      console.error(err);
      alert('Fout bij opslaan teamlid: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      await refreshData();
      setIsModalOpen(false);
    } catch(err) {
      console.error(err);
      alert('Fout bij verwijderen teamlid: ' + err.message);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <span className="text-[#7b68ee] font-bold tracking-[0.2em] text-[10px]">Agency Talentenpool</span>
          <h2 className="text-6xl font-bold text-slate-900 leading-none mb-4">Mijn Team</h2>
          <p className="text-slate-500 max-w-2xl text-sm leading-relaxed font-medium">Beheer je interne talenten, wijs rollen toe en organiseer je agency slagkracht.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-3 shadow-xl">
          <PlusCircle size={20} />
          Nieuw Teamlid
        </Button>
      </header>

      <section className="flex flex-col items-end gap-6">
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl ring-1 ring-black/5 text-slate-400">
             <Search size={16} />
             <input type="text" placeholder="Zoek teamleden..." className="bg-transparent border-none text-xs font-bold outline-none placeholder:text-slate-300 w-32" />
           </div>
           <Button variant="secondary" size="sm" className="gap-2 px-4">
              <Filter size={16} />
              <span className="text-[10px]">Filter</span>
           </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member) => (
          <Card 
            key={member.id} 
            className="group hover:ring-2 hover:ring-[#7b68ee]/10 border-none shadow-xl shadow-black/[0.02] p-8 relative overflow-hidden transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleOpenEdit(member)}
                className="p-2 hover:bg-[#f1f5f9] rounded-lg text-slate-400 transition-colors"
              >
                <MoreVertical size={20} />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-[#f1f5f9] flex items-center justify-center text-[#7b68ee] shadow-inner group-hover:scale-105 transition-transform duration-500">
                <Users size={32} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="default" className="text-[9px] bg-[#e2e8f0] border-none text-slate-500">
                    {member.role}
                  </Badge>
                </div>
              </div>

              <div className="w-full flex items-center justify-between pt-6 border-t border-black/5">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[9px] font-bold text-slate-400">Toegewezen Taken</span>
                  <span className="text-sm font-bold text-slate-900">12 Actief</span>
                </div>
                <button 
                  onClick={() => handleOpenEdit(member)}
                  className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-[#7b68ee] transition-all"
                >
                  Profiel Bewerken
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <TeamMemberModal 
            isOpen={isModalOpen}
            member={selectedMember}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
