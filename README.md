# Intern Management System

Monorepo for the InkDot internship platform.

## Structure

- `client/` — Next.js frontend
- `server/` — FastAPI Python backend

## Quick start

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
