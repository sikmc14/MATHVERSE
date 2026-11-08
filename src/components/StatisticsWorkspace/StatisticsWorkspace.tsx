import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Sliders, Play } from 'lucide-react';
import { Language } from '../../types/mathverse';
import { translations } from '../../services/i18n';
import { computeStatistics, computeLinearRegression, StatsSummary, formatNum } from '../../services/mathEngine';

interface StatisticsWorkspaceProps {
  language: Language;
}

export const StatisticsWorkspace: React.FC<StatisticsWorkspaceProps> = ({ language }) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'descriptive' | 'distributions' | 'regression'>('descriptive');

  // Descriptive dataset input
  const [dataInput, setDataInput] = useState('12, 15, 18, 22, 25, 25, 28, 30, 32, 35, 40, 42, 45, 50');
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Normal distribution params
  const [normMu, setNormMu] = useState<number>(0);
  const [normSigma, setNormSigma] = useState<number>(1);
  const [normX, setNormX] = useState<number>(1.5);

  // Regression points
  const [regInput, setRegInput] = useState('1, 2.1\n2, 3.9\n3, 6.2\n4, 8.1\n5, 9.8\n6, 12.2');
  const [regResult, setRegResult] = useState<any>(null);

  const histCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const distCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const regCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute statistics whenever dataset changes
  useEffect(() => {
    try {
      setErrorMsg(null);
      const parsed = dataInput
        .split(/[,;\s\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number)
        .filter((n) => !isNaN(n));

      if (parsed.length > 0) {
        const s = computeStatistics(parsed);
        setStats(s);
      } else {
        setStats(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid dataset.');
      setStats(null);
    }
  }, [dataInput]);

  // Compute regression
  useEffect(() => {
    try {
      const lines = regInput
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const pts = lines
        .map((line) => {
          const parts = line.split(/[,;\t ]+/);
          return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
        })
        .filter((p) => !isNaN(p.x) && !isNaN(p.y));

      if (pts.length >= 2) {
        const res = computeLinearRegression(pts);
        setRegResult({ ...res, points: pts });
      } else {
        setRegResult(null);
      }
    } catch {
      setRegResult(null);
    }
  }, [regInput]);

  // Draw Histogram & Box Plot
  useEffect(() => {
    if (activeTab !== 'descriptive' || !stats) return;
    const canvas = histCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    // Box plot on top 60px
    const pad = 40;
    const boxY = 35;
    const plotW = width - 2 * pad;
    const scaleX = (val: number) => pad + ((val - stats.min) / Math.max(1, stats.range)) * plotW;

    // Whisker line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleX(stats.min), boxY);
    ctx.lineTo(scaleX(stats.max), boxY);
    ctx.stroke();

    // Box from Q1 to Q3
    const q1X = scaleX(stats.q1);
    const q3X = scaleX(stats.q3);
    const medX = scaleX(stats.median);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.strokeStyle = '#38bdf8';
    ctx.fillRect(q1X, boxY - 14, Math.max(2, q3X - q1X), 28);
    ctx.strokeRect(q1X, boxY - 14, Math.max(2, q3X - q1X), 28);

    // Median line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(medX, boxY - 14);
    ctx.lineTo(medX, boxY + 14);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Fira Code", monospace';
    ctx.fillText(`Min: ${formatNum(stats.min)}`, pad, 14);
    ctx.fillText(`Q1: ${formatNum(stats.q1)}`, q1X - 10, boxY + 28);
    ctx.fillText(`Median: ${formatNum(stats.median)}`, medX - 15, 14);
    ctx.fillText(`Q3: ${formatNum(stats.q3)}`, q3X - 10, boxY + 28);
    ctx.fillText(`Max: ${formatNum(stats.max)}`, width - pad - 45, 14);

    // Histogram bins on lower area
    const histTop = 90;
    const histH = height - histTop - 30;
    const numBins = 7;
    const binWidth = Math.max(0.1, stats.range / numBins);
    const bins = Array(numBins).fill(0);

    const parsedData = dataInput
      .split(/[,;\s\n]+/)
      .map(Number)
      .filter((n) => !isNaN(n));

    for (const v of parsedData) {
      let bIdx = Math.floor((v - stats.min) / binWidth);
      if (bIdx >= numBins) bIdx = numBins - 1;
      bins[bIdx]++;
    }

    const maxBin = Math.max(...bins, 1);
    const binPxW = plotW / numBins;

    for (let i = 0; i < numBins; i++) {
      const bh = (bins[i] / maxBin) * histH;
      const bx = pad + i * binPxW;
      const by = height - 25 - bh;

      // Bar
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.fillRect(bx + 2, by, binPxW - 4, bh);
      ctx.strokeRect(bx + 2, by, binPxW - 4, bh);

      // Frequency label
      if (bins[i] > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(bins[i].toString(), bx + binPxW / 2 - 4, by - 5);
      }
    }
  }, [activeTab, stats, dataInput]);

  // Draw Normal Distribution Curve
  useEffect(() => {
    if (activeTab !== 'distributions') return;
    const canvas = distCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    const pad = 40;
    const minX = normMu - 3.8 * normSigma;
    const maxX = normMu + 3.8 * normSigma;

    const normalPdf = (x: number) => {
      const exponent = -0.5 * Math.pow((x - normMu) / normSigma, 2);
      return (1 / (normSigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    };

    const maxPdf = normalPdf(normMu);
    const toPxX = (x: number) => pad + ((x - minX) / (maxX - minX)) * (width - 2 * pad);
    const toPxY = (y: number) => height - 30 - (y / maxPdf) * (height - 60);

    // Shaded area P(X <= normX)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.beginPath();
    ctx.moveTo(toPxX(minX), toPxY(0));
    for (let x = minX; x <= Math.min(maxX, normX); x += (maxX - minX) / 200) {
      ctx.lineTo(toPxX(x), toPxY(normalPdf(x)));
    }
    ctx.lineTo(toPxX(Math.min(maxX, normX)), toPxY(0));
    ctx.closePath();
    ctx.fill();

    // PDF Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = minX; x <= maxX; x += (maxX - minX) / 200) {
      const px = toPxX(x);
      const py = toPxY(normalPdf(x));
      if (x === minX) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // X-axis
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad, height - 30);
    ctx.lineTo(width - pad, height - 30);
    ctx.stroke();

    // Bound line at normX
    const bx = toPxX(normX);
    ctx.strokeStyle = '#f43f5e';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(bx, 15);
    ctx.lineTo(bx, height - 30);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [activeTab, normMu, normSigma, normX]);

  // Compute Normal CDF approximation
  const normalCdf = (x: number, mean: number, std: number) => {
    const z = (x - mean) / std;
    const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (z > 0) p = 1.0 - p;
    return p;
  };

  const probP = normalCdf(normX, normMu, normSigma);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {t.statistics.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t.statistics.description}</p>
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-sky-500/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('descriptive')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'descriptive'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.statistics.summaryStats}
          </button>
          <button
            onClick={() => setActiveTab('distributions')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'distributions'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Probability Distributions
          </button>
          <button
            onClick={() => setActiveTab('regression')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'regression'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Linear Regression
          </button>
        </div>
      </div>

      {activeTab === 'descriptive' ? (
        <div className="space-y-6">
          {/* Data input textarea */}
          <div className="glass-panel-glow p-5 rounded-2xl space-y-2">
            <label className="text-xs font-semibold text-slate-300">{t.statistics.dataInput}</label>
            <textarea
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              rows={2}
              placeholder={t.statistics.dataPlaceholder}
              className="w-full p-3 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl font-mono text-sm text-white outline-none"
            />
          </div>

          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Histogram & Box-Plot Canvas */}
              <div className="lg:col-span-7 glass-panel p-5 rounded-2xl space-y-3">
                <h3 className="font-bold text-sm text-slate-200">Box Plot & Frequency Distribution</h3>
                <canvas
                  ref={histCanvasRef}
                  width={540}
                  height={280}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800"
                />
              </div>

              {/* Statistics Summary Cards */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {[
                  { label: t.statistics.mean, value: formatNum(stats.mean) },
                  { label: t.statistics.median, value: formatNum(stats.median) },
                  { label: t.statistics.stdDev, value: formatNum(stats.sampleStdDev) },
                  { label: t.statistics.variance, value: formatNum(stats.sampleVariance) },
                  { label: t.statistics.iqr, value: formatNum(stats.iqr) },
                  { label: 'Sample Count (n)', value: stats.count },
                  { label: t.statistics.min, value: formatNum(stats.min) },
                  { label: t.statistics.max, value: formatNum(stats.max) },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400">{item.label}</div>
                    <div className="text-lg font-mono font-bold text-sky-300">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'distributions' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Normal Curve Canvas */}
          <div className="lg:col-span-7 glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">{t.statistics.normal} Curve</h3>
              <span className="text-xs font-mono text-sky-400">
                P(X ≤ {normX}) = <strong className="text-white">{(probP * 100).toFixed(2)}%</strong>
              </span>
            </div>
            <canvas
              ref={distCanvasRef}
              width={540}
              height={300}
              className="w-full rounded-xl bg-slate-950 border border-slate-800"
            />
          </div>

          {/* Parameters */}
          <div className="lg:col-span-5 glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-200">Distribution Parameters</h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Mean (μ)</label>
              <input
                type="number"
                value={normMu}
                onChange={(e) => setNormMu(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Standard Deviation (σ)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={normSigma}
                onChange={(e) => setNormSigma(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Boundary Point (x)</label>
              <input
                type="number"
                step="0.1"
                value={normX}
                onChange={(e) => setNormX(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-xs font-mono space-y-1">
              <div>Z-score: {formatNum((normX - normMu) / normSigma, 3)}</div>
              <div>P(X ≤ {normX}) = {formatNum(probP, 5)}</div>
              <div>P(X &gt; {normX}) = {formatNum(1 - probP, 5)}</div>
            </div>
          </div>
        </div>
      ) : (
        /* Linear Regression */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-200">Paired Data Points (x, y)</h3>
            <textarea
              rows={8}
              value={regInput}
              onChange={(e) => setRegInput(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl font-mono text-xs text-white"
            />
          </div>

          <div className="lg:col-span-7 glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-200">Regression Model Results</h3>
            {regResult ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 text-center text-lg font-bold text-sky-300">
                  {regResult.equation}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Pearson Correlation (r)</div>
                    <div className="text-base font-bold text-emerald-400">{formatNum(regResult.r, 4)}</div>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">R² Coefficient</div>
                    <div className="text-base font-bold text-sky-400">{formatNum(regResult.r2, 4)}</div>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Slope (m)</div>
                    <div className="text-base font-bold text-white">{formatNum(regResult.slope, 4)}</div>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Y-Intercept (b)</div>
                    <div className="text-base font-bold text-white">{formatNum(regResult.intercept, 4)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Enter at least 2 valid points to compute regression.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
