from uuid import UUID
import uuid, datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session
from schemas.blog_schemas import LikeRequest, LikeResponse
from models.blog_model import Post, Comment, Likes



class LikeService:
    post_likes_count = 0
    comment_likes_count = 0
    
    def like_post(db: Session, user_id:UUID, post_id:UUID) -> LikeResponse:
        post = db.query(Post).filter(Post.id == post_id).first()
        
        if not post:
            return LikeResponse(
                success=False, message="Post not found", user_id=user_id, post_id=post_id
            )
        # toggling between like and unlike
        existing_like = (
                db.query(Likes)
                .filter(
                    Likes.user_id == user_id,
                    Likes.post_id == post_id,
                )
                .first()
            )
        if existing_like:
                like_id = existing_like.id
                db.delete(existing_like)
                db.commit()
                return LikeResponse(
                    id=like_id,
                    success=True, message="Post unliked successfully", user_id=user_id, post_id=post_id
                )
        else:
            like = Likes(
                id=uuid.uuid4(),
                user_id=user_id,
                post_id=post_id,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(like)
            db.commit()
                
       
        return LikeResponse(
            id=like.id,
            success=True, message="Post liked successfully", user_id=user_id, post_id=post_id
        )

    def like_comment(db: Session, user_id:UUID, comment_id:UUID) -> LikeResponse:
        comment = (
            db.query(Comment).filter(Comment.id == comment_id).first()
        )
        if not comment:
            return LikeResponse(
                success=False, message="Comment not found", user_id=user_id, comment_id=comment_id
            )
        # toggling between like and unlike
        existing_like = (
                db.query(Likes)
                .filter(
                    Likes.user_id == user_id,
                    Likes.comment_id == comment_id,
                )
                .first()
            )
        if existing_like:
                like_id = existing_like.id
                db.delete(existing_like)
                db.commit()
                return LikeResponse(
                    id=like_id,
                    success=True, message="Comment unliked successfully", user_id=user_id, comment_id=comment_id
                )
        else:
            like = Likes(
                id=uuid.uuid4(),
                user_id=user_id,
                comment_id=comment_id,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(like)
            db.commit()

        return LikeResponse(
            id=like.id,
            success=True, message="Comment liked successfully", user_id=user_id, comment_id=comment_id
        )

    def get_likes_by_post_id(db: Session, post_id: UUID) -> list[LikeResponse]:
        # fetch all likes for the post and compute count
        likes = db.query(Likes).filter(Likes.post_id == post_id).all()
        post_likes_count = len(likes)
        return [
            LikeResponse(
                id=like.id,
                success=True,
                message="Like found",
                user_id=like.user_id,
                post_id=like.post_id,
                total_likes=post_likes_count,
            )
            for like in likes
        ]
    
    def get_likes_by_comment_id(db: Session, comment_id: UUID) -> list[LikeResponse]:
        # fetch likes and count them
        likes = (
            db.query(Likes)
            .filter(
                Likes.comment_id == comment_id,
                # if this is there then likes comments do not get triggered
                # Likes.post_id.isnot(None)
            )
            .all()
)
        comment_likes_count = len(likes)
        return [
            LikeResponse(
                id=like.id,
                success=True,
                message="Like found",
                user_id=like.user_id,
                comment_id=like.comment_id,
                total_likes=comment_likes_count,
            )
            for like in likes
        ]
    
    def get_likesposts_by_user_id(db:Session,user_id:UUID) -> list[LikeResponse]:
        if(isinstance(user_id,str)):
            user_id = UUID(user_id)
        likes = (
            db.query(Likes)
            .filter(
                Likes.user_id == user_id,
                Likes.post_id.isnot(None)
            )
            .all()
        )
        
        return [
            LikeResponse(
                id=like.id,
                success=True,
                message="Likes by user",
                # comment_id = like.comment_id,
                post_id = like.post_id,
                user_id=like.user_id,
                total_likes=0,
            )
            for like in likes
        ]

    def get_likescomments_by_user_id(db:Session,user_id:UUID) -> list[LikeResponse]:
        if(isinstance(user_id,str)):
            user_id = UUID(user_id)
        likes = db.query(Likes).filter(Likes.user_id == user_id,
                Likes.comment_id.isnot(None)
                )  
        return [
            LikeResponse(
                id=like.id,
                success=True,
                message="Likes by user",
                comment_id = like.comment_id,
                # post_id = like.post_id,
                user_id=like.user_id,
                total_likes=0,
            )
            for like in likes
        ]

        