from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from server.database import models, schemas
from server import crud_new as crud
from server.database.database import SessionLocal

router = APIRouter(prefix="/disciplinas", tags=["Disciplinas"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Disciplina)
def create_disciplina(disciplina: schemas.DisciplinaCreate, db: Session = Depends(get_db)):
    return crud.create_disciplina(db=db, disciplina=disciplina)

@router.get("/", response_model=List[schemas.Disciplina])
def read_disciplinas(skip: int = 0, limit: int = 100, ativas_apenas: bool = True, db: Session = Depends(get_db)):
    disciplinas = crud.get_disciplinas(db, skip=skip, limit=limit, ativas_apenas=ativas_apenas)
    return disciplinas

@router.get("/{disciplina_id}", response_model=schemas.Disciplina)
def read_disciplina(disciplina_id: int, db: Session = Depends(get_db)):
    db_disciplina = crud.get_disciplina(db, disciplina_id=disciplina_id)
    if db_disciplina is None:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    return db_disciplina

@router.put("/{disciplina_id}", response_model=schemas.Disciplina)
def update_disciplina(disciplina_id: int, disciplina: schemas.DisciplinaUpdate, db: Session = Depends(get_db)):
    db_disciplina = crud.update_disciplina(db, disciplina_id=disciplina_id, disciplina=disciplina)
    if db_disciplina is None:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    return db_disciplina

@router.delete("/{disciplina_id}")
def delete_disciplina(disciplina_id: int, db: Session = Depends(get_db)):
    success = crud.delete_disciplina(db, disciplina_id=disciplina_id)
    if not success:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    return {"message": "Disciplina desativada com sucesso"}

@router.get("/{disciplina_id}/professores/", response_model=List[schemas.ProfessorDisciplina])
def read_professores_disciplina(disciplina_id: int, db: Session = Depends(get_db)):
    professores = crud.get_professores_disciplina(db, disciplina_id=disciplina_id)
    return professores
