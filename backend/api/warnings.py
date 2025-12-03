from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from typing import List, Optional
from datetime import datetime, timedelta
import models.models as models
import models.schemas as schemas
from core.auth import get_current_user, get_current_active_user, get_current_admin
from core.database import get_db
from services.ftp_service import ftp_service
from services.elasticsearch_service import es_service
import utils.helpers as helpers

router = APIRouter(prefix="/warnings", tags=["warnings"])

# ===== PUBLIC ENDPOINTS =====

@router.get("/search/", response_model=List[schemas.WarningResponse])
async def search_warnings(
    query: str = Query(..., min_length=1),
    search_type: Optional[str] = None,  # phone, bank_account, facebook, name
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    TÌM KIẾM CẢNH BÁO VỚI ELASTICSEARCH
    
    Tìm kiếm theo: số điện thoại, số tài khoản ngân hàng, link Facebook, tên
    
    Parameters:
    - query: Từ khóa tìm kiếm
    - search_type: phone (số điện thoại), bank_account (số tài khoản), 
                  facebook (link facebook), name (tên)
    - page: Trang số
    - limit: Số kết quả mỗi trang
    """
    
    # Log search to Elasticsearch
    if request:
        search_log = {
            "search_query": query,
            "search_type": search_type,
            "ip_address": request.client.host if request.client else None,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # If user is logged in, add user_id
        try:
            current_user = await get_current_user(request=request)
            search_log["user_id"] = str(current_user.id)
        except:
            pass
        
        # Log async (don't wait for it)
        import asyncio
        asyncio.create_task(
            es_service.log_search(search_log)
        )
    
    # 1. SEARCH WITH ELASTICSEARCH
    try:
        warning_ids, total_hits = es_service.search_warnings(
            query_string=query,
            search_type=search_type,
            page=page,
            page_size=limit
        )
    except Exception as e:
        print(f"🚨 Elasticsearch error: {str(e)}")
        # Fallback to database search
        return await _fallback_search(query, search_type, page, limit, db)
    
    if not warning_ids:
        return []
    
    # 2. GET DETAILED DATA FROM DATABASE
    # Convert string IDs to integers
    ids = [int(id_str) for id_str in warning_ids if id_str.isdigit()]
    
    if not ids:
        return []
    
    # Get warnings from database in the same order as Elasticsearch results
    warnings = db.query(models.Warning).filter(
        models.Warning.id.in_(ids),
        models.Warning.status == models.WarningStatus.APPROVED
    ).all()
    
    # Sort by Elasticsearch ranking
    warning_dict = {str(w.id): w for w in warnings}
    sorted_warnings = [warning_dict[id_str] for id_str in warning_ids if id_str in warning_dict]
    
    # 3. UPDATE SEARCH COUNT
    for warning in sorted_warnings:
        warning.search_count += 1
    
    try:
        db.commit()
        
        # Async update Elasticsearch
        for warning in sorted_warnings:
            es_service.update_warning(warning)
            
    except Exception as e:
        db.rollback()
        print(f"Error updating search counts: {e}")
    
    return sorted_warnings

async def _fallback_search(
    query: str,
    search_type: str,
    page: int,
    limit: int,
    db: Session
):
    """Fallback search using database when Elasticsearch fails"""
    offset = (page - 1) * limit
    search_query = db.query(models.Warning).filter(
        models.Warning.status == models.WarningStatus.APPROVED
    )
    
    if search_type == "phone":
        search_query = search_query.filter(models.Warning.bank_account.ilike(f"%{query}%"))
    elif search_type == "bank_account":
        search_query = search_query.filter(models.Warning.bank_account.ilike(f"%{query}%"))
    elif search_type == "facebook":
        search_query = search_query.filter(models.Warning.facebook_link.ilike(f"%{query}%"))
    else:
        search_query = search_query.filter(
            or_(
                models.Warning.scammer_name.ilike(f"%{query}%"),
                models.Warning.title.ilike(f"%{query}%"),
                models.Warning.content.ilike(f"%{query}%")
            )
        )
    
    total = search_query.count()
    warnings = search_query.order_by(
        desc(models.Warning.created_at)
    ).offset(offset).limit(limit).all()
    
    # Update search count
    for warning in warnings:
        warning.search_count += 1
    
    try:
        db.commit()
    except:
        db.rollback()
    
    return warnings

@router.get("/search/suggest/")
async def search_suggestions(
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    GỢI Ý TÌM KIẾM VỚI ELASTICSEARCH
    
    Returns suggestions for search queries
    """
    try:
        # Use completion suggester
        suggest_body = {
            "suggest": {
                "warning_suggest": {
                    "prefix": query,
                    "completion": {
                        "field": "scammer_name.completion",
                        "fuzzy": {
                            "fuzziness": 2
                        },
                        "size": limit
                    }
                }
            }
        }
        
        response = es_service.es_client.search(
            index=es_service.WARNING_INDEX,
            body=suggest_body
        )
        
        suggestions = []
        if "suggest" in response and "warning_suggest" in response["suggest"]:
            for option in response["suggest"]["warning_suggest"][0]["options"]:
                suggestions.append(option["text"])
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        print(f"Suggest error: {e}")
        # Fallback to database
        warnings = db.query(models.Warning.scammer_name).filter(
            models.Warning.scammer_name.ilike(f"%{query}%"),
            models.Warning.status == models.WarningStatus.APPROVED
        ).distinct().limit(limit).all()
        
        return {"suggestions": [w[0] for w in warnings]}

# Cập nhật các hàm khác để sử dụng Elasticsearch:

@router.post("/", response_model=schemas.WarningResponse)
async def create_warning(
    warning_data: schemas.WarningCreate,
    files: Optional[List[UploadFile]] = File(None),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Tạo cảnh báo mới"""
    # Upload evidence images
    evidence_urls = []
    if files:
        evidence_urls = await ftp_service.upload_multiple_files(files)
    
    # Tạo warning
    warning = models.Warning(
        **warning_data.dict(exclude={"evidence_images"}),
        evidence_images=evidence_urls,
        reporter_id=current_user.id,
        reporter_name=warning_data.reporter_name or current_user.full_name,
        reporter_zalo=warning_data.reporter_zalo or current_user.zalo_contact,
        status=models.WarningStatus.PENDING,
        warning_count=1  # Initial warning count
    )
    
    db.add(warning)
    db.commit()
    db.refresh(warning)
    
    # Index to Elasticsearch (async)
    try:
        import asyncio
        asyncio.create_task(es_service.index_warning(warning))
    except Exception as e:
        print(f"Async indexing error: {e}")
    
    return warning

@router.put("/admin/{warning_id}/review", response_model=schemas.WarningResponse)
async def review_warning(
    warning_id: int,
    review_data: schemas.WarningUpdate,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Duyệt/cập nhật cảnh báo (Admin only)"""
    warning = db.query(models.Warning).filter(models.Warning.id == warning_id).first()
    if not warning:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warning not found"
        )
    
    # Update status
    if review_data.status:
        warning.status = review_data.status
        warning.reviewer_id = current_user.id
        warning.reviewed_at = datetime.utcnow()
        
        if review_data.status == models.WarningStatus.APPROVED:
            warning.approved_at = datetime.utcnow()
            # Check if there are similar warnings
            similar_warnings = db.query(models.Warning).filter(
                models.Warning.scammer_name == warning.scammer_name,
                models.Warning.bank_account == warning.bank_account,
                models.Warning.status == models.WarningStatus.APPROVED
            ).all()
            
            warning.warning_count = len(similar_warnings) + 1
    
    # Update review note
    if review_data.review_note:
        warning.review_note = review_data.review_note
    
    warning.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(warning)
    
    # Update Elasticsearch
    try:
        es_service.update_warning(warning)
    except Exception as e:
        print(f"Elasticsearch update error: {e}")
    
    return warning

@router.delete("/admin/{warning_id}")
async def delete_warning(
    warning_id: int,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Xóa cảnh báo (Admin only)"""
    warning = db.query(models.Warning).filter(models.Warning.id == warning_id).first()
    if not warning:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warning not found"
        )
    
    # Soft delete
    warning.status = models.WarningStatus.DELETED
    warning.updated_at = datetime.utcnow()
    db.commit()
    
    # Delete from Elasticsearch
    try:
        es_service.delete_warning(str(warning_id))
    except Exception as e:
        print(f"Elasticsearch delete error: {e}")
    
    return {"message": "Warning deleted successfully"}

@router.get("/top/scammers", response_model=List[dict])
async def get_top_scammers(
    days: int = 7,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Lấy top scammers từ Elasticsearch"""
    try:
        top_scammers = es_service.get_top_scammers(days=days, limit=limit)
        return top_scammers
    except Exception as e:
        print(f"Elasticsearch top scammers error: {e}")
        # Fallback to database
        return await _fallback_top_scammers(days, limit, db)

async def _fallback_top_scammers(days: int, limit: int, db: Session):
    """Fallback top scammers from database"""
    since_date = datetime.utcnow() - timedelta(days=days)
    
    top_scammers = db.query(
        models.Warning.scammer_name,
        models.Warning.bank_account,
        func.count(models.Warning.id).label("warning_count")
    ).filter(
        models.Warning.status == models.WarningStatus.APPROVED,
        models.Warning.created_at >= since_date
    ).group_by(
        models.Warning.scammer_name,
        models.Warning.bank_account
    ).order_by(
        desc("warning_count")
    ).limit(limit).all()
    
    return [
        {
            "scammer_name": scammer[0],
            "bank_account": scammer[1],
            "warning_count": scammer[2]
        }
        for scammer in top_scammers
    ]

@router.get("/top/searches", response_model=List[dict])
async def get_top_searches(
    days: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Lấy top tìm kiếm từ Elasticsearch"""
    try:
        top_searches = es_service.get_top_searches(days=days, limit=limit)
        return top_searches
    except Exception as e:
        print(f"Elasticsearch top searches error: {e}")
        # Fallback to database
        return await _fallback_top_searches(days, limit, db)

async def _fallback_top_searches(days: int, limit: int, db: Session):
    """Fallback top searches from database"""
    since_date = datetime.utcnow() - timedelta(days=days)
    
    top_searches = db.query(
        models.SearchLog.search_query,
        func.count(models.SearchLog.id).label("search_count")
    ).filter(
        models.SearchLog.created_at >= since_date
    ).group_by(
        models.SearchLog.search_query
    ).order_by(
        desc("search_count")
    ).limit(limit).all()
    
    return [
        {
            "query": search[0],
            "search_count": search[1]
        }
        for search in top_searches
    ]