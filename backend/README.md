# Queueless Backend

This is the production-ready FastAPI backend for the Queueless printing management system.

## Setup Instructions & Terminal Commands

### 1. Prerequisite Setup
If you encountered module errors previously, it's because the Python packages hadn't been installed yet. 
Run this in your terminal to install them universally for your current user:
```bash
pip install -r requirements.txt
```

### 2. Database Creation (Queueless DB)
Before running the backend, create the required PostgreSQL database (`queueless_db`). You can use the provided script:
```bash
python create_db.py
```
*(Note: I have already run this step for you!)*

### 3. Start the Application
To run the FastAPI server with live-reloading, **restart** your `uvicorn` instance so it picks up the newly installed modules:
```bash
uvicorn main:app --reload
```

The application will start on `http://127.0.0.1:8000`. 
- Visit `http://127.0.0.1:8000/docs` to see the complete interactive API documentation.
