import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.router import router as auth_router
from app.modules.profile.router import router as profile_router
from app.modules.funding.router import router as funding_router
from app.modules.research.router import router as research_router
from app.modules.patents.router import router as patents_router
from app.modules.ai.router import router as ai_router
from app.modules.dashboard.router import router as dashboard_router

app = FastAPI(
    title="AI Research & Funding Platform API",
    description="Production-quality FastAPI backend serving funding discovery and AI innovation metrics.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
