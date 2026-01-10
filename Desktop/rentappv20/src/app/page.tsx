'use client';

import Layout from '@/components/Layout';
import PropertyCard from '@/components/PropertyCard';
import { getAllProperties } from '@/utils/propertyUtils';
import { parsePropertyType } from '@/utils/propertyTypes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSearchSessionId, getSearchFilters, clearSearchSession, getSearchSessionVersion } from '@/utils/searchSession';

type SearchFilters = {
  propertyType?: string;
  profile?: string; // Sub-type within selected property type
  status?: string;
  region?: string;
  ward?: string;
  minPrice?: number; // Minimum price filter
  maxPrice?: number; // Maximum price filter
  minArea?: number; // Minimum area filter
  maxArea?: number; // Maximum area filter
  areaUnit?: 'sqm' | 'acre' | ''; // Unit for area filtering (default: sqm)
};

// Helper function to parse filters from URL string (synchronous, no hooks)
const parseFiltersFromURLString = (search: string): SearchFilters | null => {
  const params = new URLSearchParams(search);
  const filters: SearchFilters = {};
  let hasFilters = false;

  const propertyType = params.get('propertyType');
  const profile = params.get('profile');
  const status = params.get('status');
  const region = params.get('region');
  const ward = params.get('ward');
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  const minArea = params.get('minArea');
  const maxArea = params.get('maxArea');
  const areaUnit = params.get('areaUnit');

  if (propertyType) {
    filters.propertyType = propertyType;
    hasFilters = true;
  }
  if (profile) {
    filters.profile = profile;
    hasFilters = true;
  }
  if (status) {
    filters.status = status;
    hasFilters = true;
  }
  if (region) {
    filters.region = region;
    hasFilters = true;
  }
  if (ward) {
    filters.ward = ward;
    hasFilters = true;
  }
  if (minPrice) {
    const parsed = parseInt(minPrice, 10);
    if (!isNaN(parsed)) {
      filters.minPrice = parsed;
      hasFilters = true;
    }
  }
  if (maxPrice) {
    const parsed = parseInt(maxPrice, 10);
    if (!isNaN(parsed)) {
      filters.maxPrice = parsed;
      hasFilters = true;
    }
  }
  if (minArea) {
    const parsed = parseInt(minArea, 10);
    if (!isNaN(parsed)) {
      filters.minArea = parsed;
      hasFilters = true;
    }
  }
  if (maxArea) {
    const parsed = parseInt(maxArea, 10);
    if (!isNaN(parsed)) {
      filters.maxArea = parsed;
      hasFilters = true;
    }
  }
  if (areaUnit && (areaUnit === 'sqm' || areaUnit === 'acre')) {
    filters.areaUnit = areaUnit as 'sqm' | 'acre';
    hasFilters = true;
  }

  return hasFilters ? filters : null;
};

export default function Home() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState(getAllProperties());
  
  // Initialize activeFilters immediately to prevent flash
  // Check search session synchronously during component initialization
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(() => {
    if (typeof window !== 'undefined') {
      const searchSessionId = getSearchSessionId();
      if (searchSessionId) {
        // Active search session exists - parse from URL immediately
        // This prevents flash by setting correct state before first render
        const urlSearch = window.location.search;
        return parseFiltersFromURLString(urlSearch);
      }
    }
    return null;
  });

  // Clear search session on page refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleBeforeUnload = () => {
        clearSearchSession();
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, []);

  // Update properties when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProperties(getAllProperties());
    };

    const handlePropertyAdded = () => {
      setProperties(getAllProperties());
    };

    const handlePropertyUpdated = () => {
      setProperties(getAllProperties());
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom property added event
    window.addEventListener('propertyAdded', handlePropertyAdded);
    
    // Listen for property updated event
    window.addEventListener('propertyUpdated', handlePropertyUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('propertyAdded', handlePropertyAdded);
      window.removeEventListener('propertyUpdated', handlePropertyUpdated);
    };
  }, []);

  const applyFilters = useCallback(
    (items: ReturnType<typeof getAllProperties>, filters: SearchFilters | null) => {
      if (!filters) return items;

      const normalise = (value?: string) => value?.toLowerCase().trim();

      return items.filter((property) => {
        const matchesPropertyType = filters.propertyType ? (() => {
          const parsed = parsePropertyType(property.propertyType || '');
          // Match if the selected category matches the parent category
          return parsed?.parent === filters.propertyType;
        })() : true;

        const matchesProfile = filters.profile ? (() => {
          const parsed = parsePropertyType(property.propertyType || '');
          // Match if the selected profile matches the child sub-type
          return parsed?.child === filters.profile;
        })() : true;

        const matchesMinPrice = filters.minPrice
          ? property.price >= filters.minPrice
          : true;

        const matchesMaxPrice = filters.maxPrice
          ? property.price <= filters.maxPrice
          : true;

        // Area filtering with unit conversion
        const matchesArea = (() => {
          if (!filters.minArea && !filters.maxArea) return true;
          if (!property.area || property.area <= 0) return false;

          const filterUnit = filters.areaUnit || 'sqm';
          const propertyAreaUnit = 'areaUnit' in property ? property.areaUnit || 'sqm' : 'sqm';
          const propertyAreaValue = typeof property.area === 'number' ? property.area : parseInt(String(property.area || '0').replace(/,/g, '')) || 0;

          // Convert property area to filter unit for comparison
          let propertyAreaInFilterUnit: number;
          if (propertyAreaUnit === filterUnit) {
            // Same unit, no conversion needed
            propertyAreaInFilterUnit = propertyAreaValue;
          } else if (propertyAreaUnit === 'acre' && filterUnit === 'sqm') {
            // Convert acres to sqm (1 acre = 4046.86 sqm)
            propertyAreaInFilterUnit = propertyAreaValue * 4046.86;
          } else if (propertyAreaUnit === 'sqm' && filterUnit === 'acre') {
            // Convert sqm to acres
            propertyAreaInFilterUnit = propertyAreaValue / 4046.86;
          } else {
            propertyAreaInFilterUnit = propertyAreaValue;
          }

          const matchesMinArea = filters.minArea
            ? propertyAreaInFilterUnit >= filters.minArea
            : true;

          const matchesMaxArea = filters.maxArea
            ? propertyAreaInFilterUnit <= filters.maxArea
            : true;

          return matchesMinArea && matchesMaxArea;
        })();

        const matchesStatus = filters.status ? property.status === filters.status : true;

        const matchesRegion = filters.region
          ? normalise(property.region) === normalise(filters.region)
          : true;

        const matchesWard = filters.ward ? normalise(property.ward) === normalise(filters.ward) : true;

        return matchesPropertyType && matchesStatus && matchesRegion && matchesWard && matchesProfile && matchesMinPrice && matchesMaxPrice && matchesArea;
      });
    },
    []
  );

  const filteredProperties = useMemo(
    () => applyFilters(properties, activeFilters),
    [properties, activeFilters, applyFilters]
  );

  // Helper function to parse search filters from URL params
  const parseFiltersFromURL = useCallback((): SearchFilters | null => {
    const filters: SearchFilters = {};
    let hasFilters = false;

    const propertyType = searchParams.get('propertyType');
    const profile = searchParams.get('profile');
    const status = searchParams.get('status');
    const region = searchParams.get('region');
    const ward = searchParams.get('ward');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');
    const areaUnit = searchParams.get('areaUnit');

    if (propertyType) {
      filters.propertyType = propertyType;
      hasFilters = true;
    }
    if (profile) {
      filters.profile = profile;
      hasFilters = true;
    }
    if (status) {
      filters.status = status;
      hasFilters = true;
    }
    if (region) {
      filters.region = region;
      hasFilters = true;
    }
    if (ward) {
      filters.ward = ward;
      hasFilters = true;
    }
    if (minPrice) {
      const parsed = parseInt(minPrice, 10);
      if (!isNaN(parsed)) {
        filters.minPrice = parsed;
        hasFilters = true;
      }
    }
    if (maxPrice) {
      const parsed = parseInt(maxPrice, 10);
      if (!isNaN(parsed)) {
        filters.maxPrice = parsed;
        hasFilters = true;
      }
    }
    if (minArea) {
      const parsed = parseInt(minArea, 10);
      if (!isNaN(parsed)) {
        filters.minArea = parsed;
        hasFilters = true;
      }
    }
    if (maxArea) {
      const parsed = parseInt(maxArea, 10);
      if (!isNaN(parsed)) {
        filters.maxArea = parsed;
        hasFilters = true;
      }
    }
    if (areaUnit && (areaUnit === 'sqm' || areaUnit === 'acre')) {
      filters.areaUnit = areaUnit as 'sqm' | 'acre';
      hasFilters = true;
    }

    return hasFilters ? filters : null;
  }, [searchParams]);

  // Track search session version to detect new searches even with same params
  const [searchSessionVersion, setSearchSessionVersion] = useState(() => {
    if (typeof window !== 'undefined') {
      return getSearchSessionVersion();
    }
    return 0;
  });

  // Poll for search session version changes to detect searches with same params
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSearchVersion = () => {
      const currentVersion = getSearchSessionVersion();
      if (currentVersion !== searchSessionVersion) {
        setSearchSessionVersion(currentVersion);
        
        const searchSessionId = getSearchSessionId();
        if (searchSessionId) {
          // New search performed - restore from session store or URL
          const sessionFilters = getSearchFilters();
          if (sessionFilters) {
            setActiveFilters(sessionFilters);
          } else {
            const filters = parseFiltersFromURL();
            setActiveFilters(filters);
          }
        }
      }
    };

    // Check immediately
    checkSearchVersion();

    // Poll periodically to catch version changes (when URL doesn't change)
    const interval = setInterval(checkSearchVersion, 100);

    return () => clearInterval(interval);
  }, [searchSessionVersion, parseFiltersFromURL]);

  // Restore search state based on explicit search session ID and URL changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchSessionId = getSearchSessionId();
      
      if (searchSessionId) {
        // Active search session exists - restore from URL
        // Session ID persists in memory during client-side navigation
        const filters = parseFiltersFromURL();
        setActiveFilters(filters);
      } else {
        // No search session - initialize default search state (reset)
        // This handles: page refresh, initial load without active session
        setActiveFilters(null);
      }
    } else {
      // SSR fallback - reset to default
      setActiveFilters(null);
    }
  }, [searchParams, parseFiltersFromURL]);

  const hasActiveFilters = activeFilters !== null;

  return (
    <Layout
      totalCount={properties.length}
      filteredCount={filteredProperties.length}
      hasActiveFilters={hasActiveFilters}
    >
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
        {/* Properties Grid */}
        <div className="space-y-2 sm:space-y-3 lg:space-y-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} showBookmarkConfirmation={false} />
            ))
          ) : (
            <div className="text-center py-8">
              {properties.length === 0 && !hasActiveFilters ? (
                <>
                  <p className="text-gray-500 text-xl">No properties available for now.</p>
                  <p className="text-gray-400 text-base mt-1">Check back later or contact us for further assistance.</p>
                </>
              ) : (
                <>
              <p className="text-gray-500 text-xl">No properties available for now.</p>
                  <p className="text-gray-400 text-base mt-1">Check back later or adjust your filters.</p>
                </>
              )}
            </div>
          )}
        </div>
    </div>
    </Layout>
  );
}
