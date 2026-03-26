"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostById } from "@/lib/blog";
import { PostResponse, CommentResponse } from "@/app/types/interface";
import EditPostModal from "@/components/EditBlog";
import DeletePostButton from "@/components/DeleteBlog";
import { createReply, deleteComment, getCommentReplies } from "@/lib/comments";
import { createComment } from "@/lib/comments";
import {
  User,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  ArrowLeft,
  Award,
  Bookmark,
  Calendar,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Reply,
  Trash2,
  Maximize2,
  X,
} from "lucide-react";


function nestComments(comments: CommentResponse[]): CommentResponse[] {
  const map: Record<string, CommentResponse & { replies: CommentResponse[] }> = {};
  const roots: CommentResponse[] = [];

  comments.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  comments.forEach((c) => {
    if (c.parent_comment_id && map[c.parent_comment_id]) {
      map[c.parent_comment_id].replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
}

const ImageModal = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <img
          src={imageUrl}
          alt="Full size"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

const CommentItem = ({
  comment,
  level = 0,
  currentUserId,
  onDelete,
  onAddReply,
  loadedReplies,
  isLoadingReplies,
  onLoadReplies,
}: {
  comment: CommentResponse;
  level?: number;
  currentUserId: string | null;
  onDelete: (commentId: string) => void;
  onAddReply: (parentId: string, newReply: CommentResponse) => void;
  loadedReplies: CommentResponse[] | null;
  isLoadingReplies: boolean;
  onLoadReplies?: (commentId: string) => void;
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const indentLevel = Math.min(level, 3);

  const displayReplies = loadedReplies !== null ? loadedReplies : (comment.replies || []);
  const replyCount = displayReplies.length;

  const handleImageClick = (imageUrl: string) => {
    const fullImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `http://localhost:8000/${imageUrl}`;
    setSelectedImage(fullImageUrl);
    setShowImageModal(true);
  };

  const handleToggleReplies = () => {
    const next = !showReplies;
    setShowReplies(next);
    if (next && onLoadReplies && loadedReplies === null && replyCount > 0) {
      onLoadReplies(comment.id);
    }
  };

  const handleReplySubmit = async (parentCommentId: string) => {
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      const newReply = await createReply(parentCommentId, replyText, replyImage || undefined);
      onAddReply(parentCommentId, newReply);
      setReplyingTo(null);
      setReplyText("");
      setReplyImage(null);
    } catch (error) {
      console.error("Reply failed:", error);
      alert("Failed to post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <>
      <div className={`relative ${indentLevel > 0 ? "ml-8 mt-3" : "mt-4"}`}>
        {indentLevel > 0 && (
          <div className="absolute left-[-24px] top-0 bottom-0 w-px bg-gradient-to-b from-purple-200 to-transparent" />
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-3">
            <Link href={`/profile/${comment.user_id}`} className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden ring-2 ring-purple-100">
                {comment.user?.profile_image ? (
                  <Image
                    src={
                      comment.user.profile_image.startsWith("http")
                        ? comment.user.profile_image
                        : `http://localhost:8000/${comment.user.profile_image}`
                    }
                    alt={comment.user.username}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Link
                  href={`/profile/${comment.user_id}`}
                  className="font-semibold text-gray-800 hover:text-purple-600 transition-colors text-sm"
                >
                  {comment.user?.username || "User"}
                </Link>
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap break-words">
                {comment.content}
              </p>

              {comment.image_url &&
                comment.image_url !== "string" &&
                comment.image_url !== "" && (
                  <div
                    className="mt-2 cursor-pointer relative group inline-block"
                    onClick={() => handleImageClick(comment.image_url!)}
                  >
                    <Image
                      src={
                        comment.image_url.startsWith("http")
                          ? comment.image_url
                          : `http://localhost:8000/${comment.image_url}`
                      }
                      alt="Comment Image"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

              <div className="flex items-center space-x-4 mt-2">
                <button className="text-xs text-gray-400 hover:text-pink-500 transition-colors">
                  Like
                </button>
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-xs text-gray-400 hover:text-purple-600 transition-colors flex items-center space-x-1"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
                {currentUserId === comment.user_id && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    autoFocus
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && setReplyImage(e.target.files[0])}
                    className="mt-2 text-xs text-gray-500"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReplySubmit(comment.id)}
                      disabled={!replyText.trim() || submittingReply}
                      className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center space-x-1"
                    >
                      {submittingReply ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Post Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Show replies toggle */}
          {replyCount > 0 && (
            <div className="mt-3">
              <button
                onClick={handleToggleReplies}
                className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700 transition-colors mb-2"
              >
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>
                  {showReplies ? "Hide" : "Show"} {replyCount}{" "}
                  {replyCount === 1 ? "reply" : "replies"}
                </span>
              </button>

              {showReplies && (
                <div className="space-y-3">
                  {isLoadingReplies && displayReplies.length === 0 ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    </div>
                  ) : (
                    displayReplies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        level={level + 1}
                        currentUserId={currentUserId}
                        onDelete={onDelete}
                        onAddReply={onAddReply}
                        loadedReplies={null}
                        isLoadingReplies={false}
                        onLoadReplies={onLoadReplies}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showImageModal && selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => {
            setShowImageModal(false);
            setSelectedImage(null);
          }}
        />
      )}
    </>
  );
};

// Main Post Page Component
export default function PostPage() {
  const { postId } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<PostResponse | null>(null);
  // ✅ nestedComments holds only top-level comments with replies nested inside them
  const [nestedComments, setNestedComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [repliesMap, setRepliesMap] = useState<Record<string, CommentResponse[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUserId(parsedUser.id);
    }
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostById(postId as string);
        setPost(data.post);
        setLikeCount(data.post.likes_count || 0);

        // ✅ KEY FIX: nest flat comments into a tree before rendering
        if (data.post.comments) {
          setNestedComments(nestComments(data.post.comments));
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
        setError("Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) fetchPost();
  }, [postId]);

  const handleLoadReplies = async (commentId: string) => {
    if (repliesMap[commentId] || loadingReplies[commentId]) return;
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    try {
      const replies = await getCommentReplies(commentId);
      setRepliesMap((prev) => ({ ...prev, [commentId]: replies }));
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  function countAllComments(comments: CommentResponse[]): number {
    return comments.reduce((total, c) => {
      return total + 1 + countAllComments(c.replies || []);
    }, 0);
  }


  const handleAddReply = (parentId: string, newReply: CommentResponse) => {
    if (repliesMap[parentId]) {
      setRepliesMap((prev) => ({
        ...prev,
        [parentId]: [...prev[parentId], newReply],
      }));
      return;
    }

    const insertReply = (comments: CommentResponse[]): CommentResponse[] =>
      comments.map((c) => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        if (c.replies?.length) {
          return { ...c, replies: insertReply(c.replies) };
        }
        return c;
      });

    setNestedComments((prev) => insertReply(prev));
  };

  const removeFromTree = (comments: CommentResponse[], id: string): CommentResponse[] =>
    comments
      .filter((c) => c.id !== id)
      .map((c) => ({ ...c, replies: removeFromTree(c.replies || [], id) }));

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment(commentToDelete);
      setNestedComments((prev) => removeFromTree(prev, commentToDelete));
      setRepliesMap((prev) => {
        const next = { ...prev };
        delete next[commentToDelete];
        return next;
      });
      setDeleteMessage(null);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete comment");
    }
  };

  const handleImageClick = (imageUrl: string) => {
    const fullImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `http://localhost:8000/${imageUrl}`;
    setSelectedImage(fullImageUrl);
    setShowImageModal(true);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleSave = () => setSaved(!saved);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.content.substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !postId) return;

    try {
      setSubmittingComment(true);
      const newComment = await createComment(
        postId as string,
        { content: commentText },
        commentImage || undefined
      );
      // New top-level comment — prepend to list with empty replies
      setNestedComments((prev) => [{ ...newComment, replies: [] }, ...prev]);
      setCommentText("");
      setCommentImage(null);
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 animate-pulse">Loading your story...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Post not found"}</p>
          <button
            onClick={() => router.push("/main_page")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center mb-6 text-gray-600 hover:text-purple-600 transition-all group"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="ml-2 font-medium">Back to Feed</span>
          </button>

          <article className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {post.image_url && (
              <div
                className="relative w-full h-[400px] cursor-pointer group"
                onClick={() => handleImageClick(post.image_url!)}
              >
                <Image
                  src={
                    post.image_url.startsWith("http")
                      ? post.image_url
                      : `http://localhost:8000/${post.image_url}`
                  }
                  alt={post.title || "Post Image"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-12 h-12 text-white" />
                </div>
              </div>
            )}

            <div className="p-8 md:p-10">
              <div className="flex items-start justify-between mb-8">
                <Link href={`/profile/${post.user_id}`} className="flex items-center space-x-4 group">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden ring-4 ring-purple-100">
                      {post.user?.profile_image ? (
                        <Image
                          src={
                            post.user.profile_image.startsWith("http")
                              ? post.user.profile_image
                              : `http://localhost:8000/${post.user.profile_image}`
                          }
                          alt={post.user.username}
                          width={56}
                          height={56}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-white" />
                      )}
                    </div>
                    {post.user?.role === "author" && (
                      <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors text-lg">
                      {post.user?.username || "Unknown User"}
                    </p>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatReadingTime(post.content)}
                      </span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleSave}
                  className={`p-2 rounded-full transition-all ${saved
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                >
                  <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
                </button>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-10 whitespace-pre-line">
                {post.content}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 transition-all group ${liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                      }`}
                  >
                    <Heart
                      className={`w-6 h-6 group-hover:scale-110 transition-transform ${liked ? "fill-current" : ""
                        }`}
                    />
                    <span className="text-lg font-medium">{likeCount}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-all group">
                    <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-medium">{countAllComments(nestedComments)}</span>
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-all group"
                >
                  <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Share</span>
                </button>

                {currentUserId && post.user_id && currentUserId === post.user_id && (
                  <div className="flex items-center gap-2">
                    <EditPostModal
                      post={post}
                      variant="icon"
                      onUpdated={(updatedPost) => setPost(updatedPost)}
                    />
                    <DeletePostButton
                      postId={post.id}
                      postTitle={post.title}
                      variant="icon"
                      onDeleted={() => router.push(`/profile/${currentUserId}`)}
                    />
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <div className="mt-8 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <MessageCircle className="w-6 h-6 mr-2 text-purple-600" />
                Comments ({countAllComments(nestedComments)})
              </h2>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    disabled={!currentUserId}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && setCommentImage(e.target.files[0])}
                    className="mt-2 text-sm text-gray-500"
                  />
                  {!currentUserId && (
                    <p className="text-xs text-gray-500 mt-2">
                      <Link href="/login" className="text-purple-600 hover:underline">
                        Sign in
                      </Link>{" "}
                      to leave a comment
                    </p>
                  )}
                  {currentUserId && (
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={!commentText.trim() || submittingComment}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center space-x-2"
                      >
                        {submittingComment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Posting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Post Comment</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* ✅ Only top-level comments rendered here; replies are nested inside */}
            <div className="space-y-4">
              {nestedComments.length > 0 ? (
                nestedComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    level={0}
                    currentUserId={currentUserId}
                    onDelete={(id) => {
                      setCommentToDelete(id);
                      setDeleteMessage("Are you sure you want to delete this comment?");
                    }}
                    onAddReply={handleAddReply}
                    loadedReplies={repliesMap[comment.id] ?? null}
                    isLoadingReplies={loadingReplies[comment.id] ?? false}
                    onLoadReplies={handleLoadReplies}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No comments yet</p>
                  <p className="text-sm text-gray-400">
                    Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteMessage && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[320px] text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirm Delete</h3>
              <p className="text-gray-600 mb-5">{deleteMessage}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setDeleteMessage(null);
                    setCommentToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComment}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showImageModal && selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => {
            setShowImageModal(false);
            setSelectedImage(null);
          }}
        />
      )}
    </>
  );
}