import React, { useState, useEffect } from 'react';
import { QuoteData, ClientInfo, DigitalSignature, QuoteInvoice } from './types';
import { supabase } from '../lib/supabase';
import { INITIAL_QUOTES_LIST } from './data/mockQuotes';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES, DEFAULT_TIMELINE_PHASES } from './data/defaultCatalog';
import { Header } from './components/Header';
import { BuilderView } from './components/BuilderView';
import { QuotePreview } from './components/QuotePreview';
import { TimelineManager } from './components/TimelineManager';
import { ActivityView } from './components/ActivityView';
import { QuotesOverview } from './components/QuotesOverview';
import { ClientTeamleaderModal } from './components/ClientTeamleaderModal';
import { PresentationModal } from './components/PresentationModal';
import { AiMeetingNotesModal } from './components/AiMeetingNotesModal';
import { SendEmailModal } from './components/SendEmailModal';
import { SignatureModal } from './components/SignatureModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ClientQuotePortal } from './components/ClientQuotePortal';
import { generatePdfDocument } from './services/pdfService';
import { generatePowerPointPresentation } from './services/pptxService';
import { syncQuoteToPortal } from './services/telemetryService';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function App() {
  // Load saved quotes list or initial mock quotes
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const fetchQuotes = async () => {
      const { data, error } = await supabase.from('quotes').select('*');
      if (data && data.length > 0) {
        setQuotes(data.map(q => q.full_data).filter(Boolean));
        if (!currentQuoteId && data[0]?.full_data) setCurrentQuoteId(data[0].full_data.id);
      } else {
        // If DB is empty, optionally keep mock data, but let's just leave it empty
        setQuotes([]);
      }
      setIsLoaded(true);
    };
    fetchQuotes();
  }, []);

  const [currentQuoteId, setCurrentQuoteId] = useState<string>(() => {
    // Check URL params for direct client view or quote ID
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQuoteId = params.get('quoteId');
      const isClientView = params.get('view') === 'client';
      if (urlQuoteId && (isClientView || quotes.some(q => q.id === urlQuoteId))) {
        return urlQuoteId;
      }
    }
    const savedId = localStorage.getItem('studio_graaf_current_quote_id_v2026');
    if (savedId && quotes.some(q => q.id === savedId)) {
      return savedId;
    }
    return quotes[0]?.id || generateUUID();
  });

  const [isClientPortalActive, setIsClientPortalActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'client' || params.get('portal') === 'true';
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'preview' | 'timeline' | 'activity'>('dashboard');
  const [isTeamleaderModalOpen, setIsTeamleaderModalOpen] = useState(false);
  const [isNewQuoteWizardOpen, setIsNewQuoteWizardOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [modalTargetQuote, setModalTargetQuote] = useState<QuoteData | null>(null);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);

  // Sync DOWN signed quotes from the server every 3 seconds (so Admin sees signatures instantly)
  useEffect(() => {
    if (isClientPortalActive) return; // Only admin needs to poll

    const interval = setInterval(() => {
      fetch('/api/quotes/signed')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.success && data.quotes && data.quotes.length > 0) {
            setQuotes(prevQuotes => {
              let changed = false;
              const newQuotes = [...prevQuotes];
              for (const serverQuote of data.quotes) {
                const idx = newQuotes.findIndex(q => q.id === serverQuote.id);
                if (idx !== -1 && !newQuotes[idx].digitalSignature) {
                  newQuotes[idx] = serverQuote;
                  changed = true;
                }
              }
              return changed ? newQuotes : prevQuotes;
            });
          }
        })
        .catch(console.error);
    }, 3000);
    return () => clearInterval(interval);
  }, [isClientPortalActive]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active quote being edited/viewed
  const currentQuote = quotes.find(q => q.id === currentQuoteId) || quotes[0] || INITIAL_QUOTES_LIST[0];

  // Auto-save quotes and active ID to localStorage & backend portal store
  useEffect(() => {
    localStorage.setItem('studio_graaf_quotes_v2026_apr', JSON.stringify(quotes));
    syncQuoteToPortal(currentQuote);
    // Sync all quotes so backend has everything even after restart
    quotes.forEach(q => syncQuoteToPortal(q));
  }, [quotes, currentQuote]);

  useEffect(() => {
    localStorage.setItem('studio_graaf_current_quote_id_v2026', currentQuoteId);
  }, [currentQuoteId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

    const syncQuoteToDB = async (q: QuoteData) => {
    try {
      const subtotal = q.items?.filter(i => i.selected).reduce((sum, item) => sum + (item.price || 0), 0) || 0;
      const discount = q.overallDiscountType === 'percentage' ? subtotal * (q.overallDiscountValue / 100) : q.overallDiscountValue;
      const totalAmount = subtotal - discount;
      const { data: existing } = await supabase.from('quotes').select('id').eq('id', q.id).maybeSingle();
      
      if (existing) {
        await supabase.from('quotes').update({
          quote_number: q.quoteNumber,
          title: q.projectName,
          total_amount: totalAmount,
          status: q.status,
          full_data: q
        }).eq('id', q.id);
      } else {
        await supabase.from('quotes').insert([{
          id: q.id,
          quote_number: q.quoteNumber,
          title: q.projectName,
          total_amount: totalAmount,
          status: q.status,
          full_data: q
        }]);
      }
    } catch(err: any) {
      console.error('Error syncing quote', err);
      if (err && err.message) {
        showToast('Fout bij opslaan database: ' + err.message);
      }
    }
  };

  const handleUpdateQuote = (updatedQuote: QuoteData) => {
    setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
    syncQuoteToDB(updatedQuote);
  };

  const handleSelectQuote = (id: string, targetTab: 'builder' | 'preview' = 'builder') => {
    setCurrentQuoteId(id);
    setActiveTab(targetTab);
  };

  const handleCreateQuote = (title: string, client: ClientInfo) => {
    const newQuoteNumber = `SG-2026-${String(quotes.length + 84).padStart(3, '0')}`;
    const newId = generateUUID();

    const newQuote: QuoteData = {
      id: newId,
      quoteNumber: newQuoteNumber,
      version: 1,
      status: 'concept',
      createdAt: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projectName: title || 'Nieuw Maatwerk Project',
      projectSummary: 'Digitale merkversterking en maatwerk webontwikkeling.',
      salesRepresentative: {
        name: 'Warre Geerts',
        email: 'warre@studio-graaf.be',
        phone: '+32 400 00 00 00',
        role: 'Co-Founder'
      },
      client,
      categories: DEFAULT_CATEGORIES,
      items: DEFAULT_SERVICES.map(i => ({ ...i, selected: false })),
      overallDiscountType: 'percentage',
      overallDiscountValue: 0,
      vatRate: 21,
      paymentTerms: '30% bij start project, rest bij oplevering. Facturen zijn betaalbaar binnen 14 dagen.',
      timelinePhases: DEFAULT_TIMELINE_PHASES
    };

    setQuotes(prev => [newQuote, ...prev]);
    setCurrentQuoteId(newId);
    setActiveTab('builder');
  };

  const handleApplyAiQuote = (generatedQuote: QuoteData) => {
    setQuotes(prev => [generatedQuote, ...prev]);
    syncQuoteToDB(generatedQuote);
    setCurrentQuoteId(generatedQuote.id);
    setActiveTab('builder');
    showToast(`AI Offerte voor "${generatedQuote.client.companyName}" succesvol klaargezet!`);
  };

  const handleDuplicateQuote = (id: string) => {
    const source = quotes.find(q => q.id === id);
    if (!source) return;

    const newId = generateUUID();
    const newQuote: QuoteData = {
      ...source,
      id: newId,
      quoteNumber: `${source.quoteNumber}-KOP`,
      projectName: `${source.projectName} (Kopie)`,
      createdAt: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setQuotes(prev => [newQuote, ...prev]);
    syncQuoteToDB(newQuote);
    setCurrentQuoteId(newId);
    showToast(`Offerte gedupliceerd als ${newQuote.quoteNumber}`);
  };

  const handleDeleteQuote = (id: string) => {
    supabase.from('quotes').delete().eq('id', id).then(res => { if (res.error) console.error(res.error) });
    
    if (quotes.length <= 1) {
      handleCreateQuote('Nieuwe blanco offerte', { companyName: 'Bedrijf BV' } as any);
      setQuotes(prev => prev.filter(q => q.id !== id));
      showToast('Laatste offerte verwijderd. Nieuwe blanco offerte aangemaakt.');
      return;
    }
    
    const remaining = quotes.filter(q => q.id !== id);
    setQuotes(remaining);
    if (currentQuoteId === id) {
      setCurrentQuoteId(remaining[0].id);
    }
    showToast('Offerte verwijderd.');
  };

  const handleUpdateClient = (client: ClientInfo) => {
    const updated = { ...currentQuote, client };
    handleUpdateQuote(updated);
    showToast(`Klantgegevens van "${client.companyName}" opgeslagen!`);
  };

  const handleSignQuote = (payload: any) => {
    let updated: QuoteData;
    let signerName = 'Klant';
    if (payload.status && payload.quoteNumber) {
      // It's QuoteData from SignatureModal
      updated = payload;
      signerName = payload.digitalSignature?.signedBy || 'Klant';
    } else {
      // It's DigitalSignature from ClientQuotePortal
      updated = {
        ...currentQuote,
        status: 'akkoord',
        digitalSignature: payload
      };
      signerName = payload.signedBy;
    }
    handleUpdateQuote(updated);
    showToast(`Offerte ${currentQuote.quoteNumber} digitaal ondertekend door ${signerName}!`);
  };

  const handleInvoiceCreated = (invoice: QuoteInvoice) => {
    const updated: QuoteData = {
      ...currentQuote,
      invoices: [...(currentQuote.invoices || []), invoice]
    };
    handleUpdateQuote(updated);
    showToast(`Voorschotfactuur ${invoice.invoiceNumber} aangemaakt!`);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await generatePdfDocument(currentQuote);
      showToast('PDF Offerte succesvol gegenereerd en gedownload!');
    } catch (error) {
      console.error('PDF export error:', error);
      showToast('Er is een fout opgetreden bij het genereren van de PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportPptx = async () => {
    setIsExportingPptx(true);
    try {
      await generatePowerPointPresentation(currentQuote);
      showToast('PowerPoint presentatie (.pptx) succesvol gegenereerd!');
    } catch (error) {
      console.error('PPTX export error:', error);
      showToast('Er is een fout opgetreden bij het genereren van de PowerPoint.');
    } finally {
      setIsExportingPptx(false);
    }
  };

  const handlePrint = () => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      setTimeout(() => {
        window.print();
      }, 300);
    } else {
      window.print();
    }
  };

    const [fetchedQuote, setFetchedQuote] = useState<QuoteData | null>(null);

  useEffect(() => {
    if (isClientPortalActive && currentQuoteId) {
      fetch(`/api/quotes/${currentQuoteId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.quote) {
            setFetchedQuote(data.quote);
          }
        })
        .catch(console.error);
    }
  }, [isClientPortalActive, currentQuoteId]);

  const activeModalQuote = modalTargetQuote || currentQuote;
  const displayQuote = (isClientPortalActive && fetchedQuote) ? fetchedQuote : currentQuote;

  // If in client view mode (e.g. from unique link or preview button)
  if (isClientPortalActive) {
    return (
      <ClientQuotePortal
        quote={displayQuote}
        onClose={
          (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'client') 
            ? undefined 
            : () => {
                setIsClientPortalActive(false);
                if (typeof window !== 'undefined' && window.history.pushState) {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('view');
                  url.searchParams.delete('portal');
                  window.history.pushState({}, '', url.toString());
                }
              }
        }
        onQuoteSigned={handleSignQuote}
      />
    );
  }

  const isCurrentQuoteSigned = !!currentQuote?.digitalSignature || currentQuote?.status === 'akkoord';

  return (
    <div className="min-h-screen bg-slate-50 text-[#1e293b] flex flex-col selection:bg-[#7b68ee] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-md shadow-xl flex items-center gap-3 border border-slate-200/20 animate-in slide-in-from-bottom-5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7b68ee] animate-pulse" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
            <SendEmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        quote={currentQuote} 
        onShowToast={showToast}
      />

      {activeTab !== 'dashboard' && (
        <Header
          onShowToast={showToast}
          quote={currentQuote}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenPresentation={() => setIsPresentationOpen(true)}
          onOpenEmailModal={() => setIsEmailModalOpen(true)}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
          onOpenInvoiceModal={() => {
            setModalTargetQuote(currentQuote);
            setIsInvoiceModalOpen(true);
          }}
          onExportPdf={handleExportPdf}
          onExportPptx={handleExportPptx}
          onPrint={handlePrint}
          isExportingPdf={isExportingPdf}
          isExportingPptx={isExportingPptx}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <QuotesOverview
            onShowToast={showToast}
            quotes={quotes}
            currentQuoteId={currentQuoteId}
            onSelectQuote={handleSelectQuote}
            onCreateQuote={() => setIsNewQuoteWizardOpen(true)}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
            onDuplicateQuote={handleDuplicateQuote}
            onDeleteQuote={handleDeleteQuote}
          />
        )}

        {(!isCurrentQuoteSigned && activeTab === 'builder') && (
          <BuilderView
            quote={currentQuote}
            onUpdateQuote={handleUpdateQuote}
            onOpenTeamleader={() => setIsTeamleaderModalOpen(true)}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onOpenInvoiceModal={() => {
              setModalTargetQuote(currentQuote);
              setIsInvoiceModalOpen(true);
            }}
          />
        )}

        {activeTab === 'preview' && (
          <QuotePreview
            quote={currentQuote}
            onExportPdf={handleExportPdf}
            onExportPptx={handleExportPptx}
            onPrint={handlePrint}
            onAcceptQuote={() => {
              handleUpdateQuote({ ...currentQuote, status: 'akkoord' });
              showToast('Offerte digitaal akkoord bevonden!');
            }}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onOpenInvoiceModal={() => {
              setModalTargetQuote(currentQuote);
              setIsInvoiceModalOpen(true);
            }}
            isExportingPdf={isExportingPdf}
            isExportingPptx={isExportingPptx}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityView quote={currentQuote} />
        )}

        {activeTab === 'timeline' && (
          <TimelineManager
            quote={currentQuote}
            onUpdateQuote={handleUpdateQuote}
          />
        )}
      </main>

      {/* AI Meeting Notes to Quote Modal */}
      <AiMeetingNotesModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onQuoteGenerated={handleApplyAiQuote}
      />

      {/* Digital Signature Modal with Confetti */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        quote={activeModalQuote}
        onSignComplete={handleSignQuote}
        onExportPdf={handleExportPdf}
      />

      {/* Invoice Modal (Teamleader / Billit / Peppol) */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setModalTargetQuote(null);
        }}
        quote={activeModalQuote}
        onInvoiceCreated={handleInvoiceCreated}
      />

      {/* Quote Analytics Modal (Client Engagement & Time Spent) */}

      {/* Teamleader Sync Modal */}
            {/* Teamleader Sync Modal (Edit Client) */}
      <ClientTeamleaderModal
        isOpen={isTeamleaderModalOpen}
        onClose={() => setIsTeamleaderModalOpen(false)}
        client={currentQuote.client}
        onUpdateClient={handleUpdateClient}
        mode="edit_client"
      />

      {/* New Quote Wizard */}
      <ClientTeamleaderModal
        isOpen={isNewQuoteWizardOpen}
        onClose={() => setIsNewQuoteWizardOpen(false)}
        mode="new_quote"
        onCreateNewQuote={handleCreateQuote}
      />

      {/* Fullscreen Pitch Presentation Modal */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        quote={currentQuote}
      />

    </div>
  );
}
