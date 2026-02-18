import os
import uuid
import requests

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
ADMIN_USER = os.getenv("API_ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("API_ADMIN_PASS", "admin123")


def _url(path: str) -> str:
    return f"{BASE_URL}{path}"


def _auth_headers() -> dict:
    resp = requests.post(
        _url("/auth/login"),
        json={"username": ADMIN_USER, "senha": ADMIN_PASS},
        timeout=10,
    )
    assert resp.status_code == 200, resp.text
    token = resp.json().get("access_token")
    assert token, resp.text
    return {"Authorization": f"Bearer {token}"}


def test_horarios_por_professor_grouping_flow():
    headers = _auth_headers()
    suffix = uuid.uuid4().hex[:8]

    # Create turno
    turno_payload = {
        "nome": f"Mat-{suffix}",
        "hora_inicio": "07:00:00",
        "hora_fim": "12:00:00",
        "descricao": "Turno testes",
        "ativo": True,
    }
    turno = requests.post(_url("/turnos/"), json=turno_payload, headers=headers, timeout=10)
    assert turno.status_code in (200, 201), turno.text
    turno_id = turno.json()["id"]

    # Create disciplina
    disc_payload = {
        "nome": f"Disc-{suffix}",
        "codigo": f"DISC-{suffix}",
        "carga_horaria_semanal": 2,
        "descricao": "Disciplina teste",
        "ativa": True,
    }
    disc = requests.post(_url("/disciplinas/"), json=disc_payload, headers=headers, timeout=10)
    assert disc.status_code == 200, disc.text
    disc_id = disc.json()["id"]

    # Create turma
    turma_payload = {
        "nome": f"1A-{suffix}",
        "ano": "1º",
        "turno_id": turno_id,
        "curso": "Ensino Médio",
        "ativa": True,
    }
    turma = requests.post(_url("/turmas/"), json=turma_payload, headers=headers, timeout=10)
    assert turma.status_code == 200, turma.text
    turma_id = turma.json()["id"]

    # Create professor
    prof_payload = {
        "departamento": "Depto",
        "especializacao": "Teste",
        "carga_horaria_semanal": 10,
        "observacoes": "",
        "usuario": {
            "nome": f"Prof {suffix}",
            "username": f"prof-{suffix}",
            "email": f"prof-{suffix}@example.com",
            "telefone": "11999990000",
            "role": "PROFESSOR",
            "senha": "senha123",
            "ativo": True,
        },
    }
    prof = requests.post(_url("/professores/"), json=prof_payload, headers=headers, timeout=10)
    assert prof.status_code == 200, prof.text
    prof_id = prof.json()["id"]

    # Link professor-disciplina
    prof_disc = requests.post(
        _url("/professor-disciplinas"),
        json={"professor_id": prof_id, "disciplina_id": disc_id, "carga_horaria": 2},
        headers=headers,
        timeout=10,
    )
    assert prof_disc.status_code == 200, prof_disc.text

    # Link turma-disciplina
    turma_disc = requests.post(
        _url("/turma-disciplinas"),
        json={"turma_id": turma_id, "disciplina_id": disc_id},
        headers=headers,
        timeout=10,
    )
    assert turma_disc.status_code == 200, turma_disc.text

    # Create a horário
    horario_payload = {
        "professor_id": prof_id,
        "disciplina_id": disc_id,
        "turma_id": turma_id,
        "turno_id": turno_id,
        "dia_semana": "segunda",
        "hora_inicio": "08:00:00",
        "hora_fim": "09:00:00",
        "sala": "101",
        "observacoes": "",
    }
    h = requests.post(_url("/horarios/"), json=horario_payload, headers=headers, timeout=10)
    assert h.status_code == 200, h.text

    # Grouped endpoint
    grouped = requests.get(_url(f"/horarios/por-professor/{prof_id}"), headers=headers, timeout=10)
    assert grouped.status_code == 200, grouped.text
    data = grouped.json()
    assert data["professor"]["id"] == prof_id
    assert "segunda" in data["horarios"], grouped.text

    # PDF endpoint
    pdf = requests.get(_url(f"/horarios/por-professor/{prof_id}/pdf"), headers=headers, timeout=10)
    assert pdf.status_code == 200, pdf.text
    assert pdf.headers.get("Content-Type") == "application/pdf"
