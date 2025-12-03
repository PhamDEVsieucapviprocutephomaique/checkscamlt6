# api/room_api.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from core.database import get_async_session
from core.auth import current_active_user
from models.models import User, Room

router = APIRouter()

# ===== ENDPOINTS =====

# GET - Lấy tất cả phòng của chủ trọ
@router.get("/my-rooms", response_model=List[dict])
async def get_my_rooms(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Lấy danh sách phòng của landlord"""
    if user.role != "landlord":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ chủ trọ mới có quyền truy cập"
        )
    
    result = await session.execute(
        select(Room)
        .where(Room.landlord_id == user.id)
        .order_by(Room.created_at.desc())  # 👈 THÊM DÒNG NÀY
    )
    rooms = result.scalars().all()
    
    return [
        {
            "id": str(room.id),
            "title": room.title,
            "description": room.description,
            "province": room.province,
            "district": room.district, 
            "ward": room.ward,
            "address_detail": room.address_detail,
            "area": room.area,
            "price": room.price,
            "room_status": room.room_status,
            "images": room.images or [],
            "created_at": room.created_at.isoformat()
        }
        for room in rooms
    ]

# GET - Chi tiết 1 phòng
@router.get("/{room_id}", response_model=dict)
async def get_room(
    room_id: UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Xem chi tiết phòng"""
    result = await session.execute(
        select(Room).where(Room.id == room_id)
    )
    room = result.scalar_one_or_none()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phòng"
        )
    
    if room.landlord_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền truy cập phòng này"
        )
    
    return {
        "id": str(room.id),
        "title": room.title,
        "description": room.description,
        "province": room.province,
        "district": room.district,
        "ward": room.ward,
        "address_detail": room.address_detail,
        "area": room.area,
        "price": room.price,
        "room_status": room.room_status,
        "images": room.images or [],
        "created_at": room.created_at.isoformat()
    }

# POST - Tạo phòng mới
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: dict,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Đăng phòng mới"""
    if user.role != "landlord":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ chủ trọ mới được đăng phòng"
        )
    
    # Validate
    required_fields = ["title", "province", "district", "ward", "address_detail", "area", "price"]
    for field in required_fields:
        if field not in room_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Thiếu trường bắt buộc: {field}"
            )
    
    # Validate kiểu dữ liệu
    try:
        area = float(room_data["area"])
        price = float(room_data["price"])
        
        if area <= 0 or area > 1000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Diện tích phải > 0 và <= 1000"
            )
        
        if price <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Giá phải > 0"
            )
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Diện tích và giá phải là số"
        )
    
    # Tạo phòng
    new_room = Room(
        landlord_id=user.id,
        title=room_data["title"],
        description=room_data.get("description"),
        province=room_data["province"],
        district=room_data["district"],
        ward=room_data["ward"],
        address_detail=room_data["address_detail"],
        area=area,
        price=price,
        room_status=room_data.get("room_status", "available"),
        images=room_data.get("images", [])
    )
    
    session.add(new_room)
    await session.commit()
    await session.refresh(new_room)
    
    return {
        "message": "Đăng phòng thành công",
        "room": {
            "id": str(new_room.id),
            "title": new_room.title,
            "price": new_room.price,
            "area": new_room.area,
            "address": f"{new_room.address_detail}, {new_room.ward}, {new_room.district}, {new_room.province}",
            "status": new_room.room_status,
            "created_at": new_room.created_at.isoformat()
        }
    }

# PUT - Cập nhật phòng
@router.put("/{room_id}")
async def update_room(
    room_id: UUID,
    room_data: dict,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Cập nhật phòng"""
    if user.role != "landlord":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ chủ trọ mới được cập nhật phòng"
        )
    
    result = await session.execute(
        select(Room).where(Room.id == room_id)
    )
    room = result.scalar_one_or_none()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phòng"
        )
    
    if room.landlord_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền cập nhật phòng này"
        )
    
    # Validate nếu update area/price
    if "area" in room_data:
        try:
            area = float(room_data["area"])
            if area <= 0 or area > 1000:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Diện tích phải > 0 và <= 1000"
                )
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Diện tích phải là số"
            )
    
    if "price" in room_data:
        try:
            price = float(room_data["price"])
            if price <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Giá phải > 0"
                )
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Giá phải là số"
            )
    
    # Update
    updatable_fields = ["title", "description", "province", "district", "ward", 
                       "address_detail", "area", "price", "room_status", "images"]
    for field in updatable_fields:
        if field in room_data:
            setattr(room, field, room_data[field])
    
    await session.commit()
    await session.refresh(room)
    
    return {
        "message": "Cập nhật phòng thành công",
        "room": {
            "id": str(room.id),
            "title": room.title,
            "price": room.price,
            "area": room.area,
            "status": room.room_status
        }
    }

# DELETE - Xóa phòng
@router.delete("/{room_id}")
async def delete_room(
    room_id: UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Xóa phòng"""
    if user.role != "landlord":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ chủ trọ mới được xóa phòng"
        )
    
    result = await session.execute(
        select(Room).where(Room.id == room_id)
    )
    room = result.scalar_one_or_none()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phòng"
        )
    
    if room.landlord_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xóa phòng này"
        )
    
    await session.delete(room)
    await session.commit()
    
    return {"message": "Xóa phòng thành công"}