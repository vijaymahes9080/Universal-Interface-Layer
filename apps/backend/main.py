import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .api.routes import router
from .engines.automation import automation_engine
from .config import HOST, PORT, DEBUG

app = FastAPI(
    title="Universal Interface Layer (UIL) Core Server",
    description="Intelligent orchestration engine, planning agents, and secure plugin routing REST APIs.",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router, prefix="/api")

@app.on_event("startup")
def startup_event():
    print("UIL Server Starting Up...")
    # 1. Initialize DB tables
    init_db()
    # 2. Start Automation clock loop
    automation_engine.start()

@app.on_event("shutdown")
def shutdown_event():
    print("UIL Server Shutting Down...")
    # Shutdown Automation clock loop
    automation_engine.stop()

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "Universal Interface Layer Core",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("apps.backend.main:app", host=HOST, port=PORT, reload=DEBUG)
