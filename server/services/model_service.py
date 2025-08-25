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

def remove_small_boxes(
    results,
    min_side: int = 20,        # minimum width/height in pixels
    min_rel_area: float = 3e-4,# minimum relative area (fraction of image area)
    verbose: bool = True,
):
    """
    Removes boxes that are too small based on absolute side length and relative area.
    
    Args:
        results: List of YOLO Results objects.
        min_side: Minimum allowed width and height in pixels.
        min_rel_area: Minimum allowed area relative to image area.
    """
    from ultralytics.engine.results import Boxes
    filtered = []

    for res in results:
        if res is None or not len(res.boxes):
            filtered.append(res)
            continue

        device = res.boxes.data.device
        boxes = res.boxes.xyxy
        scores = res.boxes.conf
        cls = res.boxes.cls if hasattr(res.boxes, "cls") else torch.zeros_like(scores, device=device)

        w = boxes[:, 2] - boxes[:, 0]
        h = boxes[:, 3] - boxes[:, 1]
        area = w * h

        img_h, img_w = res.orig_shape
        img_area = float(img_h * img_w)

        keep = (
            (w >= min_side) &
            (h >= min_side) &
            ((area / img_area) >= min_rel_area)
        )

        kept_boxes = boxes[keep]
        kept_scores = scores[keep].unsqueeze(1)
        kept_cls = cls[keep].unsqueeze(1)

        if kept_boxes.numel() == 0:
            res.boxes = Boxes(torch.empty((0, 6), device=device), orig_shape=res.orig_shape)
        else:
            res.boxes = Boxes(torch.cat([kept_boxes, kept_scores, kept_cls], dim=1), orig_shape=res.orig_shape)

        if verbose:
            name = os.path.basename(getattr(res, "path", "image"))
            print(f"[{name}] Removed small boxes: {len(boxes) - int(keep.sum())}, Kept: {int(keep.sum())}")

        filtered.append(res)

    return filtered


def filter_by_scale_per_image(
    results,
    mode: str = "ratio",          # "ratio": bounds = mean * [low, high],  "zscore": mean ± k*std
    low: float = 0.6,             # if mode=="ratio": lower = mean * low ; if "zscore": lower = mean - low*std
    high: float = 2.0,            # if mode=="ratio": upper = mean * high; if "zscore": upper = mean + high*std
    metric: str = "geom",         # "geom"=sqrt(area), "area"=w*h, "long_side", or "short_side"
    min_boxes_for_stats: int = 3, # if fewer boxes than this, skip filtering for that image
    keep_at_least: int = 0,       # keep top-K by size to avoid dropping everything (0 = allow empty)
    verbose: bool = True,
):
    """
    Per-image dynamic scale filtering using mean-derived bounds.
    Computes a size metric for each box, derives bounds from that image's mean,
    and drops boxes smaller/larger than the bounds.

    Works with Ultralytics YOLO Results objects (res.boxes).
    """
    from ultralytics.engine.results import Boxes
    out = []

    for res in results:
        if res is None or not len(res.boxes):
            out.append(res)
            continue

        # Tensors on the same device as YOLO boxes
        device = res.boxes.data.device
        b = res.boxes.xyxy           # (N,4)
        scores = res.boxes.conf      # (N,)
        cls = res.boxes.cls if hasattr(res.boxes, "cls") else torch.zeros_like(scores, device=device)

        w = b[:, 2] - b[:, 0]
        h = b[:, 3] - b[:, 1]

        if metric == "area":
            size = w * h
        elif metric == "long_side":
            size = torch.maximum(w, h)
        elif metric == "short_side":
            size = torch.minimum(w, h)
        else:  # "geom": geometric mean ~ side length from area
            size = (w * h).sqrt()

        n = size.numel()
        if n < min_boxes_for_stats:
            # Not enough stats; leave this image unchanged
            out.append(res)
            continue

        mu = size.mean()
        if mode == "zscore":
            sigma = size.std(unbiased=False) + 1e-6
            lower = mu - low * sigma
            upper = mu + high * sigma
        else:  # "ratio"
            lower = mu * low
            upper = mu * high

        keep = (size >= lower) & (size <= upper)

        # Optional safety: ensure we keep at least K (largest by size)
        if keep_at_least > 0 and keep.sum().item() < keep_at_least and n > 0:
            topk_idx = torch.topk(size, k=min(keep_at_least, n)).indices
            keep = keep.clone()
            keep[topk_idx] = True

        # Rebuild Boxes
        kept_boxes = b[keep]
        kept_scores = scores[keep].unsqueeze(1)
        kept_cls = cls[keep].unsqueeze(1)

        if kept_boxes.numel() == 0:
            res.boxes = Boxes(torch.empty((0, 6), device=device), orig_shape=res.orig_shape)
        else:
            res.boxes = Boxes(torch.cat([kept_boxes, kept_scores, kept_cls], dim=1), orig_shape=res.orig_shape)

        if verbose:
            name = os.path.basename(getattr(res, "path", "image"))
            print(f"[{name}] metric={metric} mode={mode} mean={mu:.2f} "
                  f"low={lower:.2f} high={upper:.2f} kept {int(keep.sum().item())}/{n}")

        out.append(res)

    return out

def remove_nested_class0(
    results,
    parent_cls: int = 1,
    child_cls: int = 0,
    overlap_thr: float = 0.8,  # fraction of child area inside parent
    verbose: bool = True,
):
    """
    Removes child boxes if they are mostly contained within a parent box of another class.
    
    Args:
        results: List of YOLO Results objects.
        parent_cls: Class index considered as parent.
        child_cls: Class index considered as child (to remove).
        overlap_thr: Fraction of child area that must lie inside a parent to remove it.
    """
    from ultralytics.engine.results import Boxes
    cleaned = []

    for res in results:
        if res is None or not len(res.boxes):
            cleaned.append(res)
            continue

        device = res.boxes.data.device
        boxes = res.boxes.xyxy
        scores = res.boxes.conf
        cls = res.boxes.cls if hasattr(res.boxes, "cls") else torch.zeros_like(scores, device=device)

        keep = torch.ones(len(boxes), dtype=torch.bool, device=device)

        parents_idx = (cls == parent_cls).nonzero(as_tuple=True)[0]
        children_idx = (cls == child_cls).nonzero(as_tuple=True)[0]

        for ci in children_idx:
            c_box = boxes[ci]
            c_area = (c_box[2] - c_box[0]) * (c_box[3] - c_box[1])
            if c_area <= 0:
                continue

            # Compute overlap with each parent
            for pi in parents_idx:
                p_box = boxes[pi]
                # Intersection box
                ix1 = torch.max(c_box[0], p_box[0])
                iy1 = torch.max(c_box[1], p_box[1])
                ix2 = torch.min(c_box[2], p_box[2])
                iy2 = torch.min(c_box[3], p_box[3])

                iw = torch.clamp(ix2 - ix1, min=0)
                ih = torch.clamp(iy2 - iy1, min=0)
                inter_area = iw * ih

                frac_inside = inter_area / (c_area + 1e-6)
                if frac_inside >= overlap_thr:
                    keep[ci] = False
                    break  # no need to check other parents

        kept_boxes = boxes[keep]
        kept_scores = scores[keep].unsqueeze(1)
        kept_cls = cls[keep].unsqueeze(1)

        if kept_boxes.numel() == 0:
            res.boxes = Boxes(torch.empty((0, 6), device=device), orig_shape=res.orig_shape)
        else:
            res.boxes = Boxes(torch.cat([kept_boxes, kept_scores, kept_cls], dim=1), orig_shape=res.orig_shape)

        if verbose:
            name = os.path.basename(getattr(res, "path", "image"))
            removed = (~keep).sum().item()
            print(f"[{name}] Nested {child_cls} removed: {removed}")

        cleaned.append(res)

    return cleaned

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
    # 3. remove too small boxes
    processed_results = remove_small_boxes(processed_results, min_side=10, min_rel_area=7e-5)
    # 4. remove different scalled boxes
    processed_results = filter_by_scale_per_image(
        processed_results,
        mode="ratio",
        low=0.7,
        high=2.5,
        metric="geom",          # works well across altitude/scale changes
        min_boxes_for_stats=3,  # if an image has <3 boxes, skip filtering for that image
        keep_at_least=1,        # optional: avoid empty results by keeping the largest box
        verbose=True
    )
    # 5. remove overlap boxes
    processed_results = remove_nested_class0(processed_results, parent_cls=1, child_cls=0, overlap_thr=0.8)
    # 6. Prepare output folders
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
