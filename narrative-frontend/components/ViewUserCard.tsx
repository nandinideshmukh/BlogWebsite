"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Shield,
  X,
  AlertCircle
} from "lucide-react";

import { UserResponse } from "../app/types/interface";

interface ViewUserCardProps {
  user: UserResponse;
  onClose: () => void;
}

export default function ViewUserCard({ user, onClose }: ViewUserCardProps) {
  const [imageError, setImageError] = useState(false);
  const [renderError, setRenderError] = useState(false);

  // Log the user data when component receives it
  useEffect(() => {
    // console.log("ViewUserCard received user:", user);
    
    // Check if user has required fields
    if (!user || !user.id || !user.username) {
    //   console.error("Invalid user data:", user);
      setRenderError(true);
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const getRoleColor = (role?: string | null) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "author":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // If there's a render error, show error state
  if (renderError) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        >
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600 mb-6">The user data could not be displayed.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header with Gradient */}
        <div className="h-28 bg-gradient-to-r from-blue-600 to-purple-600" />

        {/* Avatar */}
        <div className="-mt-14 flex justify-center">
          <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-200">
            {user.profile_image && !imageError ? (
              <Image
                src={user.profile_image}
                alt={user.username || "User"}
                width={112}
                height={112}
                onError={() => setImageError(true)}
                className="object-cover w-full h-full"
                unoptimized // Add this if images are from external URLs
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-600 to-purple-600">
                <User className="text-white" size={40} />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-6">
          {/* Name and Role */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{user.username || "Unknown User"}</h2>
            <span
              className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${getRoleColor(
                user.role
              )}`}
            >
              {user.role ?? "User"}
            </span>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-600 italic leading-relaxed">
                "{user.bio}"
              </p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-800">{user.email || "No email provided"}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-800">
                  {user.created_at ? formatDate(user.created_at) : "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats - You might want to fetch these from your API */}
          {/* <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-xl font-bold text-blue-600">0</p>
              <p className="text-xs text-gray-600">Posts</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-xl font-bold text-purple-600">0</p>
              <p className="text-xs text-gray-600">Comments</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
              <p className="text-xl font-bold text-pink-600">0</p>
              <p className="text-xs text-gray-600">Likes</p>
            </div>
          </div> */}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}