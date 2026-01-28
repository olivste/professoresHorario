from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

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


@router.get("/", response_model=List[schemas.ProfessorDisciplina])
def list_professor_disciplinas(db: Session = Depends(get_db)):
    return db.query(models.ProfessorDisciplina).all()


@router.get("/por-professor/{professor_id}", response_model=List[schemas.ProfessorDisciplina])
def list_disciplinas_por_professor(professor_id: int, db: Session = Depends(get_db)):
    professor = crud.get_professor(db, professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return crud.get_disciplinas_professor(db, professor_id)


@router.get("/por-disciplina/{disciplina_id}", response_model=List[schemas.ProfessorDisciplina])
def list_professores_por_disciplina(disciplina_id: int, db: Session = Depends(get_db)):
    disciplina = crud.get_disciplina(db, disciplina_id)
    if not disciplina:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    return crud.get_professores_disciplina(db, disciplina_id)
