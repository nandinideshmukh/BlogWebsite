"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Narrative
            </h2>
            <p className="text-gray-600 mt-3 text-sm">
              Share your thoughts, explore ideas, and connect with people around the world.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/service" className="hover:text-blue-600 transition">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Connect</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-gray-800 transition">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-500 transition">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-700 transition">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-red-500 transition">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Narrative. All rights reserved.</p>
          {/* <div className="flex space-x-4 mt-3 md:mt-0">
            <Link href="/terms" className="hover:text-blue-600 transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition">
              Privacy
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}