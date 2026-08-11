import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Pre-import all database models to ensure SQLAlchemy mappers are fully configured
import app.modules.auth.models
import app.modules.profile.models
import app.modules.funding.models
import app.modules.patents.models
import app.modules.research.models
import app.modules.ai.models

from app.modules.auth.router import router as auth_router
from app.modules.profile.router import router as profile_router
from app.modules.funding.router import router as funding_router
from app.modules.research.router import router as research_router
from app.modules.patents.router import router as patents_router
from app.modules.ai.router import router as ai_router
from app.modules.dashboard.router import router as dashboard_router
from app.database import Base, engine

app = FastAPI(
    title="Research Funding & Innovation Platform API",
    description="Production-quality FastAPI backend serving funding discovery, patent landscapes, and AI innovation metrics.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

# Include Modular Routers
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])
app.include_router(funding_router, prefix="/api/funding", tags=["Funding"])
app.include_router(research_router, prefix="/api/trends", tags=["Trends"])
app.include_router(patents_router, prefix="/api/patents", tags=["Patents"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/health")
def health():
    return {"status": "ok", "time": time.time()}
