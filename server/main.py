import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import models
from database.database import engine
from routes import auth, usuarios, professores, disciplinas, turmas, horarios, espacos, reservas, professor_disciplinas, turnos, periodos_aula
from seed_curriculo import run as seed_curriculo_run
from config import (
    ALLOWED_ORIGINS,
    AUTO_CREATE_TABLES,
    CREATE_DEFAULT_ADMIN,
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_ADMIN_PASSWORD,
    DEFAULT_ADMIN_USERNAME,
    validate_settings,
)

logger = logging.getLogger(__name__)

# Função para criar o usuário administrador se ele não existir
def create_admin_user():
    from database.database import SessionLocal
    from routes.auth import get_password_hash
    
    db = SessionLocal()
    try:
        # Verificar se o usuário admin já existe
        admin_user = db.query(models.Usuario).filter(models.Usuario.username == DEFAULT_ADMIN_USERNAME).first()
        
        if not admin_user:
            # Criar um novo usuário administrador
            logger.info("Criando usuário administrador padrão...")
            hashed_password = get_password_hash(DEFAULT_ADMIN_PASSWORD)
            
            new_admin = models.Usuario(
                nome="Administrador",
                username=DEFAULT_ADMIN_USERNAME,
                email=DEFAULT_ADMIN_EMAIL,
                senha_hash=hashed_password,
                role=models.UserRole.DIRETOR,
                ativo=True
            )
            
            db.add(new_admin)
            db.commit()
            logger.info("Usuário administrador criado com sucesso!")
        else:
            logger.info("Usuário administrador já existe!")
    except Exception as e:
        logger.exception("Erro ao criar usuário administrador: %s", e)
        db.rollback()
    finally:
        db.close()

app = FastAPI(
    title="Sistema de Gestão Escolar - Professores e Horários",
    description="Sistema completo para gestão de professores, horários, disciplinas e reservas de espaços escolares",
    version="2.0.0"
)

# Avoid automatic redirects between slash/no-slash variants which can break proxies
# Keep default redirect between slash/no-slash so proxies can follow redirects

@app.on_event("startup")
def startup() -> None:
    validate_settings()
    if AUTO_CREATE_TABLES:
        models.Base.metadata.create_all(bind=engine)
    if CREATE_DEFAULT_ADMIN:
        create_admin_user()
    # Populate baseline curriculum and periods every startup (idempotent)
    try:
        seed_curriculo_run()
    except Exception as e:
        logger.exception("Erro ao executar seed_curriculo: %s", e)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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
app.include_router(turnos.router)
app.include_router(periodos_aula.router)
app.include_router(horarios.router)
app.include_router(espacos.router)
app.include_router(reservas.router)
app.include_router(professor_disciplinas.router)
