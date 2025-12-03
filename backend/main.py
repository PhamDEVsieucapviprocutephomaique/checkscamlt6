import sys
import os
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn
from datetime import datetime

from core.database import create_tables, engine, get_db
from models.models import Warning  # CHỈ import Warning, không import WarningStatus
from services.elasticsearch_service import es_service

from api.users import router as users_router
from api.warnings import router as warnings_router
from api.reports import router as reports_router
from api.admins import router as admins_router
from api.comments import router as comments_router
from api.statistics import router as statistics_router

print("=" * 60)
print("🚀 CHECKSCAM API - DATABASE INITIALIZATION")
print("=" * 60)

db_initialized = False
try:
    print("🔗 Testing MySQL connection...")
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ MySQL connection OK")
    
    print("🔄 Creating database tables...")
    create_tables()
    db_initialized = True
    print("✅ Database tables created successfully!")
    
except Exception as e:
    print(f"❌ DATABASE INITIALIZATION FAILED: {e}")
    print("⚠️ Server will start in LIMITED mode")
    db_initialized = False

print("=" * 60)

app = FastAPI(
    title="CheckScam API",
    description="Hệ thống cảnh báo lừa đảo trực tuyến với Elasticsearch",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(warnings_router)
app.include_router(reports_router)
app.include_router(admins_router)
app.include_router(comments_router)
app.include_router(statistics_router)

@app.get("/")
async def root():
    es_health = es_service.health_check()
    return {
        "message": "CheckScam API",
        "version": "2.0.0",
        "status": "running",
        "database": "ready" if db_initialized else "not_ready",
        "elasticsearch": "connected" if es_health else "disconnected",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db_status = "connected" if db_initialized else "not_connected"
        es_health = es_service.health_check()
        
        return {
            "status": "healthy" if db_initialized and es_health else "degraded",
            "database": db_status,
            "elasticsearch": "connected" if es_health else "disconnected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check error: {str(e)}")

@app.on_event("startup")
async def startup_event():
    print("=" * 60)
    print("🚀 CHECKSCAM API STARTING...")
    print("=" * 60)
    
    if db_initialized:
        print("✅ Database: READY")
    else:
        print("❌ Database: NOT READY")
    
    if es_service.health_check():
        print("✅ Elasticsearch: CONNECTED")
        if db_initialized:
            try:
                db = next(get_db())
                warnings_list = db.query(Warning).filter(
                    Warning.status == 'approved'  # SỬA: dùng string 'approved' thay vì WarningStatus.APPROVED
                ).all()
                
                if warnings_list:
                    es_service.bulk_index_warnings(warnings_list)
                    print(f"✅ Indexed {len(warnings_list)} warnings to Elasticsearch")
                else:
                    print("ℹ️ No warnings to index")
            except Exception as e:
                print(f"⚠️ Warning indexing error: {e}")
    else:
        print("⚠️ Elasticsearch: NOT CONNECTED")
    
    print("📊 API READY!")
    print("=" * 60)

@app.post("/test/register")
async def test_register():
    if not db_initialized:
        raise HTTPException(status_code=503, detail="Database not ready")
    
    return {
        "message": "Test endpoint working",
        "test_data": {"username": "testuser", "password": "test123"},
        "database": "ready"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )