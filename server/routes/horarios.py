from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from server.database import models, schemas
from server import crud_new as crud
from server.database.database import SessionLocal

router = APIRouter(prefix="/horarios", tags=["Horários"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Horario)
def create_horario(horario: schemas.HorarioCreate, db: Session = Depends(get_db)):
    # Verificar se professor, disciplina e turma existem
    professor = crud.get_professor(db, horario.professor_id)
    disciplina = crud.get_disciplina(db, horario.disciplina_id)
    turma = crud.get_turma(db, horario.turma_id)
    
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    if not disciplina:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    return crud.create_horario(db=db, horario=horario)

@router.get("/", response_model=List[schemas.Horario])
def read_horarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    horarios = crud.get_horarios(db, skip=skip, limit=limit)
    return horarios

@router.put("/{horario_id}", response_model=schemas.Horario)
def update_horario(horario_id: int, horario: schemas.HorarioUpdate, db: Session = Depends(get_db)):
    db_horario = crud.update_horario(db, horario_id=horario_id, horario=horario)
    if db_horario is None:
        raise HTTPException(status_code=404, detail="Horário não encontrado")
    return db_horario

@router.delete("/{horario_id}")
def delete_horario(horario_id: int, db: Session = Depends(get_db)):
    success = crud.delete_horario(db, horario_id=horario_id)
    if not success:
        raise HTTPException(status_code=404, detail="Horário não encontrado")
    return {"message": "Horário deletado com sucesso"}
