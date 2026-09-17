import React, { useState, useEffect } from 'react';
import { ClientInfo } from '../types';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  Search, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Database,
  PlusCircle,
  FileText,
  AlertCircle,
  ExternalLink,
  Briefcase
} from 'lucide-react';

interface ClientTeamleaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientInfo;
  onUpdateClient?: (client: ClientInfo) => void;
  mode?: 'edit_client' | 'new_quote';
  onCreateNewQuote?: (title: string, client: ClientInfo) => void;
}

export const ClientTeamleaderModal: React.FC<ClientTeamleaderModalProps> = ({
  isOpen,
  onClose,
  client,
  onUpdateClient,
  mode = 'edit_client',
  onCreateNewQuote
}) => {
  const [sourceTab, setSourceTab] = useState<'teamleader' | 'database' | 'manual'>('teamleader');
  const [step, setStep] = useState<'select_company' | 'select_contact'>('select_company');
  const [quoteTitle, setQuoteTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [companies, setCompanies] = useState<any[]>([]);
  const [dbClients, setDbClients] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  // Manual client form state
  const [manualForm, setManualForm] = useState({
    companyName: client?.companyName || '',
    contactPerson: client?.contactPerson || '',
    jobTitle: client?.jobTitle || '',
    email: client?.email || '',
    phone: client?.phone || '',
    vatNumber: client?.vatNumber || '',
    address: client?.address || '',
    postalCode: client?.postalCode || '',
    city: client?.city || '',
    country: client?.country || 'België'
  });

  const fetchTeamleaderCompanies = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/teamleader/companies');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setCompanies(data.data);
        setSyncMessage(`Live CRM gesynchroniseerd (${data.data.length} bedrijven)`);
      } else if (data && data.error) {
        setErrorMessage(`Teamleader melding: ${data.error}`);
      } else if (data && Array.isArray(data.data)) {
        setCompanies(data.data);
      }
    } catch (err: any) {
      console.error('Fout bij ophalen Teamleader bedrijven:', err);
      setErrorMessage('Kon geen verbinding maken met Teamleader API. Controleer of de server actief is.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDbClients = async () => {
    try {
      const { data } = await supabase.from('clients').select('*').order('name');
      if (data) setDbClients(data);
    } catch (e) {
      console.error('Fout bij ophalen database klanten:', e);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    try {
      // 1. Fetch live from Teamleader API
      const res = await fetch('/api/teamleader/companies');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setCompanies(data.data);
        setSyncMessage(`Succesvol gesynchroniseerd! (${data.data.length} bedrijven)`);
        setTimeout(() => setSyncMessage(null), 4000);
      } else if (data && data.error) {
        setErrorMessage(data.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Fout bij synchroniseren');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep('select_company');
      setQuoteTitle(mode === 'new_quote' ? '' : (client?.companyName ? `Offerte voor ${client.companyName}` : ''));
      setSelectedCompany(null);
      setSearchQuery('');
      setErrorMessage(null);
      
      // Auto-sync Teamleader and Supabase clients automatically on modal open
      fetchTeamleaderCompanies();
      fetchDbClients();

      if (client) {
        setManualForm({
          companyName: client.companyName || '',
          contactPerson: client.contactPerson || '',
          jobTitle: client.jobTitle || '',
          email: client.email || '',
          phone: client.phone || '',
          vatNumber: client.vatNumber || '',
          address: client.address || '',
          postalCode: client.postalCode || '',
          city: client.city || '',
          country: client.country || 'België'
        });
      }
    }
  }, [isOpen, mode]);

  // When a company is selected, load its contacts from Teamleader
  useEffect(() => {
    if (step === 'select_contact' && selectedCompany && selectedCompany.id) {
      setIsLoading(true);
      fetch(`/api/teamleader/contacts?company_id=${selectedCompany.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data && Array.isArray(data.data)) {
            setContacts(data.data);
          } else {
            setContacts([]);
          }
        })
        .catch((e) => {
          console.error(e);
          setContacts([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [step, selectedCompany]);

  if (!isOpen) return null;

  const handleSelectCompany = (comp: any) => {
    setSelectedCompany(comp);
    setStep('select_contact');
  };

  const handleSelectDbClient = (dbClient: any) => {
    const updatedClient: ClientInfo = {
      companyName: dbClient.name || '',
      contactPerson: dbClient.contactPerson?.name || 'Beste klant',
      jobTitle: dbClient.contactPerson?.role || '',
      email: dbClient.contactPerson?.email || '',
      phone: dbClient.contactPerson?.phone || '',
      vatNumber: dbClient.vat_number || '',
      address: dbClient.address || '',
      postalCode: '',
      city: '',
      country: 'België',
      teamleaderId: dbClient.id
    };

    finishSelection(updatedClient);
  };

  const handleSelectContact = (contact: any | null) => {
    if (!selectedCompany) return;

    const contactName = contact 
      ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() 
      : 'Beste klant';

    const contactEmail = (contact && contact.emails && contact.emails.length > 0 && contact.emails[0].email) ||
      (selectedCompany.emails && selectedCompany.emails.length > 0 && selectedCompany.emails[0].email) || '';

    const contactPhone = (contact && contact.telephones && contact.telephones.length > 0 && contact.telephones[0].number) ||
      (selectedCompany.telephones && selectedCompany.telephones.length > 0 && selectedCompany.telephones[0].number) || '';

    const contactJobTitle = contact?.primary_address?.job_title || contact?.salutation || '';

    const updatedClient: ClientInfo = {
      companyName: selectedCompany.name || '',
      contactPerson: contactName,
      jobTitle: contactJobTitle,
      email: contactEmail,
      phone: contactPhone,
      vatNumber: selectedCompany.vat_number || selectedCompany.national_identification_number || '',
      address: selectedCompany.primary_address ? selectedCompany.primary_address.line_1 || '' : '',
      postalCode: selectedCompany.primary_address ? selectedCompany.primary_address.postal_code || '' : '',
      city: selectedCompany.primary_address ? selectedCompany.primary_address.city || '' : '',
      country: selectedCompany.primary_address ? selectedCompany.primary_address.country || 'België' : 'België',
      teamleaderId: selectedCompany.id
    };

    finishSelection(updatedClient);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.companyName.trim()) return;

    const updatedClient: ClientInfo = {
      companyName: manualForm.companyName.trim(),
      contactPerson: manualForm.contactPerson.trim() || 'Beste klant',
      jobTitle: manualForm.jobTitle.trim(),
      email: manualForm.email.trim(),
      phone: manualForm.phone.trim(),
      vatNumber: manualForm.vatNumber.trim(),
      address: manualForm.address.trim(),
      postalCode: manualForm.postalCode.trim(),
      city: manualForm.city.trim(),
      country: manualForm.country.trim() || 'België'
    };

    finishSelection(updatedClient);
  };

  const finishSelection = (finalClient: ClientInfo) => {
    const finalTitle = quoteTitle.trim() || `Offerte voor ${finalClient.companyName}`;
    if (mode === 'new_quote' && onCreateNewQuote) {
      onCreateNewQuote(finalTitle, finalClient);
    } else if (onUpdateClient) {
      onUpdateClient(finalClient);
    }
    onClose();
  };

  // Filter companies from Teamleader
  const filteredTeamleaderCompanies = companies.filter(comp => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (comp.name || '').toLowerCase();
    const city = (comp.primary_address?.city || '').toLowerCase();
    const line1 = (comp.primary_address?.line_1 || '').toLowerCase();
    const vat = (comp.vat_number || '').toLowerCase();
    const email = (comp.emails?.[0]?.email || '').toLowerCase();
    return name.includes(q) || city.includes(q) || line1.includes(q) || vat.includes(q) || email.includes(q);
  });

  // Filter local Supabase clients
  const filteredDbClients = dbClients.filter(client => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (client.name || '').toLowerCase();
    const industry = (client.industry || '').toLowerCase();
    const address = (client.address || '').toLowerCase();
    return name.includes(q) || industry.includes(q) || address.includes(q);
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#7b68ee]/10 flex items-center justify-center text-[#7b68ee] shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-slate-900 leading-none">
                  {mode === 'new_quote' ? 'Nieuwe Offerte Aanmaken' : 'Klant Kennisbank & CRM'}
                </h3>
                {companies.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Teamleader ({companies.length})
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {step === 'select_contact' 
                  ? `Selecteer een contactpersoon van ${selectedCompany?.name}` 
                  : 'Koppel live CRM bedrijfsgegevens direct aan deze offerte'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 'select_company' && sourceTab === 'teamleader' && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing || isLoading}
                title="Synchroniseer live met Teamleader"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#7b68ee] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncen...' : 'Sync Nu'}</span>
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync or Error Feedback Bar */}
        {syncMessage && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2 flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-amber-50 border-b border-amber-200/70 px-6 py-2.5 flex items-center justify-between gap-2 text-xs font-semibold text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <a 
              href="/api/teamleader/auth" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7b68ee] hover:underline"
            >
              Koppel Teamleader <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6 space-y-5">

          {/* Project Title Input (Always prominent in new_quote mode) */}
          {mode === 'new_quote' && step === 'select_company' && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#7b68ee]" />
                Project / Offerte Titel
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Bijv. Maatwerk Website, Webshop & Branding 2026"
                value={quoteTitle}
                onChange={(e) => setQuoteTitle(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7b68ee] focus:ring-2 focus:ring-[#7b68ee]/20 focus:bg-white transition-all"
              />
            </div>
          )}

          {/* Step 1: Select Company */}
          {step === 'select_company' && (
            <div className="space-y-4">
              {/* Source Tabs */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center p-1 bg-slate-200/70 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSourceTab('teamleader')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sourceTab === 'teamleader' 
                        ? 'bg-white text-[#7b68ee] shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Teamleader CRM</span>
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                      {companies.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceTab('database')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sourceTab === 'database' 
                        ? 'bg-white text-[#7b68ee] shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Database Klanten</span>
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                      {dbClients.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceTab('manual')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sourceTab === 'manual' 
                        ? 'bg-white text-[#7b68ee] shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Handmatig Invoeren</span>
                  </button>
                </div>

                <div className="text-[11px] font-semibold text-slate-500">
                  {sourceTab === 'teamleader' ? 'Direct gesynchroniseerd met Focus CRM' : sourceTab === 'database' ? 'Klanten in Supabase' : 'Directe lead invoer'}
                </div>
              </div>

              {/* Search Bar for Teamleader or Database Tab */}
              {sourceTab !== 'manual' && (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={sourceTab === 'teamleader' ? "Zoek op bedrijfsnaam, stad, BTW-nummer of adres..." : "Zoek in database klanten..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#7b68ee] focus:ring-2 focus:ring-[#7b68ee]/20 shadow-xs transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Wis
                    </button>
                  )}
                </div>
              )}

              {/* Teamleader List */}
              {sourceTab === 'teamleader' && (
                <div>
                  {isLoading ? (
                    <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
                      <RefreshCw className="w-6 h-6 text-[#7b68ee] animate-spin mx-auto mb-2" />
                      <div className="text-xs font-bold text-slate-700">Bedrijven synchroniseren uit Teamleader...</div>
                      <p className="text-[11px] text-slate-400 mt-1">Live verbinding wordt opgebouwd</p>
                    </div>
                  ) : filteredTeamleaderCompanies.length > 0 ? (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {filteredTeamleaderCompanies.map(comp => (
                        <div
                          key={comp.id}
                          onClick={() => handleSelectCompany(comp)}
                          className="p-3.5 bg-white border border-slate-200/90 hover:border-[#7b68ee] hover:bg-slate-50/50 rounded-xl cursor-pointer transition-all duration-150 flex items-center justify-between group shadow-2xs hover:shadow-xs"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs truncate group-hover:text-[#7b68ee] transition-colors">
                                {comp.name}
                              </span>
                              {comp.vat_number && (
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                                  {comp.vat_number}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                              {(comp.primary_address?.city || comp.primary_address?.country) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {comp.primary_address?.line_1 ? `${comp.primary_address.line_1}, ` : ''}
                                  {comp.primary_address?.city || ''} {comp.primary_address?.country ? `(${comp.primary_address.country})` : ''}
                                </span>
                              )}
                              {comp.emails && comp.emails.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  {comp.emails[0].email}
                                </span>
                              )}
                              {comp.telephones && comp.telephones.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {comp.telephones[0].number}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-bold text-[#7b68ee] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                              Kiezen
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#7b68ee] group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
                      <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <div className="text-xs font-bold text-slate-700">Geen bedrijven gevonden in Teamleader</div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {searchQuery ? `Geen resultaten voor "${searchQuery}"` : 'Controleer of uw Teamleader account is gekoppeld.'}
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={handleManualSync}
                          className="px-3.5 py-1.5 bg-[#7b68ee] text-white text-xs font-bold rounded-lg hover:bg-[#6a5ad6] transition-all cursor-pointer"
                        >
                          Opnieuw laden
                        </button>
                        <button
                          onClick={() => setSourceTab('manual')}
                          className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          Handmatig invoeren
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Database Clients List */}
              {sourceTab === 'database' && (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {filteredDbClients.length > 0 ? (
                    filteredDbClients.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectDbClient(c)}
                        className="p-3.5 bg-white border border-slate-200/90 hover:border-[#7b68ee] hover:bg-slate-50/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs group-hover:text-[#7b68ee] transition-colors">{c.name}</div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span>{c.industry || 'Klant'}</span>
                            {c.address && <span>• {c.address}</span>}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#7b68ee] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                      Geen database klanten gevonden.
                    </div>
                  )}
                </div>
              )}

              {/* Manual Form */}
              {sourceTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600">Bedrijfsnaam *</label>
                      <input
                        type="text"
                        required
                        placeholder="Bijv. Acme Corporation BV"
                        value={manualForm.companyName}
                        onChange={(e) => setManualForm({ ...manualForm, companyName: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#7b68ee] focus:ring-1 focus:ring-[#7b68ee] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Contactpersoon</label>
                      <input
                        type="text"
                        placeholder="Bijv. Jan Janssen"
                        value={manualForm.contactPerson}
                        onChange={(e) => setManualForm({ ...manualForm, contactPerson: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#7b68ee] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Functietitel</label>
                      <input
                        type="text"
                        placeholder="Bijv. Marketing Manager"
                        value={manualForm.jobTitle}
                        onChange={(e) => setManualForm({ ...manualForm, jobTitle: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#7b68ee] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">E-mailadres</label>
                      <input
                        type="email"
                        placeholder="jan@acme.be"
                        value={manualForm.email}
                        onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#7b68ee] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Telefoonnummer</label>
                      <input
                        type="tel"
                        placeholder="+32 456 78 90 12"
                        value={manualForm.phone}
                        onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#7b68ee] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">BTW-nummer</label>
                      <input
                        type="text"
                        placeholder="BE 0123.456.789"
                        value={manualForm.vatNumber}
                        onChange={(e) => setManualForm({ ...manualForm, vatNumber: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#7b68ee] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Adres & Huisnummer</label>
                      <input
                        type="text"
                        placeholder="Kerkstraat 12"
                        value={manualForm.address}
                        onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#7b68ee] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Postcode & Gemeente</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="2800"
                          value={manualForm.postalCode}
                          onChange={(e) => setManualForm({ ...manualForm, postalCode: e.target.value })}
                          className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#7b68ee] outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Mechelen"
                          value={manualForm.city}
                          onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                          className="col-span-2 w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#7b68ee] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={!manualForm.companyName.trim()}
                      className="px-5 py-2.5 bg-[#7b68ee] hover:bg-[#6a5ad6] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {mode === 'new_quote' ? 'Offerte Aanmaken met Deze Klant' : 'Klant Opslaan'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Step 2: Select Contact Person */}
          {step === 'select_contact' && selectedCompany && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button 
                  type="button"
                  onClick={() => setStep('select_company')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Terug naar bedrijven
                </button>

                <div className="text-xs font-bold text-[#7b68ee] bg-[#7b68ee]/10 px-2.5 py-1 rounded-md">
                  {selectedCompany.name}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Kies een contactpersoon
                </h4>

                {isLoading ? (
                  <div className="py-8 text-center text-xs font-semibold text-slate-500">
                    <RefreshCw className="w-5 h-5 text-[#7b68ee] animate-spin mx-auto mb-2" />
                    Contactpersonen ophalen uit Teamleader...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contacts.map(contact => (
                      <div
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className="p-3.5 bg-slate-50/70 border border-slate-200 hover:border-[#7b68ee] hover:bg-white rounded-xl cursor-pointer transition-all flex flex-col gap-1.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs group-hover:text-[#7b68ee] transition-colors">
                            {contact.first_name} {contact.last_name}
                          </span>
                          <span className="text-[10px] font-bold text-[#7b68ee] opacity-0 group-hover:opacity-100 transition-opacity">
                            Selecteer
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                          {contact.emails && contact.emails.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {contact.emails[0].email}
                            </span>
                          )}
                          {contact.telephones && contact.telephones.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {contact.telephones[0].number}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Generic / No specific contact option */}
                    <div
                      onClick={() => handleSelectContact(null)}
                      className="p-3.5 bg-white border border-dashed border-slate-300 hover:border-[#7b68ee] hover:bg-[#7b68ee]/5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-[#7b68ee]"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Geen specifieke contactpersoon (Algemeen / Beste klant)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
