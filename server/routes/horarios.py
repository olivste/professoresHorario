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
    
    # Verificar se o horário está em um período de intervalo/recreio/almoço
    # Buscar períodos que não são do tipo AULA no mesmo turno
    periodos_nao_aula = db.query(models.PeriodoAula).filter(
        models.PeriodoAula.turno_id == horario.turno_id,
        models.PeriodoAula.tipo != models.TipoPeriodoEnum.AULA
    ).all()
    
    # Para cada período não-aula, verificar se o horário solicitado coincide
    for periodo in periodos_nao_aula:
        if (horario.hora_inicio <= periodo.hora_fim and horario.hora_fim >= periodo.hora_inicio):
            raise HTTPException(
                status_code=400, 
                detail=f"Não é possível cadastrar aula durante um período de {periodo.tipo.value} ({periodo.descricao})"
            )
    
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
