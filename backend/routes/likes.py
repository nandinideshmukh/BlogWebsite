from services.likes import LikeService
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from db.create_db import get_db
from schemas.blog_schemas import LikeRequest, LikeResponse
from services.user import get_current_user
from uuid import UUID
router = APIRouter(prefix="/likes", tags=["Likes"])

@router.get("/posts/{user_id}", response_model=list[LikeResponse], status_code=status.HTTP_200_OK)
async def get_likesp_by_userid(user_id,db:Session = Depends(get_db),current_user = Depends(get_current_user)):
    return LikeService.get_likesposts_by_user_id(db,user_id)

@router.get("/comments/{user_id}", response_model=list[LikeResponse], status_code=status.HTTP_200_OK)
async def get_likesc_by_userid(user_id,db:Session = Depends(get_db),current_user = Depends(get_current_user)):
    return LikeService.get_likescomments_by_user_id(db,user_id)


@router.post("/post/{post_id}", response_model=LikeResponse, status_code=status.HTTP_201_CREATED)
async def like_post(post_id: UUID, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    return LikeService.like_post(db, current_user.id, post_id)


@router.post("/comment/{comment_id}", response_model=LikeResponse, status_code=status.HTTP_201_CREATED)
async def like_comment(comment_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return LikeService.like_comment(db, current_user.id, comment_id)

@router.get("/post/{post_id}", response_model=list[LikeResponse], status_code=status.HTTP_200_OK)
async def get_likes_by_post_id(post_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return LikeService.get_likes_by_post_id(db, post_id)

@router.get("/comment/{comment_id}", response_model=list[LikeResponse], status_code=status.HTTP_200_OK)
async def get_likes_by_comment_id(comment_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return LikeService.get_likes_by_comment_id(db, comment_id)

