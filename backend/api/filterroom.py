from fastapi import APIRouter
from typing import List, Dict

router = APIRouter()

# ===== API 1: LẤY FILTER NỘI THẤT =====
@router.get("/furniture-conditions")
async def get_furniture_conditions():
    """
    API LẤY DANH SÁCH TÌNH TRẠNG NỘI THẤT
    """
    furniture_conditions = [
        {"label": "Tất cả nội thất", "value": ""},
        {"label": "Mới", "value": "new"},
        {"label": "Đã sử dụng", "value": "used"},
    ]
    
    return {
        "success": True,
        "data": furniture_conditions
    }

# ===== API 2: LẤY FILTER TIỆN ÍCH =====
@router.get("/utility-levels")
async def get_utility_levels():
    """
    API LẤY DANH SÁCH MỨC ĐỘ TIỆN ÍCH
    """
    utility_options = [
        {"label": "Tất cả tiện ích", "value": ""},
        {"label": "Cao", "value": "high"},
        {"label": "Vừa", "value": "medium"},
        {"label": "Thấp", "value": "low"},
    ]
    
    return {
        "success": True,
        "data": utility_options
    }

# ===== API 3: LẤY FILTER KHOẢNG GIÁ =====
@router.get("/price-ranges")
async def get_price_ranges():
    """
    API LẤY DANH SÁCH KHOẢNG GIÁ
    """
    price_ranges = [
        {"label": "Tất cả khoảng giá", "value": ""},
        {"label": "Dưới 1 triệu", "value": "under-1m"},
        {"label": "1 - 3 triệu", "value": "1m-3m"},
        {"label": "3 - 5 triệu", "value": "3m-5m"},
        {"label": "5 - 7 triệu", "value": "5m-7m"},
        {"label": "Trên 7 triệu", "value": "over-7m"},
    ]
    
    return {
        "success": True,
        "data": price_ranges
    }

# ===== API 4: LẤY FILTER DIỆN TÍCH =====
@router.get("/area-ranges")
async def get_area_ranges():
    """
    API LẤY DANH SÁCH DIỆN TÍCH
    """
    area_ranges = [
        {"label": "Tất cả diện tích", "value": ""},
        {"label": "Dưới 20m²", "value": "under-20"},
        {"label": "20 - 30m²", "value": "20-30"},
        {"label": "30 - 40m²", "value": "30-40"},
        {"label": "40 - 50m²", "value": "40-50"},
        {"label": "Trên 50m²", "value": "over-50"},
    ]
    
    return {
        "success": True,
        "data": area_ranges
    }