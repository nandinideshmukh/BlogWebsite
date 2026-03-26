from schemas.blog_schemas import CommentCreate
from models.blog_model import Comment
import uuid, datetime
from sqlalchemy.orm import joinedload,selectinload
from services.user import add_image


class CommentService:

    async def create_comment(db, comment_data: CommentCreate, user_id, post_id, image_file=None) -> Comment:
        comment_id = uuid.uuid4()
        image_url = None

        if isinstance(user_id, str):
            try:
                user_id = uuid.UUID(user_id)
            except ValueError:
                pass
        if isinstance(post_id, str):
            try:
                post_id = uuid.UUID(post_id)
            except ValueError:
                pass
        print(image_file)
        if image_file:
            print(f"Uploading image for comment {comment_id}")  
            
            image_result =await  add_image(
                user_id=str(user_id),  
                image_file=image_file,
                db=db,
                image_type="comment",
                comment_id=str(comment_id)
            )
            
            print(f"Image result: {image_result}")  
            
            if image_result["success"]:
                image_url = image_result["image_url"]
                print(f"Image uploaded successfully: {image_url}")
            else:
                print(f"Image upload failed: {image_result['message']}")
        else:
            image_url = comment_data.image_url
        
        new_comment = Comment(
            id=comment_id, 
            content=comment_data.content,
            user_id=user_id,
            post_id=post_id,
            image_url=image_url,
            created_at=datetime.datetime.now(),
        )
        
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)
        
        new_comment = (
            db.query(Comment)
            .options(joinedload(Comment.user))
            .filter(Comment.id == comment_id)
            .first()
        )

        return new_comment

    def get_comments_by_post_id(db, post_id) -> list[Comment]:
        if isinstance(post_id, str):
            try:
                post_id = uuid.UUID(post_id)
            except ValueError:
                return []
        return (
            db.query(Comment)
            .options(
                joinedload(Comment.user),
                selectinload(Comment.replies)
                .selectinload(Comment.user),

                selectinload(Comment.replies)
                .selectinload(Comment.replies)
                .selectinload(Comment.user),

                selectinload(Comment.replies)
                .selectinload(Comment.replies)
                .selectinload(Comment.replies)
                .selectinload(Comment.user),
            )
            .filter(Comment.post_id == post_id,Comment.parent_comment_id == None)
            .order_by(Comment.created_at.desc())
            .all()
        )

    def delete_comment(db, comment_id, user_id) -> bool:
        if isinstance(comment_id, str):
            try:
                comment_id = uuid.UUID(comment_id)
            except ValueError:
                return False
        if isinstance(user_id, str):
            try:
                user_id = uuid.UUID(user_id)
            except ValueError:
                pass
        comment = (
            db.query(Comment)
            .filter(Comment.id == comment_id, Comment.user_id == user_id)
            .first()
        )
        if not comment:
            return False
        db.delete(comment)
        db.commit()
        return True
    
    def get_comments_by_user_id(db,user_id) -> list[Comment]:
        if isinstance(user_id, str):
            try:
                user_id = uuid.UUID(user_id)
            except ValueError:
                return []

        return (
            db.query(Comment)
            .filter(Comment.user_id == user_id)
            .order_by(Comment.created_at.desc())
            .all()
            )
    
    def get_replies_by_comment_id(db, comment_id) -> list[Comment]:
        if isinstance(comment_id, str):
            try:
                comment_id = uuid.UUID(comment_id)
            except ValueError:
                return []
        
        return (
            db.query(Comment)
            .options(joinedload(Comment.user))
            .filter(Comment.parent_comment_id == comment_id)
            .order_by(Comment.created_at.asc())  
            .all()
        )

    def get_comment_by_id(db,comment_id) -> Comment:
        if isinstance(comment_id, str):
            try:
                comment_id = uuid.UUID(comment_id)
            except ValueError:
                return []

        return (
            db.query(Comment)
            .filter(Comment.id == comment_id)
            .first()
            )
    
    async def create_reply_on_comment(db, comment_data: CommentCreate, user_id, parent_comment_id, image_file=None) -> Comment:
    
        if isinstance(parent_comment_id, str):
            try:
                parent_comment_id = uuid.UUID(parent_comment_id)
            except ValueError:
                return None
        
        parent_comment = db.query(Comment).filter(Comment.id == parent_comment_id).first()
        if not parent_comment:
            return None
        
        reply_id = uuid.uuid4()
        image_url = None
        
        if isinstance(user_id, str):
            try:
                user_id = uuid.UUID(user_id)
            except ValueError:
                pass
        
        if image_file:
            image_result =await add_image(
                user_id=str(user_id),
                image_file=image_file,
                db=db,
                image_type="comment",
                comment_id=str(reply_id)
            )
            
            if image_result["success"]:
                image_url = image_result["image_url"]
            else:
                print(f"Image upload failed: {image_result['message']}")
        else:
            image_url = comment_data.image_url
        
        reply_comment = Comment(
            id=reply_id,
            content=comment_data.content,
            user_id=user_id,
            post_id=parent_comment.post_id,  
            parent_comment_id=parent_comment_id,
            image_url=image_url,
            created_at=datetime.datetime.now(),
        )
        
        db.add(reply_comment)
        db.commit()
        db.refresh(reply_comment)
        
        reply_comment = (
            db.query(Comment)
            .options(joinedload(Comment.user))
            .filter(Comment.id == reply_id)
            .first()
        )

        return reply_comment
        