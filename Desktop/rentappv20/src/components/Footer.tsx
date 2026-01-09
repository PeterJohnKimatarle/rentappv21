'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { usePathname, useRouter } from 'next/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isGestureInfoOpen, setIsGestureInfoOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isRemovedBookmarksPage = pathname === '/recently-removed-bookmarks';
  const isBookmarksPage = pathname === '/bookmarks';

  // Lock background scroll when gesture info popup is open
  usePreventScroll(isGestureInfoOpen);

  return (
    <>
      <footer className="bg-white border-t border-gray-200 py-2 relative">
        <div className="max-w-7xl mx-auto px-4">
          {/* Mobile: Original layout - only for very small devices (smartphones) */}
          <div className="lg:hidden">
            <p className="text-sm text-gray-600 text-center">© {currentYear} Rentapp Limited</p>
            <p className="text-sm text-gray-600 mt-0 text-center">All Rights Reserved.</p>
          </div>

          {/* Tablet and Desktop: Combined layout */}
          <div className="hidden lg:block text-center">
            <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-gray-600">© {currentYear} Rentapp Limited - Tanzania&apos;s #1 Renting Platform</p>
              {/* Info Icon - Center (only on removed bookmarks page and bookmarks page) */}
              {(isRemovedBookmarksPage || isBookmarksPage) && (
                <button
                  onClick={() => setIsGestureInfoOpen(true)}
                  className="p-2 text-blue-500 hover:bg-gray-300 rounded transition-all cursor-pointer"
                  aria-label="Important notice"
                >
                  <Info size={22} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-0.5">All Rights Reserved. Contact: 0755-123-500</p>
          </div>
        </div>

        {/* Info Icon - Positioned absolutely in the bottom right */}
        <button
          onClick={() => setIsGestureInfoOpen(true)}
          className="absolute bottom-2 right-4 p-2 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
          aria-label="Gesture help"
        >
          <Info size={24} />
        </button>
      </footer>

      {/* Gesture Info Popup */}
      {isGestureInfoOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ touchAction: 'none', minHeight: '100vh', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setIsGestureInfoOpen(false)}
        >
          <div 
            className={`rounded-xl max-w-80 w-full ${(isRemovedBookmarksPage || isBookmarksPage) ? 'pt-3 pb-4 px-6' : 'py-6 px-6'} shadow-2xl overflow-hidden mx-auto ${(isRemovedBookmarksPage || isBookmarksPage) ? 'bg-white' : ''}`}
            style={!(isRemovedBookmarksPage || isBookmarksPage) ? { backgroundColor: '#0071c2' } : {}}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`text-center ${(isRemovedBookmarksPage || isBookmarksPage) ? 'mb-2' : 'mb-4'}`}>
              {(isRemovedBookmarksPage || isBookmarksPage) ? (
                <h2 className="text-2xl font-bold text-black">Important Notice</h2>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white xl:hidden">Swipe Gestures</h2>
                  <h2 className="text-2xl font-bold text-white hidden xl:block">Navigation Guide</h2>
                </>
              )}
            </div>

            {isRemovedBookmarksPage ? (
              /* Removed Bookmarks Info */
              <div className="space-y-4">
                <div className="rounded-lg px-4 py-4 bg-yellow-400/20 border-2 border-yellow-400">
                  <div className="text-center">
                    <p className="text-base font-semibold text-black leading-relaxed">
                      Properties in this section will be permanently deleted after 30 days
                    </p>
                  </div>
                </div>
              </div>
            ) : isBookmarksPage ? (
              /* Bookmarks Page Info */
              <div className="space-y-4">
                <div className="rounded-lg px-4 py-4 bg-green-200 border-2 border-green-400">
                  <div className="text-center space-y-4">
                    <p className="text-base font-semibold text-gray-700 leading-relaxed">
                      Your Recently removed bookmarks are temporarily stored here, click the button below to view them
                    </p>
                    <button
                      onClick={() => {
                        setIsGestureInfoOpen(false);
                        router.push('/recently-removed-bookmarks');
                      }}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Removed bookmarks
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: Gesture Information */}
                <div className="space-y-3 text-white xl:hidden">
              {/* Navigation Menu */}
              <div className="rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl flex-shrink-0 leading-none" style={{ color: '#fbbf24' }}>←</span>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white">Open menu</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Swipe to the left</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-4xl flex-shrink-0 leading-none" style={{ color: '#fbbf24' }}>→</span>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white">Close menu</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Swipe to the right</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Popup */}
              <div className="rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl flex-shrink-0 leading-none" style={{ color: '#fbbf24' }}>→</span>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white">Open search</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Swipe to the right</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-4xl flex-shrink-0 leading-none" style={{ color: '#fbbf24' }}>←</span>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white">Close search</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Swipe to the left</div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-center mt-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                💡 Gestures work across the app
              </p>
            </div>

            {/* Desktop: Navigation Information */}
            <div className="space-y-3 text-white hidden xl:block">
              <div className="rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0" style={{ color: '#fbbf24' }}>☰</span>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white">Navigation Menu</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Click the menu icon in the header</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0" style={{ color: '#fbbf24' }}>🔍</span>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white">Search Properties</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Click the search icon or search bar</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0" style={{ color: '#fbbf24' }}>👤</span>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white">User Profile</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Click your avatar to access your profile</div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-center mt-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                💡 All features are accessible via the navigation panel
              </p>
            </div>
              </>
            )}

            {/* Close Button */}
            <div className={`flex justify-center ${(isRemovedBookmarksPage || isBookmarksPage) ? 'mt-4' : 'mt-6'}`}>
            <button
              onClick={() => setIsGestureInfoOpen(false)}
                className="w-2/3 px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Ok, I got it
            </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

