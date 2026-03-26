"use client";

import { useState } from "react";
import { Trash2, X, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteAccount({ isOpen, onClose, onSuccess }: DeleteAccountProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch("http://localhost:8000/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setSuccess("Account deleted successfully! Redirecting...");
        
        setTimeout(() => {
          onSuccess?.();
          onClose();
          router.push("/");
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to delete account");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center">
            <Trash2 className="mr-2" size={20} />
            Delete Account
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-1 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-green-700 font-medium">{success}</p>
                  <p className="text-xs text-green-500 mt-1">You will be redirected to homepage...</p>
                </div>
              </div>
            </div>
          )}

          {/* Only show delete content if not success */}
          {!success && (
            <>
              {/* Warning Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <p className="text-center text-gray-700 font-medium">
                Are you sure you want to delete your account?
              </p>

              {/* Warning Box */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="text-red-700 font-medium">This action is permanent and cannot be undone!</p>
                    <ul className="text-red-600 text-xs list-disc pl-4 space-y-1">
                      <li>All your posts will be permanently deleted</li>
                      <li>All your comments will be removed</li>
                      <li>Your profile information will be erased</li>
                      <li>You will lose access to all your data</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                {error && error === "Please type DELETE to confirm" && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertTriangle size={12} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>

              {/* API Error Message */}
              {error && error !== "Please type DELETE to confirm" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={loading || confirmText !== "DELETE"}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} className="mr-2" />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}