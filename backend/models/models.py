from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(20), unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default='user')
    full_name = Column(String(255))
    avatar_url = Column(String(500))
    zalo_contact = Column(String(50))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # THÊM METHODS
    def verify_password(self, plain_password: str) -> bool:
        """Verify password"""
        from core.auth import verify_password
        return verify_password(plain_password, self.password_hash)
    
    def set_password(self, password: str):
        """Set password"""
        from core.auth import get_password_hash
        self.password_hash = get_password_hash(password)
    
    def to_dict(self):
        """Convert to dict for response"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "full_name": self.full_name,
            "avatar_url": self.avatar_url,
            "zalo_contact": self.zalo_contact,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "created_at": self.created_at,
            "last_login": self.last_login
        }

class AdminProfile(Base):
    __tablename__ = "admin_profiles"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    admin_number = Column(Integer, unique=True)
    facebook_main = Column(String(500))
    facebook_backup = Column(String(500))
    zalo = Column(String(50))
    website = Column(String(500))
    services = Column(JSON)
    bank_accounts = Column(JSON)
    insurance_fund = Column(Float, default=0)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "admin_number": self.admin_number,
            "facebook_main": self.facebook_main,
            "facebook_backup": self.facebook_backup,
            "zalo": self.zalo,
            "website": self.website,
            "services": self.services,
            "bank_accounts": self.bank_accounts,
            "insurance_fund": self.insurance_fund,
            "is_public": self.is_public,
            "created_at": self.created_at
        }

class Warning(Base):
    __tablename__ = "warnings"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    scammer_name = Column(String(255), nullable=False)
    bank_account = Column(String(100))
    bank_name = Column(String(100))
    facebook_link = Column(String(500))
    content = Column(Text, nullable=False)
    category = Column(String(50), default='other')
    evidence_images = Column(JSON)
    status = Column(String(20), default='pending')
    view_count = Column(Integer, default=0)
    search_count = Column(Integer, default=0)
    warning_count = Column(Integer, default=1)
    
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reporter_name = Column(String(255))
    reporter_zalo = Column(String(50))
    is_anonymous = Column(Boolean, default=False)
    reporter_nickname = Column(String(100))
    
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_note = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "scammer_name": self.scammer_name,
            "bank_account": self.bank_account,
            "bank_name": self.bank_name,
            "facebook_link": self.facebook_link,
            "content": self.content,
            "category": self.category,
            "evidence_images": self.evidence_images,
            "status": self.status,
            "view_count": self.view_count,
            "search_count": self.search_count,
            "warning_count": self.warning_count,
            "reporter_name": self.reporter_name,
            "reporter_zalo": self.reporter_zalo,
            "is_anonymous": self.is_anonymous,
            "reporter_nickname": self.reporter_nickname,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "approved_at": self.approved_at
        }

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_type = Column(String(50))
    
    scammer_name = Column(String(255))
    bank_account = Column(String(100))
    bank_name = Column(String(100))
    facebook_link = Column(String(500))
    
    website_url = Column(String(500))
    website_category = Column(String(100))
    
    content = Column(Text, nullable=False)
    evidence_images = Column(JSON)
    category = Column(String(50), default='other')
    status = Column(String(20), default='pending')
    
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reporter_name = Column(String(255))
    reporter_zalo = Column(String(50))
    reporter_email = Column(String(255))
    agree_terms = Column(Boolean, default=False)
    
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "report_type": self.report_type,
            "scammer_name": self.scammer_name,
            "bank_account": self.bank_account,
            "bank_name": self.bank_name,
            "facebook_link": self.facebook_link,
            "website_url": self.website_url,
            "website_category": self.website_category,
            "content": self.content,
            "evidence_images": self.evidence_images,
            "category": self.category,
            "status": self.status,
            "reporter_name": self.reporter_name,
            "reporter_zalo": self.reporter_zalo,
            "reporter_email": self.reporter_email,
            "agree_terms": self.agree_terms,
            "created_at": self.created_at
        }

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    warning_id = Column(Integer, ForeignKey("warnings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_verified_victim = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "warning_id": self.warning_id,
            "user_id": self.user_id,
            "content": self.content,
            "is_verified_victim": self.is_verified_victim,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

class Statistics(Base):
    __tablename__ = "statistics"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(DateTime, default=datetime.utcnow)
    total_warnings = Column(Integer, default=0)
    total_views = Column(Integer, default=0)
    total_reports = Column(Integer, default=0)
    top_scammers = Column(JSON)
    top_searches = Column(JSON)
    recent_warnings = Column(JSON)

class SearchLog(Base):
    __tablename__ = "search_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    search_query = Column(String(500), nullable=False)
    search_type = Column(String(50))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String(50))
    result_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)