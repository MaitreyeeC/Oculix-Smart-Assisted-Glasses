import cv2
import numpy as np
from typing import Tuple
from PIL import Image


def _bytes_to_cv2_image(file_bytes: bytes):
    """
    Convert raw bytes (from UploadFile.read()) into an OpenCV BGR image.
    """
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def _to_grayscale(img_bgr):
    return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)


def _remove_noise(gray):
    """
    Use a slight blur to remove salt-and-pepper noise while preserving edges.
    """
    return cv2.GaussianBlur(gray, (5, 5), 0)


def _adaptive_threshold(gray):
    """
    Adaptive thresholding to handle uneven lighting.
    Returns a binary image (black text on white background).
    """
    # Otsu combined with binary inversion often works well for text.
    _, th = cv2.threshold(
        gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )
    return th


def _deskew(binary_img):
    """
    Deskew the image based on the angle of the text.
    Uses the minimum area rectangle around non-zero pixels.
    """
    coords = np.column_stack(np.where(binary_img > 0))
    if coords.shape[0] < 50:
        # Not enough text pixels, skip
        return binary_img

    rect = cv2.minAreaRect(coords)
    angle = rect[-1]

    # OpenCV returns angle in range (-90, 0]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    (h, w) = binary_img.shape[:2]
    center = (w // 2, h // 2)

    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(binary_img, M, (w, h),
                             flags=cv2.INTER_CUBIC,
                             borderMode=cv2.BORDER_REPLICATE)
    return rotated


def _enhance_contrast(gray):
    """
    Use CLAHE (Contrast Limited Adaptive Histogram Equalization)
    to enhance readability of faint text.
    """
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    return clahe.apply(gray)


def _find_document_contour(gray) -> Tuple[bool, np.ndarray]:
    """
    Try to find a large rectangular contour (like a document).
    If found, return (True, approx_points).
    """
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 50, 150)

    contours, _ = cv2.findContours(
        edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return False, None

    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    for cnt in contours[:5]:
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

        # Document-like contour should have 4 corners
        if len(approx) == 4:
            return True, approx

    return False, None


def _order_points(pts):
    """
    Order 4 points of a quadrilateral in consistent order:
    top-left, top-right, bottom-right, bottom-left.
    """
    rect = np.zeros((4, 2), dtype="float32")

    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # smallest sum -> top-left
    rect[2] = pts[np.argmax(s)]  # largest sum -> bottom-right

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]  # smallest diff -> top-right
    rect[3] = pts[np.argmax(diff)]  # largest diff -> bottom-left

    return rect


def _perspective_transform(img, contour):
    """
    Warp the image so the detected document fills the frame.
    """
    pts = contour.reshape(4, 2)
    rect = _order_points(pts)

    (tl, tr, br, bl) = rect

    # compute width & height of new image
    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = int(max(widthA, widthB))

    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = int(max(heightA, heightB))

    dst = np.array(
        [
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1],
        ],
        dtype="float32",
    )

    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(img, M, (maxWidth, maxHeight))
    return warped

def preprocess_for_simple_text_from_bytes(file_bytes: bytes) -> Image.Image:
    """
    Lighter pipeline for small product labels / cream tubes / boxes.
    No perspective warp or deskew (they can distort curved surfaces).
    Just:
      - bytes -> BGR
      - grayscale
      - denoise
      - contrast boost
      - slight upscaling
    """
    img_bgr = _bytes_to_cv2_image(file_bytes)
    if img_bgr is None:
        raise ValueError("Could not decode image from bytes.")

    # grayscale
    gray = _to_grayscale(img_bgr)

    # noise removal
    denoised = _remove_noise(gray)

    # contrast enhancement
    enhanced = _enhance_contrast(denoised)

    # upscale a bit to make small text more readable
    h, w = enhanced.shape[:2]
    scale = 1.5
    resized = cv2.resize(
        enhanced,
        (int(w * scale), int(h * scale)),
        interpolation=cv2.INTER_CUBIC,
    )

    # convert back to RGB for OCR
    rgb = cv2.cvtColor(resized, cv2.COLOR_GRAY2RGB)
    return Image.fromarray(rgb)

def preprocess_for_ocr_from_bytes(file_bytes: bytes) -> Image.Image:
    """
    High-level pipeline:
      1) bytes -> cv2 image
      2) grayscale
      3) optional perspective correction (for documents)
      4) noise removal
      5) contrast enhancement
      6) adaptive threshold
      7) deskew

    Returns a PIL.Image (RGB) suitable for passing to EasyOCR.
    """
    img_bgr = _bytes_to_cv2_image(file_bytes)
    if img_bgr is None:
        raise ValueError("Could not decode image from bytes.")

    # Step 1: grayscale
    gray = _to_grayscale(img_bgr)

    # Step 2: try to detect a document contour and warp if possible
    found_doc, contour = _find_document_contour(gray)
    if found_doc and contour is not None:
        warped = _perspective_transform(gray, contour)
        gray = warped  # work with the warped grayscale
    # else: keep original gray

    # Step 3: noise removal
    denoised = _remove_noise(gray)

    # Step 4: contrast enhancement
    enhanced = _enhance_contrast(denoised)

    # Step 5: thresholding
    binary = enhanced

    # Step 6: deskew
    deskewed = _deskew(binary)

    # At this point deskewed is single-channel (grayscale). Convert to RGB for OCR.
    rgb = cv2.cvtColor(deskewed, cv2.COLOR_GRAY2RGB)

    # Convert back to PIL for existing OCR pipeline
    pil_img = Image.fromarray(rgb)
    return pil_img
