from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import models
from database.database import engine
from routes import auth, usuarios, professores, disciplinas, turmas, horarios, espacos, reservas, professor_disciplinas, turnos, periodos_aula

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Função para criar o usuário administrador se ele não existir
def create_admin_user():
    from database.database import SessionLocal
    from routes.auth import get_password_hash
    
    db = SessionLocal()
    try:
        # Verificar se o usuário admin já existe
        admin_user = db.query(models.Usuario).filter(models.Usuario.username == "admin").first()
        
        if not admin_user:
            # Criar um novo usuário administrador
            print("Criando usuário administrador padrão...")
            hashed_password = get_password_hash("admin123")
            
            new_admin = models.Usuario(
                nome="Administrador",
                username="admin",
                senha_hash=hashed_password,
                role=models.UserRole.DIRETOR,
                ativo=True
            )
            
            db.add(new_admin)
            db.commit()
            print("Usuário administrador criado com sucesso!")
        else:
            print("Usuário administrador já existe!")
    except Exception as e:
        print(f"Erro ao criar usuário administrador: {e}")
        db.rollback()
    finally:
        db.close()

# Chamar a função para criar o admin
create_admin_user()

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
app.include_router(turnos.router)
app.include_router(periodos_aula.router)
app.include_router(horarios.router)
app.include_router(espacos.router)
app.include_router(reservas.router)
app.include_router(professor_disciplinas.router)
