"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PostResponse } from "@/app/types/interface";
import { getUserById } from "@/lib/api";
import { getUserPosts } from "@/lib/blog";
import { getLikesPostsByUserId } from "@/lib/likes";

import {
    ArrowLeft,
    Heart,
    MessageCircle,
    Clock,
    User,
    Calendar,
    BookOpen,
    Share2,
    MoreHorizontal,
    Loader2,
    AlertCircle,
    Award,
    MapPin,
    Link2,
    Twitter,
    Github,
    Globe,
    Sparkles,
    PenSquare,
    Bookmark,
    ChevronRight
} from "lucide-react";

export default function UserBlogsPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params?.userId as string;

    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

    const [userInfo, setUserInfo] = useState<{
        id: string;
        username: string;
        email: string;
        bio?: string | null;
        profile_image?: string | null;
        role?: string | null;
        created_at: string;
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            setLoading(true);
            setError("");

            try {
                const [postsRes, user, likedPosts] = await Promise.all([
                    getUserPosts(userId),
                    getUserById(userId),
                    getLikesPostsByUserId(userId) 
                ]);

                if (postsRes.success) {
                    setPosts(postsRes.posts);
                }

                setUserInfo(user);

                // store liked post ids
                const likedIds = new Set(
                    likedPosts.map((like: any) =>
                        String(like.post_id)
                    )
                );

                setLikedPostIds(likedIds);

            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to load posts");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        if (diffDays < 7) return `${diffDays} day ago`;

        return formatDate(dateString);
    };

    const isValidImage = (url?: string | null) => {
        return typeof url === "string" && (url.startsWith("http") || url.startsWith("/uploads"));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="text-gray-600 animate-pulse">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !userInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    {/* <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2> */}
                    <p className="text-gray-600 mb-6">{error || "This user doesn't exist or has been removed."}</p>
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
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Animated background elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center mb-6 text-gray-600 hover:text-purple-600 transition-all group"
                    >
                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="ml-2 font-medium">Back</span>
                    </button>

                    {/* Profile Header - Enhanced */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8 animate-fade-in">
                        {/* Cover Image */}
                        <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
                            <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
                        </div>

                        <div className="px-8 pb-8">
                            {/* Avatar - Positioned to overlap cover */}
                            <div className="relative -mt-16 mb-4 flex items-end justify-between">
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
                                        {isValidImage(userInfo?.profile_image) ? (
                                            <Image
                                                src={userInfo!.profile_image!}
                                                alt={userInfo?.username || "user"}
                                                width={112}
                                                height={112}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="text-white w-14 h-14" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Role Badge */}
                                    {userInfo?.role === "author" && (
                                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-1.5 border-4 border-white">
                                            <Award className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                    {/* <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md text-sm font-medium">
                                        Follow
                                    </button> */}
                                    <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                        <MoreHorizontal className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                    {userInfo?.username}
                                    {userInfo?.role === "author" && (
                                        <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                            Author
                                        </span>
                                    )}
                                </h1>

                                {/* Bio */}
                                {userInfo?.bio && (
                                    <p className="text-gray-600 mt-2 max-w-2xl">
                                        {userInfo.bio}
                                    </p>
                                )}

                                {/* Stats Row */}
                                <div className="flex flex-wrap items-center gap-6 mt-4 text-gray-600">
                                    <div className="flex items-center">
                                        <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                                        <span className="font-semibold text-gray-800">{posts.length}</span>
                                        <span className="ml-1 text-gray-500">posts</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Heart className="w-5 h-5 mr-2 text-red-500" />
                                        <span className="font-semibold text-gray-800">
                                            {posts.reduce((acc, post) => acc + (post.likes_count ?? 0), 0)}
                                        </span>
                                        <span className="ml-1 text-gray-500">likes</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                                        <span className="font-semibold text-gray-800">
                                            {posts.reduce((acc, post) => acc + (post.comments?.length ?? 0), 0)}
                                        </span>
                                        <span className="ml-1 text-gray-500">comments</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-green-500" />
                                        <span className="text-gray-500">Joined {formatDate(userInfo.created_at)}</span>
                                    </div>
                                </div>


                                {/* Social Links (Optional) */}
                                {/* <div className="flex space-x-3 mt-4">
                                    <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                        <Twitter className="w-4 h-4 text-gray-600" />
                                    </a>
                                    <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                        <Github className="w-4 h-4 text-gray-600" />
                                    </a>
                                    <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                        <Globe className="w-4 h-4 text-gray-600" />
                                    </a>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 mb-8">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <p className="text-gray-600">{error}</p>
                        </div>
                    )}

                    {/* Posts Section */}
                    {!error && (
                        <div className="space-y-6">
                            {/* Section Header with Tabs */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold flex items-center">
                                    <PenSquare className="w-6 h-6 mr-2 text-purple-600" />
                                    All Posts by {userInfo?.username}
                                </h2>

                            </div>

                            {posts.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-10 h-10 text-purple-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">No posts yet</h3>
                                    <p className="text-gray-600 mb-6">
                                        {userInfo?.username} hasn't written any posts yet.
                                    </p>
                                    <button
                                        onClick={() => router.push("/main_page")}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
                                    >
                                        Discover Stories
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {posts.map((post, index) => (
                                        <article
                                            key={post.id}
                                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 animate-fade-in"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="p-6">
                                                {/* Post Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <Link href={`/profile/${post.user_id}`}>
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center ring-2 ring-offset-2 ring-purple-100 hover:ring-purple-300 transition-all">
                                                                {isValidImage(userInfo?.profile_image) ? (
                                                                    <Image
                                                                        src={userInfo!.profile_image!}
                                                                        alt={userInfo?.username || "user"}
                                                                        width={48}
                                                                        height={48}
                                                                        className="rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <User className="w-6 h-6 text-white" />
                                                                )}
                                                            </div>
                                                        </Link>

                                                        <div>
                                                            <Link
                                                                href={`/profile/${post.user_id}`}
                                                                className="font-semibold text-gray-800 hover:text-purple-600 transition-colors"
                                                            >
                                                                {userInfo?.username}
                                                            </Link>
                                                            <p className="text-xs text-gray-500 flex items-center">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                {formatRelativeTime(post.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                                    </button>
                                                </div>

                                                {/* Post Content Link */}
                                                <Link href={`/post/${post.id}`} className="block">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-purple-600 transition-colors">
                                                        {post.title}
                                                    </h3>

                                                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                                        {post.content}
                                                    </p>

                                                    {isValidImage(post.image_url) && (
                                                        <div className="relative h-64 w-full mb-4 rounded-xl overflow-hidden">
                                                            <Image
                                                                src={post.image_url!}
                                                                alt={post.title || "post"}
                                                                fill
                                                                className="object-cover hover:scale-105 transition-transform duration-500"
                                                            />
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Post Footer */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div className="flex items-center space-x-6">
                                                        <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group">
                                                            <Heart
                                                                className={`w-5 h-5 group-hover:scale-110 transition-transform ${likedPostIds.has(String(post.id))
                                                                        ? "text-red-500 fill-red-500"
                                                                        : "text-gray-500"
                                                                    }`}
                                                            />
                                                            <span className="text-sm font-medium">{post.likes_count}</span>
                                                        </button>

                                                        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
                                                            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                            <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                                                        </button>

                                                        {/* <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors group">
                                                            <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                            <span className="text-sm font-medium">125</span>
                                                        </button> */}
                                                    </div>

                                                    <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors group">
                                                        <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                        <span className="text-sm">Share</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Load More Button (if needed) */}
                    {posts.length > 0 && posts.length >= 10 && (
                        <div className="mt-8 text-center">
                            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-all shadow-md font-medium inline-flex items-center">
                                Load More Posts
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </>
    );
}