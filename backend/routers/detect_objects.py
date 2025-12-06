from fastapi import APIRouter, UploadFile, File

from utils.models import yolo_model
from utils.image_utils import load_image_from_upload

router = APIRouter()

@router.post("/detect-objects")
async def detect_objects(file: UploadFile = File(...)):
    """
    Takes an image, returns list of detected objects with confidence.
    """
    image_bytes = await file.read()
    img = load_image_from_upload(image_bytes)

    results = yolo_model(img)[0]
    detections = []

    for box in results.boxes:
        cls_id = int(box.cls.item())
        label = results.names[cls_id]
        conf = float(box.conf.item())
        detections.append({"label": label, "confidence": conf})

    return detections
