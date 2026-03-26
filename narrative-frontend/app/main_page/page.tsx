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
import { getUserById } from "@/lib/api";
import { getCommentsByUserId } from "@/lib/comments";
import { CommentResponse } from "../types/interface";
import {
  StarIcon,
  Menu,
  PenSquare,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Home,
  Heart,
  MessageCircle,
  Bell,
  User,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  Save,
  FileText,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  Star,
  Bookmark,
  Share2,
  MoreHorizontal
} from "lucide-react";
import UserCard from "../../components/UserCard";
import { UserResponse } from "../types/interface";


export default function DashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showUserCard, setShowUserCard] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCreateBlog, setShowCreateBlog] = useState(false);

  const [userComments, setUserComments] = useState<CommentResponse[]>([]);

  const [loadingComments, setLoadingComments] = useState(false);
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setCurrentUser(data);
      } catch (error) {
        console.error("Failed to fetch user");
        router.push("/login");
      }
    };


    fetchUser();
  }, [router]);

  const [blogs, setBlogs] = useState<PostResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);

        const response = await getAllPosts(page, limit);

        if (response?.posts) {

          setBlogs(response.posts);

          if (response) {
            setTotalPages(response.total_pages);
          }

        }

      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [page]);

  const fetchUserComments = async () => {
    try {
      if (!currentUser?.id) return;

      setLoadingComments(true);

      const data =
        await getCommentsByUserId(
          currentUser.id
        );

      setUserComments(data);

    } catch (error) {

      console.error(
        "Failed to fetch user comments",
        error
      );

    } finally {

      setLoadingComments(false);

    }
  };



  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const sidebarItems = [
    { icon: Home, label: "Feed", id: "feed" },
    { icon: TrendingUp, label: "Trending", id: "trending" },
    { icon: BookOpen, label: "My Blogs", id: "my-blogs" },
    { icon: PenSquare, label: "Write Blog", id: "write" },
    { icon: StarIcon, label: "Comments", id: "comment" },
    { icon: Heart, label: "Liked Posts", id: "liked" },
  ];


  // Handle opening create blog modal or switching to write tab
  const handleOpenCreateBlog = () => {
    setShowCreateBlog(true);
    setActiveTab("write");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
        }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section - Logo and menu toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <Link href="/" className="ml-2 lg:ml-0 group">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform inline-block">
                  Narrative
                </span>
              </Link>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <SearchComponent />
            </div>

            {/* Right section - User menu */}
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
              </button>

              <button
                onClick={() => setShowUserCard(true)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-purple-200 transition-all">
                  {currentUser?.profile_image ? (
                    <Image
                      src={currentUser?.profile_image}
                      alt={currentUser?.username}
                      //  //s="(max-width: 768px) 100vw, 50vw"

                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
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
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-sm border-r border-gray-200 transition-all duration-300 z-20 ${isSidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
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

                    if (item.id === "write") {
                      setShowCreateBlog(true);
                    }

                    if (
                      item.id === "my-blogs" &&
                      currentUser?.id
                    ) {
                      router.push(
                        `/profile/${currentUser.id}`
                      );
                    }

                    if (
                      item.id === "comment" &&
                      currentUser?.id
                    ) {
                      fetchUserComments();
                    }

                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100 hover:text-purple-600"
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'group-hover:text-purple-600'
                    }`} />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User info in sidebar */}
          {isSidebarOpen && currentUser && (
            <div className="p-4 mx-3 mb-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  {currentUser.profile_image ? (
                    <Image
                      src={currentUser.profile_image}
                      alt={currentUser.username}
                      //  //s="(max-width: 768px) 100vw, 50vw"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
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

          {/* Sidebar footer - Logout button */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}
      >
        <div className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Banner */}
            <div className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  Welcome back, {currentUser?.username || 'Reader'}!
                  <Sparkles className="w-6 h-6 ml-2 text-yellow-300" />
                </h1>
                <p className="text-blue-100 max-w-2xl">
                  Discover amazing stories, connect with writers, and share your thoughts with the community.
                </p>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === "feed" && !showCreateBlog && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Your Feed
                    </h2>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-gray-700 border border-gray-200">
                        Latest
                      </button>
                    </div>
                  </div>

                  {/* Blogs Feed */}
                  {/* Blogs Feed */}
                  <div className="space-y-6">
                    {loadingPosts && (
                      <div className="text-center py-10 text-gray-500">
                        Loading posts...
                      </div>
                    )}

                    {
                      blogs.map((blog, index) => (
                        <article
                          key={`${blog.id}-${index}`}
                          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom-4 border border-gray-100"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                {/* Make the entire user info area clickable */}
                                <Link href={`/profile/${blog.user_id}`} className="flex items-center space-x-3 group">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center ring-2 ring-offset-2 ring-purple-100 group-hover:ring-purple-300 transition-all">
                                    {blog?.user?.profile_image && blog.user.profile_image.startsWith("http") ? (
                                      <Image
                                        src={blog.user.profile_image}
                                        alt={blog?.user?.username || "user"}
                                        //  //s="(max-width: 768px) 100vw, 50vw"
                                        width={300}
                                        height={200}
                                        className="rounded-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-6 h-6 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                        {blog?.user?.username || "Unknown"}
                                      </p>
                                      {blog?.user?.role === "author" && (
                                        <Award className="w-4 h-4 text-purple-600" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {new Date(blog.created_at).toLocaleDateString("en-US", {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </Link>
                              </div>
                              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <MoreHorizontal className="w-5 h-5 text-gray-500" />
                              </button>
                            </div>

                            <Link href={`/post/${blog.id}`}>
                              <h2 className="text-xl font-bold text-gray-800 mb-3 hover:text-purple-600 cursor-pointer transition-colors">
                                {blog.title}
                              </h2>
                            </Link>

                            <Link href={`/post/${blog.id}`}>
                              <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                {blog.content}
                              </p>
                            </Link>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {/* {blog.map((tag, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200"
                              >
                                #{tag}
                              </span>
                            ))} */}
                            </div>



                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center space-x-6">
                                <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group">
                                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                  {/* <span className="text-sm font-medium">{blog.likes_count}</span> */}
                                </button>
                                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors group">
                                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                  <span className="text-sm font-medium">{blog.comments?.length}</span>
                                </button>
                              </div>
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                                <Share2 className="w-5 h-5" />
                                <span className="text-sm">Share</span>
                              </button>
                            </div>
                          </div>
                        </article>

                      ))
                    }

                    {!loadingPosts && blogs.length === 0 && (
                      <div className="text-center py-10 text-gray-500">
                        No posts found
                      </div>
                    )}

                    {noMorePosts && blogs.length > 0 && (
                      <div className="text-center py-6 text-gray-500 font-medium">
                        🚫 No more posts found
                      </div>
                    )}
                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-8">

                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100"
                      >
                        Prev
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-4 py-2 rounded-lg border ${page === p
                            ? "bg-purple-600 text-white"
                            : "bg-white hover:bg-gray-100"
                            }`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        disabled={noMorePosts || loadingPosts}
                        onClick={() => {
                          if (!noMorePosts) {
                            setPage((prev) => prev + 1)
                          }
                        }}
                        className={`px-4 py-2 border rounded-lg ${noMorePosts
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white hover:bg-gray-100"
                          }`}
                      >
                        Next
                      </button>

                    </div>
                  </div>


                </div>

                {/* Right Sidebar - Trending & Suggestions */}
                <div className="space-y-6">
                  {/* Write Post CTA */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                    <PenSquare className="w-8 h-8 mb-3 text-white/90" />
                    <h3 className="text-lg font-bold mb-2">Share your story</h3>
                    <p className="text-sm text-white/80 mb-4">
                      Write about your experiences and insights
                    </p>
                    <button
                      onClick={handleOpenCreateBlog}
                      className="w-full py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Start Writing
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "comment" && (

              <div className="max-w-3xl mx-auto">

                <h2 className="text-2xl font-bold mb-6">
                  My Comments
                </h2>

                {loadingComments && (
                  <div className="text-center py-10 text-gray-500">
                    Loading comments...
                  </div>
                )}

                {!loadingComments &&
                  userComments.length === 0 && (

                    <div className="text-center py-10 text-gray-500">
                      No comments found
                    </div>

                  )}

                <div className="space-y-6">

                  {userComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white p-5 rounded-xl shadow border border-gray-100"
                    >
                      {/* Post Link */}
                      <Link
                        href={`/post/${comment.post_id}`}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        View Post
                      </Link>

                      {/* Content */}
                      <p className="text-gray-700 mt-2">{comment.content}</p>

                      {/* Image (if exists) */}
                      {comment.image_url && comment.image_url !== "string" && (
                        <div className="mt-3">
                          <Image
                            src={comment.image_url.startsWith("http") ? comment.image_url : `http://localhost:8000/${comment.image_url}`}
                            alt="Comment Image"
                            //   
                            // //s="(max-width: 768px) 100vw, 50vw"

                            width={300}
                            height={200}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      )}

                      {/* Date */}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}

                </div>

              </div>

            )}

            {/* Write Blog Tab - Show CreateBlogCard */}
            {(activeTab === "write" || showCreateBlog) && (
              <CreateBlogCard />
            )}
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
      <Footer />
    </div>
  );
}