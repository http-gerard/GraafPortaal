import React from 'react';
import { QuoteData } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  FileDown, 
  Presentation, 
  CheckCircle2,
  Check, 
  ShieldCheck, 
  Receipt, 
  Activity, 
  PenTool,
  Sparkles
} from 'lucide-react';

interface QuotePreviewProps {
  quote: QuoteData;
  onExportPdf: () => void;
  onExportPptx: () => void;
  onPrint: () => void;
  onAcceptQuote: () => void;
  onOpenSignatureModal?: () => void;
  onOpenInvoiceModal?: () => void;
  isExportingPdf: boolean;
  isExportingPptx: boolean;
}

const cleanCategoryName = (name?: string): string => {
  if (!name) return '';
  return name.replace(/^\d+\.\s*/, '').trim();
};

export const QuotePreview: React.FC<QuotePreviewProps> = ({
  quote,
  onExportPdf,
  onExportPptx,
  onOpenSignatureModal,
  onOpenInvoiceModal,
  isExportingPdf,
  isExportingPptx
}) => {
  // Active categories
  const activeCategories = (quote.categories || []).filter(cat =>
    quote.items.some(item => item.categoryId === cat.id && item.selected)
  );

  // Calculations
  const selectedItems = (quote.items || []).filter(i => i.selected);
  const oneOffItems = selectedItems.filter(i => i.billingType === 'one_off');
  const monthlyItems = selectedItems.filter(i => i.billingType === 'monthly');
  const yearlyItems = selectedItems.filter(i => i.billingType === 'yearly');

  const oneOffSubtotal = oneOffItems.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0);
  const monthlySubtotal = monthlyItems.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0);
  const yearlySubtotal = yearlyItems.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0);

  const discountVal = quote.overallDiscountValue || 0;
  const discountAmount = quote.overallDiscountType === 'percentage'
    ? (oneOffSubtotal * discountVal) / 100
    : discountVal;

  const finalOneOff = Math.max(0, oneOffSubtotal - discountAmount);
  const vatRate = quote.vatRate || 21;
  const vatAmount = (finalOneOff * vatRate) / 100;
  const totalInclVat = finalOneOff + vatAmount;

  const isSigned = !!quote.digitalSignature || quote.status === 'akkoord';

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
      
      {/* Action Bar Above Preview with Quick Actions */}
      <div className="no-print bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Document Weergave:</span>
          {isSigned ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Digitaal Ondertekend</span>
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              {selectedItems.length} geselecteerde diensten
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">

          {/* Invoice button */}
          {onOpenInvoiceModal && (
            <button
              onClick={onOpenInvoiceModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all cursor-pointer"
              title="Zet om in voorschotfactuur via Teamleader of Billit"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Factuur (Voorschot)</span>
            </button>
          )}

          {/* Digital Signature button */}
          {onOpenSignatureModal && (
            <button
              onClick={onOpenSignatureModal}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isSigned 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-[#7b68ee] text-white hover:bg-[#6a5ad6] shadow-xs'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isSigned ? 'Handtekening Bekijken' : 'Digitaal Ondertekenen'}</span>
            </button>
          )}

          <button
            onClick={onExportPptx}
            disabled={isExportingPptx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <Presentation className="w-3.5 h-3.5 text-orange-600" />
            <span>{isExportingPptx ? 'Laden...' : 'PowerPoint (.pptx)'}</span>
          </button>

          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'PDF Genereren...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Styled Printable Proposal Canvas (High Contrast Clean Look for Client) */}
      <div 
        id="quote-printable-document" 
        className="bg-white text-[#1e293b] rounded-md shadow-xl overflow-hidden border border-slate-200 print:border-none print:shadow-none p-8 sm:p-14 space-y-8"
      >
        
        {/* Top Decorative Brand Bar */}
        <div className="h-2.5 -mx-8 sm:-mx-14 -mt-8 sm:-mt-14 bg-[#7b68ee]" />

        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <BrandLogo size="lg" theme="light" />

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <p className="font-semibold text-[#1e293b]">Studio Graaf VOF</p>
            <p>Maaiwanters 10, 2230 Herselt</p>
            <p>BTW: BE 1035.446.987</p>
            <p className="text-[#1e293b] font-semibold">warre@studio-graaf.be • www.studio-graaf.be</p>
          </div>
        </div>

        {/* Client Details & Quote Metadata Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
          {/* Left: Client info */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] font-semibold text-slate-500 block">
              Offerte Bestemd Voor:
            </span>
            <h3 className="text-base font-semibold text-[#1e293b]">{quote.client.companyName}</h3>
            <p className="text-[#1e293b] font-medium">T.a.v. {quote.client.contactPerson} {quote.client.jobTitle ? `(${quote.client.jobTitle})` : ''}</p>
            <p className="text-slate-500">{quote.client.address}</p>
            <p className="text-slate-500">{quote.client.postalCode} {quote.client.city}, {quote.client.country}</p>
            <p className="font-mono text-slate-500 pt-1">
              BTW: {quote.client.vatNumber || 'Niet gespecificeerd'} • {quote.client.email}
            </p>
          </div>

          {/* Right: Quote Metadata */}
          <div className="space-y-2 text-xs md:border-l md:border-slate-200 md:pl-6">
            <span className="text-[10px] font-semibold text-slate-500 block">
              Offerte Specificaties:
            </span>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Offertenummer:</span>
                <span className="font-semibold font-mono text-[#1e293b]">{quote.quoteNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Offertedatum:</span>
                <span className="font-bold text-[#1e293b]">{quote.createdAt}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Geldigheidsduur:</span>
                <span className="font-bold text-[#1e293b]">{quote.validUntil}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Contactpersoon:</span>
                <span className="font-bold text-[#1e293b]">{quote.salesRepresentative.name}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-500">Status: </span>
              <span className={`inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-0.5 rounded-full border ${
                (quote.status || 'concept') === 'akkoord'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-[#1e293b] border-slate-200'
              }`}>
                {(quote.status || 'concept').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: SPECIFICATION OF SERVICES & PRICING TABLE */}
        <div className="space-y-4 pt-2 page-break-inside-avoid">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="w-6 h-6 rounded-full bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center text-xs font-semibold">
              1
            </span>
            <h3 className="text-base font-semibold text-[#1e293b]">
              Specificatie van Geselecteerde Diensten
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900">
                  <th className="py-3 px-3 font-semibold">Dienst / Onderdeel</th>
                  <th className="py-3 px-3 font-semibold">Omschrijving & Scope</th>
                  <th className="py-3 px-3 font-semibold text-center">Aantal</th>
                  <th className="py-3 px-3 font-semibold text-right">Prijs excl.</th>
                  <th className="py-3 px-3 font-semibold text-right">Totaal excl.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E9EB]">
                {activeCategories.map((cat) => {
                  const catItems = quote.items.filter(i => i.categoryId === cat.id && i.selected);
                  if (catItems.length === 0) return null;

                  return (
                    <React.Fragment key={cat.id}>
                      <tr className="bg-slate-50 font-semibold text-[#1e293b]">
                        <td colSpan={5} className="py-2.5 px-3">
                          <span className="text-[11px]">{cleanCategoryName(cat.name)}</span>
                        </td>
                      </tr>

                      {catItems.map((item) => {
                        const itemPrice = Number(item.price) || 0;
                        const itemQty = Number(item.quantity) || 1;
                        const lineTotal = itemPrice * itemQty;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3 font-bold text-[#1e293b] align-top">
                              {item.name}
                              {item.billingType === 'monthly' && (
                                <span className="block text-[10px] text-amber-800 font-bold mt-0.5">
                                  Maandelijkse Service (SLA)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600 align-top">
                              {item.shortDescription && (
                                <p className="text-[#1e293b] font-medium leading-relaxed mb-1.5">{item.shortDescription}</p>
                              )}
                              {item.detailedScope && item.detailedScope.length > 0 && (
                                <div className="space-y-1">
                                  {item.detailedScope.filter(Boolean).map((sc, si) => (
                                    <div key={si} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-snug">
                                      <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                      <span>{sc}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center text-[#1e293b] align-top font-bold">
                              {itemQty} {item.billingType === 'yearly' && (item.unit === 'mnd' || item.unit === 'maand') ? 'jr' : item.billingType === 'monthly' && (item.unit === 'jr' || item.unit === 'jaar') ? 'mnd' : item.unit || 'project'}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-500 align-top font-mono font-medium">
                              € {itemPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-[#1e293b] align-top font-mono">
                              € {lineTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                              {item.billingType === 'monthly' ? ' / mnd' : item.billingType === 'yearly' ? ' / jr' : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: INVESTMENT BREAKDOWN & PAYMENT TERMS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 page-break-inside-avoid">
          
          {/* Left: Payment terms & SLA terms */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-semibold text-[#1e293b] block text-[11px]">
                Betalingsvoorwaarden & Facturatie:
              </span>
              <p className="text-slate-500 leading-relaxed">
                {quote.paymentTerms}
              </p>
            </div>

            
            {yearlySubtotal > 0 && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-semibold text-slate-900 block text-[11px]">
                  Jaarlijkse Service (SLA / Licenties):
                </span>
                <p className="text-[#1e293b] leading-relaxed font-medium">
                  Het jaarlijkse bedrag van <strong>€ {yearlySubtotal.toFixed(2)} excl. BTW</strong> start na oplevering.
                </p>
              </div>
            )}
{monthlySubtotal > 0 && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-semibold text-slate-900 block text-[11px]">
                  Maandelijks Hosting & Onderhoudscontract:
                </span>
                <p className="text-[#1e293b] leading-relaxed font-medium">
                  Het maandelijkse SLA bedrag van <strong>€ {monthlySubtotal.toFixed(2)} excl. BTW</strong> start na oplevering en acceptatie van het hoofdproject.
                </p>
              </div>
            )}
          </div>

          {/* Right: Calculations Summary Box */}
          <div className="md:col-span-5 bg-slate-900 text-white p-6 rounded-md space-y-3 shadow-lg">
            <span className="text-[10px] font-semibold text-[#7b68ee] block">
              Investeringssamenvatting
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotaal Eenmalig:</span>
                <span className="font-mono font-semibold text-white">
                  € {oneOffSubtotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {quote.overallDiscountValue > 0 && (
                <div className="flex justify-between text-[#7b68ee]">
                  <span>Korting ({quote.overallDiscountValue}%):</span>
                  <span className="font-mono font-bold">
                    - € {discountAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>BTW ({quote.vatRate}%):</span>
                <span className="font-mono text-slate-200">
                  € {vatAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-700">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-white">
                    Totaal Eenmalig (incl. BTW):
                  </span>
                  <span className="text-2xl font-semibold text-[#7b68ee] font-mono">
                    € {totalInclVat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block text-right">
                  (€ {finalOneOff.toLocaleString('nl-NL', { minimumFractionDigits: 2 })} excl. BTW)
                </span>
              </div>

              
            {yearlySubtotal > 0 && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-semibold text-slate-900 block text-[11px]">
                  Jaarlijkse Service (SLA / Licenties):
                </span>
                <p className="text-[#1e293b] leading-relaxed font-medium">
                  Het jaarlijkse bedrag van <strong>€ {yearlySubtotal.toFixed(2)} excl. BTW</strong> start na oplevering.
                </p>
              </div>
            )}
{monthlySubtotal > 0 && (
                <div className="pt-3 border-t border-slate-700 flex justify-between items-center text-[#7b68ee]">
                  <span className="text-xs font-bold text-white">Doorlopend / Maand:</span>
                  <span className="text-sm font-semibold font-mono">
                    € {monthlySubtotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })} / mnd
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* SECTION 3: CATEGORY VALUE EXPLANATIONS (MEERWAARDE) */}
        <div className="space-y-4 pt-4 page-break-inside-avoid">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="w-6 h-6 rounded-full bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center text-xs font-semibold">
              2
            </span>
            <h3 className="text-base font-semibold text-[#1e293b]">
              Strategische Meerwaarde & Aanpak per Categorie
            </h3>
          </div>

          <div className="space-y-4">
            {activeCategories.map((cat) => (
              <div key={cat.id} className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cat.color || '#7b68ee' }} 
                  />
                  <h4 className="text-sm font-semibold text-[#1e293b]">
                    {cleanCategoryName(cat.name)}
                  </h4>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {(cat.valueProposition?.description || "")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  {(cat.valueProposition?.businessImpacts || []).map((impact, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[#1e293b]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: TIMELINE ROADMAP */}
        <div className="space-y-4 pt-4 page-break-inside-avoid">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="w-6 h-6 rounded-full bg-[#7b68ee]/10 text-[#7b68ee] flex items-center justify-center text-xs font-semibold">
              3
            </span>
            <h3 className="text-base font-semibold text-[#1e293b]">
              Tijdlijn & Fasering
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(quote.timelinePhases || []).map((phase) => (
              <div key={phase.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1e293b] bg-white border border-slate-200 px-2 py-0.5 rounded">
                    Fase {phase.phaseNumber}
                  </span>
                  <span className="font-mono font-bold text-slate-500 text-[11px]">{phase.duration}</span>
                </div>
                <h5 className="font-semibold text-[#1e293b]">{phase.title}</h5>
                <p className="text-slate-500 leading-relaxed">{phase.description}</p>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  {(phase.deliverables || []).map((d, i) => (
                    <p key={i} className="text-[11px] text-[#1e293b] font-medium flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> <span>{d}</span></p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: SIGNATURE & ACCEPTANCE */}
        <div className="space-y-4 pt-4 page-break-inside-avoid">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="w-6 h-6 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-xs font-semibold">
              4
            </span>
            <h3 className="text-base font-semibold text-[#1e293b]">
              Akkoordverklaring & Handtekening
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Studio Graaf Signature Box */}
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-4">
              <span className="font-semibold text-[#1e293b] block text-[11px]">
                Voor akkoord namens Studio Graaf VOF:
              </span>
              <div className="space-y-2 text-[#1e293b]">
                <p className="font-bold">Bedrijf: <span className="font-normal text-slate-500">Studio Graaf VOF</span></p>
                <p className="font-bold">Naam: <span className="font-normal text-slate-500">Warre Geerts</span></p>
                <p className="font-bold">Datum: <span className="font-normal text-slate-500">{quote.createdAt}</span></p>
              </div>

              <div className="pt-6 border-t border-dashed border-slate-300">
                <div className="text-slate-500 text-[11px]">
                  Handtekening:
                  <div className="h-14 mt-2 border-b border-[#1e293b]/30 flex items-end pb-1 text-slate-400 italic text-[11px]">
                    (Handtekening Warre Geerts)
                  </div>
                </div>
              </div>
            </div>

            {/* Client Signature Box */}
            <div className={`p-6 rounded-lg text-xs space-y-4 border transition-all ${
              quote.digitalSignature
                ? 'bg-emerald-50/60 border-emerald-300'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1e293b] block text-[11px]">
                  Voor akkoord namens {quote.client.companyName}:
                </span>
                {quote.digitalSignature && (
                  <span className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Gevalideerd
                  </span>
                )}
              </div>

              {quote.digitalSignature ? (
                <div className="space-y-3 text-[#1e293b]">
                  <div className="space-y-1">
                    <p className="font-bold">Ondertekenaar: <span className="font-normal text-slate-500">{quote.digitalSignature.signedBy} ({quote.digitalSignature.jobTitle})</span></p>
                    <p className="font-bold">E-mail: <span className="font-normal text-slate-500">{quote.digitalSignature.email}</span></p>
                    <p className="font-bold">Tijdstip: <span className="font-normal text-slate-500">{quote.digitalSignature.signedAt}</span></p>
                  </div>

                  <div className="pt-3 border-t border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 block mb-1">Digitale Handtekening:</span>
                    {quote.digitalSignature.signatureImage?.startsWith('data:image') ? (
                      <div className="h-14 bg-white p-2 rounded-md border border-emerald-200 flex items-center justify-center">
                        <img 
                          src={quote.digitalSignature.signatureImage} 
                          alt="Handtekening" 
                          className="max-h-full object-contain" 
                        />
                      </div>
                    ) : (
                      <div className="h-14 bg-white px-4 rounded-md border border-emerald-200 flex items-center font-serif italic text-lg text-slate-900">
                        {quote.digitalSignature.signedBy}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2 text-[#1e293b]">
                    <p className="font-bold">Bedrijf: <span className="font-normal text-slate-500">{quote.client.companyName}</span></p>
                    <p className="font-bold">Naam: <span className="font-normal text-slate-500">{quote.client.contactPerson}</span></p>
                    <p className="font-bold">Datum: <span className="font-normal text-slate-500">.....................................................</span></p>
                  </div>

                  <div className="pt-6 border-t border-dashed border-slate-300">
                    <div className="text-slate-500 text-[11px]">
                      Handtekening:
                      <div className="h-14 mt-2 border-b border-[#1e293b]/30 flex items-end pb-1 text-slate-400 italic text-[11px]">
                        (Handtekening {quote.client.contactPerson})
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
          Studio Graaf VOF • Algemene Voorwaarden van toepassing • Bedankt voor het vertrouwen in ons team
        </div>

      </div>

    </div>
  );
};

