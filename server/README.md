# Intern MS — Server

Python FastAPI backend for the Intern Management System.

## Setup

```bash
cd server
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

Then open:

- API: http://127.0.0.1:8000
- Docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health
