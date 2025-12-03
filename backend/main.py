# server/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi_users import schemas
import uuid
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import create_db_and_tables, get_async_session, engine, Session
from core.auth import auth_backend, fastapi_users, current_active_user
from models.models import User

from services.elasticsearch_service import create_index_if_not_exists, initial_indexing


from api.userapi import router as user_router  # THÊM DÒNG NÀY
from api.roomapi import router as room_router
from api.findroom import router as find_room_router
from api.filterroom import router as filter_router



app = FastAPI()

# CORS cho phép TẤT CẢ origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép mọi domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRead(schemas.BaseUser[uuid.UUID]):
    phone: str | None = None
    role: str

class UserCreate(schemas.BaseUserCreate):
    phone: str | None = None
    role: str = "student"

class UserUpdate(schemas.BaseUserUpdate):
    phone: str | None = None
    role: str | None = None

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"]
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"]
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"]
)


# API USER
app.include_router(
    user_router,
    prefix="/api/users",
    tags=["users-api"]
)

# api room 

app.include_router(
    room_router,
    prefix="/api/rooms",
    tags=["rooms"]
)


# api tim phong

app.include_router(
    find_room_router,
    prefix="/api/find-rooms",
    tags=["find-rooms"]
)
# api cac loai filter

app.include_router(
    filter_router,
    prefix="/api/filters",
    tags=["filters"]
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()


    import time
    for i in range(10):
        try:
            create_index_if_not_exists()
            with Session(engine) as db: 
                initial_indexing(db)
            print("✅ Elasticsearch initialized successfully")
            break
        except Exception as e:
            print(f"🔄 Attempt {i+1}: ES not ready, retrying...")
            time.sleep(5)

@app.get("/")
def root():
    return {"message": "API Running"}

