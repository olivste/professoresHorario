import os
import time
import uuid

import requests

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
ADMIN_USER = os.getenv("API_ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("API_ADMIN_PASS", "admin123")


def _url(path: str) -> str:
    return f"{BASE_URL}{path}"


def _login() -> str:
    resp = requests.post(
        _url("/auth/login"),
        json={"username": ADMIN_USER, "senha": ADMIN_PASS},
        timeout=10,
    )
    assert resp.status_code == 200, f"login failed: {resp.text}"
    token = resp.json().get("access_token")
    assert token, f"missing token in response: {resp.text}"
    return token


def test_healthcheck():
    resp = requests.get(_url("/health"), timeout=5)
    assert resp.status_code == 200
    assert resp.json().get("status") == "healthy"


def test_auth_me_and_user_crud():
    token = _login()
    headers = {"Authorization": f"Bearer {token}"}

    # me endpoint
    me = requests.get(_url("/auth/me"), headers=headers, timeout=10)
    assert me.status_code == 200, me.text
    me_json = me.json()
    assert me_json.get("username") == ADMIN_USER

    # create user with unique email/username
    suffix = f"{int(time.time())}-{uuid.uuid4().hex[:6]}"
    new_user_payload = {
        "nome": "Teste Automatizado",
        "username": f"auto-{suffix}",
        "email": f"auto-{suffix}@example.com",
        "telefone": "(11) 90000-0000",
        "role": "PROFESSOR",
        "senha": "senha123",
        "ativo": True,
    }
    created = requests.post(
        _url("/usuarios/"), json=new_user_payload, headers=headers, timeout=10
    )
    assert created.status_code == 200, created.text
    created_json = created.json()
    user_id = created_json.get("id")
    assert user_id, created.text

    # fetch created user
    fetched = requests.get(_url(f"/usuarios/{user_id}"), headers=headers, timeout=10)
    assert fetched.status_code == 200, fetched.text
    assert fetched.json().get("username") == new_user_payload["username"]

    # deactivate user
    deleted = requests.delete(_url(f"/usuarios/{user_id}"), headers=headers, timeout=10)
    assert deleted.status_code == 200, deleted.text


def test_list_turnos_and_disciplinas():
    token = _login()
    headers = {"Authorization": f"Bearer {token}"}

    turnos = requests.get(
        _url("/turnos/"), headers=headers, params={"skip": 0, "limit": 10}, timeout=10
    )
    assert turnos.status_code == 200, turnos.text
    assert isinstance(turnos.json(), list)

    disciplinas = requests.get(
        _url("/disciplinas/"),
        headers=headers,
        params={"skip": 0, "limit": 10, "ativas_apenas": True},
        timeout=10,
    )
    assert disciplinas.status_code == 200, disciplinas.text
    assert isinstance(disciplinas.json(), list)
