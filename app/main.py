from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

from . import models, schemas, crud_new as crud
from .database import SessionLocal, engine

# Load environment variables
load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Gestão Escolar - Professores e Horários",
    description="Sistema completo para gestão de professores, horários, disciplinas e reservas de espaços escolares",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Sistema de Gestão Escolar - Professores e Horários", "version": "2.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# ================================
# ENDPOINTS DE USUÁRIOS
# ================================

@app.post("/usuarios/", response_model=schemas.Usuario)
def create_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = crud.get_usuario_by_email(db, email=usuario.email)
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_usuario(db=db, usuario=usuario)

@app.get("/usuarios/", response_model=List[schemas.Usuario])
def read_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    usuarios = crud.get_usuarios(db, skip=skip, limit=limit)
    return usuarios

@app.get("/usuarios/{usuario_id}", response_model=schemas.Usuario)
def read_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = crud.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_usuario

@app.put("/usuarios/{usuario_id}", response_model=schemas.Usuario)
def update_usuario(usuario_id: int, usuario: schemas.UsuarioUpdate, db: Session = Depends(get_db)):
    db_usuario = crud.update_usuario(db, usuario_id=usuario_id, usuario=usuario)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_usuario

# ================================
# ENDPOINTS DE PROFESSORES
# ================================

@app.post("/professores/", response_model=schemas.Professor)
def create_professor(professor: schemas.ProfessorCreate, db: Session = Depends(get_db)):
    db_usuario = crud.get_usuario_by_email(db, email=professor.usuario.email)
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_professor(db=db, professor=professor)

@app.get("/professores/", response_model=List[schemas.Professor])
def read_professores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    professores = crud.get_professores(db, skip=skip, limit=limit)
    return professores

@app.get("/professores/{professor_id}", response_model=schemas.Professor)
def read_professor(professor_id: int, db: Session = Depends(get_db)):
    db_professor = crud.get_professor(db, professor_id=professor_id)
    if db_professor is None:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return db_professor

@app.put("/professores/{professor_id}", response_model=schemas.Professor)
def update_professor(professor_id: int, professor: schemas.ProfessorUpdate, db: Session = Depends(get_db)):
    db_professor = crud.update_professor(db, professor_id=professor_id, professor=professor)
    if db_professor is None:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return db_professor

@app.delete("/professores/{professor_id}")
def delete_professor(professor_id: int, db: Session = Depends(get_db)):
    success = crud.delete_professor(db, professor_id=professor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return {"message": "Professor desativado com sucesso"}

# ================================
# ENDPOINTS DE DISCIPLINAS
# ================================

@app.post("/disciplinas/", response_model=schemas.Disciplina)
def create_disciplina(disciplina: schemas.DisciplinaCreate, db: Session = Depends(get_db)):
    return crud.create_disciplina(db=db, disciplina=disciplina)

@app.get("/disciplinas/", response_model=List[schemas.Disciplina])
def read_disciplinas(skip: int = 0, limit: int = 100, ativas_apenas: bool = True, db: Session = Depends(get_db)):
    disciplinas = crud.get_disciplinas(db, skip=skip, limit=limit, ativas_apenas=ativas_apenas)
    return disciplinas

@app.get("/disciplinas/{disciplina_id}", response_model=schemas.Disciplina)
def read_disciplina(disciplina_id: int, db: Session = Depends(get_db)):
    db_disciplina = crud.get_disciplina(db, disciplina_id=disciplina_id)
    if db_disciplina is None:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    return db_disciplina

@app.put("/disciplinas/{disciplina_id}", response_model=schemas.Disciplina)
def update_disciplina(disciplina_id: int, disciplina: schemas.DisciplinaUpdate, db: Session = Depends(get_db)):
    db_disciplina = crud.update_disciplina(db, disciplina_id=disciplina_id, disciplina=disciplina)
    if db_disciplina is None:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    return db_disciplina

# ================================
# ENDPOINTS DE TURMAS
# ================================

@app.post("/turmas/", response_model=schemas.Turma)
def create_turma(turma: schemas.TurmaCreate, db: Session = Depends(get_db)):
    return crud.create_turma(db=db, turma=turma)

@app.get("/turmas/", response_model=List[schemas.Turma])
def read_turmas(skip: int = 0, limit: int = 100, ativas_apenas: bool = True, db: Session = Depends(get_db)):
    turmas = crud.get_turmas(db, skip=skip, limit=limit, ativas_apenas=ativas_apenas)
    return turmas

@app.get("/turmas/{turma_id}", response_model=schemas.Turma)
def read_turma(turma_id: int, db: Session = Depends(get_db)):
    db_turma = crud.get_turma(db, turma_id=turma_id)
    if db_turma is None:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return db_turma

@app.put("/turmas/{turma_id}", response_model=schemas.Turma)
def update_turma(turma_id: int, turma: schemas.TurmaUpdate, db: Session = Depends(get_db)):
    db_turma = crud.update_turma(db, turma_id=turma_id, turma=turma)
    if db_turma is None:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return db_turma

# ================================
# ENDPOINTS DE PROFESSOR-DISCIPLINA
# ================================

@app.post("/professor-disciplinas/", response_model=schemas.ProfessorDisciplina)
def create_professor_disciplina(prof_disc: schemas.ProfessorDisciplinaCreate, db: Session = Depends(get_db)):
    # Verificar se professor e disciplina existem
    professor = crud.get_professor(db, prof_disc.professor_id)
    disciplina = crud.get_disciplina(db, prof_disc.disciplina_id)
    
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    if not disciplina:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    
    return crud.create_professor_disciplina(db=db, prof_disc=prof_disc)

@app.get("/professores/{professor_id}/disciplinas/", response_model=List[schemas.ProfessorDisciplina])
def read_disciplinas_professor(professor_id: int, db: Session = Depends(get_db)):
    disciplinas = crud.get_disciplinas_professor(db, professor_id=professor_id)
    return disciplinas

@app.get("/disciplinas/{disciplina_id}/professores/", response_model=List[schemas.ProfessorDisciplina])
def read_professores_disciplina(disciplina_id: int, db: Session = Depends(get_db)):
    professores = crud.get_professores_disciplina(db, disciplina_id=disciplina_id)
    return professores

# ================================
# ENDPOINTS DE HORÁRIOS
# ================================

@app.post("/horarios/", response_model=schemas.Horario)
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
    
    return crud.create_horario(db=db, horario=horario)

@app.get("/horarios/", response_model=List[schemas.Horario])
def read_horarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    horarios = crud.get_horarios(db, skip=skip, limit=limit)
    return horarios

@app.get("/professores/{professor_id}/horarios/", response_model=List[schemas.Horario])
def read_horarios_professor(professor_id: int, db: Session = Depends(get_db)):
    horarios = crud.get_horarios_professor(db, professor_id=professor_id)
    return horarios

@app.get("/turmas/{turma_id}/horarios/", response_model=List[schemas.Horario])
def read_horarios_turma(turma_id: int, db: Session = Depends(get_db)):
    horarios = crud.get_horarios_turma(db, turma_id=turma_id)
    return horarios

@app.put("/horarios/{horario_id}", response_model=schemas.Horario)
def update_horario(horario_id: int, horario: schemas.HorarioUpdate, db: Session = Depends(get_db)):
    db_horario = crud.update_horario(db, horario_id=horario_id, horario=horario)
    if db_horario is None:
        raise HTTPException(status_code=404, detail="Horário não encontrado")
    return db_horario

@app.delete("/horarios/{horario_id}")
def delete_horario(horario_id: int, db: Session = Depends(get_db)):
    success = crud.delete_horario(db, horario_id=horario_id)
    if not success:
        raise HTTPException(status_code=404, detail="Horário não encontrado")
    return {"message": "Horário deletado com sucesso"}

# ================================
# ENDPOINTS DE ESPAÇOS ESCOLARES
# ================================

@app.post("/espacos/", response_model=schemas.EspacoEscola)
def create_espaco(espaco: schemas.EspacoEscolaCreate, db: Session = Depends(get_db)):
    return crud.create_espaco(db=db, espaco=espaco)

@app.get("/espacos/", response_model=List[schemas.EspacoEscola])
def read_espacos(skip: int = 0, limit: int = 100, ativos_apenas: bool = True, db: Session = Depends(get_db)):
    espacos = crud.get_espacos(db, skip=skip, limit=limit, ativos_apenas=ativos_apenas)
    return espacos

@app.get("/espacos/{espaco_id}", response_model=schemas.EspacoEscola)
def read_espaco(espaco_id: int, db: Session = Depends(get_db)):
    db_espaco = crud.get_espaco(db, espaco_id=espaco_id)
    if db_espaco is None:
        raise HTTPException(status_code=404, detail="Espaço não encontrado")
    return db_espaco

@app.put("/espacos/{espaco_id}", response_model=schemas.EspacoEscola)
def update_espaco(espaco_id: int, espaco: schemas.EspacoEscolaUpdate, db: Session = Depends(get_db)):
    db_espaco = crud.update_espaco(db, espaco_id=espaco_id, espaco=espaco)
    if db_espaco is None:
        raise HTTPException(status_code=404, detail="Espaço não encontrado")
    return db_espaco

# ================================
# ENDPOINTS DE RESERVAS DE ESPAÇO
# ================================

@app.post("/reservas/", response_model=schemas.ReservaEspaco)
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

@app.get("/reservas/", response_model=List[schemas.ReservaEspaco])
def read_reservas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reservas = crud.get_reservas(db, skip=skip, limit=limit)
    return reservas

@app.get("/usuarios/{usuario_id}/reservas/", response_model=List[schemas.ReservaEspaco])
def read_reservas_usuario(usuario_id: int, db: Session = Depends(get_db)):
    reservas = crud.get_reservas_usuario(db, usuario_id=usuario_id)
    return reservas

@app.get("/espacos/{espaco_id}/reservas/{data_reserva}")
def read_reservas_espaco_data(espaco_id: int, data_reserva: str, db: Session = Depends(get_db)):
    from datetime import datetime
    try:
        data = datetime.strptime(data_reserva, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD")
    
    reservas = crud.get_reservas_espaco_data(db, espaco_id=espaco_id, data_reserva=data)
    return reservas

@app.put("/reservas/{reserva_id}/status")
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
