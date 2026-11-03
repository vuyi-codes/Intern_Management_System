from fastapi import FastAPI

app = FastAPI(
    title="Intern MS API",
    description="Backend API for the Intern Management System",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "Hello World"}


@app.get("/health")
def health():
    return {"status": "ok"}
