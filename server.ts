import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Image-to-Math recognition endpoint
app.post('/api/image-to-math', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', language = 'en' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Please check your API key in Secrets.',
      });
    }

    // Strip data URL header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const promptText = `Analyze this image containing mathematical expressions, equations, formulas, or problems.
Extract the exact mathematical content. If there are multiple equations or a problem statement, extract the primary equation to solve/graph, and summarize any additional context.
Respond with JSON matching the specified schema.

Language requested: ${language === 'ar' ? 'Arabic (provide explanations/summaries in Arabic if requested, but keep math notation clean and standard)' : 'English'}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/png',
            data: cleanBase64,
          },
        },
        {
          text: promptText,
        },
      ],
      config: {
        systemInstruction:
          'You are MATHVERSE Vision Engine, a world-class mathematical optical character recognition and problem understanding system. You convert handwritten, drawn, or printed mathematical equations and scientific problems into exact LaTeX and machine-evaluable expressions (math.js compatible syntax like x^2 + 3*x - 4 = 0).',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedText: {
              type: Type.STRING,
              description: 'Human-readable transcription of the problem or equation.',
            },
            latex: {
              type: Type.STRING,
              description: 'Exact standard LaTeX representation of the mathematical formula.',
            },
            cleanExpression: {
              type: Type.STRING,
              description:
                'Clean plain-text mathematical expression suitable for evaluation (e.g. 2*x^2 - 5*x + 3 = 0, or sin(x) + cos(x)).',
            },
            category: {
              type: Type.STRING,
              description:
                'Category of math: algebra, quadratic, calculus, linear_system, trigonometry, geometry, physics, statistics, or general.',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence score from 0.0 to 1.0.',
            },
            variables: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of variables detected (e.g. ["x"], ["x", "y"], ["t"]).',
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                'Suggested actions: e.g. "solve", "graph2d", "graph3d", "differentiate", "integrate", "simplify".',
            },
            notes: {
              type: Type.STRING,
              description: 'Brief explanation or notes on ambiguities or interpretation.',
            },
          },
          required: ['detectedText', 'latex', 'cleanExpression', 'category', 'confidence'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Image to math recognition error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process image.',
    });
  }
});

// AI Advanced Math Reasoning / Pedagogical Explanation
app.post('/api/ai-explain', async (req, res) => {
  try {
    const { problem, method, language = 'en', context } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problem description or equation is required.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server.',
      });
    }

    const langInstruction =
      language === 'ar'
        ? 'Please provide the explanation, steps, intuition, and verification in fluent, natural Arabic (using RTL mathematical conventions and terminology, e.g. التفاضل، التكامل، الجذور، المصفوفات).'
        : 'Provide the explanation in clear, professional English with rigorous mathematical explanations.';

    const prompt = `Provide an in-depth mathematical breakdown, method intuition, formal steps, geometrical interpretation, and verification for the following problem:
Problem / Equation: ${problem}
Method requested: ${method || 'Standard rigorous analytical method'}
Context / Domain: ${context || 'Pure and Applied Mathematics'}

${langInstruction}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are MATHVERSE Master Mathematician, an expert university mathematics and science educator. You provide rigorous, accurate, step-by-step mathematical solutions with theoretical proofs, geometric intuition, edge-case analysis, and sanity-check verifications. Output clean markdown with LaTeX equations ($...$ and $$...$$).',
      },
    });

    return res.json({
      explanation: response.text || '',
    });
  } catch (error: any) {
    console.error('AI explanation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate explanation.',
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MATHVERSE server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
