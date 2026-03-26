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
    
    
    new_comment =await CommentService.create_comment(
        db=db,
        comment_data=comment_data,
        user_id=current_user.id,
        post_id=post_uuid,
        image_file=image.file if image and image.filename else None
    )
    
    return new_comment

@router.get("/post/{post_id}", response_model=list[CommentResponse], status_code=status.HTTP_200_OK)
async def get_comments_by_postid(post_id: UUID, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    comments = CommentService.get_comments_by_post_id(db, post_id)
    
    if not comments:
        raise HTTPException(status_code=404, detail="No comments found for this post")
    
    return comments

@router.get("/user/{user_id}",response_model=list[CommentResponse],status_code=status.HTTP_200_OK)
async def get_user_comments(user_id: str, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    comments = CommentService.get_comments_by_user_id(db, user_id)

    if not comments:
        raise HTTPException(status_code=404, detail="No comments found")

    return comments

@router.get("/{comment_id}/",response_model=CommentResponse,status_code=status.HTTP_200_OK)
async def get_comment_by_id(comment_id: str, db: Session = Depends(get_db),current_user = Depends(get_current_user)
):
    comment = CommentService.get_comment_by_id(db, comment_id)

    if not comment:
        raise HTTPException(status_code=404, detail="No comments found")

    return comment

@router.delete("/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_comment(comment_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    success = CommentService.delete_comment(db, comment_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found or you don't have permission to delete it")
    
    return {
        "success": True,
        "message": "Comment deleted successfully"
    }
    

@router.post("/{comment_id}/reply", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_reply_on_comment(
    comment_id: str,
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a reply to an existing comment.
    - **comment_id**: ID of the parent comment to reply to
    - **content**: The reply text
    - **image**: Optional image to attach to the reply
    """
    try:
        parent_comment_uuid = UUID(comment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid comment ID format")
    
    comment_data = CommentCreate(content=content)
    
    image_bytes = None
    if image and image.filename:
        image_bytes = await image.read()
    
    reply =await CommentService.create_reply_on_comment(
        db=db,
        comment_data=comment_data,
        user_id=current_user.id,
        parent_comment_id=parent_comment_uuid,
        image_file=image_bytes
    )
    
    if reply is None:
        raise HTTPException(status_code=404, detail="Parent comment not found")
    
    return reply


@router.get("/{comment_id}/replies", response_model=list[CommentResponse], status_code=status.HTTP_200_OK)
async def get_replies_by_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all replies for a specific comment.
    - **comment_id**: ID of the parent comment
    """
    try:
        comment_uuid = UUID(comment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid comment ID format")
    
    replies = CommentService.get_replies_by_comment_id(db, comment_uuid)
    
    return replies

@router.get("/post/{post_id}/with-replies", response_model=list[CommentResponse], status_code=status.HTTP_200_OK)
async def get_comments_with_replies(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        post_uuid = UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post ID format")
    
    comments = CommentService.get_comments_by_post_id(db, post_uuid)
    
    for comment in comments:
        comment.replies = CommentService.get_replies_by_comment_id(db, comment.id)
    
    return comments