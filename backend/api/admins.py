from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import models.models as models
import models.schemas as schemas
from core.auth import get_current_user, get_current_active_user, get_current_admin, get_current_super_admin
from core.database import get_db
from services.ftp_service import ftp_service

router = APIRouter(prefix="/admins", tags=["admins"])

# ===== PUBLIC ENDPOINTS =====
@router.get("/", response_model=List[schemas.AdminProfileResponse])
async def get_admins(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Lấy danh sách admin công khai"""
    admins = db.query(models.AdminProfile).filter(
        models.AdminProfile.is_public == True
    ).order_by(models.AdminProfile.admin_number).offset(skip).limit(limit).all()
    
    return admins

@router.get("/{admin_number}", response_model=schemas.AdminProfileResponse)
async def get_admin_by_number(
    admin_number: int,
    db: Session = Depends(get_db)
):
    """Lấy thông tin admin theo số thứ tự"""
    admin = db.query(models.AdminProfile).filter(
        models.AdminProfile.admin_number == admin_number,
        models.AdminProfile.is_public == True
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    return admin

# ===== ADMIN ENDPOINTS =====
@router.post("/profiles", response_model=schemas.AdminProfileResponse)
async def create_admin_profile(
    profile_data: schemas.AdminProfileCreate,
    current_user: models.User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Tạo profile admin (Super Admin only)"""
    # Kiểm tra user
    user = db.query(models.User).filter(models.User.id == profile_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Kiểm tra đã có profile chưa
    existing_profile = db.query(models.AdminProfile).filter(
        (models.AdminProfile.user_id == profile_data.user_id) |
        (models.AdminProfile.admin_number == profile_data.admin_number)
    ).first()
    
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin profile already exists or admin number is taken"
        )
    
    # Tạo profile
    profile = models.AdminProfile(
        **profile_data.dict()
    )
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    return profile

@router.get("/profiles/all", response_model=List[schemas.AdminProfileResponse])
async def get_all_admin_profiles(
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lấy tất cả admin profiles (Admin only)"""
    profiles = db.query(models.AdminProfile).order_by(
        models.AdminProfile.admin_number
    ).offset(skip).limit(limit).all()
    
    return profiles

@router.put("/profiles/{profile_id}", response_model=schemas.AdminProfileResponse)
async def update_admin_profile(
    profile_id: int,
    update_data: dict,
    current_user: models.User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Cập nhật admin profile (Super Admin only)"""
    profile = db.query(models.AdminProfile).filter(models.AdminProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    updatable_fields = [
        "admin_number", "facebook_main", "facebook_backup", "zalo", 
        "website", "services", "bank_accounts", "insurance_fund", "is_public"
    ]
    
    for field in updatable_fields:
        if field in update_data:
            setattr(profile, field, update_data[field])
    
    db.commit()
    db.refresh(profile)
    
    return profile

@router.delete("/profiles/{profile_id}")
async def delete_admin_profile(
    profile_id: int,
    current_user: models.User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Xóa admin profile (Super Admin only)"""
    profile = db.query(models.AdminProfile).filter(models.AdminProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    db.delete(profile)
    db.commit()
    
    return {"message": "Admin profile deleted successfully"}