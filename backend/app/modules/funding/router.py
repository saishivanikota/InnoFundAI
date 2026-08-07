from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc, func
from datetime import date, datetime
import asyncio

from app.database import get_db
from app.modules.auth.router import get_current_user
from app.modules.funding.models import FundingOpportunity, SavedFunding
from app.modules.funding.schemas import FundingOpportunityResponse
from app.modules.funding.services import GrantsGovService, OpenAlexFundingService

router = APIRouter()
grants_gov_service = GrantsGovService()
openalex_funding_service = OpenAlexFundingService()

@router.get("")
async def list_funding(
    search: str | None = None,
    domain: str | None = None,
    country: str | None = None,
    minAmount: float | None = None,
    maxAmount: float | None = None,
    deadlineBefore: date | None = None,
    sort: str = "funding_amount",
    order: str = "DESC",
    page: int = 1,
    limit: int = 6,
    db: Session = Depends(get_db)
):
    # 1. Fetch live search results from OpenAlex and Grants.gov
    search_query = search or domain
    if search_query and len(search_query.strip()) >= 2:
        try:
            # Query live OpenAlex API and Grants.gov
            openalex_results = await openalex_funding_service.search_funding(search_query, limit=6)
            external_results = openalex_results
            if not external_results:
                external_results = await grants_gov_service.search_funding(search_query, limit=6)

            # Cache new opportunities into DB
            for ext in external_results:
                exists = db.query(FundingOpportunity).filter(
                    and_(
                        FundingOpportunity.title == ext["title"],
                        FundingOpportunity.organization == ext["organization"]
                    )
                ).first()
                if not exists:
                    try:
                        deadline_obj = datetime.strptime(ext["deadline"], "%Y-%m-%d").date()
                    except Exception:
                        deadline_obj = date(2026, 12, 31)
                    
                    db_opp = FundingOpportunity(
                        title=ext["title"],
                        organization=ext["organization"],
                        research_domain=ext["research_domain"],
                        funding_amount=ext["funding_amount"],
                        deadline=deadline_obj,
                        country=ext["country"],
                        description=ext["description"],
                        funding_type=ext["funding_type"],
                        eligibility=ext["eligibility"],
                        url=ext.get("url"),
                        status=ext["status"]
                    )
                    db.add(db_opp)
            db.commit()
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Error fetching live funding data: {str(e)}")

    # 2. Build local PostgreSQL query
    query_obj = db.query(FundingOpportunity)
    
    if search:
        search_wildcard = f"%{search}%"
        query_obj = query_obj.filter(
            or_(
                FundingOpportunity.title.ilike(search_wildcard),
                FundingOpportunity.organization.ilike(search_wildcard),
                FundingOpportunity.description.ilike(search_wildcard)
            )
        )
        
    if domain:
        query_obj = query_obj.filter(FundingOpportunity.research_domain == domain)
        
    if country:
        query_obj = query_obj.filter(FundingOpportunity.country == country)
        
    if minAmount is not None:
        query_obj = query_obj.filter(FundingOpportunity.funding_amount >= minAmount)
        
    if maxAmount is not None:
        query_obj = query_obj.filter(FundingOpportunity.funding_amount <= maxAmount)
        
    if deadlineBefore:
        query_obj = query_obj.filter(FundingOpportunity.deadline <= deadlineBefore)

    # Count total matched
    total_count = query_obj.count()

    # Sort validation and mapping
    allowed_sort_fields = {
        "funding_amount": FundingOpportunity.funding_amount,
        "deadline": FundingOpportunity.deadline,
        "title": FundingOpportunity.title,
        "organization": FundingOpportunity.organization
    }
    
    sort_column = allowed_sort_fields.get(sort, FundingOpportunity.funding_amount)
    if order.upper() == "ASC":
        query_obj = query_obj.order_by(asc(sort_column))
    else:
        query_obj = query_obj.order_by(desc(sort_column))

    # Pagination
    offset = (page - 1) * limit
    opportunities = query_obj.offset(offset).limit(limit).all()

    # Get dropdown options list (domains and countries)
    domains_raw = db.query(FundingOpportunity.research_domain).distinct().order_by(FundingOpportunity.research_domain.asc()).all()
    countries_raw = db.query(FundingOpportunity.country).distinct().order_by(FundingOpportunity.country.asc()).all()

    return {
        "opportunities": [FundingOpportunityResponse.model_validate(opp) for opp in opportunities],
        "pagination": {
            "page": page,
            "limit": limit,
            "totalCount": total_count,
            "totalPages": (total_count + limit - 1) // limit if total_count > 0 else 1
        },
        "meta": {
            "domains": [d[0] for d in domains_raw if d[0]],
            "countries": [c[0] for c in countries_raw if c[0]]
        }
    }


@router.get("/recommendations")
def get_recommendations(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        # Fallback to top general opportunities if profile is not set up yet
        recommendations = db.query(FundingOpportunity).order_by(FundingOpportunity.funding_amount.desc()).limit(5).all()
        return {
            "domain": "General Research",
            "recommendations": [FundingOpportunityResponse.model_validate(rec) for rec in recommendations],
            "hasProfile": False
        }

    domain = profile.research_domain

    # Match based on domain
    recommendations = db.query(FundingOpportunity).filter(
        FundingOpportunity.research_domain.ilike(f"%{domain}%")
    ).order_by(FundingOpportunity.funding_amount.desc()).limit(5).all()

    return {
        "domain": domain,
        "recommendations": [FundingOpportunityResponse.model_validate(rec) for rec in recommendations],
        "hasProfile": True
    }
