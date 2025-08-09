from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime, timedelta
import shutil
import json
import logging
import io
import csv
from typing import List
from core.config import BASE_DIR
from schemas.request import MoveImageRequest
from services.model_service import run_model_on_images  # from old file

router = APIRouter()
logger = logging.getLogger(__name__)

SESSION_TIMEOUT_MINUTES = 15


class BackfillResponse(BaseModel):
    message: str
    added_files: List[str]


@router.post("/upload-multiple/")
async def upload_multiple(session_id: str, files: List[UploadFile] = File(...)):
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

        # Run detection in batch using old function
        results = run_model_on_images(saved_paths, session_id)
        for filename, (dugong_count, calf_count, image_class, _) in zip(file_names, results):
            metadata["images"][filename] = {
                "dugongCount": dugong_count,
                "calfCount": calf_count,
                "imageClass": image_class,
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
        for session_dir in BASE_DIR.iterdir():
            if session_dir.is_dir():
                shutil.rmtree(session_dir)
                deleted_sessions.append(session_dir.name)

        return {"deleted_sessions": deleted_sessions, "message": "Local session cleanup completed."}

    except Exception as e:
        logger.error(f"[Error in cleanup-sessions] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/move-to-false-positive/")
async def move_to_false_positive(request: MoveImageRequest):
    """Move an image between classification folders locally."""
    try:
        session_dir = BASE_DIR / request.sessionId
        metadata_path = session_dir / "session_metadata.json"

        if not metadata_path.exists():
            raise HTTPException(status_code=404, detail="Session metadata not found.")

        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        if request.imageName not in metadata["images"]:
            raise HTTPException(status_code=404, detail="Image not found in metadata.")

        current_class = metadata["images"][request.imageName]["imageClass"].lower()
        opposite_class = "feeding" if current_class == "resting" else "resting"

        source_path = session_dir / current_class / request.imageName
        target_path = session_dir / opposite_class / request.imageName

        if not source_path.exists():
            raise HTTPException(status_code=404, detail="Source image not found.")

        target_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(source_path), str(target_path))

        metadata["images"][request.imageName]["imageClass"] = opposite_class
        metadata["images"][request.imageName]["updatedAt"] = datetime.utcnow().isoformat()

        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=4)

        return {"message": f"Moved {request.imageName} to {opposite_class}."}

    except Exception as e:
        logger.error(f"[Error in move-to-false-positive] {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
        results = run_model_on_images(missing_paths, session_id)

        for file_name, (dugong_count, calf_count, image_class, _) in zip(missing_files, results):
            total_count = dugong_count + 2 * calf_count
            metadata["images"][file_name] = {
                "dugongCount": dugong_count,
                "calfCount": calf_count,
                "imageClass": image_class,
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
                row["TOTALCOUNT"] = row.get("DUGONGCOUNT", 0) + 2 * row.get("CALFCOUNT", 0)

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
