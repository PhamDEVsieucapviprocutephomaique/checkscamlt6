# core/database.py
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
import os 

# DATABASE_URL = "postgresql://user:28092004@localhost:7001/trending_db"
# ASYNC_DATABASE_URL = "postgresql+asyncpg://user:28092004@localhost:7001/trending_db"

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:28092004@postgres:5432/trending_db")
ASYNC_DATABASE_URL = os.getenv("ASYNC_DATABASE_URL", "postgresql+asyncpg://user:28092004@postgres:5432/trending_db")

engine = create_engine(DATABASE_URL, echo=True)
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)

async_session_maker = async_sessionmaker(
    async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

async def get_async_session():
    async with async_session_maker() as session:
        yield session