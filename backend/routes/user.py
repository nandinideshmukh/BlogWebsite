from fastapi.security import OAuth2PasswordRequestForm
import os
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import UploadFile,Form,File
from models.blog_model import User
from fastapi import Request
from services.user import (
    count_users,
    login_by_google,
    login_user,
    check_user_exists,
    create_user,
    get_current_user,
    get_user_by_id,
    update_user,
    change_password,
    delete_user,
    search_users,
    search_users_by_admin,
    track_visit
)
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from db.create_db import get_db
from schemas.blog_schemas import (
    GoogleLoginRequest,
    UserCreate,
    UserSearchResponse,
    UserUpdate,
    PasswordChange,
    AuthResponse,
    UserResponse
)

router = APIRouter(prefix="/users", tags=["users"])


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


@router.post("/login/google", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login_google(
    body: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    try:
        idinfo = id_token.verify_oauth2_token(
            body.token,
            requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )

        email = idinfo["email"]
        username = idinfo.get("name")

        result = login_by_google(
            {"email": email, "username": username},
            db
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return AuthResponse(
            success=True,
            message="User logged in successfully via Google.",
            user=UserResponse.model_validate(result["user"]),
            access_token=result["access_token"],
        )

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    
@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login a user with email and password."""
    if not form_data.username or not form_data.password:
        raise HTTPException(
            status_code=400, detail="Email and password are required."
        )

    result = login_user(form_data.username, form_data.password, db)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return AuthResponse(
        success=True,
        message="User logged in successfully.",
        user=UserResponse.model_validate(result["user"]),
        access_token=result["access_token"],
    )
    

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    bio: Optional[str] = Form(None),
    role: str = Form("user"),
    db: Session = Depends(get_db),
    profile_image: Optional[UploadFile] = File(None),
):
    """Register a new user with optional profile image."""
    # Check if user exists
    existing_user = check_user_exists(email, db)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Handle profile image if provided
    profile_image_file = None
    if profile_image and profile_image.filename:
        profile_image_file = profile_image.file
    
    # Create user with optional profile image
    result = create_user(
        username=username,
        email=email,
        password=password,
        bio=bio,
        role=role,
        profile_image_file=profile_image_file,
        db=db
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return AuthResponse(
        success=True,
        message="User registered successfully.",
        user=UserResponse.model_validate(result["user"]),
        access_token=result["access_token"],
    )


@router.patch("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def update_user_route(
    username: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user information with optional profile image."""
    
    # Handle profile image if provided
    profile_image_file = None
    if profile_image and profile_image.filename:
        profile_image_file = profile_image.file
    
    # Update user with optional profile image
    result = update_user(
        user_id=str(current_user.id),
        username=username,
        profile_image_file=profile_image_file,
        bio=bio,
        db=db
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return UserResponse.model_validate(result["user"])

    
@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the currently authenticated user's information."""
    try:
        # Convert UUID to string for the function
        user_id = str(current_user.id)
        
        # Fetch the latest user data from database
        user = get_user_by_id(user_id, db)
        
        if not user:
            # This should rarely happen since current_user came from the DB
            raise HTTPException(
                status_code=404, 
                detail="User not found in database"
            )
        
        # Convert SQLAlchemy model to Pydantic model
        return UserResponse.model_validate(user)
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error in get_current_user_info: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving user information: {str(e)}"
        )
        
        


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_user_password(
    body: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change the current user's password.
    
    - **old_password**: Current password
    - **new_password**: New password (min 8 chars, must contain letters and numbers)
    """
    result = change_password(
        user_id=str(current_user.id),
        old_password=body.old_password,
        new_password=body.new_password,
        db=db
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return {
        "success": True,
        "message": "Password changed successfully. Please use your new password on next login."
    }


@router.delete("/me", status_code=status.HTTP_200_OK)
async def delete_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete the current user's account.
    
    This action is irreversible. All user data, posts, and comments will be permanently deleted.
    """
    result = delete_user(str(current_user.id), db)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return {
        "success": True,
        "message": "Your account has been permanently deleted. We're sorry to see you go!"
    }


@router.get("/search", response_model=list[UserSearchResponse], status_code=status.HTTP_200_OK)
async def search_users_route(
    query: str = Query(...,  description="Search query for username"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), 
):
    """Search for users by username (authentication required)."""
    results = search_users(query, db)
    return [UserSearchResponse.model_validate(user) for user in results]

@router.get("/admin", response_model=list[UserResponse], status_code=status.HTTP_200_OK)
async def get_users_by_role_admin(
    query:str = (Query(...,description="Search query for username ")),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), 
):
    """Get all users (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view all users")
    
    results = search_users_by_admin(query, db)
    return [UserResponse.model_validate(user) for user in results]

@router.get("/admin/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user_by_id_admin(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), 
):
    """Get user by ID (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view user details")
    
    user = get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse.model_validate(user)

@router.get("/count", response_model=int, status_code=status.HTTP_200_OK)
async def get_user_count(db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    """Get the total number of users."""
    return count_users(db)

@router.get("/usercount", status_code=status.HTTP_200_OK)
def home(request: Request, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    # record visit and obtain total visit count
    visit_count = track_visit(request, db)
    return {"visit_count": visit_count}

# all routes listed to use in frontend
# POST /users/login/google
# POST /users/login
# POST /users/register
# GET /users/me
# PATCH /users/me
# POST /users/change-password
# DELETE /users/me
# GET /users/search?query=someusername
