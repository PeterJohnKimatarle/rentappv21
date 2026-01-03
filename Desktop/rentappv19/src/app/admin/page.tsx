'use client';

import Layout from '@/components/Layout';
import LoginPopup from '@/components/LoginPopup';
import PropertyCard from '@/components/PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Users, Settings, UserCheck, Check, Menu, X, ChevronRight, LogIn, User as UserIcon, MoreVertical, Archive, Clock, UserCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAllProperties, getClosedProperties, getFollowUpProperties, DisplayProperty } from '@/utils/propertyUtils';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { isStaffEnrollmentEnabled, toggleStaffEnrollment } from '@/utils/adminSettings';
import { getActiveSessions, getOnlineUserCount } from '@/utils/sessionTracking';
import { getGuestUsers, getGuestUserCount, getActiveGuestCount } from '@/utils/guestTracking';

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
}

type ViewType = 'staff' | 'users' | 'guests' | 'settings' | 'closed' | 'followup';

// Delete Confirmation Popup Component
function DeleteConfirmPopup({ 
  onConfirm, 
  onCancel,
  userName,
  userType
}: { 
  onConfirm: () => void; 
  onCancel: () => void;
  userName: string;
  userType: 'staff' | 'user';
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onCancel();
    }, 60000);

    return () => {
      clearTimeout(timer);
    };
  }, [onCancel]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        const modal = target.closest('.bg-white.rounded-xl');
        // Close if clicking outside the modal
        if (!modal) {
          onCancel();
        }
      }}
      onTouchEnd={(e) => {
        const target = e.target as HTMLElement;
        const modal = target.closest('.bg-white.rounded-xl');
        // Close if touching outside the modal
        if (!modal) {
          onCancel();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl max-w-sm w-full max-h-[45vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center pt-3 pb-0 px-4 bg-white sticky top-0 z-10">
          <h3 className="text-2xl font-semibold text-black">Delete {userType === 'staff' ? 'Staff' : 'User'}</h3>
          </div>

        {/* Content */}
        <div className="p-4 pt-2 overflow-y-auto flex-1">
          <div className="text-center mb-4">
            <p className="text-gray-700 text-base">Are you sure you want to delete {userName}?</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
          >
            No
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated, user, getAllStaff, getAllUsers, approveStaff, disapproveStaff, deleteUser, loginAs, isLoading, isImpersonating } = useAuth();
  const router = useRouter();
  const wasAuthenticatedRef = useRef(isAuthenticated);
  const isAdmin = user?.role === 'admin';
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('staff');
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [totalProperties, setTotalProperties] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openStaffDropdown, setOpenStaffDropdown] = useState<string | null>(null);
  const [openUserDropdown, setOpenUserDropdown] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; type: 'staff' | 'user' } | null>(null);
  const [isLoggingAs, setIsLoggingAs] = useState(false);
  const [closedProperties, setClosedProperties] = useState<DisplayProperty[]>([]);
  const [followUpProperties, setFollowUpProperties] = useState<DisplayProperty[]>([]);
  const [staffEnrollmentEnabled, setStaffEnrollmentEnabled] = useState(false);
  const [guestUsers, setGuestUsers] = useState<Array<{ id: string; firstVisit: number; lastVisit: number; isActive: boolean }>>([]);

  // Prevent body scroll when delete confirmation popup or mobile menu is open
  usePreventScroll(deleteConfirm !== null || isLoginPopupOpen || isMenuOpen);

  // Document-level outside-click detection for admin menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleOutsideClick = (event: Event) => {
      const target = event.target as Element;

      // Protect the menu container
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }

      // Protect the floating button
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }

      // Close menu if clicked outside both menu and button
      setIsMenuOpen(false);
    };

    // Use pointerdown for better cross-platform support
    document.addEventListener('pointerdown', handleOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    // Load staff enrollment status
    if (isAdmin && typeof window !== 'undefined') {
      setStaffEnrollmentEnabled(isStaffEnrollmentEnabled());
    }
  }, [isAdmin]);

  useEffect(() => {
    // Load total properties count
    if (isAdmin && typeof window !== 'undefined') {
      const properties = getAllProperties();
      setTotalProperties(properties.length);
    }
  }, [isAdmin]);

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
    if (isAdmin) {
      loadStaff();
      loadAllUsers();
      loadClosedProperties();
      loadFollowUpProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    // Listen for changes to closed and follow-up properties
    if (isAdmin && typeof window !== 'undefined') {
      const handleStatusChange = () => {
        loadClosedProperties();
        loadFollowUpProperties();
      };
      const handleClosedChange = () => {
        loadClosedProperties();
      };
      const handleFollowUpChange = () => {
        loadFollowUpProperties();
      };

      window.addEventListener('propertyStatusChanged', handleStatusChange);
      window.addEventListener('closedChanged', handleClosedChange);
      window.addEventListener('followUpChanged', handleFollowUpChange);

      return () => {
        window.removeEventListener('propertyStatusChanged', handleStatusChange);
        window.removeEventListener('closedChanged', handleClosedChange);
        window.removeEventListener('followUpChanged', handleFollowUpChange);
      };
    }
  }, [isAdmin]);

  // Load guest users and update periodically
  useEffect(() => {
    if (isAdmin && typeof window !== 'undefined') {
      const loadGuestUsers = () => {
        const guests = getGuestUsers();
        setGuestUsers(guests);
      };
      
      // Load immediately
      loadGuestUsers();
      
      // Update every 5 seconds
      const interval = setInterval(() => {
        loadGuestUsers();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const loadClosedProperties = () => {
    if (typeof window !== 'undefined') {
      // Get closed properties from shared status storage
      const closedPropertiesList = getClosedProperties();
      setClosedProperties(closedPropertiesList);
    }
  };

  const loadFollowUpProperties = () => {
    if (typeof window !== 'undefined') {
      // Get follow-up properties from shared status storage
      // (getFollowUpProperties already excludes closed properties)
      const followUpPropertiesList = getFollowUpProperties();
      setFollowUpProperties(followUpPropertiesList);
    }
  };

  const loadStaff = () => {
    const staff = getAllStaff();
    setStaffMembers(staff);
  };

  const loadAllUsers = () => {
    const users = getAllUsers();
    setAllUsers(users);
  };

  const handleApprove = async (staffId: string) => {
    setLoading(true);
    const result = await approveStaff(staffId);
    if (result.success) {
      loadStaff();
    }
    setLoading(false);
  };

  const handleDisapprove = async (staffId: string) => {
    setLoading(true);
    const result = await disapproveStaff(staffId);
    if (result.success) {
      loadStaff();
    }
    setLoading(false);
  };

  const handleDelete = async (userId: string, userName: string, userType: 'staff' | 'user' = 'staff') => {
    setLoading(true);
    setMessage(null);
    const result = await deleteUser(userId);
    if (result.success) {
      setMessage({ type: 'success', text: `${userType === 'staff' ? 'Staff member' : 'User'} deleted successfully!` });
      if (userType === 'staff') {
        loadStaff();
      } else {
        loadAllUsers();
      }
    } else {
      setMessage({ type: 'error', text: result.message || `Failed to delete ${userType === 'staff' ? 'staff member' : 'user'}.` });
    }
    setLoading(false);
    setTimeout(() => setMessage(null), 1500);
    setDeleteConfirm(null);
  };

  const handleLoginAs = async (userId: string) => {
    setIsLoggingAs(true);
    setLoading(true);
    setMessage(null);
    const result = await loginAs(userId);
    if (result.success) {
      // Redirect to homepage after successful login as
      router.push('/');
    } else {
      setIsLoggingAs(false);
      setMessage({ type: 'error', text: result.message || 'Failed to log in as user.' });
      setLoading(false);
      setTimeout(() => setMessage(null), 1500);
    }
  };

  const renderContent = () => {
    // Wait silently during loading - don't show anything
    if (isLoggingOut || (isLoading && wasAuthenticatedRef.current)) {
      return null;
    }

    // Wait silently during "login as" transition - don't show anything
    if (isLoggingAs) {
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Admin access required</h2>
          <p className="text-gray-600 mb-6">
            Log in with your Rentapp admin credentials to access the admin portal.
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

    if (!isAdmin && !isLoggingAs) {
      return (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 text-center">
          <ShieldCheck size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            This area is restricted to administrators only. You do not have permission to access this page.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Desktop Right Panel - Navigation Menu */}
        <div className="hidden xl:block xl:w-80 xl:min-w-80 bg-white border-l border-gray-200 flex-shrink-0 xl:fixed xl:top-14 xl:right-0 xl:overflow-y-auto xl:z-20" style={{ overflowAnchor: 'none', height: 'calc(100vh - 3.5rem)' }}>
          <div className="p-6">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setCurrentView('staff');
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                  currentView === 'staff'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCheck size={20} />
                All Staff
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
              <button
                onClick={() => {
                  setCurrentView('guests');
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                  currentView === 'guests'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCircle size={20} />
                Guest Users
              </button>
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
                All Closed
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
                All Follow-ups
              </button>
              <button
                onClick={() => {
                  setCurrentView('settings');
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                  currentView === 'settings'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings size={20} />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Views */}
      <div className="space-y-6 relative">

        {/* All Staff View */}
        {currentView === 'staff' && (() => {
          const activeSessions = getActiveSessions();
          const onlineUserIds = new Set(activeSessions.map(s => s.userId));
          
          return (
          <>
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <UserCheck size={24} className="text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-1">
              All Staff
              {isImpersonating && (
                <span className="w-2 h-2 bg-red-500 rounded-full mt-0.5"></span>
              )}
            </h3>
            <p className="text-lg font-medium text-gray-900">[{staffMembers.length}]</p>
            <span className="text-xl text-gray-600">online [{staffMembers.filter(s => onlineUserIds.has(s.id)).length}]</span>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {staffMembers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No staff members found.</p>
          ) : (
            <div className="space-y-4">
              {staffMembers.map((staff) => {
                const isOnline = onlineUserIds.has(staff.id);
                return (
                <div
                  key={staff.id}
                  className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
                >
                  {/* Clickable delete area from left edge to avatar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDeleteConfirm({ id: staff.id, name: staff.firstName || staff.name || 'this staff member', type: 'staff' });
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                        className="absolute top-0 left-0 h-[64px] w-9 cursor-pointer z-20 rounded-tl-lg hover:bg-red-200 transition-colors"
                    title="Delete staff"
                  >
                    {/* Three dot menu in top left */}
                        <div className="absolute top-0 left-0 h-[64px] w-9 text-gray-700 rounded-tl-lg flex items-center justify-center transition-colors hover:bg-red-200">
                      <MoreVertical size={20} />
                    </div>
                  </button>
                  {/* Non-clickable area below delete button */}
                      <div className="absolute top-[64px] left-0 w-9 bottom-0 pointer-events-none z-10"></div>
                  <div 
                        className="p-3 flex items-start justify-between gap-4 flex-wrap pl-9 cursor-pointer relative"
                    onClick={(e) => {
                      // Don't open dropdown if click is on the delete area or the non-clickable zone
                      const target = e.target as HTMLElement;
                      if (target.closest('button[title="Delete staff"]')) {
                        return;
                      }
                      // Check if click is in the left non-clickable area (between delete button and avatar)
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      if (clickX < 48) { // 48px = w-12 (12 * 4px)
                        return;
                      }
                      setOpenStaffDropdown(openStaffDropdown === staff.id ? null : staff.id);
                    }}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        {staff.profileImage ? (
                          <img
                            src={staff.profileImage}
                            alt={staff.firstName || staff.name || 'Staff member'}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
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
                            {staff.firstName || staff.name || 'Unknown'}
                          </h4>
                          {staff.isApproved ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
                              Approved
                              {isOnline && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-0.5 flex-shrink-0"></span>}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
                              Pending
                              {isOnline && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-0.5 flex-shrink-0"></span>}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{staff.email}</p>
                        {staff.phone && (
                          <p className="text-sm text-gray-600">{staff.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center relative">
                      <ChevronRight 
                        size={20} 
                        className={`text-gray-500 transition-transform duration-200 ${openStaffDropdown === staff.id ? 'rotate-90' : ''}`}
                      />
                      {openStaffDropdown === staff.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenStaffDropdown(null)} />
                          <div className="absolute top-0 right-0 mr-2 bg-blue-50 border border-blue-500 border-2 shadow-blue-100 rounded-lg px-4 py-2 space-y-1.5 flex flex-col items-center w-fit z-20 transform -translate-x-[20%]">
                      {!staff.isApproved ? (
                        <button
                          onClick={() => {
                            handleApprove(staff.id);
                            setOpenStaffDropdown(null);
                          }}
                          disabled={loading}
                          className="w-full px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap"
                        >
                          <Check size={16} />
                          Approve Staff
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleDisapprove(staff.id);
                            setOpenStaffDropdown(null);
                          }}
                          disabled={loading}
                          className="w-full px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap"
                        >
                          <X size={16} />
                          Disapprove Staff
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setOpenStaffDropdown(null);
                          handleLoginAs(staff.id);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap"
                      >
                        <LogIn size={16} />
                        Login as
                      </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </>
          );
        })()}

        {/* All Users View */}
        {currentView === 'users' && (() => {
          const activeSessions = getActiveSessions();
          const onlineUserIds = new Set(activeSessions.map(s => s.userId));
          
          return (
          <>
          {/* Total Users Heading */}
          <div className="mb-6 sticky top-14 z-10">
            <div className="flex items-center justify-center gap-2 flex-wrap bg-blue-500 px-4 py-3 rounded-lg">
              <h4 className="text-xl font-semibold text-white">Total Users</h4>
              <p className="text-lg font-medium text-white">[{allUsers.filter(u => u.role !== 'admin' && u.role !== 'staff').length + getGuestUserCount()}]</p>
              <span className="text-xl text-white">online [{onlineUserIds.size + getActiveGuestCount()}]</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Users size={24} className="text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-1">
              All Users
              {isImpersonating && (
                <span className="w-2 h-2 bg-red-500 rounded-full mt-0.5"></span>
              )}
            </h3>
            <p className="text-lg font-medium text-gray-900">[{allUsers.filter(u => u.role !== 'admin' && u.role !== 'staff').length}]</p>
            <span className="text-xl text-gray-600">online [{getOnlineUserCount()}]</span>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {allUsers.filter(u => u.role !== 'admin' && u.role !== 'staff').length === 0 ? (
            <p className="text-gray-600 text-center py-8">No users found.</p>
          ) : (
            <div className="space-y-4">
              {allUsers.filter(u => u.role !== 'admin' && u.role !== 'staff').map((userItem) => {
                const isOnline = onlineUserIds.has(userItem.id);
                return (
                <div
                  key={userItem.id}
                  className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
                >
                  {/* Clickable delete area from left edge to avatar */}
                  {userItem.id !== user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteConfirm({ id: userItem.id, name: userItem.firstName || userItem.name || 'this user', type: 'user' });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute top-0 left-0 h-[64px] w-9 cursor-pointer z-20 rounded-tl-lg hover:bg-red-200 transition-colors"
                      title="Delete user"
                    >
                      {/* Three dot menu in top left */}
                      <div className="absolute top-0 left-0 h-[64px] w-9 text-gray-700 rounded-tl-lg flex items-center justify-center transition-colors hover:bg-red-200">
                        <MoreVertical size={20} />
                      </div>
                    </button>
                  )}
                  {/* Non-clickable area below delete button */}
                  {userItem.id !== user?.id && (
                    <div className="absolute top-[64px] left-0 w-9 bottom-0 pointer-events-none z-10"></div>
                  )}
                  <div 
                    className={`p-3 flex items-start justify-between gap-4 flex-wrap ${userItem.id !== user?.id ? 'cursor-pointer pl-9' : 'pl-3'} relative`}
                    onClick={(e) => {
                      if (userItem.id !== user?.id) {
                        // Don't open dropdown if click is on the delete area or the non-clickable zone
                        const target = e.target as HTMLElement;
                        if (target.closest('button[title="Delete user"]')) {
                          return;
                        }
                        // Check if click is in the left non-clickable area (between delete button and avatar)
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        if (clickX < 48) { // 48px = w-12 (12 * 4px)
                          return;
                        }
                        setOpenUserDropdown(openUserDropdown === userItem.id ? null : userItem.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        {userItem.profileImage ? (
                          <Image
                            src={userItem.profileImage}
                            alt={userItem.firstName || userItem.name || 'User'}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
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
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1.5">
                            Member
                            {isOnline && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-0.5 flex-shrink-0"></span>}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{userItem.email}</p>
                        {userItem.phone && (
                          <p className="text-sm text-gray-600">{userItem.phone}</p>
                        )}
                      </div>
                    </div>
                    {userItem.id !== user?.id && (
                      <div className="flex items-center relative">
                        <ChevronRight 
                          size={20} 
                          className={`text-gray-500 transition-transform duration-200 ${openUserDropdown === userItem.id ? 'rotate-90' : ''}`}
                        />
                        {openUserDropdown === userItem.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenUserDropdown(null)} />
                            <div className="absolute top-0 right-0 mr-2 bg-blue-50 border border-blue-500 border-2 shadow-blue-100 rounded-lg px-4 py-2 space-y-1.5 flex flex-col items-center w-fit z-20 transform -translate-x-[20%]">
                      <button
                        onClick={() => {
                          setOpenUserDropdown(null);
                          handleLoginAs(userItem.id);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap"
                      >
                        <LogIn size={16} />
                        Login as
                      </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </>
          );
        })()}

        {/* Guest Users View */}
        {currentView === 'guests' && (
        <>
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <UserCircle size={24} className="text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-1">
              Guest Users
              {isImpersonating && (
                <span className="w-2 h-2 bg-red-500 rounded-full mt-0.5"></span>
              )}
            </h3>
            <p className="text-lg font-medium text-gray-900">[{guestUsers.length}]</p>
            <span className="text-xl text-gray-600">active [{guestUsers.filter(g => g.isActive).length}]</span>
          </div>

          {guestUsers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No guest users found.</p>
          ) : (
            <div className="space-y-3">
              {guestUsers.map((guest, index) => (
                <div key={guest.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">{index + 1}.</span>
                      <span className="text-gray-900 font-medium">Guest User</span>
                      {guest.isActive && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      {guest.isActive ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-gray-500">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
        )}

        {/* All Closed Properties View */}
        {currentView === 'closed' && (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Archive size={24} className="text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-900">All Closed Properties</h3>
            <p className="text-lg font-medium text-gray-900">[{closedProperties.length}]</p>
          </div>
          
          <div className="space-y-2 sm:space-y-3 lg:space-y-6">
            {closedProperties.length > 0 ? (
              closedProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  showClosedButton={true}
                  showBookmarkConfirmation={false}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-xl">No closed properties found.</p>
                <p className="text-gray-400 text-base mt-1">Check back later.</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* All Follow-up Properties View */}
        {currentView === 'followup' && (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Clock size={24} className="text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-900">All Follow-up Properties</h3>
            <p className="text-lg font-medium text-gray-900">[{followUpProperties.length}]</p>
          </div>
          
          <div className="space-y-2 sm:space-y-3 lg:space-y-6">
            {followUpProperties.length > 0 ? (
              followUpProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  showNotesButton={true}
                  showBookmarkConfirmation={false}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-xl">No follow-up properties found.</p>
                <p className="text-gray-400 text-base mt-1">Properties followed by staff members will appear here.</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Settings size={24} className="text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-900">Platform Settings</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h5 className="text-base font-semibold text-gray-900 mb-1">Staff Enrollment</h5>
                  <p className="text-sm text-gray-600">Allow users to register as staff members</p>
                </div>
                  <button
                    onClick={() => {
                      const newStatus = toggleStaffEnrollment();
                      setStaffEnrollmentEnabled(newStatus);
                      setMessage({
                        type: 'success',
                        text: newStatus ? 'Staff enrollment enabled' : 'Staff enrollment disabled'
                      });
                      setTimeout(() => setMessage(null), 3000);
                    }}
                    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-0 items-center ${
                      staffEnrollmentEnabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        staffEnrollmentEnabled ? 'translate-x-[21px]' : 'translate-x-1'
                      }`}
                    />
                  </button>
              </div>
            </div>
          </div>
        </div>
        )}
        </div>

        {/* Floating Action Button - Mobile/Tablet Only */}
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="xl:hidden fixed top-[58%] -translate-y-1/2 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center justify-center z-40 hover:scale-110"
          title="Admin Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu Popup - Mobile/Tablet Only */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="xl:hidden fixed top-[58%] -translate-y-[115px] right-24 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden"
          >
            <div className="p-2">
              <button
                onClick={() => {
                  setCurrentView('staff');
                  setIsMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left ${
                  currentView === 'staff'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCheck size={20} />
                All Staff
              </button>
              <button
                onClick={() => {
                  setCurrentView('users');
                  setIsMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left mt-2 ${
                  currentView === 'users'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={20} />
                All Users
              </button>
              <button
                onClick={() => {
                  setCurrentView('guests');
                  setIsMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left mt-2 ${
                  currentView === 'guests'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCircle size={20} />
                Guest Users
              </button>
              <button
                onClick={() => {
                  setCurrentView('closed');
                  setIsMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left mt-2 ${
                  currentView === 'closed'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Archive size={20} />
                All Closed
              </button>
              <button
                onClick={() => {
                  setCurrentView('followup');
                  setIsMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left mt-2 ${
                  currentView === 'followup'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock size={20} />
                All Follow-ups
              </button>
              <button
                onClick={() => {
                  setCurrentView('settings');
                  setIsMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-left mt-2 ${
                  currentView === 'settings'
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings size={20} />
                Settings
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Layout totalCount={totalProperties}>
      <div className={`${currentView === 'closed' || currentView === 'followup' ? '' : 'bg-gray-50'} pt-4 pb-8`}>
        <div className={`${currentView === 'closed' || currentView === 'followup' ? '' : 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'}`}>{renderContent()}</div>
      </div>

      <LoginPopup isOpen={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />

      {/* Delete Confirmation Popup */}
      {deleteConfirm && (
        <DeleteConfirmPopup
          userName={deleteConfirm.name}
          userType={deleteConfirm.type}
          onConfirm={() => {
            handleDelete(deleteConfirm.id, deleteConfirm.name, deleteConfirm.type);
          }}
          onCancel={() => {
            setDeleteConfirm(null);
          }}
        />
      )}
    </Layout>
  );
}
