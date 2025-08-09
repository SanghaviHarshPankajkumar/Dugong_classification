"""
Core configuration settings for file handling and model parameters.
"""
from pathlib import Path

BASE_DIR= Path("/tmp").resolve()  / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

