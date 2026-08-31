import * as React from 'react';
import { MessageSquare, ExternalLink, CheckCircle2, Link as LinkIcon, Send, Clock, PlusCircle } from 'lucide-react';
import { Badge, Button } from './UI';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackPoint {
  id: string;
  text: string;
  resolved: boolean;
}

interface FeedbackRequest {
  id: string;
  title: string;
  type: 'link' | 'file';
  url: string;
  status: 'pending' | 'reviewed';
  points: FeedbackPoint[];
  date: Date;
}

interface ClientFeedbackRequestProps {
  viewMode: 'agency' | 'client';
}

export const ClientFeedbackRequest = ({ viewMode }: ClientFeedbackRequestProps) => {
  const [requests, setRequests] = React.useState<FeedbackRequest[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');

  const [activeRequestId, setActiveRequestId] = React.useState<string | null>('req-1');
  const [newFeedbackPoint, setNewFeedbackPoint] = React.useState('');

  const handleCreateRequest = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setRequests(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      type: 'link',
      url: newUrl,
      status: 'pending',
      points: [],
      date: new Date()
    }, ...prev]);
    setIsCreating(false);
    setNewTitle('');
    setNewUrl('');
  };

  const handleAddFeedbackPoint = (reqId: string) => {
    if (!newFeedbackPoint.trim()) return;
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          points: [...req.points, { id: Math.random().toString(36).substr(2, 9), text: newFeedbackPoint, resolved: false }]
        };
      }
      return req;
    }));
    setNewFeedbackPoint('');
  };

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleToggleResolve = (reqId: string, pointId: string) => {
    if (viewMode === 'client') return;
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          points: req.points.map(p => p.id === pointId ? { ...p, resolved: !p.resolved } : p)
        };
      }
      return req;
    }));
  };

  const handleMarkAsReviewed = (reqId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return { ...req, status: 'reviewed' };
      }
      return req;
    }));
    
    // Simulate notification to the agency responsible
    setToastMessage("Notificatie verzonden naar de verantwoordelijke!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#7b68ee]/10 flex items-center justify-center">
            <MessageSquare className="text-[#7b68ee]" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Review & Feedback Centrum</h2>
            <p className="text-sm text-slate-500 mt-1">Vraag en beheer feedback op opleveringen en links.</p>
          </div>
        </div>
        {viewMode === 'agency' && (
          <Button 
            size="md" 
            onClick={() => setIsCreating(!isCreating)}
            variant={isCreating ? "ghost" : "primary"}
            className="flex items-center gap-2"
          >
            {isCreating ? 'Annuleren' : <><PlusCircle size={18} /> Nieuw Feedback Verzoek</>}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-slate-100 bg-[#7b68ee]/5 overflow-hidden"
          >
            <div className="p-8">
              <h3 className="text-base font-bold text-slate-800 mb-4">Maak een nieuw verzoek aan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Titel van Oplevering</label>
                  <input 
                    type="text" 
                    placeholder="bijv. Prototype Website"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b68ee]/20 focus:border-[#7b68ee]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">URL (Link naar bestand/design)</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b68ee]/20 focus:border-[#7b68ee]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="md" onClick={handleCreateRequest} disabled={!newTitle.trim() || !newUrl.trim()}>
                  <Send size={16} className="mr-2" /> Verstuur Verzoek
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="divide-y divide-slate-100">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="text-slate-300" size={32} />
            </div>
            <p className="text-lg font-medium text-slate-700">Geen openstaande reviews</p>
            <p className="text-sm mt-1 max-w-sm">Wanneer je ontwerpen of bestanden deelt, kun je hier specifiek om goedkeuring en feedback vragen.</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className={cn("p-8 transition-colors", activeRequestId === req.id ? "bg-white" : "bg-slate-50/50 hover:bg-slate-50")}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{req.title}</h3>
                    <Badge variant={req.status === 'reviewed' ? 'healthy' : 'on-hold'} className="text-xs px-3 py-1">
                      {req.status === 'reviewed' ? 'Afgerond & Beoordeeld' : 'Wacht op feedback'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 mt-3">
                    <a 
                      href={req.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-[#7b68ee] bg-[#7b68ee]/10 px-4 py-2 rounded-lg hover:bg-[#7b68ee]/20 transition-colors"
                    >
                      <LinkIcon size={16} /> Open Bestand / Link
                    </a>
                    <span className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                      <Clock size={14} /> Gevraagd op {req.date.toLocaleDateString('nl-BE')}
                    </span>
                  </div>
                </div>
                
                <Button 
                  size="md" 
                  variant={activeRequestId === req.id ? 'secondary' : 'primary'}
                  onClick={() => setActiveRequestId(activeRequestId === req.id ? null : req.id)}
                  className="ml-4"
                >
                  {activeRequestId === req.id 
                    ? 'Sluit Feedback Paneel' 
                    : (req.status === 'reviewed' ? 'Bekijk Feedback' : (viewMode === 'client' ? 'Geef Feedback' : 'Bekijk Status'))}
                </Button>
              </div>

              <AnimatePresence>
                {activeRequestId === req.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-8 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                      {/* Feedback Points List */}
                      <div className="p-6 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-sm font-bold text-slate-800 mb-4">Feedback Punten ({req.points.length})</h4>
                        {req.points.length === 0 ? (
                          <p className="text-sm text-slate-500 italic bg-white p-4 rounded-lg border border-slate-100 text-center">
                            Nog geen feedback gegeven.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {req.points.map((point, idx) => (
                              <div key={point.id} className={cn("flex items-start gap-4 p-4 rounded-lg border transition-colors", point.resolved ? "bg-slate-100/50 border-slate-200" : "bg-white border-slate-200 shadow-sm")}>
                                <div className="mt-0.5">
                                  <button 
                                    onClick={() => handleToggleResolve(req.id, point.id)}
                                    disabled={viewMode === 'client'}
                                    className={cn(
                                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm",
                                      point.resolved 
                                        ? "bg-emerald-500 border-emerald-500 text-white" 
                                        : "bg-white border-slate-300 text-transparent hover:border-[#7b68ee]"
                                    )}
                                    title={viewMode === 'client' ? "Alleen het bureau kan punten afvinken" : "Markeer als opgelost"}
                                  >
                                    <CheckCircle2 size={14} />
                                  </button>
                                </div>
                                <div className={cn("flex-1 text-sm leading-relaxed", point.resolved ? "text-slate-400 line-through" : "text-slate-800")}>
                                  <span className="font-bold text-slate-400 mr-2">{idx + 1}.</span>
                                  {point.text}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add Feedback Input / Completed State */}
                      {req.status === 'pending' ? (
                        <div className="p-6 bg-white">
                          {viewMode === 'client' ? (
                            <div className="space-y-4">
                              <label className="block text-sm font-bold text-slate-800">Voeg een nieuw puntje toe</label>
                              <div className="flex items-start gap-3">
                                <textarea 
                                  placeholder="Beschrijf je feedback (bijv. 'De titel op de homepage mag groter')..."
                                  value={newFeedbackPoint}
                                  onChange={(e) => setNewFeedbackPoint(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddFeedbackPoint(req.id);
                                    }
                                  }}
                                  rows={2}
                                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b68ee]/20 focus:border-[#7b68ee] resize-none"
                                />
                                <Button size="lg" onClick={() => handleAddFeedbackPoint(req.id)} disabled={!newFeedbackPoint.trim()} className="h-[68px]">
                                  Punt Toevoegen
                                </Button>
                              </div>
                              
                              <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500">Klik op enter om snel een puntje toe te voegen.</p>
                                <Button size="md" variant="primary" onClick={() => {
                                  handleMarkAsReviewed(req.id);
                                  setActiveRequestId(null);
                                }}>
                                  <CheckCircle2 size={18} className="mr-2" /> Ik ben klaar met reviewen
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100">
                              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                              Wachten tot de klant zijn/haar feedback heeft afgerond...
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 bg-emerald-50/50 border-t border-slate-100">
                          <div className="flex items-center gap-3 text-emerald-700">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold">Feedback Ronde Afgerond</p>
                              <p className="text-xs mt-0.5 opacity-80">
                                {viewMode === 'agency' 
                                  ? 'De klant heeft de feedback afgerond. Je kan nu de puntjes afwerken.' 
                                  : 'Je hebt deze oplevering succesvol beoordeeld.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[999] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={20} className="text-emerald-400" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
