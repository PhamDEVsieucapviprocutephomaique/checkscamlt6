# models/models.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB


class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    is_verified: bool = Field(default=False)
    

    phone: Optional[str] = Field(default=None)
    role: str = Field(default="student")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    

    profile: Optional["UserProfile"] = Relationship(back_populates="user")
    rooms: List["Room"] = Relationship(back_populates="landlord")
    wallet: Optional["Wallet"] = Relationship(back_populates="user")
    matches_as_user1: List["Match"] = Relationship(back_populates="user1", sa_relationship_kwargs={"foreign_keys": "Match.user1_id"})
    matches_as_user2: List["Match"] = Relationship(back_populates="user2", sa_relationship_kwargs={"foreign_keys": "Match.user2_id"})

class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    full_name: str
    age: int
    gender: str
    school: str
    habits: dict = Field(sa_column=Column(JSONB))
    contact_info: dict = Field(sa_column=Column(JSONB))
    status: str = Field(default="needs_room")
    is_active: bool = Field(default=True)
    max_matches: int = Field(default=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="profile")

class Room(SQLModel, table=True):
    __tablename__ = "rooms"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    landlord_id: UUID = Field(foreign_key="users.id")
    title: str
    description: Optional[str] = Field(default=None)
    province: str
    district: str
    ward: str
    address_detail: str
    area: float
    price: float
    room_status: str = Field(default="available")
    images: List[str] = Field(sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    landlord: User = Relationship(back_populates="rooms")
    matches: List["Match"] = Relationship(back_populates="room")

class Match(SQLModel, table=True):
    __tablename__ = "matches"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user1_id: UUID = Field(foreign_key="users.id")
    user2_id: UUID = Field(foreign_key="users.id")
    room_id: Optional[UUID] = Field(default=None, foreign_key="rooms.id")
    match_score: float = Field(default=0.0)
    status: str = Field(default="pending")
    connected_at: Optional[datetime] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user1: User = Relationship(back_populates="matches_as_user1", sa_relationship_kwargs={"foreign_keys": "[Match.user1_id]"})
    user2: User = Relationship(back_populates="matches_as_user2", sa_relationship_kwargs={"foreign_keys": "[Match.user2_id]"})
    room: Optional[Room] = Relationship(back_populates="matches")

class Wallet(SQLModel, table=True):
    __tablename__ = "wallets"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", unique=True)
    balance: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="wallet")
    transactions: List["Transaction"] = Relationship(back_populates="wallet")

class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    wallet_id: UUID = Field(foreign_key="wallets.id")
    amount: float
    type: str
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    wallet: Wallet = Relationship(back_populates="transactions")