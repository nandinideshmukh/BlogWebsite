"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  PenSquare,
  X,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Hash,
  Bold,
  Italic,
  List,
  Link2
} from "lucide-react";
import { createBlogPost, CreatePostPayload } from "@/lib/blog";

export default function CreateBlogCard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [titleCount, setTitleCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);

  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 5000;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "title") setTitleCount(value.length);
    if (name === "content") setContentCount(value.length);

    if (error) setError("");
    if (success) setSuccess("");
  };

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

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };




  // In CreateBlogCard.tsx, update the success handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload: CreatePostPayload = {
        title: formData.title,
        content: formData.content,
        image: selectedImage,
      };

      const result = await createBlogPost(payload);
      console.log("Blog post created:", result);

      setSuccess("Blog post published successfully!");

      // Get current user from localStorage
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      // Reset form
      setTimeout(() => {
        setFormData({ title: "", content: "" });
        setSelectedImage(null);
        setImagePreview(null);
        setTitleCount(0);
        setContentCount(0);
        setSuccess("");

        // Redirect to user's profile page
        if (user?.id) {
          router.push(`/profile/${user.id}`);
        } else {
          router.push("/main_page");
        }
        router.refresh();
      }, 2000);

    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center space-x-2">
            <PenSquare className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Create New Story</h2>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Share your thoughts and ideas with the world
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-green-700 text-sm font-medium">{success}</p>
                <div className="flex items-center mt-2">
                  <div className="w-32 h-1.5 bg-green-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full animate-progress"></div>
                  </div>
                  <span className="text-xs text-green-600 ml-2">Redirecting...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading || !!success}
                placeholder="Enter an engaging title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                maxLength={MAX_TITLE_LENGTH}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {titleCount}/{MAX_TITLE_LENGTH}
              </div>
            </div>
          </div>

          {/* Content Input with Toolbar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
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
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                disabled={loading || !!success}
                rows={12}
                placeholder="Write your story..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
                maxLength={MAX_CONTENT_LENGTH}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {contentCount}/{MAX_CONTENT_LENGTH}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <div className="relative h-48 w-full rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer text-center"
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload a cover image
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading || !!success}
              />
            </div>
          </div>

          {/* Tags Input (Optional) */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="tags"
                placeholder="e.g. technology, lifestyle, coding"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading || !!success}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading || !!success}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5 animate-bounce" />
                  <span>Published!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Publish Story</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading || !!success}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              Tips for great stories
            </h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Choose an engaging title that captures attention</li>
              <li>Add a cover image to make your story visually appealing</li>
              <li>Use tags to help readers discover your content</li>
              <li>Break up long text with paragraphs and formatting</li>
            </ul>
          </div>
        </form>
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
        
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-progress {
          animation: progress 2s linear forwards;
        }
      `}</style>
    </div>
  );
}