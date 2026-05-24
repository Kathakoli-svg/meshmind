from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import Base, engine
from routes import auth_routes, donate_routes, items_routes, request_routes, dashboard_routes

# Create all DB tables
Base.metadata.create_all(bind=engine)

# Create uploads dir
os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="SocLoop API", version="1.0.0")

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (serve uploaded images) ─────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(donate_routes.router, tags=["Donate"])
app.include_router(items_routes.router, tags=["Items"])
app.include_router(request_routes.router, tags=["Requests"])
app.include_router(dashboard_routes.router, tags=["Dashboard"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "SocLoop API is running"}