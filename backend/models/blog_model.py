from sqlalchemy import ForeignKey, Column, String, DateTime, Text, UUID
from typing import List
from db.create_db import Base
from sqlalchemy.orm import Mapped, relationship
from pydantic import field_validator
import uuid, datetime

class User(Base):
    __tablename__ = "user"
    __allow_unmapped__ = True
    
    id = Column(UUID(), primary_key=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    role = Column(String, default="user")

    profile_image = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    
    provider = Column(String, default="local")

    # cascade delete so that removing a user automatically deletes their
    # posts, comments and likes at the ORM level
    posts: Mapped[List["Post"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    likes: Mapped[List["Likes"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    
    @field_validator("email")
    def validate_email(cls, value):
        if "@" not in value:
            raise ValueError("Invalid email address")
        return value
    
    @field_validator("username")
    def validate_username(cls, value):
        if len(value) < 3:
            raise ValueError("Username must be at least 3 characters long")
        return value
    

class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(), primary_key=True, index=True, nullable=False)
    user_id = Column(UUID(), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    title = Column(String, index=True, nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)
    
    # liked by many users, so we can have a separate table for likes in the future

    image_url = Column(String, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="posts")
    comments: Mapped[List["Comment"]] = relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    likes: Mapped[List["Likes"]] = relationship(back_populates="post")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(UUID(), primary_key=True, index=True, nullable=False)
    post_id = Column(UUID(), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)

    # liked by many users, so we can have a separate table for likes in the future
    # the future is presented below as the Likes table haahaahaa
    
    image_url = Column(String, nullable=True)

    post: Mapped["Post"] = relationship(back_populates="comments", passive_deletes=True)
    user: Mapped["User"] = relationship(back_populates="comments")
    likes: Mapped[List["Likes"]] = relationship(back_populates="comment")


class Likes(Base):
    __tablename__ = "likes"

    id = Column(UUID(), primary_key=True, index=True, nullable=False, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("user.id", ondelete="CASCADE"),nullable=False)
    post_id = Column(UUID(), ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    comment_id = Column(UUID(), ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="likes")
    post: Mapped["Post"] = relationship(back_populates="likes")
    comment: Mapped["Comment"] = relationship(back_populates="likes")

class SiteVisit(Base):
    __tablename__ = "site_visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ip_address = Column(String)
    user_agent = Column(String)
    visited_at = Column(DateTime, default=datetime.datetime.utcnow)
    