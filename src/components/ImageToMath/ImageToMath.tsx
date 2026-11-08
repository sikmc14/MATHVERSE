import React, { useState, useRef, useEffect } from 'react';
import { Upload, Edit3, Trash2, Sparkles, Check, ArrowRight, ExternalLink, Camera, Image as ImageIcon } from 'lucide-react';
import { Language, ToolSection } from '../../types/mathverse';
import { translations } from '../../services/i18n';
import { MathView } from '../MathView';

interface ImageToMathProps {
  language: Language;
  onNavigateToTab: (tab: ToolSection, data?: any) => void;
}

export const ImageToMath: React.FC<ImageToMathProps> = ({ language, onNavigateToTab }) => {
  const t = translations[language];

  const [inputMode, setInputMode] = useState<'upload' | 'draw'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recognition Results
  const [recognitionResult, setRecognitionResult] = useState<{
    detectedText: string;
    latex: string;
    cleanExpression: string;
    category: string;
    confidence: number;
    notes?: string;
  } | null>(null);

  // Editable output
  const [editableExpr, setEditableExpr] = useState('');

  // Drawing Canvas Refs
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Sample quick images/examples
  const SAMPLE_PROBLEMS = [
    { label: 'Quadratic Equation', expr: '3*x^2 - 12*x + 9 = 0', latex: '3x^2 - 12x + 9 = 0' },
    { label: 'System of Equations', expr: '2*x + y = 7, x - 3*y = -7', latex: '2x + y = 7, \\; x - 3y = -7' },
    { label: 'Calculus Derivative', expr: 'sin(x) / (x + 1)', latex: '\\frac{\\sin(x)}{x + 1}' },
  ];

  // Initialize Canvas
  useEffect(() => {
    if (inputMode !== 'draw') return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [inputMode]);

  // Drawing mouse/touch handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Handle Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Send to Gemini OCR API
  const handleRecognize = async () => {
    let base64Data: string | null = null;

    if (inputMode === 'upload') {
      base64Data = imagePreview;
    } else {
      const canvas = drawCanvasRef.current;
      if (canvas) {
        base64Data = canvas.toDataURL('image/png');
      }
    }

    if (!base64Data) {
      setErrorMsg('Please upload an image or draw a formula first.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setRecognitionResult(null);

    try {
      const res = await fetch('/api/image-to-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Recognition failed.');
      }

      setRecognitionResult(data);
      setEditableExpr(data.cleanExpression || data.detectedText);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {t.imageToMath.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t.imageToMath.description}</p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-sky-500/20 text-xs font-semibold">
          <button
            onClick={() => setInputMode('upload')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              inputMode === 'upload'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            {t.imageToMath.uploadImage}
          </button>
          <button
            onClick={() => setInputMode('draw')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              inputMode === 'draw'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t.imageToMath.drawCanvas}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Area (Upload or Drawing Canvas) */}
        <div className="lg:col-span-7 glass-panel-glow p-6 rounded-2xl space-y-4">
          {inputMode === 'upload' ? (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-sky-500/30 hover:border-sky-400/70 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40 min-h-[300px]">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Uploaded Math"
                    className="max-h-64 object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{t.imageToMath.dropHere}</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP, textbook photos, handwritten sheets</p>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {imagePreview && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setImagePreview(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Image
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Draw your formula or equation with mouse or stylus:</span>
                <button
                  onClick={clearCanvas}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-rose-400 rounded-lg border border-slate-800 transition"
                >
                  {t.imageToMath.canvasClear}
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-sky-500/30 bg-[#060913] shadow-inner">
                <canvas
                  ref={drawCanvasRef}
                  width={520}
                  height={280}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full cursor-crosshair block"
                />
              </div>
            </div>
          )}

          {/* Recognize Action Button */}
          <div className="pt-2">
            <button
              onClick={handleRecognize}
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Recognizing with Gemini 3.8 Flash...' : t.imageToMath.recognize}
            </button>
          </div>

          {/* Quick preset tests */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Quick Test Samples:</span>
            {SAMPLE_PROBLEMS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRecognitionResult({
                    detectedText: s.expr,
                    latex: s.latex,
                    cleanExpression: s.expr,
                    category: 'algebra',
                    confidence: 0.98,
                  });
                  setEditableExpr(s.expr);
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-sky-500/10 border border-slate-800 text-slate-300 rounded-lg font-mono transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results & Actions Panel */}
        <div className="lg:col-span-5 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {recognitionResult ? (
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-200">{t.imageToMath.recognizedExpression}</h3>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {t.imageToMath.confidence}: {Math.round(recognitionResult.confidence * 100)}%
                </span>
              </div>

              {/* KaTeX Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 text-center font-mono text-xl text-sky-300 overflow-x-auto">
                <MathView math={recognitionResult.latex || editableExpr} block />
              </div>

              {/* Editable Input Field */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Confirm or Edit Mathematical Expression:</label>
                <input
                  type="text"
                  value={editableExpr}
                  onChange={(e) => setEditableExpr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl font-mono text-sm text-white outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => onNavigateToTab('solver', { equation: editableExpr })}
                  className="py-2.5 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {t.imageToMath.solveEquation}
                </button>

                <button
                  onClick={() => onNavigateToTab('graphing', { equation: editableExpr })}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-sky-500/30 text-sky-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t.imageToMath.plotGraph}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl text-center py-16 text-slate-500 text-xs">
              Upload an image or draw a formula on the canvas to see the recognized expression here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
