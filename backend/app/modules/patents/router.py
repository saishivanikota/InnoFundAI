from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc, func

from app.database import get_db
from app.modules.patents.models import Patent
from app.modules.patents.schemas import PatentResponse
from app.modules.patents.services import USPTOService

router = APIRouter()
uspto_service = USPTOService()

@router.get("")
async def list_patents(
    search: str | None = None,
    domain: str | None = None,
    status: str | None = None,
    country: str | None = None,
    year: int | None = None,
    sort: str = "year",
    order: str = "DESC",
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    # 1. Fetch live open-data USPTO search results and cache
    if search and len(search.strip()) >= 3:
        try:
            live_patents = await uspto_service.search_patents(search, limit=5)
            for lp in live_patents:
                exists = db.query(Patent).filter(Patent.patent_id == lp["patent_id"]).first()
                if not exists:
                    db_patent = Patent(
                        patent_id=lp["patent_id"],
                        title=lp["title"],
                        organization=lp["organization"],
                        technology_domain=lp["technology_domain"],
                        inventor=lp["inventor"],
                        country=lp["country"],
                        year=lp["year"],
                        status=lp["status"]
                    )
                    db.add(db_patent)
            db.commit()
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Error fetching live USPTO patents: {str(e)}")

    # 2. Build local PostgreSQL query
    query_obj = db.query(Patent)

    if search:
        w = f"%{search}%"
        query_obj = query_obj.filter(
            or_(
                Patent.title.ilike(w),
                Patent.organization.ilike(w),
                Patent.inventor.ilike(w),
                Patent.patent_id.ilike(w)
            )
        )
    if domain:
        query_obj = query_obj.filter(Patent.technology_domain == domain)
    if status:
        query_obj = query_obj.filter(Patent.status == status)
    if country:
        query_obj = query_obj.filter(Patent.country == country)
    if year:
        query_obj = query_obj.filter(Patent.year == year)

    total_count = query_obj.count()

    # Sorting
    allowed = ["year", "title", "organization", "status"]
    sort_column = getattr(Patent, sort if sort in allowed else "year")
    if order.upper() == "ASC":
        query_obj = query_obj.order_by(asc(sort_column))
    else:
        query_obj = query_obj.order_by(desc(sort_column))

    # Pagination
    offset = (page - 1) * limit
    patents = query_obj.offset(offset).limit(limit).all()

    # Meta collections for filtering dropdowns
    domains_raw = db.query(Patent.technology_domain).distinct().order_by(Patent.technology_domain.asc()).all()
    countries_raw = db.query(Patent.country).distinct().order_by(Patent.country.asc()).all()
    statuses_raw = db.query(Patent.status).distinct().order_by(Patent.status.asc()).all()
    years_raw = db.query(Patent.year).distinct().order_by(Patent.year.desc()).all()

    return {
        "patents": [PatentResponse.model_validate(p) for p in patents],
        "pagination": {
            "page": page,
            "limit": limit,
            "totalCount": total_count,
            "totalPages": (total_count + limit - 1) // limit if total_count > 0 else 1
        },
        "meta": {
            "domains": [d[0] for d in domains_raw if d[0]],
            "countries": [c[0] for c in countries_raw if c[0]],
            "statuses": [s[0] for s in statuses_raw if s[0]],
            "years": [y[0] for y in years_raw if y[0] is not None]
        }
    }


@router.get("/stats")
def get_patent_stats(db: Session = Depends(get_db)):
    by_domain_raw = db.query(
        Patent.technology_domain.label("domain"),
        func.count(Patent.id).label("count")
    ).group_by(Patent.technology_domain).order_by(desc("count")).all()

    by_year_raw = db.query(
        Patent.year.label("year"),
        func.count(Patent.id).label("count")
    ).group_by(Patent.year).order_by(asc("year")).all()

    by_status_raw = db.query(
        Patent.status.label("status"),
        func.count(Patent.id).label("count")
    ).group_by(Patent.status).order_by(desc("count")).all()

    top_orgs_raw = db.query(
        Patent.organization.label("organization"),
        func.count(Patent.id).label("count")
    ).group_by(Patent.organization).order_by(desc("count")).limit(8).all()

    total = db.query(Patent).count()
    granted = db.query(Patent).filter(Patent.status == "Granted").count()
    pending = db.query(Patent).filter(Patent.status == "Pending").count()

    return {
        "summary": {
            "total": total,
            "granted": granted,
            "pending": pending
        },
        "byDomain": [{"domain": r[0], "count": r[1]} for r in by_domain_raw],
        "byYear": [{"year": r[0], "count": r[1]} for r in by_year_raw],
        "byStatus": [{"status": r[0], "count": r[1]} for r in by_status_raw],
        "topOrgs": [{"organization": r[0], "count": r[1]} for r in top_orgs_raw]
    }


@router.get("/{patent_db_id}", response_model=PatentResponse)
def get_patent(patent_db_id: int, db: Session = Depends(get_db)):
    patent = db.query(Patent).filter(Patent.id == patent_db_id).first()
    if not patent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patent not found."
        )
    return patent
