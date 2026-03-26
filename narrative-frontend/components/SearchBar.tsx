"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, X, Loader2, Filter, ChevronDown, FileText, Clock, Sparkles } from "lucide-react";
import { searchUsers, getUserById } from "@/lib/api";
import { searchPosts } from "@/lib/blog";
import { UserResponse } from "@/app/types/interface";
import ViewUserCard from "./ViewUserCard";
import { useRouter } from "next/navigation";

export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"users" | "posts">("users");

  const [userResults, setUserResults] = useState<any[]>([]);
  const [postResults, setPostResults] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Global Search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setUserResults([]);
        setPostResults([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        if (filter === "users") {
          const data = await searchUsers(query);
          setUserResults(data);
          setPostResults([]);
        } else {
          const data = await searchPosts(query);
          setPostResults(data.posts || data);
          console.log(data.posts);
          setUserResults([]);
        }

        setShowResults(true);
      } catch (err: any) {
        // ✅ If backend sends "not found" → treat as empty result, NOT error
        if (
          err.message.toLowerCase().includes("not found") ||
          err.message.toLowerCase().includes("no posts")
        ) {
          setPostResults([]);
          setUserResults([]);
          setError(""); 
        } else {
          setError(err.message); 
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query, filter]);

  // Handle user click
  const handleUserClick = async (id: string) => {
    setLoadingUser(true);
    try {
      const user = await getUserById(id);
      setSelectedUser(user);
      setShowResults(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingUser(false);
    }
  };

  // Handle post click
  const handlePostClick = (id: string) => {
    router.push(`/post/${id}`);
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    setUserResults([]);
    setPostResults([]);
    inputRef.current?.focus();
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
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* SEARCH BAR */}
      <div ref={searchRef} className="relative w-full max-w-xl">
        <div className="relative group">
          {/* Gradient border effect on focus */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>

          <div className="relative flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group-focus-within:border-transparent">
            {/* FILTER DROPDOWN with enhanced styling */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "users" | "posts")}
                className="appearance-none bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 pr-8 text-sm font-medium text-gray-700 outline-none cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border-r border-gray-200"
              >
                <option value="users" className="bg-white">👤 Users</option>
                <option value="posts" className="bg-white">📝 Posts</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* INPUT with enhanced styling */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query && setShowResults(true)}
                placeholder={`Search for ${filter}...`}
                className="w-full pl-10 pr-10 py-3 outline-none text-gray-700 placeholder-gray-400"
              />

              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              )}
            </div>

            {/* LOADING indicator */}
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              </div>
            )}
          </div>
        </div>

        {/* RESULTS DROPDOWN with enhanced styling */}
        {showResults && (userResults.length > 0 || postResults.length > 0 || error) && (
          <div className="absolute w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {filter === "users" ? (
                    <User className="w-4 h-4 text-purple-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-pink-600" />
                  )}
                  <span className="text-xs font-medium text-gray-600">
                    {filter === "users"
                      ? `${userResults.length} user${userResults.length !== 1 ? 's' : ''} found`
                      : `${postResults.length} post${postResults.length !== 1 ? 's' : ''} found`}
                  </span>
                </div>
                {!error && (
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {filter === "users" ? "👤 Users" : "📝 Posts"}
                  </span>
                )}
              </div>
            </div>

            {/* Error message */}
            {error ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-sm text-red-500 font-medium">{error}</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {/* USERS */}
                {filter === "users" &&
                  userResults.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => router.push(`/profile/${u.id}`)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex-shrink-0">
                        {u.profile_image ? (
                          <img
                            src={u.profile_image}
                            alt={u.username}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-purple-200 transition-all"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-purple-200 transition-all">
                            <User className="text-white w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                            {u.username}
                          </p>
                          {u.role && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {u.role}
                            </span>
                          )}
                        </div>
                        {u.bio && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                {/* POSTS */}
                {filter === "posts" &&
                  postResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handlePostClick(p.id)}
                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-purple-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                            {p.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {p.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            {/* <span className="text-xs text-gray-400 flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {p.user?.username || "Unknown"}
                            </span> */}
                            <span className="text-xs text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {p.created_at ? formatRelativeTime(p.created_at) : "Recent"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* NO RESULTS with enhanced styling */}
        {showResults &&
          !loading &&
          query &&
          userResults.length === 0 &&
          postResults.length === 0 &&
          !error && (
            <div className="absolute w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-8 text-center animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">No {filter} found</p>
              <p className="text-xs text-gray-400">
                Try searching with different keywords
              </p>
            </div>
          )}
      </div>

      {/* USER MODAL with enhanced styling */}
      {loadingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80]">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      )}

      {selectedUser && (
        <ViewUserCard
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}