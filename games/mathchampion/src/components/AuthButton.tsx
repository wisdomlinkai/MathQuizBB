import { LogIn, UserCircle, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { User } from '@/types';

interface AuthButtonProps {
  isAuthenticated: boolean;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onViewProfile?: () => void;
}

export function AuthButton({ 
  isAuthenticated, 
  user, 
  onLogin, 
  onLogout,
  onViewProfile 
}: AuthButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (!isAuthenticated) {
    // Guest state - show login button
    return (
      <button
        onClick={onLogin}
        className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center active:scale-90 transition-transform hover:bg-sky-50"
        title="Sign in to save your progress"
      >
        <LogIn className="w-5 h-5 text-sky-600" />
      </button>
    );
  }

  // Authenticated state - show avatar with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 bg-white rounded-xl px-2 py-1.5 shadow-md active:scale-95 transition-transform hover:bg-sky-50"
      >
        <UserCircle className="w-7 h-7 text-sky-600" />
        <span className="font-display font-bold text-sky-700 text-sm max-w-[60px] truncate">
          {user?.name || 'User'}
        </span>
        <ChevronDown className={`w-4 h-4 text-sky-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg py-2 min-w-[140px] z-50 animate-slide-up border border-sky-100">
          {onViewProfile && (
            <button
              onClick={() => {
                setShowDropdown(false);
                onViewProfile();
              }}
              className="w-full px-4 py-2 text-left font-body font-semibold text-sky-700 hover:bg-sky-50 text-sm"
            >
              View Profile
            </button>
          )}
          <hr className="my-1 border-sky-100" />
          <button
            onClick={() => {
              setShowDropdown(false);
              onLogout();
            }}
            className="w-full px-4 py-2 text-left font-body font-semibold text-coral-600 hover:bg-coral-50 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// Guest user indicator (shown on game screens)
export function GuestIndicator({ onLogin }: { onLogin: () => void }) {
  return (
    <button
      onClick={onLogin}
      className="flex items-center gap-2 bg-gradient-to-r from-sky-100 to-sky-50 rounded-xl px-3 py-1.5 shadow-sm active:scale-95 transition-transform hover:shadow-md border border-sky-200"
    >
      <LogIn className="w-4 h-4 text-sky-600" />
      <span className="font-body font-semibold text-sky-700 text-xs">Sign in to save</span>
    </button>
  );
}
