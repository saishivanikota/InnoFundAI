from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Create database engine with automatic SQLite fallback
try:
    if settings.database_url.startswith("postgresql"):
        engine = create_engine(
            settings.database_url,
            pool_pre_ping=True
        )
        # Test connection
        with engine.connect() as conn:
            pass
        print("Connected to PostgreSQL successfully.")
    else:
        raise ValueError("Not a PostgreSQL URL")
except Exception as e:
    print(f"PostgreSQL connection failed ({str(e)}). Falling back to local SQLite...")
    # SQLite fallback
    engine = create_engine(
        "sqlite:///./research_platform.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
