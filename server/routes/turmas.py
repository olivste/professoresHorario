from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

router = APIRouter(prefix="/turmas", tags=["Turmas"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Turma)
def create_turma(turma: schemas.TurmaCreate, db: Session = Depends(get_db)):
    return crud.create_turma(db=db, turma=turma)

@router.get("/", response_model=List[schemas.Turma])
def read_turmas(skip: int = 0, limit: int = 100, ativas_apenas: bool = True, db: Session = Depends(get_db)):
    turmas = crud.get_turmas(db, skip=skip, limit=limit, ativas_apenas=ativas_apenas)
    return turmas

@router.get("/{turma_id}", response_model=schemas.Turma)
def read_turma(turma_id: int, db: Session = Depends(get_db)):
    db_turma = crud.get_turma(db, turma_id=turma_id)
    if db_turma is None:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return db_turma

@router.put("/{turma_id}", response_model=schemas.Turma)
def update_turma(turma_id: int, turma: schemas.TurmaUpdate, db: Session = Depends(get_db)):
    db_turma = crud.update_turma(db, turma_id=turma_id, turma=turma)
    if db_turma is None:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return db_turma

@router.delete("/{turma_id}")
def delete_turma(turma_id: int, db: Session = Depends(get_db)):
    success = crud.delete_turma(db, turma_id=turma_id)
    if not success:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return {"message": "Turma desativada com sucesso"}

@router.get("/{turma_id}/horarios/", response_model=List[schemas.Horario])
def read_horarios_turma(turma_id: int, db: Session = Depends(get_db)):
    horarios = crud.get_horarios_turma(db, turma_id=turma_id)
    return horarios
