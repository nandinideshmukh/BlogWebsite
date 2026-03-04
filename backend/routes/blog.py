from services.blog import PostService
from fastapi import APIRouter, Depends, HTTPException, status,UploadFile,File,Form
from schemas.blog_schemas import PostCreateRequest,PostResponse
from db.create_db import get_db
from typing import Optional
from services.user import get_current_user
from models.blog_model import User
from sqlalchemy.orm import Session
import uuid

router = APIRouter(prefix="/posts", tags=["Posts"])

@router.get("/search", status_code=status.HTTP_200_OK)
async def search_posts(title: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    posts = PostService.search_post_by_title(db, title)
    
    if not posts:
        raise HTTPException(status_code=404, detail="No posts found with the given title")
    return {
        "success": True,
        "message": "Posts retrieved successfully",
        "posts": posts
    }

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post_endp(
    title: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post with optional image."""
    
    post_data = PostCreateRequest(
        title=title,
        content=content,
        image_url=None  # Will be set from uploaded file
    )
    
    # Create post with optional image
    new_post = PostService.create_post(
        db=db,
        post_data=post_data,
        user_id=current_user.id,
        image_file=image.file if image and image.filename else None
    )
    
    return new_post


@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing post with optional new image."""
    
    # Validate and convert post_id
    try:
        post_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

    # Get existing post to preserve fields not being updated
    existing_post = PostService.get_post_by_id(db, post_uuid)
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if existing_post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    post_data = PostCreateRequest(
        title=title if title is not None else existing_post.title,
        content=content if content is not None else existing_post.content,
        image_url=None  
    )
    
    updated_post = PostService.update_post(
        db=db,
        post_id=post_uuid,
        post_data=post_data,
        user_id=current_user.id,
        image_file=image.file if image and image.filename else None
    )
    
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return updated_post

@router.get("/getAll", status_code=status.HTTP_200_OK)
async def get_all_posts(db: Session = Depends(get_db), page: int = 1, per_page: int = 10, current_user = Depends(get_current_user)):
    posts = PostService.get_all_posts(db, page=page, per_page=per_page)
    # posts = service.get_all_posts(db)
    
    if not posts:
        raise HTTPException(status_code=404, detail="No posts found")
    return {
        "success": True,
        "message": "Posts retrieved successfully",
        "posts": posts
    }
    
@router.get("/{post_id}", status_code=status.HTTP_200_OK)
async def get_post(post_id: str, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    try:
        post_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post ID format")
    
    post = PostService.get_post_by_id(db,post_uuid)
    # post = service.get_post_by_id(db, post_uuid)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {
        "success": True,
        "message": "Post retrieved successfully",
        "post": post
    }

    
@router.delete("/{post_id}", status_code=status.HTTP_200_OK)
async def delete_post(post_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        post_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post ID format")
    
    success = PostService.delete_post(db, post_uuid, current_user.id)
    # success = service.delete_post(db, post_uuid, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Post not found or you don't have permission to delete it")
    return {
        "success": True,
        "message": "Post deleted successfully"
    }
    
@router.get("/user/{user_id}/", status_code=status.HTTP_200_OK)
async def get_user_posts(user_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    posts = PostService.get_posts_by_user_id(db, user_uuid)
    
    if not posts:
        raise HTTPException(status_code=404, detail="No posts found for this user")
    return {
        "success": True,
        "message": "User posts retrieved successfully",
        "posts": posts
    }

