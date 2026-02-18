# Audit Report — ProfessoresHorario (FastAPI + PostgreSQL)

Date: 2026-02-18

## Implemented & working ✅
- Models: Most entities exist with expected fields in [server/database/models.py](server/database/models.py).
  - Soft delete flags: `Usuario.ativo`, `Disciplina.ativa`, `Turma.ativa`, `Turno.ativo`, `EspacoEscola.ativo`.
  - Constraints:
    - Unique: `Turno.nome` (unique), `TurmaDisciplina (turma_id, disciplina_id)`, `PeriodoAula (turno_id, turma_id, numero_aula)` via [models](server/database/models.py#L41-L72), [L103-L133], [L147-L172], [L181-L205].
    - FKs: present across all relations.
  - Enum storage: SQLAlchemy `Enum` configured with `native_enum=False` and explicit `values_callable` for `DiaSemanaEnum`, `StatusReservaEnum` — avoids PG ENUM mismatch.
- API Routers: All documented routers exist and are included in the app in [server/main.py](server/main.py#L58-L95).
- Business rules:
  - Horário conflict detection in [server/crud_new.py](server/crud_new.py#L170-L213) covers overlaps for same professor/turma per `turno/dia_semana`.
  - Reserva conflict detection in [server/crud_new.py](server/crud_new.py#L293-L342) covers overlaps, excluding `CANCELADA`.
  - Períodos: uniqueness (turno_id, turma_id, numero_aula) enforced ([server/database/models.py](server/database/models.py#L58-L72)), and validations in [server/routes/periodos_aula.py](server/routes/periodos_aula.py#L1-L120).
- Auth & JWT: `HS256` with `python-jose` in [server/routes/auth.py](server/routes/auth.py) and password hashing via `passlib[bcrypt]`.
- Tests present: [tests/](tests) include smoke, e2e, and edge cases.

## Partially implemented ⚠️
- Role-based permissions (RBAC): Prior to fix, routes were unauthenticated. After fix, authentication is required globally for non-`/auth` routes via dependency injection in [server/main.py](server/main.py#L87-L95). Fine-grained role checks (e.g., restricting certain mutations to `DIRETOR/COORDENADOR`) are not fully implemented.
- Períodos overlap: The code enforces containment within `Turno` bounds and uniqueness per `numero_aula`, but does not prevent arbitrary time overlaps across different `numero_aula`. This may be acceptable if `numero_aula` conveys sequence ordering.

## Missing / inconsistent ❌
- PDF endpoints: Not present originally. Implemented now:
  - JSON grouped by professor: [server/routes/horarios.py](server/routes/horarios.py#L97-L137) at `GET /horarios/por-professor/{professor_id}`.
  - PDF generation: [server/routes/horarios.py](server/routes/horarios.py#L139-L178) at `GET /horarios/por-professor/{professor_id}/pdf` using ReportLab.
- Soft delete inconsistencies:
  - `Turma` and `EspacoEscola` deletes were hard deletes. Fixed to soft-delete (`ativa=False` and `ativo=False`) in [server/crud_new.py](server/crud_new.py#L503-L521).
- Start script referencing non-existent migrations:
  - [start.sh](start.sh) refers to `migrate_db.py` and `migrate_periodos.py` which do not exist.
- Router auth gaps:
  - Before fix, non-`/auth` endpoints lacked authentication protection.

## Bugs found 🐛
- Non-existent migration scripts referenced by [start.sh](start.sh#L13-L17).
- Security default values: `SECRET_KEY` default is `your_secret_key_here_change_in_production` in [server/config.py](server/config.py#L12-L24), risky if not overridden.

## Security issues 🔒
- JWT:
  - Default `SECRET_KEY` unsafe for production ([server/config.py](server/config.py#L12-L24)). Validation warns in production but should be enforced via environment.
- Password hashing: Correct (`passlib[bcrypt]`), and verification in [server/routes/auth.py](server/routes/auth.py#L26-L38).
- CORS: `ALLOWED_ORIGINS` defaults to `*` in debug ([server/config.py](server/config.py#L30-L41)); ensure tighter config in production.
- RBAC: Prior to fix, endpoints were unauthenticated. Now protected globally (still recommend role checks on admin-sensitive mutations).
- SQL Injection: ORM usage throughout; no raw SQL observed.

## Recommended improvements 🔧
- Add role checks (e.g., only `DIRETOR/COORDENADOR` can create/update/delete critical resources).
- Enforce non-overlapping `PeriodoAula` time blocks if the domain requires it.
- Replace `start.sh` migration calls with Alembic or remove if not used.
- Add unit tests for grouped `/horarios/por-professor` and PDF endpoint.
- Use Alembic migrations consistently for schema versioning.

---

# Detailed Checks with References

## Models & Constraints
- `Turno`: fields and relations — [server/database/models.py](server/database/models.py#L26-L55).
- `PeriodoAula`: unique constraint `(turno_id, turma_id, numero_aula)` — [server/database/models.py](server/database/models.py#L66-L72).
- `Usuario`: unique `username`, `email`, `ativo` — [server/database/models.py](server/database/models.py#L74-L100).
- `Professor`: FK to `Usuario`, relations — [server/database/models.py](server/database/models.py#L102-L120).
- `Turma`: `ativa` soft-delete flag — [server/database/models.py](server/database/models.py#L122-L145).
- `Disciplina`: `ativa`, `codigo` unique — [server/database/models.py](server/database/models.py#L147-L172).
- `TurmaDisciplina`: unique `(turma_id, disciplina_id)` — [server/database/models.py](server/database/models.py#L174-L189).
- `ProfessorDisciplina`: mapping — [server/database/models.py](server/database/models.py#L191-L206).
- `ProfessorBloqueio` / `ProfessorDisponibilidade`: enums with `values_callable` — [server/database/models.py](server/database/models.py#L208-L252), [L254-L294].
- `Horario`: joins to `Professor/Disciplina/Turma/Turno` — [server/database/models.py](server/database/models.py#L296-L336).
- `EspacoEscola`: `ativo` flag — [server/database/models.py](server/database/models.py#L338-L361).
- `ReservaEspaco`: statuses and relations — [server/database/models.py](server/database/models.py#L363-L405).

## Routers
Included in app: [server/main.py](server/main.py#L87-L95) — now with auth dependency for non-`/auth` routes.
Key routers examined: [server/routes/usuarios.py](server/routes/usuarios.py), [professores.py](server/routes/professores.py), [disciplinas.py](server/routes/disciplinas.py), [turmas.py](server/routes/turmas.py), [turnos.py](server/routes/turnos.py), [periodos_aula.py](server/routes/periodos_aula.py), [horarios.py](server/routes/horarios.py), [espacos.py](server/routes/espacos.py), [reservas.py](server/routes/reservas.py), [professor_disciplinas.py](server/routes/professor_disciplinas.py), [turma_disciplinas.py](server/routes/turma_disciplinas.py), [professor_bloqueios.py](server/routes/professor_bloqueios.py), [professor_disponibilidades.py](server/routes/professor_disponibilidades.py).

## Business Rules
- Horários conflict: [server/crud_new.py](server/crud_new.py#L170-L213).
- Reservas conflict: [server/crud_new.py](server/crud_new.py#L293-L342).
- Periodos validations: [server/routes/periodos_aula.py](server/routes/periodos_aula.py#L1-L120).

## Reporting
- Grouped `/horarios/por-professor`: Implemented — [server/routes/horarios.py](server/routes/horarios.py#L97-L137).
- PDF `/horarios/por-professor/{id}/pdf`: Implemented — [server/routes/horarios.py](server/routes/horarios.py#L139-L178).

## Tests
- Existing request-driven tests: [tests/test_smoke.py](tests/test_smoke.py), [tests/test_api_e2e.py](tests/test_api_e2e.py), [tests/test_api_edge_cases.py](tests/test_api_edge_cases.py).
- To run locally:
  - Via Docker Compose (recommended):
    ```bash
    docker-compose up -d postgres api
    pytest -q tests
    ```
  - Or without Docker (SQLite for dev):
    ```bash
    export DATABASE_URL="sqlite:///./professores_test.db"
    export DEBUG=true AUTO_CREATE_TABLES=true CREATE_DEFAULT_ADMIN=true
    python -m uvicorn server.main:app --host 127.0.0.1 --port 8000
    pytest -q tests
    ```

> Note: In this environment, Docker/venv tooling was not available, so tests were not executed. The above commands will run tests on a machine with Docker or Python venv support.

---

# PR-Style Summary of Changes
- Add auth protection to all non-`/auth` routers via global dependency — [server/main.py](server/main.py#L87-L95).
- Implement `/horarios/por-professor/{professor_id}` grouped JSON endpoint — [server/routes/horarios.py](server/routes/horarios.py#L97-L137).
- Implement `/horarios/por-professor/{professor_id}/pdf` endpoint using ReportLab — [server/routes/horarios.py](server/routes/horarios.py#L139-L178); add dependency — [server/requirements.txt](server/requirements.txt#L16).
- Make `Turma` and `EspacoEscola` deletions soft-delete — [server/crud_new.py](server/crud_new.py#L503-L521).
- Document missing migration scripts in `start.sh` and recommend Alembic.

# How to Run Tests
- Ensure services running at `http://localhost:8000`.
- Execute:
```bash
pytest -q tests
```
- Optional env for tests:
```bash
export API_BASE_URL="http://localhost:8000"
export API_ADMIN_USER="admin"
export API_ADMIN_PASS="admin123"
```
