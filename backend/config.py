import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database - SỬA TRỰC TIẾP ĐÂY
    DB_HOST = "202.92.5.48"
    DB_PORT = "3306"
    DB_NAME = "rvcavnufhosting_checkscam"
    DB_USER = "rvcavnufhosting_user"
    DB_PASSWORD = "123456aA@"  # CÓ @ Ở CUỐI - ĐÂY LÀ VẤN ĐỀ!
    
    # FIX: URL cần escape ký tự @ trong password
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD.replace('@', '%40')}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    # JWT
    SECRET_KEY = "your-secret-key-change-this-please"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440
    
    # FTP
    FTP_HOST = "202.92.5.48"
    FTP_PORT = 21
    FTP_USER = "rvcavnufhosting_uploadanh"
    FTP_PASSWORD = "123456aA@"
    FTP_UPLOAD_DIR = "/"
    WEB_ACCESS_URL = "http://image.checkgdtg.vn/"
    
    # Elasticsearch
    ES_HOST = "localhost"
    ES_PORT = 9200
    ES_URL = f"http://{ES_HOST}:{ES_PORT}"
    
    # App
    APP_NAME = "CheckScam API with Elasticsearch"
    VERSION = "2.0.0"
    DEBUG = True

settings = Settings()

# IN RA ĐỂ KIỂM TRA
print("🔍 DATABASE_URL:", settings.DATABASE_URL)
print("📊 ES_URL:", settings.ES_URL)