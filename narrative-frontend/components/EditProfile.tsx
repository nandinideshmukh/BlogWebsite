"use client";

import { useState } from "react";
import Image from "next/image";
import { updateCurrentUser } from "@/lib/api";
import { UserResponse } from "../app/types/interface";
import { CheckCircle, AlertCircle } from "lucide-react";

interface EditProfileProps {
  user: UserResponse;
  onClose: () => void;
  onSuccess: (updatedUser: UserResponse) => void;
}

export default function EditProfile({
  user,
  onClose,
  onSuccess,
}: EditProfileProps) {
  const [newUsername, setNewUsername] = useState(user.username);
  const [newBio, setNewBio] = useState(user.bio || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user.profile_image || null
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }

    setSelectedFile(file);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // In EditProfile.tsx, make sure the handleUpdate function is correct
  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      console.log("Updating with:", { username: newUsername, bio: newBio, file: selectedFile });

      const updatedUser = await updateCurrentUser({
        username: newUsername,
        bio: newBio,
        profile_image: selectedFile,
      });

      console.log("API Response:", updatedUser);

      setSuccessMessage("Profile updated successfully!");

      // Call onSuccess immediately with the updated user
      onSuccess(updatedUser);

      // Close after showing success message
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error("Update error:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Edit Profile
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-green-700 text-sm font-medium">{successMessage}</p>
                <p className="text-xs text-green-500 mt-1">Closing dialog...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !successMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-1">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full rounded-full"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 mt-1">Max file size: 5MB</p>
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            disabled={loading || !!successMessage}
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            rows={4}
            disabled={loading || !!successMessage}
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleUpdate}
            disabled={loading || !!successMessage}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Updating...</span>
              </>
            ) : successMessage ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 animate-bounce" />
                <span>Success!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>

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
    </div>
  );
}