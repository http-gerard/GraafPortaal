import React, { useState, useEffect } from 'react';
import { ClientInfo } from '../types';
import { 
  Building2, 
  Search, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft,
  ArrowRight
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
  const [step, setStep] = useState<'title' | 'select_company' | 'select_contact'>(mode === 'new_quote' ? 'title' : 'select_company');
  const [quoteTitle, setQuoteTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(mode === 'new_quote' ? 'title' : 'select_company');
      setQuoteTitle('');
      setSelectedCompany(null);
      setIsLoading(true);
      fetch('/api/teamleader/companies')
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setCompanies(data.data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'select_contact' && selectedCompany) {
      setIsLoading(true);
      fetch(`/api/teamleader/contacts?company_id=${selectedCompany.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setContacts(data.data);
          } else {
            setContacts([]);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [step, selectedCompany]);

  if (!isOpen) return null;

  const handleSelectCompany = (comp: any) => {
    setSelectedCompany(comp);
    setStep('select_contact');
  };

  const handleSelectContact = (contact: any | null) => {
    const updatedClient: ClientInfo = {
      companyName: selectedCompany.name,
      contactPerson: contact ? (contact.first_name + ' ' + contact.last_name).trim() : 'Beste klant',
      jobTitle: contact ? contact.primary_address?.job_title || '' : '',
      email: contact && contact.emails && contact.emails.length > 0 ? contact.emails[0].email : '',
      phone: contact && contact.telephones && contact.telephones.length > 0 ? contact.telephones[0].number : '',
      vatNumber: selectedCompany.vat_number || '',
      address: selectedCompany.primary_address ? selectedCompany.primary_address.line_1 || '' : '',
      postalCode: selectedCompany.primary_address ? selectedCompany.primary_address.postal_code || '' : '',
      city: selectedCompany.primary_address ? selectedCompany.primary_address.city || '' : '',
      country: selectedCompany.primary_address ? selectedCompany.primary_address.country || '' : '',
      teamleaderId: selectedCompany.id
    };

    if (mode === 'new_quote' && onCreateNewQuote) {
      onCreateNewQuote(quoteTitle, updatedClient);
    } else if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }
    onClose();
  };

  const filteredCompanies = companies.filter(comp =>
    (comp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (comp.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7b68ee]/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#7b68ee]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1e293b]">
                {step === 'title' ? 'Nieuwe Offerte Maken' : step === 'select_company' ? 'Kies een Teamleader Klant' : 'Kies een Contactpersoon'}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {step === 'select_company' ? 'Koppel live CRM data' : `Contacten voor ${selectedCompany?.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          
          {step === 'title' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-2">Project / Offerte Titel</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Bijv. Nieuwe Website & Branding 2026"
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && quoteTitle.trim()) setStep('select_company'); }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-[#1e293b] focus:outline-none focus:border-[#7b68ee] focus:ring-1 focus:ring-[#7b68ee]"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  disabled={!quoteTitle.trim()}
                  onClick={() => setStep('select_company')}
                  className="px-6 py-2.5 bg-[#7b68ee] text-white text-sm font-semibold rounded-lg hover:bg-[#6a5ad6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Volgende <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'select_company' && (
            <div className="space-y-4">
              {mode === 'new_quote' && (
                <button 
                  onClick={() => setStep('title')}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1e293b] mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Terug naar titel
                </button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Zoek bedrijf..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:border-[#7b68ee] focus:ring-1 focus:ring-[#7b68ee]"
                />
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-sm text-slate-500">Bedrijven laden uit Teamleader...</div>
              ) : (
                <div className="space-y-2">
                  {filteredCompanies.map(comp => (
                    <div
                      key={comp.id}
                      onClick={() => handleSelectCompany(comp)}
                      className="p-4 bg-white border border-slate-200 rounded-lg hover:border-[#7b68ee] cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-[#1e293b] text-sm">{comp.name}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {comp.primary_address ? `${comp.primary_address.city}, ${comp.primary_address.country}` : 'Geen adres'}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#7b68ee]" />
                    </div>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-500">Geen bedrijven gevonden.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'select_contact' && (
            <div className="space-y-4">
              <button 
                onClick={() => setStep('select_company')}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1e293b] mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Terug naar bedrijven
              </button>

              {isLoading ? (
                <div className="py-8 text-center text-sm text-slate-500">Contactpersonen laden...</div>
              ) : (
                <div className="space-y-2">
                  {contacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => handleSelectContact(contact)}
                      className="p-4 bg-white border border-slate-200 rounded-lg hover:border-[#7b68ee] cursor-pointer transition-all flex flex-col gap-2"
                    >
                      <div className="font-bold text-[#1e293b] text-sm">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        {contact.emails && contact.emails.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.emails[0].email}
                          </span>
                        )}
                        {contact.telephones && contact.telephones.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.telephones[0].number}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div
                    onClick={() => handleSelectContact(null)}
                    className="p-4 bg-white border border-slate-200 border-dashed rounded-lg hover:border-[#7b68ee] hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-center"
                  >
                    <span className="text-sm font-semibold text-slate-500">Geen specifieke contactpersoon selecteren</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
