import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import * as math from 'mathjs';
import { Play, Plus, Trash2, Eye, EyeOff, RotateCcw, ZoomIn, ZoomOut, Maximize2, Sparkles, Layers } from 'lucide-react';
import { GraphFunction, Language } from '../../types/mathverse';
import { translations } from '../../services/i18n';
import { MathView } from '../MathView';

interface GraphingStudioProps {
  language: Language;
  initialEquation?: string;
}

const PRESET_2D: { name: string; functions: Omit<GraphFunction, 'id'>[] }[] = [
  {
    name: 'Polynomial Roots & Intersections',
    functions: [
      { expression: 'x^3 - 3*x', type: 'cartesian2d', color: '#38bdf8', visible: true },
      { expression: 'x - 1', type: 'cartesian2d', color: '#f43f5e', visible: true },
    ],
  },
  {
    name: 'Trigonometric Resonance',
    functions: [
      { expression: 'sin(x)', type: 'cartesian2d', color: '#38bdf8', visible: true },
      { expression: 'cos(2*x)', type: 'cartesian2d', color: '#10b981', visible: true },
      { expression: 'sin(x) * cos(2*x)', type: 'cartesian2d', color: '#a855f7', visible: true },
    ],
  },
  {
    name: 'Polar Rose Curve',
    functions: [
      { expression: '3 * cos(4 * theta)', type: 'polar', color: '#ec4899', visible: true },
    ],
  },
  {
    name: 'Parametric Butterfly / Lissajous',
    functions: [
      {
        expression: 'sin(3 * t)',
        parametricY: 'sin(4 * t)',
        type: 'parametric2d',
        color: '#f59e0b',
        visible: true,
      },
    ],
  },
  {
    name: 'Inequality Region',
    functions: [
      { expression: 'x^2 - 4', type: 'inequality', inequalityOp: '>=', color: '#3b82f6', visible: true },
    ],
  },
];

const PRESET_3D = [
  { name: 'Water Ripple', expr: 'sin(sqrt(x^2 + y^2))' },
  { name: 'Hyperbolic Paraboloid (Saddle)', expr: '(x^2 - y^2) / 4' },
  { name: 'Sombrero (Bessel-like)', expr: '2 * sin(sqrt(x^2 + y^2) * 1.5) / (sqrt(x^2 + y^2) + 0.5)' },
  { name: 'Trig Peaks & Valleys', expr: 'cos(x) * sin(y)' },
  { name: 'Monkey Saddle', expr: '(x^3 - 3*x*y^2) / 8' },
];

export const GraphingStudio: React.FC<GraphingStudioProps> = ({ language, initialEquation }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d');

  // 2D Graph State
  const [functions, setFunctions] = useState<GraphFunction[]>([
    {
      id: '1',
      expression: initialEquation || 'x^2 - 4',
      type: 'cartesian2d',
      color: '#38bdf8',
      visible: true,
    },
    {
      id: '2',
      expression: '2*x + 1',
      type: 'cartesian2d',
      color: '#ec4899',
      visible: true,
    },
  ]);

  const [newExpr, setNewExpr] = useState('');
  const [newType, setNewType] = useState<GraphFunction['type']>('cartesian2d');
  const [newParamY, setNewParamY] = useState('');
  const [newColor, setNewColor] = useState('#10b981');
  const [ineqOp, setIneqOp] = useState<'<' | '<=' | '>' | '>='>('>=');

  // Viewport 2D state
  const [view2D, setView2D] = useState({
    centerX: 0,
    centerY: 0,
    scale: 40, // pixels per unit
  });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvas2DRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Graph State
  const [surfaceExpr, setSurfaceExpr] = useState('sin(sqrt(x^2 + y^2))');
  const [gridRes, setGridRes] = useState(45);
  const [wireframe, setWireframe] = useState(false);
  const [colorMap, setColorMap] = useState<'cyan' | 'viridis' | 'sunset'>('cyan');
  const [range3D, setRange3D] = useState(6);
  const canvas3DContainerRef = useRef<HTMLDivElement | null>(null);
  const threeStateRef = useRef<any>(null);

  // If initialEquation updates from outside
  useEffect(() => {
    if (initialEquation) {
      setFunctions((prev) => [
        {
          id: Date.now().toString(),
          expression: initialEquation,
          type: 'cartesian2d',
          color: '#38bdf8',
          visible: true,
        },
        ...prev,
      ]);
    }
  }, [initialEquation]);

  // ----------------------------------------------------
  // 2D CANVAS DRAWING LOGIC
  // ----------------------------------------------------
  const draw2DGraph = useCallback(() => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const { centerX, centerY, scale } = view2D;

    // Clear background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    // Screen to math coordinates
    const toScreenX = (x: number) => width / 2 + (x - centerX) * scale;
    const toScreenY = (y: number) => height / 2 - (y - centerY) * scale;
    const toMathX = (px: number) => centerX + (px - width / 2) / scale;
    const toMathY = (py: number) => centerY - (py - height / 2) / scale;

    const xMin = toMathX(0);
    const xMax = toMathX(width);
    const yMin = toMathY(height);
    const yMax = toMathY(0);

    // Auto calculate grid step
    let gridStep = 1;
    const targetPixelStep = 60;
    const rawStep = targetPixelStep / scale;
    const power = Math.floor(Math.log10(rawStep));
    const magnitude = Math.pow(10, power);
    const normalized = rawStep / magnitude;

    if (normalized < 1.5) gridStep = magnitude;
    else if (normalized < 3.5) gridStep = 2 * magnitude;
    else if (normalized < 7.5) gridStep = 5 * magnitude;
    else gridStep = 10 * magnitude;

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.font = '10px "Fira Code", monospace';

    // Vertical grid
    const firstGridX = Math.floor(xMin / gridStep) * gridStep;
    for (let x = firstGridX; x <= xMax; x += gridStep) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-6) {
        ctx.fillText(Number(x.toFixed(4)).toString(), sx + 3, toScreenY(0) + 14);
      }
    }

    // Horizontal grid
    const firstGridY = Math.floor(yMin / gridStep) * gridStep;
    for (let y = firstGridY; y <= yMax; y += gridStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        ctx.fillText(Number(y.toFixed(4)).toString(), toScreenX(0) + 4, sy - 3);
      }
    }

    // Draw Axes (X and Y)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;

    // X Axis
    const axisY = toScreenY(0);
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(width, axisY);
    ctx.stroke();

    // Y Axis
    const axisX = toScreenX(0);
    ctx.beginPath();
    ctx.moveTo(axisX, 0);
    ctx.lineTo(axisX, height);
    ctx.stroke();

    // Origin label
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('(0,0)', axisX + 4, axisY + 14);

    // Plot Functions
    for (const fn of functions) {
      if (!fn.visible) continue;

      ctx.save();
      ctx.strokeStyle = fn.color;
      ctx.fillStyle = fn.color;
      ctx.lineWidth = 2.5;

      try {
        if (fn.type === 'cartesian2d') {
          const compiled = math.parse(fn.expression).compile();
          ctx.beginPath();
          let started = false;

          const stepPx = 1.5;
          for (let px = 0; px <= width; px += stepPx) {
            const mx = toMathX(px);
            try {
              const my = compiled.evaluate({ x: mx });
              if (typeof my === 'number' && !isNaN(my) && isFinite(my)) {
                const py = toScreenY(my);
                if (!started) {
                  ctx.moveTo(px, py);
                  started = true;
                } else {
                  // Prevent drawing across vertical asymptotes
                  if (Math.abs(py) < height * 3) {
                    ctx.lineTo(px, py);
                  } else {
                    started = false;
                  }
                }
              } else {
                started = false;
              }
            } catch {
              started = false;
            }
          }
          ctx.stroke();
        } else if (fn.type === 'inequality') {
          // Shaded inequality region
          const compiled = math.parse(fn.expression).compile();
          ctx.fillStyle = `${fn.color}22`; // 13% opacity

          const stepPx = 2;
          for (let px = 0; px <= width; px += stepPx) {
            const mx = toMathX(px);
            try {
              const boundaryY = compiled.evaluate({ x: mx });
              if (typeof boundaryY === 'number' && !isNaN(boundaryY)) {
                const py = toScreenY(boundaryY);
                if (fn.inequalityOp === '>' || fn.inequalityOp === '>=') {
                  ctx.fillRect(px, 0, stepPx, Math.max(0, py));
                } else {
                  ctx.fillRect(px, py, stepPx, Math.max(0, height - py));
                }
              }
            } catch {}
          }

          // Boundary curve
          ctx.beginPath();
          ctx.setLineDash(fn.inequalityOp === '>' || fn.inequalityOp === '<' ? [6, 4] : []);
          let started = false;
          for (let px = 0; px <= width; px += 2) {
            const mx = toMathX(px);
            try {
              const my = compiled.evaluate({ x: mx });
              if (typeof my === 'number' && !isNaN(my)) {
                const py = toScreenY(my);
                if (!started) {
                  ctx.moveTo(px, py);
                  started = true;
                } else {
                  ctx.lineTo(px, py);
                }
              }
            } catch {}
          }
          ctx.stroke();
        } else if (fn.type === 'polar') {
          // Polar curve r(theta)
          const compiled = math.parse(fn.expression).compile();
          ctx.beginPath();
          let started = false;
          const thetaMax = 4 * Math.PI;
          const dTheta = 0.02;

          for (let th = 0; th <= thetaMax; th += dTheta) {
            try {
              const r = compiled.evaluate({ theta: th, th });
              if (typeof r === 'number' && !isNaN(r)) {
                const mx = r * Math.cos(th);
                const my = r * Math.sin(th);
                const px = toScreenX(mx);
                const py = toScreenY(my);
                if (!started) {
                  ctx.moveTo(px, py);
                  started = true;
                } else {
                  ctx.lineTo(px, py);
                }
              }
            } catch {}
          }
          ctx.stroke();
        } else if (fn.type === 'parametric2d' && fn.parametricY) {
          // Parametric curve x(t), y(t)
          const compX = math.parse(fn.expression).compile();
          const compY = math.parse(fn.parametricY).compile();
          ctx.beginPath();
          let started = false;
          const tMin = -10;
          const tMax = 10;
          const dt = 0.02;

          for (let tVal = tMin; tVal <= tMax; tVal += dt) {
            try {
              const mx = compX.evaluate({ t: tVal });
              const my = compY.evaluate({ t: tVal });
              if (typeof mx === 'number' && typeof my === 'number' && !isNaN(mx) && !isNaN(my)) {
                const px = toScreenX(mx);
                const py = toScreenY(my);
                if (!started) {
                  ctx.moveTo(px, py);
                  started = true;
                } else {
                  ctx.lineTo(px, py);
                }
              }
            } catch {}
          }
          ctx.stroke();
        }
      } catch (err) {
        console.warn('Error plotting function:', fn.expression, err);
      }
      ctx.restore();
    }

    // Draw hover coordinate indicator
    if (hoverCoord) {
      const hpx = toScreenX(hoverCoord.x);
      const hpy = toScreenY(hoverCoord.y);

      // Crosshair
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hpx, 0);
      ctx.lineTo(hpx, height);
      ctx.moveTo(0, hpy);
      ctx.lineTo(width, hpy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(hpx, hpy, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [view2D, functions, hoverCoord]);

  // Handle Canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvas2DRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = Math.max(480, rect.height || 520);
        draw2DGraph();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw2DGraph]);

  useEffect(() => {
    if (activeTab === '2d') {
      draw2DGraph();
    }
  }, [activeTab, draw2DGraph]);

  // Mouse handlers for 2D Canvas (Pan & Zoom)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const mx = view2D.centerX + (px - canvas.width / 2) / view2D.scale;
    const my = view2D.centerY - (py - canvas.height / 2) / view2D.scale;
    setHoverCoord({ x: Number(mx.toFixed(3)), y: Number(my.toFixed(3)) });

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setView2D((prev) => ({
        ...prev,
        centerX: prev.centerX - dx / prev.scale,
        centerY: prev.centerY + dy / prev.scale,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setView2D((prev) => ({
      ...prev,
      scale: Math.max(5, Math.min(600, prev.scale * zoomFactor)),
    }));
  };

  // ----------------------------------------------------
  // 3D THREE.JS SURFACE ENGINE
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab !== '3d' || !canvas3DContainerRef.current) return;

    const container = canvas3DContainerRef.current;
    const width = container.clientWidth || 600;
    const height = 500;

    // Create Three scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 12, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.8);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Coordinate Axes grid
    const gridHelper = new THREE.GridHelper(range3D * 2, 20, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(range3D);
    scene.add(axesHelper);

    // Build Surface Mesh
    let surfaceMesh: THREE.Mesh | null = null;

    const buildSurface = () => {
      if (surfaceMesh) {
        scene.remove(surfaceMesh);
        surfaceMesh.geometry.dispose();
      }

      const segments = gridRes;
      const geometry = new THREE.PlaneGeometry(range3D * 2, range3D * 2, segments, segments);
      geometry.rotateX(-Math.PI / 2); // Orient horizontal

      const pos = geometry.attributes.position;
      const colors: number[] = [];

      let compiled: any = null;
      try {
        compiled = math.parse(surfaceExpr).compile();
      } catch {
        compiled = null;
      }

      let zMin = Infinity;
      let zMax = -Infinity;
      const zValues: number[] = [];

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getZ(i); // z in plane geometry is y in math
        let z = 0;
        if (compiled) {
          try {
            const val = compiled.evaluate({ x, y });
            if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
              z = Math.max(-range3D * 2, Math.min(range3D * 2, val));
            }
          } catch {}
        }
        pos.setY(i, z);
        zValues.push(z);
        if (z < zMin) zMin = z;
        if (z > zMax) zMax = z;
      }

      pos.needsUpdate = true;
      geometry.computeVertexNormals();

      // Vertex Coloring
      const zDiff = Math.max(0.01, zMax - zMin);
      const colorHelper = new THREE.Color();

      for (let i = 0; i < pos.count; i++) {
        const normZ = (zValues[i] - zMin) / zDiff;
        if (colorMap === 'cyan') {
          colorHelper.setHSL(0.55 + normZ * 0.15, 0.9, 0.3 + normZ * 0.4);
        } else if (colorMap === 'viridis') {
          colorHelper.setHSL(0.7 - normZ * 0.5, 0.85, 0.35 + normZ * 0.3);
        } else {
          // sunset
          colorHelper.setHSL(0.95 - normZ * 0.25, 0.95, 0.4 + normZ * 0.3);
        }
        colors.push(colorHelper.r, colorHelper.g, colorHelper.b);
      }

      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        wireframe,
        side: THREE.DoubleSide,
        roughness: 0.3,
        metalness: 0.2,
      });

      surfaceMesh = new THREE.Mesh(geometry, material);
      scene.add(surfaceMesh);
    };

    buildSurface();

    // Orbit Controls Simulation
    let isOrbiting = false;
    let prevMouse = { x: 0, y: 0 };
    let theta = Math.PI / 4;
    let phi = Math.PI / 4;
    let radius = 22;

    const updateCamera = () => {
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const onMouseDown = (e: MouseEvent) => {
      isOrbiting = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isOrbiting) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      theta -= dx * 0.008;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - dy * 0.008));
      prevMouse = { x: e.clientX, y: e.clientY };
      updateCamera();
    };

    const onMouseUp = () => (isOrbiting = false);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(5, Math.min(60, radius + e.deltaY * 0.02));
      updateCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    threeStateRef.current = {
      rebuild: buildSurface,
      scene,
    };

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [activeTab, surfaceExpr, gridRes, wireframe, colorMap, range3D]);

  // Add a new function in 2D
  const handleAddFunction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpr.trim()) return;

    setFunctions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        expression: newExpr.trim(),
        type: newType,
        parametricY: newType === 'parametric2d' ? newParamY : undefined,
        color: newColor,
        visible: true,
        inequalityOp: newType === 'inequality' ? ineqOp : undefined,
      },
    ]);
    setNewExpr('');
    setNewParamY('');
  };

  const toggleVisibility = (id: string) => {
    setFunctions((prev) => prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)));
  };

  const removeFunction = (id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {t.graphing.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t.graphing.description}</p>
        </div>

        {/* 2D / 3D Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-sky-500/20">
          <button
            onClick={() => setActiveTab('2d')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === '2d'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.graphing.mode2d}
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === '3d'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.graphing.mode3d}
          </button>
        </div>
      </div>

      {activeTab === '2d' ? (
        /* ------------------------------------------- */
        /* 2D GRAPHING INTERFACE                       */
        /* ------------------------------------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 2D Canvas Area */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-sky-500/20 bg-[#060913] shadow-2xl">
              <canvas
                ref={canvas2DRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                className="w-full cursor-crosshair block"
                style={{ height: '540px' }}
              />

              {/* Floating Coordinates Tag */}
              {hoverCoord && (
                <div className="absolute top-4 start-4 bg-slate-900/90 backdrop-blur-md border border-sky-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-sky-400 shadow-lg pointer-events-none">
                  X: <span className="text-white font-bold">{hoverCoord.x}</span> &nbsp;|&nbsp; Y:{' '}
                  <span className="text-white font-bold">{hoverCoord.y}</span>
                </div>
              )}

              {/* Zoom & Reset Controls */}
              <div className="absolute bottom-4 end-4 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-sky-500/30 shadow-xl">
                <button
                  onClick={() => setView2D((p) => ({ ...p, scale: p.scale * 1.25 }))}
                  title={t.common.zoomIn}
                  className="p-2 hover:bg-slate-800 text-slate-300 hover:text-sky-400 rounded-lg transition"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView2D((p) => ({ ...p, scale: p.scale * 0.8 }))}
                  title={t.common.zoomOut}
                  className="p-2 hover:bg-slate-800 text-slate-300 hover:text-sky-400 rounded-lg transition"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView2D({ centerX: 0, centerY: 0, scale: 40 })}
                  title={t.common.centerOrigin}
                  className="p-2 hover:bg-slate-800 text-slate-300 hover:text-sky-400 rounded-lg transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Curated Presets Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t.common.examples}:
              </span>
              {PRESET_2D.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFunctions(
                      preset.functions.map((fn, fIdx) => ({
                        ...fn,
                        id: `${Date.now()}_${fIdx}`,
                      }))
                    );
                  }}
                  className="px-3 py-1 bg-slate-900/80 hover:bg-sky-500/10 border border-slate-800 hover:border-sky-500/30 text-slate-300 hover:text-sky-400 rounded-lg transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Functions Manager Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Add New Function Form */}
            <form onSubmit={handleAddFunction} className="glass-panel p-4 rounded-2xl space-y-3">
              <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" /> {t.graphing.addFunction}
              </h3>

              {/* Function Type Selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                {(['cartesian2d', 'polar', 'parametric2d', 'inequality'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewType(type)}
                    className={`py-1.5 px-2 rounded-lg font-medium transition ${
                      newType === type ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {type === 'cartesian2d'
                      ? 'y = f(x)'
                      : type === 'polar'
                      ? 'r(θ)'
                      : type === 'parametric2d'
                      ? 'x(t), y(t)'
                      : 'y ≥ f(x)'}
                  </button>
                ))}
              </div>

              {/* Function Input Field */}
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    {newType === 'cartesian2d'
                      ? 'f(x)='
                      : newType === 'polar'
                      ? 'r(θ)='
                      : newType === 'parametric2d'
                      ? 'x(t)='
                      : 'f(x)='}
                  </span>
                  <input
                    type="text"
                    value={newExpr}
                    onChange={(e) => setNewExpr(e.target.value)}
                    placeholder={
                      newType === 'cartesian2d'
                        ? 'sin(x) or x^2 - 2'
                        : newType === 'polar'
                        ? '2 * cos(3 * theta)'
                        : newType === 'parametric2d'
                        ? 'cos(t)'
                        : 'x^2 - 4'
                    }
                    className="w-full ps-14 pe-3 py-2 bg-slate-900/90 border border-slate-700 focus:border-sky-400 rounded-xl text-sm font-mono text-white placeholder-slate-500 outline-none transition"
                  />
                </div>

                {newType === 'parametric2d' && (
                  <div className="relative">
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      y(t)=
                    </span>
                    <input
                      type="text"
                      value={newParamY}
                      onChange={(e) => setNewParamY(e.target.value)}
                      placeholder="sin(t)"
                      className="w-full ps-14 pe-3 py-2 bg-slate-900/90 border border-slate-700 focus:border-sky-400 rounded-xl text-sm font-mono text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                )}

                {newType === 'inequality' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Region: y</span>
                    {(['>=', '<=', '>', '<'] as const).map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setIneqOp(op)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                          ineqOp === op ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                )}

                {/* Color Selector & Submit */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {['#38bdf8', '#ec4899', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full transition transform ${
                          newColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110 opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/20"
                  >
                    {t.graphing.addFunction}
                  </button>
                </div>
              </div>
            </form>

            {/* List of Plotted Functions */}
            <div className="glass-panel p-4 rounded-2xl space-y-2">
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                {t.graphing.functionsList} ({functions.length})
              </h3>

              <div className="space-y-2 max-h-80 overflow-y-auto pe-1">
                {functions.map((fn) => (
                  <div
                    key={fn.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 group hover:border-sky-500/30 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: fn.color }} />
                      <div className="font-mono text-xs text-slate-200 truncate">
                        {fn.type === 'cartesian2d'
                          ? `y = ${fn.expression}`
                          : fn.type === 'polar'
                          ? `r = ${fn.expression}`
                          : fn.type === 'parametric2d'
                          ? `(x: ${fn.expression}, y: ${fn.parametricY})`
                          : `y ${fn.inequalityOp} ${fn.expression}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleVisibility(fn.id)}
                        className="p-1 text-slate-400 hover:text-sky-400 transition"
                      >
                        {fn.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                      </button>
                      <button
                        onClick={() => removeFunction(fn.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------- */
        /* 3D SURFACE GRAPHING INTERFACE               */
        /* ------------------------------------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-sky-500/20 bg-[#060913] shadow-2xl">
              <div ref={canvas3DContainerRef} className="w-full" style={{ height: '520px' }} />

              {/* 3D Rotation Instructions */}
              <div className="absolute top-4 start-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-sky-500/20 text-xs font-mono text-sky-300">
                Left Drag: Rotate 3D &nbsp;|&nbsp; Scroll: Zoom &nbsp;|&nbsp; Formula: {surfaceExpr}
              </div>
            </div>

            {/* 3D Preset Surfaces */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t.graphing.presets}:
              </span>
              {PRESET_3D.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSurfaceExpr(preset.expr)}
                  className={`px-3 py-1 rounded-lg border text-xs transition ${
                    surfaceExpr === preset.expr
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                      : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Parameters & Controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" /> 3D Surface Parameters
              </h3>

              {/* Surface Equation Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono">z = f(x, y)</label>
                <input
                  type="text"
                  value={surfaceExpr}
                  onChange={(e) => setSurfaceExpr(e.target.value)}
                  placeholder="sin(sqrt(x^2 + y^2))"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl text-sm font-mono text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              {/* Grid Resolution Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{t.graphing.plotResolution}</span>
                  <span className="font-mono text-sky-400">
                    {gridRes} × {gridRes}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={gridRes}
                  onChange={(e) => setGridRes(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Spatial Bounds Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Spatial Range [-R, R]</span>
                  <span className="font-mono text-sky-400">R = {range3D}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={range3D}
                  onChange={(e) => setRange3D(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Color Map Palette */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">{t.graphing.colorPalette}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cyan', 'viridis', 'sunset'] as const).map((pal) => (
                    <button
                      key={pal}
                      onClick={() => setColorMap(pal)}
                      className={`py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition ${
                        colorMap === pal
                          ? 'border-sky-400 bg-sky-500/20 text-sky-300 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wireframe Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setWireframe(!wireframe)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                    wireframe
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {wireframe ? 'Disable Wireframe' : 'Enable Wireframe Mesh'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
