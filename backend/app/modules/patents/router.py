import math
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.modules.patents.models import Patent
from app.modules.patents.schemas import PatentResponse

router = APIRouter()

@router.get("")
def get_patents(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    country: Optional[str] = None,
    status: Optional[str] = None,
    year: Optional[int] = None,
    sort: Optional[str] = "year",
    order: Optional[str] = "DESC",
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Patent)

    if search:
        query = query.filter(
            (Patent.title.ilike(f"%{search}%")) |
            (Patent.patent_id.ilike(f"%{search}%")) |
            (Patent.organization.ilike(f"%{search}%")) |
            (Patent.inventor.ilike(f"%{search}%"))
        )
    if domain:
        query = query.filter(Patent.technology_domain.ilike(f"%{domain}%"))
    if country:
        query = query.filter(Patent.country.ilike(f"%{country}%"))
    if status:
        query = query.filter(Patent.status.ilike(f"%{status}%"))
    if year is not None:
        query = query.filter(Patent.year == year)

    # Collect distinct meta values
    all_domains = [d[0] for d in db.query(Patent.technology_domain).distinct().all()]
    all_countries = [c[0] for c in db.query(Patent.country).distinct().all()]
    all_statuses = [s[0] for s in db.query(Patent.status).distinct().all()]
    all_years = [y[0] for y in db.query(Patent.year).distinct().order_by(Patent.year.desc()).all()]

    total_count = query.count()

    # Sorting
    sort_column = getattr(Patent, sort, Patent.year)
    if order.upper() == "DESC":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Pagination
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()

    patents = [PatentResponse.model_validate(p) for p in results]
    total_pages = max(1, math.ceil(total_count / limit))

    return {
        "patents": patents,
        "pagination": {
            "page": page,
            "limit": limit,
            "totalCount": total_count,
            "totalPages": total_pages
        },
        "meta": {
            "domains": all_domains,
            "countries": all_countries,
            "statuses": all_statuses,
            "years": all_years
        }
    }

@router.get("/stats")
def get_patent_stats(db: Session = Depends(get_db)):
    total = db.query(Patent).count()
    granted = db.query(Patent).filter(Patent.status == "Granted").count()
    pending = db.query(Patent).filter(Patent.status == "Pending").count()

    domains = db.query(Patent.technology_domain, func.count(Patent.id)).group_by(Patent.technology_domain).all()
    by_domain = [{"domain": d[0], "count": d[1]} for d in domains]

    years = db.query(Patent.year, func.count(Patent.id)).group_by(Patent.year).order_by(Patent.year.asc()).all()
    by_year = [{"year": y[0], "count": y[1]} for y in years]

    orgs = db.query(Patent.organization, func.count(Patent.id)).group_by(Patent.organization).order_by(func.count(Patent.id).desc()).limit(5).all()
    top_orgs = [{"organization": o[0], "count": o[1]} for o in orgs]

    return {
        "summary": {
            "total": total,
            "granted": granted,
            "pending": pending
        },
        "byDomain": by_domain,
        "byYear": by_year,
        "topOrgs": top_orgs
    }

@router.get("/{id}", response_model=PatentResponse)
def get_patent(id: int, db: Session = Depends(get_db)):
    patent = db.query(Patent).filter(Patent.id == id).first()
    if not patent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patent not found")
    return patent
