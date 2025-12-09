from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter(prefix="/activity", tags=["Activity Log"])  

DB_FILE = os.path.join(os.path.dirname(__file__), "..", "activity.json")

class ActivityEntry(BaseModel):
    id: int
    mode: str
    message: str
    time: str

def read_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump([], f)
        return []
    with open(DB_FILE, "r") as f:
        return json.load(f)

def write_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

@router.get("/")
def get_logs():
    return read_db()

@router.post("/add")
def add_log(mode: str, message: str, time: str):
    logs = read_db()
    new_entry = {
        "id": len(logs) + 1,
        "mode": mode,
        "message": message,
        "time": time
    }
    logs.insert(0, new_entry)
    write_db(logs)
    return {"status": "success", "saved": new_entry}
