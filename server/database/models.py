from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Enum, Time, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database.database import Base

class UserRole(enum.Enum):
    DIRETOR = "DIRETOR"
    PEDAGOGO = "PEDAGOGO"
    COORDENADOR = "COORDENADOR"
    PROFESSOR = "PROFESSOR"

class TurnoEnum(enum.Enum):
    MATUTINO = "matutino"
    VESPERTINO = "vespertino"
    NOTURNO = "noturno"
    INTEGRAL = "integral"

class DiaSemanaEnum(enum.Enum):
    SEGUNDA = "segunda"
    TERCA = "terca"
    QUARTA = "quarta"
    QUINTA = "quinta"
    SEXTA = "sexta"
    SABADO = "sabado"
    DOMINGO = "domingo"

class StatusReservaEnum(enum.Enum):
    PENDENTE = "pendente"
    APROVADA = "aprovada"
    REJEITADA = "rejeitada"
    CANCELADA = "cancelada"

class TipoPeriodoEnum(enum.Enum):
    AULA = "AULA"
    INTERVALO = "INTERVALO"
    ALMOCO = "ALMOCO"
    RECREIO = "RECREIO"
    OUTRO = "OUTRO"

class Turno(Base):
    __tablename__ = "turnos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(50), nullable=False, unique=True)
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    descricao = Column(Text)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    turmas = relationship("Turma", back_populates="turno")
    horarios = relationship("Horario", back_populates="turno")
    periodos_aula = relationship("PeriodoAula", back_populates="turno", cascade="all, delete-orphan")

class PeriodoAula(Base):
    __tablename__ = "periodos_aula"

    id = Column(Integer, primary_key=True, index=True)
    turno_id = Column(Integer, ForeignKey("turnos.id"), nullable=False)
    turma_id = Column(Integer, ForeignKey("turmas.id"), nullable=True)  # Opcional: permite períodos específicos por turma
    numero_aula = Column(Integer, nullable=False)  # 1ª aula, 2ª aula, etc.
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    tipo = Column(Enum(TipoPeriodoEnum), nullable=False, default=TipoPeriodoEnum.AULA)  # Tipo de período: aula ou intervalo
    descricao = Column(Text)  # Ex: "Intervalo", "Almoço", etc.
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    turno = relationship("Turno", back_populates="periodos_aula")
    turma = relationship("Turma", back_populates="periodos_aula")

    # Garantir que a combinação de turno_id, turma_id (quando não nulo) e numero_aula seja única
    __table_args__ = (
        UniqueConstraint('turno_id', 'turma_id', 'numero_aula', name='uq_periodo_aula_turno_turma_numero'),
    )

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    telefone = Column(String(20))
    role = Column(Enum(UserRole), nullable=False, default=UserRole.PROFESSOR)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    professor = relationship("Professor", back_populates="usuario", uselist=False)
    reservas = relationship("ReservaEspaco", back_populates="solicitante", foreign_keys="ReservaEspaco.solicitante_id")

class Professor(Base):
    __tablename__ = "professores"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    departamento = Column(String(100))
    especializacao = Column(String(200))
    carga_horaria_semanal = Column(Integer, default=40)
    observacoes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    usuario = relationship("Usuario", back_populates="professor")
    horarios = relationship("Horario", back_populates="professor", cascade="all, delete-orphan")
    professor_disciplinas = relationship("ProfessorDisciplina", back_populates="professor")

class Turma(Base):
    __tablename__ = "turmas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(50), nullable=False)  # Ex: 1°M01, 2°V01
    ano = Column(String(10), nullable=False)   # 1°, 2°, 3°
    turno_id = Column(Integer, ForeignKey("turnos.id"), nullable=False)
    curso = Column(String(100))  # Ex: Ensino Médio, Técnico em Informática
    ativa = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    turno = relationship("Turno", back_populates="turmas")
    horarios = relationship("Horario", back_populates="turma")
    periodos_aula = relationship("PeriodoAula", back_populates="turma")

class Disciplina(Base):
    __tablename__ = "disciplinas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    codigo = Column(String(20), unique=True)
    carga_horaria_semanal = Column(Integer, default=1)
    descricao = Column(Text)
    ativa = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    professor_disciplinas = relationship("ProfessorDisciplina", back_populates="disciplina")
    horarios = relationship("Horario", back_populates="disciplina")

class ProfessorDisciplina(Base):
    __tablename__ = "professor_disciplinas"

    id = Column(Integer, primary_key=True, index=True)
    professor_id = Column(Integer, ForeignKey("professores.id"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"), nullable=False)
    carga_horaria = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    professor = relationship("Professor", back_populates="professor_disciplinas")
    disciplina = relationship("Disciplina", back_populates="professor_disciplinas")

class Horario(Base):
    __tablename__ = "horarios"

    id = Column(Integer, primary_key=True, index=True)
    professor_id = Column(Integer, ForeignKey("professores.id"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"), nullable=False)
    turma_id = Column(Integer, ForeignKey("turmas.id"), nullable=False)
    turno_id = Column(Integer, ForeignKey("turnos.id"), nullable=False)
    dia_semana = Column(Enum(DiaSemanaEnum), nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    sala = Column(String(50))
    observacoes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    professor = relationship("Professor", back_populates="horarios")
    disciplina = relationship("Disciplina", back_populates="horarios")
    turma = relationship("Turma", back_populates="horarios")
    turno = relationship("Turno", back_populates="horarios")

class EspacoEscola(Base):
    __tablename__ = "espacos_escola"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)  # Biblioteca, Lab. Química, etc.
    codigo = Column(String(20), unique=True)
    capacidade = Column(Integer)
    descricao = Column(Text)
    ativo = Column(Boolean, default=True)
    requer_aprovacao = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    reservas = relationship("ReservaEspaco", back_populates="espaco")

class ReservaEspaco(Base):
    __tablename__ = "reservas_espaco"

    id = Column(Integer, primary_key=True, index=True)
    espaco_id = Column(Integer, ForeignKey("espacos_escola.id"), nullable=False)
    solicitante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    data_reserva = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    finalidade = Column(String(200), nullable=False)
    observacoes = Column(Text)
    status = Column(Enum(StatusReservaEnum), default=StatusReservaEnum.PENDENTE)
    aprovado_por = Column(Integer, ForeignKey("usuarios.id"))
    data_aprovacao = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    espaco = relationship("EspacoEscola", back_populates="reservas")
    solicitante = relationship("Usuario", back_populates="reservas", foreign_keys=[solicitante_id])
    aprovador = relationship("Usuario", foreign_keys=[aprovado_por])
