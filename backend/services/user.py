from sympy import limit

from models.blog_model import User, Post, Comment, Likes
import dotenv
from db.create_db import get_db
import os,uuid
from datetime import datetime, timedelta, timezone
from jose import jwt
from models.blog_model import SiteVisit
from typing import Optional, Dict, Any,Literal
from jose import JWTError
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")
dotenv.load_dotenv()

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# bcrypt imposes a 72‑byte limit on the input; we'll enforce that in validation
BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT access token and return it as a string."""
    to_encode = data.copy()

    # Get expiration time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
        expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)

    to_encode.update({"exp": expire})

    # Get secret key and algorithm from environment
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise ValueError("SECRET_KEY environment variable is not set")

    algorithm = os.getenv("ALGORITHM", "HS256")

    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt


def check_user_exists(email: str, db: Session) -> bool:
    """Check if a user with the given email exists."""
    return db.query(User).filter_by(email=email).first() is not None

def check_user_exists_username(username: str, db: Session) -> bool:
    """Check if a user with the given username exists."""
    return db.query(User).filter_by(username=username).first() is not None


def get_user_by_email(email: str, db: Session) -> Optional[User]:
    """Get a user by email."""
    return db.query(User).filter_by(email=email).first()


def get_user_by_id(user_id: str, db: Session) -> Optional[User]:
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        return None

    return db.query(User).filter(User.id == user_uuid).first()


def validate_password(password: str) -> tuple[bool, str]:
  
    if not password or password.strip() == "":
        return False, "Password cannot be empty."
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    # bcrypt has a hard 72‑byte limit on the input
    if len(password.encode("utf-8")) > BCRYPT_MAX_BYTES:
        return False, f"Password cannot be longer than {BCRYPT_MAX_BYTES} bytes."
    # Check for at least one number and one letter
    if not any(char.isdigit() for char in password):
        return False, "Password must contain at least one number."
    if not any(char.isalpha() for char in password):
        return False, "Password must contain at least one letter."
    return True, ""



def create_user(
    username: str, 
    email: str, 
    password: str, 
    bio: Optional[str], 
    role: str, 
    db: Session,
    profile_image_file=None,
) -> Dict[str, Any]:
    """Create a new user with optional profile image."""
    try:
        if check_user_exists(email=email, db=db):
            return {
                "success": False,
                "message": "User with this email already exists.",
                "user": None,
                "access_token": None,
            }

        # Validate password
        is_valid, error_message = validate_password(password)
        if not is_valid:
            return {
                "success": False,
                "message": f"Error creating user: {error_message}",
                "user": None,
                "access_token": None,
            }

        hashed_password = hash_password(password)

        # Create user with profile_image as None initially
        user = User(
            id=uuid.uuid4(), 
            username=username, 
            email=email, 
            role=role,
            profile_image=None,  # Will be updated after upload
            bio=bio,
            password_hash=hashed_password,
            created_at=datetime.now(timezone.utc),  
            provider="local" 
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Upload profile image if provided
        profile_image_url = None
        if profile_image_file:
            print(f"Uploading image for user {user.id}")  # Debug
            image_result = add_image(
                user_id=str(user.id),
                image_file=profile_image_file,
                db=db,
                image_type="profile"
            )
            print(f"Image result: {image_result}")  # Debug
            
            if image_result["success"]:
                profile_image_url = image_result["image_url"]
                user.profile_image = profile_image_url
                db.commit()
                db.refresh(user)
            else:
                print(f"Image upload failed: {image_result['message']}")
        
        access_token = create_access_token(
            data={"sub": user.email, "user_id": str(user.id)}
        )

        return {
            "success": True,
            "message": "User created successfully.",
            "user": {
                "id": str(user.id),
                "username": user.username,
                "role": user.role,
                "email": user.email,
                "provider": user.provider,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "profile_image": user.profile_image,  # This will now have the URL
                "bio": user.bio,
            },
            "access_token": access_token,
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {str(e)}")  # Debug
        return {
            "success": False,
            "message": f"Error creating user: {str(e)}",
            "user": None,
            "access_token": None,
        }

def get_user_by_username(username: str, db: Session) -> Optional[User]:
    """Get a user by username."""
    return db.query(User).filter_by(username=username).first()

def login_user(username: str, password: str, db: Session) -> Dict[str, Any]:
    """Login a user with username and password."""
    try:
        user = get_user_by_username(username, db)

        if not user:
            return {
                "success": False,
                "message": "User with this username does not exist.",
                "user": None,
                "access_token": None,
            }

        if not verify(password, user.password_hash):
            return {
                "success": False,
                "message": "Invalid username or password.",
                "user": None,
                "access_token": None, 
            }

        access_token = create_access_token(
            data={"sub": user.email, "user_id": str(user.id)}
        )

        return {
            "success": True,
            "message": "User logged in successfully.",
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "provider": user.provider,
                "created_at": user.created_at,
                "profile_image": user.profile_image,
                "bio": user.bio,
            },
            "access_token": access_token,
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error logging in user: {str(e)}",
            "user": None,
            "access_token": None,
        }

def login_by_google(google_user_info: dict, db: Session) -> Dict[str, Any]:
    try:
        email = google_user_info.get("email")
        username = google_user_info.get("username")  # Changed from 'name' to 'username'

        if not email:
            return {
                "success": False,
                "message": "Google user info must include an email.",
                "user": None,
                "access_token": None,
            }

        user = get_user_by_email(email, db)

        if user is None:
            import secrets
            import string

            alphabet = string.ascii_letters + string.digits
            
            alphabet = string.ascii_letters + string.digits
            random_password = ''.join(secrets.choice(alphabet) for _ in range(30))            
            password_bytes = random_password.encode('utf-8')
            
            if len(password_bytes) > 72:
                random_password = random_password[:60]

            user = User(
                username=username or email.split('@')[0],  # fallback if username missing
                email=email,
                password_hash=hash_password(random_password),
                provider="google",
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        access_token = create_access_token(
            data={"sub": user.email, "user_id": str(user.id)}
        )

        return {
            "success": True,
            "message": "User logged in successfully via Google.",
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "provider": user.provider,
                "profile_image": user.profile_image,
                "bio": user.bio,
            },
            "access_token": access_token,
        }

    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": str(e),
            "user": None,
            "access_token": None,
        }


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Get the current user from a JWT token."""
    try:
        secret_key = os.getenv("SECRET_KEY")
        algorithm = os.getenv("ALGORITHM", "HS256")

        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        id: str = payload.get("user_id")

        if id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = get_user_by_id(id, db)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    
def update_user(
    user_id: str,
    username: Optional[str] = None,
    profile_image_file = None, 
    bio: Optional[str] = None,
    db: Session = None
) -> Dict[str, Any]:
    """Update user information."""
    user = get_user_by_id(user_id, db)

    if not user:
        return {"success": False, "message": "User not found"}

    if username:
        user.username = username
    
    if profile_image_file:
        image_result = add_image(
            user_id=user_id,
            image_file=profile_image_file,
            db=db,
            image_type="profile"
        )
        if image_result["success"]:
            user.profile_image = image_result["image_url"]
        else:
            return {
                "success": False,
                "message": f"Failed to upload profile image: {image_result['message']}",
                "user": None
            }
    
    if bio:
        user.bio = bio

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "User updated successfully",
        "user": {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "profile_image": user.profile_image,
            "bio": user.bio,
            "provider": user.provider,
            "created_at": user.created_at,
        }
    }
    
    
def change_password(
    user_id: str,
    old_password: str,
    new_password: str,
    db: Session
) -> Dict[str, Any]:
    """Change user password."""
    user = get_user_by_id(user_id, db)

    if not user:
        return {"success": False, "message": "User not found"}

    if not verify(old_password, user.password_hash):
        return {"success": False, "message": "Old password incorrect"}

    is_valid, error = validate_password(new_password)
    if not is_valid:
        return {"success": False, "message": error}

    user.password_hash = hash_password(new_password)
    db.commit()

    return {"success": True, "message": "Password updated successfully"}

def delete_user(user_id: str, current_user: User, db: Session):

    user = get_user_by_id(user_id, db)

    if not user:
        return {"success": False, "message": "User not found"}

    if current_user.role != "admin" and current_user.id != user.id:
        return {"success": False, "message": "You are not authorized to delete this user"}

    db.query(Likes).filter(Likes.user_id == user.id).delete(synchronize_session=False)
    db.query(Comment).filter(Comment.user_id == user.id).delete(synchronize_session=False)
    db.query(Post).filter(Post.user_id == user.id).delete(synchronize_session=False)

    db.delete(user)
    db.commit()

    return {"success": True, "message": "User deleted successfully"}


# def search_users(query: str, db: Session, limit: int = 10):
#     """Search users by username."""
#     users = db.query(User).filter(
#     User.username.ilike(f"%{query}%")
#     ).limit(limit).all()
#     return [
#         {
#             "id": str(user.id),
#             "username": user.username,
#             "email": user.email,
#             "role": user.role,
#             "profile_image": user.profile_image,
#         }
#         for user in users
# ]
    
def search_users_by_admin(query: str, db: Session, limit: int = 10):
    """Search users by username for admin."""

    users = db.query(User).filter(
    User.username.ilike(f"%{query}%")
    ).limit(limit).all()
    return users

def count_users(db: Session) -> int:
    """Count total number of users."""
    return db.query(User).count()

from fastapi import Request

def track_visit(request: Request, db: Session):
    """Record a site visit and return the total visit count."""
    ip = request.client.host
    
    existing = db.query(SiteVisit).filter(
        SiteVisit.ip_address == ip
    ).first()

    if not existing:
        visit = SiteVisit(
            ip_address=ip,
            user_agent=request.headers.get("user-agent")
        )
        db.add(visit)
        db.commit()

    # return total number of visits recorded so far
    try:
        count = db.query(SiteVisit).count()
    except Exception:
        # in case counting fails, return 0 as a fallback
        count = 0
    return count
    
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),
    api_key=os.getenv("CLOUDINARY_KEY"),
    api_secret=os.getenv("CLOUDINARY_SECRET"),
    # api_proxy="http://proxy.server:3128",
    secure=True
)
print(os.getenv("CLOUDINARY_NAME"))
print(os.getenv("CLOUDINARY_KEY"))
print(os.getenv("CLOUDINARY_SECRET"))

async def add_image(
    user_id: str,
    image_file,
    db: Session,
    image_type: Literal["post", "comment", "profile"],
    post_id: Optional[str] = None,
    comment_id: Optional[str] = None
) -> dict:
    
    print(f"add_image called with: user_id={user_id}, image_type={image_type}, comment_id={comment_id}")  # Debug
    
    user = get_user_by_id(user_id, db)
    if user is None:
        print(f"User not found: {user_id}")  # Debug
        return {"success": False, "message": "User not found", "image_url": None}
    
    if image_type == "post" and not post_id:
        return {"success": False, "message": "post_id required", "image_url": None}
    if image_type == "comment" and not comment_id:
        return {"success": False, "message": "comment_id required", "image_url": None}

    if image_type == "profile":
        folder = f"USERS/{user_id}/profile"
        public_id = "avatar"
    elif image_type == "post":
        folder = f"USERS/{user_id}/posts/{post_id}"
        public_id = "image"
    elif image_type == "comment":
        folder = f"USERS/{user_id}/comments/{comment_id}"
        public_id = "image"
    else:
        return {"success": False, "message": "Invalid image type", "image_url": None}
    
    try:
        print(f"Uploading to Cloudinary: folder={folder}, public_id={public_id}")  # Debug
        result = cloudinary.uploader.upload(
            image_file,
            folder=folder,
            public_id=public_id,
            overwrite=True,
            resource_type="image"
        )
        
        image_url = result.get("secure_url")
        print(f"Cloudinary returned URL: {image_url}")  # Debug
        
        if image_type == "profile":
            user.profile_image = image_url
            db.commit()
        
        return {
            "success": True,
            "image_url": image_url,
            "message": f"{image_type} image uploaded"
        }
        
    except Exception as e:
        print(f"Cloudinary upload error: {str(e)}")  # Debug
        return {"success": False, "message": str(e), "image_url": None}