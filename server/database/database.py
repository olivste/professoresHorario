from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get the DATABASE_URL from environment
database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/professores_db")

# Railway provides PostgreSQL connection strings starting with postgres://, 
# but SQLAlchemy 1.4+ requires postgresql://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = database_url

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
