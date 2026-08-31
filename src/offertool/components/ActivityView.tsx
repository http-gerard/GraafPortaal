import React, { useState, useEffect } from 'react';
import { fetchLiveAnalytics } from '../services/telemetryService';
import { QuoteData } from '../types';
import { Activity, Clock, CheckCircle, Mail, Eye, PenTool, Receipt, Smartphone, Users, Zap, Timer, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ActivityViewProps {
  quote: QuoteData;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ quote }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!quote) return <div className="p-8 text-center text-slate-500">Geen offerte geselecteerd</div>;

  const events = [];

  if (quote.createdAt) {
    events.push({
      id: 'created',
      timestamp: quote.createdAt,
      action: 'Offerte aangemaakt',
      icon: <PenTool className="w-4 h-4" />,
      color: 'bg-slate-100 text-slate-500'
    });
  }

  // Sent status mock
  if (quote.status === 'verzonden' || quote.status === 'akkoord') {
    events.push({
      id: 'sent',
      timestamp: 'Na aanmaak',
      action: 'Offerte uitgestuurd naar klant',
      icon: <Mail className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-600'
    });
  }

  // Analytics combined event
  

  // Signed
  if (quote.digitalSignature) {
    events.push({
      id: 'signed',
      timestamp: quote.digitalSignature.signedAt,
      action: `Digitaal ondertekend door ${quote.digitalSignature.signedBy}`,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-emerald-100 text-emerald-600'
    });
  }

  // Invoices
  if (quote.invoices && Array.isArray(quote.invoices)) {
    quote.invoices.forEach(inv => {
      events.push({
        id: inv.id,
        timestamp: inv.createdAt || 'Datum onbekend',
        action: `Factuur ${inv.invoiceNumber || 'Onbekend'} aangemaakt${inv.percentage ? ` (${inv.percentage}%)` : ''}`,
        details: `Bedrag: €${(inv.amountInclVat || 0).toLocaleString('nl-NL', {minimumFractionDigits: 2})}`,
        icon: <Receipt className="w-4 h-4" />,
        color: 'bg-orange-100 text-orange-600'
      });
    });
  }

  const [liveAnalytics, setLiveAnalytics] = useState<any>(quote.analytics);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchLiveAnalytics(quote.id);
        if (mounted && data) setLiveAnalytics(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const interval = setInterval(load, 5000); // Poll every 5s
    return () => { mounted = false; clearInterval(interval); };
  }, [quote.id]);

  if (liveAnalytics) {
    events.push({
      id: 'live-analytics-1',
      timestamp: liveAnalytics.lastViewedAt || 'Recente activiteit',
      action: `Kijkgedrag & Engagement (Totaal: ${liveAnalytics.totalViews} weergaven)`,
      icon: <Eye className="w-4 h-4" />,
      color: 'bg-white text-[#7b68ee] border-[#7b68ee]',
      isExpandable: true,
      analyticsData: liveAnalytics
    });
  }

  const displayEvents = events.reverse();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-[#7b68ee] w-5 h-5" />
            Activiteiten Tijdlijn
          </h2>
          <p className="text-sm text-slate-500 mt-1">Volg de volledige levenscyclus van offerte {quote.quoteNumber}</p>
        </div>
      </div>

      <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-8 pt-4">
        {displayEvents.map((event) => (
          <div key={event.id} className="relative pl-8">
            <div className={cn(
              "absolute -left-4 top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shrink-0",
              event.color
            )}>
              {event.icon}
            </div>
            
            <div 
              className={cn(
                "bg-white border border-slate-200 rounded-lg shadow-sm transition-all overflow-hidden",
                event.isExpandable ? "cursor-pointer hover:border-slate-300" : ""
              )}
              onClick={() => {
                if (event.isExpandable) {
                  setExpandedId(expandedId === event.id ? null : event.id);
                }
              }}
            >
              <div className="p-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{event.action}</h4>
                  {event.details && (
                    <p className="text-xs text-slate-500 mt-1">{event.details}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded shrink-0">
                    <Clock className="w-3 h-3" />
                    {event.timestamp}
                  </div>
                  {event.isExpandable && (
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedId === event.id ? "rotate-180" : "")} />
                  )}
                </div>
              </div>

              {/* Expanded Content for Analytics */}
              {event.isExpandable && expandedId === event.id && event.analyticsData && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-6">
                  
                  {/* Top KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold">Weergaven</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{event.analyticsData.totalViews}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold">Apparaten</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{event.analyticsData.uniqueDevices}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
                        <Timer className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold">Totale Tijd</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{event.analyticsData.totalTimeMinutes}m</p>
                    </div>
                    <div className="bg-white border border-[#7b68ee]/30 bg-[#7b68ee]/5 rounded-lg p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 text-[#7b68ee] mb-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold">Engagement</span>
                      </div>
                      <p className="text-lg font-bold text-[#7b68ee]">{event.analyticsData.engagementScore}/100</p>
                    </div>
                  </div>

                  {/* Attention per section */}
                  {event.analyticsData.sections && Array.isArray(event.analyticsData.sections) && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                      <h3 className="text-xs font-bold text-slate-900 mb-3">Aandacht per onderdeel</h3>
                      <div className="space-y-3">
                        {event.analyticsData.sections.map((section: any) => (
                          <div key={section.sectionId}>
                            <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                              <span className="text-slate-700">{section.name}</span>
                              <span className="text-slate-500">{section.timeSpentMinutes} min ({section.percentage}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  section.interestLevel === 'high' ? 'bg-[#7b68ee]' : 
                                  section.interestLevel === 'medium' ? 'bg-[#7b68ee]/60' : 'bg-slate-300'
                                )}
                                style={{ width: `${section.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual Sessions / Events */}
                  {event.analyticsData.events && Array.isArray(event.analyticsData.events) && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 mb-2 mt-4">Afzonderlijke sessies</h3>
                      {event.analyticsData.events.map((evt: any) => (
                        <div key={evt.id} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                          <div className="mt-0.5 w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                            {evt.icon === 'Smartphone' ? <Smartphone className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="flex items-center justify-between gap-4 mb-0.5">
                              <h5 className="text-[11px] font-bold text-slate-900">{evt.action}</h5>
                              <span className="text-[9px] font-bold text-slate-400">{evt.timestamp}</span>
                            </div>
                            <p className="text-[10px] text-slate-500">{evt.device} • {evt.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        ))}

        {displayEvents.length === 0 && (
          <div className="pl-8 text-sm text-slate-500 italic">Nog geen activiteiten geregistreerd voor deze offerte.</div>
        )}
      </div>
    </div>
  );
};
