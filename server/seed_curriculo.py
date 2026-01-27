from datetime import time
from typing import Dict

from database.database import SessionLocal
from database import models, schemas
import crud_new as crud

# -----------------------------
# Dados do currículo por trilha
# -----------------------------
CURRICULOS: Dict[str, Dict[str, Dict[str, int]]] = {
    "1ª SÉRIE – ENSINO MÉDIO INTEGRAL PROPEDÊUTICO": {
        "turno": "INTEGRAL",
        "curso": "Ensino Médio Integral Propedêutico",
        "ano": "1ª",
        "disciplinas": {
            "Língua Portuguesa": 5,
            "Língua Inglesa": 2,
            "Educação Física": 1,
            "Arte": 1,
            "Biologia": 2,
            "Física": 3,
            "Química": 3,
            "Matemática": 5,
            "Filosofia": 1,
            "Geografia": 3,
            "História": 3,
            "Sociologia": 1,
            "Eletivas": 1,
            "Projeto de Vida": 1,
            "Estudo Orientado": 2,
            "Práticas e Vivências em Protagonismo": 1,
        },
    },
    "1ª SÉRIE – ENSINO MÉDIO TÉCNICO DE INFORMÁTICA": {
        "turno": "INTEGRAL",
        "curso": "Ensino Médio Técnico de Informática",
        "ano": "1ª",
        "disciplinas": {
            "Língua Portuguesa": 4,
            "Língua Inglesa": 2,
            "Educação Física": 1,
            "Arte": 1,
            "Biologia": 2,
            "Física": 2,
            "Química": 2,
            "Matemática": 4,
            "Filosofia": 1,
            "Geografia": 2,
            "História": 2,
            "Sociologia": 1,
            "Eletivas": 1,
            "Projeto de Vida": 1,
            "Projetos Empreendedores": 2,
            "Fundamentos da Computação": 2,
            "Lógica de Programação e Gamificação": 3,
            "Introdução ao Desenvolvimento Web": 2,
        },
    },
    "2ª SÉRIE – ENSINO MÉDIO TÉCNICO DE INFORMÁTICA": {
        "turno": "INTEGRAL",
        "curso": "Ensino Médio Técnico de Informática",
        "ano": "2ª",
        "disciplinas": {
            "Língua Portuguesa": 4,
            "Biologia": 2,
            "Física": 2,
            "Química": 2,
            "Matemática": 4,
            "Geografia": 2,
            "História": 2,
            "Eletiva": 2,
            "Projeto de Vida": 1,
            "Prática Experimental": 1,
            "Estudo Orientado": 1,
            "Cultura Digital": 2,
            "Introdução à Rede de Computadores e Protocolos": 2,
            "Linguagem de Programação Aplicada à Web": 2,
            "IOT – Internet of Things": 2,
            "Banco de Dados": 2,
            "Aplicativos Web": 2,
        },
    },
    "3ª SÉRIE – ENSINO MÉDIO TÉCNICO DE INFORMÁTICA": {
        "turno": "INTEGRAL",
        "curso": "Ensino Médio Técnico de Informática",
        "ano": "3ª",
        "disciplinas": {
            "Língua Portuguesa": 3,
            "Biologia": 2,
            "Matemática": 3,
            "Geografia": 2,
            "História": 2,
            "Eletiva": 2,
            "Projeto de Vida": 2,
            "Prática Experimental": 1,
            "Estudo Orientado": 1,
            "Análise e Projetos de Sistemas": 2,
            "Arquitetura, Segurança e Projetos de Redes": 3,
            "Programação para Web Design": 2,
            "Linguagem de Programação Orientada a Objetos": 3,
            "Desenvolvimento de Sistemas": 3,
            "Desenvolvimento de Games": 2,
        },
    },
    "1ª SÉRIE – ENSINO MÉDIO REGULAR VESPERTINO": {
        "turno": "VESPERTINO",
        "curso": "Ensino Médio Regular",
        "ano": "1ª",
        "disciplinas": {
            "Língua Portuguesa": 5,
            "Língua Inglesa": 2,
            "Educação Física": 1,
            "Arte": 1,
            "Biologia": 2,
            "Física": 3,
            "Química": 3,
            "Matemática": 5,
            "Filosofia": 1,
            "Geografia": 3,
            "História": 3,
            "Sociologia": 1,
        },
    },
    "2ª SÉRIE – ENSINO MÉDIO REGULAR VESPERTINO": {
        "turno": "VESPERTINO",
        "curso": "Ensino Médio Regular",
        "ano": "2ª",
        "disciplinas": {
            "Língua Portuguesa": 4,
            "Língua Inglesa": 1,
            "Educação Física": 1,
            "Arte": 1,
            "Biologia": 2,
            "Física": 1,
            "Química": 1,
            "Matemática": 4,
            "Filosofia": 1,
            "Geografia": 2,
            "História": 2,
            "Sociologia": 1,
            "Aprofundamento em Biologia": 2,
            "Aprofundamento em Física": 2,
            "Aprofundamento em Química": 2,
            "Aprofundamento em Matemática": 3,
        },
    },
    "3ª SÉRIE – ENSINO MÉDIO REGULAR VESPERTINO": {
        "turno": "VESPERTINO",
        "curso": "Ensino Médio Regular",
        "ano": "3ª",
        "disciplinas": {
            "Língua Portuguesa": 5,
            "Língua Inglesa": 1,
            "Biologia": 2,
            "Física": 1,
            "Química": 1,
            "Matemática": 5,
            "Filosofia": 1,
            "Geografia": 2,
            "História": 2,
            "Sociologia": 1,
            "Eletiva": 1,
            "Projeto de Vida": 1,
            "Estudo Orientado": 1,
            "Português Instrumental": 1,
            "Desenho Técnico": 1,
            "Matemática e Sociedade": 1,
            "Fontes de Obtenção de Energia": 1,
            "A Física e as Matrizes Energéticas": 1,
            "Matéria e Energia": 1,
        },
    },
}

# Horários padrão de turnos (ajuste conforme necessário)
TURNOS_PADRAO = {
    "INTEGRAL": {
        "nome": "Integral",
        "hora_inicio": time(7, 0),
        "hora_fim": time(14, 0),
        "descricao": "Turno Integral",
    },
    "VESPERTINO": {
        "nome": "Vespertino",
        "hora_inicio": time(14, 50),
        "hora_fim": time(20, 10),
        "descricao": "Turno Vespertino",
    },
}


def ensure_turno(db: SessionLocal, chave: str) -> models.Turno:
    cfg = TURNOS_PADRAO[chave]
    existing = db.query(models.Turno).filter(models.Turno.nome == cfg["nome"]).first()
    if existing:
        # Atualizar horário se estiver diferente
        changed = False
        if existing.hora_inicio != cfg["hora_inicio"]:
            existing.hora_inicio = cfg["hora_inicio"]
            changed = True
        if existing.hora_fim != cfg["hora_fim"]:
            existing.hora_fim = cfg["hora_fim"]
            changed = True
        if existing.descricao != cfg["descricao"]:
            existing.descricao = cfg["descricao"]
            changed = True
        if changed:
            db.commit()
            db.refresh(existing)
        return existing
    return crud.create_turno(db, schemas.TurnoCreate(**cfg))


def ensure_disciplina(db: SessionLocal, nome: str) -> models.Disciplina:
    existing = db.query(models.Disciplina).filter(models.Disciplina.nome == nome).first()
    if existing:
        return existing
    return crud.create_disciplina(db, schemas.DisciplinaCreate(nome=nome, carga_horaria_semanal=1))


def ensure_turma(db: SessionLocal, nome: str, ano: str, turno_id: int, curso: str) -> models.Turma:
    existing = db.query(models.Turma).filter(models.Turma.nome == nome).first()
    if existing:
        return existing
    return crud.create_turma(db, schemas.TurmaCreate(nome=nome, ano=ano, turno_id=turno_id, curso=curso))


def run():
    db = SessionLocal()
    try:
        print("==> Iniciando seed do currículo...")
        # Criar turnos
        turnos_cache = {}
        for chave in set(v["turno"] for v in CURRICULOS.values()):
            turno = ensure_turno(db, chave)
            turnos_cache[chave] = turno
            print(f"Turno garantido: {turno.nome} (id={turno.id})")

        # Criar disciplinas (união de todas)
        nomes_disciplinas = set()
        for conf in CURRICULOS.values():
            nomes_disciplinas.update(conf["disciplinas"].keys())
        for nome in sorted(nomes_disciplinas):
            d = ensure_disciplina(db, nome)
            print(f"Disciplina garantida: {d.nome} (id={d.id})")

        # Criar turmas por trilha
        for trilha, conf in CURRICULOS.items():
            turno = turnos_cache[conf["turno"]]
            nome_turma = f"{conf['ano']} - {conf['curso']}"
            turma = ensure_turma(db, nome_turma, conf["ano"], turno.id, conf["curso"])
            print(f"Turma garantida: {turma.nome} (turno={turno.nome})")

        # -----------------------------
        # Periodos de aula por turno
        # -----------------------------
        def upsert_periodos(turno: models.Turno, blocos: list[tuple]):
            # Remove períodos gerais (sem turma) do turno para evitar duplicação
            db.query(models.PeriodoAula).filter(
                models.PeriodoAula.turno_id == turno.id,
                models.PeriodoAula.turma_id == None,
            ).delete(synchronize_session=False)
            db.commit()

            for numero, tipo, inicio_str, fim_str, descricao in blocos:
                h_i = time(int(inicio_str.split(":")[0]), int(inicio_str.split(":")[1]))
                h_f = time(int(fim_str.split(":")[0]), int(fim_str.split(":")[1]))
                pa = models.PeriodoAula(
                    turno_id=turno.id,
                    turma_id=None,
                    numero_aula=numero,
                    hora_inicio=h_i,
                    hora_fim=h_f,
                    tipo=getattr(models.TipoPeriodoEnum, tipo),
                    descricao=descricao,
                    ativo=True,
                )
                db.add(pa)
            db.commit()

        integral_blocos = [
            (1, "AULA", "07:00", "07:50", "1ª aula"),
            (2, "AULA", "07:50", "08:40", "2ª aula"),
            (3, "AULA", "08:40", "09:30", "3ª aula"),
            (4, "RECREIO", "09:30", "09:50", "Recreio"),
            (5, "AULA", "09:50", "10:40", "4ª aula"),
            (6, "AULA", "10:40", "11:30", "5ª aula"),
            (7, "AULA", "11:30", "12:20", "6ª aula"),
            (8, "ALMOCO", "12:20", "13:10", "Almoço"),
            (9, "AULA", "13:10", "14:00", "7ª aula"),
        ]

        vespertino_blocos = [
            (1, "AULA", "14:50", "15:40", "1ª aula"),
            (2, "AULA", "15:40", "16:30", "2ª aula"),
            (3, "AULA", "16:30", "17:20", "3ª aula"),
            (4, "RECREIO", "17:20", "17:40", "Recreio"),
            (5, "AULA", "17:40", "18:30", "4ª aula"),
            (6, "AULA", "18:30", "19:20", "5ª aula"),
            (7, "AULA", "19:20", "20:10", "6ª aula"),
        ]

        # Aplicar períodos aos turnos
        upsert_periodos(turnos_cache["INTEGRAL"], integral_blocos)
        upsert_periodos(turnos_cache["VESPERTINO"], vespertino_blocos)

        print("==> Seed concluído com sucesso.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
