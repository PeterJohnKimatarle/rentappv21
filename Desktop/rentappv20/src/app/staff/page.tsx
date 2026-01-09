'use client';

import Layout from '@/components/Layout';
import LoginPopup from '@/components/LoginPopup';
import PropertyCard from '@/components/PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Archive, Clock, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getFollowUpPropertiesByStaff, getClosedPropertiesByStaff } from '@/utils/propertyUtils';

type ViewType = 'closed' | 'followup';

export default function StaffPortalPage() {
  const { isAuthenticated, user, isLoading, isImpersonating } = useAuth();
  const router = useRouter();
  const wasAuthenticatedRef = useRef(isAuthenticated);
  const wasImpersonatingRef = useRef(isImpersonating);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('closed');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [closedProperties, setClosedProperties] = useState(0);
  const [followUpProperties, setFollowUpProperties] = useState(0);

  const isStaff = user?.role === 'staff';
  const isApproved = user?.isApproved === true;

  useEffect(() => {
    // Load data when approved staff
    if (isApproved && typeof window !== 'undefined' && user?.id) {
      // Closed properties are those that have been marked as closed/rented by this staff member
      const closed = getClosedPropertiesByStaff(user.id);
      setClosedProperties(closed.length);
      
      // Follow up properties are those that have been pinged by this staff member
      const followUp = getFollowUpPropertiesByStaff(user.id);
      setFollowUpProperties(followUp.length);
    } else {
      // Reset counts when not approved
      setClosedProperties(0);
      setFollowUpProperties(0);
    }
  }, [isApproved, user?.id]);

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
              </div>
            </div>
          </div>

          {/* Floating Action Button - Mobile/Tablet Only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden fixed top-[58%] -translate-y-1/2 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center justify-center z-[60] hover:scale-110"
            title="Staff Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menu Popup - Mobile/Tablet Only */}
          {isMenuOpen && (
            <>
              <div
                className="xl:hidden fixed top-[58%] -translate-y-[55px] right-24 bg-white border border-gray-200 rounded-xl shadow-2xl z-[70] min-w-[200px] overflow-hidden"
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
                </div>
              </div>
              <div
                className="xl:hidden fixed inset-0 z-[65]"
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
              </div>
            </div>
          </div>

          {/* Floating Action Button - Mobile/Tablet Only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden fixed top-[58%] -translate-y-1/2 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center justify-center z-[60] hover:scale-110"
            title="Staff Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menu Popup - Mobile/Tablet Only */}
          {isMenuOpen && (
            <>
              <div
                className="xl:hidden fixed top-[58%] -translate-y-[55px] right-24 bg-white border border-gray-200 rounded-xl shadow-2xl z-[70] min-w-[200px] overflow-hidden"
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
                </div>
              </div>
              <div
                className="xl:hidden fixed inset-0 z-[65]"
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
            </div>
          </div>
              </div>

        {/* Floating Action Button - Mobile/Tablet Only */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="xl:hidden fixed top-[58%] -translate-y-1/2 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center justify-center z-[60] hover:scale-110"
          title="Staff Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu Popup - Mobile/Tablet Only */}
        {isMenuOpen && (
          <>
            <div
              className="xl:hidden fixed top-[58%] -translate-y-[55px] right-24 bg-white border border-gray-200 rounded-xl shadow-2xl z-[70] min-w-[200px] overflow-hidden"
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
              </div>
            </div>
            <div
              className="xl:hidden fixed inset-0 z-[65]"
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

  return (
    <Layout>
      {(isFollowUpView || isClosedView) ? (
        content
      ) : (
      <div className="bg-gray-50 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">{content}</div>
      </div>
      )}

      <LoginPopup isOpen={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />
    </Layout>
  );
}
