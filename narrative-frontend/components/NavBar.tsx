"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogIn, UserPlus, Home, Info } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "About Us", href: "/about", icon: Info },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
          : "bg-white shadow-md py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo with animation */}
          <Link
            href="/"
            className="relative group"
          >
            <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 inline-block">
              Narrative
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 group ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"
                  }`} />
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            {/* Auth Buttons with icons */}
            <Link
              href="/login"
              className="px-4 py-2 text-blue-600 font-medium border-2 border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center space-x-2 group hover:shadow-lg hover:shadow-blue-200"
            >
              <LogIn className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Login</span>
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 group shadow-md hover:shadow-xl hover:shadow-purple-200"
            >
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Register</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center group"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-5 h-5 text-gray-600 group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu with animations */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white rounded-xl shadow-xl p-4 space-y-2 border border-gray-100">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${
                    isActive ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <span className="font-medium">{link.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}

            <div className="border-t border-gray-100 my-2"></div>

            {/* Mobile Auth Buttons */}
            <Link
              href="/login"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-300 group"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Login</span>
            </Link>

            <Link
              href="/register"
              className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 group shadow-md"
              onClick={() => setIsOpen(false)}
            >
              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Register</span>
            </Link>

            {/* User info placeholder (optional) */}
            <div className="pt-2 mt-2 border-t border-gray-100">
              <div className="flex items-center space-x-3 px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm text-gray-500">
                  <p className="font-medium">Guest User</p>
                  <p>Sign in to access more features</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}