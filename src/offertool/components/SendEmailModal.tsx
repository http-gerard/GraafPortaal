import React, { useState } from 'react';
import { Mail, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { QuoteData } from '../types';
import { wrapInHtmlTemplate } from '../../lib/emailTemplate';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteData;
  onShowToast?: (msg: string) => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({ isOpen, onClose, quote, onShowToast }) => {
  const [to, setTo] = useState(quote.client?.email || '');
  const [subject, setSubject] = useState(`Jouw Offerte van Studio Graaf is klaar: ${quote.quoteNumber}`);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-fill template on mount
  React.useEffect(() => {
    if (isOpen) {
      setTo(quote.client?.email || '');
      const portalLink = window.location.origin + window.location.pathname + '?quoteId=' + quote.id + '&view=client';
      
      const templatesRaw = localStorage.getItem('graaf_email_templates');
      const templates = templatesRaw ? JSON.parse(templatesRaw) : null;
      const storedSubject = templates?.quote_invite?.subject || 'Jouw Offerte van Studio Graaf is klaar: {offerte_nummer}';
      const storedBody = templates?.quote_invite?.body || 'Beste {klantnaam},\n\nHierbij sturen we je met veel plezier ons voorstel.\n\nJe kunt de offerte interactief bekijken, downloaden of direct digitaal ondertekenen via jouw persoonlijke beveiligde portaal:\n{portaal_link}\n\nMet vriendelijke groet,\nTeam Studio Graaf';

      const filledSubject = storedSubject
        .replace('{klantnaam}', quote.client?.contactPerson || 'klant')
        .replace('{bedrijfsnaam}', quote.client?.companyName || 'klant')
        .replace('{offerte_nummer}', quote.quoteNumber || 'Onbekend');

      const filledBody = storedBody
        .replace('{klantnaam}', quote.client?.contactPerson || 'klant')
        .replace('{bedrijfsnaam}', quote.client?.companyName || 'klant')
        .replace('{portaal_link}', '[Klantportaal Link]')
        .replace('{offerte_nummer}', quote.quoteNumber || 'Onbekend');

      setSubject(filledSubject);
      setMessage(filledBody);
      setSuccess(false);
      setError('');
    }
  }, [isOpen, quote]);

  const handleSend = async () => {
    setIsSending(true);
    setError('');
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          htmlBody: wrapInHtmlTemplate(message.replace('[Klantportaal Link]', window.location.origin + window.location.pathname + '?quoteId=' + quote.id + '&view=client'), quote.quoteNumber)
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        if (onShowToast) onShowToast('E-mail succesvol verzonden!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Er is een fout opgetreden bij het verzenden.');
      }
    } catch (err: any) {
      setError(err.message || 'Kon de server niet bereiken.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#7b68ee]/5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7b68ee] text-white flex items-center justify-center shadow-lg shadow-[#7b68ee]/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">E-mail Klantportaal</h2>
              <p className="text-xs font-bold text-slate-500">Verstuur een beveiligde link naar {quote.client?.companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">E-mail verstuurd!</h3>
              <p className="text-sm font-medium text-slate-500 text-center">De e-mail met de portaallink is succesvol naar {to} verzonden.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Aan (Ontvanger)</label>
                <input 
                  type="email" 
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#7b68ee] focus:ring-2 focus:ring-[#7b68ee]/20 transition-all outline-none" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Onderwerp</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#7b68ee] focus:ring-2 focus:ring-[#7b68ee]/20 transition-all outline-none" 
                />
              </div>

              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bericht (HTML)</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#7b68ee] focus:ring-2 focus:ring-[#7b68ee]/20 transition-all outline-none resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
              Annuleren
            </button>
            <button 
              onClick={handleSend}
              disabled={isSending || !to}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#7b68ee] text-white hover:bg-[#6a5ad6] transition-all flex items-center gap-2 shadow-lg shadow-[#7b68ee]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>Verzenden...</>
              ) : (
                <>
                  Verzenden <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
