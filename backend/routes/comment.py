from services.comment import CommentService
from fastapi import APIRouter, Depends, HTTPException, status,UploadFile,File,Form
from typing import Optional
from sqlalchemy.orm import Session
from db.create_db import get_db
from schemas.blog_schemas import CommentCreate, CommentResponse
from services.user import get_current_user
from uuid import UUID
from models.blog_model import User

router = APIRouter(prefix="/comments",tags=["Comments"])

@router.post("/{post_id}", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment_endpoint(
    post_id: str,
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
    ):
    try:
        post_uuid = UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

    comment_data = CommentCreate(content=content)
    
    new_comment = CommentService.create_comment(
        db=db,
        comment_data=comment_data,
        user_id=current_user.id,
        post_id=post_uuid,
        image_file=image.file if image and image.filename else None
    )
    
    return new_comment

@router.get("/{post_id}", response_model=list[CommentResponse], status_code=status.HTTP_200_OK)
async def get_comments_by_post_id(post_id: UUID, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    comments = CommentService.get_comments_by_post_id(db, post_id)
    # comments = service.
    
    if not comments:
        raise HTTPException(status_code=404, detail="No comments found for this post")
    
    return comments

@router.delete("/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_comment(comment_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    success = CommentService.delete_comment(db, comment_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found or you don't have permission to delete it")
    
    return {
        "success": True,
        "message": "Comment deleted successfully"
    }