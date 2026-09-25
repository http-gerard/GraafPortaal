import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  Download, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Building2, 
  Mail, 
  Phone, 
  PenTool, 
  Eye, 
  Lock,
  ChevronDown,
  Layers,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuoteData, DigitalSignature } from '../types';
import { generatePdfDocument } from '../services/pdfService';
import { sendTelemetryEvent, detectDeviceInfo } from '../services/telemetryService';

interface ClientQuotePortalProps {
  quote: QuoteData;
  onClose?: () => void;
  onQuoteSigned?: (signature: DigitalSignature) => void;
}

export const ClientQuotePortal: React.FC<ClientQuotePortalProps> = ({
  quote,
  onClose,
  onQuoteSigned
}) => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [signerName, setSignerName] = useState(quote.client.contactPerson || '');
  const [signerTitle, setSignerTitle] = useState(quote.client.jobTitle || 'Zaakvoerder');
  const [signerEmail, setSignerEmail] = useState(quote.client.email || '');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSigned, setIsSigned] = useState(!!quote.digitalSignature || quote.status === 'akkoord');

  // Sync state if quote prop changes (e.g. after fetch completes)
  useEffect(() => {
    setIsSigned(!!quote.digitalSignature || quote.status === 'akkoord');
    setSignerName(quote.client.contactPerson || '');
    setSignerTitle(quote.client.jobTitle || 'Zaakvoerder');
    setSignerEmail(quote.client.email || '');
  }, [quote]);
  const [isSubmittingSignature, setIsSubmittingSignature] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Time & section tracking refs
  const currentSectionRef = useRef<string>('intro');
  const sectionStartTimeRef = useRef<number>(Date.now());
  const deviceInfoRef = useRef<string>(detectDeviceInfo());
  const hasStartedSessionRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>(`sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);

  // 1. Initial Session Start Event (Strictly once per mount/session)
  useEffect(() => {
    const devInfo = deviceInfoRef.current;
    const clientLoc = `${quote.client.city || 'Vlaanderen'}, België`;
    const sessId = sessionIdRef.current;

    if (!hasStartedSessionRef.current) {
      hasStartedSessionRef.current = true;
      sendTelemetryEvent({
        quoteId: quote.id,
        eventType: 'session_start',
        deviceInfo: devInfo,
        location: clientLoc,
        sessionId: sessId,
        actionDescription: `Offerte geopend door ${quote.client.contactPerson || 'klant'}`,
        details: `Project: ${quote.projectName} • Start leessessie`
      });
    }

    // 2. Heartbeat tracking every 10 seconds
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const secId = currentSectionRef.current;
        sendTelemetryEvent({
          quoteId: quote.id,
          eventType: 'heartbeat',
          sectionId: secId,
          durationSeconds: 10,
          deviceInfo: devInfo,
          location: clientLoc,
          sessionId: sessId
        });
      }
    }, 10000);

    return () => {
      clearInterval(heartbeatInterval);
      // Flush remaining section time on unmount if meaningful
      const elapsed = (Date.now() - sectionStartTimeRef.current) / 1000;
      if (elapsed > 5) {
        sendTelemetryEvent({
          quoteId: quote.id,
          eventType: 'section_view',
          sectionId: currentSectionRef.current,
          durationSeconds: elapsed,
          deviceInfo: devInfo,
          location: clientLoc,
          sessionId: sessId
        });
      }
    };
  }, [quote.id]);

  // 3. Intersection Observer to detect active section in viewport
  useEffect(() => {
    const sections = [
      { id: 'section-intro', key: 'intro' },
      { id: 'section-value', key: 'value' },
      { id: 'section-scope', key: 'scope' },
      { id: 'section-pricing', key: 'pricing' },
      { id: 'section-timeline', key: 'timeline' },
      { id: 'section-signature', key: 'signature' }
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            const matched = sections.find((s) => s.id === entry.target.id);
            if (matched && matched.key !== currentSectionRef.current) {
              const oldSec = currentSectionRef.current;
              const duration = (Date.now() - sectionStartTimeRef.current) / 1000;

              // Send event for previous section
              if (duration > 3) {
                sendTelemetryEvent({
                  quoteId: quote.id,
                  eventType: 'section_view',
                  sectionId: oldSec,
                  durationSeconds: duration,
                  deviceInfo: deviceInfoRef.current,
                  location: `${quote.client.city || 'Vlaanderen'}, België`
                });
              }

              // Update active section
              currentSectionRef.current = matched.key;
              sectionStartTimeRef.current = Date.now();
              setActiveSection(matched.key);
            }
          }
        });
      },
      { threshold: [0.3, 0.6] }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [quote.id]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = 'slate-900';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Calculations
  const selectedItems = quote.items.filter((i) => i.selected);
  const oneOffItems = selectedItems.filter((i) => i.billingType === 'one_off');
  const monthlyItems = selectedItems.filter((i) => i.billingType === 'monthly');
  const yearlyItems = selectedItems.filter((i) => i.billingType === 'yearly');

  const subtotalOneOff = oneOffItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discountOneOff = quote.overallDiscountType === 'percentage' 
    ? subtotalOneOff * (quote.overallDiscountValue / 100)
    : Math.min(subtotalOneOff, quote.overallDiscountValue);
  const totalOneOffExclVat = Math.max(0, subtotalOneOff - discountOneOff);
  const vatAmountOneOff = totalOneOffExclVat * (quote.vatRate / 100);
  const totalOneOffInclVat = totalOneOffExclVat + vatAmountOneOff;

  const totalMonthlyExclVat = monthlyItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalYearlyExclVat = yearlyItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      sendTelemetryEvent({
        quoteId: quote.id,
        eventType: 'pdf_download',
        deviceInfo: deviceInfoRef.current,
        location: `${quote.client.city || 'Vlaanderen'}, België`
      });
      await generatePdfDocument(quote);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleConfirmSignature = async () => {
    if (!signerName || !signerEmail || !termsAccepted) return;
    setIsSubmittingSignature(true);

    let sigImage = '';
    if (canvasRef.current && hasDrawn) {
      sigImage = canvasRef.current.toDataURL('image/png');
    }

    const signature: DigitalSignature = {
      signedBy: signerName,
      jobTitle: signerTitle,
      email: signerEmail,
      signedAt: new Date().toISOString(),
      signatureImage: sigImage,
      termsAccepted: true,
      confirmationSentToClient: true,
      confirmationSentToStudioGraaf: true
    };

    // Optimistically update the quote object so the PDF generator has it immediately
    quote.digitalSignature = signature;
    quote.status = 'akkoord';

    // Send telemetry event
    await sendTelemetryEvent({
      quoteId: quote.id,
      eventType: 'quote_signed',
      deviceInfo: deviceInfoRef.current,
      location: `${quote.client.city || 'Vlaanderen'}, België`,
      actionDescription: `Offerte definitief ondertekend door ${signerName}`,
      details: `Bedrag: €${totalOneOffExclVat.toLocaleString('nl-BE')} excl. BTW • Bevestiging verzonden`
    });

    // Notify backend
    fetch('/api/signature/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        projectName: quote.projectName,
        clientName: signerName,
        clientEmail: signerEmail,
        signatureData: signature
      })
    }).catch(console.error);

    // Trigger confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    setIsSigned(true);
    setIsSigningOpen(false);
    setIsSubmittingSignature(false);

    if (onQuoteSigned) {
      onQuoteSigned(signature);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-[#7b68ee] selection:text-white">
      
      {/* Top Banner (Studio Graaf Live Portal Bar) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Terug naar Editor</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Studio Graaf" className="h-6 object-contain" />
          </div>
        </div>

        

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExportingPdf ? 'Laden...' : 'Download PDF'}</span>
          </button>

          {!isSigned ? (
            <button
              onClick={() => {
                sendTelemetryEvent({
                  quoteId: quote.id,
                  eventType: 'sign_started',
                  deviceInfo: deviceInfoRef.current,
                  location: `${quote.client.city || 'Vlaanderen'}, België`
                });
                setIsSigningOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#7b68ee] hover:bg-[#6a5ad6] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Akkoord & Ondertekenen</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Digitaal Goedgekeurd</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-10 flex-1">

        {/* Section: Hero & Header */}
        <section id="section-intro" className="bg-white border border-slate-200 rounded-md p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Offertevoorstel • {quote.quoteNumber}
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                {quote.projectName}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {quote.projectSummary}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 block">Totale Investering</span>
              <span className="text-2xl font-semibold text-slate-900 font-mono block mt-0.5">
                €{totalOneOffExclVat.toLocaleString('nl-BE')}
              </span>
              <span className="text-[10px] text-slate-500 block">excl. {quote.vatRate}% BTW</span>
            </div>
          </div>

          {/* Client & Studio Graaf Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 block">Opgesteld voor:</span>
              <span className="font-semibold text-slate-900 text-sm block">{quote.client.companyName}</span>
              <p className="text-slate-500">
                T.a.v. {quote.client.contactPerson} ({quote.client.jobTitle})<br />
                {quote.client.email} • {quote.client.vatNumber}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 block">Uitvoerend Bureau:</span>
              <span className="font-semibold text-slate-900 text-sm block">Studio Graaf CommV</span>
              <p className="text-slate-500">
                Contactpersoon: Warre Geerts (Co-Founder)<br />
                warre@studio-graaf.be • BE 0804.819.531
              </p>
            </div>
          </div>

          {/* Introduction Letter */}
          {quote.customIntroMessage && (
            <div className="p-5 rounded-lg bg-slate-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-[#7b68ee] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Persoonlijk Woord van Studio Graaf</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {quote.customIntroMessage}
              </p>
            </div>
          )}
        </section>

        {/* Section: Strategic Value & Approach */}
        <section id="section-value" className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center font-semibold text-xs">
              01
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Strategische Meerwaarde & Aanpak
              </h2>
              <p className="text-xs text-slate-500">
                Waarom Studio Graaf de juiste partner is voor {quote.client.companyName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 block">⚡️ Snelheid & Maatwerk</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Geen logge standaard templates, maar ultrasnelle, doelgerichte digitale tools op maat van jouw sector.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 block">🎯 Conversie & Impact</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Elk ontwerpelement is strategisch ontworpen om bezoekers direct om te zetten in trouwe klanten en leads.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 block">🤝 Eerlijk & Transparant</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Duidelijke vaste prijzen, transparante communicatie en continue ondersteuning na oplevering.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Scope & Deliverables */}
        <section id="section-scope" className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center font-semibold text-xs">
              02
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Geselecteerde Diensten & Deliverables
              </h2>
              <p className="text-xs text-slate-500">
                Gedetailleerd overzicht van de inbegrepen werkzaamheden
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm block">{item.name}</span>
                    <span className="text-slate-500 block mt-0.5">{item.shortDescription}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 text-sm shrink-0">
                    €{(item.price * item.quantity).toLocaleString('nl-BE')}
                  </span>
                </div>

                {item.detailedScope && item.detailedScope.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Inbegrepen in deze scope:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {item.detailedScope.map((scope, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[#1e293b]">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{scope}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section: Investment & Pricing Table */}
        <section id="section-pricing" className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center font-semibold text-xs">
                03
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Investeringsoverzicht
                </h2>
                <p className="text-xs text-slate-500">
                  Heldere prijsberekening conform afspraken
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Subtotaal Eenmalig (excl. BTW):</span>
              <span className="font-mono font-bold text-slate-900">€{subtotalOneOff.toLocaleString('nl-BE')}</span>
            </div>

            {discountOneOff > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span>Pakketkorting ({quote.overallDiscountValue}%):</span>
                <span className="font-mono">-€{discountOneOff.toLocaleString('nl-BE')}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-500">
              <span>BTW ({quote.vatRate}%):</span>
              <span className="font-mono font-bold text-slate-900">€{vatAmountOneOff.toLocaleString('nl-BE')}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base font-semibold text-slate-900">
              <span>Totaal Eenmalig (incl. BTW):</span>
              <span className="font-mono text-lg text-slate-900">€{totalOneOffInclVat.toLocaleString('nl-BE')}</span>
            </div>

            {totalMonthlyExclVat > 0 && (
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-indigo-700 font-bold">
                <span>Maandelijks Terugkerend (excl. BTW):</span>
                <span className="font-mono font-semibold">€{totalMonthlyExclVat.toLocaleString('nl-BE')} / maand</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            * {quote.paymentTerms}
          </p>
        </section>

        {/* Section: Timeline & Milestones */}
        <section id="section-timeline" className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center font-semibold text-xs">
              04
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Projectplanning & Fasering
              </h2>
              <p className="text-xs text-slate-500">
                Gestructureerde doorloop in 4 duidelijke stappen
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quote.timelinePhases.map((phase) => (
              <div key={phase.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Fase {phase.phaseNumber}: {phase.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {phase.duration}
                  </span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Digital Acceptance & Signature */}
        <section id="section-signature" className="bg-slate-900 text-white rounded-md p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7b68ee]" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Digitaal Akkoord & Bevestiging
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Ga direct akkoord met dit voorstel om de planning en opstart te reserveren.
              </p>
            </div>

            {isSigned ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <Check className="w-4 h-4" />
                <span>Goedgekeurd door {signerName}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  sendTelemetryEvent({
                    quoteId: quote.id,
                    eventType: 'sign_started',
                    deviceInfo: deviceInfoRef.current,
                    location: `${quote.client.city || 'Vlaanderen'}, België`
                  });
                  setIsSigningOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#7b68ee] hover:bg-[#6a5ad6] text-white text-xs font-semibold shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>Offerte Nu Digitaal Ondertekenen</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between gap-2">
            <span>Geldig tot {quote.validUntil} • Studio Graaf Algemene Voorwaarden van toepassing</span>
            <span>Beveiligde SSL-verbinding & timestamp verificatie</span>
          </div>
        </section>

      </div>

      {/* Signature Modal */}
      {isSigningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-md w-full max-w-lg shadow-lg overflow-hidden text-xs">
            
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#7b68ee]" />
                <h3 className="text-sm font-semibold text-white">Digitaal Ondertekenen</h3>
              </div>
              <button
                onClick={() => setIsSigningOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500">Naam Ondertekenaar *</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 bg-slate-50 font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500">Functie</label>
                  <input
                    type="text"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 bg-slate-50 font-bold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500">E-mailadres *</label>
                  <input
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 bg-slate-50 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Handtekening Tekenen */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                  <span>Plaats hier je handtekening (optioneel):</span>
                  {hasDrawn && (
                    <button onClick={clearCanvas} className="text-rose-600 hover:underline cursor-pointer">
                      Wissen
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[120px] bg-white cursor-crosshair touch-none"
                  />
                </div>
              </div>

              {/* Voorwaarden checkbox */}
              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-[#7b68ee] focus:ring-0"
                />
                <span className="text-[11px] text-slate-500 leading-snug">
                  Ik verklaar bevoegd te zijn om namens <strong>{quote.client.companyName}</strong> akkoord te gaan met dit offertevoorstel en de betalingsvoorwaarden van Studio Graaf.
                </span>
              </label>

              {/* Submit button */}
              <button
                onClick={handleConfirmSignature}
                disabled={!signerName || !signerEmail || !termsAccepted || isSubmittingSignature}
                className="w-full py-3 rounded-lg bg-[#7b68ee] hover:bg-[#6a5ad6] text-white font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSubmittingSignature ? 'Verwerken...' : 'Offerte Definitief Bevestigen'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Studio Graaf CommV • Herselt, België • BTW BE 0804.819.531 • warre@studio-graaf.be</p>
      </footer>

    </div>
  );
};
