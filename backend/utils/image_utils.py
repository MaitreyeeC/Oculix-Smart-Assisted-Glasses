from io import BytesIO
from typing import List

from PIL import Image
import numpy as np

from utils.models import ocr_reader


def load_image_from_upload(file_bytes: bytes) -> Image.Image:
    """
    Simple loader: bytes -> PIL RGB.
    (Still used for non-OCR things if needed.)
    """
    img = Image.open(BytesIO(file_bytes))
    return img.convert("RGB")


def run_ocr(img: Image.Image) -> List[str]:
    img_np = np.array(img)

    # Run OCR with confidence + bounding box
    results = ocr_reader.readtext(
        img_np,
        detail=1,           # get (bbox, text, confidence)
        paragraph=True,     # group into readable lines
    )

    cleaned_lines = []
    for bbox, text, confidence in results:
        if confidence > 0.45:  # ignore trash text below 45%
            cleaned_text = text.strip()
            if cleaned_text:
                cleaned_lines.append(cleaned_text)

    return cleaned_lines
    unique = []
    for x in cleaned_lines:
        if x not in unique:
            unique.append(x)

    return unique   # ← Replace return cleaned_lines



def guess_currency_from_text(lines: List[str]) -> str:
    """
    Very simple heuristic: look for common Indian note values in OCR text.
    """
    joined = " ".join(lines).replace(",", " ")
    candidates = ["10", "20", "50", "100", "200", "500", "2000"]
    found = []

    for c in candidates:
        if c in joined:
            found.append(c)

    if not found:
        return "I could not confidently detect the currency value."
    else:
        value = max(int(v) for v in found)
        return f"It looks like a ₹{value} note."
