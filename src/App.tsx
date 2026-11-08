/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FunctionSquare,
  LineChart,
  Calculator,
  Sigma,
  Grid,
  BarChart2,
  ArrowRightLeft,
  BookOpen,
  Camera,
  FolderArchive,
  Globe,
  Compass,
  Atom,
} from 'lucide-react';

import { ToolSection, Language, FormulaItem } from './types/mathverse';
import { translations } from './services/i18n';

// Child components
import { EquationSolver } from './components/EquationSolver/EquationSolver';
import { GraphingStudio } from './components/GraphingStudio/GraphingStudio';
import { ScientificCalculator } from './components/ScientificCalculator/ScientificCalculator';
import { CalculusWorkspace } from './components/CalculusWorkspace/CalculusWorkspace';
import { MatricesVectors } from './components/MatricesVectors/MatricesVectors';
import { StatisticsWorkspace } from './components/StatisticsWorkspace/StatisticsWorkspace';
import { UnitConverter } from './components/UnitConverter/UnitConverter';
import { FormulaLibrary } from './components/FormulaLibrary/FormulaLibrary';
import { ImageToMath } from './components/ImageToMath/ImageToMath';
import { SavedProjects } from './components/SavedProjects/SavedProjects';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<ToolSection>('solver');
  const [passedEquation, setPassedEquation] = useState<string | undefined>(undefined);

  const t = translations[language];

  // Sync RTL and lang attribute
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleNavigateToTab = (tab: ToolSection, data?: any) => {
    if (data?.equation) {
      setPassedEquation(data.equation);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadFormula = (tool: ToolSection, formula: FormulaItem) => {
    setPassedEquation(formula.cleanExpr);
    setActiveTab(tool);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: { id: ToolSection; label: string; icon: React.ReactNode }[] = [
    { id: 'solver', label: t.tabs.solver, icon: <FunctionSquare className="w-4 h-4" /> },
    { id: 'graphing', label: t.tabs.graphing, icon: <LineChart className="w-4 h-4" /> },
    { id: 'calculator', label: t.tabs.calculator, icon: <Calculator className="w-4 h-4" /> },
    { id: 'calculus', label: t.tabs.calculus, icon: <Sigma className="w-4 h-4" /> },
    { id: 'matrices', label: t.tabs.matrices, icon: <Grid className="w-4 h-4" /> },
    { id: 'statistics', label: t.tabs.statistics, icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'converter', label: t.tabs.converter, icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'formulas', label: t.tabs.formulas, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'imageToMath', label: t.tabs.imageToMath, icon: <Camera className="w-4 h-4" /> },
    { id: 'projects', label: t.tabs.projects, icon: <FolderArchive className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950 font-sans">
      {/* Top Futuristic Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-sky-500/20 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-600 p-[1.5px] shadow-lg shadow-sky-500/25">
              <div className="w-full h-full bg-[#060913] rounded-[10px] flex items-center justify-center">
                <Atom className="w-5 h-5 text-sky-400 animate-spin-slow" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider bg-gradient-to-r from-sky-400 via-cyan-300 to-white bg-clip-text text-transparent">
                  MATHVERSE
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  PRO v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-sky-500/10 border border-sky-500/30 hover:border-sky-400 text-xs font-semibold text-sky-300 transition flex items-center gap-2 cursor-pointer shadow-sm"
              title="Switch Language / تبديل اللغة"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-3 overflow-x-auto pb-1 scrollbar-none">
          <nav className="flex items-center gap-1.5 min-w-max">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-sky-500/25 ring-1 ring-sky-400/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'solver' && (
          <EquationSolver
            language={language}
            onNavigateToTab={handleNavigateToTab}
            initialEquation={passedEquation}
          />
        )}

        {activeTab === 'graphing' && (
          <GraphingStudio
            language={language}
            initialEquation={passedEquation}
          />
        )}

        {activeTab === 'calculator' && (
          <ScientificCalculator language={language} />
        )}

        {activeTab === 'calculus' && (
          <CalculusWorkspace
            language={language}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {activeTab === 'matrices' && (
          <MatricesVectors language={language} />
        )}

        {activeTab === 'statistics' && (
          <StatisticsWorkspace language={language} />
        )}

        {activeTab === 'converter' && (
          <UnitConverter language={language} />
        )}

        {activeTab === 'formulas' && (
          <FormulaLibrary
            language={language}
            onLoadFormula={handleLoadFormula}
          />
        )}

        {activeTab === 'imageToMath' && (
          <ImageToMath
            language={language}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {activeTab === 'projects' && (
          <SavedProjects
            language={language}
            onLoadProject={handleNavigateToTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#04060c] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">MATHVERSE Workspace</span>
            <span>•</span>
            <span>Rigorous Symbolic Computation & Scientific Visualization</span>
          </div>
          <div>
            English & العربية • Multi-platform Professional Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
