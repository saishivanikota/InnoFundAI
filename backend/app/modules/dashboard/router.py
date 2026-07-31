from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc

from app.database import get_db
from app.modules.auth.models import User
from app.modules.profile.models import Profile
from app.modules.funding.models import FundingOpportunity
from app.modules.research.models import ResearchTrend

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Core Summary Metrics
    user_count = db.query(User).filter(User.role == "researcher").count()
    profile_count = db.query(Profile).count()
    funding_count = db.query(FundingOpportunity).count()
    
    domain_count_raw = db.query(func.count(func.distinct(FundingOpportunity.research_domain))).scalar()
    domain_count = domain_count_raw if domain_count_raw is not None else 0
    
    total_pubs_raw = db.query(func.sum(ResearchTrend.publication_count)).scalar()
    total_publications = int(total_pubs_raw) if total_pubs_raw is not None else 0

    summary = {
        "totalResearchers": profile_count,
        "totalRegisteredUsers": user_count,
        "fundingOpportunities": funding_count,
        "uniqueDomains": domain_count,
        "totalPublications": total_publications
    }

    # 2. Funding Distribution (Total funding budget per research domain)
    funding_distribution_raw = db.query(
        FundingOpportunity.research_domain.label("domain"),
        func.sum(FundingOpportunity.funding_amount).label("totalFunding"),
        func.count(FundingOpportunity.id).label("opportunityCount")
    ).group_by(FundingOpportunity.research_domain).order_by(desc("totalFunding")).all()

    funding_distribution = [
        {
            "domain": r.domain,
            "totalFunding": float(r.totalFunding) if r.totalFunding is not None else 0.0,
            "opportunityCount": r.opportunityCount
        }
        for r in funding_distribution_raw
    ]

    # 3. Publications by Domain (For the latest recorded year)
    latest_year_raw = db.query(func.max(ResearchTrend.year)).scalar()
    latest_year = latest_year_raw if latest_year_raw is not None else 2026

    publications_by_domain_raw = db.query(
        ResearchTrend.research_domain.label("domain"),
        ResearchTrend.publication_count.label("publications")
    ).filter(ResearchTrend.year == latest_year).order_by(desc("publications")).all()

    publications_by_domain = [
        {"domain": r.domain, "publications": r.publications}
        for r in publications_by_domain_raw
    ]

    # 4. Research Growth Over Time (Total publication sum aggregated by year)
    research_growth_raw = db.query(
        ResearchTrend.year.label("year"),
        func.sum(ResearchTrend.publication_count).label("totalPublications")
    ).group_by(ResearchTrend.year).order_by(asc("year")).all()

    research_growth = [
        {"year": r.year, "totalPublications": int(r.totalPublications)}
        for r in research_growth_raw
    ]

    return {
        "summary": summary,
        "fundingDistribution": funding_distribution,
        "publicationsByDomain": publications_by_domain,
        "researchGrowth": research_growth,
        "metadata": {
            "latestYear": latest_year
        }
    }
