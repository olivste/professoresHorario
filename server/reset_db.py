from database.database import engine
from database import models

def reset_database():
    print("Dropping all tables...")
    models.Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    models.Base.metadata.create_all(bind=engine)
    print("Database reset completed!")

if __name__ == "__main__":
    reset_database()
