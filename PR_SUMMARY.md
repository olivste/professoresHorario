# PR Summary — Backend fixes and reporting

## Changes
- Global auth protection for all non-auth routers in server/main.py.
- New reporting endpoints in server/routes/horarios.py:
  - `GET /horarios/por-professor/{professor_id}` — grouped JSON.
  - `GET /horarios/por-professor/{professor_id}/pdf` — PDF report via ReportLab.
- Soft delete fixes in server/crud_new.py:
  - `delete_turma` sets `ativa=False`.
  - `delete_espaco_escola` sets `ativo=False`.
- Added `reportlab` to server/requirements.txt.

## Rationale
- Align with documentation claiming grouped professor reports and PDF generation.
- Enforce authentication across the API.
- Ensure consistent soft delete semantics for core entities.

## Testing
- Use Docker Compose (`postgres`, `api`) and run `pytest -q tests` against live API.
- Alternatively run locally with SQLite by setting `DATABASE_URL` to `sqlite:///./professores_test.db` and starting uvicorn.

## Follow-ups
- Implement fine-grained RBAC (roles) on mutation endpoints.
- Replace `start.sh` migration placeholders with Alembic or remove.
- Add unit tests for the new grouped JSON and PDF endpoints.
