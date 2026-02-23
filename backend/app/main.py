"""CohortSec - Platform Predictive Data Protection. FastAPI main app."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1 import router as api_v1_router
from app.core.config import get_settings
from app.core.database import init_db
from app.core.limiter import limiter
from app.core.security import hash_password
from app.middleware.security import SecurityHeadersMiddleware
from app.models.user import User

settings = get_settings()
logging.basicConfig(
    level=logging.INFO if settings.debug else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def create_admin_if_not_exists():
    """Create default admin user (admin/admin) only if CREATE_DEFAULT_ADMIN=true and no users exist."""
    if not settings.create_default_admin:
        return
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin = User(
                email="admin@example.com",
                username="admin",
                full_name="Administrator",
                hashed_password=hash_password("admin"),
                is_superuser=True,
                is_active=True,
            )
            db.add(admin)
            db.commit()
            logger.warning(
                "Created default admin user (admin/admin). Change password immediately. "
                "Set CREATE_DEFAULT_ADMIN=false for production."
            )
    except Exception as e:
        logger.exception("Failed to create admin: %s", e)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    init_db()
    create_admin_if_not_exists()
    yield
    # Shutdown
    pass


app = FastAPI(
    title=settings.project_name,
    description="Predictive Data Protection Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Rate limiting: default 120/min for all API; auth has stricter limits
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


@app.get("/health")
@limiter.exempt
def health():
    """Health check for load balancer / Kubernetes. Verifies DB and Redis."""
    status = {"status": "ok", "checks": {}}
    try:
        from app.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        status["checks"]["db"] = "ok"
    except Exception as e:
        status["checks"]["db"] = f"error: {str(e)}"
        status["status"] = "degraded"
    try:
        import redis
        r = redis.from_url(settings.redis_url)
        r.ping()
        status["checks"]["redis"] = "ok"
    except Exception as e:
        status["checks"]["redis"] = f"error: {str(e)}"
        status["status"] = "degraded"
    return status


# Security headers first (outer middleware = last in chain = runs first)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router)
