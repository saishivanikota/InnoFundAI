from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from app.database import get_db
from app.modules.patents.models import Patent
from app.modules.patents.schemas import PatentResponse

router = APIRouter()

@router.get("", response_model=List[PatentResponse])
def get_patents(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    country: Optional[str] = None,
    status: Optional[str] = None,
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

    return query.all()

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
