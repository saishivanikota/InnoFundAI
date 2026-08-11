import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.modules.funding.models import FundingOpportunity
from app.modules.funding.schemas import FundingResponse

router = APIRouter()

@router.get("")
def get_funding_opportunities(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    country: Optional[str] = None,
    minAmount: Optional[float] = None,
    maxAmount: Optional[float] = None,
    deadlineBefore: Optional[str] = None,
    sort: Optional[str] = "funding_amount",
    order: Optional[str] = "DESC",
    page: int = 1,
    limit: int = 6,
    db: Session = Depends(get_db)
):
    query = db.query(FundingOpportunity)
    
    if search:
        query = query.filter(
            (FundingOpportunity.title.ilike(f"%{search}%")) |
            (FundingOpportunity.description.ilike(f"%{search}%")) |
            (FundingOpportunity.organization.ilike(f"%{search}%"))
        )
    if domain:
        query = query.filter(FundingOpportunity.research_domain.ilike(f"%{domain}%"))
    if country:
        query = query.filter(FundingOpportunity.country.ilike(f"%{country}%"))
    if minAmount is not None:
        query = query.filter(FundingOpportunity.funding_amount >= minAmount)
    if maxAmount is not None:
        query = query.filter(FundingOpportunity.funding_amount <= maxAmount)

    # Calculate meta before pagination
    all_domains = [d[0] for d in db.query(FundingOpportunity.research_domain).distinct().all()]
    all_countries = [c[0] for c in db.query(FundingOpportunity.country).distinct().all()]

    total_count = query.count()
    
    # Sorting
    sort_column = getattr(FundingOpportunity, sort, FundingOpportunity.funding_amount)
    if order.upper() == "DESC":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Pagination
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()

    opportunities = [FundingResponse.model_validate(r) for r in results]
    total_pages = max(1, math.ceil(total_count / limit))

    return {
        "opportunities": opportunities,
        "pagination": {
            "page": page,
            "limit": limit,
            "totalCount": total_count,
            "totalPages": total_pages
        },
        "meta": {
            "domains": all_domains,
            "countries": all_countries
        }
    }

@router.get("/recommendations")
def get_funding_recommendations(db: Session = Depends(get_db)):
    results = db.query(FundingOpportunity).filter(FundingOpportunity.status == "Open").limit(5).all()
    recommendations = [FundingResponse.model_validate(r) for r in results]
    return {"recommendations": recommendations}
