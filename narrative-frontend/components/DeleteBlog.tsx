"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { deletePost } from "@/lib/blog";

type Props = {
  postId: string;
  postTitle?: string;
  onDeleted?: () => void;
  variant?: "icon" | "button" | "menu";
};

export default function DeletePostButton({ 
  postId, 
  postTitle = "this post", 
  onDeleted,
  variant = "button" 
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteClick = () => {
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await deletePost(postId);
      setShowModal(false);
      if (onDeleted) onDeleted();
    } catch (err: any) {
      setError(err.message || "Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  // Different button variants
  if (variant === "icon") {
    return (
      <>
        <button
          onClick={handleDeleteClick}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 group"
          title="Delete post"
        >
          <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        {/* Confirmation Modal */}
        {showModal && (
          <DeleteConfirmationModal
            postTitle={postTitle}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowModal(false)}
            loading={loading}
            error={error}
          />
        )}
      </>
    );
  }

  if (variant === "menu") {
    return (
      <>
        <button
          onClick={handleDeleteClick}
          className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Post</span>
        </button>
        
        {/* Confirmation Modal */}
        {showModal && (
          <DeleteConfirmationModal
            postTitle={postTitle}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowModal(false)}
            loading={loading}
            error={error}
          />
        )}
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        onClick={handleDeleteClick}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-200 group"
      >
        <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
        Delete Post
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <DeleteConfirmationModal
          postTitle={postTitle}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowModal(false)}
          loading={loading}
          error={error}
        />
      )}
    </>
  );
}

// Separate Modal Component for better organization
function DeleteConfirmationModal({ 
  postTitle, 
  onConfirm, 
  onCancel, 
  loading, 
  error 
}: { 
  postTitle: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
  loading: boolean; 
  error: string; 
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Delete Post</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{postTitle}"</span>?
              </p>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                This action cannot be undone. The post will be permanently deleted.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium flex items-center space-x-2 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}