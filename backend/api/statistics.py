from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any
from datetime import datetime, timedelta
import models.models as models
import models.schemas as schemas
from core.auth import get_current_admin
from core.database import get_db
from services.elasticsearch_service import es_service

router = APIRouter(prefix="/statistics", tags=["statistics"])

@router.get("/dashboard")
async def get_dashboard_stats(
    days: int = 7,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lấy thống kê dashboard với Elasticsearch"""
    
    # Try Elasticsearch first
    try:
        # Get top scammers from ES
        top_scammers = es_service.get_top_scammers(days=days, limit=10)
        
        # Get top searches from ES
        top_searches = es_service.get_top_searches(days=min(days, 1), limit=10)
        
    except Exception as e:
        print(f"Elasticsearch stats error: {e}")
        # Fallback to database queries
        top_scammers = []
        top_searches = []
    
    # Get basic counts from database
    since_date = datetime.utcnow() - timedelta(days=days)
    
    # Tổng số cảnh báo
    total_warnings = db.query(func.count(models.Warning.id)).filter(
        models.Warning.created_at >= since_date
    ).scalar()
    
    # Tổng số view
    total_views = db.query(func.sum(models.Warning.view_count)).filter(
        models.Warning.created_at >= since_date
    ).scalar() or 0
    
    # Tổng số report
    total_reports = db.query(func.count(models.Report.id)).filter(
        models.Report.created_at >= since_date
    ).scalar()
    
    # Recent warnings from database
    recent_warnings = db.query(models.Warning).filter(
        models.Warning.status == models.WarningStatus.APPROVED,
        models.Warning.created_at >= since_date
    ).order_by(desc(models.Warning.created_at)).limit(20).all()
    
    # Format response
    return {
        "total_warnings": total_warnings,
        "total_views": total_views,
        "total_reports": total_reports,
        "top_scammers": top_scammers if top_scammers else await _get_fallback_top_scammers(days, db),
        "top_searches": top_searches if top_searches else await _get_fallback_top_searches(min(days, 1), db),
        "recent_warnings": [
            {
                "id": w.id,
                "title": w.title,
                "scammer_name": w.scammer_name,
                "bank_account": helpers.mask_bank_account(w.bank_account) if w.bank_account else "",
                "view_count": w.view_count,
                "search_count": w.search_count,
                "warning_count": w.warning_count,
                "created_at": w.created_at.isoformat()
            }
            for w in recent_warnings
        ]
    }

async def _get_fallback_top_scammers(days: int, db: Session):
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
    ).order_by(desc("warning_count")).limit(10).all()
    
    return [
        {
            "scammer_name": scammer[0],
            "bank_account": helpers.mask_bank_account(scammer[1]) if scammer[1] else "",
            "warning_count": scammer[2]
        }
        for scammer in top_scammers
    ]

async def _get_fallback_top_searches(days: int, db: Session):
    """Fallback top searches from database"""
    since_date = datetime.utcnow() - timedelta(days=days)
    
    top_searches = db.query(
        models.SearchLog.search_query,
        func.count(models.SearchLog.id).label("search_count")
    ).filter(
        models.SearchLog.created_at >= since_date
    ).group_by(models.SearchLog.search_query).order_by(desc("search_count")).limit(10).all()
    
    return [
        {
            "query": search[0],
            "search_count": search[1]
        }
        for search in top_searches
    ]