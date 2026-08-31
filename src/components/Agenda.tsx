import * as React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Search } from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { Meeting } from '../types';
import { useDatabase } from '../contexts/DatabaseContext';
import { supabase } from '../lib/supabase';
import { MeetingDrawer } from './MeetingDrawer';

export const Agenda = () => {
  const { meetings: dbMeetings, clients, refreshData } = useDatabase();

  const [meetings, setMeetings] = React.useState<Meeting[]>(dbMeetings);
  const [outlookMeetings, setOutlookMeetings] = React.useState<any[]>([]);

  React.useEffect(() => setMeetings(dbMeetings), [dbMeetings]);

    const fetchOutlook = async () => {
    let icsUrl = '';
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      icsUrl = data.settings?.outlook_ics_url || '';
    } catch(e) {}
    
    if (!icsUrl) {
      console.warn('Geen Outlook link gevonden in de instellingen.');
      return;
    }
    fetch(`/api/calendar/outlook?url=${encodeURIComponent(icsUrl)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.events) {
          setOutlookMeetings(data.events);
        } else {
          alert('Kon Outlook afspraken niet laden.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Fout bij ophalen Outlook kalender.');
      });
  };

  React.useEffect(() => {
    fetchOutlook();
  }, []);

  // Haal de outlook meetings eruit die al in de database staan (om dubbelingen te voorkomen)
  // We gebruiken de DB versie (omdat daar de notes/projects aanhangen), maar we updaten visueel
  // even de tijden met wat er vers uit Outlook komt.
  const mappedOutlookMeetings = outlookMeetings.filter(om => !meetings.some(m => m.outlook_uid === om.id));
  
  // Update de DB meetings die eigenlijk outlook meetings zijn met de nieuwste tijden uit de ICS
  const enrichedMeetings = meetings.map(m => {
    if (m.outlook_uid) {
      const liveOutlook = outlookMeetings.find(om => om.id === m.outlook_uid);
      if (liveOutlook) {
        return { ...m, ...liveOutlook, notes: m.notes, clientId: m.clientId, projectId: m.projectId };
      }
    }
    return m;
  });

  const allMeetings = [...enrichedMeetings, ...mappedOutlookMeetings].sort((a, b) => {
    const timeA = a.time || "00:00";
    const timeB = b.time || "00:00";
    return timeA.localeCompare(timeB);
  });
  
  // Later in the file we need to use allMeetings instead of meetings where applicable, but wait!
  // filteredMeetings filters by date.

  const [selectedMeeting, setSelectedMeeting] = React.useState<Meeting | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const handleOpenDrawer = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsDrawerOpen(true);
  };

  const handleSaveMeeting = async (updatedMeeting: Meeting) => {
    try {
      const payload = {
        title: updatedMeeting.title,
        date: updatedMeeting.date,
        time: updatedMeeting.time,
        duration: updatedMeeting.duration || 60,
        client_id: updatedMeeting.clientId || null,
        project_id: updatedMeeting.projectId || null,
        location: updatedMeeting.location || '',
        notes: updatedMeeting.notes || '',
        status: updatedMeeting.status || 'Gepland',
        attachments: updatedMeeting.attachments || [],
        outlook_uid: updatedMeeting.isOutlook ? (updatedMeeting.outlook_uid || updatedMeeting.id) : null
      };

      // Controleer of de meeting al in de database zit
      const existingDbMeeting = dbMeetings.find(m => 
        (m.id === updatedMeeting.id) || 
        (m.outlook_uid && updatedMeeting.isOutlook && m.outlook_uid === updatedMeeting.id)
      );

      if (existingDbMeeting) {
        // Update bestaande DB meeting
        const { error } = await supabase
          .from('meetings')
          .update(payload)
          .eq('id', existingDbMeeting.id);
          
        if (error) throw error;
      } else {
        // Nieuwe meeting (bijv. een nieuwe Outlook meeting die we voor het eerst 'opslaan' met notities)
        const { error } = await supabase
          .from('meetings')
          .insert([payload]);
          
        if (error) throw error;
      }

      // Ververs database context
      await refreshData();
      
      // Update local state voor snelle UI refresh
      setMeetings(prev => {
        if (existingDbMeeting) {
          return prev.map(m => m.id === existingDbMeeting.id ? { ...updatedMeeting, id: existingDbMeeting.id } : m);
        }
        return [...prev, updatedMeeting];
      });
      
    } catch (error) {
      console.error("Fout bij opslaan meeting:", error);
      alert("Kon de meeting niet opslaan in de database.");
    }
  };

  const filteredMeetings = allMeetings.filter(m => {
    const matchesSearch = (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const upcomingMeetings = filteredMeetings.filter(m => m.status === 'Gepland');
  const pastMeetings = filteredMeetings.filter(m => m.status === 'Voltooid');

  const renderMeetingList = (list: Meeting[]) => {
    if (list.length === 0) {
      return (
        <div className="py-12 text-center bg-white rounded-3xl border border-black/5 shadow-sm">
          <p className="text-slate-400 font-medium text-sm">Geen meetings gevonden.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((meeting) => {
          const client = clients.find(c => c.id === meeting.clientId);
          
          return (
            <Card 
              key={meeting.id} 
              className="p-0 overflow-hidden hover:shadow-md transition-all cursor-pointer border-none ring-1 ring-black/5 group"
              onClick={() => handleOpenDrawer(meeting)}
            >
              <div className="flex flex-col md:flex-row">
                {/* Date & Time Block */}
                <div className="bg-slate-50 p-6 md:w-48 flex flex-col justify-center border-b md:border-b-0 md:border-r border-black/5 group-hover:bg-[#7b68ee]/5 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon size={14} className="text-[#7b68ee]" />
                    <span className="text-xs font-bold text-slate-500">{meeting.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-900">{meeting.time} ({meeting.duration}m)</span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#7b68ee] transition-colors">
                      {meeting.title}
                    </h3>
                    <Badge variant={meeting.status === 'Voltooid' ? 'healthy' : meeting.status === 'Gepland' ? 'default' : 'on-hold'}>
                      {meeting.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    {client && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7b68ee]"></span>
                        Klant: {client.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      {meeting.location}
                    </span>
                    {meeting.attachments && meeting.attachments.length > 0 && (
                      <span className="flex items-center gap-1.5 text-[#7b68ee] bg-[#7b68ee]/10 px-2 py-0.5 rounded-md">
                        {meeting.attachments.length} {meeting.attachments.length === 1 ? 'bijlage' : 'bijlagen'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Agenda & Meetings</h1>
          <p className="text-slate-500 font-medium">Beheer je afspraken en koppel direct notities aan je klanten.</p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-[2rem] shadow-sm border border-black/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Zoek een afspraak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none pl-14 pr-6 py-4 text-sm font-semibold outline-none focus:ring-0 placeholder:font-normal placeholder:text-slate-400"
          />
        </div>
        
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CalendarIcon size={20} className="text-[#7b68ee]" />
            Aankomende Afspraken
          </h2>
          {renderMeetingList(upcomingMeetings)}
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-slate-400" />
            Afgelopen Afspraken
          </h2>
          {renderMeetingList(pastMeetings)}
        </section>
      </div>

      <MeetingDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        meeting={selectedMeeting}
        onSave={handleSaveMeeting}
      />
    </div>
  );
};
