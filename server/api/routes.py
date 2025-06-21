from fastapi import APIRouter, UploadFile, File
from typing import List
from datetime import datetime
from uuid import uuid4
from datetime import datetime
from services.file_service import validate_file, save_file
from services.model_service import run_model_on_image
from schemas.response import ImageResult
from core.config import BASE_DIR

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

    for idx, file in enumerate(files):
        contents = await file.read()
        validate_file(file, contents)
        saved_path = save_file(file, contents, session_id)

        dugong_count, calf_count, image_class, label_path = run_model_on_image(saved_path, session_id)

        results.append(ImageResult(
            imageId=idx,
            imageUrl=f"/uploads/{session_id}/images/{saved_path.name}",
            labelUrl=f"/uploads/{session_id}/labels/{label_path.name}",
            dugongCount=dugong_count,
            calfCount=calf_count,
            imageClass=image_class,
            createdAt=datetime.now().isoformat()
        ))

    return {"sessionId": session_id, "results": results}
