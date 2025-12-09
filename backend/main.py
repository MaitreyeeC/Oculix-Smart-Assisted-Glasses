from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routers.describe_scene import router as describe_scene_router
from routers.detect_objects import router as detect_objects_router
from routers.read_text import router as read_text_router
from routers.read_document import router as read_document_router
from routers.currency import router as currency_router
from routers.fall_detection import router as fall_detection_router
from routers.emergency_contacts import router as emergency_router
from routers.activity import router as activity_router   # NEW

app = FastAPI(title="Oculix Seeing AI Backend")

# CORS so React can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(describe_scene_router)
app.include_router(detect_objects_router)
app.include_router(read_text_router)
app.include_router(read_document_router)
app.include_router(currency_router)
app.include_router(fall_detection_router)
app.include_router(emergency_router)
app.include_router(activity_router)   # NEW

# -------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "Oculix backend is running ✨",
        "routes": [
            "/describe-scene",
            "/detect-objects",
            "/read-text",
            "/read-document",
            "/currency",
            "/fall-detection",
            "/activity",
        ],
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
