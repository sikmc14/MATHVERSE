import React, { useState } from 'react';
import { Search, BookOpen, ArrowUpRight, Filter } from 'lucide-react';
import { Language, ToolSection, FormulaItem } from '../../types/mathverse';
import { translations } from '../../services/i18n';
import { formulaLibrary } from '../../services/formulaData';
import { MathView } from '../MathView';

interface FormulaLibraryProps {
  language: Language;
  onLoadFormula: (tool: ToolSection, formula: FormulaItem) => void;
}

export const FormulaLibrary: React.FC<FormulaLibraryProps> = ({ language, onLoadFormula }) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFormulas = formulaLibrary.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const nameMatch =
      item.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cleanExpr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && nameMatch;
  });

  const categories = [
    { id: 'all', label: { en: 'All Disciplines', ar: 'جميع التخصصات' } },
    { id: 'algebra', label: { en: 'Algebra', ar: 'الجبر' } },
    { id: 'calculus', label: { en: 'Calculus', ar: 'التفاضل والتكامل' } },
    { id: 'trigonometry', label: { en: 'Trigonometry', ar: 'حساب المثلثات' } },
    { id: 'matrices', label: { en: 'Linear Algebra', ar: 'الجبر الخطي' } },
    { id: 'physics', label: { en: 'Physics & Mechanics', ar: 'الفيزياء والميكانيكا' } },
    { id: 'chemistry', label: { en: 'Chemistry & Thermo', ar: 'الكيمياء والديناميكا' } },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {t.formulas.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t.formulas.description}</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.formulas.search}
            className="w-full ps-9 pe-3 py-2 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 p-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              selectedCategory === c.id
                ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {c.label[language]}
          </button>
        ))}
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFormulas.map((item) => (
          <div
            key={item.id}
            className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-sky-500/40 transition flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-100 mt-2">{item.name[language]}</h3>
                </div>

                <button
                  onClick={() => onLoadFormula(item.targetTool, item)}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-md shadow-sky-500/20"
                >
                  <span>{t.formulas.loadToTool}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* KaTeX Display */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-center text-lg text-sky-300 overflow-x-auto">
                <MathView math={item.latex} block />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{item.description[language]}</p>
            </div>

            {/* Variables Legend */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500">Variables & Constants</div>
              <div className="space-y-1">
                {item.variables.map((v, vIdx) => (
                  <div key={vIdx} className="text-xs flex items-center gap-2">
                    <span className="font-mono text-sky-400 font-bold text-[11px]">{v.symbol}:</span>
                    <span className="text-slate-400 text-[11px]">{v.desc[language]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
