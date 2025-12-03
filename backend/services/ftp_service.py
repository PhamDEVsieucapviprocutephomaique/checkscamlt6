import ftplib
import io
import uuid
from PIL import Image
from fastapi import UploadFile
import aiofiles
import os
from config import settings

class FTPService:
    def __init__(self):
        self.host = settings.FTP_HOST
        self.port = settings.FTP_PORT
        self.username = settings.FTP_USER
        self.password = settings.FTP_PASSWORD
        self.upload_dir = settings.FTP_UPLOAD_DIR
        self.web_url = settings.WEB_ACCESS_URL
    
    async def optimize_image(self, file: UploadFile, max_size: int = 1200) -> tuple[bytes, str]:
        """Tối ưu ảnh: resize và convert sang WebP"""
        try:
            # Đọc file
            contents = await file.read()
            
            # Mở ảnh bằng PIL
            image = Image.open(io.BytesIO(contents))
            
            # Convert RGBA sang RGB nếu cần
            if image.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # Resize nếu quá lớn
            if max(image.size) > max_size:
                ratio = max_size / max(image.size)
                new_size = tuple(int(dim * ratio) for dim in image.size)
                image = image.resize(new_size, Image.Resampling.LANCZOS)
            
            # Convert sang WebP
            output = io.BytesIO()
            image.save(output, format='WEBP', quality=85, optimize=True)
            
            return output.getvalue(), 'webp'
            
        except Exception as e:
            print(f"Image optimization error: {e}")
            # Fallback: trả về file gốc
            await file.seek(0)
            return await file.read(), file.filename.split('.')[-1].lower()
    
    async def upload_file(self, file: UploadFile) -> str:
        """Upload file lên FTP server"""
        try:
            # Tối ưu ảnh
            optimized_data, ext = await self.optimize_image(file)
            
            # Tạo tên file unique
            filename = f"img_{uuid.uuid4()}.{ext}"
            
            # Kết nối FTP
            ftp = ftplib.FTP()
            ftp.connect(self.host, self.port)
            ftp.login(self.username, self.password)
            ftp.cwd(self.upload_dir)
            
            # Upload
            bio = io.BytesIO(optimized_data)
            ftp.storbinary(f"STOR {filename}", bio)
            ftp.quit()
            
            # Trả về URL
            return f"{self.web_url}{filename}"
            
        except Exception as e:
            print(f"FTP upload error: {e}")
            raise Exception(f"Upload failed: {str(e)}")
    
    async def upload_multiple_files(self, files: list[UploadFile]) -> list[str]:
        """Upload nhiều file cùng lúc"""
        urls = []
        for file in files:
            try:
                url = await self.upload_file(file)
                urls.append(url)
            except Exception as e:
                print(f"Failed to upload {file.filename}: {e}")
                continue
        return urls
    
    async def delete_file(self, filename: str) -> bool:
        """Xóa file từ FTP server"""
        try:
            ftp = ftplib.FTP()
            ftp.connect(self.host, self.port)
            ftp.login(self.username, self.password)
            ftp.cwd(self.upload_dir)
            
            # Extract filename từ URL
            if self.web_url in filename:
                filename = filename.replace(self.web_url, "")
            
            ftp.delete(filename)
            ftp.quit()
            return True
            
        except Exception as e:
            print(f"FTP delete error: {e}")
            return False

# Tạo instance global
ftp_service = FTPService()