from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import Token
from app.services.auth_service import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 uses "username" for the identifier, we map it to "email"
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Payload
    payload = {
        "sub": user.email, 
        "role": user.role, 
        "shop_id": user.shop_id
    }
    
    access_token = create_access_token(
        data=payload, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


from pydantic import BaseModel
from typing import Optional

class GoogleSyncRequest(BaseModel):
    email: str
    name: str
    google_id: Optional[str] = None

@router.post("/google", response_model=Token)
def sync_google_auth(req: GoogleSyncRequest, db: Session = Depends(get_db)):
    """Automatically logs in or registers a user via Google OAuth."""
    # Find existing user by email or Google ID
    user = db.query(User).filter(
        (User.email == req.email) | (User.google_id == req.google_id)
    ).first()

    if not user:
        # Auto-register new Google user
        assigned_role = "admin" if req.email == "admin@queueless.com" else "student"
        user = User(
            name=req.name,
            email=req.email,
            google_id=req.google_id,
            password_hash=None, # No password for OAuth users
            role=assigned_role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Link google_id if it's a first time google login for existing email
        if not user.google_id and req.google_id:
            user.google_id = req.google_id
            db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": user.email, 
        "role": user.role, 
        "shop_id": user.shop_id
    }
    
    access_token = create_access_token(
        data=payload, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
