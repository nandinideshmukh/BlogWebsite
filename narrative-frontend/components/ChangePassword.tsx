"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  Key,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Info
} from "lucide-react";

interface UpdatePasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdatePassword({ isOpen, onClose }: UpdatePasswordProps) {
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "None", color: "bg-gray-200", message: "Enter a password", checks: {} };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    if (checks.length) score++;
    if (checks.upper) score++;
    if (checks.lower) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    if (score <= 2) return {
      score: 20,
      label: "Weak",
      color: "bg-red-500",
      message: "Too weak - add more variety",
      checks
    };
    if (score <= 3) return {
      score: 50,
      label: "Medium",
      color: "bg-yellow-500",
      message: "Getting better, but could be stronger",
      checks
    };
    if (score <= 4) return {
      score: 75,
      label: "Good",
      color: "bg-blue-500",
      message: "Good password strength",
      checks
    };
    return {
      score: 100,
      label: "Strong",
      color: "bg-green-500",
      message: "Excellent password!",
      checks
    };
  };

  const passwordStrength = getPasswordStrength(passwordData.new_password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        "http://localhost:8000/users/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            old_password: passwordData.old_password,
            new_password: passwordData.new_password
          })
        }
      );

      if (res.ok) {
        setSuccess("Password updated successfully!");
        setTimeout(() => {
          onClose();
          setPasswordData({
            old_password: "",
            new_password: "",
            confirm_password: ""
          });
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to update password");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Gradient */}
        <div className="relative h-20 bg-gradient-to-r from-green-600 to-teal-600 px-6 flex items-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          </div>

          <div className="flex items-center space-x-3 relative z-10">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Update Password</h3>
              <p className="text-xs text-white/80">Secure your account with a strong password</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 animate-in slide-in-from-top duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2 animate-in slide-in-from-top duration-300">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-600 font-medium">{success}</p>
                <p className="text-xs text-green-500 mt-1">Closing...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                <Lock size={12} />
                <span>Current Password</span>
              </label>
              <div className="relative group">
                <input
                  type={showOld ? "text" : "password"}
                  placeholder="Enter your current password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  value={passwordData.old_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, old_password: e.target.value })
                  }
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showOld ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                <Key size={12} />
                <span>New Password</span>
              </label>
              <div className="relative group">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new_password: e.target.value })
                  }
                  required
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordData.new_password && (
                <div className="mt-3 space-y-2 animate-in slide-in-from-top duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.label === "Strong" ? "text-green-600" :
                      passwordStrength.label === "Good" ? "text-blue-600" :
                      passwordStrength.label === "Medium" ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${passwordStrength.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Info size={10} className="mr-1" />
                    {passwordStrength.message}
                  </p>

                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className={`text-xs flex items-center space-x-1 ${
                      passwordStrength.checks?.length ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <CheckCircle size={10} />
                      <span>8+ characters</span>
                    </div>
                    <div className={`text-xs flex items-center space-x-1 ${
                      passwordStrength.checks?.upper ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <CheckCircle size={10} />
                      <span>Uppercase</span>
                    </div>
                    <div className={`text-xs flex items-center space-x-1 ${
                      passwordStrength.checks?.lower ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <CheckCircle size={10} />
                      <span>Lowercase</span>
                    </div>
                    <div className={`text-xs flex items-center space-x-1 ${
                      passwordStrength.checks?.number ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <CheckCircle size={10} />
                      <span>Number</span>
                    </div>
                    <div className={`text-xs flex items-center space-x-1 ${
                      passwordStrength.checks?.special ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <CheckCircle size={10} />
                      <span>Special char</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle size={12} />
                <span>Confirm Password</span>
              </label>
              <div className="relative group">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm_password: e.target.value })
                  }
                  required
                />
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {passwordData.confirm_password && (
                <p className={`text-xs mt-1 flex items-center ${
                  passwordData.new_password === passwordData.confirm_password
                    ? "text-green-600" : "text-red-500"
                }`}>
                  {passwordData.new_password === passwordData.confirm_password ? (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} className="mr-1" />
                      Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading || !!success}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Update Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setError("");
                  setSuccess("");
                }}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Security Tips */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 flex items-start">
              <ShieldCheck size={14} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Security tip:</strong> Use a unique password that you don't use on other sites.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}