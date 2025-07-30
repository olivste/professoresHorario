from sqlalchemy.orm import Session
from database.database import SessionLocal

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
