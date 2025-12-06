from ultralytics import YOLO
import easyocr

print(" Loading YOLO model (from utils.models)...")
yolo_model = YOLO("yolov8n.pt")

print(" Loading EasyOCR reader (from utils.models)...")
ocr_reader = easyocr.Reader(['en'], gpu=False)
