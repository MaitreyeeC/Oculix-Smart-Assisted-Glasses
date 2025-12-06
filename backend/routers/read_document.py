from fastapi import APIRouter, UploadFile, File

from utils.preprocessing import preprocess_for_ocr_from_bytes
from utils.image_utils import run_ocr

router = APIRouter()

@router.post("/read-document")
async def read_document(file: UploadFile = File(...)):
    """
    Reads longer documents using your preprocessing pipeline.
    """
    image_bytes = await file.read()

    preprocessed_img = preprocess_for_ocr_from_bytes(image_bytes)
    lines = run_ocr(preprocessed_img)

    if not lines:
        return {"full_text": "", "message": "No readable document text found."}

    full_text = "\n".join(lines)
    return {"full_text": full_text}
