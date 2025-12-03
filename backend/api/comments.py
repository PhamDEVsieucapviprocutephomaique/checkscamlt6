from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import models.models as models
import models.schemas as schemas
from core.auth import get_current_active_user
from core.database import get_db

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("/", response_model=schemas.CommentResponse)
async def create_comment(
    comment_data: schemas.CommentCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Tạo comment mới"""
    # Kiểm tra warning tồn tại
    warning = db.query(models.Warning).filter(models.Warning.id == comment_data.warning_id).first()
    if not warning or warning.status != models.WarningStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warning not found or not approved"
        )
    
    # Tạo comment
    comment = models.Comment(
        **comment_data.dict(),
        user_id=current_user.id
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return comment

@router.get("/warning/{warning_id}", response_model=List[schemas.CommentResponse])
async def get_comments_by_warning(
    warning_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Lấy comments của một warning"""
    comments = db.query(models.Comment).filter(
        models.Comment.warning_id == warning_id
    ).order_by(models.Comment.created_at.desc()).offset(skip).limit(limit).all()
    
    return comments

@router.put("/{comment_id}", response_model=schemas.CommentResponse)
async def update_comment(
    comment_id: int,
    update_data: dict,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cập nhật comment"""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Kiểm tra quyền
    if comment.user_id != current_user.id and current_user.role not in [models.UserRole.ADMIN, models.UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this comment"
        )
    
    # Cập nhật
    if "content" in update_data:
        comment.content = update_data["content"]
    
    comment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(comment)
    
    return comment

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Xóa comment"""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Kiểm tra quyền
    if comment.user_id != current_user.id and current_user.role not in [models.UserRole.ADMIN, models.UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}