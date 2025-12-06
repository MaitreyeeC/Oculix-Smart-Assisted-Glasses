from fastapi import APIRouter

router = APIRouter()

@router.get("/fall-detection")
async def fall_detection_status():
    """
    Placeholder fall detection.
    Later: connect to ESP32 + MPU6050 event stream.
    """
    return {
        "fall_detected": False,
        "message": "No fall detected in the recent monitoring window."
    }
