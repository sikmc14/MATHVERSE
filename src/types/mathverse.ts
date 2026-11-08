export type ToolSection =
  | 'solver'
  | 'graphing'
  | 'calculator'
  | 'calculus'
  | 'matrices'
  | 'statistics'
  | 'converter'
  | 'formulas'
  | 'imageToMath'
  | 'projects';

export type Language = 'en' | 'ar';

export interface EquationSolution {
  originalEquation: string;
  category: string;
  methodUsed: string;
  variable: string;
  exactSolutions: string[];
  numericSolutions: number[];
  steps: SolutionStep[];
  domainRestrictions?: string[];
  verification: VerificationResult[];
  graphableFunction?: string;
  notes?: string;
}

export interface SolutionStep {
  title: string;
  latex?: string;
  description: string;
  substeps?: string[];
}

export interface VerificationResult {
  candidate: string;
  lhsValue: string;
  rhsValue: string;
  isValid: boolean;
  residual?: number;
}

export interface GraphFunction {
  id: string;
  expression: string; // e.g. "x^2 - 4" or "sin(x)"
  type: 'cartesian2d' | 'polar' | 'parametric2d' | 'inequality' | 'surface3d';
  parametricY?: string; // for parametric (y(t))
  color: string;
  visible: boolean;
  inequalityOp?: '<' | '<=' | '>' | '>=';
}

export interface FormulaItem {
  id: string;
  name: { en: string; ar: string };
  category: 'algebra' | 'geometry' | 'trigonometry' | 'calculus' | 'physics' | 'chemistry' | 'matrices';
  latex: string;
  cleanExpr: string;
  description: { en: string; ar: string };
  variables: { symbol: string; desc: { en: string; ar: string } }[];
  targetTool: ToolSection;
}

export interface SavedProject {
  id: string;
  title: string;
  date: string;
  section: ToolSection;
  data: any;
  notes?: string;
}

export interface UnitCategory {
  id: string;
  name: { en: string; ar: string };
  iconName: string;
  units: {
    id: string;
    symbol: string;
    name: { en: string; ar: string };
    toBase: (val: number) => number;
    fromBase: (val: number) => number;
  }[];
}
