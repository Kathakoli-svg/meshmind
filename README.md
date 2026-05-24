# SocLoop 🔁

A community-driven donation platform that connects donors with recipients using AI-powered item detection.

---

## 📌 Overview

SocLoop allows users to donate usable items by uploading a photo. The backend automatically detects and categorizes the item using a 3-tier AI pipeline. Recipients can browse, filter, and request donated items directly from donors.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Axios |
| Backend | FastAPI, Python, SQLAlchemy |
| Database | SQLite |
| AI Detection | YOLOv8 (Ultralytics), CLIP (OpenAI via Transformers) |
| Auth | JWT (python-jose), bcrypt (passlib) |

---

## 🤖 How It Works

1. User registers/logs in via JWT authentication
2. Donor fills item details and uploads a photo on the Donate page
3. Backend runs the 3-tier AI detection pipeline on the image
4. Detected category + item saved to database
5. Item appears instantly on the Browse page
6. Recipient searches, views donor contact details, and requests the item

---

## 🔍 AI Detection Pipeline

```
User uploads image
        ↓
YOLOv8 Object Detection (80 COCO classes)
        ↓ (if no match)
YOLOv8 ImageNet Classification (1000 classes)
        ↓ (if no match)
CLIP Zero-Shot Classification
        ↓
Category → Books / Clothes / Electronics / School Supplies / Utility Items
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account → returns JWT |
| POST | `/auth/login` | Login → returns JWT |
| GET | `/auth/me` | Get current user |
| POST | `/donate` | Upload item + AI detection |
| GET | `/items` | List items (filter by category/search) |
| GET | `/items/{id}` | Get single item with donor info |
