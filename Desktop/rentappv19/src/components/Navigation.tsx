'use client';



import Link from 'next/link';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getSearchSessionId, getSearchFilters } from '@/utils/searchSession';

import { Home, Search, Settings, Phone, Info, PlusCircle, Heart, Building, User, LogIn, ShieldCheck, LogOut } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

import { useState, useEffect } from 'react';
import InstallInstructionsModal from './InstallInstructionsModal';
import AppInfoModal from './AppInfoModal';



interface NavigationProps {

  variant?: 'default' | 'popup';

  onItemClick?: () => void;

  onSearchClick?: () => void;

  onLoginClick?: () => void;

  onLogoutClick?: () => void;

  onHomeClick?: () => void;

  onInstallClick?: () => void;

  onAppInfoClick?: () => void;

}



export default function Navigation({ variant = 'default', onItemClick, onSearchClick, onLoginClick, onLogoutClick, onHomeClick, onInstallClick, onAppInfoClick }: NavigationProps) {

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { isAuthenticated, user, endSession, isImpersonating, logout } = useAuth();

  const isStaff = user?.role === 'staff';

  const isApprovedStaff = isStaff && user?.isApproved === true;

  const isAdmin = user?.role === 'admin';


  const [isEndingSession, setIsEndingSession] = useState(false);

  // PWA detection - stable state that doesn't change during menu interactions
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;

    // Check for iOS Safari standalone mode
    const isIOSStandalone = (window.navigator as any).standalone === true;

    // Check for Android/Chrome standalone mode
    const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // Check for other browsers standalone mode
    const isOtherStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                             window.matchMedia('(display-mode: fullscreen)').matches ||
                             window.matchMedia('(display-mode: minimal-ui)').matches;

    return isIOSStandalone || isAndroidStandalone || isOtherStandalone;
  });



  const handleEndSession = async () => {

    setIsEndingSession(true);

    try {

      await endSession();

    } catch (error) {

      console.error('Error ending session:', error);

    } finally {

      setIsEndingSession(false);

    }

  };



  // Helper to build search URL from session filters
  const buildSearchUrl = () => {
    const searchSessionId = getSearchSessionId();
    if (!searchSessionId) {
      return '/';
    }
    
    const filters = getSearchFilters();
    if (!filters) {
      return '/';
    }
    
    const params = new URLSearchParams();
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.profile) params.set('profile', filters.profile);
    if (filters.status) params.set('status', filters.status);
    if (filters.region) params.set('region', filters.region);
    if (filters.ward) params.set('ward', filters.ward);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
  };

  const handleNavClick = () => {

    if (variant === 'popup' && onItemClick) {

      onItemClick();

    }

    if (onHomeClick) {

      onHomeClick();

    }

  };



  return (
    <>
    <nav className="p-4 lg:p-6">

      {/* Logo removed as requested */}



      {/* Navigation Links */}

      <div className={`space-y-2 lg:space-y-2 ${variant === 'popup' ? 'flex flex-col items-start space-y-2 pt-0 pb-0' : ''}`}>

        <Link 

          href={buildSearchUrl()}

          onClick={handleNavClick}

          className={`flex items-center space-x-3 ${

            variant === 'popup' 

              ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

              : pathname === '/' 

                ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

          }`}

        >

          <Home size={20} className="flex-shrink-0" />

          <span className="text-base font-medium">Home</span>

        </Link>



        <a 

          href="#" 

          onClick={(e) => {

            e.preventDefault();

            if (variant === 'popup' && onItemClick) {

              onItemClick();

            }

            if (onSearchClick) {

              onSearchClick();

            }

          }}

          className={`flex items-center space-x-3 ${

            variant === 'popup' 

              ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

              : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

          }`}

        >

          <Search size={20} className="flex-shrink-0" />

          <span className="text-base font-medium">Search</span>

        </a>

        

        <Link 

          href="/services" 

          onClick={handleNavClick}

          className={`flex items-center space-x-3 ${

            variant === 'popup' 

              ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

              : pathname === '/services' 

                ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

          }`}

        >

          <Settings size={20} className="flex-shrink-0" />

          <span className="text-base font-medium">Our Services</span>

        </Link>

        

        <Link 

          href="/contact" 

          onClick={handleNavClick}

          className={`flex items-center space-x-3 ${

            variant === 'popup' 

              ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

              : pathname === '/contact' 

                ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

          }`}

        >

          <Phone size={20} className="flex-shrink-0" />

          <span className="text-base font-medium">Contact Info</span>

        </Link>

        

        <Link 

          href="/about" 

          onClick={handleNavClick}

          className={`flex items-center space-x-3 ${

            variant === 'popup' 

              ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

              : pathname === '/about' 

                ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

          }`}

        >

          <Info size={20} className="flex-shrink-0" />

          <span className="text-base font-medium">About Us</span>

        </Link>

        

        <Link 

          href="/list-property" 

          onClick={handleNavClick}

          className={`flex items-center space-x-3 ${

            variant === 'popup' 

              ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

              : pathname === '/list-property' 

                ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

          }`}

        >

          <PlusCircle size={20} className="flex-shrink-0" />

          <span className="text-base font-medium relative">

            List Your Property

            <span className="absolute bottom-0 left-0 right-0 h-px bg-current transform scale-x-105 origin-left -translate-x-0.75"></span>

          </span>

        </Link>



        <Link 

          href="/bookmarks" 

          onClick={handleNavClick}

          className={`flex items-center space-x-3 ${

            variant === 'popup' 

              ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

              : pathname === '/bookmarks' || pathname === '/recently-removed-bookmarks'

                ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

          }`}

        >

          <Heart size={20} className="flex-shrink-0" />

          <span className="text-base font-medium">Bookmarks</span>

        </Link>



        <Link 

          href="/my-properties" 

          onClick={handleNavClick}

          className={`flex items-center space-x-3 ${

            variant === 'popup' 

              ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

              : pathname === '/my-properties' 

                ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

          }`}

        >

          <Building size={20} className="flex-shrink-0" />

          <span className="text-base font-medium">My Properties</span>

        </Link>



        {isApprovedStaff && (

          <Link 

            href="/staff" 

            onClick={handleNavClick}

            className={`flex items-center space-x-3 ${

              variant === 'popup' 

                ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

                : pathname === '/staff' 

                  ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                  : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

            }`}

          >

            <ShieldCheck size={20} className="flex-shrink-0" />

            <span className="text-base font-medium">Staff Portal</span>

          </Link>

        )}



        {isAdmin && (

          <Link 

            href="/admin" 

            onClick={handleNavClick}

            className={`flex items-center space-x-3 ${

              variant === 'popup' 

                ? pathname === '/admin'
                  ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100'
                  : 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

                : pathname === '/admin' 

                  ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                  : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

            }`}

          >

            <ShieldCheck size={20} className="flex-shrink-0" />

            <span className="text-base font-medium">Admin Portal</span>

          </Link>

        )}



        {isImpersonating && (

          <button

            onClick={() => {

              if (variant === 'popup' && onItemClick) {

                onItemClick();

              }

              handleEndSession();

            }}

            disabled={isEndingSession}

            className={`flex items-center space-x-3 ${

              variant === 'popup' 

                ? 'text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed' 

                : 'text-red-600 hover:text-red-700 hover:bg-yellow-500 rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed'

            }`}

          >

            <LogOut size={20} className="flex-shrink-0" />

            <span className="text-base font-medium">{isEndingSession ? 'Ending...' : 'End Session'}</span>

          </button>

        )}

        

        <Link 

          href="/profile" 

          onClick={handleNavClick}

          className={`flex items-center space-x-3 ${

            variant === 'popup' 

              ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100' 

              : pathname === '/profile' 

                ? 'text-gray-700 bg-green-200 rounded-lg px-3 py-2' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2'

          }`}

        >

          <User size={20} className="flex-shrink-0" />

          <span className="text-base font-medium">Profile</span>

        </Link>



        {/* Authentication Section */}

        {!isAuthenticated && (

          <button

            onClick={() => {

              if (variant === 'popup' && onItemClick) {

                onItemClick();

              }

              if (onLoginClick) {

                onLoginClick();

              }

            }}

            className={`flex items-center space-x-3 ${

              variant === 'popup' 

                ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100 cursor-pointer' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2 w-full cursor-pointer'

            }`}

          >

            <LogIn size={20} className="flex-shrink-0" />

            <span className="text-base font-medium">Login/Register</span>

          </button>

        )}

        {isAuthenticated && (

          <button

            onClick={() => {

              if (onLogoutClick) {

                onLogoutClick();

              } else {

                // Fallback to direct logout if no handler provided

                if (variant === 'popup' && onItemClick) {

                  onItemClick();

                }

                const wasAdmin = isAdmin;

                logout();

                if (wasAdmin) {

                  router.push('/');

                }

              }

            }}

            className={`flex items-center space-x-3 ${

              variant === 'popup' 

                ? 'text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100 cursor-pointer' 

                : 'text-gray-700 hover:text-black hover:bg-yellow-500 rounded-lg px-3 py-2 w-full cursor-pointer'

            }`}

          >

            <LogOut size={20} className="flex-shrink-0" />

            <span className="text-base font-medium">Logout</span>

          </button>

        )}

        {/* Install Rentapp Button - Only show when not running as standalone PWA */}
        {variant === 'popup' && !isStandalone && (
          <button
            onClick={() => {
              if (onInstallClick) {
                onInstallClick();
              }
            }}
            className="flex items-center space-x-3 text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-download flex-shrink-0" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
            <span className="text-base font-medium">Install Rentapp</span>
          </button>
        )}

        {/* App Info Button - Only show when running as standalone PWA */}
        {variant === 'popup' && isStandalone && (
          <button
            onClick={() => {
              if (onAppInfoClick) {
                onAppInfoClick();
              }
            }}
            className="flex items-center space-x-3 text-gray-800 hover:text-black px-4 py-2 rounded-lg hover:bg-yellow-500 w-full justify-start h-10 border border-white border-opacity-30 bg-blue-100 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-info flex-shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <span className="text-base font-medium">App Info</span>
          </button>
        )}

        {/* Close and Home Buttons - Only in popup mode */}

        {variant === 'popup' && (

          <div className="flex space-x-2 w-full">

            <button

              onClick={() => {

                if (onItemClick) {

                  onItemClick();

                }

                if (onHomeClick) {

                  onHomeClick();

                }

              }}

              className="text-white px-4 py-2 rounded-lg font-medium transition-colors text-center h-10 cursor-pointer flex-1"

              style={{ backgroundColor: 'rgba(34, 197, 94, 0.8)' }}

              onMouseEnter={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(34, 197, 94, 1)'}

              onMouseLeave={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(34, 197, 94, 0.8)'}

            >

              Home

            </button>

            <button

              onClick={() => {

                if (onItemClick) {

                  onItemClick();

                }

              }}

              className="text-white px-4 py-2 rounded-lg font-medium transition-colors text-center h-10 cursor-pointer flex-1"

              style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }}

              onMouseEnter={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(239, 68, 68, 1)'}

              onMouseLeave={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(239, 68, 68, 0.8)'}

            >

              Close

            </button>

          </div>

        )}

      </div>

    </nav>
    </>
  );

}

