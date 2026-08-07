from pydantic import BaseModel, ConfigDict

class PatentBase(BaseModel):
    patent_id: str
    title: str
    organization: str
    technology_domain: str
    inventor: str
    country: str
    year: int
    url: str | None = None
    status: str = "Granted"

class PatentCreate(PatentBase):
    pass

class PatentResponse(PatentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
