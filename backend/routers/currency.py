from fastapi import APIRouter, UploadFile, File

from utils.preprocessing import preprocess_for_ocr_from_bytes
from utils.image_utils import run_ocr, guess_currency_from_text

router = APIRouter()

@router.post("/currency")
async def detect_currency(file: UploadFile = File(...)):
    """
    Currency detection using:
      - your OpenCV preprocessing pipeline
      - OCR
      - custom heuristic for guessing note value
    """
    image_bytes = await file.read()

    preprocessed_img = preprocess_for_ocr_from_bytes(image_bytes)
    lines = run_ocr(preprocessed_img)

    if not lines:
        return {"result": "No text found on the note.", "lines": []}

    guess = guess_currency_from_text(lines)
    return {"result": guess, "lines": lines}
