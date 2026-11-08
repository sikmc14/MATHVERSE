import React, { useState, useEffect } from 'react';
import * as math from 'mathjs';
import { Sparkles, Activity, Layers, ArrowRight, ExternalLink } from 'lucide-react';
import { Language, ToolSection } from '../../types/mathverse';
import { translations } from '../../services/i18n';
import { computeDerivative, computeIntegral, CalculusResult, formatNum } from '../../services/mathEngine';
import { MathView } from '../MathView';

interface CalculusWorkspaceProps {
  language: Language;
  onNavigateToTab: (tab: ToolSection, data?: any) => void;
}

export const CalculusWorkspace: React.FC<CalculusWorkspaceProps> = ({ language, onNavigateToTab }) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'derivative' | 'integral' | 'limit' | 'series'>('derivative');
  const [expr, setExpr] = useState('x^3 - 4*x^2 + 2*x + 1');
  const [variable, setVariable] = useState('x');

  // Derivative params
  const [order, setOrder] = useState(1);
  const [evalX, setEvalX] = useState<string>('2');

  // Integral params
  const [lowerBound, setLowerBound] = useState<string>('0');
  const [upperBound, setUpperBound] = useState<string>('3');
  const [riemannN, setRiemannN] = useState<number>(10);
  const [riemannMethod, setRiemannMethod] = useState<'midpoint' | 'left' | 'right' | 'trapezoidal'>('midpoint');

  // Limit params
  const [limitA, setLimitA] = useState<string>('0');
  const [limitResult, setLimitResult] = useState<{ left: number; right: number; limit: string } | null>(null);

  // Series params
  const [seriesOrder, setSeriesOrder] = useState<number>(4);
  const [seriesCenter, setSeriesCenter] = useState<string>('0');
  const [seriesResult, setSeriesResult] = useState<string | null>(null);

  // Output State
  const [result, setResult] = useState<CalculusResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    handleCompute();
  }, [activeTab, expr, variable, order, evalX, lowerBound, upperBound, riemannN, riemannMethod, limitA, seriesOrder, seriesCenter]);

  const handleCompute = () => {
    setErrorMsg(null);
    try {
      if (activeTab === 'derivative') {
        const atVal = evalX.trim() !== '' ? parseFloat(evalX) : undefined;
        const res = computeDerivative(expr, variable, order, atVal);
        setResult(res);
      } else if (activeTab === 'integral') {
        const aVal = lowerBound.trim() !== '' ? parseFloat(lowerBound) : undefined;
        const bVal = upperBound.trim() !== '' ? parseFloat(upperBound) : undefined;
        const res = computeIntegral(expr, variable, aVal, bVal, riemannN, riemannMethod);
        setResult(res);
      } else if (activeTab === 'limit') {
        evaluateLimits();
      } else if (activeTab === 'series') {
        evaluateTaylorSeries();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing calculus computation.');
      setResult(null);
    }
  };

  const evaluateLimits = () => {
    const a = parseFloat(limitA) || 0;
    const compiled = math.parse(expr).compile();
    const evalAt = (v: number) => {
      try {
        return compiled.evaluate({ [variable]: v });
      } catch {
        return NaN;
      }
    };

    const eps = 1e-6;
    const leftVal = evalAt(a - eps);
    const rightVal = evalAt(a + eps);

    let limStr = 'Does Not Exist';
    if (!isNaN(leftVal) && !isNaN(rightVal)) {
      if (Math.abs(leftVal - rightVal) < 1e-3) {
        limStr = formatNum((leftVal + rightVal) / 2, 6);
      } else if (leftVal > 1e6 && rightVal > 1e6) {
        limStr = '+\\infty';
      } else if (leftVal < -1e6 && rightVal < -1e6) {
        limStr = '-\\infty';
      }
    }

    setLimitResult({ left: leftVal, right: rightVal, limit: limStr });
  };

  const evaluateTaylorSeries = () => {
    const a = parseFloat(seriesCenter) || 0;
    const terms: string[] = [];
    let current = math.parse(expr);

    for (let k = 0; k <= seriesOrder; k++) {
      try {
        const compiled = current.compile();
        const fK = compiled.evaluate({ [variable]: a });
        if (typeof fK === 'number' && !isNaN(fK) && Math.abs(fK) > 1e-6) {
          const fact = math.factorial(k) as number;
          const coeff = fK / fact;
          const coeffStr = formatNum(coeff, 4);

          if (k === 0) {
            terms.push(coeffStr);
          } else {
            const varPart = a === 0 ? `${variable}^{${k}}` : `(${variable} - ${a})^{${k}}`;
            terms.push(`${coeffStr} ${varPart}`);
          }
        }
        current = math.derivative(current, variable);
      } catch {
        break;
      }
    }

    setSeriesResult(terms.length > 0 ? terms.join(' + ').replace(/\+ -/g, '- ') : '0');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {t.calculus.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t.calculus.description}</p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-900 rounded-xl border border-sky-500/20 text-xs">
          {(['derivative', 'integral', 'limit', 'series'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.calculus[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Input Configuration Card */}
      <div className="glass-panel-glow p-6 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8 space-y-1">
            <label className="text-xs text-slate-400 font-mono">f(x) Function Expression</label>
            <input
              type="text"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              placeholder="e.g. sin(x), x^3 - 3*x, e^(-x^2)"
              className="w-full px-4 py-2.5 bg-slate-900 border border-sky-500/30 focus:border-sky-400 rounded-xl text-sm font-mono text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2 pt-5">
            <button
              onClick={() => onNavigateToTab('graphing', { equation: expr })}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-sky-500/10 border border-slate-700 hover:border-sky-400 text-sky-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4" />
              {t.solver.sendToGrapher}
            </button>
          </div>
        </div>

        {/* Dynamic sub-controls based on active tab */}
        {activeTab === 'derivative' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">{t.calculus.order}</label>
              <div className="flex gap-2">
                {[1, 2, 3].map((ord) => (
                  <button
                    key={ord}
                    type="button"
                    onClick={() => setOrder(ord)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      order === ord ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {ord === 1 ? '1st (f\')' : ord === 2 ? '2nd (f\'\')' : '3rd (f\'\'\')'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">{t.calculus.atPoint}</label>
              <input
                type="text"
                value={evalX}
                onChange={(e) => setEvalX(e.target.value)}
                placeholder="2"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'integral' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">{t.calculus.lowerBound}</label>
                <input
                  type="text"
                  value={lowerBound}
                  onChange={(e) => setLowerBound(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">{t.calculus.upperBound}</label>
                <input
                  type="text"
                  value={upperBound}
                  onChange={(e) => setUpperBound(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Riemann Method</label>
                <select
                  value={riemannMethod}
                  onChange={(e: any) => setRiemannMethod(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none"
                >
                  <option value="midpoint">Midpoint Rule</option>
                  <option value="trapezoidal">Trapezoidal Rule</option>
                  <option value="left">Left Endpoint</option>
                  <option value="right">Right Endpoint</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">{t.calculus.stepsCount}</label>
                <input
                  type="number"
                  min="4"
                  max="100"
                  value={riemannN}
                  onChange={(e) => setRiemannN(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'limit' && (
          <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
            <span className="text-xs text-slate-400">{t.calculus.approaches}:</span>
            <input
              type="text"
              value={limitA}
              onChange={(e) => setLimitA(e.target.value)}
              className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
            />
          </div>
        )}

        {activeTab === 'series' && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Max Degree (n)</label>
              <input
                type="number"
                min="1"
                max="8"
                value={seriesOrder}
                onChange={(e) => setSeriesOrder(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Center Point (a)</label>
              <input
                type="text"
                value={seriesCenter}
                onChange={(e) => setSeriesCenter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      {errorMsg ? (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm">
          {errorMsg}
        </div>
      ) : activeTab === 'limit' && limitResult ? (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Limit Evaluation Results</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Left-Hand Limit (x → a⁻)</div>
              <div className="text-lg font-mono font-bold text-sky-300">{formatNum(limitResult.left, 5)}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Right-Hand Limit (x → a⁺)</div>
              <div className="text-lg font-mono font-bold text-sky-300">{formatNum(limitResult.right, 5)}</div>
            </div>
            <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/40 space-y-1">
              <div className="text-xs text-sky-300">Two-Sided Limit (lim x → a)</div>
              <div className="text-xl font-mono font-bold text-white">
                <MathView math={`\\lim_{x \\to ${limitA}} = ${limitResult.limit}`} />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'series' && seriesResult ? (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Taylor / Maclaurin Polynomial Approximation
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 overflow-x-auto text-center font-mono text-sky-300 text-lg">
            <MathView math={`P_{${seriesOrder}}(x) = ${seriesResult}`} block />
          </div>
        </div>
      ) : (
        result && (
          <div className="space-y-6">
            {/* Symbolic Answer Box */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analytical Solution</div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 font-mono text-center text-xl text-sky-300">
                <MathView math={result.symbolicResult} block />
              </div>

              {result.tangentLine && (
                <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">{t.calculus.tangentLine}:</span>
                  <span className="font-bold text-sky-300 text-sm">{result.tangentLine.equation}</span>
                </div>
              )}
            </div>

            {/* Riemann Partition Visualization if Definite Integral */}
            {result.riemannData && (
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-200">
                    Riemann Integral Approximation: {result.riemannData.method.toUpperCase()} (n ={' '}
                    {result.riemannData.partitions})
                  </div>
                  <div className="text-sm font-mono font-bold text-sky-400">
                    Area ≈ {formatNum(result.riemannData.approximation, 5)}
                  </div>
                </div>

                {/* Riemann partition bar graph preview */}
                <div className="h-32 bg-slate-950/80 rounded-xl border border-slate-800 p-2 flex items-end gap-1 overflow-x-auto">
                  {result.riemannData.subintervals.map((sub, idx) => {
                    const maxH = Math.max(...result.riemannData!.subintervals.map((s) => Math.abs(s.height)), 1);
                    const normH = Math.min(100, (Math.abs(sub.height) / maxH) * 100);
                    return (
                      <div
                        key={idx}
                        title={`Slice ${idx + 1}: x=${formatNum(sub.x, 2)}, h=${formatNum(sub.height, 2)}`}
                        style={{ height: `${Math.max(4, normH)}%` }}
                        className={`flex-1 min-w-[6px] rounded-t transition ${
                          sub.height >= 0 ? 'bg-sky-500/60 hover:bg-sky-400' : 'bg-rose-500/60 hover:bg-rose-400'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Formal Mathematical Steps */}
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <div className="text-sm font-bold text-slate-200">{t.common.stepByStep}</div>
              <div className="space-y-3">
                {result.steps.map((st, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="text-xs font-semibold text-sky-300">{st.title}</div>
                    {st.latex && (
                      <div className="p-2 bg-slate-950/60 rounded text-center font-mono text-sky-200 overflow-x-auto">
                        <MathView math={st.latex} block />
                      </div>
                    )}
                    <p className="text-xs text-slate-400">{st.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
