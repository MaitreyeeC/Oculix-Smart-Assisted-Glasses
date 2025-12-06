from fastapi import APIRouter, UploadFile, File

from utils.preprocessing import preprocess_for_simple_text_from_bytes
from utils.image_utils import run_ocr

router = APIRouter()

@router.post("/read-text")
async def read_text(file: UploadFile = File(...)):
    """
    For small product labels / boards.
    Uses a lighter preprocessing pipeline optimized for curved / small text.
    """
    image_bytes = await file.read()

    # 👉 your lighter pipeline for labels
    preprocessed_img = preprocess_for_simple_text_from_bytes(image_bytes)

    lines = run_ocr(preprocessed_img)

    # shape expected by frontend: [{text: "..."}]
    return [{"text": line} for line in lines]
