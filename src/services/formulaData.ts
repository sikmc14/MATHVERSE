import { FormulaItem } from '../types/mathverse';

export const formulaLibrary: FormulaItem[] = [
  // ALGEBRA
  {
    id: 'quad_formula',
    name: { en: 'Quadratic Formula', ar: 'القانون العام لحل المعادلة التربيعية' },
    category: 'algebra',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    cleanExpr: '2*x^2 - 5*x + 2 = 0',
    description: {
      en: 'Provides exact analytic solutions to any second-degree polynomial equation ax² + bx + c = 0.',
      ar: 'يعطي الحلول التحليلية الدقيقة لأي معادلة حدودية من الدرجة الثانية أ س² + ب س + ج = 0.',
    },
    variables: [
      { symbol: 'a, b, c', desc: { en: 'Polynomial real coefficients (a ≠ 0)', ar: 'معاملات المعادلة الحقيقية' } },
      { symbol: 'Δ = b² - 4ac', desc: { en: 'Discriminant determining root nature', ar: 'المميز المحدد لطبيعة الجذور' } },
    ],
    targetTool: 'solver',
  },
  {
    id: 'binomial_theorem',
    name: { en: 'Binomial Theorem', ar: 'مبرهنة ثنائي الحد' },
    category: 'algebra',
    latex: '(x + y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k} y^k',
    cleanExpr: '(x + y)^3',
    description: {
      en: 'Describes the algebraic expansion of powers of a binomial expression.',
      ar: 'يصف النشر الجبري لقوى مفكوك ذي الحدين.',
    },
    variables: [
      { symbol: 'n', desc: { en: 'Non-negative integer power', ar: 'أس القوة الصحيح غير السالب' } },
      { symbol: 'binom(n, k)', desc: { en: 'Combinatorial coefficient n! / (k!(n-k)!)', ar: 'معامل التوافيق' } },
    ],
    targetTool: 'calculator',
  },
  {
    id: 'euler_identity',
    name: { en: "Euler's Formula & Identity", ar: 'صيغة ومتطابقة أويلر' },
    category: 'trigonometry',
    latex: 'e^{i\\pi} + 1 = 0 \\quad \\Longleftrightarrow \\quad e^{ix} = \\cos(x) + i\\sin(x)',
    cleanExpr: 'exp(i*pi) + 1 = 0',
    description: {
      en: 'Connects five fundamental mathematical constants (e, i, π, 1, 0) and bridges trigonometry with complex numbers.',
      ar: 'تربط الثوابت الرياضية الخمسة الأساسية وتصل بين علم المثلثات وحقل الأعداد المركبة.',
    },
    variables: [
      { symbol: 'e', desc: { en: 'Base of natural logarithms (~2.71828)', ar: 'أساس اللوغاريتم الطبيعي' } },
      { symbol: 'i', desc: { en: 'Imaginary unit where i² = -1', ar: 'الوحدة التخيلية' } },
    ],
    targetTool: 'solver',
  },

  // CALCULUS
  {
    id: 'ftc',
    name: { en: 'Fundamental Theorem of Calculus', ar: 'المبرهنة الأساسية للتفاضل والتكامل' },
    category: 'calculus',
    latex: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a) \\quad \\text{where } F\'(x) = f(x)',
    cleanExpr: '3*x^2 - 2*x',
    description: {
      en: 'States that differentiation and integration are inverse operations, linking the accumulation of quantities to rates of change.',
      ar: 'تنص على أن الاشتقاق والتكامل عمليتان عكسيتان، وتربط بين تراكم الكميات ومعدلات التغير اللحظية.',
    },
    variables: [
      { symbol: 'f(x)', desc: { en: 'Continuous function on [a, b]', ar: 'دالة متصلة على المجال' } },
      { symbol: 'F(x)', desc: { en: 'Antiderivative of f(x)', ar: 'الدالة الأصلية' } },
    ],
    targetTool: 'calculus',
  },
  {
    id: 'taylor_series',
    name: { en: 'Taylor & Maclaurin Series', ar: 'متسلسلة تايلور وماكلوران' },
    category: 'calculus',
    latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n',
    cleanExpr: 'sin(x)',
    description: {
      en: 'Represents an infinitely differentiable function as an infinite sum of polynomial terms evaluated at a single point.',
      ar: 'تمثيل دالة قابلة للاشتقاق لمرات لا نهائية في صورة مجموع متسلسلة قوى حدودية حول نقطة.',
    },
    variables: [
      { symbol: 'a', desc: { en: 'Expansion center point (a = 0 for Maclaurin)', ar: 'نقطة مركز النشر' } },
      { symbol: 'f^(n)(a)', desc: { en: 'n-th order derivative evaluated at a', ar: 'المشتقة من الرتبة ن عند النقطة' } },
    ],
    targetTool: 'calculus',
  },

  // LINEAR ALGEBRA
  {
    id: 'eigen_equation',
    name: { en: 'Eigenvalue Characteristic Equation', ar: 'معادلة القيم الذاتية المميزة' },
    category: 'matrices',
    latex: '\\det(A - \\lambda I) = 0 \\quad \\Longleftrightarrow \\quad A v = \\lambda v',
    cleanExpr: 'det(A - lambda*I) = 0',
    description: {
      en: 'Finds the scalar factors λ by which linear transformations stretch or shrink non-zero eigenvectors v.',
      ar: 'حساب القيم القياسية التي تمدد أو تقلص المتجهات الذاتية تحت تأثير التحويل الخطي.',
    },
    variables: [
      { symbol: 'A', desc: { en: 'Square transformation matrix n×n', ar: 'مصفوفة التحويل المربعة' } },
      { symbol: 'λ', desc: { en: 'Scalar eigenvalue', ar: 'القيمة الذاتية' } },
      { symbol: 'I', desc: { en: 'Identity matrix of matching dimension', ar: 'مصفوفة الوحدة' } },
    ],
    targetTool: 'matrices',
  },

  // PHYSICS & MECHANICS
  {
    id: 'newton_second_law',
    name: { en: "Newton's Second Law of Motion", ar: 'قانون نيوتن الثاني للحركة' },
    category: 'physics',
    latex: '\\mathbf{F} = \\frac{d\\mathbf{p}}{dt} = m \\mathbf{a} = m \\frac{d^2 \\mathbf{r}}{dt^2}',
    cleanExpr: 'F = m*a',
    description: {
      en: 'The net force acting on a body is directly proportional to its mass and its instantaneous acceleration.',
      ar: 'محصلة القوى المؤثرة على جسم تساوي حاصل ضرب كتلته في تسارعه اللحظي.',
    },
    variables: [
      { symbol: 'F', desc: { en: 'Force vector (Newtons, N)', ar: 'متجه القوة بالنيوتن' } },
      { symbol: 'm', desc: { en: 'Inertial mass (kg)', ar: 'كتلة القصور الذاتي كجم' } },
      { symbol: 'a', desc: { en: 'Acceleration vector (m/s²)', ar: 'متجه التسارع م/ث²' } },
    ],
    targetTool: 'calculator',
  },
  {
    id: 'gravitation_law',
    name: { en: "Newton's Law of Universal Gravitation", ar: 'قانون الجذب العام الكوني لنيوتن' },
    category: 'physics',
    latex: 'F_g = G \\frac{m_1 m_2}{r^2}',
    cleanExpr: 'G * m1 * m2 / (r^2)',
    description: {
      en: 'Every particle attracts every other particle with a force proportional to the product of their masses and inversely proportional to the square of their distance.',
      ar: 'تتجاذب أي كتلتين في الكون بقوة تتناسب طردياً مع حاصل ضرب كتلتيهما وعكسياً مع مربع المسافة بينهما.',
    },
    variables: [
      { symbol: 'G', desc: { en: 'Gravitational constant = 6.67430 × 10⁻¹¹ N·m²/kg²', ar: 'ثابت الجذب الكوني العام' } },
      { symbol: 'r', desc: { en: 'Distance between mass centers (m)', ar: 'المسافة بين مركزي الكتلتين' } },
    ],
    targetTool: 'calculator',
  },
  {
    id: 'wave_equation',
    name: { en: 'Classical Wave Equation', ar: 'معادلة الموجات الكلاسيكية' },
    category: 'physics',
    latex: '\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u = c^2 \\left(\\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2}\\right)',
    cleanExpr: 'sin(x - 2*t)',
    description: {
      en: 'Second-order linear partial differential equation describing the propagation of waves (sound, light, water).',
      ar: 'معادلة تفاضلية جزئية تصف انتشار الموجات الميكانيكية والكهرومغناطيسية في الفضاء.',
    },
    variables: [
      { symbol: 'u(x, t)', desc: { en: 'Wave displacement amplitude', ar: 'سعة إزاحة الموجة' } },
      { symbol: 'c', desc: { en: 'Wave propagation phase speed (m/s)', ar: 'سرعة طور انتشار الموجة' } },
    ],
    targetTool: 'graphing',
  },

  // THERMODYNAMICS & CHEMISTRY
  {
    id: 'ideal_gas',
    name: { en: 'Ideal Gas Law', ar: 'قانون الغاز المثالي' },
    category: 'chemistry',
    latex: 'P V = n R T = N k_B T',
    cleanExpr: 'P*V - n*R*T = 0',
    description: {
      en: 'Equation of state of a hypothetical ideal gas, relating pressure, volume, temperature, and substance amount.',
      ar: 'معادلة الحالة للغاز المثالي، تربط بين الضغط والحجم ودرجة الحرارة وكمية المادة.',
    },
    variables: [
      { symbol: 'P', desc: { en: 'Absolute pressure (Pa)', ar: 'الضغط المطلق بالباسكال' } },
      { symbol: 'V', desc: { en: 'Volume (m³ or L)', ar: 'الحجم بالمتر المكعب أو اللتر' } },
      { symbol: 'R', desc: { en: 'Universal gas constant = 8.31446 J/(mol·K)', ar: 'الثابت العام للغازات' } },
      { symbol: 'T', desc: { en: 'Absolute temperature (Kelvin)', ar: 'درجة الحرارة المطلقة بالكلفن' } },
    ],
    targetTool: 'converter',
  },

  // QUANTUM PHYSICS
  {
    id: 'schrodinger',
    name: { en: 'Time-Dependent Schrödinger Equation', ar: 'معادلة شرودنغر المعتمدة على الزمن' },
    category: 'physics',
    latex: 'i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t) = \\left(-\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}, t)\\right) \\Psi(\\mathbf{r}, t)',
    cleanExpr: 'exp(-x^2 / 2)',
    description: {
      en: 'Fundamental equation of non-relativistic quantum mechanics governing the wave function of physical systems.',
      ar: 'المعادلة الأساسية لميكانيكا الكم غير النسبية التي تصف التطور الزمني للدالة الموجية للجسيمات.',
    },
    variables: [
      { symbol: 'Ψ', desc: { en: 'Quantum complex wave function state vector', ar: 'الدالة الموجية الكمومية المركبة' } },
      { symbol: 'ħ', desc: { en: 'Reduced Planck constant h / 2π = 1.05457 × 10⁻³⁴ J·s', ar: 'ثابت بلانك المخفض' } },
      { symbol: 'Ĥ', desc: { en: 'Hamiltonian energy operator', ar: 'مؤثر الهاميلتوني للطاقة الكلية' } },
    ],
    targetTool: 'graphing',
  },
];
