"""
YOLOv8 model service for dugong and calf detection in aerial images.
Handles model inference and detection result processing.
"""

from pathlib import Path
from ultralytics import YOLO
from core.config import BASE_DIR
from core.logger import setup_logger
from typing import List, Tuple
import requests

import numpy as np
import torch
import os
import cv2

logger = setup_logger("model_service", "logs/model_service.log")

url = "https://storage.googleapis.com/dugong_models/best.pt"

response = requests.get(url)
# Save to disk
with open("MLmodel.pt", "wb") as f:
    f.write(response.content)
model = YOLO("MLmodel.pt")

url = "https://storage.googleapis.com/dugong_models/classification_model.pt"
response = requests.get(url)
# Save to disk
with open("classification_model.pt", "wb") as f:
    f.write(response.content)
    
classification_model = YOLO("classification_model.pt")


def fully_dynamic_nms(preds, iou_min=0.1, iou_max=0.6):
    from ultralytics.engine.results import Boxes

    processed_results = []
    for res in preds:
        if res is None or not len(res.boxes):
            processed_results.append(res)
            continue

        boxes = res.boxes.xyxy.cpu()
        scores = res.boxes.conf.cpu()
        cls = res.boxes.cls.cpu() if hasattr(res.boxes, 'cls') else torch.zeros_like(scores)

        if boxes.numel() == 0:
            processed_results.append(res)
            continue

        if res.orig_img is not None:
            img_height, img_width = res.orig_img.shape[:2]
        else:
            img_height, img_width = 1, 1

        heights = boxes[:, 3] - boxes[:, 1]
        widths = boxes[:, 2] - boxes[:, 0]
        sizes = torch.sqrt(heights * widths)
        median_size = float(torch.median(sizes))
        min_size, max_size = 10, 200
        clipped_size = np.clip(median_size, min_size, max_size)
        relative_size = (clipped_size - min_size) / (max_size - min_size)
        iou_thr = iou_max - relative_size * (iou_max - iou_min)
        print(f"[{os.path.basename(res.path)}] Median size: {median_size:.2f}, IoU: {iou_thr:.3f}, Relative size : {relative_size}")
        keep = torch.ops.torchvision.nms(boxes, scores, float(iou_thr))

        kept_boxes = boxes[keep]
        kept_scores = scores[keep].unsqueeze(1)
        kept_cls = cls[keep].unsqueeze(1)
        final_data = torch.cat([kept_boxes, kept_scores, kept_cls], dim=1).to(res.boxes.data.device)

        res.boxes = Boxes(final_data, orig_shape=res.orig_shape)
        processed_results.append(res)

    return processed_results

def run_model_on_images(
    image_paths: List[Path], session_id: str
) -> List[Tuple[int, int, str, Path]]:
    """
    Run dugong detection model on a batch of images and save detection results.
    Also saves images with colored bounding boxes after dynamic NMS.
    """
    results = []
    logger.info(f"Running model on batch: {[str(p) for p in image_paths]}")
    # 1. Perform prediction to get the initial results
    batch_results = model.predict(
        source=[str(p) for p in image_paths],
        conf=0.3,
        save=False,
        show_labels=False,
        show_conf=False,
        project=None,
        name=None,
        iou=0.3,
        max_det=1000
    )

    # 2. Apply the custom NMS function to the results
    processed_results = fully_dynamic_nms(batch_results)

    # 3. Prepare output folders
    label_dir = BASE_DIR / session_id / "labels"
    label_dir.mkdir(parents=True, exist_ok=True)
    final_results_folder = BASE_DIR / session_id / "images"
    final_results_folder.mkdir(parents=True, exist_ok=True)

    # Define colors for classes (B, G, R)
    color_map = {
        0: (255, 0, 0),   # Blue for Dugong (class 0)
        1: (0, 0, 255)    # Red for Calf (class 1)
    }

    for image_path, res in zip(image_paths, processed_results):
        class_ids = res.boxes.cls.int().tolist() if res.boxes is not None else []
        dugong_count = class_ids.count(0)
        calf_count = class_ids.count(1)
        # find the class of the image
        temp_results = classification_model.predict(image_path,  save=False,show_conf=False,project=None)
        top5_class_names = temp_results[0].names
        top1_class_id = temp_results[0].probs.top1
        image_class = top5_class_names[top1_class_id]
        label_path = label_dir / f"{image_path.stem}.txt"

        try:
            with open(label_path, "w") as f:
                for box, cls_id in zip(res.boxes.xywhn, res.boxes.cls.int()):
                    cx, cy, w, h = box.tolist()
                    f.write(f"{cls_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}\n")
            logger.info(f"Saved label file: {label_path}")
        except Exception as e:
            logger.error(f"Failed to save label for {image_path.name}: {e}")
            raise

        # Save image with colored bounding boxes
        img = cv2.imread(str(image_path))
        if img is not None and len(res.boxes) > 0:
            boxes = res.boxes.xyxy.cpu().numpy()
            classes = res.boxes.cls.cpu().numpy().astype(int)
            for box, cls in zip(boxes, classes):
                x1, y1, x2, y2 = map(int, box)
                color = color_map.get(cls, (0, 255, 0))
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        save_path = final_results_folder / image_path.name
        cv2.imwrite(str(save_path), img)
        logger.info(f"Saved image with NMS and colored boxes: {save_path}")

        results.append((dugong_count, calf_count, image_class, save_path))

    logger.info(f"Images with bounding boxes saved to {final_results_folder}")
    return results
