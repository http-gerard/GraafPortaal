import React from 'react';
import { TimelinePhase, QuoteData } from '../types';
import { Clock, Plus, Trash2, CheckCircle2, Calendar, Layers } from 'lucide-react';

interface TimelineManagerProps {
  quote: QuoteData;
  onUpdateQuote: (quote: QuoteData) => void;
}

export const TimelineManager: React.FC<TimelineManagerProps> = ({
  quote,
  onUpdateQuote
}) => {
  
  const handleAutoGenerate = () => {
    const categories = quote.categories || [];
    let newPhases: TimelinePhase[] = [];
    
    if (categories.length > 1 || categories.length === 0) {
      // 4 empty phases
      newPhases = Array.from({ length: 4 }).map((_, i) => ({
        id: `phase-${Date.now()}-${i}`,
        phaseNumber: i + 1,
        title: `Fase ${i + 1}`,
        duration: '',
        description: '',
        deliverables: []
      }));
    } else {
      const catName = categories[0].name.toLowerCase();
      if (catName.includes('website') || catName.includes('web')) {
        newPhases = [
          { id: `p-${Date.now()}-1`, phaseNumber: 1, title: 'Discovery & Design', duration: 'Week 1 - 2', description: 'Onderzoek, wireframing en het opmaken van het visuele design.', deliverables: ['Sitemap', 'Wireframes', 'Design Mockups'] },
          { id: `p-${Date.now()}-2`, phaseNumber: 2, title: 'Development', duration: 'Week 3 - 5', description: 'Programmeren van de website en koppelen van CMS.', deliverables: ['Testlink', 'CMS Oplevering'] },
          { id: `p-${Date.now()}-3`, phaseNumber: 3, title: 'Testing & Content', duration: 'Week 6', description: 'Vullen van de website en uitvoerig testen op mobiel/desktop.', deliverables: ["Ingevulde pagina's", 'QA Rapport'] },
          { id: `p-${Date.now()}-4`, phaseNumber: 4, title: 'Go-Live & Opleiding', duration: 'Week 7', description: 'Lancering van de website en training voor het beheer.', deliverables: ['Live Website', 'Opleiding'] },
        ];
      } else if (catName.includes('marketing')) {
        newPhases = [
          { id: `p-${Date.now()}-1`, phaseNumber: 1, title: 'Strategie & Onderzoek', duration: 'Week 1 - 2', description: 'Analyse van de doelgroep en opzet van de marketingstrategie.', deliverables: ['Strategiedocument', 'Kanaalkeuze'] },
          { id: `p-${Date.now()}-2`, phaseNumber: 2, title: 'Setup & Creatie', duration: 'Week 3 - 4', description: 'Aanmaken van accounts en ontwerpen van advertenties.', deliverables: ['Ad Creatives', 'Campagne Setup'] },
          { id: `p-${Date.now()}-3`, phaseNumber: 3, title: 'Lancering', duration: 'Week 5', description: 'Live zetten van de eerste campagnes.', deliverables: ['Live Campagnes'] },
          { id: `p-${Date.now()}-4`, phaseNumber: 4, title: 'Optimalisatie', duration: 'Doorlopend', description: 'Monitoren en bijsturen van de campagnes voor maximaal resultaat.', deliverables: ['Maandelijkse Rapportage'] },
        ];
      } else if (catName.includes('branding')) {
        newPhases = [
          { id: `p-${Date.now()}-1`, phaseNumber: 1, title: 'Brand Discovery', duration: 'Week 1 - 2', description: 'Workshops en bepalen van de merkidentiteit.', deliverables: ['Brand Strategie'] },
          { id: `p-${Date.now()}-2`, phaseNumber: 2, title: 'Concept Creatie', duration: 'Week 3 - 4', description: 'Ontwerpen van logo en visuele stijl.', deliverables: ['Logo Concepten', 'Kleurpalet'] },
          { id: `p-${Date.now()}-3`, phaseNumber: 3, title: 'Uitwerking', duration: 'Week 5 - 6', description: 'Uitwerken van huisstijl over alle dragers.', deliverables: ['Brandbook', 'Visitekaartjes'] },
          { id: `p-${Date.now()}-4`, phaseNumber: 4, title: 'Oplevering', duration: 'Week 7', description: 'Overdracht van alle bronbestanden.', deliverables: ['Source Files'] },
        ];
      } else {
        newPhases = Array.from({ length: 4 }).map((_, i) => ({
          id: `phase-${Date.now()}-${i}`,
          phaseNumber: i + 1,
          title: `Fase ${i + 1}`,
          duration: '',
          description: '',
          deliverables: []
        }));
      }
    }
    
    onUpdateQuote({ ...quote, timelinePhases: newPhases });
  };

  const handleUpdatePhase = (phaseId: string, updates: Partial<TimelinePhase>) => {
    const updated = quote.timelinePhases.map(p =>
      p.id === phaseId ? { ...p, ...updates } : p
    );
    onUpdateQuote({ ...quote, timelinePhases: updated });
  };

  const handleAddPhase = () => {
    const newPhaseNumber = quote.timelinePhases.length + 1;
    const newPhase: TimelinePhase = {
      id: `phase-${Date.now()}`,
      phaseNumber: newPhaseNumber,
      title: `Fase ${newPhaseNumber}: Nieuwe Mijlpaal`,
      duration: `Week ${newPhaseNumber * 2 - 1} - ${newPhaseNumber * 2}`,
      description: 'Beschrijving van de werkzaamheden in deze fase...',
      deliverables: ['Oplevering 1', 'Revisieronde']
    };

    onUpdateQuote({
      ...quote,
      timelinePhases: [...quote.timelinePhases, newPhase]
    });
  };

  const handleDeletePhase = (phaseId: string) => {
    const updated = quote.timelinePhases
      .filter(p => p.id !== phaseId)
      .map((p, idx) => ({ ...p, phaseNumber: idx + 1 }));
    onUpdateQuote({ ...quote, timelinePhases: updated });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-900" />
            <h3 className="text-base font-semibold text-slate-900">Project Tijdlijn & Fasering</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Definieer de doorlooptijd, mijlpalen en concrete deliverables voor de offerte en presentatie.
          </p>
        </div>

        
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoGenerate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Standaard Tijdlijn</span>
          </button>
          <button
            onClick={handleAddPhase}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-[#7b68ee] text-white hover:bg-[#6a5ad6] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fase Toevoegen</span>
          </button>
        </div>

      </div>

      {/* Phases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quote.timelinePhases.map((phase) => (
          <div
            key={phase.id}
            className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-900/40 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center font-semibold text-sm">
                  {phase.phaseNumber}
                </span>

                <button
                  onClick={() => handleDeletePhase(phase.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                  title="Verwijder fase"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Titel van de fase:</label>
                <input
                  type="text"
                  value={phase.title}
                  onChange={(e) => handleUpdatePhase(phase.id, { title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs font-semibold text-[#1e293b] focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Doorlooptijd:</label>
                <input
                  type="text"
                  value={phase.duration}
                  onChange={(e) => handleUpdatePhase(phase.id, { duration: e.target.value })}
                  placeholder="bijv. Week 1 - 2"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs font-bold text-[#1e293b] focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Omschrijving:</label>
                <textarea
                  rows={3}
                  value={phase.description}
                  onChange={(e) => handleUpdatePhase(phase.id, { description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs text-[#1e293b] focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <label className="block text-[10px] font-semibold text-slate-700">Deliverables (komma-gescheiden):</label>
              <input
                type="text"
                value={phase.deliverables.join(', ')}
                onChange={(e) => handleUpdatePhase(phase.id, { 
                  deliverables: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs text-[#1e293b] focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
