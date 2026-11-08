import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Grid, ArrowRight, RotateCw, Activity } from 'lucide-react';
import { Language } from '../../types/mathverse';
import { translations } from '../../services/i18n';
import {
  matrixDeterminant,
  matrixInverse,
  matrixMultiply,
  matrixGaussianElimination,
  formatNum,
} from '../../services/mathEngine';
import { MathView } from '../MathView';

interface MatricesVectorsProps {
  language: Language;
}

export const MatricesVectors: React.FC<MatricesVectorsProps> = ({ language }) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'matrices' | 'vectors'>('matrices');

  // Matrix State
  const [dim, setDim] = useState<number>(3);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2],
  ]);
  const [matrixB, setMatrixB] = useState<number[][]>([
    [1, 0, 2],
    [3, -2, 1],
    [0, 1, 4],
  ]);

  // Vector State (2D or 3D)
  const [vectorDim, setVectorDim] = useState<2 | 3>(3);
  const [vectorU, setVectorU] = useState<number[]>([3, 2, 0]);
  const [vectorV, setVectorV] = useState<number[]>([1, 4, 2]);

  const vectorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resize matrices when dimension changes
  const handleDimChange = (newDim: number) => {
    setDim(newDim);
    const createMat = (current: number[][]) => {
      const res: number[][] = [];
      for (let r = 0; r < newDim; r++) {
        const row: number[] = [];
        for (let c = 0; c < newDim; c++) {
          row.push(current[r]?.[c] ?? (r === c ? 1 : 0));
        }
        res.push(row);
      }
      return res;
    };
    setMatrixA((prev) => createMat(prev));
    setMatrixB((prev) => createMat(prev));
  };

  const updateCellA = (r: number, c: number, val: number) => {
    setMatrixA((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = val;
      return copy;
    });
  };

  const updateCellB = (r: number, c: number, val: number) => {
    setMatrixB((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = val;
      return copy;
    });
  };

  // Matrix calculations
  const detA = matrixDeterminant(matrixA);
  const invA = matrixInverse(matrixA);
  const multAB = matrixMultiply(matrixA, matrixB);
  const addAB = matrixA.map((r, i) => r.map((val, j) => val + matrixB[i][j]));
  const subAB = matrixA.map((r, i) => r.map((val, j) => val - matrixB[i][j]));
  const transposeA = matrixA[0].map((_, c) => matrixA.map((r) => r[c]));
  const traceA = matrixA.reduce((sum, r, i) => sum + r[i], 0);
  const gauss = matrixGaussianElimination(matrixA);

  // Vector calculations
  const dotUV = vectorU.reduce((acc, val, i) => acc + val * (vectorV[i] || 0), 0);
  const magU = Math.sqrt(vectorU.reduce((acc, v) => acc + v * v, 0));
  const magV = Math.sqrt(vectorV.reduce((acc, v) => acc + v * v, 0));
  const cosTheta = magU > 0 && magV > 0 ? Math.max(-1, Math.min(1, dotUV / (magU * magV))) : 0;
  const angleRad = Math.acos(cosTheta);
  const angleDeg = (angleRad * 180) / Math.PI;

  // Cross product (for 3D)
  const crossUV =
    vectorDim === 3
      ? [
          vectorU[1] * vectorV[2] - vectorU[2] * vectorV[1],
          vectorU[2] * vectorV[0] - vectorU[0] * vectorV[2],
          vectorU[0] * vectorV[1] - vectorU[1] * vectorV[0],
        ]
      : null;

  // Projection of U onto V
  const projScale = magV > 0 ? dotUV / (magV * magV) : 0;
  const projUonV = vectorV.map((val) => val * projScale);

  // Draw 2D Vector Canvas
  useEffect(() => {
    if (activeTab !== 'vectors') return;
    const canvas = vectorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const scale = 35; // px per unit

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Helper to draw arrow
    const drawArrow = (x: number, y: number, color: string, label: string) => {
      const endX = cx + x * scale;
      const endY = cy - y * scale;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      // Line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(cy - endY, endX - cx);
      const headLen = 10;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY + headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY + headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.font = 'bold 12px "Fira Code", monospace';
      ctx.fillText(label, endX + 8, endY - 6);
    };

    drawArrow(vectorU[0], vectorU[1], '#38bdf8', 'u');
    drawArrow(vectorV[0], vectorV[1], '#ec4899', 'v');
    drawArrow(vectorU[0] + vectorV[0], vectorU[1] + vectorV[1], '#10b981', 'u + v');
    drawArrow(projUonV[0], projUonV[1], '#f59e0b', 'proj');
  }, [activeTab, vectorU, vectorV, projUonV]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {t.matrices.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t.matrices.description}</p>
        </div>

        {/* Matrices vs Vectors Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-sky-500/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('matrices')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'matrices'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Matrix Operations
          </button>
          <button
            onClick={() => setActiveTab('vectors')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'vectors'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vector Visualizer
          </button>
        </div>
      </div>

      {activeTab === 'matrices' ? (
        /* ------------------------------------------- */
        /* MATRICES WORKSPACE                          */
        /* ------------------------------------------- */
        <div className="space-y-6">
          {/* Dimension Selector */}
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t.matrices.dimensions}:
            </span>
            {[2, 3, 4].map((d) => (
              <button
                key={d}
                onClick={() => handleDimChange(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  dim === d ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {d} × {d}
              </button>
            ))}
          </div>

          {/* Matrix A & B Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matrix A */}
            <div className="glass-panel-glow p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-sky-300 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-sky-400" /> {t.matrices.matrixA}
                </h3>
                <span className="text-xs font-mono text-slate-400">det(A) = {formatNum(detA)}</span>
              </div>

              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
              >
                {matrixA.map((row, r) =>
                  row.map((val, c) => (
                    <input
                      key={`${r}-${c}`}
                      type="number"
                      value={val}
                      onChange={(e) => updateCellA(r, c, parseFloat(e.target.value) || 0)}
                      className="w-full text-center py-2.5 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl font-mono text-sm text-white outline-none"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Matrix B */}
            <div className="glass-panel-glow p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-purple-300 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-purple-400" /> {t.matrices.matrixB}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  det(B) = {formatNum(matrixDeterminant(matrixB))}
                </span>
              </div>

              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
              >
                {matrixB.map((row, r) =>
                  row.map((val, c) => (
                    <input
                      key={`${r}-${c}`}
                      type="number"
                      value={val}
                      onChange={(e) => updateCellB(r, c, parseFloat(e.target.value) || 0)}
                      className="w-full text-center py-2.5 bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-xl font-mono text-sm text-white outline-none"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Computed Matrix Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Determinant & Properties of A */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Properties of Matrix A</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 bg-slate-900/60 rounded-lg">
                  <span className="text-slate-400">Determinant det(A):</span>
                  <span className="font-bold text-sky-300">{formatNum(detA)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900/60 rounded-lg">
                  <span className="text-slate-400">Trace tr(A):</span>
                  <span className="font-bold text-sky-300">{formatNum(traceA)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900/60 rounded-lg">
                  <span className="text-slate-400">Invertibility:</span>
                  <span className={`font-bold ${Math.abs(detA) > 1e-6 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Math.abs(detA) > 1e-6 ? 'Invertible (Regular)' : 'Singular (Non-Invertible)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Matrix Inverse A^-1 */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.matrices.inverse}</h4>
              {invA ? (
                <div
                  className="grid gap-1.5 font-mono text-xs text-center"
                  style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
                >
                  {invA.map((row, r) =>
                    row.map((val, c) => (
                      <div key={`${r}-${c}`} className="p-2 bg-slate-900/90 rounded border border-slate-800 text-sky-300">
                        {formatNum(val, 3)}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-xs text-rose-400 p-3 bg-rose-950/20 rounded-xl border border-rose-500/30">
                  Matrix A is singular (det = 0). Inverse does not exist.
                </div>
              )}
            </div>

            {/* Product A * B */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product (A × B)</h4>
              <div
                className="grid gap-1.5 font-mono text-xs text-center"
                style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
              >
                {multAB.map((row, r) =>
                  row.map((val, c) => (
                    <div key={`${r}-${c}`} className="p-2 bg-slate-900/90 rounded border border-slate-800 text-purple-300">
                      {formatNum(val, 2)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Gaussian Elimination Breakdown */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              {t.matrices.gaussianElimination}
            </h4>

            <div className="space-y-1.5">
              {gauss.steps.map((step, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-300">
                  <span className="text-sky-400 font-bold me-2">Step {idx + 1}:</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------- */
        /* VECTORS WORKSPACE                           */
        /* ------------------------------------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Vector Canvas */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-sky-500/20 bg-[#060913] shadow-2xl">
              <canvas
                ref={vectorCanvasRef}
                width={560}
                height={460}
                className="w-full block"
              />
              <div className="absolute top-4 start-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 border border-slate-800">
                <span className="text-sky-400 font-bold">u</span> (blue) &nbsp;|&nbsp;{' '}
                <span className="text-rose-400 font-bold">v</span> (pink) &nbsp;|&nbsp;{' '}
                <span className="text-emerald-400 font-bold">u + v</span> (green) &nbsp;|&nbsp;{' '}
                <span className="text-amber-400 font-bold">proj</span> (orange)
              </div>
            </div>
          </div>

          {/* Vector Inputs & Computations */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-slate-200">Vector Coordinates</h3>

              {/* Vector U */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-sky-400 font-bold">Vector u (x, y, z)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((idx) => (
                    <input
                      key={idx}
                      type="number"
                      value={vectorU[idx] ?? 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setVectorU((prev) => {
                          const cp = [...prev];
                          cp[idx] = val;
                          return cp;
                        });
                      }}
                      className="px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-white text-center outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* Vector V */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-rose-400 font-bold">Vector v (x, y, z)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((idx) => (
                    <input
                      key={idx}
                      type="number"
                      value={vectorV[idx] ?? 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setVectorV((prev) => {
                          const cp = [...prev];
                          cp[idx] = val;
                          return cp;
                        });
                      }}
                      className="px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-white text-center outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* Calculations Box */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex justify-between p-2 bg-slate-900/60 rounded-lg">
                  <span className="text-slate-400">{t.matrices.dotProduct}:</span>
                  <span className="font-bold text-sky-300">{formatNum(dotUV)}</span>
                </div>

                {crossUV && (
                  <div className="flex justify-between p-2 bg-slate-900/60 rounded-lg">
                    <span className="text-slate-400">{t.matrices.crossProduct}:</span>
                    <span className="font-bold text-purple-300">
                      [{crossUV.map((v) => formatNum(v)).join(', ')}]
                    </span>
                  </div>
                )}

                <div className="flex justify-between p-2 bg-slate-900/60 rounded-lg">
                  <span className="text-slate-400">Magnitude ||u||:</span>
                  <span className="font-bold text-sky-300">{formatNum(magU)}</span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900/60 rounded-lg">
                  <span className="text-slate-400">Magnitude ||v||:</span>
                  <span className="font-bold text-rose-300">{formatNum(magV)}</span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900/60 rounded-lg">
                  <span className="text-slate-400">{t.matrices.angleBetween}:</span>
                  <span className="font-bold text-emerald-400">
                    {formatNum(angleDeg, 2)}° ({formatNum(angleRad, 3)} rad)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
