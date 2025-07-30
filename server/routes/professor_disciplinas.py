from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from server.database import models, schemas
from server import crud_new as crud
from server.database.database import SessionLocal

router = APIRouter(prefix="/professor-disciplinas", tags=["Professor-Disciplina"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.ProfessorDisciplina)
def create_professor_disciplina(prof_disc: schemas.ProfessorDisciplinaCreate, db: Session = Depends(get_db)):
    # Verificar se professor e disciplina existem
    professor = crud.get_professor(db, prof_disc.professor_id)
    disciplina = crud.get_disciplina(db, prof_disc.disciplina_id)
    
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    if not disciplina:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    
    return crud.create_professor_disciplina(db=db, prof_disc=prof_disc)
