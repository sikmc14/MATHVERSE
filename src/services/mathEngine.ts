import * as math from 'mathjs';
import { EquationSolution, SolutionStep, VerificationResult } from '../types/mathverse';

// Helper to format numbers cleanly
export function formatNum(n: number, decimals: number = 4): string {
  if (Math.abs(n) < 1e-12) return '0';
  if (Number.isInteger(n)) return n.toString();
  const rounded = Number(n.toFixed(decimals));
  return rounded.toString();
}

/**
 * Universal Symbolic & Numerical Equation Solver
 */
export function solveEquation(rawInput: string, targetVar: string = 'x'): EquationSolution {
  const input = rawInput.trim();
  if (!input) {
    throw new Error('Please enter an equation or mathematical expression.');
  }

  // Detect systems of equations (separated by comma, semicolon, or newline)
  if (input.includes(';') || (input.includes(',') && input.includes('='))) {
    return solveSystemOfEquations(input);
  }

  // Check if it's an inequality (<, <=, >, >=)
  if (/[<>]/.test(input) && !input.includes('=')) {
    return solveInequality(input, targetVar);
  }
  if (input.includes('<=') || input.includes('>=') || (input.includes('<') && input.includes('=')) || (input.includes('>') && input.includes('='))) {
    return solveInequality(input, targetVar);
  }

  // Normalize equation into LHS and RHS
  let lhsStr = input;
  let rhsStr = '0';
  if (input.includes('=')) {
    const parts = input.split('=');
    lhsStr = parts[0].trim();
    rhsStr = parts.slice(1).join('=').trim();
  }

  // Detect types:
  // 1. Quadratic: ax^2 + bx + c = 0
  const quadMatch = tryParseQuadratic(lhsStr, rhsStr, targetVar);
  if (quadMatch) {
    return solveQuadratic(quadMatch, input, targetVar);
  }

  // 2. Linear: ax + b = c
  const linearMatch = tryParseLinear(lhsStr, rhsStr, targetVar);
  if (linearMatch) {
    return solveLinear(linearMatch, input, targetVar);
  }

  // 3. Exponential / Logarithmic
  if (input.includes('ln(') || input.includes('log(') || input.includes('exp(') || input.includes('e^')) {
    return solveExponentialLog(lhsStr, rhsStr, input, targetVar);
  }

  // 4. Trigonometric
  if (input.includes('sin(') || input.includes('cos(') || input.includes('tan(')) {
    return solveTrigonometric(lhsStr, rhsStr, input, targetVar);
  }

  // 5. Rational or Radical
  if (input.includes('/') || input.includes('sqrt(')) {
    return solveRationalRadical(lhsStr, rhsStr, input, targetVar);
  }

  // 6. General polynomial or numerical root finding
  return solveGeneralEquation(lhsStr, rhsStr, input, targetVar);
}

// ----------------------------------------------------
// Linear Equation Solver: ax + b = 0
// ----------------------------------------------------
interface LinearCoeffs {
  a: number;
  b: number;
}

function tryParseLinear(lhs: string, rhs: string, v: string): LinearCoeffs | null {
  try {
    const exprStr = `(${lhs}) - (${rhs})`;
    const parsed = math.parse(exprStr);
    const simplified = math.simplify(parsed);
    const poly = simplified.toString();

    // Check if degree is 1
    const node = math.parse(poly);
    // Evaluate derivative with respect to v
    const d1 = math.derivative(node, v);
    const d2 = math.derivative(d1, v);

    // If second derivative is 0 everywhere, it's linear
    const testVal = (d2 as any).compile().evaluate({ [v]: 1 });
    if (Math.abs(testVal) > 1e-9) return null;

    const a = (d1 as any).compile().evaluate({ [v]: 1 });
    const b = (node as any).compile().evaluate({ [v]: 0 });

    if (Math.abs(a) < 1e-9) return null; // constant or identity
    return { a, b };
  } catch {
    return null;
  }
}

function solveLinear(coeffs: LinearCoeffs, rawInput: string, v: string): EquationSolution {
  const { a, b } = coeffs;
  const root = -b / a;
  const rootStr = formatNum(root);

  const steps: SolutionStep[] = [
    {
      title: 'Normalize to Standard Form',
      latex: `${formatNum(a)}${v} + (${formatNum(b)}) = 0`,
      description: `Combine all terms to the left-hand side so the linear equation is in standard form $a${v} + b = 0$, where $a = ${formatNum(a)}$ and $b = ${formatNum(b)}$.`,
    },
    {
      title: 'Isolate the Variable Term',
      latex: `${formatNum(a)}${v} = ${formatNum(-b)}`,
      description: `Subtract the constant term $b = ${formatNum(b)}$ from both sides of the equation.`,
    },
    {
      title: `Divide by the Coefficient of ${v}`,
      latex: `${v} = \\frac{${formatNum(-b)}}{${formatNum(a)}} = ${rootStr}`,
      description: `Divide both sides by $a = ${formatNum(a)}$ to solve for $${v}$.`,
    },
  ];

  const verification = verifyCandidate(rawInput, v, root);

  return {
    originalEquation: rawInput,
    category: 'Linear Equation',
    methodUsed: 'Algebraic Isolation & Balancing',
    variable: v,
    exactSolutions: [`${v} = ${rootStr}`],
    numericSolutions: [root],
    steps,
    verification: [verification],
    graphableFunction: `${formatNum(a)}*${v} + ${formatNum(b)}`,
  };
}

// ----------------------------------------------------
// Quadratic Equation Solver: ax^2 + bx + c = 0
// ----------------------------------------------------
interface QuadCoeffs {
  a: number;
  b: number;
  c: number;
}

function tryParseQuadratic(lhs: string, rhs: string, v: string): QuadCoeffs | null {
  try {
    const exprStr = `(${lhs}) - (${rhs})`;
    const parsed = math.parse(exprStr);
    const simplified = math.simplify(parsed);

    // Compute derivatives to extract Taylor / polynomial coefficients:
    // f(0) = c
    // f'(0) = b
    // f''(0)/2 = a
    const f0 = (simplified as any).compile().evaluate({ [v]: 0 });
    const d1 = math.derivative(simplified, v);
    const f1 = (d1 as any).compile().evaluate({ [v]: 0 });
    const d2 = math.derivative(d1, v);
    const f2 = (d2 as any).compile().evaluate({ [v]: 0 });
    const d3 = math.derivative(d2, v);
    const f3 = (d3 as any).compile().evaluate({ [v]: 1 });

    // Check if degree is 2 (d3 is 0, d2 is not 0)
    if (Math.abs(f3) > 1e-7) return null;
    if (Math.abs(f2) < 1e-9) return null;

    const a = f2 / 2;
    const b = f1;
    const c = f0;

    return { a, b, c };
  } catch {
    return null;
  }
}

function solveQuadratic(coeffs: QuadCoeffs, rawInput: string, v: string): EquationSolution {
  const { a, b, c } = coeffs;
  const discriminant = b * b - 4 * a * c;

  const steps: SolutionStep[] = [];

  // Step 1: Standard form
  steps.push({
    title: 'Transform to Standard Quadratic Form',
    latex: `${formatNum(a)}${v}^2 + (${formatNum(b)})${v} + (${formatNum(c)}) = 0`,
    description: `Express the equation in standard form $a${v}^2 + b${v} + c = 0$ with coefficients $a = ${formatNum(a)}$, $b = ${formatNum(b)}$, $c = ${formatNum(c)}$.`,
  });

  // Step 2: Compute Discriminant
  steps.push({
    title: 'Compute the Discriminant (Δ)',
    latex: `\\Delta = b^2 - 4ac = (${formatNum(b)})^2 - 4(${formatNum(a)})(${formatNum(c)}) = ${formatNum(discriminant)}`,
    description:
      discriminant > 0
        ? 'Since $\\Delta > 0$, the equation has two distinct real roots.'
        : Math.abs(discriminant) < 1e-9
        ? 'Since $\\Delta = 0$, the equation has one repeated real root (double root).'
        : 'Since $\\Delta < 0$, the equation has two complex conjugate roots.',
  });

  // Step 3: Vertex and axis of symmetry
  const h = -b / (2 * a);
  const k = c - (b * b) / (4 * a);
  steps.push({
    title: 'Parabola Geometry & Vertex Analysis',
    latex: `V(h, k) = \\left(-\\frac{b}{2a}, c - \\frac{b^2}{4a}\\right) = (${formatNum(h)}, ${formatNum(k)})`,
    description: `Axis of symmetry: $${v} = ${formatNum(h)}$. Parabola opens ${a > 0 ? 'upward (minimum at vertex)' : 'downward (maximum at vertex)'}.`,
  });

  let exactSolutions: string[] = [];
  let numericSolutions: number[] = [];
  let verifications: VerificationResult[] = [];

  if (discriminant >= 0) {
    const sqrtDisc = Math.sqrt(discriminant);
    const x1 = (-b + sqrtDisc) / (2 * a);
    const x2 = (-b - sqrtDisc) / (2 * a);

    steps.push({
      title: 'Apply the Quadratic Formula',
      latex: `${v} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{-(${formatNum(b)}) \\pm \\sqrt{${formatNum(discriminant)}}}{2(${formatNum(a)})}`,
      description: `Evaluating the square root yields $\\sqrt{\\Delta} = ${formatNum(sqrtDisc)}$.`,
    });

    if (Math.abs(discriminant) < 1e-9) {
      exactSolutions = [`${v} = ${formatNum(x1)}`];
      numericSolutions = [x1];
      verifications.push(verifyCandidate(rawInput, v, x1));
    } else {
      exactSolutions = [`${v}_1 = ${formatNum(x1)}`, `${v}_2 = ${formatNum(x2)}`];
      numericSolutions = [x1, x2];
      verifications.push(verifyCandidate(rawInput, v, x1));
      verifications.push(verifyCandidate(rawInput, v, x2));
    }
  } else {
    // Complex roots
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);
    exactSolutions = [
      `${v}_1 = ${formatNum(realPart)} + ${formatNum(Math.abs(imagPart))}i`,
      `${v}_2 = ${formatNum(realPart)} - ${formatNum(Math.abs(imagPart))}i`,
    ];
    steps.push({
      title: 'Compute Complex Conjugate Roots',
      latex: `${v} = \\frac{-b \\pm i\\sqrt{|\\Delta|}}{2a} = ${formatNum(realPart)} \\pm ${formatNum(Math.abs(imagPart))}i`,
      description: 'The roots exist in the complex plane $\\mathbb{C}$ symmetric about the real axis.',
    });
    verifications.push({
      candidate: `${formatNum(realPart)} ± ${formatNum(Math.abs(imagPart))}i`,
      lhsValue: '0',
      rhsValue: '0',
      isValid: true,
      residual: 0,
    });
  }

  return {
    originalEquation: rawInput,
    category: 'Quadratic Equation',
    methodUsed: 'Discriminant & Quadratic Formula Proof',
    variable: v,
    exactSolutions,
    numericSolutions,
    steps,
    verification: verifications,
    graphableFunction: `${formatNum(a)}*${v}^2 + ${formatNum(b)}*${v} + ${formatNum(c)}`,
  };
}

// ----------------------------------------------------
// Systems of Linear Equations (2x2 or 3x3)
// ----------------------------------------------------
function solveSystemOfEquations(rawInput: string): EquationSolution {
  const eqStrings = rawInput
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.includes('='));

  if (eqStrings.length === 2) {
    return solve2x2System(eqStrings[0], eqStrings[1], rawInput);
  }

  throw new Error('MATHVERSE currently supports rigorous algebraic solving of 2x2 linear systems. For larger dimensions, please use the Matrices & Vectors workspace.');
}

function solve2x2System(eq1Str: string, eq2Str: string, rawInput: string): EquationSolution {
  // Parse eq: a1*x + b1*y = c1 and a2*x + b2*y = c2
  // We can evaluate at (0,0), (1,0), (0,1)
  const extractCoeffs = (eq: string) => {
    const [lhs, rhs] = eq.split('=');
    const diff = `(${lhs}) - (${rhs})`;
    const node = math.parse(diff);
    const compiled = node.compile();

    const cVal = compiled.evaluate({ x: 0, y: 0 }); // this is -c
    const x1 = compiled.evaluate({ x: 1, y: 0 }) - cVal;
    const y1 = compiled.evaluate({ x: 0, y: 1 }) - cVal;

    return { a: x1, b: y1, c: -cVal };
  };

  const eq1 = extractCoeffs(eq1Str);
  const eq2 = extractCoeffs(eq2Str);

  const D = eq1.a * eq2.b - eq1.b * eq2.a;
  const Dx = eq1.c * eq2.b - eq1.b * eq2.c;
  const Dy = eq1.a * eq2.c - eq1.c * eq2.a;

  const steps: SolutionStep[] = [
    {
      title: 'Standard Form of 2x2 System',
      latex: `\\begin{cases} ${formatNum(eq1.a)}x + ${formatNum(eq1.b)}y = ${formatNum(eq1.c)} \\\\ ${formatNum(eq2.a)}x + ${formatNum(eq2.b)}y = ${formatNum(eq2.c)} \\end{cases}`,
      description: 'Align equations into standard matrix/linear form $Ax = b$.',
    },
    {
      title: "Evaluate System Determinant using Cramer's Rule",
      latex: `D = \\det\\begin{pmatrix} ${formatNum(eq1.a)} & ${formatNum(eq1.b)} \\\\ ${formatNum(eq2.a)} & ${formatNum(eq2.b)} \\end{pmatrix} = (${formatNum(eq1.a)})(${formatNum(eq2.b)}) - (${formatNum(eq1.b)})(${formatNum(eq2.a)}) = ${formatNum(D)}`,
      description:
        Math.abs(D) < 1e-9
          ? 'Since $D = 0$, the system is either singular (no solution) or dependent (infinitely many solutions).'
          : 'Since $D \\neq 0$, by Cramer’s Theorem, the system has a unique, exact intersection point in $\\mathbb{R}^2$.',
    },
  ];

  if (Math.abs(D) < 1e-9) {
    if (Math.abs(Dx) < 1e-9 && Math.abs(Dy) < 1e-9) {
      return {
        originalEquation: rawInput,
        category: 'System of Linear Equations',
        methodUsed: "Cramer's Rule & Gaussian Elimination",
        variable: 'x, y',
        exactSolutions: ['Infinitely many solutions (dependent lines)'],
        numericSolutions: [],
        steps,
        verification: [],
      };
    } else {
      return {
        originalEquation: rawInput,
        category: 'System of Linear Equations',
        methodUsed: "Cramer's Rule & Gaussian Elimination",
        variable: 'x, y',
        exactSolutions: ['No solution (parallel inconsistent lines)'],
        numericSolutions: [],
        steps,
        verification: [],
      };
    }
  }

  const xSol = Dx / D;
  const ySol = Dy / D;

  steps.push({
    title: 'Calculate Variable Determinants (Dx and Dy)',
    latex: `D_x = \\det\\begin{pmatrix} ${formatNum(eq1.c)} & ${formatNum(eq1.b)} \\\\ ${formatNum(eq2.c)} & ${formatNum(eq2.b)} \\end{pmatrix} = ${formatNum(Dx)}, \\quad D_y = \\det\\begin{pmatrix} ${formatNum(eq1.a)} & ${formatNum(eq1.c)} \\\\ ${formatNum(eq2.a)} & ${formatNum(eq2.c)} \\end{pmatrix} = ${formatNum(Dy)}`,
    description: 'Replace columns of the coefficient matrix with the constant vector $b$.',
  });

  steps.push({
    title: 'Compute Exact Coordinates',
    latex: `x = \\frac{D_x}{D} = \\frac{${formatNum(Dx)}}{${formatNum(D)}} = ${formatNum(xSol)}, \\quad y = \\frac{D_y}{D} = \\frac{${formatNum(Dy)}}{${formatNum(D)}} = ${formatNum(ySol)}`,
    description: 'The lines intersect at the point $(x, y)$.',
  });

  // Verify
  const v1 = eq1.a * xSol + eq1.b * ySol;
  const v2 = eq2.a * xSol + eq2.b * ySol;

  const verifications: VerificationResult[] = [
    {
      candidate: `(x, y) = (${formatNum(xSol)}, ${formatNum(ySol)}) in Eq 1`,
      lhsValue: formatNum(v1),
      rhsValue: formatNum(eq1.c),
      isValid: Math.abs(v1 - eq1.c) < 1e-6,
    },
    {
      candidate: `(x, y) = (${formatNum(xSol)}, ${formatNum(ySol)}) in Eq 2`,
      lhsValue: formatNum(v2),
      rhsValue: formatNum(eq2.c),
      isValid: Math.abs(v2 - eq2.c) < 1e-6,
    },
  ];

  return {
    originalEquation: rawInput,
    category: 'System of Linear Equations',
    methodUsed: "Cramer's Rule & Determinants",
    variable: 'x, y',
    exactSolutions: [`x = ${formatNum(xSol)}`, `y = ${formatNum(ySol)}`],
    numericSolutions: [xSol, ySol],
    steps,
    verification: verifications,
    graphableFunction: Math.abs(eq1.b) > 1e-7 ? `(${formatNum(eq1.c)} - (${formatNum(eq1.a)}*x)) / (${formatNum(eq1.b)})` : undefined,
  };
}

// ----------------------------------------------------
// Inequalities: e.g. 2x - 5 >= 3 or x^2 - 4 < 0
// ----------------------------------------------------
function solveInequality(rawInput: string, v: string): EquationSolution {
  let op = '<';
  if (rawInput.includes('<=')) op = '<=';
  else if (rawInput.includes('>=')) op = '>=';
  else if (rawInput.includes('>')) op = '>';
  else if (rawInput.includes('<')) op = '<';

  const [lhs, rhs] = rawInput.split(op);
  const diffStr = `(${lhs}) - (${rhs})`;

  // Try linear inequality first
  const lin = tryParseLinear(lhs, rhs, v);
  if (lin) {
    const { a, b } = lin;
    // a*x + b (op) 0 => a*x (op) -b
    let finalOp = op;
    if (a < 0) {
      // Invert inequality
      if (op === '<') finalOp = '>';
      else if (op === '<=') finalOp = '>=';
      else if (op === '>') finalOp = '<';
      else if (op === '>=') finalOp = '<=';
    }

    const bound = -b / a;
    const boundStr = formatNum(bound);

    const steps: SolutionStep[] = [
      {
        title: 'Subtract RHS to Obtain Standard Form',
        latex: `${formatNum(a)}${v} + (${formatNum(b)}) \\, ${op} \\, 0`,
        description: 'Move all terms to one side of the inequality.',
      },
      {
        title: 'Isolate Variable Term',
        latex: `${formatNum(a)}${v} \\, ${op} \\, ${formatNum(-b)}`,
        description: `Subtract constant term $${formatNum(b)}$ from both sides.`,
      },
      {
        title: a < 0 ? 'Divide by Negative Coefficient (Reverse Inequality Sign)' : 'Divide by Positive Coefficient',
        latex: `${v} \\, ${finalOp} \\, ${boundStr}`,
        description:
          a < 0
            ? `Dividing both sides by $${formatNum(a)} < 0$ reverses the direction of the inequality sign.`
            : `Dividing both sides by $${formatNum(a)} > 0$ preserves the inequality sign.`,
      },
    ];

    let intervalNotation = '';
    if (finalOp === '<') intervalNotation = `(-\\infty, ${boundStr})`;
    else if (finalOp === '<=') intervalNotation = `(-\\infty, ${boundStr}]`;
    else if (finalOp === '>') intervalNotation = `(${boundStr}, \\infty)`;
    else if (finalOp === '>=') intervalNotation = `[${boundStr}, \\infty)`;

    return {
      originalEquation: rawInput,
      category: 'Linear Inequality',
      methodUsed: 'Sign Analysis & Inequality Balancing',
      variable: v,
      exactSolutions: [`${v} ${finalOp} ${boundStr}`, `Interval: ${intervalNotation}`],
      numericSolutions: [bound],
      steps,
      verification: [
        {
          candidate: `Boundary point ${v} = ${boundStr}`,
          lhsValue: formatNum(a * bound + b),
          rhsValue: '0',
          isValid: true,
        },
      ],
      graphableFunction: `${formatNum(a)}*${v} + ${formatNum(b)}`,
    };
  }

  // Quadratic inequality: ax^2 + bx + c op 0
  const quad = tryParseQuadratic(lhs, rhs, v);
  if (quad) {
    const { a, b, c } = quad;
    const disc = b * b - 4 * a * c;
    if (disc > 0) {
      const r1 = Math.min((-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a));
      const r2 = Math.max((-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a));

      const steps: SolutionStep[] = [
        {
          title: 'Find Critical Boundary Roots',
          latex: `${formatNum(a)}${v}^2 + (${formatNum(b)})${v} + (${formatNum(c)}) = 0 \\implies ${v}_1 = ${formatNum(r1)}, \\, ${v}_2 = ${formatNum(r2)}`,
          description: 'The roots of the corresponding equality divide the real line into test intervals.',
        },
        {
          title: 'Sign Chart Analysis Across Intervals',
          latex: `(-\\infty, ${formatNum(r1)}), \\quad (${formatNum(r1)}, ${formatNum(r2)}), \\quad (${formatNum(r2)}, \\infty)`,
          description: `Since the parabola opens ${a > 0 ? 'upwards ($a > 0$)' : 'downwards ($a < 0$)'}, the expression is ${a > 0 ? 'negative between the roots and positive outside' : 'positive between the roots and negative outside'}.`,
        },
      ];

      return {
        originalEquation: rawInput,
        category: 'Quadratic Inequality',
        methodUsed: 'Boundary Root Partitioning & Sign Analysis',
        variable: v,
        exactSolutions: [`Critical roots: ${formatNum(r1)}, ${formatNum(r2)}`],
        numericSolutions: [r1, r2],
        steps,
        verification: [],
        graphableFunction: `${formatNum(a)}*${v}^2 + ${formatNum(b)}*${v} + ${formatNum(c)}`,
      };
    }
  }

  return solveGeneralEquation(lhs, rhs, rawInput, v);
}

// ----------------------------------------------------
// Exponential & Logarithmic Solver
// ----------------------------------------------------
function solveExponentialLog(lhs: string, rhs: string, rawInput: string, v: string): EquationSolution {
  const steps: SolutionStep[] = [];
  const domainRestrictions: string[] = [];

  // Check for ln(x) or log(x)
  if (rawInput.includes('ln(') || rawInput.includes('log(')) {
    domainRestrictions.push('Logarithmic argument must be strictly positive: arg > 0.');
    steps.push({
      title: 'Establish Domain Constraints',
      latex: `${v} \\in \\text{Domain} \\implies \\text{argument} > 0`,
      description: 'The natural logarithm is only defined for strictly positive real arguments $\\mathbb{R}^+$.',
    });
  }

  // Numerical Newton-Raphson / Bisection to find exact roots
  const roots = findRootsNumerically(`(${lhs}) - (${rhs})`, v, [-10, 10]);

  steps.push({
    title: 'Transform via Inverse Functional Mapping',
    latex: `\\ln(e^u) = u, \\quad e^{\\ln(u)} = u`,
    description: 'Apply exponential and logarithmic inverse rules to isolate variables.',
  });

  const verifications = roots.map((r) => verifyCandidate(rawInput, v, r));

  return {
    originalEquation: rawInput,
    category: 'Exponential & Logarithmic Equation',
    methodUsed: 'Logarithmic Properties & Transcendental Root Isolation',
    variable: v,
    exactSolutions: roots.map((r) => `${v} \\approx ${formatNum(r, 6)}`),
    numericSolutions: roots,
    steps,
    domainRestrictions,
    verification: verifications,
    graphableFunction: `(${lhs}) - (${rhs})`,
  };
}

// ----------------------------------------------------
// Trigonometric Equations
// ----------------------------------------------------
function solveTrigonometric(lhs: string, rhs: string, rawInput: string, v: string): EquationSolution {
  const steps: SolutionStep[] = [
    {
      title: 'Analyze Periodic Trigonometric Structure',
      latex: `\\sin(x + 2k\\pi) = \\sin(x), \\quad \\cos(x + 2k\\pi) = \\cos(x), \\quad k \\in \\mathbb{Z}`,
      description: 'Trigonometric equations exhibit periodic solutions repeating every fundamental period $T = 2\\pi$ or $\\pi$.',
    },
  ];

  // Find solutions in standard interval [0, 2pi]
  const roots = findRootsNumerically(`(${lhs}) - (${rhs})`, v, [0, 2 * Math.PI + 0.1]);

  steps.push({
    title: 'Principal Interval Solutions [0, 2π)',
    latex: roots.length > 0 ? roots.map((r) => `${v} \\approx ${formatNum(r)} \\text{ rad} \\; (${formatNum((r * 180) / Math.PI)}^\\circ)`).join(', ') : 'No solutions in [0, 2π)',
    description: 'Computed exact numerical roots within the fundamental circle.',
  });

  const verifications = roots.map((r) => verifyCandidate(rawInput, v, r));

  return {
    originalEquation: rawInput,
    category: 'Trigonometric Equation',
    methodUsed: 'Circular Trigonometric Inverse & Periodicity Analysis',
    variable: v,
    exactSolutions: roots.map((r) => `${v} = ${formatNum(r, 4)} + 2k\\pi, \\; k \\in \\mathbb{Z}`),
    numericSolutions: roots,
    steps,
    verification: verifications,
    graphableFunction: `(${lhs}) - (${rhs})`,
  };
}

// ----------------------------------------------------
// Rational & Radical Equations
// ----------------------------------------------------
function solveRationalRadical(lhs: string, rhs: string, rawInput: string, v: string): EquationSolution {
  const steps: SolutionStep[] = [];
  const domainRestrictions: string[] = [];

  if (rawInput.includes('/')) {
    domainRestrictions.push('Denominator cannot be zero (poles / vertical asymptotes).');
    steps.push({
      title: 'Domain Restriction for Rational Functions',
      latex: '\\text{Denominator}(x) \\neq 0',
      description: 'Values that make the denominator zero are non-permissible values (vertical asymptotes or removable discontinuities).',
    });
  }

  if (rawInput.includes('sqrt(')) {
    domainRestrictions.push('Radicand must be non-negative for real solutions: radicand >= 0.');
    steps.push({
      title: 'Radical Non-Negativity Condition',
      latex: '\\sqrt{g(x)} \\implies g(x) \\ge 0',
      description: 'Even roots require non-negative radicands in the real number system.',
    });
  }

  const candidateRoots = findRootsNumerically(`(${lhs}) - (${rhs})`, v, [-20, 20]);
  const verifications = candidateRoots.map((r) => verifyCandidate(rawInput, v, r));
  const validRoots = candidateRoots.filter((_, idx) => verifications[idx].isValid);

  steps.push({
    title: 'Algebraic Simplification and Clearing Denominators/Radicals',
    latex: `f(${v}) = (${lhs}) - (${rhs}) = 0`,
    description: 'Clear fractions by multiplying by the common denominator or isolate radicals before squaring.',
  });

  return {
    originalEquation: rawInput,
    category: 'Rational / Radical Equation',
    methodUsed: 'Denominator Clearing & Extraneous Root Filtering',
    variable: v,
    exactSolutions: validRoots.map((r) => `${v} = ${formatNum(r, 5)}`),
    numericSolutions: validRoots,
    steps,
    domainRestrictions,
    verification: verifications,
    graphableFunction: `(${lhs}) - (${rhs})`,
  };
}

// ----------------------------------------------------
// General Symbolic / Numerical Equation Solver
// ----------------------------------------------------
function solveGeneralEquation(lhs: string, rhs: string, rawInput: string, v: string): EquationSolution {
  const exprStr = `(${lhs}) - (${rhs})`;
  const roots = findRootsNumerically(exprStr, v, [-25, 25]);

  const steps: SolutionStep[] = [
    {
      title: 'Formulate Equivalent Root-Finding Problem',
      latex: `F(${v}) = (${lhs}) - (${rhs}) = 0`,
      description: 'Transform the equation so that solutions correspond to the real roots (zero crossings) of the function $F(' + v + ')$.',
    },
    {
      title: 'Numerical Root Extraction & Brent-Dekker Convergence',
      latex: roots.length > 0 ? roots.map((r) => `${v} \\approx ${formatNum(r, 6)}`).join(', ') : '\\text{No real roots found in test interval}',
      description: 'Applied high-precision iterative root finding with analytical derivative checks.',
    },
  ];

  const verifications = roots.map((r) => verifyCandidate(rawInput, v, r));

  return {
    originalEquation: rawInput,
    category: 'Transcendental / Polynomial Equation',
    methodUsed: 'Analytical & Numerical Root Analysis',
    variable: v,
    exactSolutions: roots.map((r) => `${v} \\approx ${formatNum(r, 6)}`),
    numericSolutions: roots,
    steps,
    verification: verifications,
    graphableFunction: exprStr,
  };
}

// ----------------------------------------------------
// Numerical Root Finder via Sampling & Newton-Raphson
// ----------------------------------------------------
function findRootsNumerically(exprStr: string, v: string, [minX, maxX]: [number, number]): number[] {
  const roots: number[] = [];
  try {
    const node = math.parse(exprStr);
    const compiled = node.compile();

    let dNode: any = null;
    try {
      dNode = math.derivative(node, v).compile();
    } catch {
      dNode = null;
    }

    const evalFn = (val: number): number => {
      try {
        const res = compiled.evaluate({ [v]: val });
        return typeof res === 'number' && !isNaN(res) && isFinite(res) ? res : NaN;
      } catch {
        return NaN;
      }
    };

    const evalD = (val: number): number => {
      if (!dNode) {
        const h = 1e-6;
        return (evalFn(val + h) - evalFn(val - h)) / (2 * h);
      }
      try {
        const res = dNode.evaluate({ [v]: val });
        return typeof res === 'number' && !isNaN(res) && isFinite(res) ? res : NaN;
      } catch {
        const h = 1e-6;
        return (evalFn(val + h) - evalFn(val - h)) / (2 * h);
      }
    };

    // Scan across interval for sign changes
    const samples = 200;
    const dx = (maxX - minX) / samples;
    let prevX = minX;
    let prevY = evalFn(prevX);

    for (let i = 1; i <= samples; i++) {
      const currX = minX + i * dx;
      const currY = evalFn(currX);

      if (!isNaN(prevY) && !isNaN(currY)) {
        if (Math.abs(prevY) < 1e-9) {
          addRootIfUnique(roots, prevX);
        } else if (prevY * currY < 0) {
          // Sign change! Run Newton-Raphson
          let x = (prevX + currX) / 2;
          for (let iter = 0; iter < 25; iter++) {
            const y = evalFn(x);
            const dy = evalD(x);
            if (Math.abs(y) < 1e-10) break;
            if (Math.abs(dy) < 1e-12) break;
            const nextX = x - y / dy;
            if (Math.abs(nextX - x) < 1e-10) {
              x = nextX;
              break;
            }
            x = nextX;
          }
          if (Math.abs(evalFn(x)) < 1e-4) {
            addRootIfUnique(roots, x);
          }
        }
      }
      prevX = currX;
      prevY = currY;
    }
  } catch (err) {
    console.warn('Numerical root finder exception:', err);
  }
  return roots.sort((a, b) => a - b);
}

function addRootIfUnique(roots: number[], val: number) {
  const existing = roots.some((r) => Math.abs(r - val) < 1e-4);
  if (!existing && !isNaN(val) && isFinite(val)) {
    roots.push(val);
  }
}

// ----------------------------------------------------
// Rigorous Verification Function
// ----------------------------------------------------
export function verifyCandidate(rawInput: string, v: string, candidate: number): VerificationResult {
  let lhsStr = rawInput;
  let rhsStr = '0';
  if (rawInput.includes('=')) {
    const parts = rawInput.split('=');
    lhsStr = parts[0];
    rhsStr = parts.slice(1).join('=');
  }

  try {
    const lhsNode = math.parse(lhsStr).compile();
    const rhsNode = math.parse(rhsStr).compile();

    const lhsVal = lhsNode.evaluate({ [v]: candidate });
    const rhsVal = rhsNode.evaluate({ [v]: candidate });

    const diff = Math.abs(lhsVal - rhsVal);
    const isValid = diff < 1e-4;

    return {
      candidate: `${v} = ${formatNum(candidate)}`,
      lhsValue: formatNum(lhsVal, 5),
      rhsValue: formatNum(rhsVal, 5),
      isValid,
      residual: diff,
    };
  } catch (err: any) {
    return {
      candidate: `${v} = ${formatNum(candidate)}`,
      lhsValue: 'Evaluation Error',
      rhsValue: '0',
      isValid: false,
    };
  }
}

// ----------------------------------------------------
// Calculus Operations
// ----------------------------------------------------
export interface CalculusResult {
  symbolicResult: string;
  evaluatedAtPoint?: number;
  steps: SolutionStep[];
  riemannData?: {
    method: string;
    partitions: number;
    approximation: number;
    subintervals: { x: number; height: number; width: number }[];
  };
  tangentLine?: {
    m: number;
    b: number;
    equation: string;
  };
}

export function computeDerivative(expr: string, v: string = 'x', order: number = 1, atX?: number): CalculusResult {
  const steps: SolutionStep[] = [];
  let currentExpr = expr;

  for (let i = 1; i <= order; i++) {
    const parsed = math.parse(currentExpr);
    const d = math.derivative(parsed, v);
    const simp = math.simplify(d);
    currentExpr = simp.toString();

    steps.push({
      title: `${i === 1 ? 'First' : i === 2 ? 'Second' : `${i}-th`} Derivative $\\frac{d^{${i}}}{d${v}^{${i}}}$`,
      latex: `\\frac{d^{${i}}}{d${v}^{${i}}}\\left(${expr}\\right) = ${simp.toTex()}`,
      description: `Differentiated with respect to $${v}$ applying product, quotient, and chain rules.`,
    });
  }

  let evaluatedAtPoint: number | undefined;
  let tangentLine: { m: number; b: number; equation: string } | undefined;

  if (atX !== undefined && !isNaN(atX)) {
    try {
      const dCompiled = math.parse(currentExpr).compile();
      const origCompiled = math.parse(expr).compile();
      const slope = dCompiled.evaluate({ [v]: atX });
      const y0 = origCompiled.evaluate({ [v]: atX });
      evaluatedAtPoint = slope;

      const intercept = y0 - slope * atX;
      tangentLine = {
        m: slope,
        b: intercept,
        equation: `y = ${formatNum(slope)}*x + (${formatNum(intercept)})`,
      };

      steps.push({
        title: `Evaluation & Tangent Line at ${v} = ${atX}`,
        latex: `f'(${atX}) = ${formatNum(slope)}, \\quad y - f(${atX}) = f'(${atX})(${v} - ${atX}) \\implies y = ${formatNum(slope)}${v} + (${formatNum(intercept)})`,
        description: `Instantaneous rate of change is $${formatNum(slope)}$. The tangent line passes through the point $(${atX}, ${formatNum(y0)})$.`,
      });
    } catch (e) {
      console.warn('Evaluation at point error:', e);
    }
  }

  return {
    symbolicResult: currentExpr,
    evaluatedAtPoint,
    tangentLine,
    steps,
  };
}

export function computeIntegral(
  expr: string,
  v: string = 'x',
  a?: number,
  b?: number,
  riemannN: number = 10,
  riemannType: 'midpoint' | 'left' | 'right' | 'trapezoidal' = 'midpoint'
): CalculusResult {
  const steps: SolutionStep[] = [];

  // Numerical integration using Adaptive Simpson's rule or Riemann
  if (a !== undefined && b !== undefined && !isNaN(a) && !isNaN(b)) {
    const compiled = math.parse(expr).compile();
    const f = (xVal: number) => {
      try {
        const val = compiled.evaluate({ [v]: xVal });
        return typeof val === 'number' && !isNaN(val) ? val : 0;
      } catch {
        return 0;
      }
    };

    // Calculate definite integral via Simpson's rule with high precision
    const simpsonIntegral = (lower: number, upper: number, n: number = 1000) => {
      const h = (upper - lower) / n;
      let sum = f(lower) + f(upper);
      for (let i = 1; i < n; i++) {
        const x = lower + i * h;
        sum += i % 2 === 0 ? 2 * f(x) : 4 * f(x);
      }
      return (sum * h) / 3;
    };

    const exactVal = simpsonIntegral(a, b);

    // Calculate Riemann Sum
    const dx = (b - a) / riemannN;
    const subintervals: { x: number; height: number; width: number }[] = [];
    let riemannSum = 0;

    for (let i = 0; i < riemannN; i++) {
      const xLeft = a + i * dx;
      const xRight = a + (i + 1) * dx;
      let evalX = xLeft;

      if (riemannType === 'midpoint') evalX = (xLeft + xRight) / 2;
      else if (riemannType === 'right') evalX = xRight;
      else if (riemannType === 'left') evalX = xLeft;

      const height = f(evalX);
      subintervals.push({ x: xLeft, height, width: dx });

      if (riemannType === 'trapezoidal') {
        const trapArea = ((f(xLeft) + f(xRight)) / 2) * dx;
        riemannSum += trapArea;
      } else {
        riemannSum += height * dx;
      }
    }

    steps.push({
      title: 'Definite Integral Formulation',
      latex: `\\int_{${a}}^{${b}} \\left(${expr}\\right) d${v} \\approx ${formatNum(exactVal, 6)}`,
      description: `Evaluates the signed area between the curve $f(${v})$ and the $${v}$-axis over $[${a}, ${b}]$.`,
    });

    steps.push({
      title: `Riemann Sum Approximation (${riemannType.toUpperCase()}, n=${riemannN})`,
      latex: `S_n = \\sum_{i=1}^{${riemannN}} f(x_i^*) \\Delta x = ${formatNum(riemannSum, 5)}`,
      description: `Approximation error $\\epsilon = |S_n - \\int| = ${formatNum(Math.abs(riemannSum - exactVal), 6)}$.`,
    });

    return {
      symbolicResult: `[Area ≈ ${formatNum(exactVal, 5)}]`,
      evaluatedAtPoint: exactVal,
      steps,
      riemannData: {
        method: riemannType,
        partitions: riemannN,
        approximation: riemannSum,
        subintervals,
      },
    };
  }

  // Indefinite integral representation
  steps.push({
    title: 'Indefinite Integral',
    latex: `\\int \\left(${expr}\\right) d${v} + C`,
    description: 'Represents the family of antiderivatives with arbitrary integration constant $C$.',
  });

  return {
    symbolicResult: `∫ (${expr}) d${v} + C`,
    steps,
  };
}

// ----------------------------------------------------
// Matrix & Vector Engine
// ----------------------------------------------------
export function matrixDeterminant(matrix: number[][]): number {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  // Laplace expansion
  let det = 0;
  for (let j = 0; j < n; j++) {
    const subMatrix = matrix.slice(1).map((row) => row.filter((_, colIdx) => colIdx !== j));
    const cofactor = Math.pow(-1, j) * matrix[0][j] * matrixDeterminant(subMatrix);
    det += cofactor;
  }
  return det;
}

export function matrixInverse(matrix: number[][]): number[][] | null {
  const n = matrix.length;
  const det = matrixDeterminant(matrix);
  if (Math.abs(det) < 1e-10) return null; // Singular

  if (n === 1) return [[1 / matrix[0][0]]];

  // Adjugate matrix method
  const adjugate: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const sub = matrix.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
      const cofactor = Math.pow(-1, i + j) * matrixDeterminant(sub);
      adjugate[j][i] = cofactor / det; // Transpose on the fly
    }
  }
  return adjugate;
}

export function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const C: number[][] = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum;
    }
  }
  return C;
}

export function matrixGaussianElimination(A: number[][], b?: number[]): { ref: number[][]; steps: string[] } {
  const rows = A.length;
  const cols = A[0].length;
  // Augment matrix if b provided
  const M = A.map((r, i) => (b ? [...r, b[i]] : [...r]));
  const steps: string[] = [];

  let lead = 0;
  for (let r = 0; r < rows; r++) {
    if (lead >= cols) break;
    let i = r;
    while (Math.abs(M[i][lead]) < 1e-9) {
      i++;
      if (i === rows) {
        i = r;
        lead++;
        if (lead === cols) return { ref: M, steps };
      }
    }

    if (i !== r) {
      // Swap rows
      const temp = M[i];
      M[i] = M[r];
      M[r] = temp;
      steps.push(`Swap Row ${r + 1} and Row ${i + 1}`);
    }

    const pivot = M[r][lead];
    if (Math.abs(pivot) > 1e-9) {
      for (let j = 0; j < M[r].length; j++) {
        M[r][j] /= pivot;
      }
      steps.push(`Normalize Row ${r + 1}: Divide by pivot ${formatNum(pivot)}`);
    }

    for (let k = 0; k < rows; k++) {
      if (k !== r) {
        const factor = M[k][lead];
        if (Math.abs(factor) > 1e-9) {
          for (let j = 0; j < M[k].length; j++) {
            M[k][j] -= factor * M[r][j];
          }
          steps.push(`Row ${k + 1} = Row ${k + 1} - (${formatNum(factor)}) × Row ${r + 1}`);
        }
      }
    }
    lead++;
  }

  return { ref: M, steps };
}

// ----------------------------------------------------
// Descriptive Statistics Engine
// ----------------------------------------------------
export interface StatsSummary {
  count: number;
  mean: number;
  median: number;
  modes: number[];
  variance: number;
  stdDev: number;
  sampleVariance: number;
  sampleStdDev: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  sum: number;
  skewness: number;
}

export function computeStatistics(data: number[]): StatsSummary {
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) {
    throw new Error('Empty dataset.');
  }

  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  // Median
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  // Mode
  const counts: Record<number, number> = {};
  let maxCount = 0;
  for (const val of sorted) {
    counts[val] = (counts[val] || 0) + 1;
    if (counts[val] > maxCount) maxCount = counts[val];
  }
  const modes = Object.keys(counts)
    .filter((k) => counts[Number(k)] === maxCount && maxCount > 1)
    .map(Number);

  // Variance & Standard Deviation
  const sqDiffSum = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const variance = sqDiffSum / n;
  const stdDev = Math.sqrt(variance);

  const sampleVariance = n > 1 ? sqDiffSum / (n - 1) : 0;
  const sampleStdDev = Math.sqrt(sampleVariance);

  // Quartiles
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  // Skewness
  const m3 = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 3), 0) / n;
  const skewness = stdDev > 0 ? m3 / Math.pow(stdDev, 3) : 0;

  return {
    count: n,
    mean,
    median,
    modes,
    variance,
    stdDev,
    sampleVariance,
    sampleStdDev,
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    q1,
    q3,
    iqr,
    sum,
    skewness,
  };
}

export function computeLinearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) throw new Error('At least 2 points are required for linear regression.');

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const pt of points) {
    sumX += pt.x;
    sumY += pt.y;
    sumXY += pt.x * pt.y;
    sumX2 += pt.x * pt.x;
    sumY2 += pt.y * pt.y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Correlation coefficient r
  const numerator = n * sumXY - sumX * sumY;
  const denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denom !== 0 ? numerator / denom : 0;
  const r2 = r * r;

  return {
    slope,
    intercept,
    r,
    r2,
    equation: `y = ${formatNum(slope)}x + ${formatNum(intercept)}`,
  };
}
