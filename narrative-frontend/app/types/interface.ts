// Base types matching SQLAlchemy/Pydantic models
export interface UserBase {
  username: string;
  email: string;
  role?: string;
  profile_image?: string | null;
  bio?: string | null;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserResponse {
  id: string; // UUID comes as string in JSON
  username: string;
  email: string;
  role: string;
  bio?: string | null;
  profile_image?: string | null;
  provider: string;
  created_at: string; // ISO datetime string
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserResponse | null;
  access_token?: string | null;
}

export interface PostBase {
  title?: string | null;
  content: string;
  image_url?: string | null;
}

export interface PostCreateRequest extends PostBase {}

export interface PostResponse extends PostBase {
  id: string;
  user_id: string;
  created_at: string;
  user: UserResponse;
  comments?: CommentResponse[]; // For future use
}

export interface CommentBase {
  content: string;
  image_url?: string | null;
}

export interface CommentCreate extends CommentBase {}

export interface CommentResponse extends CommentBase {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  image_url?: string | null;
  content: string;
  user: UserResponse;
}

export interface UserUpdate {
  username?: string | null;
  profile_image?: string | null;
  bio?: string | null;
}

export interface PasswordChange {
  old_password: string;
  new_password: string;
}

export interface UserSearchResponse {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LikeRequest {
  user_id: string;
  post_id?: string | null;
  comment_id?: string | null;
}

export interface LikeResponse extends LikeRequest {
  id?: string | null;
  success: boolean;
  message: string;
  total_likes?: number | null;
}

// API Response wrapper (if you use one)
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

// Pagination types (if your API uses pagination)
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form data types for file uploads
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  bio?: string;
  role?: string;
  profile_image?: File | null;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

export function isApiError(response: any): response is ApiError {
  return response && typeof response.detail === 'string';
}

export function isAuthResponse(response: any): response is AuthResponse {
  return response && typeof response.success === 'boolean';
}