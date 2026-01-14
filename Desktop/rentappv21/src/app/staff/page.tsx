'use client';

import Layout from '@/components/Layout';
import LoginPopup from '@/components/LoginPopup';
import PropertyCard from '@/components/PropertyCard';
import SearchPopup, { UserSearchFilters } from '@/components/SearchPopup';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Archive, Clock, Menu, X, Users, User as UserIcon, ChevronRight, MoreVertical } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getFollowUpPropertiesByStaff, getClosedPropertiesByStaff, getUserNotes, saveUserNotes } from '@/utils/propertyUtils';
import Image from 'next/image';
import { getActiveSessions } from '@/utils/sessionTracking';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import ImageLightbox from '@/components/ImageLightbox';

type ViewType = 'closed' | 'followup' | 'users';

interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: 'tenant' | 'landlord' | 'broker' | 'staff' | 'admin';
  isApproved?: boolean;
  profileImage?: string;
  bio?: string;
}

export default function StaffPortalPage() {
  const { isAuthenticated, user, isLoading, isImpersonating, getAllUsers } = useAuth();
  const router = useRouter();
  const wasAuthenticatedRef = useRef(isAuthenticated);
  const wasImpersonatingRef = useRef(isImpersonating);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('closed');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [closedProperties, setClosedProperties] = useState(0);
  const [followUpProperties, setFollowUpProperties] = useState(0);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearchFilters, setUserSearchFilters] = useState<UserSearchFilters | null>(null);
  const [openUserDropdown, setOpenUserDropdown] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
  const [showUserNotesModal, setShowUserNotesModal] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [isUserNotesEditable, setIsUserNotesEditable] = useState(false);
  const [userNotesKeyboardInset, setUserNotesKeyboardInset] = useState(0);
  const [hasUserNotes, setHasUserNotes] = useState(false);
  const [showProfileImagePreview, setShowProfileImagePreview] = useState(false);
  const [previewProfileImage, setPreviewProfileImage] = useState<string>('');

  const isStaff = user?.role === 'staff';
  const isApproved = user?.isApproved === true;

  // Prevent body scrolling when profile modal or user notes modal is open
  usePreventScroll(showProfileModal || showUserNotesModal || isMenuOpen || showProfileImagePreview);

  useEffect(() => {
    // Load data when approved staff
    if (isApproved && typeof window !== 'undefined' && user?.id) {
      // Closed properties are those that have been marked as closed/rented by this staff member
      const closed = getClosedPropertiesByStaff(user.id);
      setClosedProperties(closed.length);
      
      // Follow up properties are those that have been pinged by this staff member
      const followUp = getFollowUpPropertiesByStaff(user.id);
      setFollowUpProperties(followUp.length);

      // Load all users (excluding staff and admin)
      const users = getAllUsers();
      setAllUsers(users);
    } else {
      // Reset counts when not approved
      setClosedProperties(0);
      setFollowUpProperties(0);
      setAllUsers([]);
    }
  }, [isApproved, user?.id, getAllUsers]);

  // Listen for follow-up changes
  useEffect(() => {
    if (isApproved && typeof window !== 'undefined' && user?.id) {
      const handleFollowUpChange = () => {
        const followUp = getFollowUpPropertiesByStaff(user.id);
        setFollowUpProperties(followUp.length);
      };

      window.addEventListener('propertyStatusChanged', handleFollowUpChange);
      window.addEventListener('followUpChanged', handleFollowUpChange);
      return () => {
        window.removeEventListener('propertyStatusChanged', handleFollowUpChange);
        window.removeEventListener('followUpChanged', handleFollowUpChange);
      };
    }
  }, [isApproved, user?.id]);

  // Listen for closed properties changes
  useEffect(() => {
    if (isApproved && typeof window !== 'undefined' && user?.id) {
      const handleClosedChange = () => {
        const closed = getClosedPropertiesByStaff(user.id);
        setClosedProperties(closed.length);
      };

      window.addEventListener('propertyStatusChanged', handleClosedChange);
      window.addEventListener('closedChanged', handleClosedChange);
      return () => {
        window.removeEventListener('propertyStatusChanged', handleClosedChange);
        window.removeEventListener('closedChanged', handleClosedChange);
      };
    }
  }, [isApproved, user?.id]);

  useEffect(() => {
    // Detect logout transition
    if (wasAuthenticatedRef.current && !isAuthenticated && !isLoading) {
      setIsLoggingOut(true);
      // Redirect to homepage after brief delay
      setTimeout(() => {
        router.push('/');
      }, 100);
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Detect when impersonation ends - redirect to admin homepage
    if (wasImpersonatingRef.current && !isImpersonating && !isLoading && user?.role === 'admin') {
      // Redirect to admin homepage when impersonation ends
      router.push('/admin');
    }
    wasImpersonatingRef.current = isImpersonating;
  }, [isImpersonating, isLoading, user?.role, router]);

  // Set global state for Layout to know current view mode for SearchPopup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__staffCurrentView = currentView;
      // Set current filters based on active view
      if (currentView === 'users') {
        (window as any).__staffCurrentFilters = userSearchFilters;
      } else {
        (window as any).__staffCurrentFilters = null;
      }
    }
  }, [currentView, userSearchFilters]);

  // Filter users based on search filters
  const filteredUsers = useMemo(() => {
    const users = allUsers.filter(u => u.role !== 'admin' && u.role !== 'staff');
    
    if (!userSearchFilters) {
      return users;
    }

    const normalise = (value?: string) => value?.toLowerCase().trim();

    return users.filter((userItem) => {
      const matchesName = userSearchFilters.name 
        ? normalise(userItem.name)?.includes(normalise(userSearchFilters.name) || '') ||
          normalise(userItem.firstName)?.includes(normalise(userSearchFilters.name) || '') ||
          normalise(userItem.lastName)?.includes(normalise(userSearchFilters.name) || '')
        : true;

      const matchesEmail = userSearchFilters.email
        ? normalise(userItem.email)?.includes(normalise(userSearchFilters.email) || '')
        : true;

      const matchesPhone = userSearchFilters.phone
        ? normalise(userItem.phone)?.includes(normalise(userSearchFilters.phone) || '')
        : true;

      return matchesName && matchesEmail && matchesPhone;
    });
  }, [allUsers, userSearchFilters]);

  const handleUserSearch = (filters: UserSearchFilters) => {
    const hasFilters = Object.values(filters).some((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return Boolean(value);
    });
    setUserSearchFilters(hasFilters ? filters : null);
  };

  // Listen for user search from Layout's SearchPopup
  useEffect(() => {
    const handleStaffUserSearch = (event: Event) => {
      const customEvent = event as CustomEvent<UserSearchFilters>;
      const view = (window as any).__staffCurrentView;
      if (view === 'users') {
        handleUserSearch(customEvent.detail);
      }
    };

    window.addEventListener('staffUserSearch', handleStaffUserSearch as EventListener);
    return () => {
      window.removeEventListener('staffUserSearch', handleStaffUserSearch as EventListener);
    };
  }, []);

  // Check if selected profile user has notes
  useEffect(() => {
    if (selectedProfileUser && typeof window !== 'undefined') {
      const checkUserNotes = () => {
        if (isApproved && isStaff) {
          const notes = getUserNotes(selectedProfileUser.id);
          setHasUserNotes(notes.trim().length > 0);
        } else {
          setHasUserNotes(false);
        }
      };
      checkUserNotes();
      // Listen for user notes changes
      const handleUserNotesChange = () => checkUserNotes();
      window.addEventListener('userNotesChanged', handleUserNotesChange);
      return () => {
        window.removeEventListener('userNotesChanged', handleUserNotesChange);
      };
    } else {
      setHasUserNotes(false);
    }
  }, [selectedProfileUser?.id, isApproved, isStaff]);

  // Detect keyboard visibility for user notes modal
  useEffect(() => {
    if (!showUserNotesModal) {
      setUserNotesKeyboardInset(0);
      return;
    }
    const vv = typeof window !== 'undefined'
      ? (window as Window & { visualViewport?: VisualViewport }).visualViewport
      : undefined;
    if (!vv) return;
    const handleResize = () => {
      const covered = Math.max(0, window.innerHeight - vv.height);
      // Move modal up by 100px when keyboard is visible, return to center when not visible
      setUserNotesKeyboardInset(covered > 0 ? 100 : 0);
    };
    handleResize();
    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, [showUserNotesModal]);

  const renderContent = () => {
    // Wait silently during loading - don't show anything
    if (isLoggingOut || (isLoading && wasAuthenticatedRef.current)) {
      return null;
    }

    // Wait silently for auth to finish loading - don't show anything
    if (isLoading) {
      return null;
    }

    if (!isAuthenticated) {
      return (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-8 text-center">
          <ShieldCheck size={48} className="mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Staff access required</h2>
          <p className="text-gray-600 mb-6">
            Log in with your Rentapp staff credentials to open the internal portal.
          </p>
          <button
            onClick={() => setIsLoginPopupOpen(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            Open login popup
          </button>
        </div>
      );
    }

    if (!isStaff) {
      return (
        <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-8 text-center">
          <ShieldCheck size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Limited permissions</h2>
          <p className="text-gray-600">
            You are signed in as a public user. Staff-only tools will appear here once your
            account has the appropriate access level.
          </p>
        </div>
      );
    }

    // Check if staff is approved
    if (isStaff && !isApproved) {
      return (
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-8 text-center">
          <ShieldCheck size={48} className="mx-auto text-orange-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your staff account registration is pending admin approval. You will be able to access
            staff features and the portal once an administrator approves your account.
          </p>
          <p className="text-sm text-gray-500">
            Please wait for admin approval or contact support if you need urgent access.
          </p>
        </div>
      );
    }

    // For follow-up view, return directly without extra wrappers to match homepage
    if (currentView === 'followup') {
      return (
        <>
          <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Clock size={24} className="text-blue-500" />
              <h2 className="text-2xl font-semibold text-gray-900">Follow Up Properties</h2>
              <p className="text-lg font-medium text-gray-900">[{followUpProperties}]</p>
            </div>
            <div className="space-y-2 sm:space-y-3 lg:space-y-6">
                {followUpProperties > 0 && user?.id ? (
                  getFollowUpPropertiesByStaff(user.id).map((property) => (
                    <PropertyCard key={property.id} property={property} showBookmarkConfirmation={false} showNotesButton={true} />
                  ))
              ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-xl">No follow up properties found.</p>
                <p className="text-gray-400 text-base mt-1">Properties followed by staff members will appear here.</p>
              </div>
              )}
            </div>
          </div>

          {/* Desktop Right Panel - Navigation Menu */}
          <div className="hidden xl:block xl:w-80 xl:min-w-80 bg-white border-l border-gray-200 flex-shrink-0 xl:fixed xl:top-14 xl:right-0 xl:overflow-y-auto xl:z-20" style={{ overflowAnchor: 'none', height: 'calc(100vh - 3.5rem)' }}>
            <div className="p-6">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCurrentView('closed');
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  <Archive size={20} />
                  Closed Properties
                </button>
                <button
                  onClick={() => {
                    setCurrentView('followup');
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-purple-500 text-white hover:bg-purple-600"
                >
                  <Clock size={20} />
                  Follow Up Properties
                </button>
                <button
                  onClick={() => {
                    setCurrentView('users');
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  <Users size={20} />
                  All Users
                </button>
              </div>
            </div>
          </div>

          {/* Floating Action Button - Mobile/Tablet Only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden fixed top-[58%] -translate-y-1/2 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center justify-center z-40 hover:scale-110"
            title="Staff Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menu Popup - Mobile/Tablet Only */}
          {isMenuOpen && (
            <>
              <div
                className="xl:hidden fixed top-[58%] -translate-y-[55px] right-24 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      setCurrentView('closed');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Archive size={20} />
                    Closed Properties
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('followup');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-purple-500 text-white hover:bg-purple-600"
                  >
                    <Clock size={20} />
                    Follow Up Properties
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('users');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Users size={20} />
                    All Users
                  </button>
                </div>
              </div>
              <div
                className="xl:hidden fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
            </>
          )}
        </>
      );
    }

    // For closed view, return directly without extra wrappers to match homepage
    if (currentView === 'closed') {
    return (
        <>
          <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Archive size={24} className="text-blue-500" />
              <h2 className="text-2xl font-semibold text-gray-900">Closed Properties</h2>
              <p className="text-lg font-medium text-gray-900">[{closedProperties}]</p>
            </div>
            <div className="space-y-2 sm:space-y-3 lg:space-y-6">
              {closedProperties > 0 && user?.id ? (
                getClosedPropertiesByStaff(user.id).map((property) => (
                  <PropertyCard key={property.id} property={property} showBookmarkConfirmation={false} showClosedButton={true} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-xl">No closed properties found.</p>
                  <p className="text-gray-400 text-base mt-1">Properties you mark as closed will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Panel - Navigation Menu */}
          <div className="hidden xl:block xl:w-80 xl:min-w-80 bg-white border-l border-gray-200 flex-shrink-0 xl:fixed xl:top-14 xl:right-0 xl:overflow-y-auto xl:z-20" style={{ overflowAnchor: 'none', height: 'calc(100vh - 3.5rem)' }}>
            <div className="p-6">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCurrentView('closed');
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-purple-500 text-white hover:bg-purple-600"
                >
                  <Archive size={20} />
                  Closed Properties
                </button>
                <button
                  onClick={() => {
                    setCurrentView('followup');
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  <Clock size={20} />
                  Follow Up Properties
                </button>
                <button
                  onClick={() => {
                    setCurrentView('users');
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  <Users size={20} />
                  All Users
                </button>
              </div>
            </div>
          </div>

          {/* Floating Action Button - Mobile/Tablet Only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden fixed top-[58%] -translate-y-1/2 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center justify-center z-40 hover:scale-110"
            title="Staff Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menu Popup - Mobile/Tablet Only */}
          {isMenuOpen && (
            <>
              <div
                className="xl:hidden fixed top-[58%] -translate-y-[55px] right-24 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      setCurrentView('closed');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-purple-500 text-white hover:bg-purple-600"
                  >
                    <Archive size={20} />
                    Closed Properties
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('followup');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Clock size={20} />
                    Follow Up Properties
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('users');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Users size={20} />
                    All Users
                  </button>
                </div>
              </div>
              <div
                className="xl:hidden fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
            </>
          )}
        </>
      );
    }

    // For users view
    if (currentView === 'users') {
      const activeSessions = getActiveSessions();
      const onlineUserIds = new Set(activeSessions.map(s => s.userId));
      
      return (
        <>
          <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <Users size={24} className="text-purple-500" />
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-1">
                All Users
              </h3>
              <p className="text-lg font-medium text-gray-900">
                [{userSearchFilters ? `${filteredUsers.length}/${allUsers.filter(u => u.role !== 'admin' && u.role !== 'staff').length}` : allUsers.filter(u => u.role !== 'admin' && u.role !== 'staff').length}]
              </p>
              <span className="text-xl text-gray-600">online [{onlineUserIds.size}]</span>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                {userSearchFilters ? 'No users match your search criteria.' : 'No users found.'}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((userItem) => {
                  const isOnline = onlineUserIds.has(userItem.id);
                  return (
                    <div
                      key={userItem.id}
                      onClick={() => {
                        setSelectedProfileUser(userItem);
                        setShowProfileModal(true);
                      }}
                      className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors p-3 flex items-start gap-3 cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        {userItem.profileImage ? (
                          <Image
                            src={userItem.profileImage}
                            alt={userItem.firstName || userItem.name || 'User'}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewProfileImage(userItem.profileImage || '');
                              setShowProfileImagePreview(true);
                            }}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              setPreviewProfileImage(userItem.profileImage || '');
                              setShowProfileImagePreview(true);
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
                            <UserIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h4 className="font-semibold text-gray-900">
                            {userItem.firstName || userItem.name || 'Unknown'}
                          </h4>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1.5">
                              Member
                              {isOnline && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-0.5 flex-shrink-0"></span>}
                            </span>
                            {(() => {
                              if (typeof window !== 'undefined') {
                                const notes = getUserNotes(userItem.id);
                                return notes.trim().length > 0;
                              }
                              return false;
                            })() && (
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}></span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{userItem.email}</p>
                        {userItem.phone && (
                          <p className="text-sm text-gray-600">{userItem.phone}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Right Panel - Navigation Menu */}
          <div className="hidden xl:block xl:w-80 xl:min-w-80 bg-white border-l border-gray-200 flex-shrink-0 xl:fixed xl:top-14 xl:right-0 xl:overflow-y-auto xl:z-20" style={{ overflowAnchor: 'none', height: 'calc(100vh - 3.5rem)' }}>
            <div className="p-6">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCurrentView('closed');
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  <Archive size={20} />
                  Closed Properties
                </button>
                <button
                  onClick={() => {
                    setCurrentView('followup');
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  <Clock size={20} />
                  Follow Up Properties
                </button>
                <button
                  onClick={() => {
                    setCurrentView('users');
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-purple-500 text-white hover:bg-purple-600"
                >
                  <Users size={20} />
                  All Users
                </button>
              </div>
            </div>
          </div>

          {/* Floating Action Button - Mobile/Tablet Only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden fixed top-[58%] -translate-y-1/2 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center justify-center z-40 hover:scale-110"
            title="Staff Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menu Popup - Mobile/Tablet Only */}
          {isMenuOpen && (
            <>
              <div
                className="xl:hidden fixed top-[58%] -translate-y-[55px] right-24 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      setCurrentView('closed');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Archive size={20} />
                    Closed Properties
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('followup');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Clock size={20} />
                    Follow Up Properties
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('users');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left bg-purple-500 text-white hover:bg-purple-600"
                  >
                    <Users size={20} />
                    All Users
                  </button>
                </div>
              </div>
              <div
                className="xl:hidden fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
            </>
          )}
        </>
      );
    }

    return (
      <div className="space-y-6 relative">
        {/* Desktop Right Panel - Navigation Menu */}
        <div className="hidden xl:block xl:w-80 xl:min-w-80 bg-white border-l border-gray-200 flex-shrink-0 xl:fixed xl:top-14 xl:right-0 xl:overflow-y-auto xl:z-20" style={{ overflowAnchor: 'none', height: 'calc(100vh - 3.5rem)' }}>
          <div className="p-6">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setCurrentView('closed');
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                  currentView === 'closed'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Archive size={20} />
                Closed Properties
              </button>
              <button
                onClick={() => {
                  setCurrentView('followup');
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                  currentView === 'followup'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock size={20} />
                Follow Up Properties
              </button>
              <button
                onClick={() => {
                  setCurrentView('users');
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                  currentView === 'users'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={20} />
                All Users
              </button>
            </div>
          </div>
              </div>

        {/* Floating Action Button - Mobile/Tablet Only */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="xl:hidden fixed top-[58%] -translate-y-1/2 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center justify-center z-40 hover:scale-110"
          title="Staff Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu Popup - Mobile/Tablet Only */}
        {isMenuOpen && (
          <>
            <div
              className="xl:hidden fixed top-[58%] -translate-y-[55px] right-24 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    setCurrentView('closed');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                    currentView === 'closed'
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Archive size={20} />
                  Closed Properties
                </button>
                <button
                  onClick={() => {
                    setCurrentView('followup');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                    currentView === 'followup'
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Clock size={20} />
                  Follow Up Properties
                </button>
                <button
                  onClick={() => {
                    setCurrentView('users');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                    currentView === 'users'
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} />
                  All Users
                </button>
              </div>
            </div>
            <div
              className="xl:hidden fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
          </>
        )}
      </div>
    );
  };

  const content = renderContent();
  const isFollowUpView = currentView === 'followup';
  const isClosedView = currentView === 'closed';
  const isUsersView = currentView === 'users';

  return (
    <Layout 
      hasActiveFilters={isUsersView && userSearchFilters !== null}
    >
      {(isFollowUpView || isClosedView || isUsersView) ? (
        content
      ) : (
      <div className="bg-gray-50 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">{content}</div>
      </div>
      )}

      <LoginPopup isOpen={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />

      {/* Profile Modal */}
      {showProfileModal && selectedProfileUser && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProfileModal(false);
              setSelectedProfileUser(null);
            }
          }}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-center pt-4 pb-2 px-4 bg-white sticky top-0 z-10 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-black">User Profile</h3>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="flex justify-center">
                  {selectedProfileUser.profileImage ? (
                    <img
                      src={selectedProfileUser.profileImage}
                      alt={selectedProfileUser.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 cursor-pointer"
                      onClick={() => {
                        setPreviewProfileImage(selectedProfileUser.profileImage || '');
                        setShowProfileImagePreview(true);
                      }}
                      onTouchEnd={() => {
                        setPreviewProfileImage(selectedProfileUser.profileImage || '');
                        setShowProfileImagePreview(true);
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-blue-500">
                      <UserIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
                      {selectedProfileUser.firstName || selectedProfileUser.name?.split(' ')[0] || 'Not provided'}
                      {selectedProfileUser.lastName && ` ${selectedProfileUser.lastName}`}
                      {!selectedProfileUser.firstName && !selectedProfileUser.lastName && selectedProfileUser.name && ` ${selectedProfileUser.name.split(' ').slice(1).join(' ')}`}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
                      {selectedProfileUser.email || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
                      {selectedProfileUser.phone || 'Not provided'}
                    </div>
                  </div>

                  {selectedProfileUser.bio && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300 min-h-[60px]">
                        {selectedProfileUser.bio}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (selectedProfileUser) {
                    // Load user notes
                    const notes = getUserNotes(selectedProfileUser.id);
                    setUserNotes(notes);
                    setIsUserNotesEditable(false);
                    // Don't close the profile modal
                    setShowUserNotesModal(true);
                  }
                }}
                className="w-full px-4 py-3 rounded-lg font-medium text-white transition-colors relative flex items-center justify-center"
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.9)',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                {hasUserNotes && (
                  <span className="absolute left-2 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}></span>
                )}
                <span>User notes (Behaviour)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Notes Modal - Staff Only */}
      {showUserNotesModal && selectedProfileUser && isApproved && isStaff && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <div
            className="bg-white rounded-xl px-4 py-2 sm:px-6 sm:pt-1 sm:pb-14 md:pb-4 max-w-sm md:max-w-[414px] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: userNotesKeyboardInset > 0 ? `translateY(-${userNotesKeyboardInset}px)` : 'translateY(0)',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div className="flex justify-between items-center mb-3 relative pt-1">
              <h3 className="text-xl font-semibold text-black flex-1 text-center">
                User notes (Behaviour)
              </h3>
            </div>
            
            <textarea
              className={`w-full px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isUserNotesEditable ? 'bg-gray-50 cursor-pointer' : ''}`}
              placeholder={isUserNotesEditable ? "Add notes about this user's behaviour..." : "Double-click to edit/add notes..."}
              rows={6}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              readOnly={!isUserNotesEditable}
              onDoubleClick={(e) => {
                e.preventDefault();
                if (isApproved && isStaff) {
                  setIsUserNotesEditable(true);
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      const textarea = e.currentTarget as HTMLTextAreaElement;
                      if (textarea) {
                        textarea.removeAttribute('readonly');
                        textarea.focus();
                        const length = textarea.value.length;
                        textarea.setSelectionRange(length, length);
                      }
                    }, 0);
                  });
                }
              }}
              onTouchStart={(e) => {
                if (!isUserNotesEditable && isApproved && isStaff) {
                  const target = e.currentTarget;
                  const now = Date.now();
                  const lastTap = (target as any).lastTap || 0;
                  
                  if (now - lastTap < 300) {
                    e.preventDefault();
                    setIsUserNotesEditable(true);
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        target.removeAttribute('readonly');
                        target.focus();
                        const length = target.value.length;
                        target.setSelectionRange(length, length);
                      }, 0);
                    });
                  }
                  (target as any).lastTap = now;
                }
              }}
            />

            <div className="flex gap-2 mt-1.5">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && selectedProfileUser && isApproved && isStaff) {
                    saveUserNotes(selectedProfileUser.id, userNotes);
                  }
                  setIsUserNotesEditable(false);
                  setShowUserNotesModal(false);
                  // Reopen profile modal
                  if (selectedProfileUser) {
                    setShowProfileModal(true);
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white select-none"
                style={{ 
                  backgroundColor: 'rgba(34, 197, 94, 0.9)',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsUserNotesEditable(false);
                  setShowUserNotesModal(false);
                  setUserNotes('');
                  // Reopen profile modal
                  if (selectedProfileUser) {
                    setShowProfileModal(true);
                  }
                }}
                className="px-4 py-2 rounded-lg font-medium text-white select-none flex-1"
                style={{ 
                  backgroundColor: '#ef4444',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Image Preview */}
      {showProfileImagePreview && previewProfileImage && (
        <ImageLightbox
          images={[previewProfileImage]}
          currentIndex={0}
          onClose={() => setShowProfileImagePreview(false)}
          onImageChange={() => {}}
          rounded={true}
        />
      )}
    </Layout>
  );
}
