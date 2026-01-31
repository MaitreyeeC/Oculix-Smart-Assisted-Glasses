# Oculix — AI Smart Assistive Glasses for the Visually Impaired
**Developed by Maitreyee Choudhari & Yash Patil**
Status-Patent Pending (Application no.202621005704)

Assistive Technology · Computer Vision · Embedded Systems · AI for Accessibility 

Oculix is an AI-powered assistive vision system designed to help blind and low-vision users understand their surroundings through real-time audio feedback. It integrates computer vision, speech recognition, OCR, and hardware sensor data into a unified accessibility tool.

## **Features**
***1. Describe Scene***

-Uses YOLOv8 object detection

-Generates a natural language description based on detected objects

-Audio output for blind users

***2. Object Detection***

-Live object detection using YOLOv8

-Identifies multiple objects in real time

-Produces spoken output

***3. Read Simple Text (OCR)***

-Uses EasyOCR

-Supports noisy or low-quality images

-Includes preprocessing for higher accuracy

-Text is spoken aloud

***4. Read Document (Enhanced OCR)***

-Advanced processing pipeline using OpenCV

-Grayscale conversion, thresholding, and denoising

-Suitable for paragraphs, labels, documents, receipts

***5. Currency Recognition***

-Identifies currency notes using a trained YOLO model

***6. Fall Detection (MPU6050)***

-Reads accelerometer and gyroscope data

-Detects falls using threshold and orientation logic

-Designed for emergency alerts

***7. Voice Command Navigation***

-Supports commands such as “describe scene”, “read text”, “detect objects”, “currency”, and “fall detection”

-Enables complete hands-free operation

***8. React Frontend with Accessible UI***

-Clean pastel color scheme

-Large mode buttons

-Live camera preview

-Automatic text-to-speech for all modes

## **Tech Stack**
**Frontend**

React.js, Web Speech API (voice commands and text-to-speech), Fetch API, Custom UI styling (pastel theme)

**Backend**

FastAPI, YOLOv8 (Ultralytics), EasyOCR, OpenCV, NumPy, Python 3.13

**Hardware**

1.ESP32-CAM: live video feed

2.ESP32-WROOM-32: voice command logic (planned)

3.INMP441 microphone

4.MPU6050 for fall detection

5.Bluetooth audio output

6.Power bank for portability

## **Project Structure**
```
Oculix/
│
├── backend/
│   ├── main.py
│   ├── routers/
│   │   ├── describe_scene.py
│   │   ├── detect_objects.py
│   │   ├── read_text.py
│   │   ├── read_document.py
│   │   ├── currency.py
│   │   └── fall_detection.py
│   └── utils/
│       ├── models.py
│       ├── preprocessing.py
│       └── image_utils.py
│
└── frontend/
    └── src/
        ├── App.js
        ├── index.js
        ├── App.css
        └── components/
```
## **How to Run**
**Backend -**

step1: cd backend

step2: source venv/bin/activate

step3: uvicorn main:app --reload

Runs at:
http://localhost:8000

**Frontend -**

step1: cd frontend

step2: npm install

step3: npm start

Runs at:
http://localhost:3000

## **Hardware Integration (Prototype Stage)**
ESP32-CAM- Streams live video to the system and Can replace laptop webcam

ESP32-WROOM- Future: voice commands without PC, BLE connection to earphones

INMP441- Captures user voice

MPU6050- Provides accelerometer and gyro data and detects sudden falls

