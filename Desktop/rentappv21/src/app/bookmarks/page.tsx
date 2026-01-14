'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import PropertyCard from '@/components/PropertyCard';
import { getBookmarkedProperties, removeBookmark, DisplayProperty } from '@/utils/propertyUtils';
import { useAuth } from '@/contexts/AuthContext';

type SearchFilters = {
  propertyType?: string;
  status?: string;
  region?: string;
  ward?: string;
};


export default function BookmarksPage() {
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const [bookmarkedProperties, setBookmarkedProperties] = useState<DisplayProperty[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null);

  // For bookmarks page, filtered properties are the same as all bookmarked properties
  const filteredProperties = bookmarkedProperties;
  const hasActiveFilters = Boolean(activeFilters && Object.values(activeFilters).some(value =>
    typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
  ));

  // Update bookmarks when localStorage changes
  useEffect(() => {
    const handleBookmarksChange = () => {
      if (userId) {
        setBookmarkedProperties(getBookmarkedProperties(userId));
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
      setBookmarkedProperties(getBookmarkedProperties(userId));
    } else {
      setBookmarkedProperties([]);
    }
  }, [userId]);


  const handleBookmarkClick = (property: DisplayProperty) => {
    if (userId) {
      removeBookmark(property.id, userId);
      setBookmarkedProperties(getBookmarkedProperties(userId));
    }
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
          <p className="text-gray-500 text-lg">Log in to view your bookmarked properties.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      totalCount={bookmarkedProperties.length}
      filteredCount={filteredProperties.length}
      hasActiveFilters={hasActiveFilters}
    >
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
        {/* Properties Grid */}
        <div className="space-y-2 sm:space-y-3 lg:space-y-6">
          {bookmarkedProperties.length > 0 ? (
            bookmarkedProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onBookmarkClick={() => handleBookmarkClick(property)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-xl">
                {bookmarkedProperties.length === 0 && !hasActiveFilters
                  ? 'No bookmarked properties yet.'
                  : 'No bookmarks match your filters.'}
              </p>
              <p className="text-gray-400 text-base mt-1">
                Bookmark properties to see them here.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
