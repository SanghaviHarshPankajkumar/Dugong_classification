"""
Manages automatic cleanup of expired session data and temporary files.
"""
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
import shutil
import re
from core.config import BASE_DIR
from core.logger import setup_logger

logger = setup_logger("cleanup", "logs/cleanup.log")

# Matches timestamp-based folder names (format: YYYYMMDDTHHMMSSZ_*)
SESSION_REGEX = re.compile(r"^(\d{8}T\d{6}Z)_.+")

async def cleanup_expired_sessions(interval_seconds: int = 600, expiry_minutes: int = 60):
    """
    Monitor and remove expired session folders automatically.
    
    Args:
        interval_seconds: Cleanup interval (default: 3600s / 1 hour)
        expiry_minutes: Session expiry time (default: 60min)
    """
    logger.info("Cleanup service started")
    while True:
        now = datetime.utcnow()
        cutoff = now - timedelta(minutes=expiry_minutes)
        for session_folder in BASE_DIR.iterdir():
            if not session_folder.is_dir():
                continue
            match = SESSION_REGEX.match(session_folder.name)
            if not match:
                continue
            session_time = datetime.strptime(match.group(1), "%Y%m%dT%H%M%SZ")
            if session_time < cutoff:
                try:
                    shutil.rmtree(session_folder)
                    logger.info(f"Deleted expired session folder: {session_folder}")
                except Exception as e:
                    logger.error(f"Failed to delete {session_folder}: {e}")
        await asyncio.sleep(interval_seconds)
