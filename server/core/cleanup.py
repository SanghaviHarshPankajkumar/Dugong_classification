# cleanup.py
"""
Manages automatic cleanup of expired session data and temporary files.
"""
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
import shutil
import json
from core.config import BASE_DIR
from core.logger import setup_logger

logger = setup_logger("cleanup", "logs/cleanup.log")

def is_session_expired(session_folder: Path, expiry_minutes: int = 15) -> bool:
    """
    Check if a session is expired based on its last activity.
    
    Args:
        session_folder: Path to the session folder
        expiry_minutes: Session expiry time in minutes (default: 15min)
        
    Returns:
        bool: True if session is expired, False otherwise
    """
    try:
        # Check if there's a session metadata file
        metadata_file = session_folder / "session_metadata.json"
        
        if metadata_file.exists():
            # Read last activity from metadata
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
                last_activity = datetime.fromisoformat(metadata.get('last_activity', ''))
                cutoff = datetime.utcnow() - timedelta(minutes=expiry_minutes)
                return last_activity < cutoff
        else:
            # If no metadata file, assume the session is expired for safety
            return True
                
    except (ValueError, KeyError, json.JSONDecodeError) as e:
        logger.warning(f"Error checking session expiry for {session_folder}: {e}")
        # If we can't determine expiry, assume it's expired for safety
        return True
    
    return False

def update_session_activity(session_id: str):
    """
    Update the last activity timestamp for a session.
    
    Args:
        session_id: The session identifier
    """
    try:
        # Find the session folder by exact session ID
        session_folder = BASE_DIR / session_id
        
        if not session_folder.exists() or not session_folder.is_dir():
            logger.warning(f"Session folder not found for ID: {session_id}")
            return
        
        # Update or create metadata file
        metadata_file = session_folder / "session_metadata.json"
        metadata = {
            'session_id': session_id,
            'last_activity': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        # If metadata file exists, preserve created_at
        if metadata_file.exists():
            try:
                with open(metadata_file, 'r') as f:
                    existing_metadata = json.load(f)
                    metadata['created_at'] = existing_metadata.get('created_at', metadata['created_at'])
            except (json.JSONDecodeError, KeyError):
                pass
        
        # Write updated metadata
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
            
        logger.info(f"Updated session activity for: {session_id}")
        
    except Exception as e:
        logger.error(f"Failed to update session activity for {session_id}: {e}")

async def cleanup_expired_sessions(interval_seconds: int = 300, expiry_minutes: int =15):
    """
    Monitor and remove expired session folders automatically.
    Only cleans up sessions that have actually expired based on their last activity.
    
    Args:
        interval_seconds: Cleanup interval (default: 300s / 5 minutes)
        expiry_minutes: Session expiry time (default: 30min)
    """
    logger.info(f"Cleanup service started - checking every {interval_seconds}s, expiry after {expiry_minutes}min of inactivity")
    
    while True:
        try:
            cleaned_count = 0
            
            for session_folder in BASE_DIR.iterdir():
                if not session_folder.is_dir():
                    continue
                
                # Check if session is expired
                if is_session_expired(session_folder, expiry_minutes):
                    try:
                        shutil.rmtree(session_folder)
                        logger.info(f"Deleted expired session folder: {session_folder.name}")
                        cleaned_count += 1
                    except Exception as e:
                        logger.error(f"Failed to delete {session_folder}: {e}")
            
            if cleaned_count > 0:
                logger.info(f"Cleanup completed - removed {cleaned_count} expired sessions")
            else:
                logger.debug("Cleanup completed - no expired sessions found")
                
        except Exception as e:
            logger.error(f"Error during cleanup cycle: {e}")
            
        await asyncio.sleep(interval_seconds)