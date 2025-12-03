# api/user_api.py
from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_async_session
from core.auth import current_active_user
from models.models import User

router = APIRouter()

@router.get("/me")
async def get_me(user: User = Depends(current_active_user)):
    return {"email": user.email, "role": user.role, "id": str(user.id)}

@router.get("/count")
async def get_users_count(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User))
    users = result.scalars().all()
    return {
        "total_users": len(users),
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active
            } for u in users
        ]
    }

@router.get("/debug")
async def debug_users(session: AsyncSession = Depends(get_async_session)):
    try:
        from sqlmodel import text
        
        result = await session.execute(text("SELECT 1"))
        db_ok = result.scalar() == 1
        
        result = await session.execute(
            text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')")
        )
        table_exists = result.scalar()
        
        result = await session.execute(select(User))
        users_count = len(result.scalars().all())
        
        return {
            "database_connected": db_ok,
            "users_table_exists": table_exists,
            "total_users": users_count
        }
        
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}