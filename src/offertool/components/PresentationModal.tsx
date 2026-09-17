import React, { useState, useEffect } from 'react';
import { QuoteData, ServiceCategory } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Presentation, 
  FileDown, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  User, 
  Building2, 
  Target, 
  ShieldCheck,
  TrendingUp,
  Layers,
  Clock
} from 'lucide-react';
import { generatePowerPointPresentation, cleanCategoryName } from '../services/pptxService';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteData;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  quote
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Active categories that have selected items
  const activeCategories = (quote.categories || []).filter(cat =>
    (quote.items || []).some(item => item.categoryId === cat.id && item.selected)
  );

  // Slides configuration:
  // Slide 0: Cover
  // Slide 1: Doelstellingen & Strategie
  // Slide 2 ... (2 + activeCategories.length - 1): Per-category deep dive
  // Slide N: Investering & Prijzen
  // Slide N+1: Tijdlijn & Fasering
  // Slide N+2: Akkoord & Volgende Stappen
  const totalSlides = 3 + activeCategories.length + 2;

  // Calculations
  const selectedItems = (quote.items || []).filter(i => i.selected);
  const oneOffItems = selectedItems.filter(i => i.billingType === 'one_off');
  const monthlyItems = selectedItems.filter(i => i.billingType === 'monthly');

  const oneOffSubtotal = oneOffItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);
  const monthlySubtotal = monthlyItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);

  const discountVal = Number(quote.overallDiscountValue) || 0;
  const discountAmount = quote.overallDiscountType === 'percentage'
    ? (oneOffSubtotal * discountVal) / 100
    : discountVal;

  const finalOneOff = Math.max(0, oneOffSubtotal - discountAmount);
  const vatRate = Number(quote.vatRate) || 21;
  const vatAmount = (finalOneOff * vatRate) / 100;
  const totalInclVat = finalOneOff + vatAmount;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalSlides, onClose]);

  if (!isOpen) return null;

  const handleExportPptx = async () => {
    setIsExporting(true);
    try {
      await generatePowerPointPresentation(quote);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCurrentSlide = () => {
    // ----------------------------------------------------
    // SLIDE 0: COVER SLIDE
    // ----------------------------------------------------
    if (currentSlideIndex === 0) {
      return (
        <div className="h-full flex flex-col justify-between p-8 sm:p-14 animate-in fade-in zoom-in-95 duration-300 bg-white text-[#1e293b]">
          <div className="flex items-center justify-between">
            <BrandLogo size="lg" theme="light" />
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-\[#7b68ee\]/10 text-xs font-mono font-semibold text-[#7b68ee]">
              {quote.quoteNumber}
            </div>
          </div>

          <div className="max-w-4xl my-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7b68ee]/10 text-[#7b68ee] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#7b68ee]" />
              Projectvoorstel & Strategie
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-slate-800 leading-tight font-['Space_Grotesk',sans-serif]">
              {quote.projectName}
            </h1>

            <p className="text-lg sm:text-xl text-slate-500 font-medium">
              Op maat samengesteld voor <span className="text-slate-800 font-semibold underline decoration-[#7b68ee] decoration-4 underline-offset-4">{quote.client.companyName}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-slate-800" />
              <div>
                <span className="block text-slate-500 text-[10px] font-semibold">Contactpersoon</span>
                <span className="font-bold text-slate-800">{quote.client.contactPerson} ({quote.client.companyName})</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-800" />
              <div>
                <span className="block text-slate-500 text-[10px] font-semibold">Datum & Geldigheid</span>
                <span className="font-bold text-slate-800">{quote.createdAt} • Geldig t/m {quote.validUntil}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-800" />
              <div>
                <span className="block text-slate-500 text-[10px] font-semibold">Strategisch Adviseur</span>
                <span className="font-bold text-slate-800">{quote.salesRepresentative.name}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // SLIDE 1: STRATEGIE & DOELSTELLINGEN
    // ----------------------------------------------------
    if (currentSlideIndex === 1) {
      return (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 animate-in fade-in duration-300 bg-white text-[#1e293b]">
          <div>
            <span className="text-xs font-semibold text-slate-800 block mb-1">
              Visie & Aanpak
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold text-slate-800 font-['Space_Grotesk',sans-serif]">
              Waarom dit traject uw marktleiderschap verstevigt
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
            {/* Left Box: Executive Summary */}
            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-slate-800" />
                  <h3 className="text-base font-semibold text-slate-800">Het Doel van het Project</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {quote.projectSummary}
                </p>
              </div>

              <div className="mt-6 p-4 rounded-md bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-800 block mb-1">Onze Belofte:</span>
                <p className="text-xs text-[#1e293b]">
                  Geen standaardsjablonen of loze beloftes, maar een meetbaar en onderscheidend digitaal platform dat direct omzet genereert.
                </p>
              </div>
            </div>

            {/* Right: 3 Key Pillars */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-md bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center font-semibold text-sm mb-3">
                    01
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1.5">Onderscheidend Merk</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Creëer direct vertrouwen en autoriteit. Klanten kiezen resoluut voor uw expertise.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-800 mt-4 block">Autoriteit & Prestige</span>
              </div>

              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-md bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center font-semibold text-sm mb-3">
                    02
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1.5">Conversie Engine</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Elke pagina en animatie is ontworpen om bezoekers soepel naar een offerte-aanvraag te leiden.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-800 mt-4 block">Meetbare Leads</span>
              </div>

              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-md bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center font-semibold text-sm mb-3">
                    03
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1.5">Schaalbaarheid</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gebouwd met moderne technologie die meegroeit met uw bedrijf zonder technische belemmeringen.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-800 mt-4 block">Toekomstbestendig</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
            <span>Studio Graaf Pitch Deck</span>
            <span>Gebruik pijltjestoetsen om te navigeren</span>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // SLIDES 2 .. N: PER-CATEGORY SLIDES WITH VALUE PROPOSITION
    // ----------------------------------------------------
    const catOffset = currentSlideIndex - 2;
    if (catOffset >= 0 && catOffset < activeCategories.length) {
      const cat = activeCategories[catOffset];
      const catItems = quote.items.filter(i => i.categoryId === cat.id && i.selected);

      return (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 animate-in fade-in duration-300 bg-white text-[#1e293b]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#7b68ee]/10 text-[#7b68ee]">
                {cat.badge}
              </span>
              <span className="text-xs font-bold text-slate-500">Strategische Fase</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold text-slate-800 font-['Space_Grotesk',sans-serif]">
              {cleanCategoryName(cat.name)}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
            {/* Left: Value Proposition & ROI */}
            <div className="lg:col-span-6 bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-slate-800" />
                <h3 className="text-base font-semibold text-slate-800">Meerwaarde voor uw onderneming</h3>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {cat.valueProposition.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-xs font-semibold text-slate-800 block">Belangrijkste resultaten:</span>
                {cat.valueProposition.businessImpacts.map((impact, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#1e293b]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{impact}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-md bg-white border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Studio Graaf Focus: </span>
                <span className="font-semibold text-slate-800">{cat.valueProposition.roiFocus}</span>
              </div>
            </div>

            {/* Right: Selected Scope & Deliverables */}
            <div className="lg:col-span-6 bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-slate-800" />
                  Inbegrepen Diensten ({catItems.length})
                </h3>

                <div className="space-y-3">
                  {catItems.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-md bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{item.shortDescription}</p>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-800 shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {item.quantity} {item.unit}
                        </span>
                      </div>

                      {item.detailedScope && item.detailedScope.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1">
                          {item.detailedScope.filter(Boolean).map((sc, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                              <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                              <span>{sc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium mt-4 text-right">
                Studio Graaf Kwaliteitsgarantie & Full Support
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
            <span>Onderdeel van het projectvoorstel voor {quote.client.companyName}</span>
            <span>Pagina {currentSlideIndex + 1} / {totalSlides}</span>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // SLIDE: INVESTERINGSOVERZICHT
    // ----------------------------------------------------
    if (currentSlideIndex === 2 + activeCategories.length) {
      return (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 animate-in fade-in duration-300 bg-white text-[#1e293b]">
          <div>
            <span className="text-xs font-semibold text-slate-800 block mb-1">
              Transparante Investering
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold text-slate-800 font-['Space_Grotesk',sans-serif]">
              Overzicht van de Investering
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
            {/* One-off Investment Card */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-md border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-xs">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#7b68ee]" />
              
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-2">
                  Eenmalige Projectinvestering
                </span>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-semibold text-slate-800 font-mono">
                    € {(Number(finalOneOff) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">excl. BTW</span>
                </div>

                <div className="text-xs text-slate-500 space-y-1 mb-6">
                  {(quote.overallDiscountValue || 0) > 0 && (
                    <p className="text-emerald-700 font-bold">
                      Inclusief {quote.overallDiscountValue}% projectkorting (-€ {(Number(discountAmount) || 0).toFixed(2)})
                    </p>
                  )}
                  <p>BTW ({quote.vatRate || 21}%): € {(Number(vatAmount) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
                  <p className="text-slate-800 font-semibold">Totaal incl. BTW: € {(Number(totalInclVat) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-800 block mb-1">Betalingsvoorwaarden:</span>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {quote.paymentTerms}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Geen verborgen meerkosten. Vaste prijsgarantie.</span>
              </div>
            </div>

            {/* Monthly Retainer Card */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-md border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-xs">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-\[#7b68ee\]" />

              <div>
                <span className="text-xs font-semibold text-slate-800 block mb-2">
                  Doorlopend Onderhoud & Hosting (SLA)
                </span>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-semibold text-slate-800 font-mono">
                    € {(Number(monthlySubtotal) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">/ maand excl.</span>
                </div>

                <p className="text-xs text-slate-500 mb-6 font-medium">
                  Zorgeloze werking, continue updates en prioriteit-ondersteuning.
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-[#1e293b]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">Dedicated Cloud Hosting & 99.9% Uptime garantie</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1e293b]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">Wekelijkse beveiligingspatches & back-ups</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1e293b]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">Directe helpdesk support & kwartaal monitoring</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-md bg-white border border-slate-200 text-xs text-slate-500 font-medium shadow-xs">
                Maandelijks opzegbaar na initiële contracttermijn.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
            <span>Studio Graaf Investeringssamenvatting</span>
            <span>Pagina {currentSlideIndex + 1} / {totalSlides}</span>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // SLIDE: TIJDLIJN & FASERING
    // ----------------------------------------------------
    if (currentSlideIndex === 2 + activeCategories.length + 1) {
      return (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 animate-in fade-in duration-300 bg-white text-[#1e293b]">
          <div>
            <span className="text-xs font-semibold text-slate-800 block mb-1">
              Realisatie Tijdlijn
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold text-slate-800 font-['Space_Grotesk',sans-serif]">
              Gefaseerde Aanpak & Oplevering
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-auto">
            {quote.timelinePhases.map((phase) => (
              <div key={phase.id} className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center font-semibold text-xs">
                      {phase.phaseNumber}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {phase.duration}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800 mb-2">{phase.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">{phase.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-800 block">Oplevering:</span>
                  {phase.deliverables.map((deliv, i) => (
                    <div key={i} className="text-[11px] text-[#1e293b] flex items-center gap-1 font-medium">
                      <span className="text-slate-800 font-semibold">✓</span>
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
            <span>Volledige projectbegeleiding van start tot oplevering</span>
            <span>Pagina {currentSlideIndex + 1} / {totalSlides}</span>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // SLIDE: AFSLUITING & AKKOORD
    // ----------------------------------------------------
    return (
      <div className="h-full flex flex-col justify-between p-8 sm:p-14 text-center items-center my-auto animate-in fade-in duration-300 bg-white text-[#1e293b]">
        <BrandLogo size="xl" theme="light" />

        <div className="max-w-2xl space-y-4 my-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7b68ee]/10 text-[#7b68ee] text-xs font-semibold">
            Klaar voor de volgende stap
          </span>

          <h2 className="text-3xl sm:text-5xl font-semibold text-slate-800 font-['Space_Grotesk',sans-serif]">
            Laten we samen bouwen aan uw succes!
          </h2>

          <p className="text-base text-slate-500 leading-relaxed font-medium">
            Heeft u nog vragen over het voorstel voor <strong className="text-slate-800">{quote.client.companyName}</strong>? Wij starten graag binnenkort met de kick-off sessie.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleExportPptx}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-xs bg-white hover:bg-slate-50 text-[#7b68ee] border border-[#7b68ee] shadow-xs transition-all cursor-pointer"
            >
              <Presentation className="w-4 h-4" />
              <span>{isExporting ? 'PowerPoint downloaden...' : 'Download PowerPoint (.pptx)'}</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-xs bg-[#7b68ee] hover:bg-[#6a5ad6] text-white shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sluit Presentatiemodus</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Studio Graaf VOF • www.studio-graaf.be • {quote.salesRepresentative.email}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex flex-col text-[#1e293b] select-none">
      
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#7b68ee]/10 text-[#7b68ee] text-xs font-semibold">
            <Presentation className="w-4 h-4 text-[#7b68ee]" />
            <span>Presentatiemodus (Live Pitch Deck)</span>
          </div>
          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
            {quote.client.companyName} • {quote.projectName}
          </span>
        </div>

        {/* Slide Counter & Controls */}
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono font-semibold text-slate-600 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200">
            Slide {currentSlideIndex + 1} / {totalSlides}
          </div>

          <button
            onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-md bg-slate-50 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 text-slate-600 transition-colors cursor-pointer"
            title="Vorige slide (Pijl links)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1))}
            disabled={currentSlideIndex === totalSlides - 1}
            className="p-2 rounded-md bg-slate-50 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 text-slate-600 transition-colors cursor-pointer"
            title="Volgende slide (Pijl rechts / Spatie)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportPptx}
            disabled={isExporting}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-[#7b68ee] border border-[#7b68ee] shadow-xs cursor-pointer"
            title="Exporteer naar Microsoft PowerPoint"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Laden...' : 'Export .pptx'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 ml-2 transition-colors cursor-pointer"
            title="Sluit presentatiemodus (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl aspect-[16/9] bg-white rounded-md border border-slate-200 shadow-lg overflow-hidden relative flex flex-col">
          {renderCurrentSlide()}
        </div>
      </div>

      {/* Bottom Thumbnail Navigator */}
      <div className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-center gap-2 overflow-x-auto">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              currentSlideIndex === idx
                ? 'w-8 bg-[#7b68ee]'
                : 'w-2.5 bg-slate-200 hover:bg-[#7C828D]'
            }`}
            title={`Ga naar slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
};
