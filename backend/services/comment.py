from schemas.blog_schemas import CommentCreate
from models.blog_model import Comment
import uuid, datetime
from services.user import add_image


class CommentService:

    def create_comment(db, comment_data: CommentCreate, user_id, post_id, image_file=None) -> Comment:
        comment_id = uuid.uuid4()
        image_url = comment_data.image_url

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
        
        if isinstance(comment_id, str):
            comment_id = uuid.UUID(comment_id) 
        
        if image_file:
            image_result = add_image(
                user_id=str(user_id),
                image_file=image_file,
                db=db,
                image_type="comment",
                comment_id=str(comment_id)
            )
            
            if image_result["success"]:
                image_url = image_result["image_url"]
            else:
                print(f"Image upload failed: {image_result['message']}")
        
        new_comment = Comment(
            id=comment_id, 
            content=comment_data.content,
            user_id=user_id,
            post_id=post_id,
            image_url=image_url,
            created_at=datetime.datetime.utcnow(),
        )
        
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)
        return new_comment

    def get_comments_by_post_id(db, post_id) -> list[Comment]:
        if isinstance(post_id, str):
            try:
                post_id = uuid.UUID(post_id)
            except ValueError:
                return []
        return (
            db.query(Comment)
            .filter(Comment.post_id == post_id)
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
