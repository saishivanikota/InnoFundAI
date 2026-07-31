import os
import json
import logging
from sqlalchemy.orm import Session
import google.generativeai as genai

from app.config import settings
from app.modules.profile.models import Profile
from app.modules.patents.models import Patent
from app.modules.funding.models import FundingOpportunity
from app.modules.research.models import ResearchTrend

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        else:
            self.model = None

    def calculate_innovation_score(self, profile: Profile, db: Session) -> dict:
        """
        Implements a weighted scoring model:
        - Research Novelty: 30%
        - Patent Strength: 20%
        - Technology Readiness: 15%
        - Market Potential: 20%
        - Funding Relevance: 15%
        """
        # 1. Research Novelty (30%): Length and detail of research interest + uniqueness of keywords
        novelty_base = 70.0
        interest_len = len(profile.research_interests or "")
        keywords_count = len([k for k in profile.keywords.split(",") if k.strip()])
        
        novelty_score = min(novelty_base + (interest_len / 30.0) + (keywords_count * 2.0), 98.0)

        # 2. Patent Strength (20%): Look up how many patents exist in the user's technology domain
        domain = profile.research_domain
        patent_count = db.query(Patent).filter(Patent.technology_domain.ilike(f"%{domain}%")).count()
        patent_score = min(65.0 + (patent_count * 3.0), 96.0)

        # 3. Technology Readiness Level (15%): Scan interests/keywords for terms indicating high TRL
        trl_terms = ["prototype", "product", "deployment", "implementation", "commercial", "scale", "system"]
        interests_lower = profile.research_interests.lower()
        trl_hits = sum(1 for term in trl_terms if term in interests_lower)
        
        # Base TRL score (approx TRL 3)
        trl_score = min(60.0 + (trl_hits * 8.0), 95.0)

        # 4. Market Potential (20%): Map growth rate of the research domain
        # Get oldest and newest publication counts for the domain
        trends = db.query(ResearchTrend).filter(
            ResearchTrend.research_domain.ilike(f"%{domain}%")
        ).order_by(ResearchTrend.year.asc()).all()
        
        market_score = 75.0
        if len(trends) >= 2:
            start_val = trends[0].publication_count
            end_val = trends[-1].publication_count
            if start_val > 0:
                growth_rate = ((end_val - start_val) / start_val) * 100
                market_score = min(70.0 + (growth_rate / 15.0), 97.0)

        # 5. Funding Relevance (15%): Matches based on number of active funding opportunities in domain
        funding_count = db.query(FundingOpportunity).filter(
            FundingOpportunity.research_domain.ilike(f"%{domain}%")
        ).count()
        funding_score = min(70.0 + (funding_count * 4.0), 98.0)

        # Calculate weighted overall score
        overall = (
            (novelty_score * 0.30) +
            (patent_score * 0.20) +
            (trl_score * 0.15) +
            (market_score * 0.20) +
            (funding_score * 0.15)
        )

        return {
            "overall": round(overall, 1),
            "breakdown": {
                "researchNovelty": round(novelty_score, 1),
                "patentStrength": round(patent_score, 1),
                "technologyReadiness": round(trl_score, 1),
                "marketPotential": round(market_score, 1),
                "fundingRelevance": round(funding_score, 1)
            }
        }

    async def analyze_idea(self, idea: str) -> dict:
        prompt = f"""
        You are an expert innovation strategist and research commercialization advisor.

        A researcher has submitted the following research idea:
        "{idea}"

        Provide a comprehensive innovation analysis structured as JSON with exactly these keys:
        {{
          "commercialization": ["suggestion 1", "suggestion 2", "suggestion 3"],
          "industries": ["industry 1", "industry 2", "industry 3"],
          "funding": ["funding source 1", "funding source 2", "funding source 3"],
          "improvements": ["improvement 1", "improvement 2", "improvement 3"],
          "impact": "A 2-3 sentence description of the potential research impact.",
          "collaborators": ["collaborator type 1", "collaborator type 2", "collaborator type 3"],
          "trl": "Technology Readiness Level assessment and path to TRL 9."
        }}

        Return only valid JSON. No markdown fences. No extra text.
        """
        
        if self.model:
            try:
                # Call Gemini
                response = self.model.generate_content(prompt)
                raw_text = response.text.strip()
                # Clean up any potential markdown wraps
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                
                result = json.loads(raw_text.strip())
                return result
            except Exception as e:
                logger.error(f"Gemini API invocation error: {str(e)}")
                
        # Intelligent Mock Fallback
        return self._generate_mock_response(idea)

    def _generate_mock_response(self, idea: str) -> dict:
        idea_lower = idea.lower()
        is_ai = any(x in idea_lower for x in ["ai", "machine learning", "neural", "deep learning", "intelligence"])
        is_energy = any(x in idea_lower for x in ["solar", "energy", "battery", "grid", "power", "wind"])
        is_health = any(x in idea_lower for x in ["medical", "health", "drug", "cancer", "clinical", "biotech"])
        is_quantum = any(x in idea_lower for x in ["quantum", "qubit", "cryptography"])

        if is_ai:
            return {
                "commercialization": [
                    "License the algorithm to enterprise software vendors",
                    "Develop a SaaS API platform for inference-as-a-service",
                    "Partner with cloud providers (AWS, GCP, Azure) for integrated deployment"
                ],
                "industries": ["Healthcare Diagnostics", "Financial Services & Fraud Detection", "Autonomous Vehicle Systems"],
                "funding": ["NSF SBIR Phase I/II Grants ($150K–$1M)", "NIH R01 Research Funding for AI in medicine", "DOE ARPA-E Innovation Grants"],
                "improvements": [
                    "Incorporate explainability modules (SHAP/LIME) for regulatory compliance",
                    "Optimize inference speed via knowledge distillation",
                    "Add federated learning for privacy-preserving training"
                ],
                "impact": "This research addresses critical gaps in AI deployment reliability and safety. Widespread adoption could improve decision accuracy across multiple high-stakes domains, reducing costs and increasing operational efficiency.",
                "collaborators": [
                    "Academic AI labs (MIT CSAIL, Stanford HAI)",
                    "Industry R&D divisions (Google DeepMind, Microsoft Research)",
                    "Regulatory bodies for AI ethics and safety standards"
                ],
                "trl": "Current TRL: 3–4 (Proof of Concept). Path to TRL 9: Develop prototype system (TRL 5-6), conduct pilot deployments with enterprise partners (TRL 7), complete validation and certification (TRL 8-9). Estimated timeline: 18–36 months."
            }

        if is_energy:
            return {
                "commercialization": [
                    "License manufacturing IP to established solar panel producers",
                    "Spin-off company targeting commercial building integration markets",
                    "Joint venture with utility companies for grid-scale deployment"
                ],
                "industries": ["Utility & Power Generation", "Building & Construction", "Electric Vehicle Charging Infrastructure"],
                "funding": ["DOE Office of Energy Efficiency SBIR grants", "EU Horizon Europe Clean Energy funding calls", "Private equity from cleantech venture funds"],
                "improvements": [
                    "Address long-term stability and degradation challenges",
                    "Develop cost-effective large-area manufacturing processes",
                    "Integrate with smart grid management and storage systems"
                ],
                "impact": "Breakthroughs in renewable energy storage and generation are critical to achieving net-zero targets. This research could reduce energy costs by 20–40% and accelerate the transition away from fossil fuels.",
                "collaborators": [
                    "National Renewable Energy Laboratory (NREL)",
                    "Solar industry consortia (SolarPower Europe)",
                    "Grid operators and utility companies for deployment pilots"
                ],
                "trl": "Current TRL: 4–5 (Lab Validation). Path to TRL 9: Scale to pilot production line (TRL 6), field testing and performance validation (TRL 7-8), commercial production qualification (TRL 9). Estimated timeline: 24–48 months."
            }

        if is_health:
            return {
                "commercialization": [
                    "Pursue FDA/CE regulatory pathway for medical device or diagnostic classification",
                    "Partner with pharmaceutical companies for clinical trial integration",
                    "License biomarker IP for diagnostics kit development"
                ],
                "industries": ["Clinical Diagnostics", "Pharmaceutical R&D", "Digital Health & Remote Monitoring"],
                "funding": ["NIH R01/R21 Research Grants ($250K–$2M)", "Wellcome Trust Health Innovation grants", "Bill & Melinda Gates Foundation for global health applications"],
                "improvements": [
                    "Conduct multi-site clinical validation studies for generalizability",
                    "Integrate with Electronic Health Record (EHR) systems",
                    "Develop real-world evidence framework for post-market surveillance"
                ],
                "impact": "Early and accurate diagnosis saves lives and reduces healthcare costs. This research could improve patient outcomes, reduce diagnostic errors by up to 30%, and enable personalized treatment pathways at scale.",
                "collaborators": [
                    "Academic medical centers and teaching hospitals",
                    "Biotech companies (Illumina, Roche Diagnostics)",
                    "Patient advocacy groups for clinical trial recruitment"
                ],
                "trl": "Current TRL: 3–4 (Proof of Concept). Path to TRL 9: Preclinical validation (TRL 5), Phase I/II clinical trials (TRL 6-7), regulatory submission and approval (TRL 8-9). Estimated timeline: 36–60 months."
            }

        # General Default
        return {
            "commercialization": [
                "File provisional patent to secure intellectual property rights",
                "Engage with technology transfer offices for licensing opportunities",
                "Explore spin-off company formation with institutional support"
            ],
            "industries": ["Advanced Manufacturing", "Research & Scientific Instrumentation", "Government & Defense R&D"],
            "funding": ["NSF CAREER Award for early-career researchers", "DARPA Young Faculty Award ($500K)", "ERC Starting Grant (European Research Council)"],
            "improvements": [
                "Establish rigorous benchmarking against existing state-of-the-art solutions",
                "Build multidisciplinary team spanning technical and domain expertise",
                "Develop clear metrics for evaluating real-world impact"
            ],
            "impact": "This foundational research addresses important open challenges in the field. With proper development and commercialization pathways, it has strong potential to create lasting scientific and societal value.",
            "collaborators": [
                "Domain expert research groups at R1 universities",
                "Industry partners for real-world validation datasets",
                "National laboratories for access to specialized equipment"
            ],
            "trl": "Current TRL: 2–3 (Technology Concept Formulated). Path to TRL 9: Experimental proof of concept (TRL 3-4), prototype development (TRL 5-6), system demonstration (TRL 7), qualification and deployment (TRL 8-9). Estimated timeline: 24–60 months."
        }
