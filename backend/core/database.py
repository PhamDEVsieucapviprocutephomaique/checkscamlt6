from sqlalchemy import create_engine, text, inspect, MetaData, Table, Column, Integer, String, Boolean, DateTime, Text, JSON, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import traceback

DATABASE_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD.replace('@', '%40')}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

print(f"🔗 DATABASE_URL: {DATABASE_URL}")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=True,
    future=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Tạo tables MANUAL nếu SQLAlchemy không tạo được"""
    print("🔄 CREATING TABLES MANUALLY...")
    
    metadata = MetaData()
    
    # Tạo tables bằng raw SQL
    create_sqls = [
        # users table
        """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(20) UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            full_name VARCHAR(255),
            avatar_url VARCHAR(500),
            zalo_contact VARCHAR(50),
            is_active BOOLEAN DEFAULT TRUE,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            INDEX idx_username (username),
            INDEX idx_email (email),
            INDEX idx_phone (phone)
        ) ENGINE=InnoDB
        """,
        
        # warnings table
        """
        CREATE TABLE IF NOT EXISTS warnings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            scammer_name VARCHAR(255) NOT NULL,
            bank_account VARCHAR(100),
            bank_name VARCHAR(100),
            facebook_link VARCHAR(500),
            content TEXT NOT NULL,
            category VARCHAR(50) DEFAULT 'other',
            evidence_images JSON,
            status VARCHAR(20) DEFAULT 'pending',
            view_count INT DEFAULT 0,
            search_count INT DEFAULT 0,
            warning_count INT DEFAULT 1,
            
            reporter_id INT,
            reporter_name VARCHAR(255),
            reporter_zalo VARCHAR(50),
            is_anonymous BOOLEAN DEFAULT FALSE,
            reporter_nickname VARCHAR(100),
            
            reviewer_id INT,
            reviewed_at TIMESTAMP NULL,
            review_note TEXT,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
            approved_at TIMESTAMP NULL,
            
            FOREIGN KEY (reporter_id) REFERENCES users(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id),
            INDEX idx_scammer_name (scammer_name),
            INDEX idx_bank_account (bank_account),
            INDEX idx_status (status)
        ) ENGINE=InnoDB
        """,
        
        # reports table
        """
        CREATE TABLE IF NOT EXISTS reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            report_type VARCHAR(50),
            
            scammer_name VARCHAR(255),
            bank_account VARCHAR(100),
            bank_name VARCHAR(100),
            facebook_link VARCHAR(500),
            
            website_url VARCHAR(500),
            website_category VARCHAR(100),
            
            content TEXT NOT NULL,
            evidence_images JSON,
            category VARCHAR(50) DEFAULT 'other',
            status VARCHAR(20) DEFAULT 'pending',
            
            reporter_id INT,
            reporter_name VARCHAR(255),
            reporter_zalo VARCHAR(50),
            reporter_email VARCHAR(255),
            agree_terms BOOLEAN DEFAULT FALSE,
            
            reviewer_id INT,
            reviewed_at TIMESTAMP NULL,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (reporter_id) REFERENCES users(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id)
        ) ENGINE=InnoDB
        """,
        
        # comments table
        """
        CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            warning_id INT NOT NULL,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            is_verified_victim BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (warning_id) REFERENCES warnings(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB
        """,
        
        # admin_profiles table
        """
        CREATE TABLE IF NOT EXISTS admin_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNIQUE,
            admin_number INT UNIQUE,
            facebook_main VARCHAR(500),
            facebook_backup VARCHAR(500),
            zalo VARCHAR(50),
            website VARCHAR(500),
            services JSON,
            bank_accounts JSON,
            insurance_fund FLOAT DEFAULT 0,
            is_public BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB
        """,
        
        # search_logs table
        """
        CREATE TABLE IF NOT EXISTS search_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            search_query VARCHAR(500) NOT NULL,
            search_type VARCHAR(50),
            user_id INT,
            ip_address VARCHAR(50),
            result_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB
        """,
        
        # statistics table
        """
        CREATE TABLE IF NOT EXISTS statistics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total_warnings INT DEFAULT 0,
            total_views INT DEFAULT 0,
            total_reports INT DEFAULT 0,
            top_scammers JSON,
            top_searches JSON,
            recent_warnings JSON
        ) ENGINE=InnoDB
        """
    ]
    
    try:
        with engine.connect() as conn:
            for i, sql in enumerate(create_sqls):
                print(f"Creating table {i+1}/7...")
                conn.execute(text(sql))
            conn.commit()
        
        print("✅ ALL TABLES CREATED MANUALLY!")
        
        # Verify
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"📊 Tables in database: {tables}")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR creating tables: {e}")
        traceback.print_exc()
        return False

def drop_tables():
    print("⚠️ Dropping all tables...")
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS statistics, search_logs, comments, reports, warnings, admin_profiles, users"))
        conn.commit()
    print("✅ All tables dropped")