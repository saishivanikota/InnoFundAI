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

import logging
from fastapi import Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os

logger = logging.getLogger("uvicorn.error")

app = FastAPI(
    title="Research Funding & Innovation Platform API",
    description="Production-quality FastAPI backend serving funding discovery, patent landscapes, and AI innovation metrics.",
    version="1.0.0"
)

# Exception Handler for transparent error debugging
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on request {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)}
    )

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5001",
        "http://127.0.0.1:5001",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    # Safely migrate ai_history table if result_json column is missing
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE ai_history ADD COLUMN result_json VARCHAR"))
            conn.commit()
    except Exception:
        pass
    # Check if database has users; if empty, run seed automatically
    try:
        from app.database import SessionLocal
        from app.modules.auth.models import User
        db = SessionLocal()
        user_count = db.query(User).count()
        db.close()
        if user_count == 0:
            logger.info("Empty database detected. Seeding default data...")
            from app.seed import seed_database
            seed_database()
    except Exception as e:
        logger.warning(f"Auto-seed check encountered an issue: {str(e)}")

# Include Modular Routers
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])
app.include_router(funding_router, prefix="/api/funding", tags=["Funding"])
app.include_router(research_router, prefix="/api/trends", tags=["Trends"])
app.include_router(patents_router, prefix="/api/patents", tags=["Patents"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/health")
@app.get("/api/health")
def health():
    db_status = "ok"
    try:
        from app.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    return {
        "status": "ok",
        "database": db_status,
        "time": time.time()
    }

# Serve static files and SPA
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dist_dir = os.path.join(base_dir, "frontend", "dist")

if os.path.isdir(dist_dir):
    # Mount the assets directory if it exists
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve index.html or other static files from dist
    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa(full_path: str):
        # Prevent API routes from being intercepted
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
            
        file_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        index_path = os.path.join(dist_dir, "index.html")
        return FileResponse(index_path)
