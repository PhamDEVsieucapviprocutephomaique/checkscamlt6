from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import models.models as models
import models.schemas as schemas
from core.auth import get_current_user, get_current_active_user, get_current_admin
from core.database import get_db
from services.ftp_service import ftp_service

router = APIRouter(prefix="/reports", tags=["reports"])

# ===== PUBLIC ENDPOINTS =====
@router.post("/scam", response_model=schemas.ReportResponse)
async def create_scam_report(
    report_data: schemas.ReportCreate,
    files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    """Tạo báo cáo lừa đảo (public)"""
    if report_data.report_type != "scam":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid report type"
        )
    
    # Kiểm tra required fields
    if not report_data.scammer_name and not report_data.bank_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên hoặc số tài khoản là bắt buộc"
        )
    
    if not report_data.agree_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn phải đồng ý với điều khoản"
        )
    
    # Upload evidence images
    evidence_urls = []
    if files:
        evidence_urls = await ftp_service.upload_multiple_files(files)
    
    # Tạo report
    report = models.Report(
        **report_data.dict(),
        evidence_images=evidence_urls,
        status=models.WarningStatus.PENDING
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report

@router.post("/website", response_model=schemas.ReportResponse)
async def create_website_report(
    report_data: schemas.ReportCreate,
    files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    """Tạo báo cáo website lừa đảo (public)"""
    if report_data.report_type != "website":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid report type"
        )
    
    if not report_data.website_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL website là bắt buộc"
        )
    
    if not report_data.agree_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn phải đồng ý với điều khoản"
        )
    
    # Upload evidence images
    evidence_urls = []
    if files:
        evidence_urls = await ftp_service.upload_multiple_files(files)
    
    # Tạo report
    report = models.Report(
        **report_data.dict(),
        evidence_images=evidence_urls,
        status=models.WarningStatus.PENDING
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report

# ===== ADMIN ENDPOINTS =====
@router.get("/admin/", response_model=List[schemas.ReportResponse])
async def get_reports(
    report_type: Optional[str] = None,
    status: Optional[schemas.WarningStatus] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lấy danh sách báo cáo (Admin only)"""
    query = db.query(models.Report)
    
    if report_type:
        query = query.filter(models.Report.report_type == report_type)
    
    if status:
        query = query.filter(models.Report.status == status)
    
    reports = query.order_by(models.Report.created_at.desc()).offset(skip).limit(limit).all()
    
    return reports

@router.put("/admin/{report_id}", response_model=schemas.ReportResponse)
async def update_report(
    report_id: int,
    update_data: dict,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Cập nhật trạng thái báo cáo (Admin only)"""
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Update fields
    if "status" in update_data:
        report.status = update_data["status"]
        report.reviewer_id = current_user.id
        report.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(report)
    
    return report

@router.delete("/admin/{report_id}")
async def delete_report(
    report_id: int,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Xóa báo cáo (Admin only)"""
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    db.delete(report)
    db.commit()
    
    return {"message": "Report deleted successfully"}