'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { generateSearchSessionId, setSearchSession, getSearchSessionId, getSearchFilters } from '@/utils/searchSession';
import { 
  getAllPropertyTypes, 
  getPropertyTypeChildren, 
  hasSubCategories,
  formatPropertyType
} from '@/utils/propertyTypes';

// Ward data organized by region (exact match from listing page)
const wardsByRegion = {
  'arusha': ['Arusha Central', 'Arusha North', 'Arusha South', 'Engaruka', 'Karatu', 'Kimandolu', 'Kisongo', 'Longido', 'Makuyuni', 'Mbuguni', 'Meru', 'Monduli', 'Mto wa Mbu', 'Ngaramtoni', 'Ngorongoro', 'Sakina', 'Tengeru', 'Themi', 'Unga Limited', 'Usa River', 'Other'],
  'dar-es-salaam': ['Buguruni', 'Chang\'ombe', 'Ilala', 'Kawe', 'Kariakoo', 'Kigamboni', 'Kijitonyama', 'Kinondoni', 'Kivukoni', 'Mbagala', 'Mbagala Kuu', 'Mbagala Rangi Tatu', 'Masaki', 'Mbezi', 'Mchikichini', 'Mikocheni', 'Msasani', 'Mtoni', 'Oyster Bay', 'Sinza', 'Tabata', 'Tandika', 'Temeke', 'Ubungo', 'Other'],
  'dodoma': ['Bahi', 'Chamwino', 'Chemba', 'Dodoma Central', 'Dodoma Urban', 'Hombolo', 'Kigwe', 'Kikombo', 'Kisese', 'Kongwa', 'Makutupora', 'Mlali', 'Mpwapwa', 'Mvumi', 'Ntyuka', 'Other'],
  'geita': ['Bukombe', 'Chato', 'Geita', 'Geita Town', 'Kakubilo', 'Katoro', 'Mabale', 'Mbogwe', 'Nyakabale', 'Nyang\'hwale', 'Other'],
  'iringa': ['Iringa Central', 'Iringa North', 'Iringa Urban', 'Kilolo', 'Kiponzelo', 'Mafinga', 'Mlowa', 'Mufindi', 'Other'],
  'kagera': ['Biharamulo', 'Bukoba', 'Bukoba Urban', 'Kanyigo', 'Karagwe', 'Kashasha', 'Kyerwa', 'Missenyi', 'Muleba', 'Ngara', 'Other'],
  'katavi': ['Karema', 'Mlele', 'Mpanda', 'Mpanda Town', 'Mpanda Urban', 'Other'],
  'kigoma': ['Buhigwe', 'Kakonko', 'Kasulu', 'Kibondo', 'Kigoma', 'Kigoma Urban', 'Uvinza', 'Other'],
  'kilimanjaro': ['Hai', 'Mawenzi', 'Moshi', 'Moshi Urban', 'Mwanga', 'Rombo', 'Same', 'Shirimatunda', 'Siha', 'Other'],
  'lindi': ['Kilwa', 'Kilwa Kivinje', 'Kilwa Masoko', 'Lindi', 'Lindi Urban', 'Liwale', 'Nachingwea', 'Ruangwa', 'Other'],
  'manyara': ['Babati', 'Babati Urban', 'Dareda', 'Hanang', 'Kiteto', 'Mbulu', 'Simanjiro', 'Other'],
  'mara': ['Bunda', 'Butiama', 'Musoma', 'Musoma Urban', 'Rorya', 'Serengeti', 'Tarime', 'Other'],
  'mbeya': ['Busokelo', 'Chunya', 'Ileje', 'Kyela', 'Mbarali', 'Mbeya', 'Mbeya Urban', 'Mbozi', 'Momba', 'Rungwe', 'Other'],
  'morogoro': ['Gairo', 'Kilombero', 'Kilosa', 'Malinyi', 'Morogoro', 'Morogoro Urban', 'Mvomero', 'Ulanga', 'Other'],
  'mtwara': ['Masasi', 'Masasi Urban', 'Mtwara', 'Mtwara Urban', 'Nanyumbu', 'Newala', 'Tandahimba', 'Other'],
  'mwanza': ['Ilemela', 'Kwimba', 'Magu', 'Misungwi', 'Mwanza Urban', 'Nyamagana', 'Sengerema', 'Ukerewe', 'Other'],
  'njombe': ['Ludewa', 'Makambako', 'Makete', 'Njombe', 'Njombe Urban', 'Wanging\'ombe', 'Other'],
  'pwani': ['Bagamoyo', 'Chalinze', 'Kibaha', 'Kibaha Urban', 'Kisarawe', 'Mafia', 'Mkuranga', 'Rufiji', 'Other'],
  'rukwa': ['Kalambo', 'Nkasi', 'Sumbawanga', 'Sumbawanga Urban', 'Other'],
  'ruvuma': ['Mbinga', 'Songea', 'Songea Urban', 'Tunduru', 'Other'],
  'shinyanga': ['Kahama', 'Kahama Urban', 'Kishapu', 'Msalala', 'Shinyanga', 'Shinyanga Urban', 'Other'],
  'simiyu': ['Bariadi', 'Busega', 'Itilima', 'Maswa', 'Meatu', 'Other'],
  'singida': ['Ikungi', 'Iramba', 'Manyoni', 'Mkalama', 'Singida', 'Singida Urban', 'Other'],
  'songwe': ['Ileje', 'Mbozi', 'Momba', 'Songwe', 'Other'],
  'tabora': ['Igunga', 'Kaliua', 'Nzega', 'Sikonge', 'Tabora', 'Tabora Urban', 'Urambo', 'Uyui', 'Other'],
  'tanga': ['Handeni', 'Handeni Urban', 'Kilindi', 'Korogwe', 'Korogwe Urban', 'Lushoto', 'Mkinga', 'Muheza', 'Pangani', 'Tanga', 'Tanga Urban', 'Other'],
  'unguja-north': ['Kaskazini A', 'Kaskazini B', 'Mkokotoni', 'Nungwi', 'Other'],
  'unguja-south': ['Kizimkazi', 'Kusini', 'Kusini Unguja', 'Makunduchi', 'Other'],
  'urban-west': ['Magharibi', 'Malindi', 'Mjini', 'Stone Town', 'Other'],
  'other': ['Other']
};

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  searchBarPosition?: { top: number; left: number; width: number } | null;
}

// Helper function to initialize state from filters (synchronous)
const initializeStateFromFilters = (filters: {
  propertyType?: string;
  profile?: string;
  status?: string;
  region?: string;
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
} | null) => {
  return {
    propertyType: filters?.propertyType || '',
    profile: filters?.profile || '',
    status: filters?.status || '',
    region: filters?.region || '',
    ward: filters?.ward || '',
    minPrice: filters?.minPrice ? filters.minPrice.toLocaleString() : '',
    maxPrice: filters?.maxPrice ? filters.maxPrice.toLocaleString() : '',
  };
};

export default function SearchPopup({ isOpen, onClose, searchBarPosition }: SearchPopupProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from search session ONLY (not URL params on refresh)
  // On page refresh, search session is cleared, so inputs initialize to empty
  // During navigation, search session persists, so inputs show current values
  const [propertyType, setPropertyType] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionId = getSearchSessionId();
      if (sessionId) {
        const sessionFilters = getSearchFilters();
        if (sessionFilters) {
          return sessionFilters.propertyType || '';
        }
      }
    }
    return '';
  });
  
  const [selectedPropertyCategory, setSelectedPropertyCategory] = useState('');
  const [selectedPropertySubType, setSelectedPropertySubType] = useState('');
  
  const [status, setStatus] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionId = getSearchSessionId();
      if (sessionId) {
        const sessionFilters = getSearchFilters();
        if (sessionFilters) {
          return sessionFilters.status || '';
        }
      }
    }
    return '';
  });
  
  const [selectedRegion, setSelectedRegion] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionId = getSearchSessionId();
      if (sessionId) {
        const sessionFilters = getSearchFilters();
        if (sessionFilters) {
          return sessionFilters.region || '';
        }
      }
    }
    return '';
  });
  
  const [selectedProfile, setSelectedProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionId = getSearchSessionId();
      if (sessionId) {
        const sessionFilters = getSearchFilters();
        if (sessionFilters) {
          return sessionFilters.profile || '';
        }
      }
    }
    return '';
  });
  
  const [selectedWard, setSelectedWard] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionId = getSearchSessionId();
      if (sessionId) {
        const sessionFilters = getSearchFilters();
        if (sessionFilters) {
          return sessionFilters.ward || '';
        }
      }
    }
    return '';
  });
  
  const [minPrice, setMinPrice] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionId = getSearchSessionId();
      if (sessionId) {
        const sessionFilters = getSearchFilters();
        if (sessionFilters?.minPrice) {
          return sessionFilters.minPrice.toLocaleString();
        }
      }
    }
    return '';
  });
  
  const [maxPrice, setMaxPrice] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionId = getSearchSessionId();
      if (sessionId) {
        const sessionFilters = getSearchFilters();
        if (sessionFilters?.maxPrice) {
          return sessionFilters.maxPrice.toLocaleString();
        }
      }
    }
    return '';
  });

  // Sync input fields with search session when modal opens (only if session exists)
  // Do NOT sync from URL params - that would restore values after refresh
  useEffect(() => {
    if (!isOpen) return; // Only sync when modal is open
    
    const sessionId = getSearchSessionId();
    
    // Only sync if there's an active search session
    // On page refresh, sessionId will be undefined, so inputs stay empty
    if (sessionId) {
      const filters = getSearchFilters();
      
      if (filters) {
        const newPropertyType = filters.propertyType || '';
        const newProfile = filters.profile || '';
        const newStatus = filters.status || '';
        const newRegion = filters.region || '';
        const newWard = filters.ward || '';
        const newMinPrice = filters.minPrice ? filters.minPrice.toLocaleString() : '';
        const newMaxPrice = filters.maxPrice ? filters.maxPrice.toLocaleString() : '';
        
        if (newPropertyType !== propertyType) setPropertyType(newPropertyType);
        if (newProfile !== selectedProfile) setSelectedProfile(newProfile);
        if (newStatus !== status) setStatus(newStatus);
        if (newRegion !== selectedRegion) setSelectedRegion(newRegion);
        if (newWard !== selectedWard) setSelectedWard(newWard);
        if (newMinPrice !== minPrice) setMinPrice(newMinPrice);
        if (newMaxPrice !== maxPrice) setMaxPrice(newMaxPrice);
      }
    }
  }, [isOpen]); // Only run when modal opens/closes

  // Clear profile when property type changes
  useEffect(() => {
    setSelectedProfile('');
  }, [propertyType]);
  const [customWard, setCustomWard] = useState('');
  const [showWardPopup, setShowWardPopup] = useState(false);
  
  // Touch event handlers for swipe gestures - using refs for performance (like menu modal)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    const touchStart = touchStartRef.current;
    const touchEnd = touchEndRef.current;

    if (!touchStart || !touchEnd) {
      touchStartRef.current = null;
      touchEndRef.current = null;
      return;
    }

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance; // Right to left swipe
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    // Only handle horizontal left swipes to close (right to left swipe)
    if (!isVerticalSwipe && isLeftSwipe) {
      onClose();
    }

    // Reset refs after handling
    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [onClose]);

  // Prevent background scroll by capturing wheel/touch on the overlay.
  const preventWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  // Keep tracking swipe while blocking background scroll
  const handleOverlayTouchMove = useCallback((e: React.TouchEvent) => {
    // Use ref to avoid re-renders - no state updates during move
    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const updateSearchParams = (filters: {
    propertyType?: string;
    profile?: string;
    status?: string;
    region?: string;
    ward?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const params = new URLSearchParams();
    
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.profile) params.set('profile', filters.profile);
    if (filters.status) params.set('status', filters.status);
    if (filters.region) params.set('region', filters.region);
    if (filters.ward) params.set('ward', filters.ward);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    
    // Generate and set search session ID for this search
    const searchSessionId = generateSearchSessionId();
    setSearchSession(searchSessionId, filters);
    
    // Check if current page is homepage, bookmarks, my-properties, or recently-removed-bookmarks
    const allowedPages = ['/', '/bookmarks', '/my-properties', '/recently-removed-bookmarks'];
    const isAllowedPage = allowedPages.includes(pathname);

    if (!isAllowedPage) {
      // Redirect to homepage with search params
      router.push(newUrl);
    } else {
      // Update URL on current page - use replace to ensure navigation triggers even with same URL
      // This ensures search executes even after refresh with same parameters
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl === newUrl) {
        // URL is the same - force update by using replace with scroll option
        router.replace(newUrl, { scroll: false });
        // Also trigger a small delay to ensure state updates
        setTimeout(() => {
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 0);
      } else {
        router.push(newUrl);
      }
    }
  };

  if (!isOpen) return null;

  const handleSearch = () => {
    const filters = {
      propertyType: propertyType || undefined,
      profile: selectedProfile || undefined,
      status: status || undefined,
      region: selectedRegion || undefined,
      ward: selectedWard || undefined,
      minPrice: minPrice ? parseInt(minPrice.replace(/,/g, '')) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice.replace(/,/g, '')) : undefined
    };

    updateSearchParams(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setPropertyType('');
    setSelectedPropertyCategory('');
    setSelectedPropertySubType('');
    setStatus('');
    setSelectedRegion('');
    setSelectedWard('');
    setSelectedProfile('');
    setMinPrice('');
    setMaxPrice('');
    
    // Clear search session when clearing filters
    setSearchSession(generateSearchSessionId(), null);
    
    // Clear URL params by navigating to base path
    const allowedPages = ['/', '/bookmarks', '/my-properties', '/recently-removed-bookmarks'];
    const isAllowedPage = allowedPages.includes(pathname);

    if (!isAllowedPage) {
      router.push('/');
    } else {
      router.push('/');
    }
    onClose();
  };

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1280;
  const shouldPositionBelow = isDesktop && searchBarPosition;

  // Get search heading based on current page
  const getSearchHeading = () => {
    if (pathname === '/bookmarks') {
      return 'Search My Bookmarks';
    } else if (pathname === '/my-properties') {
      return 'Search My Properties';
    } else if (pathname === '/recently-removed-bookmarks') {
      return 'Search Removed Bookmarks';
    } else {
      return 'Search Properties';
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 ${shouldPositionBelow ? 'xl:p-0' : 'flex items-center justify-center p-4'}`}
      style={{ 
        display: shouldPositionBelow ? 'block' : 'flex', 
        alignItems: shouldPositionBelow ? 'flex-start' : 'center', 
        justifyContent: shouldPositionBelow ? 'flex-start' : 'center', 
        touchAction: 'none', 
        minHeight: '100vh', 
        height: '100%', 
        overscrollBehavior: 'contain', 
        backgroundColor: shouldPositionBelow ? 'transparent' : 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={(e) => e.stopPropagation()}
      onWheel={preventWheel}
      onTouchMove={handleOverlayTouchMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={`rounded-xl max-w-xs w-full py-4 px-3 shadow-lg ${shouldPositionBelow ? 'max-h-[calc(100vh-80px)] overflow-y-auto' : 'overflow-hidden'}`}
         style={{
           backgroundColor: '#0071c2',
           pointerEvents: 'auto',
           ...(shouldPositionBelow && searchBarPosition ? {
             position: 'fixed',
             top: `${searchBarPosition.top}px`,
             left: `${searchBarPosition.left - searchBarPosition.width / 2 + 80}px`,
             width: `${searchBarPosition.width}px`,
             maxWidth: `${searchBarPosition.width}px`
           } : {})
         }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-6 w-full relative">
          <h1 className="text-2xl sm:text-[1.7rem] font-bold text-white">
            {getSearchHeading()}
          </h1>
        </div>

        {/* Search Form - Stacked Vertically */}
        <div className="space-y-3 mb-5">
          {/* Property Type */}
          <div className="text-center">
            <label className="block text-base text-white mb-2">
              Property Type
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100 text-gray-900"
              style={{ 
                color: '#111827'
              }}
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="" style={{ color: '#6b7280' }}>---</option>
              {getAllPropertyTypes().map((category) => (
                <option key={category} value={category} style={{ color: '#111827' }}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Profile/Sub-type - Always visible, disabled when no property type selected */}
          <div className="text-center">
            <label className="block text-base text-white mb-2">
              Profile
            </label>
              {propertyType ? (
                hasSubCategories(propertyType) ? (
                  <select
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                    style={{
                      color: '#111827'
                    }}
                    value={selectedProfile}
                    onChange={(e) => setSelectedProfile(e.target.value)}
                  >
                    <option value="" style={{ color: '#6b7280' }}>---</option>
                    {getPropertyTypeChildren(propertyType)?.map((profile) => (
                      <option key={profile} value={profile} style={{ color: '#111827' }}>
                        {profile}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-3 py-2 rounded-lg text-center h-10 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Profiles available</span>
                  </div>
                )
              ) : (
                <select
                  className="w-full px-3 py-2 rounded-lg text-center h-10 bg-gray-200 cursor-not-allowed"
                  style={{
                    color: '#9ca3af'
                  }}
                  disabled
                  value=""
                >
                  <option value="" style={{ color: '#9ca3af' }}>Select type</option>
                </select>
              )}
          </div>

          {/* Status - Full Width */}
          <div className="col-span-4">
            <label className="block text-base text-white mb-2 text-center">
              Status
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100 text-gray-900"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="" className="text-gray-400">---</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>

          {/* Region and Ward - Facing each other */}
          <div className="col-span-4 flex justify-between items-end gap-4">
            <div className="flex-1">
              <label className="block text-base text-white mb-2 text-center">
                Region
              </label>
            <select
              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100 text-gray-900"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedWard(''); // Reset ward when region changes
              }}
            >
              <option value="" className="text-gray-400">---</option>
              <option value="arusha">Arusha</option>
              <option value="dar-es-salaam">Dar es Salaam</option>
              <option value="dodoma">Dodoma</option>
              <option value="geita">Geita</option>
              <option value="iringa">Iringa</option>
              <option value="kagera">Kagera</option>
              <option value="katavi">Katavi</option>
              <option value="kigoma">Kigoma</option>
              <option value="kilimanjaro">Kilimanjaro</option>
              <option value="lindi">Lindi</option>
              <option value="manyara">Manyara</option>
              <option value="mara">Mara</option>
              <option value="mbeya">Mbeya</option>
              <option value="morogoro">Morogoro</option>
              <option value="mtwara">Mtwara</option>
              <option value="mwanza">Mwanza</option>
              <option value="njombe">Njombe</option>
              <option value="pwani">Pwani</option>
              <option value="rukwa">Rukwa</option>
              <option value="ruvuma">Ruvuma</option>
              <option value="shinyanga">Shinyanga</option>
              <option value="simiyu">Simiyu</option>
              <option value="singida">Singida</option>
              <option value="songwe">Songwe</option>
              <option value="tabora">Tabora</option>
              <option value="tanga">Tanga</option>
              <option value="unguja-north">Unguja North</option>
              <option value="unguja-south">Unguja South</option>
              <option value="urban-west">Urban West</option>
              <option value="other">Other</option>
            </select>
            </div>
            <div className="flex-1">
              <label className="block text-base text-white mb-2 text-center">
                Ward
              </label>
            {selectedRegion ? (
              <select
                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100 text-gray-900"
                value={selectedWard}
                onChange={(e) => {
                  if (e.target.value === 'other') {
                    setShowWardPopup(true);
                    setSelectedWard('');
                  } else {
                    setSelectedWard(e.target.value);
                    setCustomWard('');
                  }
                }}
              >
                <option value="" className="text-gray-400">---</option>
                {wardsByRegion[selectedRegion as keyof typeof wardsByRegion]?.map((ward) => (
                  <option key={ward} value={ward.toLowerCase().replace(/\s+/g, '-')}>
                    {ward}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 rounded-lg text-center h-10 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Select region</span>
              </div>
            )}
            </div>
          </div>

          {/* Price Range - Min and Max facing each other */}
          <div className="col-span-4 flex justify-between items-end gap-4">
            <div className="flex-1">
              <label className="block text-base text-white mb-2 text-center">
                Min Price
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100 text-gray-900"
                placeholder="---"
                value={minPrice}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d]/g, '');
                  if (value) {
                    value = parseInt(value).toLocaleString();
                  }
                  setMinPrice(value);
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-base text-white mb-2 text-center">
                Max Price
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100 text-gray-900"
                placeholder="---"
                value={maxPrice}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d]/g, '');
                  if (value) {
                    value = parseInt(value).toLocaleString();
                  }
                  setMaxPrice(value);
                }}
              />
            </div>
          </div>
        </div>

        <div className="w-full mb-3 space-y-3">
          <button
            onClick={handleSearch}
            className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold transition-colors text-center"
          >
            Search
          </button>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors text-center"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors text-center"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }}
              onMouseEnter={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(239, 68, 68, 1)'}
              onMouseLeave={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(239, 68, 68, 0.8)'}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Custom Ward Popup */}
      {showWardPopup && (
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
            className="rounded-xl p-4 w-full mx-4 shadow-2xl overflow-hidden bg-white" 
            style={{ 
              maxWidth: '21.6rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Custom Ward</h3>
              <p className="text-gray-600 mt-2">Enter the name of the ward in {selectedRegion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center h-10 bg-white text-gray-800 placeholder-gray-400"
                placeholder="Enter ward name"
                value={customWard}
                onChange={(e) => setCustomWard(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                onClick={() => {
                  setShowWardPopup(false);
                  setCustomWard('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors"
                onClick={() => {
                  if (customWard.trim()) {
                    const regionKey = selectedRegion as keyof typeof wardsByRegion;
                    if (regionKey && wardsByRegion[regionKey]) {
                      const updatedWards = [...wardsByRegion[regionKey].filter(ward => ward !== 'Other'), customWard.trim(), 'Other'];
                      wardsByRegion[regionKey] = updatedWards;
                      
                      setSelectedWard(customWard.trim().toLowerCase().replace(/\s+/g, '-'));
                      setCustomWard('');
                      setShowWardPopup(false);
                    }
                  }
                }}
                disabled={!customWard.trim()}
              >
                Add Ward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}