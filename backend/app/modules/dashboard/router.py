from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.modules.auth.models import User
from app.modules.funding.models import FundingOpportunity
from app.modules.research.models import ResearchTrend

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_researchers = db.query(User).count()
    funding_opportunities = db.query(FundingOpportunity).count()
    
    unique_domains_count = db.query(FundingOpportunity.research_domain).distinct().count()
    
    total_pubs_res = db.query(func.sum(ResearchTrend.publication_count)).scalar() or 0

    summary = {
        "totalResearchers": total_researchers,
        "fundingOpportunities": funding_opportunities,
        "uniqueDomains": unique_domains_count,
        "totalPublications": int(total_pubs_res)
    }

    # fundingDistribution
    funding_dist_query = db.query(
        FundingOpportunity.research_domain,
        func.sum(FundingOpportunity.funding_amount)
    ).group_by(FundingOpportunity.research_domain).all()
    funding_distribution = [
        {"domain": d[0], "totalFunding": float(d[1] or 0.0)} for d in funding_dist_query
    ]

    # publicationsByDomain (latest year or sum)
    latest_year_res = db.query(func.max(ResearchTrend.year)).scalar() or 2026
    pubs_domain_query = db.query(
        ResearchTrend.research_domain,
        func.sum(ResearchTrend.publication_count)
    ).filter(ResearchTrend.year == latest_year_res).group_by(ResearchTrend.research_domain).all()
    publications_by_domain = [
        {"domain": p[0], "publications": int(p[1] or 0)} for p in pubs_domain_query
    ]

    # researchGrowth (sum of publications across domains per year)
    growth_query = db.query(
        ResearchTrend.year,
        func.sum(ResearchTrend.publication_count)
    ).group_by(ResearchTrend.year).order_by(ResearchTrend.year.asc()).all()
    research_growth = [
        {"year": g[0], "totalPublications": int(g[1] or 0)} for g in growth_query
    ]

    return {
        "summary": summary,
        "fundingDistribution": funding_distribution,
        "publicationsByDomain": publications_by_domain,
        "researchGrowth": research_growth
    }
