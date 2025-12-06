Oculix — AI Smart Assistive Glasses for the Visually Impaired

Developed by Maitreyee Choudhari & Yash
Assistive Technology · Computer Vision · Embedded Systems · AI for Accessibility

Oculix is an AI-powered assistive vision system designed to help blind and low-vision users understand their surroundings through real-time audio feedback. It integrates computer vision, speech recognition, OCR, and hardware sensor data into a unified accessibility tool.

Features
1. Describe Scene

Uses YOLOv8 object detection

Generates a natural language description based on detected objects

Audio output for blind users

2. Object Detection

Live object detection using YOLOv8

Identifies multiple objects in real time

Produces spoken output

3. Read Simple Text (OCR)

Uses EasyOCR

Supports noisy or low-quality images

Includes preprocessing for higher accuracy

Text is spoken aloud

4. Read Document (Enhanced OCR)

Advanced processing pipeline using OpenCV

Grayscale conversion, thresholding, and denoising

Suitable for paragraphs, labels, documents, receipts

5. Currency Recognition

Identifies currency notes using a trained YOLO model

6. Fall Detection (MPU6050)

Reads accelerometer and gyroscope data

Detects falls using threshold and orientation logic

Designed for emergency alerts

7. Voice Command Navigation

Supports commands such as “describe scene”, “read text”, “detect objects”, “currency”, and “fall detection”

Enables complete hands-free operation

8. React Frontend with Accessible UI

Clean pastel color scheme

Large mode buttons

Live camera preview

Automatic text-to-speech for all modes

Tech Stack
Frontend

React.js

Web Speech API (voice commands and text-to-speech)

Fetch API

Custom UI styling (pastel theme)

Backend

FastAPI

YOLOv8 (Ultralytics)

EasyOCR

OpenCV

NumPy

Python 3.13

Hardware

ESP32-CAM: live video feed

ESP32-WROOM-32: voice command logic (planned)

INMP441 microphone

MPU6050 for fall detection

Bluetooth audio output

Power bank for portability

Project Structure
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

How to Run
Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload


Runs at:
http://localhost:8000

Frontend
cd frontend
npm install
npm start


Runs at:
http://localhost:3000

Hardware Integration (Prototype Stage)
ESP32-CAM

Streams live video to the system

Can replace laptop webcam

ESP32-WROOM

Future: voice commands without PC

BLE connection to earphones

INMP441

Captures user voice

MPU6050

Provides accelerometer and gyro data

Detects sudden falls

What Makes This Project Unique (Viva Explanation)

Custom OCR preprocessing pipeline that improves accuracy on low-quality images.

Fully modular FastAPI architecture using routers and utility modules.

Hardware integration: ESP32-CAM, MPU6050, and future voice-module support.

Hands-free operation through voice commands.

Accessibility-focused UI design.

Production-ready folder structure and GitHub repository.

End-to-end system combining software + hardware + AI.

This is significantly beyond simply “using YOLO + OCR” and demonstrates engineering, system design, and innovation.

Future Enhancements

Integrate Florence or BLIP for AI-based scene captioning

Offline TTS using Coqui

Face recognition for known people

GPS + BLE emergency alert system

Cloud inference for heavy models

3D-printed wearable prototype design

Mobile app version
