from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/professores_db")
engine = create_engine(DATABASE_URL)

def run_migration():
    print("Starting database migration for periodos_aula table...")
    with engine.connect() as connection:
        # Check if turma_id column exists
        check_column = connection.execute(text(
            """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'periodos_aula' AND column_name = 'turma_id'
            """
        ))
        
        if not check_column.fetchone():
            print("Adding turma_id column to periodos_aula table...")
            # Add the turma_id column
            connection.execute(text(
                """
                ALTER TABLE periodos_aula 
                ADD COLUMN turma_id INTEGER
                """
            ))
            
            # Add foreign key constraint
            connection.execute(text(
                """
                ALTER TABLE periodos_aula 
                ADD CONSTRAINT fk_periodos_aula_turma 
                FOREIGN KEY (turma_id) REFERENCES turmas(id)
                """
            ))
            
            connection.commit()
            print("Migration for periodos_aula completed successfully!")
        else:
            print("turma_id column already exists in periodos_aula table.")

if __name__ == "__main__":
    run_migration()
