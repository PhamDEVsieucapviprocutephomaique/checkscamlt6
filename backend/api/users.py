from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import models.models as models
import models.schemas as schemas
from core.auth import (
    get_current_user, get_current_active_user, 
    get_current_admin, get_password_hash, create_access_token
)
from core.database import get_db
from services.ftp_service import ftp_service
from datetime import datetime, timedelta

router = APIRouter(prefix="/users", tags=["users"])

# ===== AUTH ENDPOINTS =====
@router.post("/register", response_model=schemas.UserResponse)
async def register(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Đăng ký tài khoản mới"""
    # Kiểm tra username tồn tại
    existing_user = db.query(models.User).filter(
        (models.User.username == user_data.username) |
        (models.User.email == user_data.email) |
        (models.User.phone == user_data.phone)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username, email hoặc số điện thoại đã tồn tại"
        )
    
    # Tạo user mới - FIX: dùng string 'user' thay vì UserRole.USER
    hashed_password = get_password_hash(user_data.password)
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        role='user'  # FIX: Dùng string 'user' thay vì models.UserRole.USER
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=schemas.Token)
async def login(
    login_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """Đăng nhập"""
    user = db.query(models.User).filter(
        (models.User.username == login_data.username) |
        (models.User.email == login_data.username) |
        (models.User.phone == login_data.username)
    ).first()
    
    if not user or not user.verify_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản đã bị vô hiệu hóa"
        )
    
    # Cập nhật last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Tạo token
    access_token = create_access_token(
        data={"sub": str(user.id)}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: models.User = Depends(get_current_active_user)):
    """Lấy thông tin user hiện tại"""
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
async def update_me(
    update_data: dict,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin user"""
    updatable_fields = ["full_name", "phone", "email", "zalo_contact"]
    
    for field in updatable_fields:
        if field in update_data and update_data[field]:
            setattr(current_user, field, update_data[field])
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload avatar"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ chấp nhận file ảnh"
        )
    
    # Upload lên FTP
    avatar_url = await ftp_service.upload_file(file)
    
    # Cập nhật user
    current_user.avatar_url = avatar_url
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"avatar_url": avatar_url}

# ===== ADMIN USER MANAGEMENT =====
@router.get("/", response_model=List[schemas.UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lấy danh sách users (Admin only)"""
    query = db.query(models.User)
    
    if role:
        query = query.filter(models.User.role == role)
    if is_active is not None:
        query = query.filter(models.User.is_active == is_active)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=schemas.UserResponse)
async def get_user(
    user_id: int,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lấy thông tin user theo ID (Admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=schemas.UserResponse)
async def update_user(
    user_id: int,
    update_data: dict,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Cập nhật user (Admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    updatable_fields = ["role", "is_active", "is_verified", "full_name", "phone", "email"]
    
    for field in updatable_fields:
        if field in update_data:
            setattr(user, field, update_data[field])
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Xóa user (Admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role == 'admin':  # FIX: dùng string 'admin' thay vì models.UserRole.ADMIN
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete admin user"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}