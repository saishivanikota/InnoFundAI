import express from 'express';
import { run, query } from '../config/db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Structured prompt builder for Gemini / mock fallback
const buildPrompt = (idea) => `
You are an expert innovation strategist and research commercialization advisor.

A researcher has submitted the following research idea:
"${idea}"

Provide a comprehensive innovation analysis structured as JSON with exactly these keys:
{
  "commercialization": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "industries": ["industry 1", "industry 2", "industry 3"],
  "funding": ["funding source 1", "funding source 2", "funding source 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "impact": "A 2-3 sentence description of the potential research impact.",
  "collaborators": ["collaborator type 1", "collaborator type 2", "collaborator type 3"],
  "trl": "Technology Readiness Level assessment and path to TRL 9."
}

Return only valid JSON. No markdown fences. No extra text.
`;

// Mock intelligent fallback when no Gemini API key present
const generateMockResponse = (idea) => {
  const ideaLower = idea.toLowerCase();
  const isAI = ideaLower.includes('ai') || ideaLower.includes('machine learning') || ideaLower.includes('neural');
  const isEnergy = ideaLower.includes('solar') || ideaLower.includes('energy') || ideaLower.includes('battery');
  const isHealth = ideaLower.includes('medical') || ideaLower.includes('health') || ideaLower.includes('drug');
  const isQuantum = ideaLower.includes('quantum') || ideaLower.includes('qubit');

  if (isAI) return {
    commercialization: ['License the algorithm to enterprise software vendors', 'Develop a SaaS API platform for inference-as-a-service', 'Partner with cloud providers (AWS, GCP, Azure) for integrated deployment'],
    industries: ['Healthcare Diagnostics', 'Financial Services & Fraud Detection', 'Autonomous Vehicle Systems'],
    funding: ['NSF SBIR Phase I/II Grants ($150K–$1M)', 'NIH R01 Research Funding for AI in medicine', 'DOE ARPA-E Innovation Grants'],
    improvements: ['Incorporate explainability modules (SHAP/LIME) for regulatory compliance', 'Optimize inference speed via knowledge distillation', 'Add federated learning for privacy-preserving training'],
    impact: 'This research addresses critical gaps in AI deployment reliability and safety. Widespread adoption could improve decision accuracy across multiple high-stakes domains, reducing costs and increasing operational efficiency.',
    collaborators: ['Academic AI labs (MIT CSAIL, Stanford HAI)', 'Industry R&D divisions (Google DeepMind, Microsoft Research)', 'Regulatory bodies for AI ethics and safety standards'],
    trl: 'Current TRL: 3–4 (Proof of Concept). Path to TRL 9: Develop prototype system (TRL 5-6), conduct pilot deployments with enterprise partners (TRL 7), complete validation and certification (TRL 8-9). Estimated timeline: 18–36 months.'
  };

  if (isEnergy) return {
    commercialization: ['License manufacturing IP to established solar panel producers', 'Spin-off company targeting commercial building integration markets', 'Joint venture with utility companies for grid-scale deployment'],
    industries: ['Utility & Power Generation', 'Building & Construction', 'Electric Vehicle Charging Infrastructure'],
    funding: ['DOE Office of Energy Efficiency SBIR grants', 'EU Horizon Europe Clean Energy funding calls', 'Private equity from cleantech venture funds'],
    improvements: ['Address long-term stability and degradation challenges', 'Develop cost-effective large-area manufacturing processes', 'Integrate with smart grid management and storage systems'],
    impact: 'Breakthroughs in renewable energy storage and generation are critical to achieving net-zero targets. This research could reduce energy costs by 20–40% and accelerate the transition away from fossil fuels.',
    collaborators: ['National Renewable Energy Laboratory (NREL)', 'Solar industry consortia (SolarPower Europe)', 'Grid operators and utility companies for deployment pilots'],
    trl: 'Current TRL: 4–5 (Lab Validation). Path to TRL 9: Scale to pilot production line (TRL 6), field testing and performance validation (TRL 7-8), commercial production qualification (TRL 9). Estimated timeline: 24–48 months.'
  };

  if (isHealth) return {
    commercialization: ['Pursue FDA/CE regulatory pathway for medical device or diagnostic classification', 'Partner with pharmaceutical companies for clinical trial integration', 'License biomarker IP for diagnostics kit development'],
    industries: ['Clinical Diagnostics', 'Pharmaceutical R&D', 'Digital Health & Remote Monitoring'],
    funding: ['NIH R01/R21 Research Grants ($250K–$2M)', 'Wellcome Trust Health Innovation grants', 'Bill & Melinda Gates Foundation for global health applications'],
    improvements: ['Conduct multi-site clinical validation studies for generalizability', 'Integrate with Electronic Health Record (EHR) systems', 'Develop real-world evidence framework for post-market surveillance'],
    impact: 'Early and accurate diagnosis saves lives and reduces healthcare costs. This research could improve patient outcomes, reduce diagnostic errors by up to 30%, and enable personalized treatment pathways at scale.',
    collaborators: ['Academic medical centers and teaching hospitals', 'Biotech companies (Illumina, Roche Diagnostics)', 'Patient advocacy groups for clinical trial recruitment'],
    trl: 'Current TRL: 3–4 (Proof of Concept). Path to TRL 9: Preclinical validation (TRL 5), Phase I/II clinical trials (TRL 6-7), regulatory submission and approval (TRL 8-9). Estimated timeline: 36–60 months.'
  };

  return {
    commercialization: ['File provisional patent to secure intellectual property rights', 'Engage with technology transfer offices for licensing opportunities', 'Explore spin-off company formation with institutional support'],
    industries: ['Advanced Manufacturing', 'Research & Scientific Instrumentation', 'Government & Defense R&D'],
    funding: ['NSF CAREER Award for early-career researchers', 'DARPA Young Faculty Award ($500K)', 'ERC Starting Grant (European Research Council)'],
    improvements: ['Establish rigorous benchmarking against existing state-of-the-art solutions', 'Build multidisciplinary team spanning technical and domain expertise', 'Develop clear metrics for evaluating real-world impact'],
    impact: 'This foundational research addresses important open challenges in the field. With proper development and commercialization pathways, it has strong potential to create lasting scientific and societal value.',
    collaborators: ['Domain expert research groups at R1 universities', 'Industry partners for real-world validation datasets', 'National laboratories for access to specialized equipment'],
    trl: 'Current TRL: 2–3 (Technology Concept Formulated). Path to TRL 9: Experimental proof of concept (TRL 3-4), prototype development (TRL 5-6), system demonstration (TRL 7), qualification and deployment (TRL 8-9). Estimated timeline: 24–60 months.'
  };
};

// POST /api/ai/analyze — generate AI analysis (Gemini or mock)
router.post('/analyze', authMiddleware, async (req, res) => {
  const { idea } = req.body;

  if (!idea || idea.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide a detailed research idea (at least 10 characters).' });
  }

  try {
    let result;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Real Gemini API call
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt(idea) }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
          })
        }
      );

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      result = JSON.parse(rawText);
    } else {
      // Intelligent mock fallback
      result = generateMockResponse(idea);
    }

    // Persist to history
    await run(
      'INSERT INTO ai_history (user_id, prompt, response) VALUES (?, ?, ?)',
      [req.user.id, idea.trim(), JSON.stringify(result)]
    );

    return res.json({ idea: idea.trim(), result });
  } catch (error) {
    console.error('AI analyze error:', error);
    return res.status(500).json({ error: 'Failed to generate AI analysis.' });
  }
});

// GET /api/ai/history — retrieve previous analyses for this user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await query(
      'SELECT id, prompt, response, created_at FROM ai_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );

    const parsed = history.map(h => ({
      ...h,
      result: JSON.parse(h.response)
    }));

    return res.json(parsed);
  } catch (error) {
    console.error('AI history error:', error);
    return res.status(500).json({ error: 'Server error retrieving AI history.' });
  }
});

export default router;
