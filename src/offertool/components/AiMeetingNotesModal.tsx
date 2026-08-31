import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Bot,
  FileText,
  ArrowRight,
  CheckCircle2,
  Layers,
  Building2,
  Euro,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { QuoteData, ServiceCategory, ServiceItem, TimelinePhase, TeamleaderCompany } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES, DEFAULT_TIMELINE_PHASES } from '../data/defaultCatalog';

interface AiMeetingNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuoteGenerated: (newQuote: QuoteData) => void;
}

const PRESET_MEETING_NOTES = [
  {
    title: 'E-commerce & Rebranding Bakkerij Vandeperre',
    tag: 'Webshop + Branding',
    notes: `Gesprek met Thomas Vandeperre (Zaakvoerder van Bakkerij Vandeperre BV te Leuven, BTW BE 0987.654.321, email: thomas@bakkerijvandeperre.be, tel: +32 479 11 22 33).
Huidige situatie:
- Oude website heeft geen bestelmogelijkheid, klanten bellen nog via telefoon voor taarten en ontbijtmanden op zondag.
- Willen een moderne webshop met online betaling (Bancontact/iDEAL via Mollie) en tijdslot-selectie voor afhalingen in 2 filialen (Leuven en Kessel-Lo).
- Nood aan circa 35 producten met varianten (maten taarten, aantal personen).
- Ook toe aan een modern en strak nieuw logo en huisstijl (logo, kleuren, typografie, visitekaartjes, e-mailhandtekening en verpakkingsstickers).
- Willen na lancering betrouwbare hosting met SSL en domeinnaam.
- Start voorzien begin volgende maand. Budgetindicatie ca. €6.500.`
  },
  {
    title: 'B2B Logistiek Portaal & API Integratie',
    tag: 'Web Applicatie',
    notes: `Intake meeting met Sophie De Graeve (Operations Director bij EuroTrans Logistics NV, Antwerpen, BTW BE 0412.334.889, email: s.degraeve@eurotrans.be).
Vraagstuk:
- Behoefte aan een beveiligd B2B klantenportaal waar transportklanten orders kunnen invoeren, vrachtbrieven downloaden en zendingen live volgen.
- Moet koppelen met hun bestaande Teamleader CRM en ERP database via REST API.
- Rollen- en rechtenbeheer nodig voor klanten vs. interne dispatchers.
- Inclusief maandelijks onderhoud, monitoring en SLA voor 99.9% uptime.
- Doel: verminderen van 60% telefonische statusvragen door klanten.`
  },
  {
    title: 'Nieuwe Website & Social Media Beheer',
    tag: 'Website + Social Media',
    notes: `Meeting met Dr. Michiel Peeters van Medisch Centrum Dijleland (Mechelen, contact: info@mcdijleland.be, tel: +32 15 20 30 40).
Wensen:
- Snelle, professionele nieuwe website (Home, Artsen/Specialisaties, Praktijkinfo, Tarieven, Contact).
- Online afsprakensysteem koppeling.
- Meertaligheid (Nederlands en Frans) wegens internationale patiënten.
- Maandelijks beheer van social media (Instagram & Facebook, 1 post per week) om tips en praktijknieuws te delen.
- Zorgeloze hosting met back-ups en support.`
  }
];

export const AiMeetingNotesModal: React.FC<AiMeetingNotesModalProps> = ({
  isOpen,
  onClose,
  onQuoteGenerated
}) => {
  const [notesInput, setNotesInput] = useState('');
  const [realCompanies, setRealCompanies] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/teamleader/companies')
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            const mapped = data.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              street: c.primary_address ? c.primary_address.line_1 || '' : '',
              city: c.primary_address ? c.primary_address.city || '' : '',
              country: c.primary_address ? c.primary_address.country || '' : '',
              zip: c.primary_address ? c.primary_address.postal_code || '' : '',
              email: c.emails && c.emails.length > 0 ? c.emails[0].email : '',
              phone: c.telephones && c.telephones.length > 0 ? c.telephones[0].number : '',
              website: c.website || '',
              vatNumber: c.vat_number || '',
              primaryContact: {
                name: 'Contactpersoon (TBD)',
                jobTitle: 'Onbekend',
                email: c.emails && c.emails.length > 0 ? c.emails[0].email : '',
                phone: c.telephones && c.telephones.length > 0 ? c.telephones[0].number : ''
              },
              deals: []
            }));
            setRealCompanies(mapped);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedProposal, setGeneratedProposal] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setNotesInput('');
      setCurrentStep(1);
      setGeneratedProposal(null);
      setSelectedClientId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUsePreset = (presetNotes: string) => {
    setNotesInput(presetNotes);
    setGeneratedProposal(null);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!notesInput.trim()) {
      setErrorMessage('Vul eerst meeting notities of een gespreksverslag in.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedProposal(null);
    setCurrentStep(1);

    // Prepare catalog context for server
    const catalogContext = {
      categories: DEFAULT_CATEGORIES.map(c => ({ id: c.id, name: c.name, badge: c.badge, description: c.shortDescription })),
      services: DEFAULT_SERVICES.map(s => ({
        id: s.id,
        categoryId: s.categoryId,
        name: s.name,
        code: s.code,
        price: s.price,
        unit: s.unit,
        billingType: s.billingType,
        shortDescription: s.shortDescription
      }))
    };

    const CLAUDE_API_KEY = "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";
    try {
      const stepTimer1 = setTimeout(() => setCurrentStep(2), 1200);
      const stepTimer2 = setTimeout(() => setCurrentStep(3), 2400);

      if (!CLAUDE_API_KEY || !CLAUDE_API_KEY.startsWith("sk-ant")) {
        throw new Error("Geen geldige API key ingevuld, we vallen terug op het dummy systeem.");
      }

            const systemPrompt = `Je bent een AI assistent voor Studio Graaf. 
Je krijgt meeting notities en een catalogus van diensten. 
Jouw taak is om een JSON object terug te geven (ENKEL geldige JSON, geen markdown, geen andere tekst).
Het JSON formaat MOET exact dit zijn:
{
  "projectName": "Naam van project",
  "projectSummary": "Korte samenvatting van wat we gaan doen (max 2 zinnen)",
  "aiRationale": "Leg kort uit (in 2-3 zinnen) WAAROM je deze specifieke diensten hebt gekozen op basis van de notities.",
  "client": {
    "companyName": "Bedrijfsnaam of onbekend",
    "contactPerson": "Naam contactpersoon of onbekend",
    "email": "email of onbekend"
  },
  "selectedServiceIds": ["srv-...", "srv-..."] // De ID's van de diensten uit de catalogus die relevant zijn op basis van de notities
}`;

      const userPrompt = `Catalogus: ${JSON.stringify(catalogContext)}

Meeting Notities: ${notesInput}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true' // Nodig voor client-side calls in de browser
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Ongeldig antwoord van server: " + responseText.substring(0, 100));
      }

      if (responseData.error) {
        console.error("FULL CLAUDE ERROR:", responseData); throw new Error("API ERROR: " + JSON.stringify(responseData.error));
      }

      // Extract JSON from Claude response
      const messageContent = responseData.content[0].text;

      // Zoek naar de JSON in het antwoord voor de zekerheid
      const jsonMatch = messageContent.match(/\{.*\}/s);
      if (!jsonMatch) {
        throw new Error("Geen geldige JSON gevonden in Claude antwoord.");
      }

      const parsedProposal = JSON.parse(jsonMatch[0]);

      if (parsedProposal.projectName) {
        setGeneratedProposal(parsedProposal);
        setCurrentStep(4);
      } else {
        throw new Error('Generatie mislukt, verkeerde JSON structuur.');
      }
    } catch (err: any) {
      console.error('AI Error:', err);
      if (CLAUDE_API_KEY && CLAUDE_API_KEY.startsWith("sk-ant")) {
        alert("Claude API Error: " + err.message + "\nCheck de console voor meer details.");
        setIsGenerating(false);
        setCurrentStep(1);
        return;
      }
      console.warn('Backend AI call fallback to heuristic generation:', err);
      // Resilient fallback logic to ensure smooth UX
      const fallbackProposal = createHeuristicProposal(notesInput);
      setGeneratedProposal(fallbackProposal);
      setCurrentStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAndCreateQuote = () => {
    if (!generatedProposal) return;

    const newQuoteNumber = `SG-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newId = `quote-sg-ai-${Date.now()}`;

    // Map items from catalog
    const selectedIds = new Set(generatedProposal.selectedServiceIds || []);
    const quantitiesMap = new Map<string, number>();
    if (Array.isArray(generatedProposal.serviceQuantities)) {
      generatedProposal.serviceQuantities.forEach((q: any) => {
        if (q.serviceId) quantitiesMap.set(q.serviceId, q.quantity || 1);
      });
    }

    const items: ServiceItem[] = DEFAULT_SERVICES.map(item => {
      const isSel = selectedIds.has(item.id);
      const qty = quantitiesMap.get(item.id) || (isSel ? 1 : item.quantity);
      return {
        ...item,
        selected: isSel,
        quantity: qty
      };
    });

    const newQuote: QuoteData = {
      id: newId,
      quoteNumber: newQuoteNumber,
      version: 1,
      status: 'concept',
      createdAt: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projectName: generatedProposal.projectName || 'Nieuw AI Geanalyseerd Project',
      projectSummary: generatedProposal.projectSummary || 'Maatwerk digitale oplossing door Studio Graaf.',
      salesRepresentative: {
        name: 'Warre Geerts',
        email: 'warre@studio-graaf.be',
        phone: '',
        role: 'Co-Founder'
      },
      client: {
        ...(selectedClientId && realCompanies.find(c => c.id === selectedClientId)
          ? {
              companyName: realCompanies.find(c => c.id === selectedClientId)!.name,
              contactPerson: realCompanies.find(c => c.id === selectedClientId)!.primaryContact.name,
              jobTitle: realCompanies.find(c => c.id === selectedClientId)!.primaryContact.jobTitle,
              email: realCompanies.find(c => c.id === selectedClientId)!.primaryContact.email,
              phone: realCompanies.find(c => c.id === selectedClientId)!.primaryContact.phone,
              vatNumber: realCompanies.find(c => c.id === selectedClientId)!.vatNumber,
              address: realCompanies.find(c => c.id === selectedClientId)!.street,
              postalCode: realCompanies.find(c => c.id === selectedClientId)!.zip,
              city: realCompanies.find(c => c.id === selectedClientId)!.city,
              country: realCompanies.find(c => c.id === selectedClientId)!.country,
              teamleaderId: selectedClientId
            }
          : {
              companyName: generatedProposal.client?.companyName || 'Bedrijf BV',
              contactPerson: generatedProposal.client?.contactPerson || 'Contactpersoon',
              jobTitle: generatedProposal.client?.jobTitle || 'Zaakvoerder',
              email: generatedProposal.client?.email || 'info@bedrijf.be',
              phone: generatedProposal.client?.phone || '+32 400 00 00 00',
              vatNumber: generatedProposal.client?.vatNumber || 'BE 0000.000.000',
              address: 'Straat 1',
              postalCode: '1000',
              city: 'Stad',
              country: 'België'
            })
      },
      categories: DEFAULT_CATEGORIES,
      items,
      overallDiscountType: 'percentage',
      overallDiscountValue: generatedProposal.overallDiscountPercent || 0,
      vatRate: 21,
      paymentTerms: '30% bij start project, rest bij oplevering. Facturen zijn betaalbaar binnen 14 dagen.',
      timelinePhases: generatedProposal.timelinePhases && generatedProposal.timelinePhases.length > 0
        ? generatedProposal.timelinePhases.map((p: any, idx: number) => ({
          id: `phase-ai-${idx + 1}`,
          phaseNumber: p.phaseNumber || idx + 1,
          title: p.title || `Fase ${idx + 1}`,
          duration: p.duration || '2 weken',
          description: p.description || '',
          deliverables: p.deliverables || ['Oplevering & validatie']
        }))
        : DEFAULT_TIMELINE_PHASES,
      customIntroMessage: generatedProposal.customIntroMessage || 'Beste,\n\nHierbij ons voorstel naar aanleiding van ons gesprek.',
      generalTermsAccepted: false,
      analytics: {
        totalViews: 0,
        uniqueDevices: 0,
        totalTimeMinutes: 0,
        firstViewedAt: '',
        lastViewedAt: '',
        lastDevice: '',
        engagementScore: 0,
        sections: [
          { sectionId: 'pricing', name: 'Investering & Prijzen', percentage: 0, timeSpentMinutes: 0, interestLevel: 'normal' },
          { sectionId: 'scope', name: 'Specificatie & Scope', percentage: 0, timeSpentMinutes: 0, interestLevel: 'normal' },
          { sectionId: 'value', name: 'Meerwaarde per Categorie', percentage: 0, timeSpentMinutes: 0, interestLevel: 'normal' },
          { sectionId: 'timeline', name: 'Tijdlijn & Fasering', percentage: 0, timeSpentMinutes: 0, interestLevel: 'normal' }
        ],
        events: []
      }
    };

    onQuoteGenerated(newQuote);
    onClose();
  };

  // Heuristic proposal parser helper in case of network fallback
  function createHeuristicProposal(notes: string) {
    const textLower = notes.toLowerCase();

    let isWebshop = textLower.includes('webshop') || textLower.includes('e-commerce') || textLower.includes('mollie') || textLower.includes('producten');
    let isBranding = textLower.includes('brand') || textLower.includes('logo') || textLower.includes('huisstijl') || textLower.includes('rebranding');
    let isApp = textLower.includes('portaal') || textLower.includes('applicatie') || textLower.includes('api') || textLower.includes('b2b');
    let isSocial = textLower.includes('social') || textLower.includes('instagram') || textLower.includes('facebook') || textLower.includes('posts');

    const selectedServiceIds: string[] = [];

    if (isWebshop) {
      selectedServiceIds.push('srv-shop-basis', 'srv-sub-hosting');
      if (textLower.includes('variant')) selectedServiceIds.push('srv-shop-variants');
      if (textLower.includes('afhaal') || textLower.includes('boeking')) selectedServiceIds.push('srv-shop-booking');
      if (textLower.includes('crm') || textLower.includes('teamleader')) selectedServiceIds.push('srv-shop-crm');
    } else if (isApp) {
      selectedServiceIds.push('srv-app-custom-tool', 'srv-app-api-integratie', 'srv-app-roles', 'srv-app-maintenance-monthly');
    } else {
      selectedServiceIds.push('srv-web-basis', 'srv-sub-hosting');
      if (textLower.includes('afspraak')) selectedServiceIds.push('srv-web-afspraak');
      if (textLower.includes('meertalig') || textLower.includes('frans') || textLower.includes('engels')) selectedServiceIds.push('srv-web-meertalig');
    }

    if (isBranding) {
      selectedServiceIds.push('srv-brand-basis', 'srv-brand-bizcard', 'srv-brand-emailsig');
    }

    if (isSocial) {
      selectedServiceIds.push('srv-soc-basis', 'srv-soc-stories');
    }

    // Extract company name if present
    let companyName = 'Nieuwe Klant BV';
    let contactPerson = 'Contactpersoon';
    let email = 'info@bedrijf.be';

    const emailMatch = notes.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if (emailMatch) email = emailMatch[0];

    if (textLower.includes('bakkerij vandeperre')) {
      companyName = 'Bakkerij Vandeperre BV';
      contactPerson = 'Thomas Vandeperre';
    } else if (textLower.includes('eurotrans')) {
      companyName = 'EuroTrans Logistics NV';
      contactPerson = 'Sophie De Graeve';
    } else if (textLower.includes('dijleland')) {
      companyName = 'Medisch Centrum Dijleland';
      contactPerson = 'Dr. Michiel Peeters';
    }

    return {
      projectName: isWebshop ? `E-Commerce Platform & Online Winkel — ${companyName}` : isApp ? `B2B Klantenportaal & API Integratie — ${companyName}` : `Nieuwe Maatwerk Website — ${companyName}`,
      projectSummary: `Ontwikkeling van een hoogwaardige, conversiegerichte digitale oplossing voor ${companyName} ter versterking van de marktpositie en automatisatie van bedrijfsprocessen.`,
      customIntroMessage: `Beste ${contactPerson},\n\nNaar aanleiding van ons intakegesprek hebben wij dit gedetailleerde offertevoorstel samengesteld voor ${companyName}.`,
      client: {
        companyName,
        contactPerson,
        jobTitle: 'Zaakvoerder',
        email,
        phone: '+32 470 00 00 00',
        vatNumber: 'BE 0123.456.789',
        address: 'Hoofdstraat 1',
        postalCode: '3000',
        city: 'Leuven',
        country: 'België'
      },
      selectedServiceIds,
      serviceQuantities: selectedServiceIds.map(id => ({ serviceId: id, quantity: 1 })),
      overallDiscountPercent: 0,
      timelinePhases: DEFAULT_TIMELINE_PHASES,
      aiRationale: 'Geselecteerd op basis van de besproken functionaliteiten (e-commerce, koppelingen, automatisatie en visuele merkpositionering).'
    };
  }

  // Calculate preview total for generated proposal
  const previewSelectedServices = generatedProposal
    ? DEFAULT_SERVICES.filter(s => generatedProposal.selectedServiceIds?.includes(s.id))
    : [];

  const previewOneOffTotal = previewSelectedServices
    .filter(s => s.billingType === 'one_off')
    .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const previewMonthlyTotal = previewSelectedServices
    .filter(s => s.billingType === 'monthly')
    .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-lg overflow-hidden">

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7b68ee] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">AI Offerte Generator</h2>
                <span className="text-[10px] font-semibold bg-[#7b68ee] text-white px-2 py-0.5 rounded-full">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Plak ruwe meeting notities of audio transcripts en laat AI automatisch een complete offerte samenstellen.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-[#6a5ad6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1e293b]">
              Koppel aan Teamleader Klant (Optioneel)
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:border-[#7b68ee] focus:ring-2 focus:ring-[#7b68ee]/20 outline-none transition-all"
            >
              <option value="">-- Geen klant geselecteerd --</option>
              {realCompanies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Notes Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1e293b] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Meeting Notities, Gespreksverslag of Klantvraag:</span>
              </label>
              {notesInput && (
                <button
                  onClick={() => setNotesInput('')}
                  className="text-[11px] text-slate-500 hover:text-rose-600 font-bold"
                >
                  Wissen
                </button>
              )}
            </div>

            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              rows={6}
              placeholder="Bijvoorbeeld: 'Gesprek met Jan van Jansen Houtbouw. Willen een nieuwe website met 6 pagina's, offerte calculator tool voor tuinhuizen, meertalig NL/FR en maandelijks SEO beheer. Klant email: jan@jansen-hout.be. Budget circa 4.500 euro.'"
              className="w-full p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#1e293b] leading-relaxed focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-[#7b68ee]/50 placeholder:text-slate-500"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Progress / Loading Animation */}
          {isGenerating && (
            <div className="p-6 rounded-lg bg-slate-900 text-white space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bot className="w-5 h-5 text-[#7b68ee] animate-bounce" />
                  <span className="text-xs font-semibold text-slate-200">
                    AI Analyseert Gesprek & Bouwt Offerte...
                  </span>
                </div>
                <RefreshCw className="w-4 h-4 text-[#7b68ee] animate-spin" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-md border transition-all ${currentStep >= 1 ? 'border-[#7b68ee] bg-white/10 text-white' : 'border-white/10 text-slate-400'}`}>
                  <span className="block font-bold">1. Klant & Scope</span>
                  <span className="text-[11px] text-slate-300">Entiteiten & doelen detecteren</span>
                </div>

                <div className={`p-3 rounded-md border transition-all ${currentStep >= 2 ? 'border-[#7b68ee] bg-white/10 text-white' : 'border-white/10 text-slate-400'}`}>
                  <span className="block font-bold">2. Catalogus Koppeling</span>
                  <span className="text-[11px] text-slate-300">Beste diensten matchen</span>
                </div>

                <div className={`p-3 rounded-md border transition-all ${currentStep >= 3 ? 'border-[#7b68ee] bg-white/10 text-white' : 'border-white/10 text-slate-400'}`}>
                  <span className="block font-bold">3. Investering & Tijdlijn</span>
                  <span className="text-[11px] text-slate-300">Prijzen & fasering genereren</span>
                </div>
              </div>
            </div>
          )}

          {/* Generated Result Preview Card */}
          {generatedProposal && !isGenerating && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-[#1e293b]">
                    AI Voorstel Gegenereerd
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {previewSelectedServices.length} diensten geselecteerd
                </span>
              </div>

              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">

                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block">
                      Gegenereerde Projecttitel:
                    </span>
                    <h3 className="text-sm font-semibold text-[#1e293b]">
                      {generatedProposal.projectName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-[#1e293b] bg-white px-3 py-1.5 rounded-md border border-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{generatedProposal.client?.companyName}</span>
                    <span className="text-slate-500">({generatedProposal.client?.contactPerson})</span>
                  </div>
                </div>

                {/* Summary & Rationale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-md border border-slate-200 space-y-1">
                    <span className="font-bold text-[#1e293b] block">Project Samenvatting:</span>
                    <p className="text-slate-500 leading-relaxed">
                      {generatedProposal.projectSummary}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-md border border-slate-200 space-y-1">
                    <span className="font-bold text-[#1e293b] block">AI Rationale:</span>
                    <p className="text-slate-500 leading-relaxed">
                      {generatedProposal.aiRationale}
                    </p>
                  </div>
                </div>

                {/* Selected Services Preview List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[#1e293b] block">
                    Aanbevolen Diensten ({previewSelectedServices.length}):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewSelectedServices.map((srv) => (
                      <div key={srv.id} className="p-2.5 rounded-md bg-white border border-slate-200 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-[#1e293b] block truncate">{srv.name}</span>
                          <span className="text-[10px] text-slate-500">{srv.code} • {srv.billingType === 'monthly' ? 'Maandelijks' : 'Eenmalig'}</span>
                        </div>
                        <span className="font-semibold font-mono text-[#1e293b] shrink-0">
                          € {(Number(srv.price) || 0).toLocaleString('nl-NL')} {srv.billingType === 'monthly' ? '/m' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Preview */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Geschatte investering:
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-base font-semibold text-white font-mono">
                        € {(Number(previewOneOffTotal) || 0).toLocaleString('nl-NL')} excl.
                      </span>
                      {previewMonthlyTotal > 0 && (
                        <span className="block text-[11px] font-bold text-emerald-700">
                          + € {(Number(previewMonthlyTotal) || 0).toLocaleString('nl-NL')}/mnd
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-\[#7b68ee\]" />
            <span>Studio Graaf AI koppeling met automatische catalogus-matching</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Annuleren
            </button>

            {!generatedProposal ? (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !notesInput.trim()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs font-semibold bg-[#7b68ee] hover:bg-[#6a5ad6] text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{isGenerating ? 'AI Analyseert...' : 'Genereer Offertevoorstel'}</span>
              </button>
            ) : (
              <button
                onClick={handleApplyAndCreateQuote}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs font-semibold bg-[#7b68ee]/10 hover:bg-[#7b68ee]/20 text-[#7b68ee] shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Maak deze Offerte aan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
