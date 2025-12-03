from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class WarningStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DELETED = "deleted"

class ScamCategory(str, Enum):
    FACEBOOK = "facebook"
    ZALO = "zalo"
    BANKING = "banking"
    GAMING = "gaming"
    ECOMMERCE = "ecommerce"
    INVESTMENT = "investment"
    OTHER = "other"

# User Schemas
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    avatar_url: Optional[str]
    zalo_contact: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Warning Schemas
class WarningBase(BaseModel):
    title: str
    scammer_name: str
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    facebook_link: Optional[str] = None
    content: str
    category: ScamCategory = ScamCategory.OTHER
    evidence_images: Optional[List[str]] = []

class WarningCreate(WarningBase):
    reporter_name: Optional[str] = None
    reporter_zalo: Optional[str] = None
    is_anonymous: bool = False
    reporter_nickname: Optional[str] = None

class WarningResponse(WarningBase):
    id: int
    status: WarningStatus
    view_count: int
    search_count: int
    warning_count: int
    reporter_name: Optional[str]
    reporter_zalo: Optional[str]
    is_anonymous: bool
    reporter_nickname: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    approved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class WarningUpdate(BaseModel):
    status: Optional[WarningStatus] = None
    review_note: Optional[str] = None

# Report Schemas
class ReportBase(BaseModel):
    report_type: str  # 'scam' hoặc 'website'
    
    # For scam reports
    scammer_name: Optional[str] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    facebook_link: Optional[str] = None
    
    # For website reports
    website_url: Optional[str] = None
    website_category: Optional[str] = None
    
    # Common fields
    content: str
    evidence_images: Optional[List[str]] = []
    category: ScamCategory = ScamCategory.OTHER
    
    # Reporter info
    reporter_name: str
    reporter_zalo: str
    reporter_email: EmailStr
    agree_terms: bool = False

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    status: WarningStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

# Admin Profile Schemas
class AdminProfileBase(BaseModel):
    admin_number: int
    facebook_main: Optional[str] = None
    facebook_backup: Optional[str] = None
    zalo: Optional[str] = None
    website: Optional[str] = None
    services: Optional[Dict[str, Any]] = None
    bank_accounts: Optional[Dict[str, Any]] = None
    insurance_fund: float = 0
    is_public: bool = True

class AdminProfileCreate(AdminProfileBase):
    user_id: int

class AdminProfileResponse(AdminProfileBase):
    id: int
    user: UserResponse
    created_at: datetime
    
    class Config:
        from_attributes = True

# Comment Schemas
class CommentBase(BaseModel):
    content: str
    is_verified_victim: bool = False

class CommentCreate(CommentBase):
    warning_id: int

class CommentResponse(CommentBase):
    id: int
    warning_id: int
    user: UserResponse
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Statistics Schemas
class StatisticsResponse(BaseModel):
    total_warnings: int
    total_views: int
    total_reports: int
    top_scammers: List[Dict[str, Any]]
    top_searches: List[Dict[str, Any]]
    recent_warnings: List[Dict[str, Any]]
    date: datetime

# Search Schemas
class SearchRequest(BaseModel):
    query: str
    search_type: Optional[str] = None  # phone, bank_account, facebook, name

class SearchResponse(BaseModel):
    query: str
    results: List[WarningResponse]
    total: int