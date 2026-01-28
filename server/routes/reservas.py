from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

router = APIRouter(prefix="/reservas", tags=["Reservas de Espaço"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.ReservaEspaco)
def create_reserva(reserva: schemas.ReservaEspacoCreate, solicitante_id: int, db: Session = Depends(get_db)):
    # Verificar se espaço existe
    espaco = crud.get_espaco(db, reserva.espaco_id)
    if not espaco:
        raise HTTPException(status_code=404, detail="Espaço não encontrado")
    
    # Verificar conflito de horário
    conflito = crud.verificar_conflito_reserva(
        db, reserva.espaco_id, reserva.data_reserva, 
        reserva.hora_inicio, reserva.hora_fim
    )
    
    if conflito:
        raise HTTPException(status_code=400, detail="Já existe uma reserva neste horário")
    
    return crud.create_reserva(db=db, reserva=reserva, solicitante_id=solicitante_id)

@router.get("/", response_model=List[schemas.ReservaEspaco])
def read_reservas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reservas = crud.get_reservas(db, skip=skip, limit=limit)
    return reservas

@router.get("/usuarios/{usuario_id}/", response_model=List[schemas.ReservaEspaco])
def read_reservas_usuario(usuario_id: int, db: Session = Depends(get_db)):
    reservas = crud.get_reservas_usuario(db, usuario_id=usuario_id)
    return reservas

@router.put("/{reserva_id}/status")
def update_reserva_status(
    reserva_id: int, 
    status: schemas.StatusReservaEnum, 
    aprovador_id: int, 
    db: Session = Depends(get_db)
):
    db_reserva = crud.update_reserva_status(db, reserva_id=reserva_id, status=status, aprovador_id=aprovador_id)
    if db_reserva is None:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    return {"message": f"Reserva {status.value} com sucesso"}

@router.delete("/{reserva_id}", status_code=204)
def delete_reserva(reserva_id: int, db: Session = Depends(get_db)):
    success = crud.delete_reserva_espaco(db, reserva_id=reserva_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    return None
