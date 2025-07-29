from sqlalchemy.orm import Session
from . import models, schemas
from typing import Optional

# Professor CRUD operations
def get_professor(db: Session, professor_id: int):
    return db.query(models.Professor).filter(models.Professor.id == professor_id).first()

def get_professor_by_email(db: Session, email: str):
    return db.query(models.Professor).filter(models.Professor.email == email).first()

def get_professores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Professor).offset(skip).limit(limit).all()

def create_professor(db: Session, professor: schemas.ProfessorCreate):
    db_professor = models.Professor(**professor.model_dump())
    db.add(db_professor)
    db.commit()
    db.refresh(db_professor)
    return db_professor

def update_professor(db: Session, professor_id: int, professor: schemas.ProfessorUpdate):
    db_professor = db.query(models.Professor).filter(models.Professor.id == professor_id).first()
    if db_professor:
        update_data = professor.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_professor, field, value)
        db.commit()
        db.refresh(db_professor)
    return db_professor

def delete_professor(db: Session, professor_id: int):
    db_professor = db.query(models.Professor).filter(models.Professor.id == professor_id).first()
    if db_professor:
        db.delete(db_professor)
        db.commit()
        return True
    return False

# Horário CRUD operations
def get_horario(db: Session, horario_id: int):
    return db.query(models.Horario).filter(models.Horario.id == horario_id).first()

def get_horarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Horario).offset(skip).limit(limit).all()

def get_horarios_by_professor(db: Session, professor_id: int):
    return db.query(models.Horario).filter(models.Horario.professor_id == professor_id).all()

def create_horario(db: Session, horario: schemas.HorarioCreate, professor_id: int):
    db_horario = models.Horario(**horario.model_dump(), professor_id=professor_id)
    db.add(db_horario)
    db.commit()
    db.refresh(db_horario)
    return db_horario

def update_horario(db: Session, horario_id: int, horario: schemas.HorarioUpdate):
    db_horario = db.query(models.Horario).filter(models.Horario.id == horario_id).first()
    if db_horario:
        update_data = horario.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_horario, field, value)
        db.commit()
        db.refresh(db_horario)
    return db_horario

def delete_horario(db: Session, horario_id: int):
    db_horario = db.query(models.Horario).filter(models.Horario.id == horario_id).first()
    if db_horario:
        db.delete(db_horario)
        db.commit()
        return True
    return False
