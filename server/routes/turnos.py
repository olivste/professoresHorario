from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from server.database import schemas
from server import crud_new as crud
from server.utils import get_db

router = APIRouter(
    prefix="/turnos",
    tags=["turnos"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Turno, status_code=status.HTTP_201_CREATED)
def create_turno(
    turno: schemas.TurnoCreate,
    db: Session = Depends(get_db)
):
    """Criar um novo turno"""
    return crud.create_turno(db=db, turno=turno)

@router.get("/", response_model=List[schemas.Turno])
def read_turnos(
    skip: int = 0,
    limit: int = 100,
    ativos_apenas: bool = True,
    db: Session = Depends(get_db)
):
    """Listar todos os turnos"""
    turnos = crud.get_turnos(db, skip=skip, limit=limit, ativos_apenas=ativos_apenas)
    return turnos

@router.get("/{turno_id}", response_model=schemas.Turno)
def read_turno(turno_id: int, db: Session = Depends(get_db)):
    """Obter um turno específico por ID"""
    db_turno = crud.get_turno(db, turno_id=turno_id)
    if db_turno is None:
        raise HTTPException(status_code=404, detail="Turno não encontrado")
    return db_turno

@router.put("/{turno_id}", response_model=schemas.Turno)
def update_turno(
    turno_id: int,
    turno: schemas.TurnoUpdate,
    db: Session = Depends(get_db)
):
    """Atualizar um turno"""
    db_turno = crud.update_turno(db, turno_id=turno_id, turno=turno)
    if db_turno is None:
        raise HTTPException(status_code=404, detail="Turno não encontrado")
    return db_turno

@router.delete("/{turno_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_turno(turno_id: int, db: Session = Depends(get_db)):
    """Desativar um turno (soft delete)"""
    success = crud.delete_turno(db, turno_id=turno_id)
    if not success:
        raise HTTPException(status_code=404, detail="Turno não encontrado")
