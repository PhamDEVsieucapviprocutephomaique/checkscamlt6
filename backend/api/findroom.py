# api/find_room_api.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from core.database import get_async_session
from models.models import User, Room

from services.elasticsearch_service import search_rooms as es_search

router = APIRouter()

# ===== API 1: LỌC PHÒNG THEO LOCATION + FILTERS (CHỈ TRẢ VỀ TRANG 1) =====
@router.post("/search")
async def search_rooms(
    search_data: dict,
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(20, ge=1, le=100)
):
    """
    API LỌC PHÒNG - CHỈ TRẢ VỀ TRANG 1
    
    Body mẫu:
    {
        "location": {
            "province": "Hà Nội",
            "district": "Cầu Giấy", 
            "ward": "Dịch Vọng"
        },
        "filters": {
            "price": {"min": 2000000, "max": 5000000},
            "area": {"min": 20, "max": 30}
        }
    }
    """
    
    # Base query - chỉ lấy phòng available
    query = select(Room).where(Room.room_status == "available")
    
    # ===== LOCATION FILTERS =====
    location = search_data.get("location", {})
    if location:
        if location.get("province"):
            query = query.where(Room.province.ilike(f"%{location['province']}%"))
        
        if location.get("district"):
            query = query.where(Room.district.ilike(f"%{location['district']}%"))
        
        if location.get("ward"):
            query = query.where(Room.ward.ilike(f"%{location['ward']}%"))
    
    # ===== FILTERS =====
    filters = search_data.get("filters", {})
    
    # Price filter
    if filters.get("price"):
        price_filter = filters["price"]
        
        if price_filter.get("min") is not None:
            try:
                min_price = float(price_filter["min"])
                query = query.where(Room.price >= min_price)
            except (ValueError, TypeError):
                pass
        
        if price_filter.get("max") is not None:
            try:
                max_price = float(price_filter["max"])
                query = query.where(Room.price <= max_price)
            except (ValueError, TypeError):
                pass
    
    # Area filter
    if filters.get("area"):
        area_filter = filters["area"]
        
        if area_filter.get("min") is not None:
            try:
                min_area = float(area_filter["min"])
                query = query.where(Room.area >= min_area)
            except (ValueError, TypeError):
                pass
        
        if area_filter.get("max") is not None:
            try:
                max_area = float(area_filter["max"])
                query = query.where(Room.area <= max_area)
            except (ValueError, TypeError):
                pass
    
    # Order by created_at desc
    query = query.order_by(Room.created_at.desc())
    
    # Execute query - LẤY TỔNG SỐ
    result = await session.execute(query)
    all_rooms = result.scalars().all()
    total = len(all_rooms)
    
    # CHỈ LẤY TRANG 1
    page = 1
    offset = (page - 1) * limit
    paginated_rooms = all_rooms[offset:offset + limit]
    
    # Format response
    rooms_data = []
    for room in paginated_rooms:
        # Get landlord info
        landlord_result = await session.execute(
            select(User).where(User.id == room.landlord_id)
        )
        landlord = landlord_result.scalar_one_or_none()
        
        rooms_data.append({
            "id": str(room.id),
            "title": room.title,
            "province": room.province,
            "district": room.district,
            "ward": room.ward,
            "area": room.area,
            "price": room.price,
            "images": room.images or [],
            "created_at": room.created_at.isoformat(),
            "landlord_email": landlord.email if landlord else None,
            "landlord_phone": landlord.phone if landlord else None
        })
    
    return {
        "success": True,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 0,
        "rooms": rooms_data
    }


# ===== API MỚI: LẤY DATA THEO PAGE CỤ THỂ =====
@router.post("/search/page/{page_num}")
async def search_rooms_by_page(
    page_num: int,  # ĐÂY LÀ PATH PARAMETER, KHÔNG PHẢI QUERY
    search_data: dict,
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(20, ge=1, le=100)
):
    """
    API LẤY DATA THEO PAGE CỤ THỂ
    
    POST /api/find-rooms/search/page/2
    
    Body: giống hệt API search bình thường
    """
    
    # Base query - chỉ lấy phòng available
    query = select(Room).where(Room.room_status == "available")
    
    # ===== LOCATION FILTERS =====
    location = search_data.get("location", {})
    if location:
        if location.get("province"):
            query = query.where(Room.province.ilike(f"%{location['province']}%"))
        
        if location.get("district"):
            query = query.where(Room.district.ilike(f"%{location['district']}%"))
        
        if location.get("ward"):
            query = query.where(Room.ward.ilike(f"%{location['ward']}%"))
    
    # ===== FILTERS =====
    filters = search_data.get("filters", {})
    
    # Price filter
    if filters.get("price"):
        price_filter = filters["price"]
        
        if price_filter.get("min") is not None:
            try:
                min_price = float(price_filter["min"])
                query = query.where(Room.price >= min_price)
            except (ValueError, TypeError):
                pass
        
        if price_filter.get("max") is not None:
            try:
                max_price = float(price_filter["max"])
                query = query.where(Room.price <= max_price)
            except (ValueError, TypeError):
                pass
    
    # Area filter
    if filters.get("area"):
        area_filter = filters["area"]
        
        if area_filter.get("min") is not None:
            try:
                min_area = float(area_filter["min"])
                query = query.where(Room.area >= min_area)
            except (ValueError, TypeError):
                pass
        
        if area_filter.get("max") is not None:
            try:
                max_area = float(area_filter["max"])
                query = query.where(Room.area <= max_area)
            except (ValueError, TypeError):
                pass
    
    # Order by created_at desc
    query = query.order_by(Room.created_at.desc())
    
    # Execute query - LẤY TỔNG SỐ
    result = await session.execute(query)
    all_rooms = result.scalars().all()
    total = len(all_rooms)
    
    # LẤY DATA THEO PAGE CỤ THỂ
    offset = (page_num - 1) * limit
    paginated_rooms = all_rooms[offset:offset + limit]
    
    # Format response
    rooms_data = []
    for room in paginated_rooms:
        # Get landlord info
        landlord_result = await session.execute(
            select(User).where(User.id == room.landlord_id)
        )
        landlord = landlord_result.scalar_one_or_none()
        
        rooms_data.append({
            "id": str(room.id),
            "title": room.title,
            "province": room.province,
            "district": room.district,
            "ward": room.ward,
            "area": room.area,
            "price": room.price,
            "images": room.images or [],
            "created_at": room.created_at.isoformat(),
            "landlord_email": landlord.email if landlord else None,
            "landlord_phone": landlord.phone if landlord else None
        })
    
    return {
        "success": True,
        "total": total,
        "page": page_num,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 0,
        "rooms": rooms_data
    }


# ===== API 2: TÌM KIẾM THEO KEYWORD (KHÔNG CẦN LOGIN) =====
@router.get("/search-keyword")
async def search_by_keyword(
    keyword: str = Query(..., min_length=1),
    session: AsyncSession = Depends(get_async_session),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    API TÌM KIẾM THEO KEYWORD SỬ DỤNG ELASTICSEARCH ĐỂ XẾP HẠNG
    
    Query params: ?keyword=sinh viên&page=1&limit=20
    """
    
    # 1. TÌM KIẾM BẰNG ELASTICSEARCH ĐỂ CÓ ID ĐÃ XẾP HẠNG VÀ TỔNG SỐ
    try:
        # Gọi hàm search_rooms đã sửa đổi trong elasticsearch_service.py
        # Hàm này trả về List[str] ID và int Total Hits
        ranked_room_ids, total = es_search(
            query_string=keyword, 
            page=page, 
            page_size=limit
        )
    except Exception as e:
        # Xử lý lỗi Elasticsearch
        print(f"🚨 ELASTICSEARCH ERROR DETAIL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi dịch vụ tìm kiếm. Vui lòng thử lại sau."
        )

    
    if not ranked_room_ids:
        # Nếu Elasticsearch không tìm thấy kết quả nào
        return {
            "success": True,
            "keyword": keyword,
            "total": 0,
            "page": page,
            "limit": limit,
            "total_pages": 0,
            "rooms": []
        }
    
    # 2. CHUYỂN IDs SANG DẠNG UUID VÀ TRUY VẤN DỮ LIỆU CHI TIẾT TỪ SQL
    
    # Chuyển IDs (str) từ ES thành UUIDs
    room_uuids: List[UUID] = [UUID(id_str) for id_str in ranked_room_ids]
    
    # Truy vấn PostgreSQL để lấy dữ liệu chi tiết của các phòng có ID trong danh sách ES đã xếp hạng.
    query = select(Room).where(
        and_(
            Room.room_status == "available",
            Room.id.in_(room_uuids)
        )
    )
    
    result = await session.execute(query)
    rooms_from_sql = result.scalars().all()

    # 3. SẮP XẾP LẠI KẾT QUẢ SQL THEO THỨ TỰ CỦA ELASTICSEARCH
    # (Đảm bảo kết quả hiển thị theo đúng thứ tự xếp hạng thông minh)
    room_map = {str(room.id): room for room in rooms_from_sql}
    
    paginated_rooms = []
    for id_str in ranked_room_ids:
        # Chỉ lấy các phòng có trong cả ES và SQL
        if id_str in room_map:
            paginated_rooms.append(room_map[id_str])
            
    # 4. TÍNH TOÁN PHÂN TRANG
    # Sử dụng 'total' (tổng số hits) chính xác từ Elasticsearch
    total_pages = (total + limit - 1) // limit if total > 0 else 0
    
    # 5. FORMAT RESPONSE (Giữ nguyên logic fetch landlord detail)
    rooms_data = []
    for room in paginated_rooms:
        # Lấy thông tin chủ nhà (N+1 query)
        landlord_result = await session.execute(
            select(User).where(User.id == room.landlord_id)
        )
        landlord = landlord_result.scalar_one_or_none()
        
        rooms_data.append({
            "id": str(room.id),
            "title": room.title,
            "province": room.province,
            "district": room.district,
            "ward": room.ward,
            "area": room.area,
            "price": room.price,
            "images": room.images or [],
            "created_at": room.created_at.isoformat(),
            "landlord_email": landlord.email if landlord else None,
            "landlord_phone": landlord.phone if landlord else None
        })
    
    return {
        "success": True,
        "keyword": keyword,
        "total": total, # <-- Tổng số chính xác từ ES
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "rooms": rooms_data
    }

# ===== API 3: CHI TIẾT PHÒNG ĐẦY ĐỦ (KHÔNG CẦN LOGIN) =====
@router.get("/{room_id}")
async def get_room_detail(
    room_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    """
    API LẤY CHI TIẾT PHÒNG - KHÔNG CẦN ĐĂNG NHẬP
    
    GET /api/find-rooms/{room_id}
    """
    
    # Get room
    result = await session.execute(
        select(Room).where(Room.id == room_id)
    )
    room = result.scalar_one_or_none()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phòng"
        )
    
    # Get landlord full info
    landlord_result = await session.execute(
        select(User).where(User.id == room.landlord_id)
    )
    landlord = landlord_result.scalar_one_or_none()
    
    # Return FULL room details
    return {
        "success": True,
        "room": {
            "id": str(room.id),
            "title": room.title,
            "description": room.description,
            "address": {
                "province": room.province,
                "district": room.district,
                "ward": room.ward,
                "address_detail": room.address_detail,
                "full_address": f"{room.address_detail}, {room.ward}, {room.district}, {room.province}"
            },
            "area": room.area,
            "price": room.price,
            "room_status": room.room_status,
            "images": room.images or [],
            "created_at": room.created_at.isoformat(),
            "landlord": {
                "id": str(landlord.id) if landlord else None,
                "email": landlord.email if landlord else None,
                "phone": landlord.phone if landlord else None,
                "role": landlord.role if landlord else None
            }
        }
    }


