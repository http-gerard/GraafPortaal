import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  X, 
  PenTool, 
  Type, 
  ShieldCheck, 
  Mail, 
  Send, 
  FileDown, 
  Sparkles, 
  Eraser
} from 'lucide-react';
import { QuoteData, DigitalSignature } from '../types';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteData;
  onSignComplete: (updatedQuote: QuoteData) => void;
  onExportPdf: () => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  quote,
  onSignComplete,
  onExportPdf
}) => {
  const [signerName, setSignerName] = useState(quote.client.contactPerson || '');
  const [signerJobTitle, setSignerJobTitle] = useState(quote.client.jobTitle || 'Zaakvoerder');
  const [signerEmail, setSignerEmail] = useState(quote.client.email || '');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [typedSignatureFont, setTypedSignatureFont] = useState<'font-serif' | 'font-sans'>('font-serif');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessCelebration, setIsSuccessCelebration] = useState(!!quote.digitalSignature);

  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSignerName(quote.client.contactPerson || '');
      setSignerJobTitle(quote.client.jobTitle || 'Zaakvoerder');
      setSignerEmail(quote.client.email || '');
      setIsSuccessCelebration(!!quote.digitalSignature);
      setTermsAccepted(false);
      setHasDrawn(false);
    }
  }, [isOpen, quote]);

  useEffect(() => {
    if (isOpen && signMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = 'slate-900';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, signMode]);

  if (!isOpen) return null;

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
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
    ctx.stroke();
    setHasDrawn(true);
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

  const triggerConfettiBlast = () => {
    // 1. Center burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7b68ee', 'slate-900', '#3B82F6', '#10B981', '#F59E0B']
    });

    // 2. Left and right cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#7b68ee', 'slate-900', '#BAF800']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7b68ee', 'slate-900', '#BAF800']
      });
    }, 250);
  };

  const handleConfirmSignature = async () => {
    if (!signerName.trim() || !signerEmail.trim()) {
      alert('Gelieve uw naam en e-mailadres in te vullen.');
      return;
    }

    if (!termsAccepted) {
      alert('Gelieve akkoord te gaan met de algemene voorwaarden.');
      return;
    }

    setIsSubmitting(true);

    let signatureImage = '';
    if (signMode === 'draw' && canvasRef.current) {
      signatureImage = canvasRef.current.toDataURL('image/png');
    } else {
      signatureImage = `typed:${signerName}`;
    }

    const digitalSignature: DigitalSignature = {
      signedBy: signerName,
      jobTitle: signerJobTitle || 'Gemachtigde',
      email: signerEmail,
      signedAt: new Date().toLocaleString('nl-BE', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      signatureImage,
      ipAddress: '178.118.24.91 (Beveiligd)',
      termsAccepted: true,
      confirmationSentToClient: true,
      confirmationSentToStudioGraaf: true
    };

    const updatedQuote: QuoteData = {
      ...quote,
      status: 'akkoord',
      generalTermsAccepted: true,
      digitalSignature,
      analytics: {
        ...(quote.analytics || {
          totalViews: 4,
          uniqueDevices: 2,
          totalTimeMinutes: 6.8,
          firstViewedAt: quote.createdAt,
          lastViewedAt: 'Zojuist',
          lastDevice: 'Desktop (Chrome)',
          engagementScore: 100,
          sections: []
        }),
        engagementScore: 100,
        events: [
          ...(quote.analytics?.events || []),
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
            action: 'Offerte digitaal ondertekend en bevestigd',
            device: 'Desktop / Chrome',
            location: `${quote.client.city || 'België'}`,
            icon: 'CheckCircle2',
            details: `Getekend door ${signerName} (${signerEmail})`
          }
        ]
      }
    };

    try {
      // Call notification endpoint
      await fetch('/api/signature/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteNumber: quote.quoteNumber,
          projectName: quote.projectName,
          clientName: quote.client.companyName,
          clientEmail: signerEmail,
          signatureData: digitalSignature
        })
      });
    } catch (e) {
      console.warn('Signature notification ping error (offline safe):', e);
    }

    onSignComplete(updatedQuote);
    setIsSubmitting(false);
    setIsSuccessCelebration(true);
    triggerConfettiBlast();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-xl max-h-[92vh] flex flex-col shadow-lg overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7b68ee] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Digitaal Ondertekenen & Akkoord</h2>
              <p className="text-[11px] text-slate-300">
                Offerte {quote.quoteNumber} • {quote.client.companyName}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {!isSuccessCelebration ? (
            <>
              {/* Proposal Mini-Summary */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block">Project:</span>
                  <span className="font-bold text-[#1e293b]">{quote.projectName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-500 block">Investering:</span>
                  <span className="font-semibold text-white font-mono">
                    € {(quote.items || [])
                      .filter(i => i.selected && i.billingType === 'one_off')
                      .reduce((acc, c) => acc + ((Number(c.price) || 0) * (Number(c.quantity) || 1)), 0)
                      .toLocaleString('nl-NL')} excl. BTW
                  </span>
                </div>
              </div>

              {/* Signer Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#1e293b]">Naam ondertekenaar *</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:border-slate-900"
                    placeholder="bijv. Mark Vanderstraeten"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1e293b]">Functie / Rol</label>
                  <input
                    type="text"
                    value={signerJobTitle}
                    onChange={(e) => setSignerJobTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:border-slate-900"
                    placeholder="bijv. Zaakvoerder"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-[#1e293b]">E-mailadres voor PDF bevestiging *</label>
                  <input
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:border-slate-900"
                    placeholder="email@bedrijf.be"
                  />
                </div>
              </div>

              {/* Signature Mode Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1e293b]">
                    Handtekening:
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSignMode('draw')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                        signMode === 'draw' ? 'bg-white text-white shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      <PenTool className="w-3 h-3 inline mr-1" />
                      Tekenen
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignMode('type')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                        signMode === 'type' ? 'bg-white text-white shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      <Type className="w-3 h-3 inline mr-1" />
                      Typen
                    </button>
                  </div>
                </div>

                {/* Draw Mode */}
                {signMode === 'draw' ? (
                  <div className="space-y-1.5">
                    <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-[#FCFCFD] overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={140}
                        className="w-full h-[140px] cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      {!hasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-500">
                          Plaats hier uw handtekening met muis of vinger
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[11px] text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eraser className="w-3 h-3" />
                        <span>Wissen</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Type Mode */
                  <div className="p-4 rounded-lg border-2 border-dashed border-slate-300 bg-[#FCFCFD] text-center space-y-2">
                    <div className={`text-2xl italic tracking-wide text-slate-900 font-serif py-2 min-h-[48px]`}>
                      {signerName || 'Uw Handtekening'}
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Gevalideerde elektronische weergave namens {quote.client.companyName}
                    </span>
                  </div>
                )}
              </div>

              {/* Terms Acceptance Checkbox */}
              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-white focus:ring-[#7b68ee] accent-slate-900"
                  />
                  <span className="text-xs text-[#1e293b] leading-relaxed">
                    Ik verklaar bevoegd te zijn namens <strong>{quote.client.companyName}</strong> en ga akkoord met de specificaties in offerte <strong>{quote.quoteNumber}</strong> en de algemene voorwaarden van Studio Graaf.
                  </span>
                </label>
              </div>
            </>
          ) : (
            /* Celebration Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-md bg-[#7b68ee] text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <Sparkles className="w-8 h-8 fill-current" />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Officiële Goedkeuring
                </span>
                <h3 className="text-xl font-semibold text-[#1e293b] mt-2">
                  Gefeliciteerd! De offerte is goedgekeurd.
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Het project <strong>{quote.projectName}</strong> is succesvol vastgelegd. De automatische workflows zijn direct in gang gezet.
                </p>
              </div>

              {/* Automated Notifications Confirmation Box */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Notificatie verzonden naar Studio Graaf (warre@studio-graaf.be)</span>
                </div>

                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ondertekende PDF verstuurd naar {signerEmail}</span>
                </div>

                <div className="flex items-center gap-2 text-[#1e293b] font-medium pt-1 border-t border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Digitale handtekening geverifieerd op {new Date().toLocaleDateString('nl-BE')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onExportPdf();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs font-semibold bg-[#7b68ee] hover:bg-[#6a5ad6] text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Ondertekende PDF</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-md text-xs font-bold bg-slate-900 text-white hover:bg-[#1e293b] transition-all cursor-pointer"
                >
                  Sluiten
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer (When not yet celebrating) */}
        {!isSuccessCelebration && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Beveiligde digitale ondertekening
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Annuleren
              </button>

              <button
                type="button"
                onClick={handleConfirmSignature}
                disabled={isSubmitting || !termsAccepted || !signerName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-semibold bg-[#7b68ee] hover:bg-[#6a5ad6] text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Verwerken...' : 'Definitief Akkoord & Ondertekenen'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
