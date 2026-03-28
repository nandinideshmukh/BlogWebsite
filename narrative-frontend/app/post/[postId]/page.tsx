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
import { getUserById } from "@/lib/api";

import { likePost, getLikesByPostId, likeComment, getLikesByCommentId } from "@/lib/likes";
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
  Link2,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function nestComments(comments: CommentResponse[]): CommentResponse[] {
  const map: Record<string, CommentResponse & { replies: CommentResponse[] }> = {};
  const roots: CommentResponse[] = [];
  comments.forEach((c) => { map[c.id] = { ...c, replies: [] }; });
  comments.forEach((c) => {
    if (c.parent_comment_id && map[c.parent_comment_id]) {
      map[c.parent_comment_id].replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

function countAllComments(comments: CommentResponse[]): number {
  return comments.reduce((total, c) => total + 1 + countAllComments(c.replies || []), 0);
}

// Add these two lines right after countAllComments function, at the top level:

const isValidUrl = (url?: string | null) =>
  !!url && url !== "string" && url !== "" && url !== "null";

const imgSrc = (url: string) =>
  url.startsWith("http") ? url : `http://localhost:8000/${url}`;

// ─── Image Modal ─────────────────────────────────────────────────────────────

const ImageModal = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (

    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-5xl max-h-[90vh]">
        <button onClick={onClose} className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors">
          <X className="w-8 h-8" />
        </button>
        <img
          src={imageUrl}
          alt="Full size"
          className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
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
  const [error, setError] = useState("");

  const [showCommentLikesModal, setShowCommentLikesModal] = useState(false);
  const [commentLikedUsers, setCommentLikedUsers] = useState<any[]>([]);

  // Comment like state
  const [commentLiked, setCommentLiked] = useState(false);
  const [commentLikeCount, setCommentLikeCount] = useState(0);
  const [likingComment, setLikingComment] = useState(false);

  const indentLevel = Math.min(level, 3);
  const displayReplies = loadedReplies !== null ? loadedReplies : (comment.replies || []);
  const replyCount = displayReplies.length;

  useEffect(() => {
    const fetchCommentLikes = async () => {
      try {
        const likes = await getLikesByCommentId(comment.id);

        if (!likes || likes.length === 0) {
          setCommentLikeCount(0);
          setCommentLiked(false);
          return;
        }

        // total likes
        setCommentLikeCount(likes[0]?.total_likes ?? 0);

        // check if current user liked
        if (currentUserId) {
          const likedByUser = likes.some(
            (l: any) =>
              l.user_id &&
              String(l.user_id) === String(currentUserId)
          );

          setCommentLiked(likedByUser);
        }

      } catch (err) {
        console.log("Failed fetching comment likes:", err);
      }
    };

    fetchCommentLikes();
  }, [comment.id, currentUserId]);

  const handleShowCommentLikes = async () => {
    try {
      setShowCommentLikesModal(true);

      const likes =
        await getLikesByCommentId(comment.id);
      console.log("comment likesssss:", likes);

      const userIds = likes
        .map((l: any) => l.user_id)
        .filter(Boolean);

      const users = await Promise.all(
        userIds.map(async (id: string) => {
          try {
            return await getUserById(id);
          } catch {
            return null;
          }
        })
      );

      setCommentLikedUsers(
        users.filter(Boolean)
      );

    } catch (err) {
      console.log(err);
    }
  };

  const handleCommentLike = async () => {
    if (!currentUserId) return;
    try {
      setLikingComment(true);
      await likeComment(comment.id);
      const likes = await getLikesByCommentId(comment.id);
      console.log("Likesss", likes);
      setCommentLikeCount(likes[0]?.total_likes ?? 0);

      if (currentUserId) {
        setCommentLiked(
          likes.some(
            (l: any) =>
              l.user_id &&
              String(l.user_id) === String(currentUserId)
          )
        );
      }
    } catch {
      setError("Failed to like comment");
    } finally {
      setLikingComment(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    const full = imageUrl.startsWith("http") ? imageUrl : `http://localhost:8000/${imageUrl}`;
    setSelectedImage(full);
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
    } catch (error: any) {
      setError(
        "Failed to post reply"
      );
    } finally {
      setSubmittingReply(false);
    }
  };

  const isValidUrl = (url?: string | null) =>
    !!url && url !== "string" && url !== "" && url !== "null";
  const imgSrc = (url: string) => url.startsWith("http") ? url : `http://localhost:8000/${url}`;


  return (
    <>
      <div className={`relative ${indentLevel > 0 ? "ml-6 mt-2" : "mt-3"}`}>
        {/* Thread line */}
        {indentLevel > 0 && (
          <div className="absolute left-[-20px] top-4 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-100 to-transparent" />
        )}

        <div className={`rounded-2xl transition-all duration-200 ${indentLevel === 0
          ? "bg-white border border-slate-100 shadow-sm hover:shadow-md"
          : "bg-slate-50/80 border border-slate-100"
          } p-4`}>

          {/* Author row */}
          <div className="flex items-start gap-3">
            <Link href={`/profile/${comment.user_id}`} className="flex-shrink-0 mt-0.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                {comment.user?.profile_image ? (
                  <Image src={imgSrc(comment.user.profile_image)} alt={comment.user.username} width={36} height={36} className="rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/profile/${comment.user_id}`} className="font-semibold text-slate-800 hover:text-violet-600 transition-colors text-sm">
                  {comment.user?.username || "User"}
                </Link>
                <span className="text-[11px] text-slate-400">
                  {new Date(comment.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <p className="text-slate-700 text-sm mt-1.5 leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>

              {/* Comment image */}
              {comment.image_url && comment.image_url !== "string" && comment.image_url !== "" && (
                <div className="mt-2 cursor-pointer relative group inline-block" onClick={() => handleImageClick(comment.image_url!)}>
                  <Image
                    src={imgSrc(comment.image_url)}
                    alt="Comment image"
                    width={180}
                    height={120}
                    className="rounded-xl object-cover hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center gap-4 mt-2.5">
                {/* Like button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCommentLike}
                    disabled={!currentUserId || likingComment}
                    className={`transition-all ${commentLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-400"} disabled:opacity-40`}
                  >
                    {likingComment ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Heart className={`w-3.5 h-3.5 transition-transform hover:scale-110 ${commentLiked ? "fill-current" : ""}`} />
                    )}
                  </button>
                  <button
                    onClick={handleShowCommentLikes}
                    className={`text-xs font-medium hover:underline ${commentLiked ? "text-rose-500" : "text-slate-400"}`}
                  >
                    {commentLikeCount > 0 ? commentLikeCount : "Like"}
                  </button>
                </div>

                {/* Reply button */}
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-violet-500 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>

                {/* Delete button */}
                {currentUserId === comment.user_id && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.user?.username || "User"}...`}
                    rows={2}
                    autoFocus
                    className="w-full px-3 py-2 bg-white border border-violet-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none transition-all"
                  />
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && setReplyImage(e.target.files[0])}
                      className="text-[11px] text-slate-400 file:mr-2 file:text-[11px] file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-violet-100 file:text-violet-600"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={!replyText.trim() || submittingReply}
                        className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                      >
                        {submittingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        <span>{submittingReply ? "Posting..." : "Reply"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showCommentLikesModal && (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => setShowCommentLikesModal(false)}
            >
              <div
                className="bg-white w-80 max-h-[400px] rounded-2xl shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center px-4 py-3 border-b">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    Likes
                  </h3>
                  <button onClick={() => setShowCommentLikesModal(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {commentLikedUsers.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-6">No likes yet</p>
                  ) : (
                    commentLikedUsers.map((user: any) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        onClick={() => setShowCommentLikesModal(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          {isValidUrl(user.profile_image) ? (
                            <img src={imgSrc(user.profile_image)} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-800">{user.username}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Toggle replies */}
          {replyCount > 0 && (
            <div className="mt-3 ml-12">
              <button
                onClick={handleToggleReplies}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-500 hover:text-violet-700 transition-colors"
              >
                {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showReplies ? "Hide" : "Show"} {replyCount} {replyCount === 1 ? "reply" : "replies"}</span>
              </button>

              {showReplies && (
                <div className="mt-2 space-y-2">
                  {isLoadingReplies && displayReplies.length === 0 ? (
                    <div className="flex justify-center py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
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
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showImageModal && selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={() => { setShowImageModal(false); setSelectedImage(null); }} />
      )}
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PostPage() {
  const { postId } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<PostResponse | null>(null);
  const [nestedComments, setNestedComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likingPost, setLikingPost] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [repliesMap, setRepliesMap] = useState<Record<string, CommentResponse[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [shareToast, setShareToast] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState<any[]>([]);
  const [loadingLikesUsers, setLoadingLikesUsers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).id : null;
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostById(postId as string);
        setPost(data.post);
        setLikeCount(data.post.likes_count || 0);
        if (data.post.comments) setNestedComments(nestComments(data.post.comments));

        const likes = await getLikesByPostId(data.post.id);
        if (likes.length > 0) {
          setLikeCount(likes[0].total_likes ?? 0);
          if (currentUserId) {
            setLiked(likes.some((l) => String(l.user_id) === String(currentUserId)));
          }
        }
      } catch {
        setError("Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (postId) fetchPost();
  }, [postId, currentUserId]);

  const handleLike = async () => {
    if (!currentUserId) return;
    try {
      setLikingPost(true);
      await likePost(post!.id);
      const likes = await getLikesByPostId(post!.id);
      setLikeCount(likes[0]?.total_likes ?? 0);
      setLiked(likes.some((l) => String(l.user_id) === String(currentUserId)));
    } catch {
      setError("Failed to like post");
    } finally {
      setLikingPost(false);
    }
  };

  const handleShowPostLikes = async () => {
    try {
      if (!post?.id) return;

      setShowLikesModal(true);
      setLoadingLikesUsers(true);

      const likes = await getLikesByPostId(post.id);
      console.log("POST likes:", likes);

      if (!likes || likes.length === 0) {
        setLikedUsers([]);
        return;
      }

      // extract user_ids
      const userIds = likes
        .map((l: any) => l.user_id)
        .filter(Boolean);

      // fetch users
      const users = await Promise.all(
        userIds.map(async (id: string) => {
          try {
            const res = await getUserById(id);
            return res;
          } catch {
            return null;
          }
        })
      );

      setLikedUsers(users.filter(Boolean));

    } catch (err) {
      console.log("Error loading likes users:", err);
    } finally {
      setLoadingLikesUsers(false);
    }
  };

  const handleLoadReplies = async (commentId: string) => {
    if (repliesMap[commentId] || loadingReplies[commentId]) return;
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    try {
      const replies = await getCommentReplies(commentId);
      setRepliesMap((prev) => ({ ...prev, [commentId]: replies }));
    } catch (error: any) {
      setError(
        "Failed to load replies"
      );
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleAddReply = (parentId: string, newReply: CommentResponse) => {
  if (repliesMap[parentId]) {
    setRepliesMap((prev) => ({
      ...prev,
      [parentId]: [...prev[parentId], newReply],
    }));
    return;
  }

  let foundInMap = false;
  const updatedMap = { ...repliesMap };
  for (const key of Object.keys(updatedMap)) {
    const updated = insertReplyInList(updatedMap[key], parentId, newReply);
    if (updated !== updatedMap[key]) {
      updatedMap[key] = updated;
      foundInMap = true;
    }
  }
  if (foundInMap) {
    setRepliesMap(updatedMap);
    return;
  }

  // ✅ Fall back to inserting into nestedComments tree
  setNestedComments((prev) => insertReplyInList(prev, parentId, newReply));
};

// ✅ Extract as a named helper so it can be reused above
const insertReplyInList = (
  comments: CommentResponse[],
  parentId: string,
  newReply: CommentResponse
): CommentResponse[] =>
  comments.map((c) => {
    if (c.id === parentId) return { ...c, replies: [...(c.replies || []), newReply] };
    if (c.replies?.length) return { ...c, replies: insertReplyInList(c.replies, parentId, newReply) };
    return c;
  });

  const removeFromTree = (comments: CommentResponse[], id: string): CommentResponse[] =>
    comments.filter((c) => c.id !== id).map((c) => ({ ...c, replies: removeFromTree(c.replies || [], id) }));

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment(commentToDelete);
      setNestedComments((prev) => removeFromTree(prev, commentToDelete));
      setRepliesMap((prev) => { const n = { ...prev }; delete n[commentToDelete]; return n; });
      setDeleteMessage(null);
      setCommentToDelete(null);
    } catch {
      setError(
        "Failed to delete comment"
      );
      // alert("Failed to delete comment");
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl.startsWith("http") ? imageUrl : `http://localhost:8000/${imageUrl}`);
    setShowImageModal(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post?.title || undefined, url: window.location.href }); } catch { }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !postId) return;
    try {
      setSubmittingComment(true);
      const newComment = await createComment(postId as string, { content: commentText }, commentImage || undefined);
      setNestedComments((prev) => [{ ...newComment, replies: [] }, ...prev]);
      setCommentText("");
      setCommentImage(null);
    } catch {
      setError(
        "Failed to post comment"
      );
      // alert("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const formatReadingTime = (content: string) => `${Math.ceil(content.split(/\s+/).length / 200)} min read`;
  const imgSrc = (url: string) => url.startsWith("http") ? url : `http://localhost:8000/${url}`;

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 border-[3px] border-violet-100 border-t-violet-500 rounded-full animate-spin" />
            <Sparkles className="w-5 h-5 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-slate-500 text-sm font-medium animate-pulse">Loading story...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "Post not found"}</p>
          <button onClick={() => router.push("/main_page")} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  const totalComments = countAllComments(nestedComments);

  return (
    <>
      {/* Share toast */}
      {shareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <Link2 className="w-4 h-4" />
          Link copied to clipboard
        </div>
      )}

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

          {/* Back button */}
          <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 text-slate-500 hover:text-slate-800 transition-colors group">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Article */}
          <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

            {/* Hero image */}
            {isValidUrl(post.image_url) && (
              <div className="relative w-full h-72 sm:h-96 cursor-pointer group overflow-hidden" onClick={() => handleImageClick(post.image_url!)}>
                <Image
                  src={imgSrc(post.image_url || '')}
                  alt={post.title || "Post image"}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-10">

              {/* Author + save */}
              <div className="flex items-start justify-between mb-7">
                <Link href={`/profile/${post.user_id}`} className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center overflow-hidden ring-2 ring-slate-100">
                      {isValidUrl(post.user?.profile_image) ? (
                        <Image src={imgSrc(post.user?.profile_image || '')} alt={post.user?.username || ''} width={48} height={48} className="rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {post.user?.role === "author" && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-amber-400 rounded-full p-0.5 border-2 border-white">
                        <Award className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors text-sm">
                      {post.user?.username || "Unknown"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatReadingTime(post.content)}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  {currentUserId && post.user_id && currentUserId === post.user_id && (
                    <>
                      <EditPostModal post={post} variant="icon" onUpdated={(updatedPost) => setPost(updatedPost)} />
                      <DeletePostButton postId={post.id} postTitle={post.title || ''} variant="icon" onDeleted={() => router.push(`/profile/${currentUserId}`)} />
                    </>
                  )}
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${saved ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-500"}`}
                  >
                    <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
                {post.title}
              </h1>

              {/* Content */}
              <div className="text-slate-600 leading-[1.85] text-[15px] mb-8 whitespace-pre-line">
                {post.content}
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                <div className="flex items-center gap-5">
                  {/* Like post */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLike}
                      disabled={!currentUserId || likingPost}
                      className={`transition-all disabled:opacity-50 ${liked ? "text-rose-500" : "text-slate-400 hover:text-rose-400"}`}
                    >
                      {likingPost ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Heart className={`w-5 h-5 hover:scale-110 transition-transform ${liked ? "fill-current" : ""}`} />
                      )}
                    </button>
                    <button
                      onClick={handleShowPostLikes}
                      className={`text-sm font-semibold hover:underline ${liked ? "text-rose-500" : "text-slate-400"}`}
                    >
                      {likeCount}
                    </button>
                  </div>

                  {/* Comment count */}
                  <div className="flex items-center gap-2 text-slate-400">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">{totalComments}</span>
                  </div>
                </div>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-slate-400 hover:text-violet-500 transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </article>

          {/* Comments section */}
          <div className="mt-6 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">

            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <MessageCircle className="w-5 h-5 text-violet-500" />
              {totalComments} {totalComments === 1 ? "Comment" : "Comments"}
            </h2>

            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={currentUserId ? "Write a comment..." : "Sign in to comment"}
                    rows={3}
                    disabled={!currentUserId}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:bg-white transition-all resize-none"
                  />

                  <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && setCommentImage(e.target.files[0])}
                      className="text-[11px] text-slate-400 file:mr-2 file:text-[11px] file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-600 file:font-medium"
                    />
                    {!currentUserId ? (
                      <Link href="/login" className="text-xs text-violet-500 hover:underline font-medium">Sign in →</Link>
                    ) : (
                      <button
                        type="submit"
                        disabled={!commentText.trim() || submittingComment}
                        className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-colors"
                      >
                        {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {submittingComment ? "Posting..." : "Post"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {showLikesModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                <div className="bg-white w-80 max-h-[400px] rounded-2xl shadow-xl overflow-hidden">

                  {/* Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b">
                    <h3 className="font-semibold text-sm">
                      Likes
                    </h3>

                    <button
                      onClick={() => setShowLikesModal(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="max-h-[320px] overflow-y-auto">

                    {loadingLikesUsers ? (

                      <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>

                    ) : likedUsers.length === 0 ? (

                      <p className="text-center text-sm text-gray-400 py-6">
                        No likes yet
                      </p>

                    ) : (

                      likedUsers.map((user: any) => (

                        <Link
                          key={user.id}
                          href={`/profile/${user.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                        >

                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">

                            {user.profile_image ? (

                              <Image
                                src={imgSrc(user.profile_image)}
                                alt={user.username}
                                width={32}
                                height={32}
                              />

                            ) : (

                              <User className="w-4 h-4 m-2" />

                            )}

                          </div>

                          <span className="text-sm font-medium">
                            {user.username}
                          </span>

                        </Link>

                      ))

                    )}

                  </div>

                </div>

              </div>
            )}

            {/* Comments list */}
            <div className="space-y-3">
              {nestedComments.length > 0 ? (
                nestedComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    level={0}
                    currentUserId={currentUserId}
                    onDelete={(id) => { setCommentToDelete(id); setDeleteMessage("Delete this comment?"); }}
                    onAddReply={handleAddReply}
                    loadedReplies={repliesMap[comment.id] ?? null}
                    isLoadingReplies={loadingReplies[comment.id] ?? false}
                    onLoadReplies={handleLoadReplies}
                  />
                ))
              ) : (
                <div className="text-center py-14">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No comments yet</p>
                  <p className="text-slate-400 text-xs mt-1">Be the first to share your thoughts</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Delete modal */}
      {deleteMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-80 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Delete comment?</h3>
            <p className="text-slate-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteMessage(null); setCommentToDelete(null); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComment}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image modal */}
      {showImageModal && selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={() => { setShowImageModal(false); setSelectedImage(null); }} />
      )}
    </>
  );
}