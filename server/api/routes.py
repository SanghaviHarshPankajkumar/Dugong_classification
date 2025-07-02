import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from datetime import datetime
from uuid import uuid4
from datetime import datetime
from services.file_service import validate_file, save_file
from services.model_service import run_model_on_images
from schemas.response import ImageResult
from core.config import BASE_DIR
from schemas.request import MoveImageRequest

router = APIRouter()

@router.get("/")
def read_root():
    return {"message": "YOLO Image Upload API"}

@router.post("/upload-multiple/", response_model=dict)
async def upload_multiple(files: List[UploadFile] = File(...)):
    """
    Upload multiple files, save them under a session folder, and run YOLO model.
    """

    session_id = f"{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}_{uuid4()}"
    results: List[ImageResult] = []

    # Process files in batches
    batch_size = 4  
    for batch_start in range(0, len(files), batch_size):
        batch_files = files[batch_start:batch_start + batch_size]
        batch_contents = []
        saved_paths = []

        # Read and validate all files in the batch
        for file in batch_files:
            contents = await file.read()
            validate_file(file, contents)
            saved_path = save_file(file, contents, session_id)
            batch_contents.append((file, contents))
            saved_paths.append(saved_path)

        # Run model on all images in the batch
        batch_results = run_model_on_images(saved_paths, session_id)  

        for idx, (saved_path, result) in enumerate(zip(saved_paths, batch_results), start=batch_start):
            dugong_count, calf_count, image_class, image_with_boxes_path  = result
            results.append(ImageResult(
                imageId=idx,
                imageUrl=f"/{BASE_DIR.name}/{session_id}/images/{saved_path.name}",
                dugongCount=dugong_count,
                calfCount=calf_count,
                imageClass=image_class,
                createdAt=datetime.now().isoformat()
            ))


    return {"sessionId": session_id, "results": results}


@router.post("/move-to-false-positive/")
async def move_to_false_positive(request: MoveImageRequest):
    """
    Moves an image to the 'Class A' or 'Class B' folder within 'False positives'.
    """
    source_path = BASE_DIR / request.sessionId / "images" / request.imageName
    dest_path = BASE_DIR / request.sessionId / "False positives" / request.targetClass / request.imageName

    if not source_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {source_path}")

    dest_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        shutil.move(str(source_path), str(dest_path))
        return {"message": f"Image '{request.imageName}' moved to '{request.targetClass}' successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to move image: {str(e)}")
