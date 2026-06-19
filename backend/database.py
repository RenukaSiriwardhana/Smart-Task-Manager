from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# The database file will be named 'tasks.db' and stored locally
SQLALCHEMY_DATABASE_URL = "sqlite:///./tasks.db"

# Create the SQLAlchemy engine for SQLite
# 'check_same_thread' is set to False because FastAPI can access the database from multiple threads
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a local session class to manage database connections
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our database models
Base = declarative_base()