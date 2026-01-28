from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

router = APIRouter(prefix="/espacos", tags=["Espaços Escolares"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.EspacoEscola)
def create_espaco(espaco: schemas.EspacoEscolaCreate, db: Session = Depends(get_db)):
    return crud.create_espaco(db=db, espaco=espaco)

@router.get("/", response_model=List[schemas.EspacoEscola])
def read_espacos(skip: int = 0, limit: int = 100, ativos_apenas: bool = True, db: Session = Depends(get_db)):
    espacos = crud.get_espacos(db, skip=skip, limit=limit, ativos_apenas=ativos_apenas)
    return espacos

@router.get("/{espaco_id}", response_model=schemas.EspacoEscola)
def read_espaco(espaco_id: int, db: Session = Depends(get_db)):
    db_espaco = crud.get_espaco(db, espaco_id=espaco_id)
    if db_espaco is None:
        raise HTTPException(status_code=404, detail="Espaço não encontrado")
    return db_espaco

@router.put("/{espaco_id}", response_model=schemas.EspacoEscola)
def update_espaco(espaco_id: int, espaco: schemas.EspacoEscolaUpdate, db: Session = Depends(get_db)):
    db_espaco = crud.update_espaco(db, espaco_id=espaco_id, espaco=espaco)
    if db_espaco is None:
        raise HTTPException(status_code=404, detail="Espaço não encontrado")
    return db_espaco

@router.delete("/{espaco_id}", status_code=204)
def delete_espaco(espaco_id: int, db: Session = Depends(get_db)):
    success = crud.delete_espaco_escola(db, espaco_id=espaco_id)
    if not success:
        raise HTTPException(status_code=404, detail="Espaço não encontrado")
    return None

@router.get("/{espaco_id}/reservas/{data_reserva}")
def read_reservas_espaco_data(espaco_id: int, data_reserva: str, db: Session = Depends(get_db)):
    from datetime import datetime
    try:
        data = datetime.strptime(data_reserva, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD")
    
    reservas = crud.get_reservas_espaco_data(db, espaco_id=espaco_id, data_reserva=data)
    return reservas
