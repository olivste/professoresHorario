from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal

router = APIRouter(prefix="/professores", tags=["Professores"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Professor)
def create_professor(professor: schemas.ProfessorCreate, db: Session = Depends(get_db)):
    db_usuario = crud.get_usuario_by_email(db, email=professor.usuario.email)
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_professor(db=db, professor=professor)

@router.post("/attach-usuario/{usuario_id}", response_model=schemas.Professor)
def attach_professor(usuario_id: int, professor: schemas.ProfessorBase, db: Session = Depends(get_db)):
    db_usuario = crud.get_usuario(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    # Se já existir professor para esse usuário, retorna-o
    existente = crud.get_professor_by_usuario_id(db, usuario_id)
    if existente:
        return existente
    db_professor = crud.create_professor_from_usuario(db, usuario_id, professor)
    if not db_professor:
        raise HTTPException(status_code=400, detail="Falha ao vincular usuário como professor")
    return db_professor

@router.get("/", response_model=List[schemas.Professor])
def read_professores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    professores = crud.get_professores(db, skip=skip, limit=limit)
    return professores

@router.get("/{professor_id}", response_model=schemas.Professor)
def read_professor(professor_id: int, db: Session = Depends(get_db)):
    db_professor = crud.get_professor(db, professor_id=professor_id)
    if db_professor is None:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return db_professor

@router.put("/{professor_id}", response_model=schemas.Professor)
def update_professor(professor_id: int, professor: schemas.ProfessorUpdate, db: Session = Depends(get_db)):
    db_professor = crud.update_professor(db, professor_id=professor_id, professor=professor)
    if db_professor is None:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return db_professor

@router.delete("/{professor_id}", status_code=204)
def delete_professor(professor_id: int, db: Session = Depends(get_db)):
    success = crud.delete_professor(db, professor_id=professor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return None

@router.get("/{professor_id}/disciplinas/", response_model=List[schemas.ProfessorDisciplina])
def read_disciplinas_professor(professor_id: int, db: Session = Depends(get_db)):
    disciplinas = crud.get_disciplinas_professor(db, professor_id=professor_id)
    return disciplinas

@router.get("/{professor_id}/horarios/", response_model=List[schemas.Horario])
def read_horarios_professor(professor_id: int, db: Session = Depends(get_db)):
    horarios = crud.get_horarios_professor(db, professor_id=professor_id)
    return horarios
