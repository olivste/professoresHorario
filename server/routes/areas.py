from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

router = APIRouter(prefix="/areas", tags=["Areas"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Area)
def create_area(area: schemas.AreaCreate, db: Session = Depends(get_db)):
    return crud.create_area(db=db, area=area)

@router.get("/", response_model=List[schemas.Area])
def read_areas(skip: int = 0, limit: int = 100, ativas_apenas: bool = True, db: Session = Depends(get_db)):
    areas = crud.get_areas(db, skip=skip, limit=limit, ativas_apenas=ativas_apenas)
    return areas

@router.get("/{area_id}", response_model=schemas.Area)
def read_area(area_id: int, db: Session = Depends(get_db)):
    db_area = crud.get_area(db, area_id=area_id)
    if db_area is None:
        raise HTTPException(status_code=404, detail="Área não encontrada")
    return db_area

@router.put("/{area_id}", response_model=schemas.Area)
def update_area(area_id: int, area: schemas.AreaUpdate, db: Session = Depends(get_db)):
    db_area = crud.update_area(db, area_id=area_id, area=area)
    if db_area is None:
        raise HTTPException(status_code=404, detail="Área não encontrada")
    return db_area

@router.delete("/{area_id}", status_code=204)
def delete_area(area_id: int, db: Session = Depends(get_db)):
    success = crud.delete_area(db, area_id=area_id)
    if not success:
        raise HTTPException(status_code=404, detail="Área não encontrada")
    return None

# Rotas para planejamentos de uma área
@router.post("/{area_id}/planejamentos", response_model=schemas.AreaPlanejamento)
def create_area_planejamento(area_id: int, planejamento: schemas.AreaPlanejamentoCreate, db: Session = Depends(get_db)):
    return crud.create_area_planejamento(db=db, area_id=area_id, planejamento=planejamento)

@router.get("/{area_id}/planejamentos", response_model=List[schemas.AreaPlanejamento])
def read_area_planejamentos(area_id: int, db: Session = Depends(get_db)):
    planejamentos = crud.get_area_planejamentos(db, area_id=area_id)
    return planejamentos

@router.put("/{area_id}/planejamentos/{planejamento_id}", response_model=schemas.AreaPlanejamento)
def update_area_planejamento(area_id: int, planejamento_id: int, planejamento: schemas.AreaPlanejamentoUpdate, db: Session = Depends(get_db)):
    db_planejamento = crud.update_area_planejamento(db, planejamento_id=planejamento_id, planejamento=planejamento)
    if db_planejamento is None:
        raise HTTPException(status_code=404, detail="Planejamento não encontrado")
    return db_planejamento

@router.delete("/{area_id}/planejamentos/{planejamento_id}", status_code=204)
def delete_area_planejamento(area_id: int, planejamento_id: int, db: Session = Depends(get_db)):
    success = crud.delete_area_planejamento(db, planejamento_id=planejamento_id)
    if not success:
        raise HTTPException(status_code=404, detail="Planejamento não encontrado")
    return None

# Rota para obter professores de uma área
@router.get("/{area_id}/professores", response_model=List[schemas.ProfessorSemHorarios])
def read_professores_area(area_id: int, db: Session = Depends(get_db)):
    professores = crud.get_professores_by_area(db, area_id=area_id)
    return professores
