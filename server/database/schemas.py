from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date, time
from enum import Enum

# Enums
class UserRole(str, Enum):
    DIRETOR = "DIRETOR"
    PEDAGOGO = "PEDAGOGO"
    COORDENADOR = "COORDENADOR"
    PROFESSOR = "PROFESSOR"

class TurnoEnum(str, Enum):
    MATUTINO = "matutino"
    VESPERTINO = "vespertino"
    NOTURNO = "noturno"
    INTEGRAL = "integral"

class DiaSemanaEnum(str, Enum):
    SEGUNDA = "segunda"
    TERCA = "terca"
    QUARTA = "quarta"
    QUINTA = "quinta"
    SEXTA = "sexta"
    SABADO = "sabado"
    DOMINGO = "domingo"

class StatusReservaEnum(str, Enum):
    PENDENTE = "pendente"
    APROVADA = "aprovada"
    REJEITADA = "rejeitada"
    CANCELADA = "cancelada"

class TipoPeriodoEnum(str, Enum):
    AULA = "AULA"
    INTERVALO = "INTERVALO"
    ALMOCO = "ALMOCO"
    RECREIO = "RECREIO"
    OUTRO = "OUTRO"

# Turno schemas
class TurnoBase(BaseModel):
    nome: str
    hora_inicio: time
    hora_fim: time
    descricao: Optional[str] = None
    ativo: bool = True

class TurnoCreate(TurnoBase):
    pass

class TurnoUpdate(BaseModel):
    nome: Optional[str] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    descricao: Optional[str] = None
    ativo: Optional[bool] = None

class Turno(TurnoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    periodos_aula: List["PeriodoAula"] = []

    class Config:
        from_attributes = True

# PeriodoAula schemas
class PeriodoAulaBase(BaseModel):
    turno_id: int
    turma_id: Optional[int] = None  # Opcional: permite períodos específicos por turma
    numero_aula: int
    hora_inicio: time
    hora_fim: time
    tipo: TipoPeriodoEnum = TipoPeriodoEnum.AULA
    descricao: Optional[str] = None
    ativo: bool = True

class PeriodoAulaCreate(PeriodoAulaBase):
    pass

class PeriodoAulaUpdate(BaseModel):
    turno_id: Optional[int] = None
    turma_id: Optional[int] = None
    numero_aula: Optional[int] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    tipo: Optional[TipoPeriodoEnum] = None
    descricao: Optional[str] = None
    ativo: Optional[bool] = None

class TurnoSimples(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True

class TurmaSimples(BaseModel):
    id: int
    nome: str
    ano: str

    class Config:
        from_attributes = True

class PeriodoAula(PeriodoAulaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    turno: Optional[TurnoSimples] = None
    turma: Optional[TurmaSimples] = None

    class Config:
        from_attributes = True

# Usuario schemas
class UsuarioBase(BaseModel):
    nome: str
    username: str
    email: EmailStr
    telefone: Optional[str] = None
    role: UserRole = UserRole.PROFESSOR
    ativo: bool = True

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    role: Optional[UserRole] = None
    ativo: Optional[bool] = None

class Usuario(UsuarioBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Professor schemas
class ProfessorBase(BaseModel):
    departamento: Optional[str] = None
    especializacao: Optional[str] = None
    carga_horaria_semanal: int = 40
    observacoes: Optional[str] = None

class ProfessorCreate(ProfessorBase):
    usuario: UsuarioCreate

class ProfessorUpdate(ProfessorBase):
    pass

class Professor(ProfessorBase):
    id: int
    usuario_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    usuario: Usuario
    horarios: List["Horario"] = []

    class Config:
        from_attributes = True


# Professor schema without nested horarios to avoid cyclic responses
class ProfessorSemHorarios(ProfessorBase):
    id: int
    usuario_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    usuario: Usuario

    class Config:
        from_attributes = True

# Disciplina schemas
class DisciplinaBase(BaseModel):
    nome: str
    codigo: Optional[str] = None
    carga_horaria_semanal: int = 1
    descricao: Optional[str] = None
    ativa: bool = True

class DisciplinaCreate(DisciplinaBase):
    pass

class DisciplinaUpdate(BaseModel):
    nome: Optional[str] = None
    codigo: Optional[str] = None
    carga_horaria_semanal: Optional[int] = None
    descricao: Optional[str] = None
    ativa: Optional[bool] = None

class Disciplina(DisciplinaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Turma schemas
class TurmaBase(BaseModel):
    nome: str
    ano: str
    turno_id: int
    curso: Optional[str] = None
    ativa: bool = True

class TurmaCreate(TurmaBase):
    pass

class TurmaUpdate(BaseModel):
    nome: Optional[str] = None
    ano: Optional[str] = None
    turno_id: Optional[int] = None
    curso: Optional[str] = None
    ativa: Optional[bool] = None

class Turma(TurmaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    turno: Turno
    periodos_aula: List["PeriodoAula"] = []
    # Disciplinas vinculadas à turma
    turma_disciplinas: List["TurmaDisciplina"] = []

    class Config:
        from_attributes = True

# ProfessorDisciplina schemas
class ProfessorDisciplinaBase(BaseModel):
    professor_id: int
    disciplina_id: int
    carga_horaria: int = 1

class ProfessorDisciplinaCreate(ProfessorDisciplinaBase):
    pass

class ProfessorDisciplina(ProfessorDisciplinaBase):
    id: int
    created_at: datetime
    professor: Professor
    disciplina: Disciplina
# TurmaDisciplina schemas
class TurmaDisciplinaBase(BaseModel):
    turma_id: int
    disciplina_id: int

class TurmaDisciplinaCreate(TurmaDisciplinaBase):
    pass

class TurmaDisciplina(TurmaDisciplinaBase):
    id: int
    created_at: datetime
    turma: TurmaSimples
    disciplina: Disciplina

    class Config:
        from_attributes = True

# ProfessorBloqueio schemas
class ProfessorBloqueioBase(BaseModel):
    professor_id: int
    dia_semana: DiaSemanaEnum
    hora_inicio: time
    hora_fim: time
    categoria: Optional[str] = None
    motivo: Optional[str] = None

class ProfessorBloqueioCreate(ProfessorBloqueioBase):
    pass

class ProfessorBloqueioUpdate(BaseModel):
    dia_semana: Optional[DiaSemanaEnum] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    categoria: Optional[str] = None
    motivo: Optional[str] = None

class ProfessorBloqueio(ProfessorBloqueioBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True

# ProfessorDisponibilidade schemas
class ProfessorDisponibilidadeBase(BaseModel):
    professor_id: int
    dia_semana: DiaSemanaEnum
    hora_inicio: time
    hora_fim: time
    categoria: Optional[str] = None
    observacoes: Optional[str] = None

class ProfessorDisponibilidadeCreate(ProfessorDisponibilidadeBase):
    pass

class ProfessorDisponibilidadeUpdate(BaseModel):
    dia_semana: Optional[DiaSemanaEnum] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    categoria: Optional[str] = None
    observacoes: Optional[str] = None

class ProfessorDisponibilidade(ProfessorDisponibilidadeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Horário schemas
class HorarioBase(BaseModel):
    professor_id: int
    disciplina_id: int
    turma_id: int
    turno_id: int
    dia_semana: DiaSemanaEnum
    hora_inicio: time
    hora_fim: time
    sala: Optional[str] = None
    observacoes: Optional[str] = None

class HorarioCreate(HorarioBase):
    pass

class HorarioUpdate(BaseModel):
    professor_id: Optional[int] = None
    disciplina_id: Optional[int] = None
    turma_id: Optional[int] = None
    turno_id: Optional[int] = None
    dia_semana: Optional[DiaSemanaEnum] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    sala: Optional[str] = None
    observacoes: Optional[str] = None

class Horario(HorarioBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    professor: ProfessorSemHorarios
    disciplina: Disciplina
    turma: Turma
    turno: Turno

    class Config:
        from_attributes = True

# EspacoEscola schemas
class EspacoEscolaBase(BaseModel):
    nome: str
    codigo: Optional[str] = None
    capacidade: Optional[int] = None
    descricao: Optional[str] = None
    ativo: bool = True
    requer_aprovacao: bool = False

class EspacoEscolaCreate(EspacoEscolaBase):
    pass

class EspacoEscolaUpdate(BaseModel):
    nome: Optional[str] = None
    codigo: Optional[str] = None
    capacidade: Optional[int] = None
    descricao: Optional[str] = None
    ativo: Optional[bool] = None
    requer_aprovacao: Optional[bool] = None

class EspacoEscola(EspacoEscolaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ReservaEspaco schemas
class ReservaEspacoBase(BaseModel):
    espaco_id: int
    data_reserva: date
    hora_inicio: time
    hora_fim: time
    finalidade: str
    observacoes: Optional[str] = None

class ReservaEspacoCreate(ReservaEspacoBase):
    pass

class ReservaEspacoUpdate(BaseModel):
    data_reserva: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    finalidade: Optional[str] = None
    observacoes: Optional[str] = None
    status: Optional[StatusReservaEnum] = None

class ReservaEspaco(ReservaEspacoBase):
    id: int
    solicitante_id: int
    status: StatusReservaEnum
    aprovado_por: Optional[int] = None
    data_aprovacao: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    espaco: EspacoEscola
    solicitante: Usuario

    class Config:
        from_attributes = True

# Update forward references
Professor.model_rebuild()
Horario.model_rebuild()
PeriodoAula.model_rebuild()
Turno.model_rebuild()
Turma.model_rebuild()
TurmaDisciplina.model_rebuild()

# ================================
# SCHEMAS DE AUTENTICAÇÃO
# ================================

class LoginRequest(BaseModel):
    username: str
    senha: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
