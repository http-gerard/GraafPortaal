import React, { useState } from 'react';
import { ServiceCategory } from '../types';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  Edit3, 
  Check, 
  X,
  Target,
  Award
} from 'lucide-react';

interface CategoryValueExplainerProps {
  category: ServiceCategory;
  onUpdateCategory?: (updated: ServiceCategory) => void;
  isCompact?: boolean;
}

export const CategoryValueExplainer: React.FC<CategoryValueExplainerProps> = ({
  category,
  onUpdateCategory,
  isCompact = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(category.valueProposition.title);
  const [editedDescription, setEditedDescription] = useState(category.valueProposition.description);
  const [editedWhy, setEditedWhy] = useState(category.valueProposition.whyStudioGraaf);
  const [editedRoi, setEditedRoi] = useState(category.valueProposition.roiFocus);
  const [editedImpacts, setEditedImpacts] = useState<string[]>([...category.valueProposition.businessImpacts]);

  const handleSave = () => {
    if (onUpdateCategory) {
      onUpdateCategory({
        ...category,
        valueProposition: {
          ...category.valueProposition,
          title: editedTitle,
          description: editedDescription,
          whyStudioGraaf: editedWhy,
          roiFocus: editedRoi,
          businessImpacts: editedImpacts.filter(i => i.trim().length > 0)
        }
      });
    }
    setIsEditing(false);
  };

  const handleAddImpact = () => {
    setEditedImpacts([...editedImpacts, 'Nieuw voordeel voor de klant...']);
  };

  const handleRemoveImpact = (index: number) => {
    setEditedImpacts(editedImpacts.filter((_, i) => i !== index));
  };

  const handleImpactChange = (index: number, val: string) => {
    const updated = [...editedImpacts];
    updated[index] = val;
    setEditedImpacts(updated);
  };

  if (isCompact) {
    return (
      <div className="bg-white p-3.5 rounded-md border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span className="font-semibold text-white text-[11px]">
            Meerwaarde: {category.name}
          </span>
        </div>
        <p className="text-slate-500 leading-relaxed line-clamp-2">
          {category.valueProposition.description}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 relative overflow-hidden transition-all shadow-xs">
      {/* Decorative top accent line with category color */}
      <div 
        className="absolute top-0 left-0 right-0 h-1" 
        style={{ backgroundColor: category.color || '#7b68ee' }} 
      />

      {/* Header with Title & Edit Toggle */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs shadow-xs bg-[#7b68ee]/10 text-[#7b68ee]"
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7b68ee]/10 text-[#7b68ee]">
                {category.badge}
              </span>
              <span className="text-xs font-bold text-slate-500">Strategische Meerwaarde</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-semibold text-[#1e293b] focus:outline-none focus:border-slate-900"
              />
            ) : (
              <h4 className="text-sm sm:text-base font-semibold text-[#1e293b] mt-0.5">
                {category.valueProposition.title}
              </h4>
            )}
          </div>
        </div>

        {onUpdateCategory && (
          <div>
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#7b68ee] text-white hover:bg-[#6a5ad6] transition-colors shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Opslaan
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg text-xs text-slate-500 hover:text-[#1e293b] bg-white border border-slate-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                title="Pas de meerwaarde uitleg aan voor deze klant"
              >
                <Edit3 className="w-3 h-3" />
                <span>Aanpassen</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Pitch Narrative */}
      <div className="mb-4">
        {isEditing ? (
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-[#1e293b] focus:outline-none focus:border-slate-900"
          />
        ) : (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {category.valueProposition.description}
          </p>
        )}
      </div>

      {/* Grid: Business Impacts & Why Studio Graaf */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
        {/* Left: Business Impacts */}
        <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#1e293b] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-white" />
              Zakelijke voordelen (ROI)
            </span>
            {isEditing && (
              <button
                onClick={handleAddImpact}
                className="text-[10px] text-white hover:underline font-bold"
              >
                + Voordeel
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {isEditing ? (
              editedImpacts.map((impact, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={impact}
                    onChange={(e) => handleImpactChange(idx, e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-[#1e293b]"
                  />
                  <button
                    onClick={() => handleRemoveImpact(idx)}
                    className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              category.valueProposition.businessImpacts.map((impact, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-[#1e293b] font-medium leading-snug">{impact}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Studio Graaf Advantage & ROI Focus */}
        <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#1e293b] flex items-center gap-1.5 mb-1.5">
              <Award className="w-3.5 h-3.5 text-white" />
              Waarom Studio Graaf
            </span>
            {isEditing ? (
              <textarea
                value={editedWhy}
                onChange={(e) => setEditedWhy(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-[#1e293b] mb-2"
              />
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                {category.valueProposition.whyStudioGraaf}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
            <TrendingUp className="w-3.5 h-3.5 text-white shrink-0" />
            <div className="text-[11px]">
              <span className="text-slate-500">Focus: </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRoi}
                  onChange={(e) => setEditedRoi(e.target.value)}
                  className="bg-transparent border-b border-slate-300 text-xs text-white font-bold"
                />
              ) : (
                <span className="font-semibold text-white">{category.valueProposition.roiFocus}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
