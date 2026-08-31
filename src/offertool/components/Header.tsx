import React, { useState } from 'react';
import { QuoteData } from '../types';
import { 
  Mail, Play, Link, 
  FileDown, 
  Presentation, 
  Clock, 
  FileText, 
  Sliders, 
  ChevronDown, 
  Download,
  PenTool,
  Receipt,
  Activity,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface HeaderProps {
  onShowToast?: (msg: string) => void;
  quote: QuoteData;
  activeTab: 'dashboard' | 'builder' | 'preview' | 'timeline';
  setActiveTab: (tab: 'dashboard' | 'builder' | 'preview' | 'timeline') => void;
  onOpenPresentation: () => void;
  onOpenEmailModal: () => void;
  onOpenSignatureModal?: () => void;
  onOpenInvoiceModal?: () => void;
  onExportPdf: () => void;
  onExportPptx: () => void;
  onPrint: () => void;
  isExportingPdf: boolean;
  isExportingPptx: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  quote,
  activeTab,
  setActiveTab,
  onOpenPresentation,
  onOpenEmailModal,
  onOpenSignatureModal,
  onOpenInvoiceModal,
  onExportPdf,
  onExportPptx,
  onPrint,
  isExportingPdf,
  isExportingPptx,
  onShowToast,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const isSigned = !!quote.digitalSignature || quote.status === 'akkoord';

  return (
    <div className="w-full">
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-8 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Full Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overzicht</span>
          </button>
          
          {!isSigned && (
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Samenstellen</span>
          </button>
        )}

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Offerte</span>
            {isSigned && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Digitaal ondertekend" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activiteit</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fasering</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Presentation Button */}
          <button
            onClick={onOpenPresentation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#7b68ee] hover:bg-[#6a5ad6] text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Start fullscreen presentatie voor de klant"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">Presenteren</span>
          </button>

          {/* Email Button */}
          <button
            onClick={onOpenEmailModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#7b68ee]/10 hover:bg-[#7b68ee]/20 text-[#7b68ee] transition-all shadow-xs cursor-pointer"
            title="Verstuur offerte via e-mail"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">E-mail Klant</span>
          </button>
          
          {/* Share Link Button */}
          <button
            onClick={() => {
              const url = window.location.origin + window.location.pathname + '?quoteId=' + quote.id + '&view=client';
              const input = document.createElement('input');
              input.value = url;
              document.body.appendChild(input);
              input.select();
              try {
                document.execCommand('copy');
                if (onShowToast) {
                  onShowToast('Klant-link gekopieerd!');
                } else {
                  alert('Klant-link gekopieerd!');
                }
              } catch(e) {
                window.prompt('Kopieer deze link:', url);
              }
              document.body.removeChild(input);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-[#7b68ee]/10 hover:bg-[#7b68ee]/20 text-[#7b68ee] transition-all shadow-xs cursor-pointer"
            title="Kopieer unieke link voor de klant"
          >
            <Link className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deel Portaal</span>
          </button>

          {/* Direct Download PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">{isExportingPdf ? 'Laden...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden items-center justify-around mt-2 pt-2 border-t border-slate-200 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'dashboard' ? 'text-white bg-[#7b68ee]' : ''}`}
        >
          Offertes
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'builder' ? 'text-white bg-[#7b68ee]' : ''}`}
        >
          Samenstellen
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'preview' ? 'text-white bg-[#7b68ee]' : ''}`}
        >
          PDF
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'activity' ? 'text-white bg-[#7b68ee]' : ''}`}
        >
          Activiteit
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'timeline' ? 'text-white bg-[#7b68ee]' : ''}`}
        >
          Fasering
        </button>
      </div>
    </div>
  );
};

