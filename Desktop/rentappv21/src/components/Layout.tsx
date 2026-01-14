'use client';

import { ReactNode, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import NextImage from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getSearchSessionId, getSearchFilters } from '@/utils/searchSession';
import Navigation from './Navigation';
import Footer from './Footer';
import SearchPopup from './SearchPopup';
import { Menu, Search, ArrowLeft, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPopup from './LoginPopup';
import InstallInstructionsModal from './InstallInstructionsModal';
import AppInfoModal from './AppInfoModal';
import { usePreventScroll, isInteractionLocked } from '@/hooks/usePreventScroll';
import UserMenu from './UserMenu';
import { trackGuestVisit, markGuestInactive } from '@/utils/guestTracking';

interface LayoutProps {
  children: ReactNode;
  totalCount?: number;
  filteredCount?: number;
  hasActiveFilters?: boolean;
}

export default function Layout({ children, totalCount, filteredCount, hasActiveFilters = false }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout, isImpersonating } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; right: number } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [searchBarPosition, setSearchBarPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const avatarSrc = user?.profileImage && user.profileImage.trim() !== '' ? user.profileImage : '/images/reed-richards.png';

  // Touch event handlers for mobile menu swipe gestures - mirroring SearchPopup implementation
  const menuTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const menuTouchEndRef = useRef<{ x: number; y: number } | null>(null);
  const menuMinSwipeDistance = 50;

  const menuOnTouchStart = useCallback((e: React.TouchEvent) => {
    menuTouchEndRef.current = null;
    menuTouchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const menuOnTouchEnd = useCallback(() => {
    const touchStart = menuTouchStartRef.current;
    const touchEnd = menuTouchEndRef.current;

    if (!touchStart || !touchEnd) {
      menuTouchStartRef.current = null;
      menuTouchEndRef.current = null;
      return;
    }

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isRightSwipe = distanceX < -menuMinSwipeDistance; // Left to right swipe
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    // Only handle horizontal right swipes to close (left to right swipe)
    if (!isVerticalSwipe && isRightSwipe) {
      setIsMobileMenuOpen(false);
    }

    // Reset refs after handling
    menuTouchStartRef.current = null;
    menuTouchEndRef.current = null;
  }, []);

  // Keep tracking swipe while blocking background scroll - mirroring SearchPopup
  const menuHandleOverlayTouchMove = useCallback((e: React.TouchEvent) => {
    // Use ref to avoid re-renders - no state updates during move
    menuTouchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const countLabel = useMemo(() => {
    // Show total count for admin portal
    if (pathname === '/admin' && typeof totalCount === 'number') {
      return `${totalCount}`;
    }
    // Show filtered count as [x/x] when there are active filters (priority over admin homepage)
    if (hasActiveFilters && typeof filteredCount === 'number' && typeof totalCount === 'number') {
      return `${filteredCount}/${totalCount}`;
    }
    // Show total count for My Properties and Bookmarks pages (when no filters)
    if ((pathname === '/my-properties' || pathname === '/bookmarks') && typeof totalCount === 'number' && !hasActiveFilters) {
      return `${totalCount}`;
    }
    // Show total count for admin users on homepage (only when no filters)
    if (pathname === '/' && user?.role === 'admin' && typeof totalCount === 'number') {
      return `${totalCount}`;
    }
    return null;
  }, [filteredCount, hasActiveFilters, totalCount, pathname, user?.role]);

  // Get search placeholder based on current page
  const getSearchPlaceholder = () => {
    if (pathname === '/bookmarks') {
      return 'Search my bookmarks...';
    } else if (pathname === '/my-properties') {
      return 'Search my properties...';
    } else if (pathname === '/recently-removed-bookmarks') {
      return 'Search removed bookmarks...';
    } else {
      return 'Search for properties...';
    }
  };

  // Touch event handlers for swipe gestures - using refs for performance
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Disable global swipe gestures on list-property page to allow custom in-page gestures
    if (pathname === '/list-property') {
      return;
    }

    // Hard global guard: Block gestures if ANY modal/overlay is visible
    if (isInteractionLocked()) {
      return;
    }

    touchEndRef.current = null;
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, [pathname]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    // Use ref to avoid re-renders - no state updates during move
    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    // Disable global swipe gestures on list-property page
    if (pathname === '/list-property') {
      return;
    }

    // Hard global guard: Block gestures if ANY modal/overlay is visible
    if (isInteractionLocked()) {
      touchStartRef.current = null;
      touchEndRef.current = null;
      return;
    }

    const touchStart = touchStartRef.current;
    const touchEnd = touchEndRef.current;
    
    if (!touchStart || !touchEnd) {
      touchStartRef.current = null;
      touchEndRef.current = null;
      return;
    }
    
    // Check if image lightbox is open by looking for bg-black bg-opacity-90 (unique to lightbox)
    const imageLightbox = document.querySelector('.bg-black.bg-opacity-90.z-50');
    if (imageLightbox) {
      touchStartRef.current = null;
      touchEndRef.current = null;
      return;
    }
    
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    // Only handle horizontal swipes
    if (isVerticalSwipe) {
      touchStartRef.current = null;
      touchEndRef.current = null;
      return;
    }

    if (isLeftSwipe) {
      // Right to left swipe - open navigation menu if closed
      // Don't open menu if search popup is already open
      if (isSearchPopupOpen && !isMobileMenuOpen) {
        touchStartRef.current = null;
        touchEndRef.current = null;
        return;
      }
      
      // Open menu if closed
      if (!isMobileMenuOpen) {
        setIsMobileMenuOpen(true);
      }
    } else if (isRightSwipe) {
      // Left to right swipe - open search popup or close navigation menu
      // Don't open search if menu is already open
      if (isMobileMenuOpen && !isSearchPopupOpen) {
        // Close navigation menu
        setIsMobileMenuOpen(false);
      } else if (!isSearchPopupOpen) {
        // Open search popup
        setIsSearchPopupOpen(true);
      }
    }
    
    // Reset refs after handling
    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [pathname, isMobileMenuOpen, isSearchPopupOpen]);

  // Helper to build search URL from session filters
  const buildSearchUrl = useCallback(() => {
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
  }, []);

  const handleLogoClick = () => {
    if (pathname === '/') {
      // Reload the page if already on homepage
      window.location.reload();
    } else {
      // Preserve search session if active, regardless of current page
      const homeUrl = buildSearchUrl();
      router.push(homeUrl);
    }
  };

  const handleBackClick = () => {
    // Always use browser history to go back to previous page
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to home page - preserve search session if active
      const homeUrl = buildSearchUrl();
      router.push(homeUrl);
    }
  };

  const getPageTitle = () => {
    // Check if we're on a property detail page
    if (pathname.startsWith('/property/')) {
      return 'Full Details';
    }
    
    switch (pathname) {
      case '/my-properties':
        return 'My Properties';
      case '/bookmarks':
        return 'Bookmarks';
      case '/recently-removed-bookmarks':
        return 'Removed';
      case '/list-property':
        return 'Listing...';
      case '/services':
        return 'Our Services';
      case '/contact':
        return 'Contact Info';
      case '/about':
        return 'About Us';
      case '/profile':
        return 'Profile';
      case '/register':
        return 'Registration';
      case '/staff':
        return 'Staff Portal';
      case '/admin':
        return 'Admin portal';
      default:
        return 'Rentapp';
    }
  };

  const shouldShowBackButton = () => {
    return pathname !== '/';
  };

  // Prevent body scroll when menu is open
  usePreventScroll(isMobileMenuOpen || isSearchPopupOpen || isUserMenuOpen || showLogoutConfirm || showInstallModal || showAppInfoModal);

  const updateAnchorPosition = useCallback((element: HTMLElement | null) => {
    if (!element) {
      setAnchorPosition(null);
      return;
    }
    const rect = element.getBoundingClientRect();
    // Use viewport coordinates (without scrollY) for both mobile and desktop
    // This keeps the modal fixed relative to viewport when scrolling
    setAnchorPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right + window.scrollX,
    });
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track guest visits and handle active/inactive status
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      // Track guest visit when not authenticated
      trackGuestVisit();
      
      // Mark inactive when page becomes hidden or closes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          markGuestInactive();
        } else {
          // Reactivate if page becomes visible again
          trackGuestVisit();
        }
      };
      
      const handleBeforeUnload = () => {
        markGuestInactive();
      };
      
      const handlePageHide = () => {
        markGuestInactive();
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handlePageHide);
        markGuestInactive();
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsUserMenuOpen(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isUserMenuOpen || !anchorElement) return;

    const handleReposition = () => updateAnchorPosition(anchorElement);

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isUserMenuOpen, anchorElement, updateAnchorPosition]);

  const handleProfileClick = (target: HTMLElement) => {
    if (isUserMenuOpen && anchorElement === target) {
      setIsUserMenuOpen(false);
      return;
    }

    setAnchorElement(target);
    updateAnchorPosition(target);
    setIsUserMenuOpen(true);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const handleSearchClick = () => {
    closeUserMenu();
    // Calculate search bar position on desktop
    if (searchBarRef.current && typeof window !== 'undefined' && window.innerWidth >= 1280) {
      const rect = searchBarRef.current.getBoundingClientRect();
      const position = {
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      };
      setSearchBarPosition(position);
    } else {
      setSearchBarPosition(null);
    }
    
    // If on admin page, dispatch event for admin page to update state
    if (pathname === '/admin') {
      window.dispatchEvent(new CustomEvent('adminSearchClick', { detail: searchBarPosition }));
    }
    
    // If on staff page, dispatch event for staff page to update state
    if (pathname === '/staff') {
      window.dispatchEvent(new CustomEvent('staffSearchClick', { detail: searchBarPosition }));
    }
    
    setIsSearchPopupOpen(true);
  };

  return (
    <div 
      className="min-h-screen flex flex-col overflow-x-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Mobile Header */}
      <div className="xl:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-30 shadow-sm">
        {shouldShowBackButton() ? (
          <div className="flex items-center gap-1">
            <button 
              onClick={handleBackClick}
              className="cursor-pointer"
            >
              <ArrowLeft size={24} className="text-booking-blue" />
            </button>
            <button 
              onClick={handleBackClick}
              className="cursor-pointer"
            >
              <h1 className="text-xl font-bold text-booking-blue flex items-center gap-1">
                <span>
                {getPageTitle()}
                {countLabel && (
                    <span className="ml-1 text-lg font-medium">[{countLabel}]</span>
                  )}
                </span>
                {isImpersonating && (
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-0.5"></span>
                )}
              </h1>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogoClick}
            className="flex items-center cursor-pointer -ml-3"
          >
            <NextImage src="/icon.png" alt="Rentapp Logo" width={48} height={48} />
            <h1 className="text-2xl font-bold text-booking-blue flex items-center gap-1 mt-1 -ml-1">
              Rentapp
              {countLabel && (
                <span className="text-xl font-medium mt-0.5">[{countLabel}]</span>
              )}
              {isImpersonating && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </h1>
          </button>
        )}
        <div className="flex items-center gap-2">
          {isClient && isAuthenticated && (
            <button
              onClick={(e) => handleProfileClick(e.currentTarget)}
              className="relative w-9 h-9 rounded-full overflow-visible border border-blue-200 shadow-sm flex items-center justify-center cursor-pointer"
              aria-label="Open profile"
            >
              <NextImage
                src={avatarSrc}
                alt="Profile avatar"
                width={36}
                height={36}
                className="w-full h-full object-cover rounded-full"
              />
              {(user?.role === 'admin' || (user?.role === 'staff' && user?.isApproved)) && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none ${
                  user?.role === 'admin' ? 'bg-red-500' : 'bg-purple-500'
                } ${user?.role === 'staff' ? 'pl-[1px]' : ''}`}>
                  {user?.role === 'admin' ? 'A' : 'S'}
                </div>
              )}
            </button>
          )}
          <button 
            onClick={handleSearchClick}
            className={`p-2 transition-colors cursor-pointer ${hasActiveFilters ? 'text-green-500 hover:text-green-600' : 'text-gray-600 hover:text-booking-blue'}`}
          >
            <Search size={24} />
          </button>
                 <button
                   onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                   className="p-2 text-gray-600 hover:text-booking-blue transition-colors cursor-pointer"
                 >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden xl:flex fixed top-0 left-0 right-0 h-14 items-center justify-between bg-white border-b border-gray-200 px-6 z-30 shadow-sm">
        <button 
          onClick={handleLogoClick}
          className="flex items-center cursor-pointer -ml-3"
        >
          <NextImage src="/icon.png" alt="Rentapp Logo" width={56} height={56} />
          <h1 className="text-3xl font-semibold text-booking-blue flex items-baseline gap-1 mt-1 -ml-1">
            Rentapp
            {countLabel && (
              <span className="text-2xl font-medium leading-none">[{countLabel}]</span>
            )}
            {isImpersonating && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </h1>
        </button>
        <div className="flex items-center gap-4">
          <div 
            ref={searchBarRef}
            onClick={handleSearchClick}
            className={`flex items-center bg-gray-100 rounded-lg px-4 py-2 w-80 cursor-pointer hover:bg-gray-200 transition-colors ${hasActiveFilters ? 'xl:border-2 xl:border-green-500' : ''}`}
          >
            <Search size={20} className={`mr-3 ${hasActiveFilters ? 'text-green-500' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500 cursor-pointer"
              readOnly
            />
          </div>
          {isClient && isAuthenticated && (
            <button
              onClick={(e) => handleProfileClick(e.currentTarget)}
              className="relative w-10 h-10 rounded-full overflow-visible border border-blue-200 shadow-sm flex items-center justify-center cursor-pointer"
              aria-label="Open profile"
            >
              <NextImage
                src={avatarSrc}
                alt="Profile avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-full"
              />
              {(user?.role === 'admin' || (user?.role === 'staff' && user?.isApproved)) && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white leading-none ${
                  user?.role === 'admin' ? 'bg-red-500' : 'bg-purple-500'
                } ${user?.role === 'staff' ? 'pl-[1px]' : ''}`}>
                  {user?.role === 'admin' ? 'A' : 'S'}
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Popup */}
      {isMobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-0 z-[60]"
          style={{ touchAction: 'none', minHeight: '100vh', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={menuOnTouchStart}
          onTouchMove={menuHandleOverlayTouchMove}
          onTouchEnd={menuOnTouchEnd}
        >
          {/* Popup Content */}
          <div
            ref={menuRef}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-2xl max-w-72 w-full max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: '#0071c2' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Navigation 
                variant="popup" 
                onItemClick={() => setIsMobileMenuOpen(false)} 
                onSearchClick={handleSearchClick} 
                onLoginClick={() => setIsLoginPopupOpen(true)}
                onLogoutClick={() => setShowLogoutConfirm(true)}
                hasActiveFilters={hasActiveFilters}
                onInstallClick={() => setShowInstallModal(true)}
                onAppInfoClick={() => setShowAppInfoModal(true)}
                onHomeClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchPopupOpen(false);
                  setIsLoginPopupOpen(false);
                  
                  // Close any property details modals or other popups with z-50 class
                  const allModals = document.querySelectorAll('.z-50');
                  allModals.forEach(modal => {
                    const closeButton = modal.querySelector('button, [onclick*="Close"], [onclick*="close"]');
                    if (closeButton && closeButton instanceof HTMLElement) {
                      closeButton.click();
                    }
                  });
                  
                  // Preserve search session if active, regardless of current page
                  const homeUrl = buildSearchUrl();
                  router.push(homeUrl);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-w-0 pt-14">
        {/* Left Panel - Navigation (Desktop) */}
        <div className="hidden xl:block xl:w-64 xl:min-w-64 bg-white border-b xl:border-b-0 xl:border-r border-gray-200 flex-shrink-0 xl:fixed xl:top-11 xl:left-0 xl:overflow-y-auto xl:z-20" style={{ overflowAnchor: 'none', height: 'calc(100vh - 2.75rem)' }}>
          <Navigation onSearchClick={handleSearchClick} onLoginClick={() => setIsLoginPopupOpen(true)} onLogoutClick={() => setShowLogoutConfirm(true)} onInstallClick={() => setShowInstallModal(true)} onAppInfoClick={() => setShowAppInfoModal(true)} hasActiveFilters={hasActiveFilters} />
        </div>

        {/* Center Panel - Main Content */}
        <div className="flex-1 bg-gray-50 min-w-0 xl:ml-64 xl:mr-80 flex flex-col">
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </div>

        {/* Right Panel - User Profile & Actions (Desktop) */}
        {pathname !== '/admin' && pathname !== '/staff' && (
        <div className="hidden xl:block xl:w-80 xl:min-w-80 bg-white border-l border-gray-200 flex-shrink-0 xl:fixed xl:top-14 xl:right-0 xl:overflow-y-auto xl:z-20 p-6" style={{ overflowAnchor: 'none', height: 'calc(100vh - 3.5rem)' }}>
          {isAuthenticated ? (
            <div className="space-y-6">
              {/* User Profile Card */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user?.name || 'User'}</h3>
                    <p className="text-sm text-gray-600">{user?.role || 'Member'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  View Profile
                </button>
                <button
                  onClick={() => router.push('/my-properties')}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  My Properties
                </button>
                <button
                  onClick={() => router.push('/bookmarks')}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Bookmarks
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Rentapp!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Join our community to access all features and manage your properties.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setIsLoginPopupOpen(true)}
                    className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                      pathname === '/register'
                        ? 'bg-green-200 text-gray-700 hover:bg-green-300'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <LogIn size={16} />
                    <span>Login/Register</span>
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <UserPlus size={16} />
                    <span>Register</span>
                  </button>
                </div>
              </div>

              {/* Features Preview */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">What you can do:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Search and browse properties</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Save favorite properties</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>List your own properties</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Connect with landlords & tenants</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* User Menu */}
      {isClient && isAuthenticated && (
        <UserMenu
          isOpen={isUserMenuOpen}
          onClose={closeUserMenu}
          anchorPosition={anchorPosition}
          onLogoutClick={() => setShowLogoutConfirm(true)}
        />
      )}

      {/* Footer */}
      <Footer />

      {/* Search Popup */}
      <SearchPopup 
        isOpen={isSearchPopupOpen} 
        onClose={() => {
          setIsSearchPopupOpen(false);
          setSearchBarPosition(null);
        }}
        searchBarPosition={searchBarPosition}
        mode={
          (pathname === '/admin' && typeof window !== 'undefined' && ((window as any).__adminCurrentView === 'users' || (window as any).__adminCurrentView === 'staff')) ||
          (pathname === '/staff' && typeof window !== 'undefined' && (window as any).__staffCurrentView === 'users')
            ? 'user' 
            : 'property'
        }
        onUserSearch={
          (pathname === '/admin' && typeof window !== 'undefined' && ((window as any).__adminCurrentView === 'users' || (window as any).__adminCurrentView === 'staff')) ||
          (pathname === '/staff' && typeof window !== 'undefined' && (window as any).__staffCurrentView === 'users')
            ? ((filters) => {
                // Dispatch event for admin/staff page to handle user search
                if (pathname === '/admin') {
                  window.dispatchEvent(new CustomEvent('adminUserSearch', { detail: filters }));
                } else if (pathname === '/staff') {
                  window.dispatchEvent(new CustomEvent('staffUserSearch', { detail: filters }));
                }
              })
            : undefined
        }
        currentUserFilters={
          (pathname === '/admin' && typeof window !== 'undefined' && ((window as any).__adminCurrentView === 'users' || (window as any).__adminCurrentView === 'staff')) ||
          (pathname === '/staff' && typeof window !== 'undefined' && (window as any).__staffCurrentView === 'users')
            ? (typeof window !== 'undefined' ? ((window as any).__adminCurrentFilters || (window as any).__staffCurrentFilters || null) : null)
            : undefined
        }
      />

      {/* Login Popup */}
      <LoginPopup
        isOpen={isLoginPopupOpen}
        onClose={() => setIsLoginPopupOpen(false)}
      />

      {/* Logout Confirmation Popup - Rendered via Portal */}
      {isClient && showLogoutConfirm && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center z-[80] p-4"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="bg-white rounded-xl w-full mx-4 shadow-2xl overflow-hidden max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center p-4 pb-4">
              <p className="text-gray-900 text-base">Are you sure you want to logout ?</p>
            </div>
            <div className="relative">
              <div className="w-full h-px bg-gray-300"></div>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => {
                    const wasAdmin = user?.role === 'admin';
                    setShowLogoutConfirm(false);
                    setIsMobileMenuOpen(false);
                    logout();
                    // Redirect admin users to homepage after logout
                    if (wasAdmin) {
                      router.push('/');
                    }
                  }}
                  className="flex-1 py-3 text-center text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Logout
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 text-center text-gray-600 hover:text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Install Instructions Modal */}
      {showInstallModal && (
        <InstallInstructionsModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* App Info Modal */}
      {showAppInfoModal && (
        <AppInfoModal
          isOpen={showAppInfoModal}
          onClose={() => setShowAppInfoModal(false)}
        />
      )}
    </div>
  );
}
