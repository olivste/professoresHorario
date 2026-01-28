from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

router = APIRouter(prefix="/professor-disponibilidades", tags=["Professor-Disponibilidades"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.ProfessorDisponibilidade)
def create_professor_disponibilidade(d: schemas.ProfessorDisponibilidadeCreate, db: Session = Depends(get_db)):
    professor = crud.get_professor(db, d.professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return crud.create_professor_disponibilidade(db, d)

@router.get("/", response_model=List[schemas.ProfessorDisponibilidade])
def list_professor_disponibilidades(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_professor_disponibilidades(db, skip=skip, limit=limit)

@router.get("/por-professor/{professor_id}", response_model=List[schemas.ProfessorDisponibilidade])
def list_disponibilidades_por_professor(professor_id: int, db: Session = Depends(get_db)):
    professor = crud.get_professor(db, professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return crud.get_professor_disponibilidades_por_professor(db, professor_id)

@router.put("/{disp_id}", response_model=schemas.ProfessorDisponibilidade)
def update_professor_disponibilidade(disp_id: int, d: schemas.ProfessorDisponibilidadeUpdate, db: Session = Depends(get_db)):
    atual = crud.update_professor_disponibilidade(db, disp_id, d)
    if not atual:
        raise HTTPException(status_code=404, detail="Disponibilidade não encontrada")
    return atual

@router.delete("/{disp_id}", status_code=204)
def delete_professor_disponibilidade(disp_id: int, db: Session = Depends(get_db)):
    success = crud.delete_professor_disponibilidade(db, disp_id)
    if not success:
        raise HTTPException(status_code=404, detail="Disponibilidade não encontrada")
    return None
