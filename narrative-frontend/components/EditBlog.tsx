"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { updatePost } from "@/lib/blog";
import { PostResponse } from "@/app/types/interface";
import {
  Edit,
  X,
  Image as ImageIcon,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle,
  Bold,
  Italic,
  List,
  Link2,
  Eye
} from "lucide-react";

type Props = {
  post: PostResponse;
  onUpdated?: (post: PostResponse) => void;
  variant?: "button" | "icon" | "menu";
};

export default function EditPostModal({
  post,
  onUpdated,
  variant = "button"
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title || "");
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState<File | null>(null);
  const resolveImageUrl = (url?: string | null): string | null => {
    if (!url || url === "string" || url === "null" || url === "") return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:8000/${url}`;
  };
  const [imagePreview, setImagePreview] = useState<string | null>(resolveImageUrl(post.image_url));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [titleCount, setTitleCount] = useState(post.title?.length || 0);
  const [contentCount, setContentCount] = useState(post.content.length);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 5000;

  // Reset form when modal opens with fresh post data
  useEffect(() => {
    if (open) {
      setTitle(post.title || "");
      setContent(post.content);
      setImagePreview(resolveImageUrl(post.image_url));
      setTitleCount(post.title?.length || 0);
      setContentCount(post.content.length);
      setImage(null);
      setError("");
      setSuccess("");
    }
  }, [open, post]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setTitleCount(value.length);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setContentCount(value.length);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    if (title.length > MAX_TITLE_LENGTH) {
      setError(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Content must be less than ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updated = await updatePost(post.id, {
        title,
        content,
        image: image || undefined,
      });

      setSuccess("Post updated successfully!");

      if (onUpdated) onUpdated(updated);

      // Close after showing success
      setTimeout(() => {
        setOpen(false);
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  // Button variants
  if (variant === "icon") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 group"
          title="Edit post"
        >
          <Edit className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Modal */}
        {open && (
          <EditPostModalContent
            ref={modalRef}
            title={title}
            content={content}
            imagePreview={imagePreview}
            titleCount={titleCount}
            contentCount={contentCount}
            loading={loading}
            error={error}
            success={success}
            MAX_TITLE_LENGTH={MAX_TITLE_LENGTH}
            MAX_CONTENT_LENGTH={MAX_CONTENT_LENGTH}
            onTitleChange={handleTitleChange}
            onContentChange={handleContentChange}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
            onFileInputRef={fileInputRef }
            onClose={() => setOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </>
    );
  }

  if (variant === "menu") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Post</span>
        </button>

        {/* Modal */}
        {open && (
          <EditPostModalContent
            ref={modalRef}
            title={title}
            content={content}
            imagePreview={imagePreview}
            titleCount={titleCount}
            contentCount={contentCount}
            loading={loading}
            error={error}
            success={success}
            MAX_TITLE_LENGTH={MAX_TITLE_LENGTH}
            MAX_CONTENT_LENGTH={MAX_CONTENT_LENGTH}
            onTitleChange={handleTitleChange}
            onContentChange={handleContentChange}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
            onFileInputRef={fileInputRef}
            onClose={() => setOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-200 group"
      >
        <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
        Edit Post
      </button>

      {/* Modal */}
      {open && (
        <EditPostModalContent
          ref={modalRef}
          title={title}
          content={content}
          imagePreview={imagePreview}
          titleCount={titleCount}
          contentCount={contentCount}
          loading={loading}
          error={error}
          success={success}
          MAX_TITLE_LENGTH={MAX_TITLE_LENGTH}
          MAX_CONTENT_LENGTH={MAX_CONTENT_LENGTH}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onImageChange={handleImageChange}
          onRemoveImage={removeImage}
          onFileInputRef={fileInputRef}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

// Separate Modal Content Component for reusability
import { forwardRef } from "react";

const EditPostModalContent = forwardRef<HTMLDivElement, {
  title: string;
  content: string;
  imagePreview: string | null;
  titleCount: number;
  contentCount: number;
  loading: boolean;
  error: string;
  success: string;
  MAX_TITLE_LENGTH: number;
  MAX_CONTENT_LENGTH: number;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onFileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSubmit: () => void;
}>((props, ref) => {
  const {
    title,
    content,
    imagePreview,
    titleCount,
    contentCount,
    loading,
    error,
    success,
    MAX_TITLE_LENGTH,
    MAX_CONTENT_LENGTH,
    onTitleChange,
    onContentChange,
    onImageChange,
    onRemoveImage,
    onFileInputRef,
    onClose,
    onSubmit,
  } = props;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        ref={ref}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Edit Post</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                  <p className="text-xs text-green-500 mt-1">Closing editor...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !success && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={onTitleChange}
                placeholder="Enter post title"
                disabled={loading || !!success}
                maxLength={MAX_TITLE_LENGTH}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {titleCount}/{MAX_TITLE_LENGTH}
              </div>
            </div>
          </div>

          {/* Content Input with Toolbar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="List"
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Link"
                >
                  <Link2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={content}
                onChange={onContentChange}
                rows={8}
                placeholder="Write your post content..."
                disabled={loading || !!success}
                maxLength={MAX_CONTENT_LENGTH}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {contentCount}/{MAX_CONTENT_LENGTH}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <div className="relative h-48 w-full rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => onFileInputRef.current?.click()}
                  className="cursor-pointer text-center py-8"
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload a new image
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
              <input
                ref={onFileInputRef}
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
                disabled={loading || !!success}
              />
            </div>
          </div>

          {/* Preview Toggle (Optional) */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <button
              type="button"
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Changes
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading || !!success}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !!success}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium flex items-center space-x-2 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4 animate-bounce" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

EditPostModalContent.displayName = "EditPostModalContent";