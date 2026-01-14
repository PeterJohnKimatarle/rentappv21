'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import GoogleSignIn from './GoogleSignIn';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  // Prevent background scrolling when popup is open
  usePreventScroll(isOpen);

  // Keyboard-aware inset using VisualViewport
  const [keyboardInset, setKeyboardInset] = useState(0);
  useEffect(() => {
    if (!isOpen) {
      setKeyboardInset(0);
      return;
    }
    const vv = typeof window !== 'undefined'
      ? (window as Window & { visualViewport?: VisualViewport }).visualViewport
      : undefined;
    if (!vv) return;
    const handleResize = () => {
      const covered = Math.max(0, window.innerHeight - vv.height);
      setKeyboardInset(covered > 0 ? covered + 32 : 0);
    };
    handleResize();
    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    setTimeout(() => {
      inputEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      scrollRef.current?.scrollBy({ top: -24, behavior: 'smooth' });
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Login successful - clear any errors and close immediately
        setError('');
        setIsLoading(false);
        handleClose();
        // Don't navigate here to avoid any potential routing errors
        return; // Exit early to prevent any further processing
      } else {
        setError(result.message ?? 'Invalid email or password');
      }
    } catch (loginError) {
      console.error('Login error:', loginError);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setShowEmailLogin(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        touchAction: 'none',
        minHeight: '100vh',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={() => handleClose()}
    >
      <div 
        ref={popupRef}
        className="bg-white rounded-xl max-w-sm w-full max-h-[65vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center pt-3 pb-2 px-4 bg-white sticky top-0 z-10">
          <h3 className="text-2xl font-semibold text-black">Login to Rentapp</h3>
        </div>

        {/* Content */}
        <div
          ref={scrollRef}
          className="p-4 overflow-y-auto flex-1"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: keyboardInset || 16 }}
        >
          {/* Google Sign In - Only show when email login is closed */}
          {!showEmailLogin && (
            <div className="mb-2">
              <GoogleSignIn
                onClick={() => {
                  // UI-only: Logic will be implemented later
                  console.log('Google sign-in clicked - logic to be implemented')
                }}
              />
            </div>
          )}

          {/* Login with Email Link - Only show when Google button is visible */}
          {!showEmailLogin && (
            <div className="text-right pr-2 mt-2">
              <button
                type="button"
                onClick={() => setShowEmailLogin(!showEmailLogin)}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Login with Email
              </button>
            </div>
          )}

          {/* Email/Password Form - Only show when toggled */}
          {showEmailLogin && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onFocus={handleInputFocus}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onFocus={handleInputFocus}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
              </>
            )}

          {/* Login with Google Link - Only show when email form is visible */}
          {showEmailLogin && (
            <div className="text-right pr-2 mt-2">
              <button
                type="button"
                onClick={() => setShowEmailLogin(false)}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Login with Google
              </button>
            </div>
          )}

          {/* Registration Prompt - Always visible */}
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-base mb-2">
              Don&apos;t have an account?
            </p>
            <Link
              href="/register"
              onClick={onClose}
              className="text-blue-500 hover:text-blue-600 font-medium underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
