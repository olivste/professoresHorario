from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

router = APIRouter(prefix="/professor-bloqueios", tags=["Professor-Bloqueios"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.ProfessorBloqueio)
def create_professor_bloqueio(b: schemas.ProfessorBloqueioCreate, db: Session = Depends(get_db)):
    professor = crud.get_professor(db, b.professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return crud.create_professor_bloqueio(db, b)

@router.get("/", response_model=List[schemas.ProfessorBloqueio])
def list_professor_bloqueios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_professor_bloqueios(db, skip=skip, limit=limit)

@router.get("/por-professor/{professor_id}", response_model=List[schemas.ProfessorBloqueio])
def list_bloqueios_por_professor(professor_id: int, db: Session = Depends(get_db)):
    professor = crud.get_professor(db, professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return crud.get_professor_bloqueios_por_professor(db, professor_id)

@router.put("/{bloqueio_id}", response_model=schemas.ProfessorBloqueio)
def update_professor_bloqueio(bloqueio_id: int, b: schemas.ProfessorBloqueioUpdate, db: Session = Depends(get_db)):
    atual = crud.update_professor_bloqueio(db, bloqueio_id, b)
    if not atual:
        raise HTTPException(status_code=404, detail="Bloqueio não encontrado")
    return atual

@router.delete("/{bloqueio_id}", status_code=204)
def delete_professor_bloqueio(bloqueio_id: int, db: Session = Depends(get_db)):
    success = crud.delete_professor_bloqueio(db, bloqueio_id)
    if not success:
        raise HTTPException(status_code=404, detail="Bloqueio não encontrado")
    return None
