"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles,
  Camera,
  X,
  Info,
  AlertCircle
} from "lucide-react";
import Navbar from "../../components/NavBar";

interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    bio?: string | null;
    profile_image?: string | null;
    provider: string;
    created_at: string;
  } | null;
  access_token?: string | null;
}

interface ErrorResponse {
  detail: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    role: "user",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "password") {
      checkPasswordStrength(value);
    }
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      score: password.length,
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors(prev => ({
          ...prev,
          profile_image: "Image size should be less than 5MB"
        }));
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setFieldErrors(prev => ({
          ...prev,
          profile_image: "Please upload an image file"
        }));
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous image errors
      if (fieldErrors.profile_image) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.profile_image;
          return newErrors;
        });
      }
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});
    setSuccessMessage("");

    try {
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", formData.role);
      
      if (formData.bio) {
        formDataToSend.append("bio", formData.bio);
      }
      
      if (profileImage) {
        formDataToSend.append("profile_image", profileImage);
      }

      const response = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        body: formDataToSend,
      });

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        // response might be empty or not JSON
        data = {};
      }

      if (response.ok && data.success) {
        // Success case
        setSuccessMessage(data.message || "User registered successfully!");
        
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        console.log("Registration successful:", {
          message: data.message,
          user: data.user,
        });

        setTimeout(() => {
          router.push("/main_page");
          router.refresh();
        }, 1500);
      } else {
        // Error case - handle FastAPI style errors
        const statusCode = response.status;
        const detail = data?.detail;

        const handleValidationArray = (arr: any[]) => {
          const fieldErrorMap: {[key: string]: string} = {};
          arr.forEach((err: any) => {
            if (err.loc && err.loc.length > 0) {
              // use last element of location array (could be ['body','username'] or ['body','form','email'])
              const field = err.loc[err.loc.length - 1];
              fieldErrorMap[field] = err.msg;
            }
          });
          setFieldErrors(fieldErrorMap);
          setError("Please check the form for errors");
        };

        if (statusCode === 400 || statusCode === 422) {
          if (detail === "Email already registered.") {
            setFieldErrors({
              email: "This email is already registered. Please use a different email or try logging in."
            });
            setError("Registration failed: Email already exists");
          }
          if( detail === "Error creating user: Username must be of 3 or more characters."){
            setFieldErrors({
              username: "Registration failed: Email already exists.  Username must be of 3 or more characters.."
            });
            setError(" Username must be of 3 or more characters.");
          }
          
          else if (typeof detail === 'string') {
            setError(detail);
          } else if (Array.isArray(detail)) {
            handleValidationArray(detail);
          } else {
            setError("Registration failed. Please try again.");
          }
        } else {
          // fallback for other statuses
          if (typeof detail === 'string') {
            setError(detail);
          } else if (Array.isArray(detail)) {
            handleValidationArray(detail);
          } else {
            setError("Registration failed. Please try again.");
          }
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    const { hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar } = passwordStrength;
    const strengthCount = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
    
    if (strengthCount <= 2) return "bg-red-500";
    if (strengthCount <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const { hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar } = passwordStrength;
    const strengthCount = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
    
    if (strengthCount <= 2) return "Weak";
    if (strengthCount <= 4) return "Medium";
    return "Strong";
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Join Our Community
              </span>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create Your Account
              </span>
            </h1>
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-purple-600 font-semibold transition-colors duration-300"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                <p className="text-green-600 text-sm font-medium flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {successMessage}
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Redirecting to homepage...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && !successMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className={`w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-1 ${imagePreview ? '' : 'flex items-center justify-center'}`}>
                    {imagePreview ? (
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Profile preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    id="profile-image"
                    disabled={isLoading || !!successMessage}
                  />
                  <label
                    htmlFor="profile-image"
                    className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center space-x-2 text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{imagePreview ? 'Change Photo' : 'Upload Photo'}</span>
                  </label>
                </div>
                {fieldErrors.profile_image && (
                  <p className="text-red-500 text-xs mt-2">{fieldErrors.profile_image}</p>
                )}
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                    placeholder="Choose a username"
                    disabled={isLoading || !!successMessage}
                  />
                </div>
                {fieldErrors.username && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                    placeholder="Enter your email"
                    disabled={isLoading || !!successMessage}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                    placeholder="Create a password"
                    disabled={isLoading || !!successMessage}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                )}

                {/* Password Strength Indicator */}
                {formData.password && !fieldErrors.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Password strength:</span>
                      <span className="text-xs font-medium" style={{ color: getPasswordStrengthColor().replace('bg-', 'text-') }}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 30) * 100}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                      <div className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-1">{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                        Min 8 characters
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-1">{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                        Uppercase
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-1">{passwordStrength.hasLowerCase ? '✓' : '○'}</span>
                        Lowercase
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-1">{passwordStrength.hasNumber ? '✓' : '○'}</span>
                        Number
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-1">{passwordStrength.hasSpecialChar ? '✓' : '○'}</span>
                        Special char
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio Field */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <Info className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us a little about yourself (optional)"
                    disabled={isLoading || !!successMessage}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  I want to
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  disabled={isLoading || !!successMessage}
                >
                  <option value="user">Read and write blogs</option>
                  <option value="author">Write and publish blogs</option>
                </select>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  disabled={isLoading || !!successMessage}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-300">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-300">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-200 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </>
                ) : successMessage ? (
                  <>
                    <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Success! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Login link for existing users */}
            {fieldErrors.email?.includes("already registered") && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold underline hover:text-blue-800 transition-colors">
                    Log in here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}