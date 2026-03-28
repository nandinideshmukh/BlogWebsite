"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";
import Link from "next/link";
import SearchComponent from "@/components/SearchBar";
import CreateBlogCard from "@/app/blog/create_blog";
import { getCurrentUser } from "@/lib/api";
import { PostResponse } from "../types/interface";
import { getAllPosts } from "@/lib/blog";
import { getCommentsByUserId } from "@/lib/comments";
import { getLikesCommentsByUserId, getLikesPostsByUserId } from "@/lib/likes";
import { CommentResponse } from "../types/interface";
import {
  StarIcon,
  Menu,
  PenSquare,
  BookOpen,
  LogOut,
  Home,
  Heart,
  MessageCircle,
  Bell,
  User,
  ChevronDown,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import UserCard from "../../components/UserCard";
import { UserResponse } from "../types/interface";

export default function DashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showUserCard, setShowUserCard] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCreateBlog, setShowCreateBlog] = useState(false);

  // Comments state
  const [userComments, setUserComments] = useState<CommentResponse[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Liked posts state
  const [likedPosts, setLikedPosts] = useState<PostResponse[]>([]);
  const [loadingLikedPosts, setLoadingLikedPosts] = useState(false);
  const [likedComments, setLikedComments] = useState<CommentResponse[]>([]);
  const [loadingLikedComments, setLoadingLikedComments] = useState(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Posts state
  const [blogs, setBlogs] = useState<PostResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const limit = 10;

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {

    if (error || message) {

      const timer = setTimeout(() => {
        setError("");
        setMessage("");
      }, 4000);

      return () => clearTimeout(timer);

    }

  }, [error, message]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setCurrentUser(data);
      } catch {
        setError(
          "Session expired. Please login again."
        );
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);

        const response = await getAllPosts(page, limit);

        console.log("Responseee:", response);

        if (response?.posts) {
          setBlogs(response.posts);

          setTotalPages(response.total_pages);

          if (
            page >= response.total_pages ||
            response.posts.length < limit
          ) {
            setNoMorePosts(true);
          } else {
            setNoMorePosts(false);
          }
        }

      } catch (error) {
        setError("Error fetching posts");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [page]);

  const sortedBlogs = [...blogs].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const fetchUserComments = async () => {
    try {
      if (!currentUser?.id) return;
      setLoadingComments(true);
      const data = await getCommentsByUserId(currentUser.id);
      setUserComments(data);
    } catch (error) {
      setError("Error fetching comments");
      // console.error("Failed to fetch user comments", error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchLikedPosts();
    }
  }, [currentUser?.id]);

  const fetchLikedPosts = async () => {
    try {
      if (!currentUser?.id) return;

      setLoadingLikedPosts(true);

      const postLikes =
        await getLikesPostsByUserId(currentUser.id);

      console.log("Post Likes:", postLikes);

      const postIds = postLikes
        .map((l) => l.post_id)
        .filter(
          (id): id is string =>
            id !== null &&
            id !== undefined &&
            id !== "null"
        );

      // store liked ids
      setLikedPostIds(new Set(postIds));

      const allBlogsResponse =
        await getAllPosts(1, 100);

      const allBlogs =
        allBlogsResponse?.posts || [];

      setLikedPosts(
        allBlogs.filter((b) =>
          postIds.includes(b.id)
        )
      );

    } catch (error) {
      setError("Failed to fetch liked posts");
    } finally {
      setLoadingLikedPosts(false);
    }
  };

  const fetchLikedComments = async () => {
    try {
      if (!currentUser?.id) return;

      setLoadingLikedComments(true);

      const commentLikes =
        await getLikesCommentsByUserId(
          currentUser.id
        );

      console.log(
        "Comment Likes:",
        commentLikes
      );

      const commentIds = commentLikes
        .map((l) => l.comment_id)
        .filter(
          (id): id is string =>
            id !== null &&
            id !== undefined &&
            id !== "null"
        );

      if (commentIds.length === 0) {
        setLikedComments([]);
        return;
      }

      const { getCommentById } =
        await import("@/lib/comments");

      const fetchedComments =
        await Promise.all(
          commentIds.map((id) =>
            getCommentById(id)
          )
        );

      setLikedComments(
        fetchedComments.filter(Boolean)
      );

    } catch (error) {
      console.error(error);
      setError(
        "Failed to fetch liked comments"
      );
    } finally {
      setLoadingLikedComments(false);
    }
  };

  const fetchLikedItems = async () => {
    try {
      if (!currentUser?.id) return;

      setLoadingLikedPosts(true);
      setLoadingLikedComments(true);

      const [postLikes, commentLikes] = await Promise.all([
        getLikesPostsByUserId(currentUser.id),
        getLikesCommentsByUserId(currentUser.id),
      ]);

      console.log("Post Likes:", postLikes);
      console.log("Comment Likes:", commentLikes);

      const postIds = postLikes
        .map((l) => l.post_id)
        .filter((id): id is string => id !== null);
      const allBlogsResponse = await getAllPosts(1, 100);
      const allBlogs = allBlogsResponse?.posts || [];
      setLikedPosts(allBlogs.filter((b) => postIds.includes(b.id)));

      const commentIds = commentLikes
        .map((l) => l.comment_id)
        .filter((id): id is string => id !== null);
      const { getCommentById } = await import("@/lib/comments");
      const fetchedComments = await Promise.all(
        commentIds.map((id) => getCommentById(id))
      );

      setLikedComments(
        fetchedComments.filter(Boolean)
      );

    } catch (error) {
      setError("Failed to fetch liked items");
    } finally {
      setLoadingLikedPosts(false);
      setLoadingLikedComments(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleOpenCreateBlog = () => {
    setShowCreateBlog(true);
    setActiveTab("write");
  };

  const sidebarItems = [
    { icon: Home, label: "Feed", id: "feed" },
    { icon: PenSquare, label: "Write Blog", id: "write" },
    { icon: BookOpen, label: "My Blogs", id: "my-blogs" },
    { icon: StarIcon, label: "Comments", id: "comment" },
    { icon: Heart, label: "Liked Posts", id: "liked" },
    { icon: Heart, label: "Liked Comments", id: "liked-comments" },
  ];

  const isValidImg = (url?: string | null) =>
    !!url && url !== "string" && url !== "" && url.startsWith("http");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-md"}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <Link href="/" className="ml-2 lg:ml-0 group">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform inline-block">
                  Narrative
                </span>
              </Link>
            </div>

            <div className="flex-1 max-w-2xl mx-4">
              <SearchComponent />
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse" />
              </button>

              <button onClick={() => setShowUserCard(true)} className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-all group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-purple-200 transition-all">
                  {isValidImg(currentUser?.profile_image) ? (
                    <Image src={currentUser!.profile_image!} alt={currentUser!.username} width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-sm border-r border-gray-200 transition-all duration-300 z-20 ${isSidebarOpen ? "w-64" : "w-20"}`}>
        <div className="h-full flex flex-col">
          <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowCreateBlog(false);

                    if (item.id === "write") setShowCreateBlog(true);
                    if (item.id === "my-blogs" && currentUser?.id) router.push(`/profile/${currentUser.id}`);
                    if (item.id === "comment" && currentUser?.id) fetchUserComments();
                    if (item.id === "liked" && currentUser?.id) {
                      fetchLikedPosts();
                    }

                    if (item.id === "liked-comments" && currentUser?.id) {
                      fetchLikedComments();
                    }

                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100 hover:text-purple-600"
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "group-hover:text-purple-600"}`} />
                  {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* User info */}
          {isSidebarOpen && currentUser && (
            <div className="p-4 mx-3 mb-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
                  {isValidImg(currentUser.profile_image) ? (
                    <Image src={currentUser.profile_image!} alt={currentUser.username} width={40} height={40} className="rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{currentUser.username}</p>
                  <p className="text-xs text-purple-600 truncate">{currentUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="p-3 border-t border-gray-200">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all group">
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">
            {error}
          </p>
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-600 text-sm">
            {message}
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Welcome Banner */}
            <div className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 opacity-20" />
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  Welcome back, {currentUser?.username || "Reader"}!
                  <Sparkles className="w-6 h-6 ml-2 text-yellow-300" />
                </h1>
                <p className="text-blue-100 max-w-2xl">
                  Discover amazing stories, connect with writers, and share your thoughts with the community.
                </p>
              </div>
            </div>

            {/* ── Feed Tab ── */}
            {activeTab === "feed" && !showCreateBlog && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Your Feed
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortOrder("desc")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${sortOrder === "desc"
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-700 border-gray-200 hover:shadow-md"
                          }`}
                      >
                        Newest
                      </button>
                      <button
                        onClick={() => setSortOrder("asc")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${sortOrder === "asc"
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-700 border-gray-200 hover:shadow-md"
                          }`}
                      >
                        Oldest
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {loadingPosts && <div className="text-center py-10 text-gray-500">Loading posts...</div>}

                    {sortedBlogs.map((blog, index) => (
                      <article
                        key={`${blog.id}-${index}`}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Link href={`/profile/${blog.user_id}`} className="flex items-center space-x-3 group">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center ring-2 ring-offset-2 ring-purple-100 group-hover:ring-purple-300 transition-all overflow-hidden">
                                {isValidImg(blog.user?.profile_image) ? (
                                  <Image src={blog.user!.profile_image!} alt={blog.user?.username || "user"} width={48} height={48} className="rounded-full object-cover" />
                                ) : (
                                  <User className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                    {blog.user?.username || "Unknown"}
                                  </p>
                                  {blog.user?.role === "author" && <Award className="w-4 h-4 text-purple-600" />}
                                </div>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </Link>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                              <MoreHorizontal className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>

                          <Link href={`/post/${blog.id}`}>
                            <h2 className="text-xl font-bold text-gray-800 mb-3 hover:text-purple-600 cursor-pointer transition-colors">{blog.title}</h2>
                          </Link>
                          <Link href={`/post/${blog.id}`}>
                            <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{blog.content}</p>
                          </Link>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-6">
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group">
                                <Heart
                                  className={`w-5 h-5 group-hover:scale-110 transition-transform ${likedPostIds.has(String(blog.id))
                                    ? "text-red-500 fill-red-500"
                                    : "text-gray-500"
                                    }`}
                                />
                                <span className="text-sm font-medium">{blog.likes_count ?? 0}</span>
                              </button>
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors group">
                                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">{blog.comments?.length ?? 0}</span>
                              </button>
                            </div>
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                              <Share2 className="w-5 h-5" />
                              <span className="text-sm">Share</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}

                    {!loadingPosts && blogs.length === 0 && (
                      <div className="text-center py-10 text-gray-500">No posts found</div>
                    )}

                    {noMorePosts && blogs.length > 0 && (
                      <div className="text-center py-6 text-gray-500 font-medium">
                        No more posts found
                      </div>
                    )}

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button
                        disabled={page === 1}
                        onClick={() =>
                          setPage((prev) =>
                            Math.max(prev - 1, 1)
                          )
                        }
                        className={`px-4 py-2 border rounded-lg ${page === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white hover:bg-gray-100"
                          }`}
                      >
                        Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-4 py-2 rounded-lg border ${page === p ? "bg-purple-600 text-white" : "bg-white hover:bg-gray-100"}`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        disabled={
                          page >= totalPages ||
                          loadingPosts
                        }
                        onClick={() =>
                          setPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        className={`px-4 py-2 border rounded-lg ${page >= totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white hover:bg-gray-100"
                          }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                    <PenSquare className="w-8 h-8 mb-3 text-white/90" />
                    <h3 className="text-lg font-bold mb-2">Share your story</h3>
                    <p className="text-sm text-white/80 mb-4">Write about your experiences and insights</p>
                    <button onClick={handleOpenCreateBlog} className="w-full py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      Start Writing
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Comments Tab ── */}
            {activeTab === "comment" && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <StarIcon className="w-6 h-6 text-purple-500" />
                  My Comments
                </h2>

                {loadingComments && <div className="text-center py-10 text-gray-500">Loading comments...</div>}
                {!loadingComments && userComments.length === 0 && (
                  <div className="text-center py-10 text-gray-500">No comments found</div>
                )}

                <div className="space-y-4">
                  {userComments.map((comment) => (
                    <div key={comment.id} className="bg-white p-5 rounded-xl shadow border border-gray-100">
                      <Link href={`/post/${comment.post_id}`} className="text-sm text-purple-600 hover:underline font-medium">
                        View Post →
                      </Link>
                      <p className="text-gray-700 mt-2">{comment.content}</p>
                      {comment.image_url && comment.image_url !== "string" && comment.image_url.startsWith("http") && (
                        <div className="mt-3">
                          <Image src={comment.image_url} alt="Comment Image" width={300} height={200} className="rounded-lg object-cover" />
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{new Date(comment.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Liked Posts Tab ── */}
            {activeTab === "liked" && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500 fill-current" />
                  Liked Posts
                </h2>

                {loadingLikedPosts && <div className="text-center py-10 text-gray-500">Loading liked posts...</div>}

                {!loadingLikedPosts && likedPosts.length === 0 && (
                  <div className="text-center py-14">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-red-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No liked posts yet</p>
                    <p className="text-gray-400 text-sm mt-1">Posts you like will appear here</p>
                  </div>
                )}

                <div className="space-y-6">
                  {likedPosts.map((blog, index) => (
                    <article
                      key={blog.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Link href={`/profile/${blog.user_id}`} className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center ring-2 ring-offset-2 ring-purple-100 overflow-hidden">
                              {isValidImg(blog.user?.profile_image) ? (
                                <Image src={blog.user!.profile_image!} alt={blog.user?.username || "user"} width={40} height={40} className="rounded-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors text-sm">
                                {blog.user?.username || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                            </div>
                          </Link>
                        </div>

                        <Link href={`/post/${blog.id}`} className="block">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-purple-600 transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-gray-600 line-clamp-3 leading-relaxed text-sm">{blog.content}</p>
                        </Link>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-5">
                            <span className="flex items-center space-x-1.5 text-red-500">
                              <Heart className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{blog.likes_count ?? 0}</span>
                            </span>
                            <span className="flex items-center space-x-1.5 text-gray-500">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">{blog.comments?.length ?? 0}</span>
                            </span>
                          </div>
                          <Link
                            href={`/post/${blog.id}`}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                          >
                            Read more →
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ── Liked Comments Tab ── */}
            {activeTab === "liked-comments" && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-500 fill-current" />
                  Liked Comments
                </h2>

                {loadingLikedComments && (
                  <div className="text-center py-10 text-gray-500">
                    Loading liked comments...
                  </div>
                )}

                {!loadingLikedComments &&
                  likedComments.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      No liked comments yet
                    </div>
                  )}

                <div className="space-y-4">
                  {likedComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white p-5 rounded-xl shadow border"
                    >
                      <Link
                        href={`/post/${comment.post_id}`}
                        className="text-sm text-purple-600 hover:underline font-medium"
                      >
                        View Post →
                      </Link>

                      <p className="text-gray-700 mt-2">
                        {comment.content}
                      </p>

                      {comment.image_url &&
                        comment.image_url.startsWith("http") && (
                          <div className="mt-3">
                            <Image
                              src={comment.image_url}
                              alt="Liked Comment"
                              width={300}
                              height={200}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}

                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(
                          comment.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Write Tab ── */}
            {(activeTab === "write" || showCreateBlog) && <CreateBlogCard />}
          </div>
        </div>
      </main>

      {/* User Card Modal */}
      {showUserCard && currentUser && (
        <UserCard
          user={currentUser}
          onClose={() => setShowUserCard(false)}
          onUserUpdate={(updatedUser) => setCurrentUser(updatedUser)}
        />
      )}

      <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <Footer />
      </div>
    </div>
  );
}