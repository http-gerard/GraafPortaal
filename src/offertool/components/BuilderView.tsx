import React, { useState } from 'react';
import { QuoteData, ServiceCategory, ServiceItem, BillingType } from '../types';
import { CategoryValueExplainer } from './CategoryValueExplainer';
import { 
  Check, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Building2,
  Percent,
  Calendar,
  PenTool,
  Receipt,
  Activity,
  CheckCircle2,
  X,
  ListPlus
} from 'lucide-react';

interface BuilderViewProps {
  quote: QuoteData;
  onUpdateQuote: (quote: QuoteData) => void;
  onOpenTeamleader: () => void;
  onOpenSignatureModal?: () => void;
  onOpenInvoiceModal?: () => void;
}

export const BuilderView: React.FC<BuilderViewProps> = ({
  quote,
  onUpdateQuote,
  onOpenTeamleader,
  onOpenSignatureModal,
  onOpenInvoiceModal,
}) => {
  const [explainerOpenCategoryId, setExplainerOpenCategoryId] = useState<string | null>(null);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Custom Service Drawer/Modal State
  const [isAddingServiceToCat, setIsAddingServiceToCat] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(750);
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceBilling, setNewServiceBilling] = useState<BillingType>('one_off');
  const [newServiceUnit, setNewServiceUnit] = useState('pakket');

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleToggleItem = (itemId: string) => {
    const updatedItems = quote.items.map(item =>
      item.id === itemId ? { ...item, selected: !item.selected } : item
    );
    onUpdateQuote({ ...quote, items: updatedItems });
  };

  const handleUpdateItem = (itemId: string, updates: Partial<ServiceItem>) => {
    const updatedItems = quote.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    onUpdateQuote({ ...quote, items: updatedItems });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = quote.items.filter(item => item.id !== itemId);
    onUpdateQuote({ ...quote, items: updatedItems });
  };

  const handleAddCustomService = (categoryId: string) => {
    if (!newServiceName.trim()) return;

    const newItem: ServiceItem = {
      id: `custom-srv-${Date.now()}`,
      categoryId,
      name: newServiceName,
      code: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      shortDescription: newServiceDesc || 'Aanvullende maatwerkdienst conform klantvraag.',
      detailedScope: ['Op maat uitgewerkte oplevering', 'Inclusief revisieronde'],
      deliverables: ['Gereed product / dienst'],
      billingType: newServiceBilling,
      defaultPrice: Number(newServicePrice) || 0,
      price: Number(newServicePrice) || 0,
      quantity: 1,
      unit: newServiceUnit || 'stuk',
      selected: true,
      isCustom: true
    };

    onUpdateQuote({ ...quote, items: [...quote.items, newItem] });
    setIsAddingServiceToCat(null);
    setNewServiceName('');
    setNewServiceDesc('');
    setNewServicePrice(750);
  };

  const handleUpdateCategoryValueProp = (updatedCat: ServiceCategory) => {
    const updatedCategories = quote.categories.map(c =>
      c.id === updatedCat.id ? updatedCat : c
    );
    onUpdateQuote({ ...quote, categories: updatedCategories });
  };

  // Calculations
  const selectedItems = (quote.items || []).filter(i => i.selected);
  const oneOffItems = selectedItems.filter(i => i.billingType === 'one_off');
  const monthlyItems = selectedItems.filter(i => i.billingType === 'monthly');

  const oneOffSubtotal = oneOffItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);
  const monthlySubtotal = monthlyItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);

  const discountVal = Number(quote.overallDiscountValue) || 0;
  const discountAmount = quote.overallDiscountType === 'percentage'
    ? (oneOffSubtotal * discountVal) / 100
    : discountVal;

  const finalOneOff = Math.max(0, oneOffSubtotal - discountAmount);
  const vatRate = Number(quote.vatRate) || 21;
  const vatAmount = (finalOneOff * vatRate) / 100;
  const totalInclVat = finalOneOff + vatAmount;

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-5 space-y-5">
      
      {/* Slim, Clean Project Info Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Project title & Client */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quote.projectName}
                onChange={(e) => onUpdateQuote({ ...quote, projectName: e.target.value })}
                className="text-lg sm:text-xl font-semibold text-[#1e293b] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#7b68ee] focus:ring-1 focus:ring-[#7b68ee]/30 focus:bg-slate-50 px-1 py-0.5 rounded transition-all w-full max-w-xl focus:outline-none"
                placeholder="Projectnaam..."
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-white" />
                <span>Klant: <strong className="text-[#1e293b] font-semibold">{quote.client.companyName}</strong> ({quote.client.contactPerson})</span>
                <button
                  onClick={onOpenTeamleader}
                  className="ml-1 text-[11px] text-white hover:underline font-semibold bg-[#7b68ee]/40 px-1.5 py-0.2 rounded cursor-pointer"
                >
                  Wijzigen
                </button>
              </div>

              <span className="text-[#E8E9EB]">•</span>

              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Geldig t/m:</span>
                <input
                  type="date"
                  value={quote.validUntil}
                  onChange={(e) => onUpdateQuote({ ...quote, validUntil: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-[#1e293b] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onOpenSignatureModal && (
              <button
                onClick={onOpenSignatureModal}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  quote.digitalSignature
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-[#7b68ee] hover:bg-[#6a5ad6] text-white shadow-xs'
                }`}
                title="Laat klant digitaal ondertekenen"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{quote.digitalSignature ? 'Ondertekend' : 'Ondertekenen'}</span>
              </button>
            )}

            {onOpenInvoiceModal && (
              <button
                onClick={onOpenInvoiceModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                title="Zet om in voorschotfactuur via Teamleader of Billit"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Factuur</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Clean Service Lists (8 of 12 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500">Diensten & Modules ({quote.categories.length} categorieën)</span>
            <button
              onClick={() => {
                const allExpanded = quote.categories.every(c => expandedCategories[c.id]);
                const nextState: Record<string, boolean> = {};
                quote.categories.forEach(c => {
                  nextState[c.id] = !allExpanded;
                });
                setExpandedCategories(nextState);
              }}
              className="text-[11px] font-bold text-white hover:underline cursor-pointer"
            >
              {quote.categories.every(c => expandedCategories[c.id]) ? 'Alles inklappen' : 'Alles uitklappen'}
            </button>
          </div>

          {quote.categories.map((category) => {
            const isExpanded = expandedCategories[category.id] ?? false;
            const categoryItems = (quote.items || []).filter(item => item.categoryId === category.id);
            const selectedCatItems = categoryItems.filter(item => item.selected);
            
            const catTotalOneOff = selectedCatItems
              .filter(i => i.billingType === 'one_off')
              .reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);
            
            const catTotalMonthly = selectedCatItems
              .filter(i => i.billingType === 'monthly')
              .reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);

            const isExplainerOpen = explainerOpenCategoryId === category.id;

            return (
              <div
                key={category.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs"
              >
                {/* Clean Category Header */}
                <div 
                  onClick={() => toggleCategory(category.id)}
                  className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  
                  {/* Left: Title & Selected count */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1 rounded-lg text-slate-500">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>

                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: category.color || '#7b68ee' }}
                    />

                    <h4 className="text-sm font-semibold text-[#1e293b] truncate">
                      {category.name}
                    </h4>

                    <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                      {selectedCatItems.length}/{categoryItems.length}
                    </span>
                  </div>

                  {/* Right: Subtotal & Actions */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Category Total */}
                    <span className="text-xs font-mono font-semibold text-[#1e293b]">
                      € {(Number(catTotalOneOff) || 0).toLocaleString('nl-NL')}
                      {catTotalMonthly > 0 && <span className="text-white font-bold bg-[#7b68ee]/30 px-1 py-0.2 rounded text-[11px]"> + €{(Number(catTotalMonthly) || 0).toLocaleString('nl-NL')}/m</span>}
                    </span>

                    {/* Explainer Toggle */}
                    <button
                      onClick={() => setExplainerOpenCategoryId(isExplainerOpen ? null : category.id)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isExplainerOpen
                          ? 'bg-[#7b68ee] text-white'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Meerwaarde uitleg voor deze categorie"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    {/* Add Item */}
                    <button
                      onClick={() => setIsAddingServiceToCat(category.id)}
                      className="p-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Dienst toevoegen aan categorie"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Explainer Panel if opened */}
                {isExplainerOpen && (
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <CategoryValueExplainer
                      category={category}
                      onUpdateCategory={handleUpdateCategoryValueProp}
                    />
                  </div>
                )}

                {/* Clean, Scannable Services List */}
                {isExpanded && (
                  <div className="divide-y divide-[#E8E9EB]">
                    {categoryItems.map((item) => {
                      const itemPrice = Number(item.price) || 0;
                      const itemQty = Number(item.quantity) || 1;
                      const lineTotal = itemPrice * itemQty;

                      return (
                        <div
                          key={item.id}
                          className={`px-4 py-3 flex items-center justify-between gap-4 transition-colors group ${
                            item.selected
                              ? 'bg-white hover:bg-slate-50/60'
                              : 'bg-slate-50/40 hover:bg-slate-50 opacity-60'
                          }`}
                        >
                          {/* Left: Checkbox + Title & Description */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => handleToggleItem(item.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                item.selected
                                  ? 'bg-[#7b68ee] border-[#7b68ee] text-white shadow-xs'
                                  : 'border-slate-300 hover:border-slate-900 bg-white'
                              }`}
                            >
                              {item.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                                  placeholder="Dienstnaam..."
                                  title="Klik om dienstnaam aan te passen"
                                  className={`text-xs font-semibold bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#7b68ee] focus:ring-1 focus:ring-[#7b68ee]/30 rounded px-1.5 py-0.5 transition-all outline-none flex-1 min-w-0 ${
                                    item.selected ? 'text-[#1e293b]' : 'text-slate-500'
                                  }`}
                                />
                                {item.billingType === 'monthly' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                    Maandelijks
                                  </span>
                                )}
                                {item.isCustom && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                                    Maatwerk
                                  </span>
                                )}
                              </div>

                              <div className="relative">
                                <textarea
                                  rows={1}
                                  value={item.shortDescription || ''}
                                  placeholder="Beschrijving van deze dienst aanpassen..."
                                  title="Klik om beschrijving aan te passen"
                                  onChange={(e) => {
                                    handleUpdateItem(item.id, { shortDescription: e.target.value });
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                  }}
                                  className="w-full text-[11px] text-slate-600 focus:text-slate-900 bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#7b68ee] focus:ring-1 focus:ring-[#7b68ee]/30 rounded px-1.5 py-0.5 transition-all outline-none resize-none leading-relaxed"
                                />
                              </div>

                              {/* Detailed Scope Bullets (Editable) */}
                              <div className="pt-1 space-y-1">
                                {(item.detailedScope || []).map((scopePoint, scopeIdx) => (
                                  <div key={scopeIdx} className="flex items-center gap-1.5 group/scope">
                                    <span className="text-[11px] text-emerald-600 font-bold shrink-0">✓</span>
                                    <input
                                      type="text"
                                      value={scopePoint}
                                      placeholder="Specificatie / scope punt (bv. 5 pagina's, CMS, SEO...)"
                                      title="Klik om dit scope-punt aan te passen"
                                      onChange={(e) => {
                                        const newScope = [...(item.detailedScope || [])];
                                        newScope[scopeIdx] = e.target.value;
                                        handleUpdateItem(item.id, { detailedScope: newScope });
                                      }}
                                      className="w-full text-[10.5px] text-slate-600 focus:text-slate-900 bg-transparent hover:bg-slate-100/70 focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#7b68ee] focus:ring-1 focus:ring-[#7b68ee]/30 rounded px-1.5 py-0.5 outline-none transition-all"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newScope = (item.detailedScope || []).filter((_, idx) => idx !== scopeIdx);
                                        handleUpdateItem(item.id, { detailedScope: newScope });
                                      }}
                                      className="text-slate-300 hover:text-red-500 p-0.5 rounded opacity-0 group-hover/scope:opacity-100 transition-opacity shrink-0 cursor-pointer"
                                      title="Verwijder dit punt"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentScope = item.detailedScope || [];
                                    handleUpdateItem(item.id, { detailedScope: [...currentScope, ''] });
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7b68ee] hover:text-[#6a5ad6] hover:underline pt-0.5 cursor-pointer opacity-80 hover:opacity-100"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Scope-punt toevoegen (✓)</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right: Quantity, Price & Total */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            {/* Quantity Input */}
                            <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 px-1.5 py-0.5">
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                className="w-9 text-center bg-white border border-slate-300 rounded text-xs font-bold text-[#1e293b] focus:outline-none focus:border-[#7b68ee]"
                              />
                              <span className="text-[10px] text-slate-500 ml-1 font-medium">{item.unit}</span>
                            </div>

                            {/* Unit Price */}
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-slate-500 text-xs">€</span>
                              <input
                                type="number"
                                min={0}
                                step={50}
                                value={item.price}
                                onChange={(e) => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                                className="w-18 text-right bg-white border border-slate-300 rounded-lg py-1 px-1.5 text-xs font-bold text-[#1e293b] focus:outline-none focus:border-[#7b68ee]"
                              />
                            </div>

                            {/* Line Total */}
                            <div className="w-20 text-right font-mono">
                              <span className="text-xs font-semibold text-[#1e293b]">
                                € {(Number(lineTotal) || 0).toLocaleString('nl-NL')}
                              </span>
                            </div>

                            {/* Delete button on hover */}
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Verwijder dienst"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Custom Service Form */}
                {isAddingServiceToCat === category.id && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">
                        Dienst toevoegen aan {category.name}
                      </span>
                      <button
                        onClick={() => setIsAddingServiceToCat(null)}
                        className="text-xs text-slate-500 hover:text-[#1e293b] cursor-pointer"
                      >
                        Sluiten
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <input
                        type="text"
                        placeholder="Dienstnaam..."
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="sm:col-span-4 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-[#1e293b] focus:outline-none focus:border-[#7b68ee]"
                      />
                      <input
                        type="text"
                        placeholder="Beschrijving van de dienst..."
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="sm:col-span-4 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-[#1e293b] focus:outline-none focus:border-[#7b68ee]"
                      />
                      <input
                        type="number"
                        placeholder="Prijs €"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(parseFloat(e.target.value) || 0)}
                        className="sm:col-span-2 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-[#1e293b] focus:outline-none focus:border-[#7b68ee]"
                      />
                      <select
                        value={newServiceBilling}
                        onChange={(e) => setNewServiceBilling(e.target.value as BillingType)}
                        className="sm:col-span-2 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-[#1e293b] focus:outline-none focus:border-[#7b68ee]"
                      >
                        <option value="one_off">Eenmalig</option>
                        <option value="monthly">Maandelijks</option>
                      </select>
                      <div className="sm:col-span-12 flex justify-end">
                        <button
                          onClick={() => handleAddCustomService(category.id)}
                          className="px-4 py-1.5 bg-[#7b68ee] hover:bg-[#6a5ad6] text-white font-semibold text-xs rounded-md cursor-pointer"
                        >
                          Dienst Toevoegen
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Investeringssamenvatting (4 of 12 cols on desktop) */}
        <div className="lg:col-span-4 sticky top-20 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-xs font-semibold text-white">
                Investeringsberekening
              </h4>
              <span className="text-[11px] text-slate-500 font-bold">
                {selectedItems.length} diensten geselecteerd
              </span>
            </div>

            {/* Financial Rows */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotaal Eenmalig:</span>
                <span className="font-mono font-semibold text-[#1e293b]">
                  € {(Number(oneOffSubtotal) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Percent className="w-3 h-3 text-amber-600" /> Korting:
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={quote.overallDiscountValue || 0}
                    onChange={(e) => onUpdateQuote({ ...quote, overallDiscountValue: parseFloat(e.target.value) || 0 })}
                    className="w-14 bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-right text-xs font-semibold text-[#1e293b] focus:outline-none focus:border-[#7b68ee]"
                  />
                  <span className="text-slate-500 text-xs font-bold">%</span>
                </div>
              </div>

              {(quote.overallDiscountValue || 0) > 0 && (
                <div className="flex items-center justify-between text-red-600 text-xs font-bold">
                  <span>Kortingsbedrag:</span>
                  <span className="font-mono">- € {(Number(discountAmount) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {/* VAT Rate */}
              <div className="flex items-center justify-between text-slate-500 pt-1">
                <span className="font-semibold">BTW Tarief:</span>
                <select
                  value={quote.vatRate || 21}
                  onChange={(e) => onUpdateQuote({ ...quote, vatRate: parseInt(e.target.value) || 21 })}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-xs text-[#1e293b] font-bold"
                >
                  <option value={21}>21% BTW</option>
                  <option value={6}>6% BTW</option>
                  <option value={0}>0% BTW</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span>BTW Bedrag ({quote.vatRate || 21}%):</span>
                <span className="font-mono font-bold text-[#1e293b]">
                  € {(Number(vatAmount) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Total Highlight Box */}
            <div className="p-4 rounded-md bg-slate-900 text-white space-y-1 shadow-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-semibold text-[#7b68ee]">
                  Totaal Eenmalig (incl. BTW)
                </span>
                <span className="text-xl font-semibold text-[#7b68ee] font-mono">
                  € {(Number(totalInclVat) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right text-[11px] text-gray-400">
                (€ {(Number(finalOneOff) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })} excl. BTW)
              </div>
            </div>

            {/* Monthly Retainer */}
            {monthlySubtotal > 0 && (
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-white font-semibold block">
                    Maandelijkse Service (SLA)
                  </span>
                  <span className="text-sm font-semibold text-white font-mono">
                    € {(Number(monthlySubtotal) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })} / mnd
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">excl. BTW</span>
              </div>
            )}

            {/* Payment Terms & Terms Info */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-500">
                Betalingsvoorwaarden:
              </label>
              <textarea
                rows={2}
                value={quote.paymentTerms}
                onChange={(e) => onUpdateQuote({ ...quote, paymentTerms: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs text-[#1e293b] font-medium leading-relaxed focus:outline-none focus:border-[#7b68ee] focus:ring-1 focus:ring-[#7b68ee]/30 focus:bg-white resize-none"
                placeholder="bv. 30% bij start project, rest bij oplevering. Betaalbaar binnen 14 dagen."
              />
            </div>

          </div>

          {/* Persoonlijk Woord Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#7b68ee]" />
              Persoonlijk Woord (Klantportaal)
            </h4>
            <textarea
              rows={4}
              value={quote.customIntroMessage || ''}
              onChange={(e) => onUpdateQuote({ ...quote, customIntroMessage: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs text-[#1e293b] font-medium leading-relaxed focus:outline-none focus:border-[#7b68ee] focus:ring-1 focus:ring-[#7b68ee]/30 focus:bg-white resize-y"
              placeholder="Typ hier een persoonlijke welkomstboodschap voor in het klantenportaal..."
            />
          </div>

        </div>

      </div>

    </div>
  );
};

