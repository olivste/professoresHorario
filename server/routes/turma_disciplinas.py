from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

router = APIRouter(prefix="/turma-disciplinas", tags=["Turma-Disciplina"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.TurmaDisciplina)
def create_turma_disciplina(link: schemas.TurmaDisciplinaCreate, db: Session = Depends(get_db)):
    turma = crud.get_turma(db, link.turma_id)
    disciplina = crud.get_disciplina(db, link.disciplina_id)
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    if not disciplina:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")

    # Evitar duplicidade pela constraint única; fornecer erro amigável
    existente = db.query(models.TurmaDisciplina).filter(
        models.TurmaDisciplina.turma_id == link.turma_id,
        models.TurmaDisciplina.disciplina_id == link.disciplina_id,
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Disciplina já vinculada à turma")

    return crud.create_turma_disciplina(db, link)

@router.get("/", response_model=List[schemas.TurmaDisciplina])
def list_turma_disciplinas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_turma_disciplinas(db, skip=skip, limit=limit)

@router.get("/por-turma/{turma_id}", response_model=List[schemas.TurmaDisciplina])
def list_turma_disciplinas_por_turma(turma_id: int, db: Session = Depends(get_db)):
    turma = crud.get_turma(db, turma_id)
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return crud.get_turma_disciplinas_por_turma(db, turma_id)

@router.delete("/{link_id}", status_code=204)
def delete_turma_disciplina(link_id: int, db: Session = Depends(get_db)):
    success = crud.delete_turma_disciplina(db, link_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vínculo turma-disciplina não encontrado")
    return None
