/* eslint-disable @typescript-eslint/no-unused-vars */
//Navbar.tsx
import React, { useState, useEffect } from "react";
import { LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/auth";
import { useImageStore } from "@/store/image";
import { useUploadStore } from "@/store/upload";
import axios from "axios";

interface NavbarProps {
  imageCount?: number;
  onUploadClick?: () => void;
  userName?: string;
  userEmail?: string;
}

// Utility function to get initials from user name
function getInitials(name: string) {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

// Utility function to format time remaining
function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

const Navbar: React.FC<NavbarProps> = ({ imageCount = 0 }) => {
  const navigate = useNavigate();
  const [sessionTimeLeft, setSessionTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const { sessionId, sessionStartTime } = useUploadStore();
  const { username: userName, email: userEmail } = useAuthStore();

  const handleLogout = React.useCallback(async () => {
    try {
      // Call backend cleanup endpoint before logging out
      if (sessionId) {
        await axios.delete(`/api/cleanup-session/${sessionId}`);
        // console.log("Session cleanup successful on logout");
      }
    } catch (err) {
      // Log error but don't block logout
      if (axios.isAxiosError(err)) {
        // console.log(
        //   `Cleanup on logout failed: ${err.response?.status || "Network Error"}`
        // );
      } else {
        // console.log("Cleanup on logout failed");
      }
    }
    // Clear all stores and localStorage
    Cookies.remove("access_token");
    useAuthStore.getState().clearStore();
    useImageStore.getState().clearStore();
    useUploadStore.getState().clearStore(); // Also clear upload store
    if (useImageStore) {
      useImageStore.getState().setApiResponse(null);
    }
    // Remove all related localStorage keys
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("upload-store");
    localStorage.removeItem("image-storage");
    navigate("/");
  }, [sessionId, navigate]);

  const handleSessionExpiry = React.useCallback(async () => {
    try {
      // Clean up session folder when session expires
      if (sessionId) {
        await axios.delete(`/api/cleanup-session/${sessionId}`);
        // console.log("Session cleanup successful on expiry");
      }
    } catch (err) {
      // Log error but don't block session expiry
      if (axios.isAxiosError(err)) {
        // console.log(
        //   `Cleanup on session expiry failed: ${err.response?.status || "Network Error"}`
        // );
      } else {
        // console.log("Cleanup on session expiry failed");
      }
    }
    handleLogout();
  }, [handleLogout, sessionId]);

  // Update session timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (sessionStartTime) {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const remaining = Math.max(0, 15 * 60 - elapsed);
        setSessionTimeLeft(remaining);

        if (remaining === 0 && !isSessionExpired) {
          setIsSessionExpired(true);
          handleSessionExpiry();
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime, isSessionExpired, handleSessionExpiry]);

  // Get timer color based on time remaining
  const getTimerColor = () => {
    if (sessionTimeLeft <= 5 * 60) return "text-red-600"; // Last 5 minutes
    if (sessionTimeLeft <= 10 * 60) return "text-orange-600"; // Last 10 minutes
    return "text-green-600"; // More than 10 minutes
  };

  return (
    <nav className="sticky top-0 bg-[#0077B6]/[0.12] bg-opacity-[0.12] backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main navbar row */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left Section - Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img
              src="/dugong.png"
              alt="Dugong"
              className="w-24 h-24 object-contain text-[#0077B6] bg-white"
            />
            <h1 className="text-lg sm:text-xl text-white">
              <span className="text-[#0077B6] font-bold">Dugong Detection System</span>
            </h1>
          </div>

          {/* Right Section - Status, Timer, and User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Badge - Hidden on very small screens */}
            {imageCount > 0 && (
              <div className="hidden xs:flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-green-50 rounded-full">

                <span className="text-xs sm:text-sm font-medium text-green-700">
                  <span className="hidden sm:inline">{imageCount} Active</span>
                  <span className="sm:hidden">{imageCount}</span>
                </span>
              </div>
            )}

            {/* Session Timer - Compact on mobile */}
            {sessionId && sessionStartTime && (
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 flex-shrink-0" />
                <span
                  className={`text-xs sm:text-sm font-medium ${getTimerColor()} whitespace-nowrap`}
                >
                  {formatTimeRemaining(sessionTimeLeft)}
                </span>
              </div>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="cursor-pointer relative h-8 w-auto sm:h-10 sm:w-auto p-2 sm:px-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-[#0077B6] flex items-center justify-center font-semibold text-sm sm:text-base shadow-md flex-shrink-0">
                    {userName && getInitials(userName)}
                  </div>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="#0077B6" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-red-600">
                  <NavLink
                    to="/"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-[#0077B6]"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile-only second row for status when needed */}
        {imageCount > 0 && (
          <div className="xs:hidden pb-2">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">
                  {imageCount} Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;