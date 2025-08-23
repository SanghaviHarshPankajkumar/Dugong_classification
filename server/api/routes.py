from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime, timedelta
import shutil
import json
import logging
import io
import csv
import re
from typing import List
from core.config import BASE_DIR
from schemas.request import MoveImageRequest
def _run_model_on_images_lazy():
    from services.model_service import run_model_on_images  # type: ignore
    return run_model_on_images

router = APIRouter()
logger = logging.getLogger(__name__)

SESSION_TIMEOUT_MINUTES = 30

def extract_captured_date(image_name: str) -> str:
    """
    Extract captured date from image filename.
    Looks for pattern _YYYYMMDD in the filename.
    Returns formatted date or 'N/A' if not found.
    """
    # Regular expression to match the pattern after first underscore with 8 digits (assumed to be YYYYMMDD)
    match = re.search(r'_(\d{8})', image_name)
    
    if not match:
        return "N/A"
    
    raw_date = match.group(1)
    year = raw_date[:4]
    month = raw_date[4:6]
    day = raw_date[6:8]
    
    # Basic date validation
    try:
        date_object = datetime(int(year), int(month), int(day))
        return f"{day}/{month}/{year}"
    except ValueError:
        return "N/A"


class BackfillResponse(BaseModel):
    message: str
    added_files: List[str]


@router.post("/upload-multiple/")
async def upload_multiple(session_id: str = Form(...), files: List[UploadFile] = File(...)):
    """Upload multiple images to a local session folder and run detection."""
    try:
        session_dir = BASE_DIR / session_id / "images"
        session_dir.mkdir(parents=True, exist_ok=True)

        metadata_path = BASE_DIR / session_id / "session_metadata.json"
        if metadata_path.exists():
            with open(metadata_path, "r") as f:
                metadata = json.load(f)
        else:
            metadata = {"images": {}}

        saved_paths = []
        file_names = []
        for file in files:
            file_path = session_dir / file.filename
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())
            saved_paths.append(file_path)
            file_names.append(file.filename)

        # Run detection in batch (lazy import to avoid heavy startup costs)
        run_model_on_images = _run_model_on_images_lazy()
        results = run_model_on_images(saved_paths, session_id)
        for filename, (dugong_count, calf_count, image_class, _) in zip(file_names, results):
            metadata["images"][filename] = {
                "dugongCount": dugong_count,
                "motherCalfCount": calf_count,
                "imageClass": image_class,
                "capturedDate": extract_captured_date(filename),
                "uploadedAt": datetime.utcnow().isoformat()
            }

        metadata["last_activity"] = datetime.utcnow().isoformat()
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=4)

        return {"message": f"Uploaded {len(files)} files and updated session metadata."}

    except Exception as e:
        logger.error(f"[Error in upload-multiple] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session-status/{session_id}")
async def session_status(session_id: str):
    """Check session status locally."""
    try:
        session_dir = BASE_DIR / session_id
        if not session_dir.exists():
            raise HTTPException(status_code=404, detail="Session not found")

        metadata_path = session_dir / "session_metadata.json"
        if not metadata_path.exists():
            raise HTTPException(status_code=404, detail="Metadata not found")

        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        last_activity = datetime.fromisoformat(metadata.get("last_activity"))
        time_elapsed = datetime.utcnow() - last_activity
        time_remaining = max(timedelta(minutes=SESSION_TIMEOUT_MINUTES) - time_elapsed, timedelta())

        return {
            "timeRemaining": int(time_remaining.total_seconds()),
            "metadata": metadata
        }

    except Exception as e:
        logger.error(f"[Error in session-status] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cleanup-sessions/{user_email}")
async def cleanup_sessions(user_email: str):
    """Delete all local session folders for a given user."""
    try:
        deleted_sessions = []
        
        # Since we can't import from auth.login here due to circular imports,
        # we'll rely on the frontend to pass the session ID or use a different approach
        # For now, we'll clean up any session folders that might exist
        # The frontend should call cleanup-session/{session_id} instead
        
        return {"deleted_sessions": deleted_sessions, "message": "Use cleanup-session/{session_id} endpoint for specific session cleanup"}

    except Exception as e:
        logger.error(f"[Error in cleanup-sessions] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cleanup-session/{session_id}")
async def cleanup_session_by_id(session_id: str):
    """Delete a specific session folder by session ID."""
    try:
        session_dir = BASE_DIR / session_id
        if not session_dir.exists():
            return {"message": f"Session {session_id} not found"}

        if not session_dir.is_dir():
            raise HTTPException(status_code=400, detail=f"{session_id} is not a directory")

        shutil.rmtree(session_dir)

        # Also remove the session_id from any user documents that might have it
        from auth.login import client, user_collection
        if client and user_collection:
            user_collection.update_many(
                {"session_id": session_id},
                {"$unset": {"session_id": ""}}
            )

        return {"message": f"Session {session_id} deleted successfully"}

    except Exception as e:
        logger.error(f"[Error in cleanup-session] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cleanup-session-beacon")
async def cleanup_session_beacon(session_id: str = Form(...), source: str = Form("tab_close")):
    """
    Handle session cleanup via navigator.sendBeacon during tab close.
    This endpoint is designed to be more reliable during page unload.
    """
    try:
        logger.info(f"[Beacon Cleanup] Received cleanup request for session {session_id} from {source}")
        logger.info(f"[Beacon Cleanup] BASE_DIR: {BASE_DIR}")
        logger.info(f"[Beacon Cleanup] Session directory path: {BASE_DIR / session_id}")
        
        session_dir = BASE_DIR / session_id
        if not session_dir.exists():
            logger.info(f"[Beacon Cleanup] Session {session_id} not found, nothing to cleanup")
            logger.info(f"[Beacon Cleanup] Directory does not exist: {session_dir}")
            return {"message": f"Session {session_id} not found"}

        if not session_dir.is_dir():
            logger.warning(f"[Beacon Cleanup] {session_id} is not a directory")
            return {"message": f"{session_id} is not a directory"}

        # Log what we're about to delete
        logger.info(f"[Beacon Cleanup] About to delete session directory: {session_dir}")
        logger.info(f"[Beacon Cleanup] Directory contents before deletion:")
        try:
            for item in session_dir.rglob('*'):
                logger.info(f"[Beacon Cleanup]   {item}")
        except Exception as e:
            logger.warning(f"[Beacon Cleanup] Could not list directory contents: {e}")

        # Delete the session directory
        shutil.rmtree(session_dir)
        logger.info(f"[Beacon Cleanup] Successfully deleted session directory: {session_id}")

        # Verify deletion
        if session_dir.exists():
            logger.error(f"[Beacon Cleanup] FAILED: Session directory still exists after deletion: {session_dir}")
        else:
            logger.info(f"[Beacon Cleanup] SUCCESS: Session directory confirmed deleted: {session_dir}")

        # Also remove the session_id from any user documents that might have it
        try:
            from auth.login import client, user_collection
            if client and user_collection:
                result = user_collection.update_many(
                    {"session_id": session_id},
                    {"$unset": {"session_id": ""}}
                )
                logger.info(f"[Beacon Cleanup] Updated {result.modified_count} user documents")
        except Exception as user_update_error:
            logger.warning(f"[Beacon Cleanup] Failed to update user documents: {user_update_error}")

        return {"message": f"Session {session_id} cleaned up successfully via beacon"}

    except Exception as e:
        logger.error(f"[Beacon Cleanup Error] {e}")
        logger.error(f"[Beacon Cleanup Error] Exception type: {type(e)}")
        logger.error(f"[Beacon Cleanup Error] Exception details: {str(e)}")
        # For beacon requests, we return success even on error to avoid blocking the unload
        return {"message": f"Cleanup attempted for session {session_id}"}



# @router.post("/move-to-false-positive/")
# async def move_to_false_positive(request: MoveImageRequest):
#     """Move an image between classification folders locally."""
#     try:
#         session_dir = BASE_DIR / request.sessionId
#         metadata_path = session_dir / "session_metadata.json"

#         if not metadata_path.exists():
#             raise HTTPException(status_code=404, detail="Session metadata not found.")

#         with open(metadata_path, "r") as f:
#             metadata = json.load(f)

#         if request.imageName not in metadata["images"]:
#             raise HTTPException(status_code=404, detail="Image not found in metadata.")

#         # Toggle classification and only update metadata.
#         # Images are stored under `<session>/images/` (not per-class folders),
#         # so we simply flip the class flag in metadata without moving files.
#         current_class = metadata["images"][request.imageName]["imageClass"].lower()
#         opposite_class = "feeding" if current_class == "resting" else "resting"

#         metadata["images"][request.imageName]["imageClass"] = opposite_class
#         metadata["images"][request.imageName]["updatedAt"] = datetime.utcnow().isoformat()

#         with open(metadata_path, "w") as f:
#             json.dump(metadata, f, indent=4)

#         return {"message": f"Moved {request.imageName} to {opposite_class}."}

#     except Exception as e:
#         logger.error(f"[Error in move-to-false-positive] {e}")
#         raise HTTPException(status_code=500, detail=str(e))


@router.post("/backfill-detections/{session_id}")
async def backfill_detections(session_id: str):
    """Run detection on any missing local images and update metadata."""
    try:
        session_dir = BASE_DIR / session_id / "images"
        metadata_path = BASE_DIR / session_id / "session_metadata.json"

        if not metadata_path.exists():
            raise HTTPException(status_code=404, detail="Session metadata not found.")

        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        processed_files = set(metadata.get("images", {}).keys())
        all_files = {f.name for f in session_dir.iterdir() if f.is_file()}
        missing_files = all_files - processed_files

        if not missing_files:
            return BackfillResponse(message="No missing files to backfill.", added_files=[])

        missing_paths = [session_dir / fname for fname in missing_files]
        run_model_on_images = _run_model_on_images_lazy()
        results = run_model_on_images(missing_paths, session_id)

        for file_name, (dugong_count, calf_count, image_class, _) in zip(missing_files, results):
            total_count = dugong_count + 2 * calf_count
            metadata["images"][file_name] = {
                "dugongCount": dugong_count,
                "motherCalfCount": calf_count,
                "imageClass": image_class,
                "capturedDate": extract_captured_date(file_name),
                "totalCount": total_count,
                "uploadedAt": datetime.utcnow().isoformat()
            }

        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=4)

        return BackfillResponse(
            message=f"Backfilled {len(missing_files)} missing files.",
            added_files=list(missing_files)
        )

    except Exception as e:
        logger.error(f"[Error in backfill-detections] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete-image/{session_id}/{image_name}")
async def delete_image(session_id: str, image_name: str):
    """Delete an image from the session folder and remove it from metadata."""
    try:
        session_dir = BASE_DIR / session_id
        metadata_path = session_dir / "session_metadata.json"
        image_path = session_dir / "images" / image_name

        # Check if session and metadata exist
        if not session_dir.exists():
            raise HTTPException(status_code=404, detail="Session not found")
        
        if not metadata_path.exists():
            raise HTTPException(status_code=404, detail="Session metadata not found")

        # Load metadata
        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        # Check if image exists in metadata
        if image_name not in metadata.get("images", {}):
            raise HTTPException(status_code=404, detail="Image not found in metadata")

        # Delete the image file if it exists
        if image_path.exists():
            image_path.unlink()
            logger.info(f"Deleted image file: {image_path}")

        # Remove from metadata
        del metadata["images"][image_name]
        
        # Update last activity
        metadata["last_activity"] = datetime.utcnow().isoformat()

        # Save updated metadata
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=4)

        logger.info(f"Deleted image {image_name} from session {session_id}")
        return {"message": f"Image {image_name} deleted successfully"}

    except Exception as e:
        logger.error(f"[Error in delete-image] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export-session-csv/{session_id}")
async def export_session_csv(session_id: str):
    """Export session metadata as CSV."""
    try:
        metadata_path = BASE_DIR / session_id / "session_metadata.json"

        if not metadata_path.exists():
            raise HTTPException(status_code=404, detail="Session metadata not found.")

        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        output = io.StringIO()
        writer = None

        for image_name, data in metadata.get("images", {}).items():
            row = {"IMAGE_NAME": image_name, **{k.upper(): v for k, v in data.items()}}
            if "TOTALCOUNT" not in row:
                row["TOTALDUGONGCOUNT"] = row.get("DUGONGCOUNT", 0) + 2 * row.get("MOTHERCALFCOUNT", 0)
            
            # Ensure captured date is included, default to "N/A" if not present
            if "CAPTUREDDATE" not in row:
                row["CAPTUREDDATE"] = extract_captured_date(image_name)

            if writer is None:
                writer = csv.DictWriter(output, fieldnames=row.keys())
                writer.writeheader()
            writer.writerow(row)

        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={session_id}.csv"}
        )

    except Exception as e:
        logger.error(f"[Error in export-session-csv] {e}")
        raise HTTPException(status_code=500, detail=str(e))
