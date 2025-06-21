"""
Service for handling file operations in the Dugong Classification system.
Provides file validation and storage functionality.
"""

from pathlib import Path
from fastapi import UploadFile, HTTPException
from core.config import MAX_FILE_SIZE, ALLOWED_EXTENSIONS, BASE_DIR
from core.logger import setup_logger

logger = setup_logger("file_service", "logs/file_service.log")

def validate_file(file: UploadFile, contents: bytes) -> None:
    """
    Validate uploaded file size and type.
    Raises HTTPException if validation fails.
    """
    if len(contents) > MAX_FILE_SIZE:
        logger.warning(f"File too large: {file.filename}")
        raise HTTPException(status_code=400, detail=f"File {file.filename} is too large")
    if Path(file.filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        logger.warning(f"Invalid extension: {file.filename}")
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}")

def save_file(file: UploadFile, contents: bytes, session_id: str) -> Path:
    """
    Save uploaded file to session directory.
    Returns path to saved file or raises HTTPException on error.
    """
    image_dir = BASE_DIR / session_id / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    file_path = image_dir / Path(file.filename).name
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
        logger.info(f"Saved file: {file_path}")
    except Exception as e:
        logger.error(f"Error saving file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    return file_path
