# Project Manager (Flask + HTML)

A minimal project/task tracker with a Flask backend and vanilla HTML/JS frontend.

## Quick start

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python app.py  # starts http://127.0.0.1:5000
```

## Endpoints
- `GET /api/projects` — list projects
- `POST /api/projects` — create project `{ "name": str, "description": str? }`
- `GET /api/projects/<project_id>/tasks` — list tasks for a project
- `POST /api/projects/<project_id>/tasks` — create task `{ "title": str, "due_date": str?, "status": "todo"|"in-progress"|"done" }`
- `PATCH /api/tasks/<task_id>` — update task fields

## Notes
- Data is stored in a local SQLite database in `instance/project_manager.sqlite` (ignored by git so it stays private). Override path with `PROJECT_DB=/path/to/db.sqlite`.
- Frontend uses fetch to hit the API; no build step required.
