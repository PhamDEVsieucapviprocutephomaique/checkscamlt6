import re
from typing import Optional
from datetime import datetime

def validate_phone_number(phone: str) -> bool:
    """Validate Vietnamese phone number"""
    pattern = r'^(0[3|5|7|8|9])+([0-9]{8})\b'
    return bool(re.match(pattern, phone))

def validate_bank_account(account: str) -> bool:
    """Validate bank account number"""
    # Bank account thường từ 9-16 chữ số
    pattern = r'^[0-9]{9,16}$'
    return bool(re.match(pattern, account))

def mask_bank_account(account: str) -> str:
    """Mask bank account for display"""
    if len(account) <= 3:
        return account
    return account[:3] + "*" * (len(account) - 6) + account[-3:]

def mask_phone_number(phone: str) -> str:
    """Mask phone number for display"""
    if len(phone) <= 4:
        return phone
    return phone[:3] + "*" * (len(phone) - 6) + phone[-3:]

def mask_name(name: str) -> str:
    """Mask name for privacy"""
    if not name:
        return ""
    
    parts = name.split()
    if len(parts) == 1:
        return parts[0][0] + "*" * (len(parts[0]) - 1)
    
    # Giữ nguyên họ, mask tên
    masked_parts = []
    for i, part in enumerate(parts):
        if i == 0:  # Họ
            masked_parts.append(part)
        else:  # Tên
            masked_parts.append(part[0] + "*" * (len(part) - 1))
    
    return " ".join(masked_parts)

def format_datetime(dt: datetime, format_str: str = "%d/%m/%Y %H:%M") -> str:
    """Format datetime to string"""
    return dt.strftime(format_str) if dt else ""

def calculate_warning_score(warning) -> float:
    """Calculate warning credibility score"""
    score = 0
    
    # Có bằng chứng hình ảnh
    if warning.evidence_images and len(warning.evidence_images) > 0:
        score += 20
    
    # Có số tài khoản ngân hàng
    if warning.bank_account:
        score += 15
    
    # Có link Facebook
    if warning.facebook_link:
        score += 10
    
    # Đã được xác thực bởi admin
    if warning.status == models.WarningStatus.APPROVED:
        score += 25
    
    # Có nhiều cảnh báo cùng thông tin
    score += min(warning.warning_count * 5, 30)  # Max 30 điểm
    
    return min(score, 100)  # Max 100 điểm