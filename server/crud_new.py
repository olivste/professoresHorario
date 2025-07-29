from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from server.database import models, schemas
from typing import Optional, List
from datetime import date, time
from passlib.context import CryptContext

# Configuração de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Turno CRUD operations
def get_turno(db: Session, turno_id: int):
    return db.query(models.Turno).filter(models.Turno.id == turno_id).first()

def get_turnos(db: Session, skip: int = 0, limit: int = 100, ativos_apenas: bool = True):
    query = db.query(models.Turno)
    if ativos_apenas:
        query = query.filter(models.Turno.ativo == True)
    return query.offset(skip).limit(limit).all()

def create_turno(db: Session, turno: schemas.TurnoCreate):
    db_turno = models.Turno(**turno.model_dump())
    db.add(db_turno)
    db.commit()
    db.refresh(db_turno)
    return db_turno

def update_turno(db: Session, turno_id: int, turno: schemas.TurnoUpdate):
    db_turno = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    if db_turno:
        update_data = turno.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_turno, field, value)
        db.commit()
        db.refresh(db_turno)
    return db_turno

def delete_turno(db: Session, turno_id: int):
    """Desativa um turno (soft delete)"""
    db_turno = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    if db_turno:
        db_turno.ativo = False
        db.commit()
        return True
    return False

# Usuario CRUD operations
def get_usuario(db: Session, usuario_id: int):
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Usuario).offset(skip).limit(limit).all()

def create_usuario(db: Session, usuario: schemas.UsuarioCreate):
    hashed_password = hash_password(usuario.senha)
    usuario_data = usuario.model_dump(exclude={'senha'})
    db_usuario = models.Usuario(**usuario_data, senha_hash=hashed_password)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def update_usuario(db: Session, usuario_id: int, usuario: schemas.UsuarioUpdate):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if db_usuario:
        update_data = usuario.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_usuario, field, value)
        db.commit()
        db.refresh(db_usuario)
    return db_usuario

# Professor CRUD operations
def get_professor(db: Session, professor_id: int):
    return db.query(models.Professor).filter(models.Professor.id == professor_id).first()

def get_professor_by_usuario_id(db: Session, usuario_id: int):
    return db.query(models.Professor).filter(models.Professor.usuario_id == usuario_id).first()

def get_professores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Professor).offset(skip).limit(limit).all()

def create_professor(db: Session, professor: schemas.ProfessorCreate):
    # Criar usuário primeiro
    db_usuario = create_usuario(db, professor.usuario)
    
    # Criar professor
    professor_data = professor.model_dump(exclude={'usuario'})
    db_professor = models.Professor(**professor_data, usuario_id=db_usuario.id)
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
        # Desativar usuário em vez de deletar
        db_professor.usuario.ativo = False
        db.commit()
        return True
    return False

# Disciplina CRUD operations
def get_disciplina(db: Session, disciplina_id: int):
    return db.query(models.Disciplina).filter(models.Disciplina.id == disciplina_id).first()

def get_disciplinas(db: Session, skip: int = 0, limit: int = 100, ativas_apenas: bool = True):
    query = db.query(models.Disciplina)
    if ativas_apenas:
        query = query.filter(models.Disciplina.ativa == True)
    return query.offset(skip).limit(limit).all()

def create_disciplina(db: Session, disciplina: schemas.DisciplinaCreate):
    db_disciplina = models.Disciplina(**disciplina.model_dump())
    db.add(db_disciplina)
    db.commit()
    db.refresh(db_disciplina)
    return db_disciplina

def update_disciplina(db: Session, disciplina_id: int, disciplina: schemas.DisciplinaUpdate):
    db_disciplina = db.query(models.Disciplina).filter(models.Disciplina.id == disciplina_id).first()
    if db_disciplina:
        update_data = disciplina.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_disciplina, field, value)
        db.commit()
        db.refresh(db_disciplina)
    return db_disciplina

# Turma CRUD operations
def get_turma(db: Session, turma_id: int):
    return db.query(models.Turma).filter(models.Turma.id == turma_id).first()

def get_turmas(db: Session, skip: int = 0, limit: int = 100, ativas_apenas: bool = True):
    query = db.query(models.Turma)
    if ativas_apenas:
        query = query.filter(models.Turma.ativa == True)
    return query.offset(skip).limit(limit).all()

def create_turma(db: Session, turma: schemas.TurmaCreate):
    db_turma = models.Turma(**turma.model_dump())
    db.add(db_turma)
    db.commit()
    db.refresh(db_turma)
    return db_turma

def update_turma(db: Session, turma_id: int, turma: schemas.TurmaUpdate):
    db_turma = db.query(models.Turma).filter(models.Turma.id == turma_id).first()
    if db_turma:
        update_data = turma.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_turma, field, value)
        db.commit()
        db.refresh(db_turma)
    return db_turma

# ProfessorDisciplina CRUD operations
def create_professor_disciplina(db: Session, prof_disc: schemas.ProfessorDisciplinaCreate):
    db_prof_disc = models.ProfessorDisciplina(**prof_disc.model_dump())
    db.add(db_prof_disc)
    db.commit()
    db.refresh(db_prof_disc)
    return db_prof_disc

def get_disciplinas_professor(db: Session, professor_id: int):
    return db.query(models.ProfessorDisciplina).filter(
        models.ProfessorDisciplina.professor_id == professor_id
    ).all()

def get_professores_disciplina(db: Session, disciplina_id: int):
    return db.query(models.ProfessorDisciplina).filter(
        models.ProfessorDisciplina.disciplina_id == disciplina_id
    ).all()

# Horário CRUD operations
def get_horario(db: Session, horario_id: int):
    return db.query(models.Horario).filter(models.Horario.id == horario_id).first()

def get_horarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Horario).offset(skip).limit(limit).all()

def get_horarios_professor(db: Session, professor_id: int):
    return db.query(models.Horario).filter(models.Horario.professor_id == professor_id).all()

def get_horarios_turma(db: Session, turma_id: int):
    return db.query(models.Horario).filter(models.Horario.turma_id == turma_id).all()

def create_horario(db: Session, horario: schemas.HorarioCreate):
    db_horario = models.Horario(**horario.model_dump())
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

# EspacoEscola CRUD operations
def get_espaco(db: Session, espaco_id: int):
    return db.query(models.EspacoEscola).filter(models.EspacoEscola.id == espaco_id).first()

def get_espacos(db: Session, skip: int = 0, limit: int = 100, ativos_apenas: bool = True):
    query = db.query(models.EspacoEscola)
    if ativos_apenas:
        query = query.filter(models.EspacoEscola.ativo == True)
    return query.offset(skip).limit(limit).all()

def create_espaco(db: Session, espaco: schemas.EspacoEscolaCreate):
    db_espaco = models.EspacoEscola(**espaco.model_dump())
    db.add(db_espaco)
    db.commit()
    db.refresh(db_espaco)
    return db_espaco

def update_espaco(db: Session, espaco_id: int, espaco: schemas.EspacoEscolaUpdate):
    db_espaco = db.query(models.EspacoEscola).filter(models.EspacoEscola.id == espaco_id).first()
    if db_espaco:
        update_data = espaco.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_espaco, field, value)
        db.commit()
        db.refresh(db_espaco)
    return db_espaco

# ReservaEspaco CRUD operations
def get_reserva(db: Session, reserva_id: int):
    return db.query(models.ReservaEspaco).filter(models.ReservaEspaco.id == reserva_id).first()

def get_reservas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ReservaEspaco).offset(skip).limit(limit).all()

def get_reservas_usuario(db: Session, usuario_id: int):
    return db.query(models.ReservaEspaco).filter(
        models.ReservaEspaco.solicitante_id == usuario_id
    ).all()

def get_reservas_espaco_data(db: Session, espaco_id: int, data_reserva: date):
    return db.query(models.ReservaEspaco).filter(
        and_(
            models.ReservaEspaco.espaco_id == espaco_id,
            models.ReservaEspaco.data_reserva == data_reserva,
            models.ReservaEspaco.status != models.StatusReservaEnum.CANCELADA
        )
    ).all()

def create_reserva(db: Session, reserva: schemas.ReservaEspacoCreate, solicitante_id: int):
    reserva_data = reserva.model_dump()
    db_reserva = models.ReservaEspaco(**reserva_data, solicitante_id=solicitante_id)
    db.add(db_reserva)
    db.commit()
    db.refresh(db_reserva)
    return db_reserva

def update_reserva_status(db: Session, reserva_id: int, status: schemas.StatusReservaEnum, aprovador_id: int = None):
    db_reserva = db.query(models.ReservaEspaco).filter(models.ReservaEspaco.id == reserva_id).first()
    if db_reserva:
        db_reserva.status = status
        if aprovador_id:
            db_reserva.aprovado_por = aprovador_id
            db_reserva.data_aprovacao = func.now()
        db.commit()
        db.refresh(db_reserva)
    return db_reserva

def verificar_conflito_reserva(db: Session, espaco_id: int, data_reserva: date, 
                              hora_inicio: time, hora_fim: time, reserva_id: int = None):
    """Verifica se há conflito de horário para uma reserva"""
    query = db.query(models.ReservaEspaco).filter(
        and_(
            models.ReservaEspaco.espaco_id == espaco_id,
            models.ReservaEspaco.data_reserva == data_reserva,
            models.ReservaEspaco.status != models.StatusReservaEnum.CANCELADA,
            or_(
                and_(
                    models.ReservaEspaco.hora_inicio <= hora_inicio,
                    models.ReservaEspaco.hora_fim > hora_inicio
                ),
                and_(
                    models.ReservaEspaco.hora_inicio < hora_fim,
                    models.ReservaEspaco.hora_fim >= hora_fim
                ),
                and_(
                    models.ReservaEspaco.hora_inicio >= hora_inicio,
                    models.ReservaEspaco.hora_fim <= hora_fim
                )
            )
        )
    )
    
    if reserva_id:
        query = query.filter(models.ReservaEspaco.id != reserva_id)
    
    return query.first() is not None

# ================================
# FUNÇÕES DE DELETE ADICIONAIS
# ================================

def delete_usuario(db: Session, usuario_id: int):
    """Desativa um usuário (soft delete)"""
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if db_usuario:
        db_usuario.ativo = False
        db.commit()
        return True
    return False

def delete_disciplina(db: Session, disciplina_id: int):
    """Desativa uma disciplina (soft delete)"""
    db_disciplina = db.query(models.Disciplina).filter(models.Disciplina.id == disciplina_id).first()
    if db_disciplina:
        db_disciplina.ativa = False
        db.commit()
        return True
    return False

def delete_turma(db: Session, turma_id: int):
    """Remove uma turma (hard delete, cuidado com relacionamentos)"""
    db_turma = db.query(models.Turma).filter(models.Turma.id == turma_id).first()
    if db_turma:
        db.delete(db_turma)
        db.commit()
        return True
    return False

def delete_espaco_escola(db: Session, espaco_id: int):
    """Remove um espaço escolar (hard delete)"""
    db_espaco = db.query(models.EspacoEscola).filter(models.EspacoEscola.id == espaco_id).first()
    if db_espaco:
        db.delete(db_espaco)
        db.commit()
        return True
    return False

def delete_reserva_espaco(db: Session, reserva_id: int):
    """Remove uma reserva de espaço"""
    db_reserva = db.query(models.ReservaEspaco).filter(models.ReservaEspaco.id == reserva_id).first()
    if db_reserva:
        db.delete(db_reserva)
        db.commit()
        return True
    return False
