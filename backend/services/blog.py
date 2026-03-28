from schemas.blog_schemas import PostCreateRequest
from models.blog_model import Post, Comment,Likes
import uuid, datetime
from sqlalchemy.orm import Session, joinedload, selectinload
from services.user import add_image

class PostService:

    async def create_post(
        db: Session, 
        post_data: PostCreateRequest, 
        user_id, 
        image_file=None  
    ) -> Post:
        
        # Generate post ID first
        post_id = uuid.uuid4()
        image_url = post_data.image_url

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
                image_type="post",
                post_id=str(post_id) )
            
            if image_result["success"]:
                image_url = image_result["image_url"]
        
        new_post = Post(
            id=post_id,
            user_id=user_id,
            title=post_data.title,
            content=post_data.content,
            created_at=datetime.datetime.utcnow(),
            image_url=image_url,
        )
        
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        return new_post


    async def update_post(
            db: Session, 
            post_id: uuid.UUID, 
            post_data: PostCreateRequest, 
            user_id,
            image_file=None 
        ) -> Post:
            
            if isinstance(user_id, str):
                try:
                    user_id = uuid.UUID(user_id)
                except ValueError:
                    pass
            post = db.query(Post).filter(Post.id == post_id, Post.user_id == user_id).first()
            
            if not post:
                return None
            
            if image_file:
                image_result =await add_image(
                    user_id=str(user_id),
                    image_file=image_file,
                    db=db,
                    image_type="post",
                    post_id=str(post_id)
                )
                
                if image_result["success"]:
                    post.image_url = image_result["image_url"]  
            elif post_data.image_url:
                post.image_url = post_data.image_url
            
            post.title = post_data.title
            post.content = post_data.content
            
            db.commit()
            db.refresh(post)
            return post
            
    def get_all_posts(db, page: int = 1, per_page: int = 10) -> list[Post]:
        offset = (page - 1) * per_page
        total_posts = db.query(Post).count()
        posts =  (
            db.query(Post)
            .options(
                joinedload(Post.user),
                selectinload(Post.comments)
                .selectinload(Comment.user),
                selectinload(Post.comments)
                .selectinload(Comment.replies)
                .selectinload(Comment.user)
            )
            .order_by(Post.created_at.desc())
            .offset(offset)
            .limit(per_page)
            .all()
        )
        for post in posts:
            post.likes_count = db.query(Likes).filter(Likes.post_id == post.id).count()
        return posts,total_posts

    def get_post_by_id(db, post_id) -> Post:
        # Ensure post_id is a UUID instance before querying. Accepts both str and uuid.UUID.
        if isinstance(post_id, str):
            try:
                post_id = uuid.UUID(post_id)
            except ValueError:
                # invalid format will simply not match any rows
                return None
        post =  (
            db.query(Post)
            .options(
                joinedload(Post.user),
                selectinload(Post.comments)
                .selectinload(Comment.user),
                selectinload(Post.comments)
                # .selectinload(Comment.replies)
                .selectinload(Comment.user)
            )
            .filter(Post.id == post_id)
            .first()
        )
        if post:
            post.likes_count = db.query(Likes).filter(Likes.post_id == post.id).count()
        return post

    def delete_post(db, post_id, user_id) -> bool:
        post = (
            db.query(Post).filter(Post.id == post_id, Post.user_id == user_id).first()
        )
        if not post:
            return False
        db.delete(post)
        db.commit()
        return True

    def get_posts_by_user_id(db, user_id) -> list[Post]:
        try:
            posts =  (
                db.query(Post)
                .options(
                    joinedload(Post.user),
                    selectinload(Post.comments)
                    .selectinload(Comment.user),
                    selectinload(Post.comments)
                    # .selectinload(Comment.replies)
                    .selectinload(Comment.user)
                )
                .filter(Post.user_id == user_id)
                .order_by(Post.created_at.desc())
                .all()
            )
            for post in posts:
                post.likes_count = db.query(Likes).filter(Likes.post_id == post.id).count()
            return posts
        except Exception as e:
            raise e
            
    def search_post_by_title(db, title: str, limit: int = 10, pages: int = 1) -> list[Post]:
        try:
            offset = (pages - 1) * limit
            return (
                db.query(Post)
                .options(
                    joinedload(Post.user),
                    selectinload(Post.comments)
                    .selectinload(Comment.user),
                    selectinload(Post.comments)
                    .selectinload(Comment.replies)
                    .selectinload(Comment.user)
                )
                .filter(Post.title.ilike(f"%{title}%"))
                .order_by(Post.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )
        except Exception as e:
            return []