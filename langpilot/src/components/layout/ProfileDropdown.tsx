'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Settings, 
  Tags, 
  Globe, 
  LogOut, 
  ChevronDown,
  BookOpen,
  BarChart3
} from 'lucide-react';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/');
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open profile menu"
        className="w-10 h-10 rounded-full bg-orange text-white font-bold
             flex items-center justify-center
             hover:ring-2 hover:ring-orange hover:ring-offset-2
             transition-all"
      >
        {getInitials()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl border-2 border-brown border-opacity-20 
                      shadow-2xl z-50 overflow-hidden"
        >
          {/* User Info Section */}
          <div className="p-4 border-b-2 border-brown border-opacity-20 bg-cream">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-orange text-white font-bold flex items-center justify-center text-lg">
                {getInitials()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-dark">
                  {user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-sm text-brown">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation("/vocabulary")}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-cream transition-colors"
            >
              <BookOpen size={20} className="text-brown" />
              <div>
                <p className="font-bold text-dark">Vocabulary</p>
                <p className="text-xs text-brown">Review your words</p>
              </div>
            </button>

            <button
              onClick={() => handleNavigation("/progress")}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-cream transition-colors"
            >
              <BarChart3 size={20} className="text-brown" />
              <div>
                <p className="font-bold text-dark">Progress</p>
                <p className="text-xs text-brown">Track your learning</p>
              </div>
            </button>

            <div className="my-2 border-t-2 border-brown border-opacity-10" />

            <button
              onClick={() => handleNavigation("/languages")}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-cream transition-colors"
            >
              <Globe size={20} className="text-brown" />
              <div>
                <p className="font-bold text-dark">Languages</p>
                <p className="text-xs text-brown">Manage languages</p>
              </div>
            </button>

            <button
              onClick={() => handleNavigation("/topics")}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-cream transition-colors"
            >
              <Tags size={20} className="text-brown" />
              <div>
                <p className="font-bold text-dark">Topics</p>
                <p className="text-xs text-brown">Customize interests</p>
              </div>
            </button>

            <button
              onClick={() => handleNavigation("/settings")}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-cream transition-colors"
            >
              <Settings size={20} className="text-brown" />
              <div>
                <p className="font-bold text-dark">Settings</p>
                <p className="text-xs text-brown">Preferences & account</p>
              </div>
            </button>

            <div className="my-2 border-t-2 border-brown border-opacity-10" />

            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} className="text-red-600" />
              <p className="font-bold text-red-600">Logout</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

