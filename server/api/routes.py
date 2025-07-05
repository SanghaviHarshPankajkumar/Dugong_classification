import shutil
import json
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from typing import List
from datetime import datetime
from uuid import uuid4
import uuid
from services.file_service import validate_file, save_file
from services.model_service import run_model_on_images
from schemas.response import ImageResult
from core.config import BASE_DIR
from core.logger import setup_logger
from core.cleanup import update_session_activity
from schemas.request import MoveImageRequest
from pymongo import MongoClient
from dotenv import load_dotenv

logger = setup_logger("api", "logs/api.log")
router = APIRouter()

@router.get("/")
def read_root():
    return {"message": "Dugong Monitoring API is running"}

@router.post("/upload-multiple/", response_model=dict)
async def upload_multiple(
    files: List[UploadFile] = File(...),
    session_id: str = Form(...)
):
    """
    Upload multiple files, save them under a session folder, run YOLO model, and update session metadata.
    Updates session activity timestamp for timer reset.
    """
    try:
        session_folder_name = f"{session_id}"
        session_folder = BASE_DIR / session_folder_name
        session_folder.mkdir(parents=True, exist_ok=True)
        results: List[ImageResult] = []
        new_file_results = []
        batch_files = files
        batch_contents = []
        saved_paths = []
        for file in batch_files:
            if file.content_type and file.content_type.startswith("image/"):
                contents = await file.read()
                validate_file(file, contents)
                saved_path = save_file(file, contents, session_folder_name)
                batch_contents.append((file, contents))
                saved_paths.append(saved_path)
        batch_results = run_model_on_images(saved_paths, session_folder_name)
        for idx, (saved_path, result) in enumerate(zip(saved_paths, batch_results)):
            dugong_count, calf_count, image_class, image_with_boxes_path = result
            file_result = {
                "filename": saved_path.name,
                "path": str(saved_path.relative_to(BASE_DIR)),
                "dugongCount": dugong_count,
                "calfCount": calf_count,
                "imageClass": image_class,
                "createdAt": datetime.now().isoformat()
            }
            new_file_results.append(file_result)
            results.append(ImageResult(
                imageId=idx,
                imageUrl=f"/{BASE_DIR.name}/{session_folder_name}/images/{saved_path.name}",
                dugongCount=dugong_count,
                calfCount=calf_count,
                imageClass=image_class,
                createdAt=file_result["createdAt"]
            ))
        # Update or create session metadata
        metadata_file = session_folder / "session_metadata.json"
        merged_files = []
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
            old_files = metadata.get('files', [])
            # Build a dict of new results for quick lookup
            new_files_dict = {f['filename']: f for f in new_file_results}
            for old_file in old_files:
                fname = old_file.get('filename')
                if fname in new_files_dict:
                    # Overwrite with new detection result
                    merged_files.append(new_files_dict[fname])
                else:
                    # If old file lacks detection results, add default values
                    merged_files.append({
                        **old_file,
                        "dugongCount": old_file.get("dugongCount", 0),
                        "calfCount": old_file.get("calfCount", 0),
                        "imageClass": old_file.get("imageClass", "N/A"),
                        "createdAt": old_file.get("createdAt", datetime.now().isoformat())
                    })
            # Add any new files not in old_files
            for fname, new_file in new_files_dict.items():
                if not any(f.get('filename') == fname for f in old_files):
                    merged_files.append(new_file)
        else:
            merged_files = new_file_results
        metadata = {
            'session_id': session_id,
            'created_at': datetime.utcnow().isoformat(),
            'last_activity': datetime.utcnow().isoformat(),
            'files': merged_files,
            'file_count': len(merged_files)
        }
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        logger.info(f"Updated session: {session_id} with {len(merged_files)} total files")
        return {
            "success": True,
            "sessionId": session_id,
            "results": results,
            "filesUploaded": len(new_file_results),
            "files": new_file_results,
            "message": f"Successfully uploaded and processed {len(new_file_results)} images"
        }
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# @router.post("/reset-session-timer/{session_id}")
# async def reset_session_timer(session_id: str):
#     """
#     Reset the session timer by updating the last activity timestamp.
#     Called when new images are uploaded to an existing session.
#     """
#     try:
#         # Update session activity
#         update_session_activity(session_id)
        
#         return JSONResponse(content={
#             "success": True,
#             "sessionId": session_id,
#             "message": "Session timer reset successfully"
#         })
        
#     except Exception as e:
#         logger.error(f"Failed to reset session timer for {session_id}: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to reset session timer: {str(e)}")


@router.get("/session-status/{session_id}")
async def get_session_status(session_id: str):
    """
    Get the current status of a session including time remaining and all files.
    """
    try:
        # Find session folder
        session_folder = None
        for folder in BASE_DIR.iterdir():
            if folder.is_dir() and session_id in folder.name:
                session_folder = folder
                break
        if not session_folder:
            raise HTTPException(status_code=404, detail="Session not found")
        # Read metadata
        metadata_file = session_folder / "session_metadata.json"
        if not metadata_file.exists():
            raise HTTPException(status_code=404, detail="Session metadata not found")
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
        # Calculate time remaining
        last_activity = datetime.fromisoformat(metadata.get('last_activity'))
        elapsed_seconds = (datetime.utcnow() - last_activity).total_seconds()
        remaining_seconds = max(0, (15 * 60) - elapsed_seconds)  # 15 minutes
        return JSONResponse(content={
            "success": True,
            "sessionId": session_id,
            "lastActivity": metadata.get('last_activity'),
            "remainingSeconds": int(remaining_seconds),
            "isExpired": remaining_seconds <= 0,
            "fileCount": metadata.get('file_count', 0),
            "files": metadata.get('files', [])
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get session status for {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get session status: {str(e)}")


@router.post("/move-to-false-positive/")
async def move_to_false_positive(request: MoveImageRequest):
    """
    Moves an image to the 'Class A' or 'Class B' folder within 'False positives'.
    """
    # Find the session folder by session ID
    session_folder = None
    for folder in BASE_DIR.iterdir():
        if folder.is_dir() and request.sessionId in folder.name:
            session_folder = folder
            break
    
    if not session_folder:
        raise HTTPException(status_code=404, detail=f"Session not found: {request.sessionId}")
    
    source_path = session_folder / "images" / request.imageName
    dest_path = session_folder / "False positives" / request.targetClass / request.imageName

    if not source_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {source_path}")

    dest_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        shutil.move(str(source_path), str(dest_path))
        return {"message": f"Image '{request.imageName}' moved to '{request.targetClass}' successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to move image: {str(e)}")

# @router.get("/all-images/")
# def get_all_images():
#     """
#     List all images from all session folders in the uploads directory.
#     Returns a list of image URLs and their session IDs.
#     """
#     uploads_dir = BASE_DIR
#     all_images = []
#     for session_folder in uploads_dir.iterdir():
#         if session_folder.is_dir():
#             images_dir = session_folder / "images"
#             if images_dir.exists() and images_dir.is_dir():
#                 for image_file in images_dir.iterdir():
#                     if image_file.is_file() and image_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
#                         all_images.append({
#                             "session_id": session_folder.name,
#                             "image_url": f"/{uploads_dir.name}/{session_folder.name}/images/{image_file.name}",
#                             "image_name": image_file.name
#                         })
#     return {"images": all_images}

@router.post("/backfill-detections/{session_id}")
def backfill_detections(session_id: str):
    """
    Run detection on unprocessed images in the session folder and update session_metadata.json with results.
    Only processes images that don't have detection results yet.
    """
    session_folder = BASE_DIR / session_id
    images_dir = session_folder / "images"
    metadata_file = session_folder / "session_metadata.json"
    if not images_dir.exists() or not images_dir.is_dir():
        raise HTTPException(status_code=404, detail="Images directory not found for this session.")
    if not metadata_file.exists():
        raise HTTPException(status_code=404, detail="Session metadata not found.")
    
    with open(metadata_file, 'r') as f:
        metadata = json.load(f)
    
    files_metadata = metadata.get('files', [])
    # Build a dict for quick lookup
    files_dict = {f['filename']: f for f in files_metadata}
    
    # Find all image files in the session
    all_image_files = [img for img in images_dir.iterdir() if img.is_file() and img.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']]
    
    # Get list of filenames that are already processed (exist in metadata)
    processed_filenames = set(files_dict.keys())
    
    # Filter out images that are already processed (exist in metadata)
    unprocessed_images = []
    for img_path in all_image_files:
        fname = img_path.name
        # If the filename is not in the metadata, it hasn't been processed yet
        if fname not in processed_filenames:
            unprocessed_images.append(img_path)
    
    if not unprocessed_images:
        return {
            "success": True, 
            "message": "All images already have detection results. No processing needed.", 
            "files": list(files_dict.values()),
            "processed_count": 0
        }
    
    # Run detection only on unprocessed images
    detection_results = run_model_on_images(unprocessed_images, session_id)
    
    for (img_path, result) in zip(unprocessed_images, detection_results):
        dugong_count, calf_count, image_class, _ = result
        fname = img_path.name
        # Update or create metadata entry
        files_dict[fname] = {
            **files_dict.get(fname, {}),
            "filename": fname,
            "path": str(img_path.relative_to(BASE_DIR)),
            "dugongCount": dugong_count,
            "calfCount": calf_count,
            "imageClass": image_class,
            "createdAt": files_dict.get(fname, {}).get("createdAt", datetime.now().isoformat())
        }
    
    # Save updated metadata
    merged_files = list(files_dict.values())
    metadata['files'] = merged_files
    metadata['file_count'] = len(merged_files)
    
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    return {
        "success": True, 
        "message": f"Detection results backfilled for {len(unprocessed_images)} unprocessed images.", 
        "files": merged_files,
        "processed_count": len(unprocessed_images)
    }

@router.post("/cleanup-sessions/{user_email}")
def cleanup_sessions(user_email: str, session_id: str = Query(None)):
    """
    Delete the session folder for the given session_id (if provided), otherwise for the current session_id in the user document.
    """
    # Connect to MongoDB
    load_dotenv()
    MONGO_URL = os.getenv("MONGO_URL")
    client = MongoClient(MONGO_URL)
    db = client["DugongMonitoring"]
    user_collection = db["users"]
    user = user_collection.find_one({"email": user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Use provided session_id or fallback to user's session_id
    session_id_to_delete = session_id or user.get("session_id")
    deleted_sessions = []
    if session_id_to_delete:
        session_folder = BASE_DIR / session_id_to_delete
        if session_folder.exists() and session_folder.is_dir():
            shutil.rmtree(session_folder)
            deleted_sessions.append(session_id_to_delete)
    # Remove session_id from user document
    user_collection.update_one({"email": user_email}, {"$unset": {"session_id": ""}})
    return {"deleted_sessions": deleted_sessions, "message": "Session folder deleted for user."}







    """
    Run detection on unprocessed images in the session folder and update session_metadata.json with results.
    Only processes images that don't have detection results yet.
    """
    session_folder = BASE_DIR / session_id
    images_dir = session_folder / "images"
    metadata_file = session_folder / "session_metadata.json"
    if not images_dir.exists() or not images_dir.is_dir():
        raise HTTPException(status_code=404, detail="Images directory not found for this session.")
    if not metadata_file.exists():
        raise HTTPException(status_code=404, detail="Session metadata not found.")
    
    with open(metadata_file, 'r') as f:
        metadata = json.load(f)
    
    files_metadata = metadata.get('files', [])
    # Build a dict for quick lookup
    files_dict = {f['filename']: f for f in files_metadata}
    
    # Find all image files in the session
    all_image_files = [img for img in images_dir.iterdir() if img.is_file() and img.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']]
    
    # Filter out images that are already processed (have detection results)
    unprocessed_images = []
    for img_path in all_image_files:
        fname = img_path.name
        file_metadata = files_dict.get(fname, {})
        
        # Check if image has detection results (dugongCount, calfCount, imageClass)
        has_detection_results = (
            'dugongCount' in file_metadata and 
            'calfCount' in file_metadata and 
            'imageClass' in file_metadata and
            file_metadata['imageClass'] != "N/A"
        )
        
        if not has_detection_results:
            unprocessed_images.append(img_path)
    
    if not unprocessed_images:
        return {
            "success": True, 
            "message": "All images already have detection results. No processing needed.", 
            "files": list(files_dict.values()),
            "processed_count": 0
        }
    
    # Run detection only on unprocessed images
    detection_results = run_model_on_images(unprocessed_images, session_id)
    
    for (img_path, result) in zip(unprocessed_images, detection_results):
        dugong_count, calf_count, image_class, _ = result
        fname = img_path.name
        # Update or create metadata entry
        files_dict[fname] = {
            **files_dict.get(fname, {}),
            "filename": fname,
            "path": str(img_path.relative_to(BASE_DIR)),
            "dugongCount": dugong_count,
            "calfCount": calf_count,
            "imageClass": image_class,
            "createdAt": files_dict.get(fname, {}).get("createdAt", datetime.now().isoformat())
        }
    
    # Save updated metadata
    merged_files = list(files_dict.values())
    metadata['files'] = merged_files
    metadata['file_count'] = len(merged_files)
    
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    return {
        "success": True, 
        "message": f"Detection results backfilled for {len(unprocessed_images)} unprocessed images.", 
        "files": merged_files,
        "processed_count": len(unprocessed_images)
    }


# def backfill_detections(session_id: str):
    """
    Run detection on all images in the session folder and update session_metadata.json with results.
    """
    session_folder = BASE_DIR / session_id
    images_dir = session_folder / "images"
    metadata_file = session_folder / "session_metadata.json"
    if not images_dir.exists() or not images_dir.is_dir():
        raise HTTPException(status_code=404, detail="Images directory not found for this session.")
    if not metadata_file.exists():
        raise HTTPException(status_code=404, detail="Session metadata not found.")
    with open(metadata_file, 'r') as f:
        metadata = json.load(f)
    files_metadata = metadata.get('files', [])
    # Build a dict for quick lookup
    files_dict = {f['filename']: f for f in files_metadata}
    # Find all image files in the session
    image_files = [img for img in images_dir.iterdir() if img.is_file() and img.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']]
    # Run detection on all images
    detection_results = run_model_on_images(image_files, session_id)
    for (img_path, result) in zip(image_files, detection_results):
        dugong_count, calf_count, image_class, _ = result
        fname = img_path.name
        # Update or create metadata entry
        files_dict[fname] = {
            **files_dict.get(fname, {}),
            "filename": fname,
            "path": str(img_path.relative_to(BASE_DIR)),
            "dugongCount": dugong_count,
            "calfCount": calf_count,
            "imageClass": image_class,
            "createdAt": files_dict.get(fname, {}).get("createdAt", datetime.now().isoformat())
        }
    # Save updated metadata
    merged_files = list(files_dict.values())
    metadata['files'] = merged_files
    metadata['file_count'] = len(merged_files)
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    return {"success": True, "message": "Detection results backfilled for all images.", "files": merged_files}