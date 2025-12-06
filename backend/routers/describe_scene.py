from fastapi import APIRouter, UploadFile, File
from utils.models import yolo_model
from utils.image_utils import load_image_from_upload

router = APIRouter()

@router.post("/describe-scene")
async def describe_scene(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = load_image_from_upload(image_bytes)

    results = yolo_model(img)[0]
    labels = []

    for box in results.boxes:
        cls_id = int(box.cls.item())
        label = results.names[cls_id]
        labels.append(label)

    if not labels:
        return {"description": "I cannot see any clear objects."}

    unique_labels = list(dict.fromkeys(labels))
    return {"description": "I see: " + ", ".join(unique_labels)}
