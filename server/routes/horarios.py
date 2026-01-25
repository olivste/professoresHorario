from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

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

    if crud.verificar_conflito_horario(
        db,
        professor_id=horario.professor_id,
        turma_id=horario.turma_id,
        turno_id=horario.turno_id,
        dia_semana=horario.dia_semana,
        hora_inicio=horario.hora_inicio,
        hora_fim=horario.hora_fim,
    ):
        raise HTTPException(status_code=400, detail="Conflito de horário para professor ou turma")
    
    return crud.create_horario(db=db, horario=horario)

@router.get("/", response_model=List[schemas.Horario])
def read_horarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    horarios = crud.get_horarios(db, skip=skip, limit=limit)
    return horarios

@router.put("/{horario_id}", response_model=schemas.Horario)
def update_horario(horario_id: int, horario: schemas.HorarioUpdate, db: Session = Depends(get_db)):
    atual = crud.get_horario(db, horario_id)
    if atual is None:
        raise HTTPException(status_code=404, detail="Horário não encontrado")

    professor_id = horario.professor_id if horario.professor_id is not None else atual.professor_id
    turma_id = horario.turma_id if horario.turma_id is not None else atual.turma_id
    turno_id = horario.turno_id if horario.turno_id is not None else atual.turno_id
    dia_semana = horario.dia_semana if horario.dia_semana is not None else atual.dia_semana
    hora_inicio = horario.hora_inicio if horario.hora_inicio is not None else atual.hora_inicio
    hora_fim = horario.hora_fim if horario.hora_fim is not None else atual.hora_fim

    if crud.verificar_conflito_horario(
        db,
        professor_id=professor_id,
        turma_id=turma_id,
        turno_id=turno_id,
        dia_semana=dia_semana,
        hora_inicio=hora_inicio,
        hora_fim=hora_fim,
        horario_id=horario_id,
    ):
        raise HTTPException(status_code=400, detail="Conflito de horário para professor ou turma")

    return crud.update_horario(db, horario_id=horario_id, horario=horario)

@router.delete("/{horario_id}")
def delete_horario(horario_id: int, db: Session = Depends(get_db)):
    success = crud.delete_horario(db, horario_id=horario_id)
    if not success:
        raise HTTPException(status_code=404, detail="Horário não encontrado")
    return {"message": "Horário deletado com sucesso"}
