'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Bed, Bath, Square, ArrowLeft, Phone, Mail, Calendar, Share2, Image as ImageIcon, Clock, Heart, MessageCircle, FileText, Check, MoreVertical, Radio, User as UserIcon } from 'lucide-react';
import { getAllProperties, DisplayProperty, isBookmarked, addBookmark, removeBookmark, addToFollowUp, removeFromFollowUp, addToClosed, removeFromClosed, confirmPropertyStatus, getStatusConfirmation, updateProperty, getPropertyById, isPropertyInFollowUpAnyUser, isPropertyClosedAnyUser, getStaffNotes, saveStaffNotes, getUserNotes, saveUserNotes } from '@/utils/propertyUtils';
import { parsePropertyType, getPropertyTypeDisplayLabel } from '@/utils/propertyTypes';
import ImageLightbox from '@/components/ImageLightbox';
import SharePopup from '@/components/SharePopup';
import Layout from '@/components/Layout';
import LoginPopup from '@/components/LoginPopup';
import { useAuth } from '@/contexts/AuthContext';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { ShareManager } from '@/utils/shareUtils';
import { getSearchSessionId } from '@/utils/searchSession';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, getAllUsers, isAuthenticated } = useAuth();
  const userId = user?.id;
  const [property, setProperty] = useState<DisplayProperty | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [displayedImageIndex, setDisplayedImageIndex] = useState(0);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingModalType, setBookingModalType] = useState<'book' | 'status'>('book');
  const [isPinged, setIsPinged] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [showThreeDotsModal, setShowThreeDotsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [wasOpenedFromNotesModal, setWasOpenedFromNotesModal] = useState(false);
  const [wasOpenedFromActionsModal, setWasOpenedFromActionsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [hasNotes, setHasNotes] = useState(false);
  const [isNotesEditable, setIsNotesEditable] = useState(false);
  const [notesKeyboardInset, setNotesKeyboardInset] = useState(0);
  const [showUpdatedDateModal, setShowUpdatedDateModal] = useState(false);
  const [showStatusConfirmationModal, setShowStatusConfirmationModal] = useState(false);
  const [showConfirmByModal, setShowConfirmByModal] = useState(false);
  const [statusConfirmation, setStatusConfirmation] = useState<{ staffName: string; confirmedAt: string } | null>(null);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'available' | 'occupied' | ''>('');
  const [showAllAmenitiesModal, setShowAllAmenitiesModal] = useState(false);
  const [showDesktopMore, setShowDesktopMore] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [descriptionModalView, setDescriptionModalView] = useState<'description' | 'category'>('description');
  const [showUploaderProfileModal, setShowUploaderProfileModal] = useState(false);
  const [uploaderUser, setUploaderUser] = useState<{ id: string; name: string; firstName?: string; lastName?: string; email: string; phone?: string; role: string; profileImage?: string; bio?: string; isApproved?: boolean } | null>(null);
  const [showUserNotesModal, setShowUserNotesModal] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [isUserNotesEditable, setIsUserNotesEditable] = useState(false);
  const [userNotesKeyboardInset, setUserNotesKeyboardInset] = useState(0);
  const [hasUserNotes, setHasUserNotes] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [showUploaderImagePreview, setShowUploaderImagePreview] = useState(false);

  // Prevent body scrolling when booking modal is open
  usePreventScroll(showBookingModal || showSharePopup || showThreeDotsModal || showNotesModal || showInfoModal || showUpdatedDateModal || showStatusConfirmationModal || showConfirmByModal || showStatusUpdateModal || showAllAmenitiesModal || showDescriptionModal || showUploaderProfileModal || showUserNotesModal || isLoginPopupOpen || showUploaderImagePreview);

  useEffect(() => {
    const propertyId = params.id as string;
    const allProperties = getAllProperties();
    const foundProperty = allProperties.find(p => p.id === propertyId);
    setProperty(foundProperty || null);
    
    // Initialize status states immediately to prevent flash
    if (foundProperty && typeof window !== 'undefined') {
      // Check closed status first (takes precedence)
      const closed = isPropertyClosedAnyUser(foundProperty.id);
      setIsClosed(closed);
      
      // Only check follow-up if not closed
      if (!closed) {
        const pinged = isPropertyInFollowUpAnyUser(foundProperty.id);
        setIsPinged(pinged);
      } else {
        setIsPinged(false);
      }
    }
    
    // Check for status confirmation
    if (propertyId) {
      const confirmation = getStatusConfirmation(propertyId);
      if (confirmation) {
        setStatusConfirmation({
          staffName: confirmation.staffName,
          confirmedAt: confirmation.confirmedAt
        });
      } else {
        setStatusConfirmation(null);
      }
    }
    
    // Dispatch event to mark this property as the last viewed (for blue dot indicator)
    if (foundProperty) {
      // Store in sessionStorage for persistence across component remounts
      sessionStorage.setItem('lastViewedPropertyId', foundProperty.id);
      // Dispatch event to update all PropertyCard components
      const evt = new CustomEvent('lastViewedPropertyChanged', { detail: { id: foundProperty.id } });
      window.dispatchEvent(evt);
    }
  }, [params.id]);

  // Helper function to mark property as last viewed (for blue dot indicator)
  const markPropertyAsViewed = () => {
    if (property?.id) {
      // Store in sessionStorage for persistence across component remounts
      sessionStorage.setItem('lastViewedPropertyId', property.id);
      // Dispatch event to update all PropertyCard components
      const evt = new CustomEvent('lastViewedPropertyChanged', { detail: { id: property.id } });
      window.dispatchEvent(evt);
    }
  };

  // Listen for status confirmation changes
  useEffect(() => {
    const handleStatusConfirmationChanged = () => {
      if (property?.id) {
        const confirmation = getStatusConfirmation(property.id);
        if (confirmation) {
          setStatusConfirmation({
            staffName: confirmation.staffName,
            confirmedAt: confirmation.confirmedAt
          });
        } else {
          setStatusConfirmation(null);
        }
      }
    };

    window.addEventListener('statusConfirmationChanged', handleStatusConfirmationChanged);
    return () => {
      window.removeEventListener('statusConfirmationChanged', handleStatusConfirmationChanged);
    };
  }, [property?.id]);

  // Update Open Graph meta tags for WhatsApp preview
  useEffect(() => {
    if (!property) return;

    const propertyUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/property/${property.id}`
      : `/property/${property.id}`;
    
    const mainImageUrl = property.images && property.images.length > 0 
      ? (property.images[0].startsWith('http') 
          ? property.images[0] 
          : typeof window !== 'undefined' 
            ? `${window.location.origin}${property.images[0]}` 
            : property.images[0])
      : '';

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update or create regular meta tags
    const updateRegularMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Set Open Graph tags
    updateMetaTag('og:title', property.title);
    updateMetaTag('og:description', property.description || `${property.title} - ${property.location}`);
    updateMetaTag('og:image', mainImageUrl);
    updateMetaTag('og:url', propertyUrl);
    updateMetaTag('og:type', 'website');

    // Set Twitter Card tags (for better compatibility)
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', property.title);
    updateMetaTag('twitter:description', property.description || `${property.title} - ${property.location}`);
    updateMetaTag('twitter:image', mainImageUrl);

    // Update page title
    document.title = `${property.title} - Rentapp`;

    // Cleanup function
    return () => {
      // Optionally reset to default title on unmount
      document.title = "Rentapp - Tanzania's #1 Renting Platform";
    };
  }, [property]);

  // Check bookmark status
  useEffect(() => {
    if (!property || !userId) {
      setBookmarked(false);
      return;
    }
    const checkBookmarkStatus = () => {
      setBookmarked(isBookmarked(property.id, userId));
    };
    checkBookmarkStatus();
    const handleBookmarksChanged = () => {
      checkBookmarkStatus();
    };
    window.addEventListener('bookmarksChanged', handleBookmarksChanged);
    return () => {
      window.removeEventListener('bookmarksChanged', handleBookmarksChanged);
    };
  }, [property, userId]);

  // Check if property is in follow-up
  useEffect(() => {
    if (typeof window !== 'undefined' && property) {
      const checkPinged = () => {
        // Don't check follow-up if property is closed (closed takes precedence)
        if (isClosed) {
          setIsPinged(false);
          return;
        }
        
        // Check shared status (same for all users)
        const closed = isPropertyClosedAnyUser(property.id);
        if (closed) {
          setIsPinged(false);
          return;
        }
        const pinged = isPropertyInFollowUpAnyUser(property.id);
        setIsPinged(pinged);
      };
      checkPinged();
      window.addEventListener('propertyStatusChanged', checkPinged);
      window.addEventListener('followUpChanged', checkPinged);
      window.addEventListener('closedChanged', checkPinged);
      return () => {
        window.removeEventListener('propertyStatusChanged', checkPinged);
        window.removeEventListener('followUpChanged', checkPinged);
        window.removeEventListener('closedChanged', checkPinged);
      };
    }
  }, [property?.id, isClosed]);

  // Check if property is closed
  useEffect(() => {
    if (typeof window !== 'undefined' && property) {
      const checkClosed = () => {
        // Check shared status (same for all users)
        const closed = isPropertyClosedAnyUser(property.id);
        setIsClosed(closed);
        // If closed, clear follow-up status
        if (closed) {
          setIsPinged(false);
        }
      };
      checkClosed();
      // Listen for status changes
      window.addEventListener('propertyStatusChanged', checkClosed);
      window.addEventListener('closedChanged', checkClosed);
      window.addEventListener('followUpChanged', checkClosed);
      return () => {
        window.removeEventListener('propertyStatusChanged', checkClosed);
        window.removeEventListener('closedChanged', checkClosed);
        window.removeEventListener('followUpChanged', checkClosed);
      };
    }
  }, [property?.id, isPinged]);

  // Check if property has notes
  useEffect(() => {
    // Check notes for all states (Default, Followed, Closed)
    if (typeof window !== 'undefined' && property) {
      const checkNotes = () => {
        // Only staff/admin can have notes - check shared staff notes
        if (user?.role === 'admin' || (user?.role === 'staff' && user?.isApproved)) {
          const notes = getStaffNotes(property.id);
          setHasNotes(notes.trim().length > 0);
        } else {
          setHasNotes(false);
        }
      };
      checkNotes();
      // Listen for notes changes (could be updated from other components)
      const handleNotesChange = () => checkNotes();
      window.addEventListener('notesChanged', handleNotesChange);
      window.addEventListener('closedChanged', checkNotes);
      return () => {
        window.removeEventListener('notesChanged', handleNotesChange);
        window.removeEventListener('closedChanged', checkNotes);
      };
    }
  }, [property?.id, userId, user?.role]);

  // Detect keyboard visibility and move modal up by 100px when keyboard is visible
  useEffect(() => {
    if (!showNotesModal) {
      setNotesKeyboardInset(0);
      return;
    }
    const vv = typeof window !== 'undefined'
      ? (window as Window & { visualViewport?: VisualViewport }).visualViewport
      : undefined;
    if (!vv) return;
    const handleResize = () => {
      const covered = Math.max(0, window.innerHeight - vv.height);
      // Move modal up by 100px when keyboard is visible, return to center when not visible
      setNotesKeyboardInset(covered > 0 ? 100 : 0);
    };
    handleResize();
    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, [showNotesModal]);

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

  // Check if uploader user has notes
  useEffect(() => {
    if (uploaderUser && typeof window !== 'undefined') {
      const checkUserNotes = () => {
        if (user?.role === 'admin' || (user?.role === 'staff' && user?.isApproved)) {
          const notes = getUserNotes(uploaderUser.id);
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
  }, [uploaderUser?.id, user?.role]);

  // Detect amenities overflow for desktop line clamping
  useEffect(() => {
    if (!property?.amenities?.length || typeof window === 'undefined') return;

    const checkOverflow = () => {
      // Only check on desktop
      if (window.innerWidth < 768) {
        setShowDesktopMore(false);
        return;
      }

      const amenitiesContainer = document.querySelector('.amenities-desktop') as HTMLElement;
      const moreBtn = document.querySelector('.amenities-more-desktop') as HTMLElement;

      if (!amenitiesContainer || !moreBtn) return;

      // Check if the amenities container actually overflows its allocated height
      const containerHeight = amenitiesContainer.offsetHeight;
      const scrollHeight = amenitiesContainer.scrollHeight;
      const clientHeight = amenitiesContainer.clientHeight;

      // If content height exceeds container height, it overflows
      const isOverflowing = scrollHeight > clientHeight || containerHeight < scrollHeight;

      setShowDesktopMore(isOverflowing);
      moreBtn.style.display = isOverflowing ? 'inline-block' : 'none';
    };

    // Check after DOM renders and images load
    setTimeout(checkOverflow, 200);
  }, [property?.amenities]);

  const handleBookmarkClick = () => {
    if (!property) {
      return;
    }
    if (!userId) {
      setIsLoginPopupOpen(true);
      return;
    }
    if (bookmarked) {
      removeBookmark(property.id, userId);
      setBookmarked(false);
    } else {
      addBookmark(property.id, userId);
      setBookmarked(true);
    }
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price);
    return formatted.replace(/TZS|TSh/gi, 'Tsh');
  };

  const formatPropertyType = (propertyType?: string) => {
    if (!propertyType) return 'Property';
    const typeMap: { [key: string]: string } = {
      '1-bdrm-apartment': '1 Bdrm Apartment',
      '2-bdrm-apartment': '2 Bdrm Apartment',
      '3-bdrm-apartment': '3 Bdrm Apartment',
      '4-bdrm-apartment': '4 Bdrm Apartment',
      '5-bdrm-apartment': '5 Bdrm Apartment',
      'commercial-building-frame': 'Commercial Building (Frame)',
    };
    return typeMap[propertyType] || propertyType.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateTime = date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dayOfWeek}, ${dateTime}`;
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const updatedAt = new Date(dateString);
    let diffInSeconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000);
    
    // Ensure minimum is 2 seconds (handle 0, 1, and negative values)
    if (diffInSeconds < 2) {
      diffInSeconds = 2;
    }
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec${diffInSeconds === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      if (years >= 3) {
        return '3+ years ago';
      }
      return `${years} year${years === 1 ? '' : 's'} ago`;
    }
  };

  const handleShareClick = () => {
    setShowSharePopup(true);
  };

  if (!property) {
    return (
      <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900 mb-2">Property Not Found</div>
          <div className="text-gray-600 mb-4">The property you&apos;re looking for doesn&apos;t exist.</div>
          <button
            onClick={() => router.push('/')}
            className="bg-booking-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
      </Layout>
    );
  }

  const mainImage = property.images && property.images.length > 0 ? property.images[displayedImageIndex] : null;
  const otherImages = property.images && property.images.length > 1 ? property.images.slice(1, 5) : [];

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!property.images || property.images.length === 0) return;
    
    if (direction === 'next') {
      setDisplayedImageIndex((prev) => (prev + 1) % property.images!.length);
    } else {
      setDisplayedImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50">
        {/* Property Title */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 pb-1.5">
          <div
            className="rounded-lg py-2 relative cursor-pointer"
            style={{ backgroundColor: '#0071c2' }}
            onClick={() => {
              setDescriptionModalView('description');
              setShowDescriptionModal(true);
            }}
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
              {property.propertyTitle || property.title}
            </h1>
            {/* Three Dots for Staff/Admin - Status Update */}
            {((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusUpdateModal(true);
                }}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center justify-center text-white cursor-pointer select-none hover:bg-black/20 rounded p-1.5 transition-colors"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
                title="Update Status"
              >
                <MoreVertical size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Hero Image Section */}
        {mainImage && (
          <div className="max-w-7xl mx-auto mt-2 pl-2 pr-2 sm:pl-4 sm:pr-4 lg:pl-6 lg:pr-6">
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[450px] overflow-hidden rounded-lg">
            <img
              src={mainImage}
              alt={property.title}
              className={`w-full h-full object-cover ${property.images && property.images.length > 1 ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (property.images && property.images.length > 1) {
                setCurrentImageIndex(displayedImageIndex);
                setIsLightboxOpen(true);
                }
              }}
            />
            
            {/* Left Click Area - Previous Image */}
            {property.images && property.images.length > 1 && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageNavigation('prev');
                }}
              />
            )}
            
            {/* Right Click Area - Next Image */}
            {property.images && property.images.length > 1 && (
              <div 
                className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageNavigation('next');
                }}
              />
            )}
            
            {/* Status Badge */}
            <div 
              className={`absolute top-3 left-2 z-20 ${((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') ? 'cursor-pointer' : ''}`}
              onClick={(e) => {
                if ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') {
                  e.stopPropagation();
                  setShowStatusConfirmationModal(true);
                }
              }}
            >
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 border-black ${
                property.status === 'available' 
                  ? 'bg-green-400 text-black' 
                  : 'bg-red-400 text-white'
              }`}>
                {property.status === 'available' ? 'Available' : 'Occupied'}
              </span>
            </div>
            
            {/* Area Display - Below Status Badge */}
            {property.area > 0 && (() => {
              const areaUnit = 'areaUnit' in property ? property.areaUnit || 'sqm' : 'sqm';
              const areaValue = typeof property.area === 'number' ? property.area : parseInt(String(property.area || '0').replace(/,/g, '')) || 0;
              const unit = areaUnit === 'acre' ? (areaValue === 1 ? 'Acre' : 'Acres') : 'sqm';
              return (
                <div className="absolute top-[2.75rem] left-2 px-3 xl:px-4 py-0.5 xl:py-1 rounded-lg text-sm font-semibold border-2 border-black bg-white text-black z-20 flex items-center justify-center">
                  {areaValue.toLocaleString()} {unit}
                </div>
              );
            })()}

            {/* Share Icon */}
            <div 
              className="absolute top-14 xl:top-16 right-2 px-2 py-1 xl:px-3 xl:py-1.5 rounded-md flex items-center justify-center text-white text-sm xl:text-base cursor-pointer z-20" 
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleShareClick();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <Share2 
                size={24} 
                className="w-6 h-6 xl:w-7 xl:h-7" 
                style={{ 
                  color: 'white',
                  strokeWidth: 1.5
                }}
              />
      </div>

            {/* Bookmark Icon */}
            <div 
              className="absolute top-2 right-2 px-2 py-1 xl:px-3 xl:py-1.5 rounded-md flex items-center justify-center text-white text-sm xl:text-base cursor-pointer z-20" 
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}
              onClick={handleBookmarkClick}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <Heart 
                size={24} 
                className="w-6 h-6 xl:w-7 xl:h-7" 
                style={{ 
                  color: 'white', 
                  fill: bookmarked ? '#ef4444' : 'none',
                  strokeWidth: 1.5
                }}
              />
            </div>

            {/* Image Counter - Mobile */}
            {property.images && property.images.length > 0 && (
              <div 
                className={`flex xl:hidden absolute bottom-2 left-2 text-white text-sm px-3 py-2 rounded-lg shadow-lg flex items-center ${property.images.length > 1 ? 'cursor-pointer' : ''} z-20`}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (property.images && property.images.length > 1) {
                  setCurrentImageIndex(displayedImageIndex);
                  setIsLightboxOpen(true);
                  }
                }}
              >
                <span className="font-medium">{displayedImageIndex + 1} / {property.images.length}</span>
              </div>
            )}
            {/* Image Counter - Desktop */}
            {property.images && property.images.length > 0 && (
              <div 
                className={`hidden xl:flex absolute bottom-2 left-2 text-white text-sm xl:text-base px-3 py-2 xl:px-3.5 xl:py-2 rounded-lg shadow-lg items-center ${property.images.length > 1 ? 'cursor-pointer' : ''} z-20`}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (property.images && property.images.length > 1) {
                  setCurrentImageIndex(displayedImageIndex);
                  setIsLightboxOpen(true);
                  }
                }}
              >
                <span className="font-medium">{displayedImageIndex + 1} / {property.images.length}</span>
              </div>
            )}

            {/* Confirm & Book / Confirm Status Button - Desktop Only */}
              <div className="hidden xl:block absolute bottom-2 right-2 z-30">
              {((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markPropertyAsViewed(); // Track property view
                        // Open property actions modal for all states
                        if (isPinged) {
                          // When followed, open property actions modal instead of notes directly
                          setShowThreeDotsModal(true);
                        } else if (isClosed) {
                          // Staff and admin can open property actions modal
                          markPropertyAsViewed(); // Track property view
                          setShowThreeDotsModal(true);
                        } else {
                          // Staff and admin can open property actions modal
                          markPropertyAsViewed(); // Track property view
                          setShowThreeDotsModal(true);
                        }
                      }}
                      className="text-white rounded-lg px-4 py-2 xl:px-6 xl:py-3 cursor-pointer flex items-center justify-center gap-2 shadow-lg select-none relative"
                      style={{ 
                        backgroundColor: isClosed
                          ? 'rgba(34, 197, 94, 0.9)' 
                          : isPinged
                            ? 'rgba(59, 130, 246, 0.9)' 
                            : 'rgba(107, 114, 128, 0.9)',
                        WebkitTapHighlightColor: 'transparent',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none',
                        outline: 'none'
                      }}
                    >
                      {hasNotes && (
                        <span className="absolute left-2 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}></span>
                      )}
                      {isClosed ? (
                        <>
                          <span className="text-sm xl:text-base font-medium">Closed</span>
                        </>
                      ) : isPinged ? (
                        <>
                          <span className="text-sm xl:text-base font-medium">Followed</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm xl:text-base font-medium">Default</span>
                        </>
                      )}
                    </button>
                  </>
                ) : property.status === 'available' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Only allow logged-in users to book
                      if (!isAuthenticated) {
                        alert('Please login to book this property.');
                        return;
                      }
                      setBookingModalType('book');
                      setShowBookingModal(true);
                    }}
                    className="text-white rounded-lg px-4 py-2 xl:px-6 xl:py-3 cursor-pointer flex items-center justify-center gap-2 shadow-lg select-none"
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
                    <span className="text-sm xl:text-base font-medium">Confirm & Book</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Only allow logged-in users to confirm status
                      if (!isAuthenticated) {
                        alert('Please login to confirm status of this property.');
                        return;
                      }
                      setBookingModalType('status');
                      setShowBookingModal(true);
                    }}
                    className="text-white rounded-lg px-4 py-2 xl:px-6 xl:py-3 cursor-pointer flex items-center justify-center gap-2 shadow-lg select-none"
                    style={{ 
                      backgroundColor: '#f87171',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      userSelect: 'none',
                      outline: 'none'
                    }}
                  >
                    <span className="text-sm xl:text-base font-medium">Confirm Status</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8" style={{ paddingBottom: (!user || user.role !== 'admin') ? '5rem' : '2rem' }}>
          <div className="mt-6 space-y-6 xl:space-y-8">
            {/* Property Information */}
            <div className="space-y-2 xl:space-y-3">
              <div className="text-lg xl:text-xl text-gray-900">
                <span className="font-bold">Price:</span> <span className="ml-1">{formatPrice(property.price)}/{(property.pricingUnit?.replace('price-', '') || 'month').charAt(0).toUpperCase() + (property.pricingUnit?.replace('price-', '') || 'month').slice(1)}</span>
              </div>
              <div className="text-lg xl:text-xl text-gray-900">
                <span className="font-bold">Plan:</span> <span className="ml-1">{property.plan === 'flexible' ? 'Flexible' : `${property.plan} Months`}</span>
              </div>
              <div className="text-sm xl:text-base text-black bg-yellow-200 px-3 xl:px-4 py-1 xl:py-1.5 rounded w-fit flex items-center justify-center border border-black">
                <MapPin size={12} className="xl:w-4 xl:h-4 mr-1 flex-shrink-0" />
                <span>{property.location}</span>
              </div>
              <div 
                className="text-sm xl:text-base text-gray-600 flex items-center cursor-pointer hover:underline w-fit"
                onClick={() => setShowUpdatedDateModal(true)}
              >
                <Clock size={12} className="xl:w-4 xl:h-4 mr-1 flex-shrink-0" />
                <span>Updated: {getRelativeTime(property.updatedAt)}</span>
              </div>
              
              {/* Uploaded By - Admin/Staff Only */}
              {(user?.role === 'admin' || (user?.role === 'staff' && user?.isApproved)) && (
                <>
                  {('ownerName' in property && property.ownerName) || ('ownerEmail' in property && property.ownerEmail) ? (
                    <>
                      {'ownerName' in property && property.ownerName && (
                        <div className="text-lg xl:text-xl text-gray-900">
                          <span className="font-bold">Uploaded by:</span>{' '}
                          <button
                            onClick={() => {
                              if ('ownerId' in property && property.ownerId) {
                                const allUsers = getAllUsers();
                                const uploader = allUsers.find(u => u.id === property.ownerId);
                                if (uploader) {
                                  setUploaderUser({
                                    id: uploader.id,
                                    name: uploader.name,
                                    firstName: uploader.firstName,
                                    lastName: uploader.lastName,
                                    email: uploader.email,
                                    phone: uploader.phone,
                                    role: uploader.role,
                                    profileImage: uploader.profileImage,
                                    bio: uploader.bio,
                                    isApproved: uploader.isApproved
                                  });
                                  setShowUploaderProfileModal(true);
                                }
                              }
                            }}
                            className="ml-1 relative inline-flex items-center gap-1"
                          >
                            {property.ownerName}{'uploaderType' in property && property.uploaderType ? ` (${property.uploaderType})` : ''}
                            {((user?.role === 'admin' || (user?.role === 'staff' && user?.isApproved)) && 'ownerId' in property && property.ownerId && typeof window !== 'undefined') && (() => {
                              const notes = getUserNotes(property.ownerId);
                              return notes.trim().length > 0;
                            })() && (
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}></span>
                            )}
                          </button>
                        </div>
                      )}
                      {'ownerEmail' in property && property.ownerEmail && (
                        <div className="text-lg xl:text-xl text-gray-900">
                          <span className="font-bold">Email:</span> <span className="ml-1">{property.ownerEmail}</span>
                    </div>
                      )}
                    </>
                  ) : null}
                </>
              )}
                    </div>

            {/* Contact Information - Only show if available */}
            {(property.contactName || property.contactPhone || property.contactEmail) && (
              <div className="mt-6 xl:mt-3">
                <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-3 xl:mb-4">Contact Information</h3>
                <div className="space-y-3 xl:space-y-4">
                  {property.contactName && (
                    <div className="text-gray-700 xl:text-lg">
                      <strong>Contact:</strong> <span className="ml-1">{property.contactName}</span>
                    </div>
                  )}
                  {property.contactPhone && (
                    <div className="text-gray-700 xl:text-lg">
                      <strong>Phone:</strong> <span className="ml-1">{property.contactPhone}</span>
                    </div>
                  )}
                  {property.contactEmail && (
                    <div className="text-gray-700 xl:text-lg">
                      <strong>Email:</strong> <span className="ml-1">{property.contactEmail}</span>
                    </div>
                      )}
                </div>
                  </div>
            )}

            {/* Amenities Display */}
            {(property.amenities || []).length > 0 && (
              <div className="-mt-2 md:-mt-4">
                {/* Desktop: Line clamped amenities */}
                <div className="hidden md:block">
                  <div
                    className="amenities-desktop cursor-pointer"
                    style={{ width: '90%' }}
                    onClick={() => setShowAllAmenitiesModal(true)}
                  >
                    {(property.amenities || []).map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300 inline-block"
                        style={{ whiteSpace: 'normal', marginRight: '4px', marginBottom: '4px' }}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                  {/* More button - shown when amenities overflow 2 lines */}
                  <button
                    className="amenities-more-desktop bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-gray-300 transition-colors mt-1"
                    style={{ display: 'none' }}
                    onClick={() => setShowAllAmenitiesModal(true)}
                  >
                    More
                  </button>
                </div>

                {/* Mobile: Original behavior */}
                <div className="md:hidden">
                  <div
                    className="flex flex-wrap gap-2 cursor-pointer"
                    onClick={() => setShowAllAmenitiesModal(true)}
                  >
                    {(property.amenities || []).slice(0, 6).map((amenity, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        {amenity}
                      </span>
                    ))}
                    {(property.amenities || []).length > 6 && (
                      <span
                        className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-gray-300 transition-colors"
                      >
                        + {(property.amenities || []).length - 6} More
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

                </div>
              </div>
            </div>

      {/* Fixed Confirm & Book / Confirm Status Button - Mobile Only - Visible for all users */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-center gap-2">
          {((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') ? (
              <>
                <button
                  onClick={() => {
                    markPropertyAsViewed(); // Track property view
                    // Open property actions modal for all states
                    if (isPinged) {
                      // When followed, open property actions modal instead of notes directly
                      setShowThreeDotsModal(true);
                    } else if (isClosed) {
                      // Staff and admin can open property actions modal
                      markPropertyAsViewed(); // Track property view
                      setShowThreeDotsModal(true);
                    } else {
                      // Staff and admin can open property actions modal
                      markPropertyAsViewed(); // Track property view
                      setShowThreeDotsModal(true);
                    }
                  }}
                  className="flex-1 max-w-md text-white rounded-lg px-4 py-3 xl:px-6 xl:py-3.5 cursor-pointer flex items-center justify-center gap-2 select-none relative"
                  style={{ 
                    backgroundColor: isClosed
                      ? 'rgba(34, 197, 94, 0.9)' 
                      : isPinged
                        ? 'rgba(59, 130, 246, 0.9)' 
                        : 'rgba(107, 114, 128, 0.9)',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                >
                  {hasNotes && (
                    <span className="absolute left-2 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}></span>
                  )}
                  {isClosed ? (
                    <>
                      <span className="text-base xl:text-lg font-medium">Closed</span>
                    </>
                  ) : isPinged ? (
                    <>
                      <span className="text-base xl:text-lg font-medium">Followed</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base xl:text-lg font-medium">Default</span>
                    </>
                  )}
                </button>
              </>
            ) : property.status === 'available' ? (
              <button
                onClick={() => {
                  // Only allow logged-in users to book
                  if (!isAuthenticated) {
                    alert('Please login to book this property.');
                    return;
                  }
                  setBookingModalType('book');
                  setShowBookingModal(true);
                }}
                className="w-full max-w-md text-white rounded-lg px-4 py-3 xl:px-6 xl:py-3.5 cursor-pointer flex items-center justify-center gap-2 select-none"
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
                <span className="text-base xl:text-lg font-medium">Confirm & Book</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  // Only allow logged-in users to confirm status
                  if (!isAuthenticated) {
                    alert('Please login to confirm status of this property.');
                    return;
                  }
                  setBookingModalType('status');
                  setShowBookingModal(true);
                }}
                className="w-full max-w-md text-white rounded-lg px-4 py-3 xl:px-6 xl:py-3.5 cursor-pointer flex items-center justify-center gap-2 select-none"
                style={{ 
                  backgroundColor: '#f87171',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                <span className="text-base xl:text-lg font-medium">Confirm Status</span>
              </button>
            )}
          </div>
        </div>


      {/* Image Lightbox */}
      {isLightboxOpen && property.images && property.images.length > 0 && (
        <ImageLightbox
          images={property.images}
          currentIndex={currentImageIndex}
          onClose={() => {
            setIsLightboxOpen(false);
            setDisplayedImageIndex(currentImageIndex);
          }}
          onImageChange={setCurrentImageIndex}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white rounded-xl px-4 pt-3 pb-4 sm:px-6 sm:pt-2 sm:pb-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mb-4">
              <h3 className="text-xl font-semibold text-black">
                {bookingModalType === 'book' ? 'Book This Property' : 'Confirm Status of This Property'}
              </h3>
          </div>

            <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
              <button
                onClick={() => {
                  if (property) {
                    // Construct property URL using ShareManager's method
                    const propertyUrl = ShareManager.getShareUrl(property.id);
                    
                    // Format WhatsApp message with line breaks
                    const bookingText = bookingModalType === 'book' 
                      ? 'I want to confirm its availability and finalize booking.'
                      : 'I want to confirm its availability.';
                    const message = `Hi..!\n\nI am interested in this property for rent. ${bookingText} Thank you.\n\n${property.title}\n${property.location}\n\n${propertyUrl}`;
                    
                    // Use ShareManager's method with phone number support
                    ShareManager.shareWhatsAppToNumber('255755123500', message);
                  } else {
                    const bookingText = bookingModalType === 'book' 
                      ? 'I want to confirm its availability and finalize booking.'
                      : 'I want to confirm its availability.';
                    ShareManager.shareWhatsAppToNumber('255755123500', `Hi..!\n\nI am interested in a property for rent. ${bookingText} Thank you.`);
                  }
                  setShowBookingModal(false);
                }}
                className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-green-300 rounded-lg select-none"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <p className="text-sm text-gray-600">Message us via WhatsApp</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (property) {
                    // Construct property URL using ShareManager's method
                    const propertyUrl = ShareManager.getShareUrl(property.id);
                    
                    // Format SMS message with line breaks (same format as WhatsApp)
                    const bookingText = bookingModalType === 'book' 
                      ? 'I want to confirm its availability and finalize booking.'
                      : 'I want to confirm its availability.';
                    const message = `Hi..!\n\nI am interested in this property for rent. ${bookingText} Thank you.\n\n${property.title}\n${property.location}\n\n${propertyUrl}`;
                    const smsMessage = encodeURIComponent(message);
                    window.open(`sms:+255755123500?body=${smsMessage}`, '_self');
                  } else {
                    window.open('sms:+255755123500', '_self');
                  }
                  setShowBookingModal(false);
                }}
                className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-blue-300 hover:bg-blue-400 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Normal Message</p>
                  <p className="text-sm text-gray-600">Send us normal message</p>
                </div>
              </button>

              <button
                onClick={() => {
                  window.open('tel:+255755123500', '_self');
                  setShowBookingModal(false);
                }}
                className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-blue-300 hover:bg-blue-400 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Phone</p>
                  <p className="text-sm text-gray-600">Call us directly</p>
                </div>
              </button>
            </div>

              <button
              onClick={() => setShowBookingModal(false)}
              className="w-full px-4 py-2 rounded-lg font-medium transition-colors bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && (
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
              transform: notesKeyboardInset > 0 ? `translateY(-${notesKeyboardInset}px)` : 'translateY(0)',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div className="flex justify-between items-center mb-3 relative pt-1">
              <h3 className="text-xl font-semibold text-black flex-1 text-center">
                Follow-up notes
              </h3>
            </div>
            
            <textarea
              className={`w-full px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isNotesEditable ? 'bg-gray-50 cursor-pointer' : ''}`}
              placeholder={isNotesEditable ? "Add your notes about this property..." : "Double-click to edit/add notes..."}
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              readOnly={!isNotesEditable}
              onDoubleClick={(e) => {
                e.preventDefault();
                if ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') {
                  // First remove readOnly by enabling edit mode
                  setIsNotesEditable(true);
                  // Then focus after a short delay to ensure readOnly is removed
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      const textarea = e.currentTarget as HTMLTextAreaElement;
                      if (textarea) {
                        // Remove readOnly attribute directly to ensure keyboard opens
                        textarea.removeAttribute('readonly');
                        textarea.focus();
                        // Move cursor to end of text
                        const length = textarea.value.length;
                        textarea.setSelectionRange(length, length);
                      }
                    }, 0);
                  });
                }
              }}
              onTouchStart={(e) => {
                // On mobile, handle double tap to enable edit and focus
                if (!isNotesEditable && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin')) {
                  const target = e.currentTarget;
                  const now = Date.now();
                  const lastTap = (target as any).lastTap || 0;
                  
                  if (now - lastTap < 300) {
                    // Double tap detected
                    e.preventDefault();
                    setIsNotesEditable(true);
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
                  // Save notes to localStorage - staff and admin can save
                  if (typeof window !== 'undefined' && property && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin')) {
                    saveStaffNotes(property.id, notes);
                    setHasNotes(notes.trim().length > 0);
                  }
                  setIsNotesEditable(false);
                  setShowNotesModal(false);
                  // Reopen property actions modal if notes was opened from there
                  if (wasOpenedFromActionsModal) {
                    setShowThreeDotsModal(true);
                    setWasOpenedFromActionsModal(false);
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
                  setIsNotesEditable(false);
                  setShowNotesModal(false);
                  setNotes('');
                  // Reopen property actions modal if notes was opened from there
                  if (wasOpenedFromActionsModal) {
                    setShowThreeDotsModal(true);
                    setWasOpenedFromActionsModal(false);
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

      {/* Updated Date Modal */}
      {showUpdatedDateModal && property.updatedAt && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUpdatedDateModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:pt-2 sm:pb-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-gray-600 text-center font-medium mb-1">Updated on:</p>
                <p className="text-gray-600 text-center">
                  {formatDateTime(property.updatedAt)} ({getRelativeTime(property.updatedAt)})
                </p>
              </div>
              {'createdAt' in property && property.createdAt && (user?.role === 'admin' || (user?.role === 'staff' && user?.isApproved)) && (
                <div>
                  <p className="text-gray-600 text-center font-medium mb-1">Listed on:</p>
                  <p className="text-gray-600 text-center">
                    {formatDateTime(property.createdAt)} ({getRelativeTime(property.createdAt)})
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowUpdatedDateModal(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-300 text-gray-700 select-none"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal - Staff/Admin Only */}
      {showStatusConfirmationModal && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStatusConfirmationModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:pt-2 sm:pb-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mb-2">
              <h3 className="text-xl font-semibold text-black">
                Status Confirmation
              </h3>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 text-center text-[1.05rem]">
                {statusConfirmation 
                  ? (
                      <>
                        Status confirmed <span className="font-bold">{getRelativeTime(statusConfirmation.confirmedAt)}</span> by {statusConfirmation.staffName}. Click the button below to confirm again
                      </>
                    )
                  : 'The status of this property is not confirmed by any staff member. Click the button below to confirm'
                }
              </p>
            </div>

            <div className="flex gap-2 justify-start">
              <button
                onClick={() => {
                  setShowStatusConfirmationModal(false);
                  setShowConfirmByModal(true);
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
                {statusConfirmation ? 'Confirm again' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setShowStatusConfirmationModal(false);
                }}
                className="px-4 py-2 rounded-lg font-medium bg-gray-300 text-gray-700 select-none flex-1"
                style={{ 
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

      {/* Confirm By Modal */}
      {showConfirmByModal && property && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmByModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:pt-2 sm:pb-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mb-2">
              <h3 className="text-xl font-semibold text-black m-0">Confirm by:</h3>
            </div>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => {
                  if (property && user?.id && user?.name) {
                    confirmPropertyStatus(property.id, user.id, user.name);
                  }
                  if (property) {
                    // Construct property URL using ShareManager's method
                    const propertyUrl = ShareManager.getShareUrl(property.id);
                    
                    // Format WhatsApp message for status confirmation
                    const message = `Hi..!\n\nI want to confirm the status of this property. The property status is currently ${property.status === 'available' ? 'available' : 'occupied'}. Please confirm if this is correct.\n\n${property.title}\n${property.location}\n\n${propertyUrl}`;
                    
                    // Use ShareManager's method with phone number support
                    ShareManager.shareWhatsAppToNumber('255755123500', message);
                  } else {
                    ShareManager.shareWhatsAppToNumber('255755123500', 'Hi..!\n\nI want to confirm the status of a property. Please confirm if the status is correct.');
                  }
                  setShowConfirmByModal(false);
                }}
                className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-green-300 rounded-lg select-none"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <p className="text-sm text-gray-600">Message via WhatsApp</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (property && user?.id && user?.name) {
                    confirmPropertyStatus(property.id, user.id, user.name);
                  }
                  window.open('tel:+255755123500', '_self');
                  setShowConfirmByModal(false);
                }}
                className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-blue-300 rounded-lg select-none"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Phone</p>
                  <p className="text-sm text-gray-600">Call directly</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (property && user?.id && user?.name) {
                    confirmPropertyStatus(property.id, user.id, user.name);
                  }
                  if (property) {
                    // Construct property URL using ShareManager's method
                    const propertyUrl = ShareManager.getShareUrl(property.id);
                    
                    // Format SMS message for status confirmation
                    const message = `Hi..!\n\nI want to confirm the status of this property. The property status is currently ${property.status === 'available' ? 'available' : 'occupied'}. Please confirm if this is correct.\n\n${property.title}\n${property.location}\n\n${propertyUrl}`;
                    const smsMessage = encodeURIComponent(message);
                    window.open(`sms:+255755123500?body=${smsMessage}`, '_self');
                  } else {
                    window.open('sms:+255755123500', '_self');
                  }
                  setShowConfirmByModal(false);
                }}
                className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-blue-300 rounded-lg select-none"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Normal Message</p>
                  <p className="text-sm text-gray-600">Send normal message</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setShowConfirmByModal(false);
              }}
              className="w-full px-4 py-2 rounded-lg font-medium bg-gray-300 text-gray-700 select-none"
              style={{ 
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
      )}


      {/* Three Dots Options Modal - Staff/Admin Only */}
      {showThreeDotsModal && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowThreeDotsModal(false);
              if (wasOpenedFromNotesModal) {
                setShowNotesModal(true);
                setWasOpenedFromNotesModal(false);
              }
            }
          }}
        >
          <div
            className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:pt-2 sm:pb-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mb-2">
              <h3 className="text-xl font-semibold text-black m-0">Property actions</h3>
            </div>
            <div className="space-y-2">
              {(isPinged || isClosed) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowThreeDotsModal(false);
                    setShowNotesModal(false);
                    // Staff and admin can change status
                    // This will override follow-up status if property is in follow-up
                    if (((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && userId && user?.name) {
                      if (isPinged) {
                        removeFromFollowUp(property.id, userId, user.name);
                      }
                      if (isClosed) {
                        removeFromClosed(property.id, userId, user.name);
                      }
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium text-white text-base select-none"
                  style={{ 
                    backgroundColor: 'rgba(107, 114, 128, 0.9)',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                >
                  Set to Default
                </button>
              )}
              {!isPinged && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowThreeDotsModal(false);
                    setShowNotesModal(false);
                    // Staff and admin can change status
                    if (((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && userId && user?.name) {
                      addToFollowUp(property.id, userId, user.name);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium text-white text-base select-none"
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
                  Follow this property
                </button>
              )}
              {!isClosed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowThreeDotsModal(false);
                    setShowNotesModal(false);
                    // Staff and admin can change status
                    // This will override follow-up status if property is in follow-up
                    if (((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && userId && user?.name) {
                      addToClosed(property.id, userId, user.name);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium text-white text-base flex items-center justify-center gap-2 select-none"
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
                  <span>Close this property</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowThreeDotsModal(false);
                  // Load notes for staff/admin
                  if (typeof window !== 'undefined' && property) {
                    if (user?.role === 'admin' || (user?.role === 'staff' && user?.isApproved)) {
                      const notes = getStaffNotes(property.id);
                      setNotes(notes);
                    } else if (user?.id) {
                      const key = `rentapp_notes_${user.id}_${property.id}`;
                      const savedNotes = localStorage.getItem(key) || '';
                      setNotes(savedNotes);
                    }
                  }
                  setIsNotesEditable(false);
                  setWasOpenedFromActionsModal(true);
                  setShowNotesModal(true);
                }}
                className="w-full px-4 py-3 rounded-lg font-medium text-white text-base flex items-center justify-center gap-2 select-none relative"
                style={{ 
                  backgroundColor: 'rgba(107, 114, 128, 0.9)',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    outline: 'none'
                }}
              >
                {hasNotes && (
                  <span className="absolute left-2 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}></span>
                )}
                <FileText size={18} />
                <span>View/edit notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal - Staff/Admin Only */}
      {showStatusUpdateModal && property && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ touchAction: 'none', minHeight: '100vh', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStatusUpdateModal(false);
              setPendingStatus(property.status);
            }
          }}
        >
          <div 
            className="rounded-lg w-full max-w-sm mx-auto px-6 pt-3 pb-6 shadow-lg"
            style={{ backgroundColor: '#0071c2' }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div className="flex justify-center items-center mb-3 -mt-1">
                <h3 className="text-xl font-semibold text-white">
                  Change status
                </h3>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full">
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-gray-800 text-base font-medium">
                    <span className="text-base text-gray-600">[{(pendingStatus || property.status).replace(/^./, (c) => c.toUpperCase())}]</span>
                    <span>Change status</span>
                  </div>
                  <select
                    value={pendingStatus || property.status}
                    onChange={(e) => {
                      const value = e.target.value as 'available' | 'occupied' | '';
                      if (!value) return;
                      setPendingStatus(value);
                    }}
                    className="w-full appearance-none bg-white/90 text-transparent text-sm py-3 rounded-lg focus:outline-none cursor-pointer"
                    style={{ color: 'transparent' }}
                  >
                    <option value="" style={{ color: '#111827' }}>---</option>
                    <option value="available" style={{ color: '#111827' }}>Available</option>
                    <option value="occupied" style={{ color: '#111827' }}>Occupied</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    if (property && pendingStatus && pendingStatus !== property.status) {
                      // Get the property form data
                      const propertyFormData = getPropertyById(property.id);
                      if (propertyFormData) {
                        const updatedProperty = {
                          ...propertyFormData,
                          status: pendingStatus
                        };
                        if (updateProperty(property.id, updatedProperty, user?.id, user?.role)) {
                          // Refresh the property
                          const allProperties = getAllProperties();
                          const updatedProp = allProperties.find(p => p.id === property.id);
                          if (updatedProp) {
                            setProperty(updatedProp);
                            setPendingStatus(updatedProp.status);
                          }
                          setShowStatusUpdateModal(false);
                        }
                      }
                    } else {
                      setShowStatusUpdateModal(false);
                      setPendingStatus(property.status);
                    }
                  }}
                  disabled={!pendingStatus || pendingStatus === property.status}
                  className="flex-1 px-4 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium select-none"
                  style={{ 
                    backgroundColor: 'rgb(34, 197, 94)',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                >
                  <span className="text-base">Update</span>
                </button>
                <button
                  onClick={() => {
                    setShowStatusUpdateModal(false);
                    setPendingStatus(property.status);
                  }}
                  className="flex-1 px-4 py-2 bg-red-400 text-white rounded-lg font-medium select-none"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                >
                  <span className="text-base">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Popup */}
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        shareOptions={{
          property: {
            id: property.id,
            title: property.title,
            price: property.price,
            location: property.location,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.area,
            images: property.images || [],
            description: property.description,
            propertyType: 'propertyType' in property ? property.propertyType : undefined
          }
        }}
      />

      {/* Login Popup */}
      <LoginPopup
        isOpen={isLoginPopupOpen}
        onClose={() => setIsLoginPopupOpen(false)}
      />

      {/* Info Modal - Admin Only */}
      {showInfoModal && user?.role === 'admin' && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInfoModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:pt-2 sm:pb-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mb-2">
              <h3 className="text-xl font-semibold text-black m-0">Property actions</h3>
            </div>
            <p className="text-gray-600 text-center mb-4 mt-0">{infoModalMessage}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowInfoModal(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors bg-gray-300 hover:bg-gray-400 text-gray-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* All Amenities Modal */}
      {showAllAmenitiesModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setShowAllAmenitiesModal(false)}
        >
          <div
            className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:pt-2 sm:pb-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mb-4">
              <h3 className="text-xl font-semibold text-black">All Amenities</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto mb-4">
              {(property.amenities || []).map((amenity, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-base font-medium px-3.5 py-1.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                  {amenity}
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowAllAmenitiesModal(false)}
              className="w-full px-4 py-2 rounded-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-700 select-none"
            >
              OK
            </button>
          </div>
        </div>
      )}


      {/* Description Modal */}
      {showDescriptionModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            touchAction: 'none',
            minHeight: '100vh',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setShowDescriptionModal(false)}
        >
          <div
            className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:pt-2 sm:pb-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mb-1">
              <h3 className="text-xl font-semibold text-black">
                {descriptionModalView === 'description' ? 'Property description' : 'Property category'}
              </h3>
            </div>
            {descriptionModalView === 'description' ? (
              (() => {
                const description = property?.description?.trim();
                const isAutoGenerated = description && /^A\s+.*?\s+located\s+in\s+[^,]+,\s+[^.]+\.$/.test(description);


                return description && !isAutoGenerated ? (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap py-2">
                    {description}
                  </div>
                ) : (
                  <div className="text-gray-600 text-center py-2">
                    This property has no description or extra details
                  </div>
                );
              })()
            ) : (
              (() => {
                const parsedType = parsePropertyType(property?.propertyType || '');
                // Temporary debug display in UI
                const debugInfo = `DEBUG - Raw: "${property?.propertyType}", Parsed: ${parsedType ? `"${parsedType.parent}"` : 'FAILED'}`;
                // Always try to show something useful, even if parsing fails
                const displayParent = (() => {
                  if (parsedType?.parent) return parsedType.parent;

                  // Try some common fallbacks for unmapped types
                  const rawType = property?.propertyType?.toLowerCase() || '';
                  if (rawType.includes('office')) return 'Commercial Property';
                  if (rawType.includes('shop') || rawType.includes('commercial')) return 'Commercial Property';
                  if (rawType.includes('hotel') || rawType.includes('lodge')) return 'Short Stay/Hospitality';
                  if (rawType.includes('villa')) return 'Villa';
                  if (rawType.includes('land') || rawType.includes('parking')) return 'Land & Outdoor';
                  if (rawType.includes('event') || rawType.includes('hall')) return 'Event Hall';

                  // Last resort: try to extract something meaningful from the raw type
                  if (property?.propertyType) {
                    // Capitalize first letter and clean up underscores/dashes
                    return property.propertyType
                      .split(/[-_]/)
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');
                  }

                  return 'Unknown Property Type';
                })();

                return (
                  <div className="py-2">
                    <div className="space-y-3">
                      {/* Property Type Section */}
                      <div className="text-left">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">Property type</h4>
                        <div className="text-gray-700">
                          {displayParent}
                        </div>
                      </div>

                      {/* Profile Section */}
                      <div className="text-left">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">Profile</h4>
                        {parsedType?.child ? (
                          <div className="text-gray-700">
                            {parsedType.child}
                          </div>
                        ) : (
                          <div className="text-gray-600">
                            No Profile available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
            <div className="mt-3 flex justify-between">
              <button
                onClick={() => setDescriptionModalView(
                  descriptionModalView === 'description' ? 'category' : 'description'
                )}
                className="px-4 py-2 rounded-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-700"
              >
                {descriptionModalView === 'description' ? 'Property category' : 'Property description'}
              </button>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="px-4 py-2 rounded-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-700 select-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploader Profile Modal - Read Only - Admin/Staff Only */}
      {showUploaderProfileModal && uploaderUser && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUploaderProfileModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-center pt-4 pb-2 px-4 bg-white sticky top-0 z-10 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-black">Uploader Profile</h3>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="flex justify-center">
                  {uploaderUser.profileImage ? (
                    <img
                      src={uploaderUser.profileImage}
                      alt={uploaderUser.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 cursor-pointer"
                      onClick={() => {
                        setShowUploaderImagePreview(true);
                      }}
                      onTouchEnd={() => {
                        setShowUploaderImagePreview(true);
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
                      {uploaderUser.firstName || uploaderUser.name?.split(' ')[0] || 'Not provided'}
                      {uploaderUser.lastName && ` ${uploaderUser.lastName}`}
                      {!uploaderUser.firstName && !uploaderUser.lastName && uploaderUser.name && ` ${uploaderUser.name.split(' ').slice(1).join(' ')}`}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
                      {uploaderUser.email || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
                      {uploaderUser.phone || 'Not provided'}
                    </div>
                  </div>

                  {uploaderUser.bio && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300 min-h-[60px]">
                        {uploaderUser.bio}
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
                  if (uploaderUser) {
                    // Load user notes
                    const notes = getUserNotes(uploaderUser.id);
                    setUserNotes(notes);
                    setIsUserNotesEditable(false);
                    // Don't close the uploader profile modal
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

      {/* User Notes Modal - Admin/Staff Only */}
      {showUserNotesModal && uploaderUser && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && (
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
                if ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') {
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
                if (!isUserNotesEditable && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin')) {
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
                  if (typeof window !== 'undefined' && uploaderUser && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin')) {
                    saveUserNotes(uploaderUser.id, userNotes);
                  }
                  setIsUserNotesEditable(false);
                  setShowUserNotesModal(false);
                  // Reopen uploader profile modal
                  if (uploaderUser) {
                    setShowUploaderProfileModal(true);
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
                  // Reopen uploader profile modal
                  if (uploaderUser) {
                    setShowUploaderProfileModal(true);
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

      {/* Uploader Profile Image Preview */}
      {showUploaderImagePreview && uploaderUser?.profileImage && (
        <ImageLightbox
          images={[uploaderUser.profileImage]}
          currentIndex={0}
          onClose={() => setShowUploaderImagePreview(false)}
          onImageChange={() => {}}
          rounded={true}
        />
      )}
    </Layout>
  );
}
