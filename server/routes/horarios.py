from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
import crud_new as crud
from database.database import SessionLocal
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

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

    # Validar vínculos: professor-disciplina e turma-disciplina
    prof_disc = db.query(models.ProfessorDisciplina).filter(
        models.ProfessorDisciplina.professor_id == horario.professor_id,
        models.ProfessorDisciplina.disciplina_id == horario.disciplina_id,
    ).first()
    if not prof_disc:
        raise HTTPException(status_code=400, detail="Professor não vinculado à disciplina")

    turma_disc = db.query(models.TurmaDisciplina).filter(
        models.TurmaDisciplina.turma_id == horario.turma_id,
        models.TurmaDisciplina.disciplina_id == horario.disciplina_id,
    ).first()
    if not turma_disc:
        raise HTTPException(status_code=400, detail="Disciplina não vinculada à turma")

    # Disponibilidade do professor (quando configurada)
    if not crud.verificar_disponibilidade_professor(
        db,
        professor_id=horario.professor_id,
        dia_semana=horario.dia_semana,
        hora_inicio=horario.hora_inicio,
        hora_fim=horario.hora_fim,
    ):
        raise HTTPException(status_code=400, detail="Professor sem disponibilidade nesse horário")

    # Bloqueio de disponibilidade do professor
    if crud.verificar_bloqueio_professor(
        db,
        professor_id=horario.professor_id,
        dia_semana=horario.dia_semana,
        hora_inicio=horario.hora_inicio,
        hora_fim=horario.hora_fim,
    ):
        raise HTTPException(status_code=400, detail="Professor indisponível nesse horário")

    if crud.verificar_conflito_horario(
        db,
        professor_id=horario.professor_id,
        turma_id=horario.turma_id,
        turno_id=horario.turno_id,
        dia_semana=horario.dia_semana,
        hora_inicio=horario.hora_inicio,
        hora_fim=horario.hora_fim,
    ):
        raise HTTPException(status_code=400, detail="Conflito de horário para professor ou turma")
    
    return crud.create_horario(db=db, horario=horario)

@router.get("/", response_model=List[schemas.Horario])
def read_horarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    horarios = crud.get_horarios(db, skip=skip, limit=limit)
    return horarios

@router.put("/{horario_id}", response_model=schemas.Horario)
def update_horario(horario_id: int, horario: schemas.HorarioUpdate, db: Session = Depends(get_db)):
    atual = crud.get_horario(db, horario_id)
    if atual is None:
        raise HTTPException(status_code=404, detail="Horário não encontrado")

    professor_id = horario.professor_id if horario.professor_id is not None else atual.professor_id
    turma_id = horario.turma_id if horario.turma_id is not None else atual.turma_id
    turno_id = horario.turno_id if horario.turno_id is not None else atual.turno_id
    dia_semana = horario.dia_semana if horario.dia_semana is not None else atual.dia_semana
    hora_inicio = horario.hora_inicio if horario.hora_inicio is not None else atual.hora_inicio
    hora_fim = horario.hora_fim if horario.hora_fim is not None else atual.hora_fim

    # Validar vínculos: professor-disciplina e turma-disciplina
    prof_disc = db.query(models.ProfessorDisciplina).filter(
        models.ProfessorDisciplina.professor_id == professor_id,
        models.ProfessorDisciplina.disciplina_id == (horario.disciplina_id if horario.disciplina_id is not None else atual.disciplina_id),
    ).first()
    if not prof_disc:
        raise HTTPException(status_code=400, detail="Professor não vinculado à disciplina")

    turma_disc = db.query(models.TurmaDisciplina).filter(
        models.TurmaDisciplina.turma_id == turma_id,
        models.TurmaDisciplina.disciplina_id == (horario.disciplina_id if horario.disciplina_id is not None else atual.disciplina_id),
    ).first()
    if not turma_disc:
        raise HTTPException(status_code=400, detail="Disciplina não vinculada à turma")

    # Disponibilidade do professor (quando configurada)
    if not crud.verificar_disponibilidade_professor(
        db,
        professor_id=professor_id,
        dia_semana=dia_semana,
        hora_inicio=hora_inicio,
        hora_fim=hora_fim,
    ):
        raise HTTPException(status_code=400, detail="Professor sem disponibilidade nesse horário")

    # Bloqueio de disponibilidade do professor
    if crud.verificar_bloqueio_professor(
        db,
        professor_id=professor_id,
        dia_semana=dia_semana,
        hora_inicio=hora_inicio,
        hora_fim=hora_fim,
    ):
        raise HTTPException(status_code=400, detail="Professor indisponível nesse horário")

    if crud.verificar_conflito_horario(
        db,
        professor_id=professor_id,
        turma_id=turma_id,
        turno_id=turno_id,
        dia_semana=dia_semana,
        hora_inicio=hora_inicio,
        hora_fim=hora_fim,
        horario_id=horario_id,
    ):
        raise HTTPException(status_code=400, detail="Conflito de horário para professor ou turma")

    return crud.update_horario(db, horario_id=horario_id, horario=horario)

@router.delete("/{horario_id}")
def delete_horario(horario_id: int, db: Session = Depends(get_db)):
    success = crud.delete_horario(db, horario_id=horario_id)
    if not success:
        raise HTTPException(status_code=404, detail="Horário não encontrado")
    return {"message": "Horário removido"}

@router.get("/por-professor/{professor_id}")
def horarios_por_professor(professor_id: int, db: Session = Depends(get_db)):
    """Retorna horários agrupados por dia da semana com joins de turma/turno/disciplina."""
    prof = crud.get_professor(db, professor_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Professor não encontrado")

    horarios = db.query(models.Horario).filter(models.Horario.professor_id == professor_id).all()
    grouped: dict[str, list] = {}
    for h in horarios:
        dia = h.dia_semana.value if hasattr(h.dia_semana, "value") else str(h.dia_semana)
        item = {
            "id": h.id,
            "hora_inicio": h.hora_inicio.isoformat(),
            "hora_fim": h.hora_fim.isoformat(),
            "sala": h.sala,
            "observacoes": h.observacoes,
            "disciplina": {
                "id": h.disciplina.id,
                "nome": h.disciplina.nome,
                "codigo": h.disciplina.codigo,
            },
            "turma": {
                "id": h.turma.id,
                "nome": h.turma.nome,
                "ano": h.turma.ano,
            },
            "turno": {
                "id": h.turno.id,
                "nome": h.turno.nome,
            },
        }
        grouped.setdefault(dia, []).append(item)

    return {
        "professor": {
            "id": prof.id,
            "nome": prof.usuario.nome,
        },
        "horarios": grouped,
    }

@router.get("/por-professor/{professor_id}/pdf")
def horarios_por_professor_pdf(professor_id: int, db: Session = Depends(get_db)):
    """Gera um PDF simples com os horários do professor agrupados por dia."""
    prof = crud.get_professor(db, professor_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Professor não encontrado")

    horarios = db.query(models.Horario).filter(models.Horario.professor_id == professor_id).order_by(models.Horario.dia_semana, models.Horario.hora_inicio).all()
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 50
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, f"Horários do Professor: {prof.usuario.nome}")
    y -= 30
    c.setFont("Helvetica", 11)

    current_day = None
    for h in horarios:
        dia = h.dia_semana.value if hasattr(h.dia_semana, "value") else str(h.dia_semana)
        if dia != current_day:
            current_day = dia
            y -= 20
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, dia.capitalize())
            y -= 18
            c.setFont("Helvetica", 11)
        line = f"{h.hora_inicio.strftime('%H:%M')} - {h.hora_fim.strftime('%H:%M')} | {h.disciplina.nome} | Turma {h.turma.nome} | Sala {h.sala or '-'}"
        c.drawString(60, y, line)
        y -= 16
        if y < 80:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 11)

    c.showPage()
    c.save()
    pdf_bytes = buf.getvalue()
    buf.close()
    return Response(content=pdf_bytes, media_type="application/pdf")
