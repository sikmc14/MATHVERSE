import React, { useState } from 'react';
import * as math from 'mathjs';
import { Delete, History, RotateCcw, Copy, Check, Info } from 'lucide-react';
import { Language } from '../../types/mathverse';
import { translations } from '../../services/i18n';
import { formatNum } from '../../services/mathEngine';

interface ScientificCalculatorProps {
  language: Language;
}

const CONSTANTS = [
  { symbol: 'π', name: 'Pi', value: '3.141592653589793', desc: 'Ratio of circumference to diameter' },
  { symbol: 'e', name: "Euler's Number", value: '2.718281828459045', desc: 'Natural logarithm base' },
  { symbol: 'c', name: 'Speed of Light', value: '299792458', desc: 'm/s in vacuum' },
  { symbol: 'G', name: 'Gravitational Constant', value: '6.67430e-11', desc: 'm³/(kg·s²)' },
  { symbol: 'h', name: 'Planck Constant', value: '6.62607015e-34', desc: 'J·s' },
  { symbol: 'k_B', name: 'Boltzmann Constant', value: '1.380649e-23', desc: 'J/K' },
  { symbol: 'N_A', name: 'Avogadro Constant', value: '6.02214076e23', desc: 'mol⁻¹' },
  { symbol: 'ε_0', name: 'Vacuum Permittivity', value: '8.8541878128e-12', desc: 'F/m' },
];

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({ language }) => {
  const t = translations[language];

  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [angleMode, setAngleMode] = useState<'RAD' | 'DEG'>('RAD');
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const handleInput = (val: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleBackspace = () => {
    if (display.length <= 1 || display === 'Error') {
      setDisplay('0');
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  };

  const handleCalculate = () => {
    try {
      let exprToEval = display;

      // Handle DEG mode for trig functions
      if (angleMode === 'DEG') {
        exprToEval = exprToEval
          .replace(/sin\(([^)]+)\)/g, 'sin(($1) * pi / 180)')
          .replace(/cos\(([^)]+)\)/g, 'cos(($1) * pi / 180)')
          .replace(/tan\(([^)]+)\)/g, 'tan(($1) * pi / 180)');
      }

      const result = math.evaluate(exprToEval);
      const formatted = typeof result === 'number' ? formatNum(result, 8) : result.toString();

      setHistory((prev) => [{ expr: display, result: formatted }, ...prev.slice(0, 19)]);
      setExpression(display + ' =');
      setDisplay(formatted);
    } catch (err) {
      setDisplay('Error');
    }
  };

  // Memory operations
  const handleMemory = (op: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    const currentVal = parseFloat(display) || 0;
    if (op === 'MC') setMemory(0);
    else if (op === 'MR') setDisplay(memory.toString());
    else if (op === 'M+') setMemory((m) => m + currentVal);
    else if (op === 'M-') setMemory((m) => m - currentVal);
    else if (op === 'MS') setMemory(currentVal);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {t.calculator.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t.calculator.description}</p>
        </div>

        {/* DEG / RAD Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-sky-500/20 text-xs font-mono">
          <button
            onClick={() => setAngleMode('RAD')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              angleMode === 'RAD' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.calculator.rad}
          </button>
          <button
            onClick={() => setAngleMode('DEG')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              angleMode === 'DEG' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.calculator.deg}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calculator Main Body */}
        <div className="lg:col-span-8 glass-panel-glow p-6 rounded-2xl space-y-4">
          {/* LCD Display */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-sky-500/30 text-right space-y-1 shadow-inner relative">
            <div className="text-xs font-mono text-slate-400 h-4">{expression}</div>
            <div className="text-3xl font-mono font-bold text-sky-300 overflow-x-auto tracking-wide">
              {display}
            </div>

            <button
              onClick={copyResult}
              title={t.common.copy}
              className="absolute start-3 top-3 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Memory Bar */}
          <div className="grid grid-cols-5 gap-2 text-xs font-mono">
            {(['MC', 'MR', 'M+', 'M-', 'MS'] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleMemory(m)}
                className="py-1.5 rounded-lg bg-slate-900 hover:bg-sky-500/10 border border-slate-800 text-slate-400 hover:text-sky-400 font-semibold transition"
              >
                {m}
              </button>
            ))}
          </div>

          {/* Scientific Keypad Grid */}
          <div className="grid grid-cols-5 gap-2 font-mono text-sm">
            {/* Row 1 */}
            <button
              onClick={() => handleInput('sin(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              sin
            </button>
            <button
              onClick={() => handleInput('cos(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              cos
            </button>
            <button
              onClick={() => handleInput('tan(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              tan
            </button>
            <button
              onClick={() => handleInput('(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            >
              (
            </button>
            <button
              onClick={() => handleInput(')')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            >
              )
            </button>

            {/* Row 2 */}
            <button
              onClick={() => handleInput('asin(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              sin⁻¹
            </button>
            <button
              onClick={() => handleInput('acos(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              cos⁻¹
            </button>
            <button
              onClick={() => handleInput('atan(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              tan⁻¹
            </button>
            <button
              onClick={handleClear}
              className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold transition"
            >
              AC
            </button>
            <button
              onClick={handleBackspace}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center justify-center"
            >
              <Delete className="w-4 h-4" />
            </button>

            {/* Row 3 */}
            <button
              onClick={() => handleInput('ln(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              ln
            </button>
            <button
              onClick={() => handleInput('log10(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              log₁₀
            </button>
            <button
              onClick={() => handleInput('7')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              7
            </button>
            <button
              onClick={() => handleInput('8')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              8
            </button>
            <button
              onClick={() => handleInput('9')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              9
            </button>

            {/* Row 4 */}
            <button
              onClick={() => handleInput('sqrt(')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              √x
            </button>
            <button
              onClick={() => handleInput('^2')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              x²
            </button>
            <button
              onClick={() => handleInput('4')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              4
            </button>
            <button
              onClick={() => handleInput('5')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              5
            </button>
            <button
              onClick={() => handleInput('6')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              6
            </button>

            {/* Row 5 */}
            <button
              onClick={() => handleInput('^')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              xʸ
            </button>
            <button
              onClick={() => handleInput('!')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              n!
            </button>
            <button
              onClick={() => handleInput('1')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              1
            </button>
            <button
              onClick={() => handleInput('2')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              2
            </button>
            <button
              onClick={() => handleInput('3')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              3
            </button>

            {/* Row 6 */}
            <button
              onClick={() => handleInput('e')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              e
            </button>
            <button
              onClick={() => handleInput('pi')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 transition"
            >
              π
            </button>
            <button
              onClick={() => handleInput('0')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              0
            </button>
            <button
              onClick={() => handleInput('.')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold transition"
            >
              .
            </button>
            <button
              onClick={() => handleInput(' + ')}
              className="p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold transition"
            >
              +
            </button>

            {/* Row 7: Operators & Equals */}
            <button
              onClick={() => handleInput(' - ')}
              className="p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold transition"
            >
              −
            </button>
            <button
              onClick={() => handleInput(' * ')}
              className="p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold transition"
            >
              ×
            </button>
            <button
              onClick={() => handleInput(' / ')}
              className="p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold transition"
            >
              ÷
            </button>
            <button
              onClick={() => handleInput(' % ')}
              className="p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold transition"
            >
              mod
            </button>
            <button
              onClick={handleCalculate}
              className="p-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-lg transition shadow-lg shadow-sky-500/30 cursor-pointer"
            >
              =
            </button>
          </div>
        </div>

        {/* Sidebar: History & Physical Constants */}
        <div className="lg:col-span-4 space-y-4">
          {/* History */}
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-sky-400" /> {t.calculator.history}
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pe-1">
              {history.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">No history yet</div>
              ) : (
                history.map((h, idx) => (
                  <div
                    key={idx}
                    onClick={() => setDisplay(h.result)}
                    className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 cursor-pointer text-xs font-mono transition"
                  >
                    <div className="text-slate-400 truncate">{h.expr}</div>
                    <div className="text-sky-300 font-bold text-sm text-right">= {h.result}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Physical Constants */}
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" /> {t.calculator.constants}
            </h3>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pe-1">
              {CONSTANTS.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => handleInput(c.value)}
                  className="p-2 rounded-xl bg-slate-900/60 hover:bg-sky-500/10 border border-slate-800/80 hover:border-sky-500/30 cursor-pointer flex items-center justify-between transition group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-300 text-xs">{c.symbol}</span>
                      <span className="text-[11px] text-slate-300">{c.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{c.desc}</div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-sky-300">
                    {c.value.length > 10 ? c.value.slice(0, 8) + '…' : c.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
