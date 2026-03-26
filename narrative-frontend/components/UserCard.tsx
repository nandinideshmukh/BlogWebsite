"use client";

import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Lock,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { UserResponse } from "../app/types/interface";
import UpdatePassword from "./ChangePassword";
import DeleteAccount from "./DeleteAccount";
import EditProfile from "./EditProfile";

interface UserCardProps {
  user: UserResponse;
  onClose: () => void;
  onEdit?: () => void;
  onUserUpdate?: (updatedUser: UserResponse) => void;
}

export default function UserCard({
  user,
  onClose,
  onEdit,
  onUserUpdate,
}: UserCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // Update local state when prop changes
  useEffect(() => {
    console.log("User prop updated in UserCard:", user);
    setCurrentUser(user);
  }, [user]);

  const handleEditSuccess = (updatedUser: UserResponse) => {
    console.log("Edit success in UserCard - received:", updatedUser);
    
    // Update local state
    setCurrentUser(updatedUser);
    
    // Notify parent
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
    
    // Close edit modal
    setShowEditModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
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

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="h-28 bg-gradient-to-r from-blue-600 to-purple-600" />

          {/* Avatar */}
          <div className="-mt-14 flex justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-200">
              {currentUser?.profile_image && !imageError ? (
                <Image
                  key={currentUser.profile_image} // Add key to force re-render on image change
                  src={currentUser.profile_image}
                  alt={currentUser.username}
                  width={112}
                  height={112}
                  onError={() => setImageError(true)}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-600 to-purple-600">
                  <User className="text-white" size={40} />
                </div>
              )}
            </div>
          </div>

          {/* Info - Use currentUser directly with conditional rendering */}
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold">{currentUser?.username}</h2>

            <span
              className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${getRoleColor(
                currentUser?.role
              )}`}
            >
              {currentUser?.role ?? "User"}
            </span>

            {currentUser?.bio && (
              <p className="mt-4 text-sm text-gray-600 italic">
                "{currentUser.bio}"
              </p>
            )}

            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Mail size={14} />
                <span>{currentUser?.email}</span>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Calendar size={14} />
                <span>{currentUser?.created_at ? formatDate(currentUser.created_at) : ""}</span>
              </div>

              {currentUser?.role === "admin" && (
                <div className="flex items-center justify-center space-x-2">
                  <Shield size={14} />
                  <span className="font-mono text-xs">{currentUser?.id}</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Edit size={16} className="mr-2" />
                Edit Profile
              </button>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Lock size={16} className="mr-2" />
                Change Password
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfile
          user={currentUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Password Modal */}
      <UpdatePassword
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
        }}
      />

      {/* Delete Account Modal */}
      <DeleteAccount
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}