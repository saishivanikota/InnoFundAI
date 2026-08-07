from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

import os

# SQLite fallback path resolution (check workspace root first)
db_filename = "research_platform.db"
root_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", db_filename))
if os.path.exists(root_db_path):
    sqlite_db_path = root_db_path
elif os.path.exists(os.path.join(os.getcwd(), db_filename)):
    sqlite_db_path = os.path.join(os.getcwd(), db_filename)
else:
    sqlite_db_path = root_db_path

try:
    if settings.database_url.startswith("postgresql"):
        engine = create_engine(
            settings.database_url,
            pool_pre_ping=True
        )
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Connected to PostgreSQL successfully.")
    else:
        raise ValueError("Not a PostgreSQL URL")
except Exception as e:
    print(f"PostgreSQL connection failed ({str(e)}). Falling back to local SQLite at {sqlite_db_path}...")
    engine = create_engine(
        f"sqlite:///{sqlite_db_path}",
        connect_args={"check_same_thread": False}
    )
    from sqlalchemy import event
    from sqlalchemy.engine import Engine

    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        if sqlite_db_path in str(dbapi_connection):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
