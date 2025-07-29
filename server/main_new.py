from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import models
from .database.database import engine
from .routes import auth, usuarios, professores, disciplinas, turmas, horarios, espacos, reservas, professor_disciplinas

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

# Basic endpoints
@app.get("/")
def read_root():
    return {"message": "Sistema de Gestão Escolar - Professores e Horários", "version": "2.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Include all routers
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(professores.router)
app.include_router(disciplinas.router)
app.include_router(turmas.router)
app.include_router(horarios.router)
app.include_router(espacos.router)
app.include_router(reservas.router)
app.include_router(professor_disciplinas.router)
