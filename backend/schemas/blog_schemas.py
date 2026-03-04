import sqlalchemy
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional,List
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Optional[str] = "user"
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    
class UserCreate(UserBase):
    password: str

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    role: str = None
    bio: Optional[str] = None
    profile_image: Optional[str]
    provider: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    token: str
    
class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    access_token: Optional[str] = None

class PostBase(BaseModel):
    title: Optional[str] = None
    content: str
    image_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
    
class PostCreateRequest(PostBase):
    pass
    
class PostResponse(PostBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    user: UserResponse  
    comments: Optional[List["CommentResponse"]] = []  # For future use

    model_config = ConfigDict(from_attributes=True)

class CommentBase(BaseModel):
    content: str
    image_url: Optional[str] = None

class CommentCreate(CommentBase):
    pass  

class CommentResponse(CommentBase):
    id: UUID
    post_id: UUID
    user_id: UUID
    created_at: datetime
    image_url: Optional[str] = None
    content: str
    user: UserResponse  

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    username: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserSearchResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    role: str

class LikeRequest(BaseModel):
    user_id:UUID
    post_id: Optional[UUID] = None
    comment_id: Optional[UUID] = None
    
class LikeResponse(LikeRequest):
    id: Optional[UUID] = None
    success: bool
    message: str
    # total number of likes for the associated post/comment
    total_likes: Optional[int] = None

# Fix circular reference for comments in PostResponse
PostResponse.model_rebuild()
CommentResponse.model_rebuild()