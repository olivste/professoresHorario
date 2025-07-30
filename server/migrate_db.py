from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/professores_db")
engine = create_engine(DATABASE_URL)

def run_migration():
    print("Starting database migration...")
    with engine.connect() as connection:
        # Check if username column exists
        check_column = connection.execute(text(
            """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'usuarios' AND column_name = 'username'
            """
        ))
        
        if not check_column.fetchone():
            print("Adding username column to usuarios table...")
            # Add the username column
            connection.execute(text(
                """
                ALTER TABLE usuarios 
                ADD COLUMN username VARCHAR(50) UNIQUE
                """
            ))
            
            # Update existing users to have username based on their ID
            connection.execute(text(
                """
                UPDATE usuarios 
                SET username = CONCAT('user_', id::text)
                """
            ))
            
            # Make username NOT NULL after we've added values
            connection.execute(text(
                """
                ALTER TABLE usuarios 
                ALTER COLUMN username SET NOT NULL
                """
            ))
            
            # Create index on username
            connection.execute(text(
                """
                CREATE INDEX IF NOT EXISTS ix_usuarios_username ON usuarios (username)
                """
            ))
            
            connection.commit()
            print("Migration completed successfully!")
        else:
            print("Username column already exists in usuarios table.")

if __name__ == "__main__":
    run_migration()
