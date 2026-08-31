import React, { useState } from 'react';
import { QuoteData, ServiceCategory, ServiceItem } from '../types';
import { CategoryValueExplainer } from './CategoryValueExplainer';
import { 
  Sparkles, 
  Layers, 
  Tag, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface CatalogManagerProps {
  quote: QuoteData;
  onUpdateQuote: (quote: QuoteData) => void;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  quote,
  onUpdateQuote
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(quote.categories[0]?.id || '');

  const selectedCategory = quote.categories.find(c => c.id === selectedCatId);
  const itemsInCat = quote.items.filter(i => i.categoryId === selectedCatId);

  const handleUpdateCategory = (updatedCat: ServiceCategory) => {
    const updated = quote.categories.map(c => c.id === updatedCat.id ? updatedCat : c);
    onUpdateQuote({ ...quote, categories: updated });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-base font-semibold text-white">Catalogus & Meerwaarde Beheer</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Beheer de strategische waarde-uitleg en standaardprijzen van de Studio Graaf dienstencatalogus.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7b68ee]" />
          <span>{quote.categories.length} Categorieën • {quote.items.length} Diensten</span>
        </div>
      </div>

      {/* Category Picker Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {quote.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCatId(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap border cursor-pointer ${
              selectedCatId === cat.id
                ? 'bg-[#7b68ee]/10 text-[#7b68ee] border-[#7b68ee] shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: selectedCatId === cat.id ? '#7b68ee' : (cat.color || 'slate-900') }} 
            />
            <span>{cat.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
              selectedCatId === cat.id ? 'bg-[#1e293b] text-[#7b68ee] border-[#3F444D]' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              {quote.items.filter(i => i.categoryId === cat.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Category Details */}
      {selectedCategory && (
        <div className="space-y-6">
          {/* Explainer / Value Proposition Editor */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Strategische Meerwaarde Uitleg voor {selectedCategory.name}
            </h4>
            <CategoryValueExplainer
              category={selectedCategory}
              onUpdateCategory={handleUpdateCategory}
            />
          </div>

          {/* Services list in this category */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              Standaard Diensten in deze Categorie ({itemsInCat.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itemsInCat.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 p-4 rounded-md border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="text-sm font-semibold text-white">{item.name}</h5>
                      <span className="text-xs font-mono font-semibold text-white bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                        € {(Number(item.price) || 0).toLocaleString('nl-NL')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">{item.shortDescription}</p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono font-bold text-white">{item.code || 'CODE'}</span>
                    <span className="font-semibold">{item.billingType === 'monthly' ? 'Maandelijks (SLA)' : 'Eenmalig'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
