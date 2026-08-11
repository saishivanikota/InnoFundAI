from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc
from collections import defaultdict

from app.database import get_db
from app.modules.research.models import ResearchTrend
from app.modules.research.services import OpenAlexService

router = APIRouter()
open_alex_service = OpenAlexService()

@router.get("")
def get_trends(db: Session = Depends(get_db)):
    # 1. Fetch raw trends from database
    raw_trends = db.query(ResearchTrend).order_by(
        ResearchTrend.year.asc(),
        ResearchTrend.research_domain.asc()
    ).all()

    # 2. Pivot data by year for frontend charts
    year_pivot = {}
    domains_set = set()

    for row in raw_trends:
        year = row.year
        domain = row.research_domain
        count = row.publication_count
        domains_set.add(domain)

        if year not in year_pivot:
            year_pivot[year] = {"year": year}
        year_pivot[year][domain] = count

    chart_data = sorted(list(year_pivot.values()), key=lambda x: x["year"])
    domains = sorted(list(domains_set))

    # 3. Compute growth analytics and summary statistics per domain
    analytics = []
    
    for domain in domains:
        domain_records = [r for r in raw_trends if r.research_domain == domain]
        if domain_records:
            # Sorted due to query ordering
            start_record = domain_records[0]
            end_record = domain_records[-1]

            total_pubs = sum(r.publication_count for r in domain_records)
            avg_pubs = round(total_pubs / len(domain_records))

            growth_rate = 0.0
            if start_record.publication_count > 0:
                growth_rate = float(
                    round(((end_record.publication_count - start_record.publication_count) / start_record.publication_count) * 100, 1)
                )

            analytics.append({
                "domain": domain,
                "totalPublications": total_pubs,
                "averagePublications": avg_pubs,
                "startCount": start_record.publication_count,
                "endCount": end_record.publication_count,
                "growthRate": growth_rate
            })

    # Return standard response matching SQLite schema
    return {
        "domains": domains,
        "chartData": chart_data,
        "analytics": analytics,
        "rawTrends": [
            {
                "id": r.id,
                "year": r.year,
                "research_domain": r.research_domain,
                "publication_count": r.publication_count
            }
            for r in raw_trends
        ]
    }


@router.get("/works")
async def search_works(query: str = "artificial intelligence", limit: int = 10):
    """
    Queries live OpenAlex API for scientific research publications, DOIs, and landing pages.
    """
    results = await open_alex_service.search_publications(query, limit=limit)
    return {
        "query": query,
        "count": len(results),
        "works": results
    }
