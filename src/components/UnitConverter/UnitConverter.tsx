import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check, Scale } from 'lucide-react';
import { Language } from '../../types/mathverse';
import { translations } from '../../services/i18n';
import { unitCategories } from '../../services/unitData';
import { formatNum } from '../../services/mathEngine';

interface UnitConverterProps {
  language: Language;
}

export const UnitConverter: React.FC<UnitConverterProps> = ({ language }) => {
  const t = translations[language];

  const [selectedCatId, setSelectedCatId] = useState<string>('length');
  const [inputValue, setInputValue] = useState<string>('100');
  const [copied, setCopied] = useState(false);

  const category = unitCategories.find((c) => c.id === selectedCatId) || unitCategories[0];
  const [fromUnitId, setFromUnitId] = useState<string>(category.units[0].id);
  const [toUnitId, setToUnitId] = useState<string>(category.units[1]?.id || category.units[0].id);

  // When category changes, reset units
  const handleCategoryChange = (catId: string) => {
    setSelectedCatId(catId);
    const cat = unitCategories.find((c) => c.id === catId);
    if (cat && cat.units.length > 0) {
      setFromUnitId(cat.units[0].id);
      setToUnitId(cat.units[1]?.id || cat.units[0].id);
    }
  };

  const fromUnit = category.units.find((u) => u.id === fromUnitId) || category.units[0];
  const toUnit = category.units.find((u) => u.id === toUnitId) || category.units[1] || category.units[0];

  // Convert
  const val = parseFloat(inputValue);
  let convertedResult = '0';
  if (!isNaN(val)) {
    const inBase = fromUnit.toBase(val);
    const inTarget = toUnit.fromBase(inBase);
    convertedResult = formatNum(inTarget, 6);
  }

  const handleSwap = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(convertedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
          {t.converter.title}
        </h2>
        <p className="text-slate-400 text-sm mt-1">{t.converter.description}</p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap gap-2 p-1">
        {unitCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-2 ${
              selectedCatId === cat.id
                ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>{cat.name[language]}</span>
          </button>
        ))}
      </div>

      {/* Conversion Card */}
      <div className="glass-panel-glow p-8 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* FROM */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs text-slate-400 font-semibold">{t.converter.from}</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl font-mono text-xl text-white outline-none"
            />
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-sky-300 outline-none"
            >
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name[language]} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* SWAP BUTTON */}
          <div className="md:col-span-1 flex justify-center py-2">
            <button
              onClick={handleSwap}
              className="p-3 bg-slate-900 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-400 text-sky-400 rounded-xl transition shadow-md"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* TO */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 font-semibold">{t.converter.to}</label>
              <button
                onClick={copyResult}
                className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? t.common.copied : t.common.copy}
              </button>
            </div>

            <div className="w-full px-4 py-3 bg-slate-950 border border-sky-500/40 rounded-xl font-mono text-xl font-bold text-sky-300 overflow-x-auto">
              {convertedResult} {toUnit.symbol}
            </div>

            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-sky-300 outline-none"
            >
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name[language]} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversion Equation Bar */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono text-sm text-slate-300">
          1 {fromUnit.symbol} ={' '}
          <strong className="text-sky-400">
            {formatNum(toUnit.fromBase(fromUnit.toBase(1)), 8)} {toUnit.symbol}
          </strong>
        </div>
      </div>
    </div>
  );
};
