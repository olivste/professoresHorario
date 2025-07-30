from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from database import models, schemas
import crud_new as crud
from utils import get_db

router = APIRouter(
    prefix="/periodos-aula",
    tags=["Períodos de Aula"]
)

@router.post("/", response_model=schemas.PeriodoAula)
def create_periodo_aula(periodo_aula: schemas.PeriodoAulaCreate, db: Session = Depends(get_db)):
    # Verificar se o turno existe
    turno = db.query(models.Turno).filter(models.Turno.id == periodo_aula.turno_id).first()
    if not turno:
        raise HTTPException(status_code=404, detail="Turno não encontrado")
    
    # Verificar se o período está dentro do horário do turno
    if periodo_aula.hora_inicio < turno.hora_inicio or periodo_aula.hora_fim > turno.hora_fim:
        raise HTTPException(
            status_code=400, 
            detail="Horário do período de aula deve estar contido no horário do turno"
        )
    
    # Verificar se já existe um período com o mesmo número para este turno
    db_periodo = db.query(models.PeriodoAula).filter(
        models.PeriodoAula.turno_id == periodo_aula.turno_id,
        models.PeriodoAula.numero_aula == periodo_aula.numero_aula
    ).first()
    
    if db_periodo:
        raise HTTPException(
            status_code=400, 
            detail=f"Já existe um período de aula com o número {periodo_aula.numero_aula} para este turno"
        )
    
    # Criar o novo período de aula
    db_periodo = models.PeriodoAula(
        turno_id=periodo_aula.turno_id,
        numero_aula=periodo_aula.numero_aula,
        hora_inicio=periodo_aula.hora_inicio,
        hora_fim=periodo_aula.hora_fim,
        tipo=periodo_aula.tipo,
        descricao=periodo_aula.descricao,
        ativo=periodo_aula.ativo
    )
    
    db.add(db_periodo)
    db.commit()
    db.refresh(db_periodo)
    
    return db_periodo

@router.get("/", response_model=List[schemas.PeriodoAula])
def read_periodos_aula(
    skip: int = 0, 
    limit: int = 100, 
    turno_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.PeriodoAula)
    
    if turno_id:
        query = query.filter(models.PeriodoAula.turno_id == turno_id)
    
    return query.order_by(models.PeriodoAula.turno_id, models.PeriodoAula.numero_aula).offset(skip).limit(limit).all()

@router.get("/{periodo_id}", response_model=schemas.PeriodoAula)
def read_periodo_aula(periodo_id: int, db: Session = Depends(get_db)):
    db_periodo = db.query(models.PeriodoAula).filter(models.PeriodoAula.id == periodo_id).first()
    if db_periodo is None:
        raise HTTPException(status_code=404, detail="Período de aula não encontrado")
    return db_periodo

@router.put("/{periodo_id}", response_model=schemas.PeriodoAula)
def update_periodo_aula(periodo_id: int, periodo: schemas.PeriodoAulaUpdate, db: Session = Depends(get_db)):
    db_periodo = db.query(models.PeriodoAula).filter(models.PeriodoAula.id == periodo_id).first()
    if db_periodo is None:
        raise HTTPException(status_code=404, detail="Período de aula não encontrado")
    
    # Atualizar apenas os campos fornecidos
    update_data = periodo.dict(exclude_unset=True)
    
    # Se estiver alterando o turno_id ou numero_aula, verificar se já existe
    if (update_data.get("turno_id") or update_data.get("numero_aula")):
        turno_id = update_data.get("turno_id", db_periodo.turno_id)
        numero_aula = update_data.get("numero_aula", db_periodo.numero_aula)
        
        existing = db.query(models.PeriodoAula).filter(
            models.PeriodoAula.turno_id == turno_id,
            models.PeriodoAula.numero_aula == numero_aula,
            models.PeriodoAula.id != periodo_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400, 
                detail=f"Já existe um período de aula com o número {numero_aula} para este turno"
            )
    
    # Atualizar o objeto
    for key, value in update_data.items():
        setattr(db_periodo, key, value)
    
    db.commit()
    db.refresh(db_periodo)
    
    return db_periodo

@router.delete("/{periodo_id}")
def delete_periodo_aula(periodo_id: int, db: Session = Depends(get_db)):
    db_periodo = db.query(models.PeriodoAula).filter(models.PeriodoAula.id == periodo_id).first()
    if db_periodo is None:
        raise HTTPException(status_code=404, detail="Período de aula não encontrado")
    
    db.delete(db_periodo)
    db.commit()
    
    return {"message": "Período de aula removido com sucesso"}
