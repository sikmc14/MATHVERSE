import React, { useState, useEffect } from 'react';
import { Download, Upload, Printer, Trash2, FolderOpen, Plus, Clock, FileText } from 'lucide-react';
import { Language, ToolSection, SavedProject } from '../../types/mathverse';
import { translations } from '../../services/i18n';

interface SavedProjectsProps {
  language: Language;
  onLoadProject: (tool: ToolSection, data: any) => void;
}

const STORAGE_KEY = 'mathverse_saved_projects_v1';

export const SavedProjects: React.FC<SavedProjectsProps> = ({ language, onLoadProject }) => {
  const t = translations[language];

  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newSection, setNewSection] = useState<ToolSection>('solver');
  const [newNotes, setNewNotes] = useState('');

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProjects(JSON.parse(stored));
      } else {
        // Initial sample saved project
        const initialSample: SavedProject[] = [
          {
            id: 'sample_1',
            title: 'Quadratic Trajectory Simulation',
            date: new Date().toLocaleDateString(),
            section: 'solver',
            data: { equation: '2*x^2 - 8*x + 6 = 0' },
            notes: 'Standard ballistic physics trajectory roots.',
          },
          {
            id: 'sample_2',
            title: '3D Ripple Harmonic Wave Analysis',
            date: new Date().toLocaleDateString(),
            section: 'graphing',
            data: { equation: 'sin(sqrt(x^2 + y^2))' },
            notes: 'Circular Bessel-like surface visualization.',
          },
        ];
        setProjects(initialSample);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSample));
      }
    } catch {}
  }, []);

  const saveProjectsToStorage = (updated: SavedProject[]) => {
    setProjects(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj: SavedProject = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      date: new Date().toLocaleDateString(),
      section: newSection,
      data: {},
      notes: newNotes.trim() || undefined,
    };

    saveProjectsToStorage([newProj, ...projects]);
    setNewTitle('');
    setNewNotes('');
  };

  const handleDelete = (id: string) => {
    saveProjectsToStorage(projects.filter((p) => p.id !== id));
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mathverse_workspace_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          saveProjectsToStorage([...parsed, ...projects]);
        }
      } catch {
        alert('Invalid workspace JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {t.projects.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t.projects.description}</p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-sky-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            {t.projects.exportJson}
          </button>

          <label className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-sky-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
            <Upload className="w-4 h-4" />
            {t.projects.importJson}
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-sky-500/20"
          >
            <Printer className="w-4 h-4" />
            {t.projects.printReport}
          </button>
        </div>
      </div>

      {/* Create New Notebook / Project */}
      <form onSubmit={handleCreateProject} className="glass-panel-glow p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Plus className="w-4 h-4 text-sky-400" /> Save Current Calculation / New Notebook
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Project or problem title (e.g. Aerodynamic Drag Coefficient Analysis)"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={newSection}
              onChange={(e: any) => setNewSection(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-sky-300 outline-none"
            >
              <option value="solver">{t.tabs.solver}</option>
              <option value="graphing">{t.tabs.graphing}</option>
              <option value="calculus">{t.tabs.calculus}</option>
              <option value="matrices">{t.tabs.matrices}</option>
              <option value="statistics">{t.tabs.statistics}</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/20"
            >
              {t.common.save}
            </button>
          </div>
        </div>
      </form>

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-500 text-sm">
            {t.projects.noProjectsYet}
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-sky-500/30 flex items-center justify-between gap-4 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {t.tabs[proj.section] || proj.section}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {proj.date}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-200">{proj.title}</h4>
                {proj.notes && <p className="text-xs text-slate-400">{proj.notes}</p>}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onLoadProject(proj.section, proj.data)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-sky-500/20 border border-slate-800 hover:border-sky-500/40 text-sky-300 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  {t.common.load}
                </button>

                <button
                  onClick={() => handleDelete(proj.id)}
                  className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
