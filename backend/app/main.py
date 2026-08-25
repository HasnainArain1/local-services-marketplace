"""
FastAPI application entrypoint — Local Services Marketplace Backend.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, categories, providers, requests, messages, reviews, admin, support

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)

app = FastAPI(
    title="Local Services Marketplace API",
    description=(
        "Backend API for the Local Services Marketplace — connects customers "
        "with service providers via AI-powered matching, quoting, and reviews."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow all origins during development; tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request, call_next):
    """Log all incoming HTTP requests and their status codes to terminal."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    print(f"--> [{request.method}] {request.url.path} from {client_ip}", flush=True)
    response = await call_next(request)
    print(f"<-- [{request.method}] {request.url.path} -> Status {response.status_code}", flush=True)
    return response


@app.on_event("startup")
def seed_default_categories():
    """Seed 10 finalized service categories if database is empty or missing any."""
    try:
        from app.core.database import SessionLocal
        from app.models.category import Category
        db = SessionLocal()
        DEFAULT_CATEGORIES = [
            {"name": "AC Repair & Installation", "description": "Repairing, servicing, gas refill, and installing air conditioners, split units, and window ACs."},
            {"name": "Plumbing", "description": "Fixing leaks, pipe repairs, water tank installation, drainage issues, bathroom fittings."},
            {"name": "Electrical Work", "description": "Wiring, switchboard repair, fan/light installation, short circuits, generator/UPS issues."},
            {"name": "Appliance Repair", "description": "Repairing fridges, washing machines, microwaves, water dispensers, and other home appliances."},
            {"name": "Home Cleaning", "description": "Full house cleaning, deep cleaning, sofa/carpet cleaning, post-construction cleaning."},
            {"name": "Pest Control", "description": "Termite, cockroach, mosquito, and rodent control treatments for homes and shops."},
            {"name": "Carpentry", "description": "Furniture repair, custom woodwork, door/window fitting, wardrobe installation."},
            {"name": "Painting & Wall Work", "description": "Interior/exterior wall painting, texture work, wallpaper installation."},
            {"name": "Tutoring & Academic Help", "description": "Home tutors for school/college subjects, exam prep, language learning."},
            {"name": "Moving & Shifting", "description": "House shifting, furniture moving, packing services."},
        ]
        for item in DEFAULT_CATEGORIES:
            existing = db.query(Category).filter(Category.name == item["name"]).first()
            if not existing:
                cat = Category(name=item["name"], description=item["description"])
                db.add(cat)
        db.commit()
        db.close()
    except Exception as e:
        print(f"Category seeding note: {e}")


# Register routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(providers.router)
app.include_router(requests.router)
app.include_router(messages.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(support.router)


@app.get("/", tags=["Health"])
def health_check():
    """Root health check endpoint."""
    return {
        "status": "healthy",
        "service": "Local Services Marketplace API",
        "version": "1.0.0",
    }
