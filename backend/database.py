from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file path
SQLALCHEMY_DATABASE_URL = "sqlite:///./tasks.db"

# Initialize engine with multi-thread support for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Session factory for handling database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for database models to inherit
Base = declarative_base()

# Dependency provider to inject database sessions into routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()