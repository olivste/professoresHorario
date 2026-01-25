import os
import uuid
import datetime as dt
import requests

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
ADMIN_USER = os.getenv("API_ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("API_ADMIN_PASS", "admin123")


def _url(path: str) -> str:
    return f"{BASE_URL}{path}"


def _login_and_me():
    resp = requests.post(
        _url("/auth/login"),
        json={"username": ADMIN_USER, "senha": ADMIN_PASS},
        timeout=10,
    )
    assert resp.status_code == 200, resp.text
    token = resp.json().get("access_token")
    assert token, resp.text
    headers = {"Authorization": f"Bearer {token}"}

    me = requests.get(_url("/auth/me"), headers=headers, timeout=10)
    assert me.status_code == 200, me.text
    user = me.json()
    return headers, user["id"]


def test_e2e_full_api_flow():
    headers, admin_id = _login_and_me()
    suffix = uuid.uuid4().hex[:8]

    # Turno
    turno_payload = {
        "nome": f"Matutino-{suffix}",
        "hora_inicio": "07:00:00",
        "hora_fim": "12:00:00",
        "descricao": "Turno teste automatizado",
        "ativo": True,
    }
    turno_resp = requests.post(_url("/turnos/"), json=turno_payload, headers=headers, timeout=10)
    assert turno_resp.status_code in (200, 201), turno_resp.text
    turno = turno_resp.json()
    turno_id = turno["id"]

    # Disciplina
    disc_payload = {
        "nome": f"Mat-{suffix}",
        "codigo": f"MAT-{suffix}",
        "carga_horaria_semanal": 2,
        "descricao": "Disciplina teste",
        "ativa": True,
    }
    disc_resp = requests.post(_url("/disciplinas/"), json=disc_payload, headers=headers, timeout=10)
    assert disc_resp.status_code == 200, disc_resp.text
    disc_id = disc_resp.json()["id"]

    # Turma
    turma_payload = {
        "nome": f"1A-{suffix}",
        "ano": "1º",
        "turno_id": turno_id,
        "curso": "Ensino Médio",
        "ativa": True,
    }
    turma_resp = requests.post(_url("/turmas/"), json=turma_payload, headers=headers, timeout=10)
    assert turma_resp.status_code == 200, turma_resp.text
    turma_id = turma_resp.json()["id"]

    # Professor (com usuário novo)
    prof_payload = {
        "departamento": "Matemática",
        "especializacao": "Cálculo",
        "carga_horaria_semanal": 20,
        "observacoes": "Disponível manhã",
        "usuario": {
            "nome": f"Professor {suffix}",
            "username": f"prof-{suffix}",
            "email": f"prof-{suffix}@example.com",
            "telefone": "(11) 98888-0000",
            "role": "PROFESSOR",
            "senha": "senha123",
            "ativo": True,
        },
    }
    prof_resp = requests.post(_url("/professores/"), json=prof_payload, headers=headers, timeout=10)
    assert prof_resp.status_code == 200, prof_resp.text
    prof_id = prof_resp.json()["id"]

    # Professor-Disciplina vínculo
    prof_disc_payload = {"professor_id": prof_id, "disciplina_id": disc_id, "carga_horaria": 2}
    prof_disc_resp = requests.post(_url("/professor-disciplinas"), json=prof_disc_payload, headers=headers, timeout=10)
    assert prof_disc_resp.status_code == 200, prof_disc_resp.text

    # Período de aula
    periodo_payload = {
        "turno_id": turno_id,
        "turma_id": turma_id,
        "numero_aula": 1,
        "hora_inicio": "07:00:00",
        "hora_fim": "07:50:00",
        "tipo": "AULA",
        "descricao": "1a aula",
        "ativo": True,
    }
    periodo_resp = requests.post(_url("/periodos-aula"), json=periodo_payload, headers=headers, timeout=10)
    assert periodo_resp.status_code == 200, periodo_resp.text
    periodo_id = periodo_resp.json()["id"]

    list_periodos = requests.get(
        _url("/periodos-aula"), headers=headers, params={"turno_id": turno_id, "turma_id": turma_id}, timeout=10
    )
    assert list_periodos.status_code == 200, list_periodos.text
    assert any(p["id"] == periodo_id for p in list_periodos.json())

        # Horário
    horario_payload = {
        "professor_id": prof_id,
        "disciplina_id": disc_id,
        "turma_id": turma_id,
        "turno_id": turno_id,
            "dia_semana": "segunda",
        "hora_inicio": "07:00:00",
        "hora_fim": "07:50:00",
        "sala": "101",
        "observacoes": "Teste",
    }
    horario_resp = requests.post(_url("/horarios/"), json=horario_payload, headers=headers, timeout=10)
    assert horario_resp.status_code == 200, horario_resp.text
    horario_id = horario_resp.json()["id"]

    horarios_list = requests.get(_url("/horarios/"), headers=headers, timeout=10)
    assert horarios_list.status_code == 200, horarios_list.text
    assert any(h["id"] == horario_id for h in horarios_list.json())

    # Espaço escolar
    espaco_payload = {
        "nome": f"Aud-{suffix}",
        "codigo": f"AUD-{suffix}",
        "capacidade": 50,
        "descricao": "Auditório teste",
        "ativo": True,
        "requer_aprovacao": False,
    }
    espaco_resp = requests.post(_url("/espacos/"), json=espaco_payload, headers=headers, timeout=10)
    assert espaco_resp.status_code == 200, espaco_resp.text
    espaco_id = espaco_resp.json()["id"]

    espaco_get = requests.get(_url(f"/espacos/{espaco_id}"), headers=headers, timeout=10)
    assert espaco_get.status_code == 200, espaco_get.text

    # Reserva de espaço
    reserva_payload = {
        "espaco_id": espaco_id,
        "data_reserva": (dt.date.today() + dt.timedelta(days=1)).isoformat(),
        "hora_inicio": "09:00:00",
        "hora_fim": "10:00:00",
        "finalidade": "Reunião",
        "observacoes": "Automatizado",
    }
    reserva_resp = requests.post(
        _url("/reservas"),
        params={"solicitante_id": admin_id},
        json=reserva_payload,
        headers=headers,
        timeout=10,
    )
    assert reserva_resp.status_code == 200, reserva_resp.text
    reserva_id = reserva_resp.json()["id"]

    status_resp = requests.put(
        _url(f"/reservas/{reserva_id}/status"),
        params={"status": "aprovada", "aprovador_id": admin_id},
        headers=headers,
        timeout=10,
    )
    assert status_resp.status_code == 200, status_resp.text

    # Delete some resources to ensure DELETE works
    del_reserva = requests.delete(_url(f"/reservas/{reserva_id}"), headers=headers, timeout=10)
    assert del_reserva.status_code == 200, del_reserva.text

    del_horario = requests.delete(_url(f"/horarios/{horario_id}"), headers=headers, timeout=10)
    assert del_horario.status_code == 200, del_horario.text

    del_espaco = requests.delete(_url(f"/espacos/{espaco_id}"), headers=headers, timeout=10)
    assert del_espaco.status_code == 200, del_espaco.text

    del_turno = requests.delete(_url(f"/turnos/{turno_id}"), headers=headers, timeout=10)
    assert del_turno.status_code in (200, 204), del_turno.text
