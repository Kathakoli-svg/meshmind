# SocLoop – Backend Setup Guide

---

## Prerequisites

### 1. Python 3.10+
```bash
python --version   # must be 3.10 or higher
```
Download from https://www.python.org/downloads/ if needed.

### 2. pip (comes with Python)
```bash
pip --version
```

### 3. Node.js 18+ (for frontend – you likely already have this)
```bash
node --version
```

---

## Backend Setup

### Step 1 – Create and activate a virtual environment
```bash
cd socloop-backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### Step 2 – Install all dependencies
```bash
pip install -r requirements.txt
```

This installs:
| Package | Purpose |
|---|---|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `python-multipart` | File/form uploads |
| `sqlalchemy` | ORM (SQLite DB) |
| `python-jose[cryptography]` | JWT tokens |
| `passlib[bcrypt]` | Password hashing |
| `ultralytics` | YOLOv8 detection |
| `pillow` | Image processing |
| `python-dotenv` | .env file loading |
| `aiofiles` | Async file serving |

> **Note:** `ultralytics` will auto-download `yolov8n.pt` (~6 MB) on first run.

### Step 3 – Run the backend
```bash
uvicorn main:app --reload --port 8000
```

Backend is now live at: http://127.0.0.1:8000  
Swagger docs at: http://127.0.0.1:8000/docs

---

## Frontend Setup

### Step 1 – Copy changed files into your frontend
Replace/copy these files from `FRONTEND_CHANGES/` into your `socloop/` project:

```
FRONTEND_CHANGES/src/api/axios.js           → socloop/src/api/axios.js
FRONTEND_CHANGES/src/context/AuthContext.jsx → socloop/src/context/AuthContext.jsx
FRONTEND_CHANGES/src/main.jsx               → socloop/src/main.jsx
FRONTEND_CHANGES/src/pages/Login.jsx        → socloop/src/pages/Login.jsx
FRONTEND_CHANGES/src/pages/Signup.jsx       → socloop/src/pages/Signup.jsx
FRONTEND_CHANGES/src/pages/Browse.jsx       → socloop/src/pages/Browse.jsx
```

### Step 2 – Run the frontend
```bash
cd socloop
npm install
npm run dev
```

Frontend is at: http://localhost:5173

---

## Project Structure

```
socloop-backend/
├── main.py              ← FastAPI app + CORS + static files
├── database.py          ← SQLite engine + get_db dependency
├── models.py            ← User + Item ORM models
├── schemas.py           ← Pydantic request/response schemas
├── auth.py              ← JWT helpers + get_current_user
├── yolo_detect.py       ← YOLOv8 inference + category mapping
├── requirements.txt
├── routes/
│   ├── auth_routes.py   ← POST /auth/register, /auth/login, GET /auth/me
│   ├── donate_routes.py ← POST /donate (multipart + YOLO)
│   └── items_routes.py  ← GET /items, GET /items/{id}
├── uploads/             ← saved donation images (auto-created)
├── socloop.db           ← SQLite database (auto-created)
└── FRONTEND_CHANGES/    ← updated frontend files
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account → returns JWT |
| POST | `/auth/login` | No | Login → returns JWT |
| GET | `/auth/me` | Yes (JWT) | Get current user |
| POST | `/donate` | Optional | Upload item + YOLO detection |
| GET | `/items` | No | List all items (filter: category, search) |
| GET | `/items/{id}` | No | Get single item |

---

## How YOLO Works

1. User uploads an image on the Donate page
2. Backend sends image bytes to YOLOv8 nano model
3. Top detected object is mapped to a SocLoop category:
   - `book` → **Books**
   - `laptop / tv / cell phone` → **Electronics**
   - `backpack / scissors` → **School Supplies**
   - `tie / suitcase / handbag` → **Clothes**
   - everything else → **Utility Items**
4. `detected_category` is saved to DB and returned to frontend
5. Browse page displays the AI-detected category on each item card

---

## Environment Variables (optional)

Create a `.env` file in `socloop-backend/`:
```
SECRET_KEY=your-super-secret-key-here
```

Default secret is fine for development but **must** be changed for production.
