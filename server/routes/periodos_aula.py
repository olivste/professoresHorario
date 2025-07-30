from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from database import models, schemas
import crud_new as crud
from utils import get_db

router = APIRouter(
    prefix="/periodos-aula",
    tags=["Períodos de Aul@router.post("/clonar", response_model=List[schemas.PeriodoAula])
def clonar_periodos_aula(
    turno_origem_id: int, 
    turno_destino_id: Optional[int] = None,
    turma_destino_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
@router.post("/", response_model=schemas.PeriodoAula)
def create_periodo_aula(periodo_aula: schemas.PeriodoAulaCreate, db: Session = Depends(get_db)):
    # Verificar se o turno existe
    turno = db.query(models.Turno).filter(models.Turno.id == periodo_aula.turno_id).first()
    if not turno:
        raise HTTPException(status_code=404, detail="Turno não encontrado")
    
    # Verificar se a turma existe, se especificada
    if periodo_aula.turma_id:
        turma = db.query(models.Turma).filter(models.Turma.id == periodo_aula.turma_id).first()
        if not turma:
            raise HTTPException(status_code=404, detail="Turma não encontrada")
        
        # Verificar se a turma pertence ao turno especificado
        if turma.turno_id != periodo_aula.turno_id:
            raise HTTPException(
                status_code=400, 
                detail=f"A turma especificada não pertence ao turno informado"
            )
    
    # Verificar se o período está dentro do horário do turno
    if periodo_aula.hora_inicio < turno.hora_inicio or periodo_aula.hora_fim > turno.hora_fim:
        raise HTTPException(
            status_code=400, 
            detail="Horário do período de aula deve estar contido no horário do turno"
        )
    
    # Verificar se já existe um período com o mesmo número para este turno e turma (se especificada)
    query = db.query(models.PeriodoAula).filter(
        models.PeriodoAula.turno_id == periodo_aula.turno_id,
        models.PeriodoAula.numero_aula == periodo_aula.numero_aula
    )
    
    # Se uma turma foi especificada, adicionar à consulta
    if periodo_aula.turma_id:
        query = query.filter(models.PeriodoAula.turma_id == periodo_aula.turma_id)
    else:
        # Se não foi especificada turma, verificar apenas períodos sem turma específica
        query = query.filter(models.PeriodoAula.turma_id == None)
    
    db_periodo = query.first()
    
    if db_periodo:
        raise HTTPException(
            status_code=400, 
            detail=f"Já existe um período de aula com o número {periodo_aula.numero_aula} para este turno" + 
                   (f" e turma" if periodo_aula.turma_id else "")
        )
    
    # Determinar automaticamente o próximo número de aula se não for fornecido ou for zero
    if periodo_aula.numero_aula == 0:
        # Consultar o maior número de aula para este turno e turma (se especificada)
        max_query = db.query(models.func.max(models.PeriodoAula.numero_aula))
        max_query = max_query.filter(models.PeriodoAula.turno_id == periodo_aula.turno_id)
        
        if periodo_aula.turma_id:
            max_query = max_query.filter(models.PeriodoAula.turma_id == periodo_aula.turma_id)
        else:
            max_query = max_query.filter(models.PeriodoAula.turma_id == None)
        
        max_numero = max_query.scalar() or 0
        periodo_aula.numero_aula = max_numero + 1
    
    # Criar o novo período de aula
    db_periodo = models.PeriodoAula(**periodo_aula.dict())
    
    db.add(db_periodo)
    db.commit()
    db.refresh(db_periodo)
    
    return db_periodo

@router.get("/", response_model=List[schemas.PeriodoAula])
def read_periodos_aula(
    skip: int = 0, 
    limit: int = 100, 
    turno_id: Optional[int] = None,
    turma_id: Optional[int] = None,
    tipo: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.PeriodoAula)
    
    if turno_id:
        query = query.filter(models.PeriodoAula.turno_id == turno_id)
    
    if turma_id:
        query = query.filter(models.PeriodoAula.turma_id == turma_id)
    
    if tipo:
        try:
            tipo_enum = schemas.TipoPeriodoEnum(tipo.upper())
            query = query.filter(models.PeriodoAula.tipo == tipo_enum)
        except ValueError:
            tipos_validos = [t.value for t in schemas.TipoPeriodoEnum]
            raise HTTPException(status_code=400, detail=f"Tipo inválido. Valores válidos: {', '.join(tipos_validos)}")
    
    return query.order_by(models.PeriodoAula.turno_id, models.PeriodoAula.numero_aula).offset(skip).limit(limit).all()

@router.get("/{periodo_id}", response_model=schemas.PeriodoAula)
def read_periodo_aula(periodo_id: int, db: Session = Depends(get_db)):
    db_periodo = db.query(models.PeriodoAula).filter(models.PeriodoAula.id == periodo_id).first()
    if db_periodo is None:
        raise HTTPException(status_code=404, detail="Período de aula não encontrado")
    return db_periodo

@router.put("/{periodo_id}", response_model=schemas.PeriodoAula)
def update_periodo_aula(periodo_id: int, periodo: schemas.PeriodoAulaUpdate, db: Session = Depends(get_db)):
    db_periodo = db.query(models.PeriodoAula).filter(models.PeriodoAula.id == periodo_id).first()
    if db_periodo is None:
        raise HTTPException(status_code=404, detail="Período de aula não encontrado")
    
    # Atualizar apenas os campos fornecidos
    update_data = periodo.dict(exclude_unset=True)
    
    # Se estiver alterando o turno_id ou numero_aula, verificar se já existe
    if (update_data.get("turno_id") or update_data.get("numero_aula")):
        turno_id = update_data.get("turno_id", db_periodo.turno_id)
        numero_aula = update_data.get("numero_aula", db_periodo.numero_aula)
        
        existing = db.query(models.PeriodoAula).filter(
            models.PeriodoAula.turno_id == turno_id,
            models.PeriodoAula.numero_aula == numero_aula,
            models.PeriodoAula.id != periodo_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400, 
                detail=f"Já existe um período de aula com o número {numero_aula} para este turno"
            )
    
    # Atualizar o objeto
    for key, value in update_data.items():
        setattr(db_periodo, key, value)
    
    db.commit()
    db.refresh(db_periodo)
    
    return db_periodo

@router.delete("/{periodo_id}")
def delete_periodo_aula(periodo_id: int, db: Session = Depends(get_db)):
    db_periodo = db.query(models.PeriodoAula).filter(models.PeriodoAula.id == periodo_id).first()
    if db_periodo is None:
        raise HTTPException(status_code=404, detail="Período de aula não encontrado")
    
    db.delete(db_periodo)
    db.commit()
    
    return {"message": "Período de aula removido com sucesso"}

@router.post("/auto-gerar", response_model=List[schemas.PeriodoAula])
def auto_gerar_periodos_aula(
    turno_id: int, 
    quantidade_aulas: int = 5,
    duracao_aula_minutos: int = 50,
    intervalo_minutos: Optional[int] = 20,
    horario_intervalo: Optional[int] = 3,  # Após qual aula será o intervalo (número)
    descricao_intervalo: Optional[str] = "Intervalo",
    hora_almoco_inicio: Optional[str] = None,
    hora_almoco_fim: Optional[str] = None,
    turma_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Gera automaticamente períodos de aula para um turno com base nos parâmetros fornecidos.
    Inclui intervalo e almoço se especificados.
    """
    import datetime
    
    # Verificar se o turno existe
    turno = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    if not turno:
        raise HTTPException(status_code=404, detail="Turno não encontrado")
    
    # Verificar se a turma existe, se especificada
    if turma_id:
        turma = db.query(models.Turma).filter(models.Turma.id == turma_id).first()
        if not turma:
            raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    # Calcular duração da aula
    duracao_aula = datetime.timedelta(minutes=duracao_aula_minutos)
    
    # Hora de início inicial
    hora_atual = datetime.datetime.combine(datetime.date.today(), turno.hora_inicio)
    
    # Lista para armazenar os períodos criados
    periodos_criados = []
    
    # Criar aulas
    for i in range(1, quantidade_aulas + 1):
        # Verificar se deve adicionar intervalo antes da próxima aula
        if intervalo_minutos and horario_intervalo and i == horario_intervalo + 1:
            # Calcular horário do intervalo
            hora_fim_intervalo = hora_atual
            hora_inicio_intervalo = hora_fim_intervalo - datetime.timedelta(minutes=intervalo_minutos)
            
            # Criar período de intervalo
            db_intervalo = models.PeriodoAula(
                turno_id=turno_id,
                turma_id=turma_id,
                numero_aula=i - 1,  # Mesmo número da última aula
                hora_inicio=hora_inicio_intervalo.time(),
                hora_fim=hora_fim_intervalo.time(),
                tipo=schemas.TipoPeriodoEnum.INTERVALO,
                descricao=descricao_intervalo,
                ativo=True
            )
            
            db.add(db_intervalo)
            db.flush()
            periodos_criados.append(db_intervalo)
        
        # Verificar se deve adicionar almoço
        if hora_almoco_inicio and hora_almoco_fim and i == (quantidade_aulas // 2 + 1):
            try:
                hora_inicio_almoco = datetime.datetime.strptime(hora_almoco_inicio, "%H:%M").time()
                hora_fim_almoco = datetime.datetime.strptime(hora_almoco_fim, "%H:%M").time()
                
                # Criar período de almoço
                db_almoco = models.PeriodoAula(
                    turno_id=turno_id,
                    turma_id=turma_id,
                    numero_aula=i - 1,  # Mesmo número da última aula
                    hora_inicio=hora_inicio_almoco,
                    hora_fim=hora_fim_almoco,
                    tipo=schemas.TipoPeriodoEnum.ALMOCO,
                    descricao="Almoço",
                    ativo=True
                )
                
                db.add(db_almoco)
                db.flush()
                periodos_criados.append(db_almoco)
                
                # Atualizar hora atual para após o almoço
                hora_atual = datetime.datetime.combine(datetime.date.today(), hora_fim_almoco)
            except ValueError:
                raise HTTPException(status_code=400, detail="Formato de hora inválido para almoço (use HH:MM)")
        
        # Calcular horário da aula
        hora_inicio = hora_atual
        hora_fim = hora_inicio + duracao_aula
        
        # Criar aula
        db_aula = models.PeriodoAula(
            turno_id=turno_id,
            turma_id=turma_id,
            numero_aula=i,
            hora_inicio=hora_inicio.time(),
            hora_fim=hora_fim.time(),
            tipo=schemas.TipoPeriodoEnum.AULA,
            descricao=f"{i}ª Aula",
            ativo=True
        )
        
        db.add(db_aula)
        db.flush()
        periodos_criados.append(db_aula)
        
        # Atualizar hora para próxima aula
        hora_atual = hora_fim
    
    # Commit todas as alterações
    db.commit()
    for periodo in periodos_criados:
        db.refresh(periodo)
    
    return periodos_criados

@router.post("/clonar", response_model=List[schemas.PeriodoAula])
def clonar_periodos_aula(
    turno_origem_id: int, 
    turno_destino_id: Optional[int] = None,
    turma_destino_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Clona os períodos de aula de um turno para outro turno ou para uma turma específica.
    Se turno_destino_id não for fornecido, usa o mesmo turno de origem.
    """
    # Verificar se o turno de origem existe
    turno_origem = db.query(models.Turno).filter(models.Turno.id == turno_origem_id).first()
    if not turno_origem:
        raise HTTPException(status_code=404, detail="Turno de origem não encontrado")
    
    # Se turno_destino_id for fornecido, verificar se existe
    if turno_destino_id:
        turno_destino = db.query(models.Turno).filter(models.Turno.id == turno_destino_id).first()
        if not turno_destino:
            raise HTTPException(status_code=404, detail="Turno de destino não encontrado")
    else:
        turno_destino_id = turno_origem_id
    
    # Se turma_destino_id for fornecido, verificar se existe
    if turma_destino_id:
        turma_destino = db.query(models.Turma).filter(models.Turma.id == turma_destino_id).first()
        if not turma_destino:
            raise HTTPException(status_code=404, detail="Turma de destino não encontrada")
    
    # Obter períodos do turno de origem
    periodos_origem = db.query(models.PeriodoAula).filter(
        models.PeriodoAula.turno_id == turno_origem_id,
        models.PeriodoAula.turma_id == None  # Apenas períodos não associados a turmas específicas
    ).all()
    
    if not periodos_origem:
        raise HTTPException(status_code=404, detail="Não há períodos de aula no turno de origem")
    
    # Verificar se já existem períodos no destino
    if turma_destino_id:
        periodos_existentes = db.query(models.PeriodoAula).filter(
            models.PeriodoAula.turno_id == turno_destino_id,
            models.PeriodoAula.turma_id == turma_destino_id
        ).first()
        
        if periodos_existentes:
            raise HTTPException(
                status_code=400, 
                detail="Já existem períodos de aula para a turma de destino. Remova-os primeiro."
            )
    
    # Clonar os períodos
    periodos_clonados = []
    for periodo_origem in periodos_origem:
        novo_periodo = models.PeriodoAula(
            turno_id=turno_destino_id,
            turma_id=turma_destino_id,
            numero_aula=periodo_origem.numero_aula,
            hora_inicio=periodo_origem.hora_inicio,
            hora_fim=periodo_origem.hora_fim,
            tipo=periodo_origem.tipo,
            descricao=periodo_origem.descricao,
            ativo=periodo_origem.ativo
        )
        
        db.add(novo_periodo)
        db.flush()
        periodos_clonados.append(novo_periodo)
    
    # Commit todas as alterações
    db.commit()
    for periodo in periodos_clonados:
        db.refresh(periodo)
    
    return periodos_clonados

@router.post("/batch", response_model=List[schemas.PeriodoAula])
def create_periodos_aula_batch(periodos_aula: List[schemas.PeriodoAulaCreate], db: Session = Depends(get_db)):
    """
    Cria múltiplos períodos de aula de uma vez.
    Útil para importação ou criação em massa.
    """
    # Lista para armazenar os períodos criados
    periodos_criados = []
    
    # Dicionário para armazenar o próximo número de aula por turno/turma
    proximos_numeros = {}
    
    for periodo_aula in periodos_aula:
        # Verificar se o turno existe
        turno = db.query(models.Turno).filter(models.Turno.id == periodo_aula.turno_id).first()
        if not turno:
            raise HTTPException(status_code=404, detail=f"Turno {periodo_aula.turno_id} não encontrado")
        
        # Verificar se a turma existe, se especificada
        if periodo_aula.turma_id:
            turma = db.query(models.Turma).filter(models.Turma.id == periodo_aula.turma_id).first()
            if not turma:
                raise HTTPException(status_code=404, detail=f"Turma {periodo_aula.turma_id} não encontrada")
            
            # Verificar se a turma pertence ao turno especificado
            if turma.turno_id != periodo_aula.turno_id:
                raise HTTPException(
                    status_code=400, 
                    detail=f"A turma {periodo_aula.turma_id} não pertence ao turno {periodo_aula.turno_id}"
                )
        
        # Verificar se o período está dentro do horário do turno
        if periodo_aula.hora_inicio < turno.hora_inicio or periodo_aula.hora_fim > turno.hora_fim:
            raise HTTPException(
                status_code=400, 
                detail=f"Horário do período {periodo_aula.hora_inicio}-{periodo_aula.hora_fim} deve estar contido no horário do turno {turno.hora_inicio}-{turno.hora_fim}"
            )
        
        # Chave para identificar turno/turma
        chave_turno_turma = (periodo_aula.turno_id, periodo_aula.turma_id)
        
        # Determinar automaticamente o próximo número de aula se não for fornecido ou for zero
        if periodo_aula.numero_aula == 0:
            if chave_turno_turma not in proximos_numeros:
                # Consultar o maior número de aula para este turno e turma (se especificada)
                max_query = db.query(models.func.max(models.PeriodoAula.numero_aula))
                max_query = max_query.filter(models.PeriodoAula.turno_id == periodo_aula.turno_id)
                
                if periodo_aula.turma_id:
                    max_query = max_query.filter(models.PeriodoAula.turma_id == periodo_aula.turma_id)
                else:
                    max_query = max_query.filter(models.PeriodoAula.turma_id == None)
                
                max_numero = max_query.scalar() or 0
                proximos_numeros[chave_turno_turma] = max_numero + 1
            
            periodo_aula.numero_aula = proximos_numeros[chave_turno_turma]
            proximos_numeros[chave_turno_turma] += 1
        
        # Verificar se já existe um período com o mesmo número para este turno e turma (se especificada)
        query = db.query(models.PeriodoAula).filter(
            models.PeriodoAula.turno_id == periodo_aula.turno_id,
            models.PeriodoAula.numero_aula == periodo_aula.numero_aula
        )
        
        # Se uma turma foi especificada, adicionar à consulta
        if periodo_aula.turma_id:
            query = query.filter(models.PeriodoAula.turma_id == periodo_aula.turma_id)
        else:
            # Se não foi especificada turma, verificar apenas períodos sem turma específica
            query = query.filter(models.PeriodoAula.turma_id == None)
        
        db_periodo_existente = query.first()
        
        if db_periodo_existente:
            raise HTTPException(
                status_code=400, 
                detail=f"Já existe um período de aula com o número {periodo_aula.numero_aula} para este turno" + 
                       (f" e turma {periodo_aula.turma_id}" if periodo_aula.turma_id else "")
            )
        
        # Criar o novo período de aula
        db_periodo = models.PeriodoAula(**periodo_aula.dict())
        
        db.add(db_periodo)
        db.flush()
        periodos_criados.append(db_periodo)
    
    # Commit todas as alterações
    db.commit()
    for periodo in periodos_criados:
        db.refresh(periodo)
    
    return periodos_criados
