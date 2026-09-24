import logging
from app.database.session import engine
from app.database.base import Base
# Import all models so metadata knows about them
import app.models  # noqa: F401

logger = logging.getLogger("sla_guardian.database")

def init_db() -> None:
    """Create all database tables."""
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")

if __name__ == "__main__":
    init_db()
