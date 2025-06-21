"""
YOLOv8 model service for dugong and calf detection in aerial images.
Handles model inference and detection result processing.
"""

from pathlib import Path
from ultralytics import YOLO
from core.config import MODEL_PATH, BASE_DIR
from core.logger import setup_logger

logger = setup_logger("model_service", "logs/model_service.log")
model = YOLO(MODEL_PATH)

def run_model_on_image(image_path: Path, session_id: str) -> tuple[int, int, str, Path]:
    """
    Run dugong detection model on an image and save detection results.

    Args:
        image_path: Path to input image
        session_id: Session identifier for result storage

    Returns:
        tuple: (dugong_count, calf_count, image_class, label_path)
    """
    logger.info(f"Running model on {image_path}")
    result = model(image_path)[0]
    class_ids = result.boxes.cls.int().tolist() if result.boxes is not None else []
    dugong_count = class_ids.count(0)
    calf_count = class_ids.count(1)
    image_class = "A" if dugong_count > calf_count else "B"

    label_dir = BASE_DIR / session_id / "labels"
    label_dir.mkdir(parents=True, exist_ok=True)
    label_path = label_dir / f"{image_path.stem}.txt"

    try:
        with open(label_path, "w") as f:
            for box, cls_id in zip(result.boxes.xywhn, result.boxes.cls.int()):
                cx, cy, w, h = box.tolist()
                f.write(f"{cls_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}\n")
        logger.info(f"Saved label file: {label_path}")
    except Exception as e:
        logger.error(f"Failed to save label for {image_path.name}: {e}")
        raise

    return dugong_count, calf_count, image_class, label_path
