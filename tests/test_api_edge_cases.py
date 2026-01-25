import os
import uuid
import datetime as dt

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


def _create_school_entities(headers: dict) -> dict:
    suffix = uuid.uuid4().hex[:8]

    turno_payload = {
        "nome": f"Matutino-edge-{suffix}",
        "hora_inicio": "07:00:00",
        "hora_fim": "12:00:00",
        "descricao": "Turno edge",
        "ativo": True,
    }
    turno = requests.post(_url("/turnos/"), json=turno_payload, headers=headers, timeout=10)
    assert turno.status_code in (200, 201), turno.text
    turno_id = turno.json()["id"]

    disc_payload = {
        "nome": f"Disc-edge-{suffix}",
        "codigo": f"DISC-{suffix}",
        "carga_horaria_semanal": 2,
        "descricao": "Disciplina edge",
        "ativa": True,
    }
    disc = requests.post(_url("/disciplinas/"), json=disc_payload, headers=headers, timeout=10)
    assert disc.status_code == 200, disc.text
    disc_id = disc.json()["id"]

    turma_payload = {
        "nome": f"T-{suffix}",
        "ano": "1",
        "turno_id": turno_id,
        "curso": "Ensino Medio",
        "ativa": True,
    }
    turma = requests.post(_url("/turmas/"), json=turma_payload, headers=headers, timeout=10)
    assert turma.status_code == 200, turma.text
    turma_id = turma.json()["id"]

    prof_payload = {
        "departamento": "Edge",
        "especializacao": "Teste",
        "carga_horaria_semanal": 10,
        "observacoes": "",
        "usuario": {
            "nome": f"Prof Edge {suffix}",
            "username": f"prof-edge-{suffix}",
            "email": f"prof-edge-{suffix}@example.com",
            "telefone": "11988881111",
            "role": "PROFESSOR",
            "senha": "senha123",
            "ativo": True,
        },
    }
    prof = requests.post(_url("/professores/"), json=prof_payload, headers=headers, timeout=10)
    assert prof.status_code == 200, prof.text
    prof_id = prof.json()["id"]

    return {
        "turno_id": turno_id,
        "disciplina_id": disc_id,
        "turma_id": turma_id,
        "professor_id": prof_id,
    }


def test_reserva_conflict_returns_400():
    headers = _auth_headers()
    suffix = uuid.uuid4().hex[:6]

    espaco_payload = {
        "nome": f"Lab-edge-{suffix}",
        "codigo": f"LAB-{suffix}",
        "capacidade": 30,
        "descricao": "Lab edge",
        "ativo": True,
        "requer_aprovacao": False,
    }
    espaco = requests.post(_url("/espacos/"), json=espaco_payload, headers=headers, timeout=10)
    assert espaco.status_code == 200, espaco.text
    espaco_id = espaco.json()["id"]

    data_reserva = (dt.date.today() + dt.timedelta(days=2)).isoformat()
    reserva_payload = {
        "espaco_id": espaco_id,
        "data_reserva": data_reserva,
        "hora_inicio": "09:00:00",
        "hora_fim": "10:00:00",
        "finalidade": "Reuniao edge",
        "observacoes": "",
    }
    r1 = requests.post(
        _url("/reservas"),
        params={"solicitante_id": 1},
        json=reserva_payload,
        headers=headers,
        timeout=10,
    )
    assert r1.status_code == 200, r1.text

    overlap_payload = {
        **reserva_payload,
        "hora_inicio": "09:30:00",
        "hora_fim": "10:00:00",
    }
    r2 = requests.post(
        _url("/reservas"),
        params={"solicitante_id": 1},
        json=overlap_payload,
        headers=headers,
        timeout=10,
    )
    assert r2.status_code == 400, r2.text


def test_horario_conflict_same_professor_returns_400():
    headers = _auth_headers()
    ids = _create_school_entities(headers)

    base_payload = {
        "professor_id": ids["professor_id"],
        "disciplina_id": ids["disciplina_id"],
        "turma_id": ids["turma_id"],
        "turno_id": ids["turno_id"],
        "dia_semana": "segunda",
        "hora_inicio": "08:00:00",
        "hora_fim": "09:00:00",
        "sala": "201",
        "observacoes": "",
    }
    h1 = requests.post(_url("/horarios/"), json=base_payload, headers=headers, timeout=10)
    assert h1.status_code == 200, h1.text

    conflict_payload = {**base_payload, "hora_inicio": "08:30:00", "hora_fim": "09:30:00"}
    h2 = requests.post(_url("/horarios/"), json=conflict_payload, headers=headers, timeout=10)
    assert h2.status_code == 400, h2.text


def test_horario_invalid_dia_semana_returns_422():
    headers = _auth_headers()
    ids = _create_school_entities(headers)

    invalid_payload = {
        "professor_id": ids["professor_id"],
        "disciplina_id": ids["disciplina_id"],
        "turma_id": ids["turma_id"],
        "turno_id": ids["turno_id"],
        "dia_semana": "notaday",
        "hora_inicio": "10:00:00",
        "hora_fim": "11:00:00",
        "sala": "301",
        "observacoes": "",
    }
    resp = requests.post(_url("/horarios/"), json=invalid_payload, headers=headers, timeout=10)
    assert resp.status_code == 422, resp.text


def test_login_wrong_password_fails():
    bad_login = requests.post(
        _url("/auth/login"),
        json={"username": ADMIN_USER, "senha": "wrong-pass"},
        timeout=10,
    )
    assert bad_login.status_code == 401
