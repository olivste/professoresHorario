"""
Sistema de migrações automáticas para garantir que o schema está atualizado
"""
import logging
from sqlalchemy import text, inspect
from database.database import engine, Base
from database import models

logger = logging.getLogger(__name__)

def run_migrations():
    """Executa migrações necessárias no banco de dados"""
    try:
        logger.info("🔄 Verificando e aplicando migrações...")
        
        with engine.connect() as conn:
            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()
            
            # 1. Criar tabela areas se não existir
            if 'areas' not in existing_tables:
                logger.info("📦 Criando tabela 'areas'...")
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS areas (
                        id SERIAL PRIMARY KEY,
                        nome VARCHAR(100) NOT NULL UNIQUE,
                        descricao TEXT,
                        cor VARCHAR(7),
                        ativa BOOLEAN DEFAULT true,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE
                    )
                """))
                conn.commit()
                logger.info("✅ Tabela 'areas' criada")
            
            # 2. Criar tabela area_planejamentos se não existir
            if 'area_planejamentos' not in existing_tables:
                logger.info("📦 Criando tabela 'area_planejamentos'...")
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS area_planejamentos (
                        id SERIAL PRIMARY KEY,
                        area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
                        dia_semana VARCHAR(20) NOT NULL,
                        hora_inicio TIME NOT NULL,
                        hora_fim TIME NOT NULL,
                        descricao TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE,
                        UNIQUE(area_id, dia_semana)
                    )
                """))
                conn.commit()
                logger.info("✅ Tabela 'area_planejamentos' criada")
            
            # 3. Adicionar coluna area_id na tabela professores se não existir
            if 'professores' in existing_tables:
                columns = [col['name'] for col in inspector.get_columns('professores')]
                if 'area_id' not in columns:
                    logger.info("📦 Adicionando coluna 'area_id' na tabela 'professores'...")
                    conn.execute(text("""
                        ALTER TABLE professores 
                        ADD COLUMN area_id INTEGER REFERENCES areas(id)
                    """))
                    conn.commit()
                    logger.info("✅ Coluna 'area_id' adicionada")
            
            # 4. Criar todas as outras tabelas do modelo (se não existirem)
            logger.info("📦 Criando tabelas restantes do modelo...")
            Base.metadata.create_all(bind=engine)
            logger.info("✅ Schema atualizado com sucesso!")
            
    except Exception as e:
        logger.error(f"❌ Erro ao executar migrações: {e}")
        raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_migrations()
