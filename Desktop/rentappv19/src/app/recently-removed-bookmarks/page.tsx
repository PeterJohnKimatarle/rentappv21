'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import PropertyCard from '@/components/PropertyCard';
import { 
  getRecentlyRemovedProperties, 
  restoreBookmark, 
  permanentlyDeleteRemovedBookmark,
  DisplayProperty 
} from '@/utils/propertyUtils';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useAuth } from '@/contexts/AuthContext';
import { RotateCcw } from 'lucide-react';


export default function RecentlyRemovedBookmarksPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const userId = user?.id;
  const [removedProperties, setRemovedProperties] = useState<DisplayProperty[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<DisplayProperty | null>(null);
  // Update removed bookmarks when localStorage changes
  useEffect(() => {
    const handleBookmarksChange = () => {
      if (userId) {
        setRemovedProperties(getRecentlyRemovedProperties(userId));
      }
    };

    // Listen for bookmark changes
    window.addEventListener('bookmarksChanged', handleBookmarksChange);

    return () => {
      window.removeEventListener('bookmarksChanged', handleBookmarksChange);
    };
  }, [userId]);

  useEffect(() => {
    if (userId) {
      setRemovedProperties(getRecentlyRemovedProperties(userId));
    } else {
      setRemovedProperties([]);
    }
  }, [userId]);

  // Block background scroll when modals are open
  usePreventScroll(showDeleteModal);

  const handleRestoreClick = (property: DisplayProperty) => {
    if (userId) {
      const success = restoreBookmark(property.id, userId);
      if (success) {
        const updatedRemovedProperties = getRecentlyRemovedProperties(userId);
        setRemovedProperties(updatedRemovedProperties);
        // If all properties are restored, redirect to bookmarks page
        if (updatedRemovedProperties.length === 0) {
          router.push('/bookmarks');
        }
      }
    }
  };

  const handlePermanentlyDelete = () => {
    if (selectedProperty && userId) {
      const success = permanentlyDeleteRemovedBookmark(selectedProperty.id, userId);
      if (success) {
        setRemovedProperties(getRecentlyRemovedProperties(userId));
        setShowDeleteModal(false);
        setSelectedProperty(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedProperty(null);
  };

  // Wait silently during loading - don't show anything
  if (isLoading) {
    return null;
  }

  // Only show login message after loading is complete
  if (!userId) {
    return (
      <Layout totalCount={0} filteredCount={0} hasActiveFilters={false}>
        <div className="w-full max-w-6xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 text-lg">Log in to view your recently removed bookmarks.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      totalCount={removedProperties.length}
    >
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
        {/* Properties Grid */}
        <div className="space-y-2 sm:space-y-3 lg:space-y-6">
          {removedProperties.length > 0 ? (
            removedProperties.map((property) => (
              <PropertyCard 
                key={property.id}
                property={property} 
                hideBookmark={true}
                isRemovedBookmark={true}
                renderAfterUpdated={
                  <div 
                    className="mt-2 flex gap-2" 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRestoreClick(property);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors"
                      style={{ backgroundColor: 'rgba(34, 197, 94, 0.9)', maxWidth: '250px' }}
                      onMouseEnter={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(34, 197, 94, 1)'}
                      onMouseLeave={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(34, 197, 94, 0.9)'}
                    >
                      <RotateCcw size={18} />
                      <span>Restore</span>
                    </button>
                  </div>
                }
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-xl">
                {removedProperties.length === 0
                  ? 'No removed bookmarks.'
                  : 'No removed bookmarks match your filters.'}
              </p>
              <p className="text-gray-400 text-base mt-1">
                {removedProperties.length === 0
                  ? 'Removed bookmarks will appear here for easy restoration.'
                  : 'Try adjusting your search filters.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProperty && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (window.innerWidth >= 1024) {
              handleCancelDelete();
            }
            e.stopPropagation();
          }}
        >
          <div 
            className="bg-white rounded-xl max-w-sm w-full max-h-[45vh] overflow-hidden flex flex-col"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center pt-3 pb-0 px-4 bg-white sticky top-0 z-10">
              <h3 className="text-2xl font-semibold text-black">Delete Permanently</h3>
            </div>
            <div className="p-4 pt-2">
              <p className="text-base text-gray-700 mb-4">
                Are you sure you want to permanently delete this bookmark? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handlePermanentlyDelete}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

