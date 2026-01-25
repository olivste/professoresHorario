import os
from dotenv import load_dotenv

load_dotenv()


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = _as_bool(os.getenv("DEBUG"), default=ENVIRONMENT != "production")

DEFAULT_SECRET_KEY = "your_secret_key_here_change_in_production"
SECRET_KEY = os.getenv("SECRET_KEY", DEFAULT_SECRET_KEY)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres123@localhost:5432/professores_db",
)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
if not ALLOWED_ORIGINS and DEBUG:
    ALLOWED_ORIGINS = ["*"]

AUTO_CREATE_TABLES = _as_bool(os.getenv("AUTO_CREATE_TABLES"), default=DEBUG)
CREATE_DEFAULT_ADMIN = _as_bool(os.getenv("CREATE_DEFAULT_ADMIN"), default=DEBUG)
DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@example.com")


def validate_settings() -> None:
    if not DEBUG and SECRET_KEY == DEFAULT_SECRET_KEY:
        raise RuntimeError("SECRET_KEY must be set in production.")
    if not DEBUG and CREATE_DEFAULT_ADMIN and DEFAULT_ADMIN_PASSWORD == "admin123":
        raise RuntimeError("Default admin password must be changed in production.")
    if CREATE_DEFAULT_ADMIN and not DEFAULT_ADMIN_PASSWORD:
        raise RuntimeError("DEFAULT_ADMIN_PASSWORD must be set when creating admin.")
    if CREATE_DEFAULT_ADMIN and not DEFAULT_ADMIN_EMAIL:
        raise RuntimeError("DEFAULT_ADMIN_EMAIL must be set when creating admin.")
