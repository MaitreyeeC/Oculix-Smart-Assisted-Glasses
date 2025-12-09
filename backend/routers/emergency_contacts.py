from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import json
import os

router = APIRouter(prefix="/emergency", tags=["Emergency Contacts"])

# Get backend folder path dynamically (so it works anywhere)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_FILE = os.path.join(BASE_DIR, "contacts.json")

print("📁 Contacts DB saving to:", DB_FILE)  # Debug - remove later

class Contact(BaseModel):
    name: str
    phone: str

def read_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump([], f)
        return []
    with open(DB_FILE, "r") as file:
        return json.load(file)

def write_db(data):
    with open(DB_FILE, "w") as file:
        json.dump(data, file, indent=4)

@router.get("/contacts", response_model=List[Contact])
def get_contacts():
    return read_db()

@router.post("/contacts")
def add_contact(contact: Contact):
    data = read_db()
    data.append(contact.dict())
    write_db(data)
    return {"status": "success", "message": "Contact saved to backend"}

@router.delete("/contacts/{phone}")
def delete_contact(phone: str):
    data = read_db()
    updated = [c for c in data if c["phone"] != phone]
    write_db(updated)
    return {"status": "success", "message": "Contact deleted"}
