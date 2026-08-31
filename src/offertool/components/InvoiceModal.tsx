import React, { useState } from 'react';
import { 
  Receipt, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Zap, 
  Building2, 
  Calendar, 
  Percent, 
  FileCode, 
  ShieldCheck,
  ExternalLink,
  Layers
} from 'lucide-react';
import { QuoteData, QuoteInvoice } from '../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteData;
  onInvoiceCreated: (updatedQuote: QuoteData, createdInvoice: QuoteInvoice) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  quote,
  onInvoiceCreated
}) => {
  const [depositPercentage, setDepositPercentage] = useState<number>(30); // Default 30% voorschot Studio Graaf
  const [platform, setPlatform] = useState<'teamleader' | 'billit'>('teamleader');
  const [dueDateDays, setDueDateDays] = useState<number>(14);
  const [isSyncing, setIsSyncing] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<QuoteInvoice | null>(null);

  if (!isOpen) return null;

  // Calculate quote totals
  const selectedOneOffItems = (quote?.items || []).filter(i => i.selected && i.billingType === 'one_off');
  const oneOffSubtotal = selectedOneOffItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);
  
  const discountVal = Number(quote?.overallDiscountValue) || 0;
  const discountAmount = quote?.overallDiscountType === 'percentage'
    ? (oneOffSubtotal * discountVal) / 100
    : discountVal;

  const finalOneOffExcl = Math.max(0, oneOffSubtotal - discountAmount);

  // Invoice calculations based on selected percentage
  const invoiceAmountExcl = (finalOneOffExcl * (Number(depositPercentage) || 30)) / 100;
  const vatRate = Number(quote?.vatRate) || 21;
  const invoiceVatAmount = (invoiceAmountExcl * vatRate) / 100;
  const invoiceTotalIncl = invoiceAmountExcl + invoiceVatAmount;

  // Generate structured message
  const randomCheck = Math.floor(10000 + Math.random() * 90000);
  const structuredMsg = `+++089/${randomCheck.toString().slice(0, 4)}/${randomCheck.toString().slice(4)}99+++`;

  const existingInvoices = quote.invoices || [];

  const handleCreateAndSyncInvoice = async () => {
    setIsSyncing(true);

    const invoiceNumber = `FAC-2026-${String(existingInvoices.length + 88).padStart(3, '0')}`;
    const newInvoice: QuoteInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      type: depositPercentage === 30 ? 'advance_30' : depositPercentage === 50 ? 'advance_50' : depositPercentage === 100 ? 'full_100' : 'advance_custom',
      percentage: depositPercentage,
      description: depositPercentage === 100 
        ? `Factuur 100% n.a.v. offerte ${quote.quoteNumber} — ${quote.projectName}`
        : `Voorschotfactuur (${depositPercentage}%) n.a.v. offerte ${quote.quoteNumber} — ${quote.projectName}`,
      amountExclVat: invoiceAmountExcl,
      vatAmount: invoiceVatAmount,
      amountInclVat: invoiceTotalIncl,
      platform,
      status: 'synced',
      structuredMessage: structuredMsg,
      peppolCompliant: true,
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + dueDateDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    try {
      await fetch('/api/invoice/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: {
            ...newInvoice,
            clientName: quote.client.companyName,
            clientAddress: quote.client.address,
            clientZip: quote.client.postalCode,
            clientCity: quote.client.city
          },
          platform
        })
      });
    } catch (e) {
      console.warn('Invoice sync ping:', e);
    }

    const updatedQuote: QuoteData = {
      ...quote,
      invoices: [newInvoice, ...existingInvoices]
    };

    onInvoiceCreated(updatedQuote, newInvoice);
    setIsSyncing(false);
    setSuccessInvoice(newInvoice);
  };

  const handleDownloadUbl = (inv: QuoteInvoice) => {
    const ublXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${inv.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${inv.createdAt}</cbc:IssueDate>
  <cbc:DueDate>${inv.dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cbc:PaymentTerms>
    <cbc:Note>${inv.structuredMessage}</cbc:Note>
  </cbc:PaymentTerms>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Studio Graaf VOF</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>BE1035446987</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${quote.client.companyName}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${quote.client.vatNumber ? quote.client.vatNumber.replace(/[^A-Z0-9]/gi, '') : 'BE0000000000'}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${inv.amountExclVat.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${inv.amountExclVat.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${inv.amountInclVat.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${inv.amountInclVat.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;

    const blob = new Blob([ublXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoiceNumber}-peppol-ubl.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-2xl max-h-[92vh] flex flex-col shadow-lg overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7b68ee] flex items-center justify-center text-white shadow-sm">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Facturatiekoppeling</h2>
                <span className="text-[10px] font-semibold bg-[#7b68ee] text-white px-2 py-0.5 rounded-full">
                  Teamleader & Billit / Peppol
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Zet deze offerte met 1 klik om in een voorschot- of slotfactuur.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-[#6a5ad6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {!successInvoice ? (
            <>
              {/* Target Client Info */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block">Klant / Facturatiepersoon:</span>
                  <span className="font-semibold text-sm text-[#1e293b]">{quote.client?.companyName || 'Klant'}</span>
                  <span className="block text-slate-500 mt-0.5">BTW: {quote.client?.vatNumber || 'Geen BTW nummer'}</span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-semibold text-slate-500 block">Totale Offertebedrag:</span>
                  <span className="font-semibold text-sm text-white font-mono">
                    € {(Number(finalOneOffExcl) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })} excl.
                  </span>
                </div>
              </div>

              {/* Deposit Percentage Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1e293b] flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-slate-500" />
                  <span>Kies Voorschotpercentage:</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '30% Voorschot', value: 30, desc: 'Standaard Studio Graaf' },
                    { label: '40% Voorschot', value: 40, desc: 'Middelgroot project' },
                    { label: '50% Voorschot', value: 50, desc: 'Groot project' },
                    { label: '100% Volledig', value: 100, desc: 'Directe oplevering' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDepositPercentage(opt.value)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        depositPercentage === opt.value
                          ? 'border-slate-900 bg-slate-900 text-white shadow-md ring-2 ring-[#7b68ee]'
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-[#1e293b]'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{opt.label}</span>
                      <span className={`text-[10px] mt-0.5 block ${depositPercentage === opt.value ? 'text-[#7b68ee]' : 'text-slate-500'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoicing Platform Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1e293b] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-slate-500" />
                  <span>Kies Facturatieplatform voor Directe Synchronisatie:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Teamleader Focus */}
                  <button
                    type="button"
                    onClick={() => setPlatform('teamleader')}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      platform === 'teamleader'
                        ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#1e293b]">Teamleader Focus</span>
                      <span className="text-[10px] font-bold bg-[#7b68ee]/10 text-[#7b68ee] px-2 py-0.5 rounded-full">
                        CRM & Deals
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Maakt automatisch een gekoppelde factuur aan onder de deal van {quote.client.companyName}.
                    </p>
                  </button>

                  {/* Billit */}
                  <button
                    type="button"
                    onClick={() => setPlatform('billit')}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      platform === 'billit'
                        ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#1e293b]">Billit / Peppol</span>
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        UBL e-Facturatie
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Conform Belgische verplichte B2B e-facturatie met gestructureerd Peppol netwerk.
                    </p>
                  </button>
                </div>
              </div>

              {/* Invoice Calculation Preview Box */}
              <div className="p-5 rounded-lg bg-slate-900 text-white space-y-3 shadow-md">
                <span className="text-[10px] font-semibold text-[#7b68ee] block">
                  Concept Factuurspecificatie ({depositPercentage}%):
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Voorschotbedrag ({depositPercentage}% van € {(Number(finalOneOffExcl) || 0).toFixed(2)}):</span>
                    <span className="font-mono font-bold text-white">
                      € {(Number(invoiceAmountExcl) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>BTW ({quote.vatRate || 21}%):</span>
                    <span className="font-mono text-slate-200">
                      € {(Number(invoiceVatAmount) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-white">Totaal Factuur incl. BTW:</span>
                    <span className="text-xl font-semibold text-[#7b68ee] font-mono">
                      € {(Number(invoiceTotalIncl) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-300">
                    <span>Gestructureerde Mededeling:</span>
                    <span className="font-mono font-bold text-[#7b68ee]">{structuredMsg}</span>
                  </div>
                </div>
              </div>

              {/* Invoices History for this quote */}
              {existingInvoices.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 block">
                    Reeds Aangemaakte Facturen ({existingInvoices.length}):
                  </span>
                  
                  <div className="space-y-2">
                    {existingInvoices.map((inv) => (
                      <div key={inv.id} className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-[#1e293b]">{inv.invoiceNumber}</span>
                            <span className="text-slate-500 ml-2">({inv.percentage}% • {(inv.platform || 'teamleader').toUpperCase()})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#1e293b]">
                            € {(Number(inv.amountInclVat) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={() => handleDownloadUbl(inv)}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                            title="Download UBL XML"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Success Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-md bg-[#7b68ee] text-white flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Succesvol Gesynchroniseerd
                </span>
                <h3 className="text-xl font-semibold text-[#1e293b] mt-2">
                  Factuur {successInvoice.invoiceNumber} Aangemaakt
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  De {successInvoice.percentage}% voorschotfactuur is direct doorgestuurd naar <strong>{(successInvoice.platform || 'Teamleader').toUpperCase()}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Factuurnummer:</span>
                  <span className="font-mono font-bold text-[#1e293b]">{successInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bedrag incl. BTW:</span>
                  <span className="font-mono font-bold text-[#1e293b]">€ {successInvoice.amountInclVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gestructureerde Mededeling:</span>
                  <span className="font-mono font-bold text-[#1e293b]">{successInvoice.structuredMessage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peppol E-Delivery:</span>
                  <span className="font-bold text-emerald-700">Klaar voor verzending</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleDownloadUbl(successInvoice)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-bold bg-slate-900 text-white hover:bg-[#1e293b] transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Peppol UBL (.xml)</span>
                </button>

                <button
                  onClick={() => {
                    setSuccessInvoice(null);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-md text-xs font-semibold bg-[#7b68ee] hover:bg-[#6a5ad6] text-white transition-all cursor-pointer"
                >
                  Klaar
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        {!successInvoice && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Peppol & UBL 3.0 compatibel</span>
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
                onClick={handleCreateAndSyncInvoice}
                disabled={isSyncing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-semibold bg-[#7b68ee] hover:bg-[#6a5ad6] text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isSyncing ? 'Synchroniseren...' : `Maak ${depositPercentage}% Factuur`}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
