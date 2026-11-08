import { Language } from '../types/mathverse';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tabs: {
    solver: string;
    graphing: string;
    calculator: string;
    calculus: string;
    matrices: string;
    statistics: string;
    converter: string;
    formulas: string;
    imageToMath: string;
    projects: string;
  };
  common: {
    solve: string;
    calculate: string;
    graph: string;
    clear: string;
    reset: string;
    copy: string;
    copied: string;
    export: string;
    import: string;
    save: string;
    saved: string;
    delete: string;
    load: string;
    verification: string;
    stepByStep: string;
    exactSolution: string;
    numericalApproximation: string;
    restrictions: string;
    method: string;
    originalEquation: string;
    error: string;
    loading: string;
    examples: string;
    aiDeepExplanation: string;
    aiAnalyzing: string;
    zoomIn: string;
    zoomOut: string;
    centerOrigin: string;
    settings: string;
    language: string;
  };
  solver: {
    title: string;
    description: string;
    inputPlaceholder: string;
    variableLabel: string;
    categories: {
      all: string;
      linear: string;
      quadratic: string;
      polynomial: string;
      system: string;
      rational: string;
      exponential: string;
      trig: string;
      inequality: string;
      complex: string;
    };
    sendToGrapher: string;
    noSolutions: string;
    infiniteSolutions: string;
    validVerified: string;
    extraneousRejected: string;
  };
  graphing: {
    title: string;
    description: string;
    mode2d: string;
    mode3d: string;
    polar: string;
    parametric: string;
    addFunction: string;
    functionsList: string;
    plotResolution: string;
    wireframe: string;
    colorPalette: string;
    cursorCoord: string;
    rootsIntersects: string;
    trace: string;
    zFunction: string;
    presets: string;
  };
  calculator: {
    title: string;
    description: string;
    standard: string;
    scientific: string;
    constants: string;
    history: string;
    rad: string;
    deg: string;
    memoryClear: string;
    memoryRecall: string;
    memoryAdd: string;
    memorySub: string;
  };
  calculus: {
    title: string;
    description: string;
    derivative: string;
    integral: string;
    limit: string;
    series: string;
    tangentLine: string;
    riemannSum: string;
    order: string;
    atPoint: string;
    lowerBound: string;
    upperBound: string;
    approaches: string;
    stepsCount: string;
  };
  matrices: {
    title: string;
    description: string;
    dimensions: string;
    matrixA: string;
    matrixB: string;
    vectors: string;
    determinant: string;
    inverse: string;
    transpose: string;
    eigenvalues: string;
    rank: string;
    trace: string;
    gaussianElimination: string;
    dotProduct: string;
    crossProduct: string;
    magnitude: string;
    angleBetween: string;
  };
  statistics: {
    title: string;
    description: string;
    dataInput: string;
    dataPlaceholder: string;
    summaryStats: string;
    distributions: string;
    regression: string;
    mean: string;
    median: string;
    mode: string;
    stdDev: string;
    variance: string;
    iqr: string;
    min: string;
    max: string;
    normal: string;
    binomial: string;
    poisson: string;
  };
  converter: {
    title: string;
    description: string;
    from: string;
    to: string;
    value: string;
    formula: string;
    dimension: string;
  };
  formulas: {
    title: string;
    description: string;
    search: string;
    allCategories: string;
    loadToTool: string;
  };
  imageToMath: {
    title: string;
    description: string;
    uploadImage: string;
    drawCanvas: string;
    dropHere: string;
    canvasClear: string;
    recognize: string;
    recognizedExpression: string;
    confidence: string;
    solveEquation: string;
    plotGraph: string;
  };
  projects: {
    title: string;
    description: string;
    savedWorkspaces: string;
    exportJson: string;
    importJson: string;
    printReport: string;
    noProjectsYet: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'MATHVERSE',
    appSubtitle: 'The Ultimate Math & Science Workspace',
    tabs: {
      solver: 'Equation Solver',
      graphing: 'Graphing Studio',
      calculator: 'Scientific Calc',
      calculus: 'Calculus',
      matrices: 'Matrices & Vectors',
      statistics: 'Statistics & Prob',
      converter: 'Unit Converter',
      formulas: 'Formula Library',
      imageToMath: 'Image to Math',
      projects: 'Saved Projects',
    },
    common: {
      solve: 'Solve Equation',
      calculate: 'Calculate',
      graph: 'Graph',
      clear: 'Clear',
      reset: 'Reset',
      copy: 'Copy',
      copied: 'Copied!',
      export: 'Export',
      import: 'Import',
      save: 'Save Project',
      saved: 'Saved!',
      delete: 'Delete',
      load: 'Load',
      verification: 'Verification & Sanity Check',
      stepByStep: 'Step-by-Step Mathematical Proof',
      exactSolution: 'Exact Analytic Solution',
      numericalApproximation: 'Numerical Approximation',
      restrictions: 'Domain Restrictions & Discontinuities',
      method: 'Mathematical Method',
      originalEquation: 'Original Equation',
      error: 'Error',
      loading: 'Computing mathematical proof...',
      examples: 'Curated Examples',
      aiDeepExplanation: 'AI Deep Pedagogical Breakdown',
      aiAnalyzing: 'Generating analytical proof & geometric intuition...',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      centerOrigin: 'Reset View',
      settings: 'Settings',
      language: 'Language',
    },
    solver: {
      title: 'Symbolic & Numerical Equation Solver',
      description:
        'Solve polynomial, rational, radical, trigonometric, exponential, systems, and differential equations with rigorous step-by-step mathematical reasoning.',
      inputPlaceholder: 'e.g. 2*x^2 - 5*x + 2 = 0 or 3*x + 4*y = 12, x - 2*y = 5',
      variableLabel: 'Variable',
      categories: {
        all: 'All Types',
        linear: 'Linear',
        quadratic: 'Quadratic',
        polynomial: 'Polynomial',
        system: 'System of Equations',
        rational: 'Rational & Radical',
        exponential: 'Exp & Logarithmic',
        trig: 'Trigonometric',
        inequality: 'Inequality',
        complex: 'Complex Numbers',
      },
      sendToGrapher: 'Plot in Graphing Studio',
      noSolutions: 'No real solutions exist for this equation.',
      infiniteSolutions: 'Infinite solutions exist (identity equation).',
      validVerified: 'Verified: Exact match with LHS and RHS.',
      extraneousRejected: 'Extraneous root: Discarded due to domain restriction.',
    },
    graphing: {
      title: 'Interactive 2D & 3D Graphing Studio',
      description:
        'Visualize Cartesian curves, polar plots, parametric trajectories, inequalities, and 3D surfaces with real-time coordinate inspection.',
      mode2d: '2D Cartesian & Curves',
      mode3d: '3D Surface Visualization',
      polar: 'Polar r(θ)',
      parametric: 'Parametric x(t), y(t)',
      addFunction: 'Add Function',
      functionsList: 'Active Functions',
      plotResolution: 'Grid Resolution',
      wireframe: 'Wireframe Grid',
      colorPalette: 'Color Palette',
      cursorCoord: 'Cursor Coordinates',
      rootsIntersects: 'Roots & Extrema',
      trace: 'Coordinate Tracer',
      zFunction: 'Surface z = f(x, y)',
      presets: 'Preset Surfaces',
    },
    calculator: {
      title: 'Precision Scientific Calculator',
      description:
        'High-precision arbitrary calculations, trigonometric functions, hyper-operations, combinatorics, and fundamental physical constants.',
      standard: 'Standard',
      scientific: 'Advanced Scientific',
      constants: 'Physical Constants',
      history: 'Calculation History',
      rad: 'RAD',
      deg: 'DEG',
      memoryClear: 'MC',
      memoryRecall: 'MR',
      memoryAdd: 'M+',
      memorySub: 'M-',
    },
    calculus: {
      title: 'Calculus & Analysis Studio',
      description:
        'Symbolic and numerical differentiation, indefinite & definite integrals, Riemann approximations, Taylor series, and limit evaluations.',
      derivative: 'Derivatives',
      integral: 'Integrals & Riemann Sums',
      limit: 'Limits',
      series: 'Taylor Series Expansion',
      tangentLine: 'Tangent Line at Point',
      riemannSum: 'Riemann Sum Approximation',
      order: 'Derivative Order',
      atPoint: 'Evaluate at x =',
      lowerBound: 'Lower Bound (a)',
      upperBound: 'Upper Bound (b)',
      approaches: 'x approaches',
      stepsCount: 'Interval Partitions (n)',
    },
    matrices: {
      title: 'Linear Algebra: Matrices & Vectors',
      description:
        'Matrix arithmetic, Gaussian elimination, determinants, inverses, eigenvalues, vector dot/cross products, and geometrical projections.',
      dimensions: 'Matrix Dimensions',
      matrixA: 'Matrix A',
      matrixB: 'Matrix B',
      vectors: 'Vector Operations & Visualizer',
      determinant: 'Determinant det(A)',
      inverse: 'Matrix Inverse A⁻¹',
      transpose: 'Transpose Aᵀ',
      eigenvalues: 'Eigenvalues & Trace',
      rank: 'Rank',
      trace: 'Trace',
      gaussianElimination: 'Gaussian Elimination Steps',
      dotProduct: 'Dot Product (u · v)',
      crossProduct: 'Cross Product (u × v)',
      magnitude: 'Vector Magnitude',
      angleBetween: 'Angle Between Vectors',
    },
    statistics: {
      title: 'Statistics & Probability Distributions',
      description:
        'Comprehensive descriptive statistics, interactive histogram/box plots, linear regression models, and probability density functions.',
      dataInput: 'Dataset Input',
      dataPlaceholder: 'Enter comma or space separated numbers: 12, 15, 18, 22, 25, 30, 35',
      summaryStats: 'Descriptive Statistics Summary',
      distributions: 'Probability Distributions (Normal, Binomial, Poisson)',
      regression: 'Linear Regression Analysis',
      mean: 'Mean (μ / x̄)',
      median: 'Median',
      mode: 'Mode',
      stdDev: 'Standard Deviation (σ)',
      variance: 'Variance (σ²)',
      iqr: 'Interquartile Range (IQR)',
      min: 'Minimum',
      max: 'Maximum',
      normal: 'Normal Distribution',
      binomial: 'Binomial Distribution',
      poisson: 'Poisson Distribution',
    },
    converter: {
      title: 'Scientific Unit Converter & Dimensional Analysis',
      description:
        'Convert between metric, imperial, astronomical, and Planck units with exact conversion ratios and dimensional formulas.',
      from: 'Convert From',
      to: 'Convert To',
      value: 'Input Magnitude',
      formula: 'Exact Conversion Formula',
      dimension: 'Physical Dimension',
    },
    formulas: {
      title: 'Comprehensive Scientific Formula Library',
      description:
        'Over 100 essential formulas in algebra, calculus, geometry, classical mechanics, thermodynamics, and quantum physics with 1-click workspace loading.',
      search: 'Search formulas, theorems, laws...',
      allCategories: 'All Disciplines',
      loadToTool: 'Load into Workspace',
    },
    imageToMath: {
      title: 'AI Image-to-Math & Handwriting OCR',
      description:
        'Upload mathematical textbook photos, handwritten equations, or draw directly on the canvas to recognize, solve, and graph instantly.',
      uploadImage: 'Upload Photo / Image',
      drawCanvas: 'Interactive Handwriting Canvas',
      dropHere: 'Drag & drop image here or click to browse',
      canvasClear: 'Clear Canvas',
      recognize: 'Analyze & Recognize Math',
      recognizedExpression: 'Recognized Mathematical Expression',
      confidence: 'Recognition Confidence',
      solveEquation: 'Solve in Equation Solver',
      plotGraph: 'Plot in Graphing Studio',
    },
    projects: {
      title: 'Saved Workspaces & Project Notebooks',
      description:
        'Manage your saved calculations, export full scientific reports in JSON or formatted print-ready sheets, and restore previous sessions.',
      savedWorkspaces: 'Saved Calculations & Notebooks',
      exportJson: 'Export Workspace JSON',
      importJson: 'Import Workspace JSON',
      printReport: 'Print / Save as PDF Report',
      noProjectsYet: 'No saved workspaces yet. Save your calculations from any tool!',
    },
  },
  ar: {
    appName: 'ماثفيرس | MATHVERSE',
    appSubtitle: 'منصة الرياضيات والعلوم المتقدمة للمحترفين والباحثين والطلاب',
    tabs: {
      solver: 'حل المعادلات',
      graphing: 'أستوديو الرسوم البيانية',
      calculator: 'الحاسبة العلمية',
      calculus: 'التفاضل والتكامل',
      matrices: 'المصفوفات والمتجهات',
      statistics: 'الإحصاء والاحتمالات',
      converter: 'محول الوحدات العلمية',
      formulas: 'مكتبة القوانين',
      imageToMath: 'التعرف على المعادلات بالذكاء الاصطناعي',
      projects: 'المشاريع المحفوظة',
    },
    common: {
      solve: 'حل المعادلة',
      calculate: 'احسب',
      graph: 'رسم بياني',
      clear: 'مسح',
      reset: 'إعادة تعيين',
      copy: 'نسخ',
      copied: 'تم النسخ!',
      export: 'تصدير',
      import: 'استيراد',
      save: 'حفظ المشروع',
      saved: 'تم الحفظ!',
      delete: 'حذف',
      load: 'تحميل',
      verification: 'التحقق وصحة النتيجة',
      stepByStep: 'خطوات الحل والبرهان الرياضي',
      exactSolution: 'الحل التحليلي الدقيق',
      numericalApproximation: 'التقريب العددي',
      restrictions: 'شروط مجال التعريف والاستثناءات',
      method: 'المنهجية الرياضية',
      originalEquation: 'المعادلة الأصلية',
      error: 'خطأ',
      loading: 'جاري حساب البرهان الرياضي...',
      examples: 'أمثلة جاهزة مختارة',
      aiDeepExplanation: 'الشرح البيداغوجي المعمق بالذكاء الاصطناعي',
      aiAnalyzing: 'جاري توليد البرهان والتحليل الهندسي المفصل...',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      centerOrigin: 'إعادة ضبط المنظر',
      settings: 'الإعدادات',
      language: 'اللغة',
    },
    solver: {
      title: 'حل المعادلات الرمزية والعددية المتطورة',
      description:
        'حل المعادلات الخطية، التربيعية، كثيرات الحدود، الجذرية، الكسرية، المثلثية، الأسية واللوغاريتمية، وأنظمة المعادلات مع خطوات رياضية مدققة.',
      inputPlaceholder: 'مثال: 2*x^2 - 5*x + 2 = 0 أو 3*x + 4*y = 12, x - 2*y = 5',
      variableLabel: 'المتغير المستهدف',
      categories: {
        all: 'جميع الأنواع',
        linear: 'خطية',
        quadratic: 'تربيعية',
        polynomial: 'كثيرات حدود',
        system: 'أنظمة معادلات',
        rational: 'نسبية وجذرية',
        exponential: 'أسية ولوغاريتمية',
        trig: 'مثلثية',
        inequality: 'متباينات',
        complex: 'أعداد مركبة',
      },
      sendToGrapher: 'رسم في أستوديو الرسوم',
      noSolutions: 'لا توجد حلول حقيقية لهذه المعادلة في الحقل الحقيقي.',
      infiniteSolutions: 'يوجد عدد لا نهائي من الحلول (متطابقة رياضية).',
      validVerified: 'تم التحقق: الطرف الأيمن مطابق تماماً للطرف الأيسر.',
      extraneousRejected: 'حل دخيل: مستبعد لعدم انتمائه إلى مجال التعريف.',
    },
    graphing: {
      title: 'أستوديو الرسوم البيانية التفاعلي ثنائي وثلاثي الأبعاد',
      description:
        'رسم المنحنيات الديكارتية، الإحداثيات القطبية، المنحنيات الوسيطية، المتباينات، والسطوح ثلاثية الأبعاد مع استكشاف إحداثيات النقاط.',
      mode2d: 'ثنائي الأبعاد (2D)',
      mode3d: 'سطوح ثلاثية الأبعاد (3D)',
      polar: 'قطبي r(θ)',
      parametric: 'وسيطي x(t), y(t)',
      addFunction: 'إضافة دالة',
      functionsList: 'الدوال النشطة',
      plotResolution: 'دقة الشبكة',
      wireframe: 'شبكة الخطوط',
      colorPalette: 'تدرج الألوان',
      cursorCoord: 'إحداثيات المؤشر',
      rootsIntersects: 'الجذور ونقاط التقاطع',
      trace: 'متتبع الإحداثيات',
      zFunction: 'معادلة السطح z = f(x, y)',
      presets: 'أسطح ونماذج جاهزة',
    },
    calculator: {
      title: 'الحاسبة العلمية الدقيقة',
      description:
        'حسابات علمية دقيقة، الدوال المثلثية والزائدية، التباديل والتوافيق، والثوابت الفيزيائية الكونية.',
      standard: 'قياسية',
      scientific: 'علمية متقدمة',
      constants: 'الثوابت الفيزيائية',
      history: 'سجل الحسابات',
      rad: 'راديان',
      deg: 'درجات',
      memoryClear: 'MC',
      memoryRecall: 'MR',
      memoryAdd: 'M+',
      memorySub: 'M-',
    },
    calculus: {
      title: 'مساحة التفاضل والتكامل والتحليل الرياضي',
      description:
        'المشتقات الرمزية والعددية، التكاملات المحددة وغير المحددة، مجاميع ريمان، متسلسلات تايلور، وحساب النهايات.',
      derivative: 'المشتقات',
      integral: 'التكامل ومجاميع ريمان',
      limit: 'النهايات',
      series: 'نشر تايلور وماكلوران',
      tangentLine: 'معادلة خط المماس عند نقطة',
      riemannSum: 'تقريب مجاميع ريمان',
      order: 'رتبة المشتقة',
      atPoint: 'حساب القيمة عند x =',
      lowerBound: 'الحد الأدنى (a)',
      upperBound: 'الحد الأعلى (b)',
      approaches: 'تؤول x نحو',
      stepsCount: 'عدد التقسيمات (n)',
    },
    matrices: {
      title: 'الجبر الخطي: المصفوفات والمتجهات',
      description:
        'عمليات المصفوفات، حذف غاوس خطوة بخطوة، المحددات، المعكوس، القيم الذاتية، والضرب القياسي والاتجاهي للمتجهات.',
      dimensions: 'أبعاد المصفوفة',
      matrixA: 'المصفوفة أ (Matrix A)',
      matrixB: 'المصفوفة ب (Matrix B)',
      vectors: 'عمليات وتمثيل المتجهات',
      determinant: 'المحدد det(A)',
      inverse: 'المعكوس A⁻¹',
      transpose: 'المدور Aᵀ',
      eigenvalues: 'القيم الذاتية والأثر',
      rank: 'الرتبة Rank',
      trace: 'الأثر Trace',
      gaussianElimination: 'خطوات حذف غاوس',
      dotProduct: 'الضرب القياسي (u · v)',
      crossProduct: 'الضرب الاتجاهي (u × v)',
      magnitude: 'طول المتجه (المعيار)',
      angleBetween: 'الزاوية بين المتجهين',
    },
    statistics: {
      title: 'الإحصاء الوصفي وتوزيعات الاحتمالات',
      description:
        'تحليل إحصائي شامل للبيانات، مخططات المدرج التكراري والصندوقي، نماذج الانحدار الخطي، وحساب التوزيعات الاحتمالية.',
      dataInput: 'إدخال البيانات',
      dataPlaceholder: 'أدخل أرقاماً مفصولة بفواصل: 12, 15, 18, 22, 25, 30, 35',
      summaryStats: 'ملخص المقاييس الإحصائية',
      distributions: 'التوزيعات الاحتمالية (الطبيعي، ذو الحدين، بواسون)',
      regression: 'تحليل الانحدار الخطي',
      mean: 'المتوسط الحسابي (μ / x̄)',
      median: 'الوسيط',
      mode: 'المنوال',
      stdDev: 'الانحراف المعياري (σ)',
      variance: 'التباين (σ²)',
      iqr: 'المدى الربيعي (IQR)',
      min: 'أصغر قيمة',
      max: 'أكبر قيمة',
      normal: 'التوزيع الطبيعي (غاوصي)',
      binomial: 'توزيع ذي الحدين',
      poisson: 'توزيع بواسون',
    },
    converter: {
      title: 'محول الوحدات والتحليل البعدي الفيزيائي',
      description:
        'تحويل دقيق بين الوحدات المترية والإنجليزية والفلكية مع صيغ التحويل الرياضية والتحليل البعدي.',
      from: 'التحويل من',
      to: 'التحويل إلى',
      value: 'القيمة المدخلة',
      formula: 'معادلة التحويل الدقيقة',
      dimension: 'البعد الفيزيائي',
    },
    formulas: {
      title: 'مكتبة القوانين والمعادلات العلمية الشاملة',
      description:
        'أكثر من 100 قانون رياضي وفيزيائي وكيميائي مع إمكانية التحميل الفوري بنقرة واحدة داخل مساحة العمل.',
      search: 'ابحث في القوانين، النظريات، المبرهنات...',
      allCategories: 'جميع التخصصات',
      loadToTool: 'تحميل في مساحة العمل',
    },
    imageToMath: {
      title: 'التعرف البصري على المعادلات والرسم اليدوي',
      description:
        'ارفع صورة مسألة من كتاب، أو معادلة مكتوبة بخط اليد، أو ارسم مباشرة على لوحة الرسم التفاعلية للحل والتمثيل البياني الفوري.',
      uploadImage: 'رفع صورة / لقطة شاشة',
      drawCanvas: 'لوحة الكتابة والرسم التفاعلية',
      dropHere: 'اسحب وأفلت الصورة هنا أو انقر للاختيار',
      canvasClear: 'مسح اللوحة',
      recognize: 'تحليل واستخراج المعادلة',
      recognizedExpression: 'التعبير الرياضي المستخرج',
      confidence: 'نسبة الثقة في التعرف',
      solveEquation: 'حل في حلال المعادلات',
      plotGraph: 'تمثيل في أستوديو الرسوم',
    },
    projects: {
      title: 'المشاريع وسجلات العمل المحفوظة',
      description:
        'إدارة الحسابات المحفوظة، تصدير تقارير علمية كاملة بصيغة JSON أو طباعتها بصيغة PDF قابلة للأرشفة والمشاركة.',
      savedWorkspaces: 'الحسابات ودفاتر العمل المحفوظة',
      exportJson: 'تصدير ملف المشروع JSON',
      importJson: 'استيراد مشروع JSON',
      printReport: 'طباعة / تصدير تقرير PDF',
      noProjectsYet: 'لا توجد مشاريع محفوظة بعد. احفظ حساباتك من أي أداة في المنصة!',
    },
  },
};
