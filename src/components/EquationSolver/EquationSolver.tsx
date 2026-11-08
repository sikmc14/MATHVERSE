import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { EquationSolution, Language, ToolSection } from '../../types/mathverse';
import { solveEquation } from '../../services/mathEngine';
import { translations } from '../../services/i18n';
import { MathView } from '../MathView';

interface EquationSolverProps {
  language: Language;
  onNavigateToTab: (tab: ToolSection, data?: any) => void;
  initialEquation?: string;
}

const PRESET_EQUATIONS: { label: string; equation: string; category: string }[] = [
  { label: 'Quadratic (Real Roots)', equation: '2*x^2 - 5*x + 2 = 0', category: 'quadratic' },
  { label: 'Quadratic (Complex Roots)', equation: 'x^2 + 4*x + 13 = 0', category: 'complex' },
  { label: '2x2 Linear System', equation: '3*x + 4*y = 10, x - 2*y = 0', category: 'system' },
  { label: 'Linear Equation', equation: '4*(x - 3) + 7 = 3*x - 2', category: 'linear' },
  { label: 'Rational Equation', equation: '(x + 3) / (x - 2) = 4', category: 'rational' },
  { label: 'Radical Equation', equation: 'sqrt(2*x + 5) = x - 5', category: 'rational' },
  { label: 'Exponential Equation', equation: 'e^(2*x) - 5 = 15', category: 'exponential' },
  { label: 'Logarithmic Equation', equation: 'ln(x - 1) = 2', category: 'exponential' },
  { label: 'Trigonometric Equation', equation: 'sin(x) - 0.5 = 0', category: 'trig' },
  { label: 'Linear Inequality', equation: '3*x - 7 >= 8', category: 'inequality' },
];

const MATH_SYMBOLS = [
  { label: 'x²', insert: '^2' },
  { label: 'xⁿ', insert: '^' },
  { label: '√x', insert: 'sqrt(' },
  { label: 'π', insert: 'pi' },
  { label: 'e', insert: 'e' },
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'tan', insert: 'tan(' },
  { label: 'ln', insert: 'ln(' },
  { label: 'log', insert: 'log10(' },
  { label: '≤', insert: '<=' },
  { label: '≥', insert: '>=' },
  { label: '±', insert: '+/-' },
  { label: 'd/dx', insert: 'derivative(' },
  { label: '∫', insert: 'integral(' },
];

export const EquationSolver: React.FC<EquationSolverProps> = ({
  language,
  onNavigateToTab,
  initialEquation,
}) => {
  const t = translations[language];

  const [inputEq, setInputEq] = useState(initialEquation || '2*x^2 - 5*x + 2 = 0');
  const [targetVar, setTargetVar] = useState('x');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [solution, setSolution] = useState<EquationSolution | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // AI Deep Explanation State
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (initialEquation) {
      setInputEq(initialEquation);
      handleSolve(initialEquation);
    } else {
      handleSolve('2*x^2 - 5*x + 2 = 0');
    }
  }, [initialEquation]);

  const handleSolve = (equationToSolve?: string) => {
    const eq = (equationToSolve !== undefined ? equationToSolve : inputEq).trim();
    if (!eq) return;

    setErrorMsg(null);
    setAiExplanation(null);

    try {
      const res = solveEquation(eq, targetVar);
      setSolution(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to solve equation symbolically.');
      setSolution(null);
    }
  };

  const handleInsertSymbol = (str: string) => {
    setInputEq((prev) => prev + str);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger Gemini AI deep explanation
  const handleFetchAiExplanation = async () => {
    if (!solution) return;
    setIsAiLoading(true);
    setAiExplanation(null);

    try {
      const res = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: solution.originalEquation,
          method: solution.methodUsed,
          language,
          context: solution.category,
        }),
      });

      const data = await res.json();
      if (res.ok && data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation(data.error || 'AI explanation service temporarily unavailable.');
      }
    } catch (e: any) {
      setAiExplanation(e.message || 'Error communicating with AI service.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredPresets = PRESET_EQUATIONS.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {t.solver.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">{t.solver.description}</p>
        </div>

        {/* Category Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {Object.entries(t.solver.categories).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedCategory === key
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Solver Input Form */}
      <div className="glass-panel-glow p-6 rounded-2xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSolve();
          }}
          className="space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputEq}
                onChange={(e) => setInputEq(e.target.value)}
                placeholder={t.solver.inputPlaceholder}
                className="w-full px-4 py-3.5 bg-slate-900/90 border border-sky-500/30 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-lg font-mono text-white placeholder-slate-500 outline-none transition shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400">{t.solver.variableLabel}:</span>
                <input
                  type="text"
                  value={targetVar}
                  onChange={(e) => setTargetVar(e.target.value.trim() || 'x')}
                  maxLength={2}
                  className="w-7 text-center bg-slate-800 text-sky-400 font-mono font-bold text-sm rounded outline-none py-0.5"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-sky-500/30 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {t.common.solve}
              </button>
            </div>
          </div>

          {/* Quick Virtual Keypad */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400 me-2 font-mono">Insert:</span>
            {MATH_SYMBOLS.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSymbol(sym.insert)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-sky-500/20 border border-slate-800 hover:border-sky-500/40 text-xs font-mono text-sky-300 transition"
              >
                {sym.label}
              </button>
            ))}
          </div>

          {/* Curated Presets Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">{t.common.examples}:</span>
            {filteredPresets.slice(0, 6).map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputEq(preset.equation);
                  handleSolve(preset.equation);
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-sky-500/10 border border-slate-800 hover:border-sky-500/30 text-slate-300 hover:text-sky-300 rounded-lg text-xs font-mono transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Error Message Display */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">{t.common.error}</div>
            <p className="text-xs text-rose-200/90 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Solution Display Card */}
      {solution && (
        <div className="space-y-6">
          {/* Main Result Banner */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-sky-400 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-400/30">
                  {solution.category}
                </span>
                <span className="text-xs text-slate-400">
                  {t.common.method}: <strong className="text-slate-200">{solution.methodUsed}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {solution.graphableFunction && (
                  <button
                    onClick={() => onNavigateToTab('graphing', { equation: solution.graphableFunction })}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-sky-500/20 border border-slate-800 hover:border-sky-400/50 rounded-xl text-xs font-medium text-sky-300 transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t.solver.sendToGrapher}
                  </button>
                )}

                <button
                  onClick={() => copyToClipboard(solution.exactSolutions.join(', '))}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 transition flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? t.common.copied : t.common.copy}
                </button>
              </div>
            </div>

            {/* Exact Solutions Box */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t.common.exactSolution}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xl font-bold text-sky-300 font-mono">
                {solution.exactSolutions.map((sol, idx) => (
                  <div key={idx} className="bg-sky-500/10 px-4 py-2 rounded-lg border border-sky-500/20">
                    <MathView math={sol} />
                  </div>
                ))}
              </div>
            </div>

            {/* Domain Restrictions if any */}
            {solution.domainRestrictions && solution.domainRestrictions.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">{t.common.restrictions}: </strong>
                  {solution.domainRestrictions.join(' ')}
                </div>
              </div>
            )}
          </div>

          {/* Rigorous Step-by-Step Proof Breakdown */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-400" />
                {t.common.stepByStep}
              </h3>
              <span className="text-xs text-slate-400">
                {solution.steps.length} {language === 'ar' ? 'خطوات مبرهنة' : 'formal steps'}
              </span>
            </div>

            <div className="space-y-4">
              {solution.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/30 transition space-y-2"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-300">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center text-xs font-mono font-bold">
                      {idx + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>

                  {step.latex && (
                    <div className="py-2 px-3 bg-slate-950/70 rounded-lg border border-slate-800/80 font-mono text-center overflow-x-auto text-sky-200">
                      <MathView math={step.latex} block />
                    </div>
                  )}

                  <p className="text-xs text-slate-300/90 leading-relaxed ps-8">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification & Sanity Check Panel */}
          {solution.verification.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                {t.common.verification}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {solution.verification.map((v, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      v.isValid
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    {v.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-slate-200">{v.candidate}</div>
                      <div className="font-mono text-slate-400">
                        LHS = <span className="text-white font-bold">{v.lhsValue}</span> &nbsp;|&nbsp; RHS ={' '}
                        <span className="text-white font-bold">{v.rhsValue}</span>
                      </div>
                      <div className="text-[11px] font-medium">
                        {v.isValid ? t.solver.validVerified : t.solver.extraneousRejected}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Pedagogical Deep Breakdown Section */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-400" />
                  {t.common.aiDeepExplanation}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Request deep conceptual, geometric intuition, and historical context from Gemini Master Mathematician.
                </p>
              </div>

              <button
                onClick={handleFetchAiExplanation}
                disabled={isAiLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-purple-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAiLoading ? t.common.aiAnalyzing : t.common.aiDeepExplanation}
              </button>
            </div>

            {aiExplanation && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {aiExplanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
