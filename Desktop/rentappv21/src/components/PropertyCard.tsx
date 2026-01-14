'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Image, Clock, Heart, Pencil, Radio, Share2, ChevronLeft, ChevronRight, Phone, MessageCircle, FileText, Check, MoreVertical, Info } from 'lucide-react';
import { Property } from '@/data/properties';
import { DisplayProperty, isBookmarked, addBookmark, removeBookmark, addToFollowUp, removeFromFollowUp, addToClosed, removeFromClosed, isPropertyInFollowUpAnyUser, isPropertyClosedAnyUser, getPropertyStatus, getStaffNotes, saveStaffNotes, getPrivateNotes, savePrivateNotes } from '@/utils/propertyUtils';
import { useAuth } from '@/contexts/AuthContext';
import ImageLightbox from './ImageLightbox';
import SharePopup from './SharePopup';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShareManager } from '@/utils/shareUtils';
import Link from 'next/link';

// Smart Amenities Display Component
interface SmartAmenitiesDisplayProps {
  amenities: string[];
  onShowAll: () => void;
}

function SmartAmenitiesDisplay({ amenities, onShowAll }: SmartAmenitiesDisplayProps) {
  const [visibleAmenities, setVisibleAmenities] = useState<string[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Measure which amenities fit in the container
  useEffect(() => {
    if (!containerRef.current || !measureRef.current) return;

    const container = containerRef.current;
    const measureContainer = measureRef.current;
    const containerWidth = container.offsetWidth;

    // Create temporary elements to measure each amenity
    const tempElements: HTMLSpanElement[] = [];
    const gap = 4; // gap-1 = 4px
    let totalWidth = 0;
    let fittingCount = 0;

    // First, try to fit as many amenities as possible
    for (let i = 0; i < amenities.length; i++) {
      const amenity = amenities[i];
      const tempSpan = document.createElement('span');
      tempSpan.className = 'bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap flex-shrink-0 inline-block';
      tempSpan.textContent = amenity;
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.whiteSpace = 'nowrap';

      document.body.appendChild(tempSpan);
      const amenityWidth = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);

      // Check if this amenity would fit (plus gap if not first)
      const additionalWidth = totalWidth === 0 ? amenityWidth : totalWidth + gap + amenityWidth;

      if (additionalWidth <= containerWidth) {
        totalWidth = additionalWidth;
        fittingCount++;
      } else {
        break; // This amenity and all subsequent ones won't fit
      }
    }

    // If we can fit all amenities, show them all
    if (fittingCount === amenities.length) {
      setVisibleAmenities(amenities);
      setHiddenCount(0);
    } else {
      // Show only the fitting ones, and add space for "More" button
      const moreButtonWidth = 60; // Approximate width for "+X More" button
      const availableWidthForAmenities = containerWidth - moreButtonWidth - gap;

      // Recalculate with space reserved for "More" button
      totalWidth = 0;
      fittingCount = 0;

      for (let i = 0; i < amenities.length; i++) {
        const amenity = amenities[i];
        const tempSpan = document.createElement('span');
        tempSpan.className = 'bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap flex-shrink-0 inline-block';
        tempSpan.textContent = amenity;
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'nowrap';

        document.body.appendChild(tempSpan);
        const amenityWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);

        const additionalWidth = totalWidth === 0 ? amenityWidth : totalWidth + gap + amenityWidth;

        if (additionalWidth <= availableWidthForAmenities) {
          totalWidth = additionalWidth;
          fittingCount++;
        } else {
          break;
        }
      }

      setVisibleAmenities(amenities.slice(0, fittingCount));
      setHiddenCount(amenities.length - fittingCount);
    }
  }, [amenities]);

  return (
    <>
      {/* Hidden measurement container */}
      <div ref={measureRef} className="absolute opacity-0 pointer-events-none" />

      {/* Visible amenities container */}
      <div
        ref={containerRef}
        className="mt-2"
      >
        <div className="flex flex-nowrap gap-1 overflow-hidden">
          {visibleAmenities.map((amenity, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShowAll();
              }}
            >
              {amenity}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span
              className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full hover:bg-gray-300 transition-colors cursor-pointer flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShowAll();
              }}
            >
              +{hiddenCount} More
            </span>
          )}
        </div>
      </div>
    </>
  );
}

interface PropertyCardProps {
  property: Property | DisplayProperty;
  onBookmarkClick?: () => void;
  showMinusIcon?: boolean;
  hideBookmark?: boolean;
  showEditImageIcon?: boolean;
  onEditImageClick?: () => void;
  onStatusChange?: (newStatus: 'available' | 'occupied') => void;
  onEditClick?: () => void;
  onManageStart?: () => void;
  isActiveProperty?: boolean;
  showBookmarkConfirmation?: boolean;
  onApplyStagedChanges?: () => void;
  stagedImageCount?: number;
  renderAfterUpdated?: React.ReactNode;
  isRemovedBookmark?: boolean;
  showNotesButton?: boolean;
  showClosedButton?: boolean;
  onLoginRequired?: () => void;
}

export default function PropertyCard({ property, onBookmarkClick, showMinusIcon = false, hideBookmark = false, showEditImageIcon = false, onEditImageClick, onStatusChange, onEditClick, onManageStart, isActiveProperty = false, showBookmarkConfirmation = true, onApplyStagedChanges, stagedImageCount, renderAfterUpdated, isRemovedBookmark = false, showNotesButton = false, showClosedButton = false, onLoginRequired }: PropertyCardProps) {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize states immediately to prevent flash
  const [isClosed, setIsClosed] = useState(() => {
    if (typeof window === 'undefined') return false;
    // If showClosedButton prop is true, property is definitely closed
    if (showClosedButton) return true;
    // Otherwise check the actual status
    return isPropertyClosedAnyUser(property.id);
  });
  
  const [isPinged, setIsPinged] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Don't check follow-up if property is closed (closed takes precedence)
    if (showClosedButton || isPropertyClosedAnyUser(property.id)) return false;
    // If showNotesButton prop is true, property is definitely in follow-up
    if (showNotesButton) return true;
    // Otherwise check the actual status
    return isPropertyInFollowUpAnyUser(property.id);
  });
  
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isArrowHovered, setIsArrowHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isShareSpinning, setIsShareSpinning] = useState(false);
  const [lastViewedId, setLastViewedId] = useState<string | null>(null);
  const [showBookmarkPopup, setShowBookmarkPopup] = useState(false);
  const [showRemoveBookmarkPopup, setShowRemoveBookmarkPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const preloadedImagesRef = useRef<Set<number>>(new Set());
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showThreeDotsModal, setShowThreeDotsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [wasOpenedFromNotesModal, setWasOpenedFromNotesModal] = useState(false);
  const [wasOpenedFromActionsModal, setWasOpenedFromActionsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [hasNotes, setHasNotes] = useState(false);
  const [isNotesEditable, setIsNotesEditable] = useState(false);
  const [privateNotes, setPrivateNotes] = useState('');
  const [hasPrivateNotes, setHasPrivateNotes] = useState(false);
  const [isPrivateNotesEditable, setIsPrivateNotesEditable] = useState(false);
  const [showPrivateNotesModal, setShowPrivateNotesModal] = useState(false);
  const privateNotesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [privateNotesKeyboardInset, setPrivateNotesKeyboardInset] = useState(0);
  const [showPrivateNotesInfo, setShowPrivateNotesInfo] = useState(false);
  const [bookingModalType, setBookingModalType] = useState<'book' | 'status'>('book');
  const [pendingStatus, setPendingStatus] = useState<'available' | 'occupied' | ''>(property.status);
  const [pendingImages, setPendingImages] = useState(false);
  const [pendingDetails, setPendingDetails] = useState(false);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [notesKeyboardInset, setNotesKeyboardInset] = useState(0);
  const [showAllAmenitiesModal, setShowAllAmenitiesModal] = useState(false);

  useEffect(() => {
    setPendingStatus(property.status);
  }, [property.status]);

  const isSubmitDisabled =
    pendingStatus === property.status && !pendingImages && !pendingDetails;

  // Preload the first image when component mounts
  useEffect(() => {
    if (!preloadedImagesRef.current.has(0)) {
      const img = new window.Image();
      img.onload = () => {
        preloadedImagesRef.current.add(0);
        setIsImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        setImageError(true);
        setIsImageLoaded(true);
      };
      img.src = property.images[0];
    } else {
      setIsImageLoaded(true);
    }
  }, [property.images]);

  // Reset preview index when property changes (desktop only)
  useEffect(() => {
    setPreviewImageIndex(0);
  }, [property.id]);

  // Ensure preview index stays at 0 on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setPreviewImageIndex(0);
        setIsHovered(false);
        setIsArrowHovered(false);
      }
    };
    window.addEventListener('resize', handleResize);
    // Check on mount
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Preload adjacent images for smoother navigation
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (index >= 0 && index < property.images.length && !preloadedImagesRef.current.has(index)) {
        const img = new window.Image();
        img.src = property.images[index];
        preloadedImagesRef.current.add(index);
      }
    };

    // Preload previous and next images
    const prevIndex = previewImageIndex > 0 ? previewImageIndex - 1 : property.images.length - 1;
    const nextIndex = previewImageIndex < property.images.length - 1 ? previewImageIndex + 1 : 0;
    
    preloadImage(prevIndex);
    preloadImage(nextIndex);
  }, [previewImageIndex, property.images]);

  // Check if property is already pinged
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Don't check follow-up if property is closed (closed takes precedence)
      if (showClosedButton || isClosed) {
        setIsPinged(false);
        return;
      }
      
      // If showNotesButton is true, property is definitely in follow-up - set immediately
      if (showNotesButton) {
        setIsPinged(true);
        return;
      }
      
      const checkPinged = () => {
        // Skip if property is closed
        if (showClosedButton || isClosed) {
          setIsPinged(false);
          return;
        }
        
        // Check shared status (same for all users)
        const pinged = isPropertyInFollowUpAnyUser(property.id);
        setIsPinged(pinged);
      };
      checkPinged();

      // Listen for status changes
      window.addEventListener('propertyStatusChanged', checkPinged);
      window.addEventListener('followUpChanged', checkPinged);
      window.addEventListener('closedChanged', checkPinged);
      return () => {
        window.removeEventListener('propertyStatusChanged', checkPinged);
        window.removeEventListener('followUpChanged', checkPinged);
        window.removeEventListener('closedChanged', checkPinged);
      };
    }
  }, [property.id, showNotesButton, showClosedButton, isClosed]);

  // Check if property is already closed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If showClosedButton is true, property is definitely closed - set immediately
      if (showClosedButton) {
        setIsClosed(true);
        return;
      }
      
      const checkClosed = () => {
        // Check shared status (same for all users)
        const closed = isPropertyClosedAnyUser(property.id);
        setIsClosed(closed);
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
  }, [property.id, showClosedButton, isPinged]);

  // Check if property has notes
  useEffect(() => {
    // Check notes for all states (Default, Followed, Closed)
    if (typeof window !== 'undefined') {
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

      // Listen for storage changes
      window.addEventListener('storage', checkNotes);
      // Also listen for custom notesChanged event
      window.addEventListener('notesChanged', checkNotes);
      return () => {
        window.removeEventListener('storage', checkNotes);
        window.removeEventListener('notesChanged', checkNotes);
      };
    }
  }, [property.id, userId, user?.role, user?.isApproved]);

  // Check if property has private notes (for regular users and admins)
  useEffect(() => {
    if (typeof window !== 'undefined' && userId && hideBookmark && user && user.role !== 'staff') {
      const checkPrivateNotes = () => {
        // For admins, check all users' private notes for this property
        if (user.role === 'admin') {
          // Check if any user has notes for this property
          let hasAnyNotes = false;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('rentapp_notes_') && key.endsWith(`_${property.id}`) && !key.startsWith('rentapp_notes_staff_')) {
              const notes = localStorage.getItem(key) || '';
              if (notes.trim().length > 0) {
                hasAnyNotes = true;
                break;
              }
            }
          }
          setHasPrivateNotes(hasAnyNotes);
        } else {
          // For regular users, check their own notes
          const notes = getPrivateNotes(property.id, userId);
          setHasPrivateNotes(notes.trim().length > 0);
        }
      };
      checkPrivateNotes();

      // Listen for storage changes
      window.addEventListener('storage', checkPrivateNotes);
      window.addEventListener('privateNotesChanged', checkPrivateNotes);
      return () => {
        window.removeEventListener('storage', checkPrivateNotes);
        window.removeEventListener('privateNotesChanged', checkPrivateNotes);
      };
    }
  }, [property.id, userId, hideBookmark, user]);

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

  // Detect keyboard visibility for private notes modal
  useEffect(() => {
    if (!showPrivateNotesModal) {
      setPrivateNotesKeyboardInset(0);
      return;
    }
    const vv = typeof window !== 'undefined'
      ? (window as Window & { visualViewport?: VisualViewport }).visualViewport
      : undefined;
    if (!vv) return;
    const handleResize = () => {
      const covered = Math.max(0, window.innerHeight - vv.height);
      setPrivateNotesKeyboardInset(covered > 0 ? 100 : 0);
    };
    handleResize();
    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, [showPrivateNotesModal]);

  // Prevent body scrolling when popup is open
  usePreventScroll(showBookmarkPopup || showRemoveBookmarkPopup || showSharePopup || showActionPopup || showBookingModal || showStatusModal || showThreeDotsModal || showNotesModal || showPrivateNotesModal || showPrivateNotesInfo || showInfoModal || showAllAmenitiesModal);

  // Check bookmark status and listen for changes
  useEffect(() => {
    const checkBookmarkStatus = () => {
      setBookmarked(isBookmarked(property.id, userId));
    };

    // Check initial status
    checkBookmarkStatus();

    // Listen for bookmark changes
    const handleBookmarksChanged = () => {
      checkBookmarkStatus();
    };

    window.addEventListener('bookmarksChanged', handleBookmarksChanged);

    return () => {
      window.removeEventListener('bookmarksChanged', handleBookmarksChanged);
    };
  }, [property.id, userId]);

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price);
    // Replace TZS or TSh with Tsh (lowercase 's')
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

  // Helper function to mark property as last viewed (for blue dot indicator)
  const markPropertyAsViewed = () => {
    if (property.id) {
      // Store in sessionStorage for persistence across component remounts
      sessionStorage.setItem('lastViewedPropertyId', property.id);
      // Dispatch event to update all PropertyCard components
      const evt = new CustomEvent('lastViewedPropertyChanged', { detail: { id: property.id } });
      window.dispatchEvent(evt);
    }
  };

  const handleImageClick = () => {
    setIsLightboxOpen(true);
    setCurrentImageIndex(previewImageIndex);
    markPropertyAsViewed();
  };

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only work on desktop (xl and above)
    if (window.innerWidth >= 1280) {
      setPreviewImageIndex((prev) => (prev > 0 ? prev - 1 : property.images.length - 1));
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only work on desktop (xl and above)
    if (window.innerWidth >= 1280) {
      setPreviewImageIndex((prev) => (prev < property.images.length - 1 ? prev + 1 : 0));
    }
  };

  // Navigation is now handled by Link component for prefetching

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareSpinning(true);
    
    // Reset spinning after animation
    setTimeout(() => {
      setIsShareSpinning(false);
    }, 100);
    
    // Open SharePopup
    setTimeout(() => {
      setShowSharePopup(true);
    }, 300); // 100ms for spinning + 200ms delay
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmarkClick) {
      onBookmarkClick();
    } else if (!showBookmarkConfirmation) {
      // Directly add/remove bookmark without confirmation
      if (!userId) {
        if (onLoginRequired) {
          onLoginRequired();
        } else {
          alert('Please login to save this property.');
        }
        return;
      }
      if (bookmarked) {
        removeBookmark(property.id, userId);
        setBookmarked(false);
      } else {
        addBookmark(property.id, userId);
        setBookmarked(true);
      }
    } else {
      // If already bookmarked, show remove popup, otherwise show save popup
      if (bookmarked) {
        setShowRemoveBookmarkPopup(true);
      } else {
        setShowBookmarkPopup(true);
      }
    }
  };

  const handleSaveProperty = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        alert('Please login to save this property.');
      }
      setShowBookmarkPopup(false);
      return;
    }
    // Save bookmark to localStorage
    addBookmark(property.id, userId);
    setBookmarked(true); // Update state immediately
    setShowBookmarkPopup(false);
  };

  const handleCancelBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBookmarkPopup(false);
  };

  const handleRemoveBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) {
      setShowRemoveBookmarkPopup(false);
      return;
    }
    // Remove bookmark from localStorage
    removeBookmark(property.id, userId);
    setBookmarked(false); // Update state immediately
    setShowRemoveBookmarkPopup(false);
  };

  const handleCancelRemoveBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRemoveBookmarkPopup(false);
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

  // Keep constant border width to prevent layout shift on click
  // No colored border; indicator shown next to title instead
  const borderClass = 'border-[3px] border-transparent shadow-sm hover:shadow-md';

  const showSuccessMessage = () => {
    const event = new CustomEvent('propertyEditSuccess');
    window.dispatchEvent(event);
  };

  // Track and react to the most recently viewed property
  useEffect(() => {
    // Check sessionStorage on mount
    const storedLastViewed = sessionStorage.getItem('lastViewedPropertyId');
    if (storedLastViewed) {
      setLastViewedId(storedLastViewed);
    }
    
    // Listen for changes (session-only; do not persist across reloads)
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ id: string }>;
      if (custom && custom.detail && custom.detail.id) {
        setLastViewedId(custom.detail.id);
      }
    };
    window.addEventListener('lastViewedPropertyChanged', handler as EventListener);
    return () => {
      window.removeEventListener('lastViewedPropertyChanged', handler as EventListener);
    };
  }, []);


  return (
    <>
      <div className={`bg-white rounded-lg transition-shadow duration-200 overflow-hidden ${borderClass} relative`}>
        <div className="flex flex-row min-w-0">
          {/* Property Image */}
          <div 
            className="w-44 sm:w-52 md:w-64 lg:w-96 h-52 sm:h-60 md:h-72 lg:h-96 xl:h-80 flex-shrink-0 relative"
            onMouseEnter={() => {
              // Only handle hover on desktop (xl and above)
              if (window.innerWidth >= 1280) {
                setIsHovered(true);
              }
            }}
            onMouseLeave={() => {
              // Only handle hover on desktop (xl and above)
              if (window.innerWidth >= 1280) {
                setIsHovered(false);
                setIsArrowHovered(false);
                setPreviewImageIndex(0);
              }
            }}
          >
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-sm">Loading...</div>
              </div>
            )}
            {isActiveProperty && (
              <span className="absolute top-2 w-3 h-3 rounded-full bg-yellow-500 shadow shadow-yellow-500/60 z-20" style={{ right: '0.35rem', border: '1.5px solid black' }} />
            )}
            {imageError || !property.images[0] ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden" onClick={handleImageClick}>
                {/* Main Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <div className="p-6">
                    <img
                      src="/icon.png"
                      alt="Rentapp Logo"
                      className="w-16 h-16 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: Always show first image, Desktop: Show preview index */}
              <img
                src={property.images[0]}
                alt={property.title}
                  className="w-full h-full object-cover cursor-pointer xl:hidden"
                onClick={handleImageClick}
                onError={() => setImageError(true)}
                style={{ 
                  opacity: isImageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
                <img
                  src={property.images[previewImageIndex]}
                  alt={property.title}
                  className="hidden xl:block w-full h-full object-cover cursor-pointer"
                  onClick={handleImageClick}
                  onError={() => setImageError(true)}
                  style={{ 
                    opacity: isImageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                />
                {/* Navigation Arrows - Only on Desktop (xl and above) */}
                {property.images.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    <button
                      onClick={handlePreviousImage}
                      onMouseEnter={() => {
                        if (window.innerWidth >= 1280) setIsArrowHovered(true);
                      }}
                      onMouseLeave={() => {
                        if (window.innerWidth >= 1280) setIsArrowHovered(false);
                      }}
                      className={`hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-md px-3.5 py-2 shadow-lg transition-opacity duration-200 z-30 items-center justify-center cursor-pointer ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={26} />
                    </button>
                    {/* Right Arrow */}
                    <button
                      onClick={handleNextImage}
                      onMouseEnter={() => {
                        if (window.innerWidth >= 1280) setIsArrowHovered(true);
                      }}
                      onMouseLeave={() => {
                        if (window.innerWidth >= 1280) setIsArrowHovered(false);
                      }}
                      className={`hidden xl:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-md px-3.5 py-2 shadow-lg transition-opacity duration-200 z-30 items-center justify-center cursor-pointer ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                      aria-label="Next image"
                    >
                      <ChevronRight size={26} />
                    </button>
                  </>
                )}
              </>
            )}
            {/* Status Banner */}
            <div className={`absolute top-1 left-1 px-2 py-0.5 xl:px-3 xl:py-1 rounded text-xs xl:text-sm font-medium xl:font-semibold border-[1.5px] border-black ${
              property.status === 'available' 
                ? 'bg-green-400 text-black' 
                : 'bg-red-400 text-white'
            }`}>
              {property.status === 'available' ? 'Available' : 'Occupied'}
            </div>
            {/* Area Display - Below Status Banner */}
            {property.area > 0 && (() => {
              const areaUnit = 'areaUnit' in property ? property.areaUnit || 'sqm' : 'sqm';
              const areaValue = typeof property.area === 'number' ? property.area : parseInt(String(property.area || '0').replace(/,/g, '')) || 0;
              const unit = areaUnit === 'acre' ? (areaValue === 1 ? 'Acre' : 'Acres') : 'sqm';
              return (
                <div className="absolute top-[1.75rem] xl:top-[2rem] left-1 px-1 py-0 xl:px-1 xl:py-0 rounded text-xs xl:text-sm font-medium xl:font-semibold border-[1.5px] border-black bg-white text-gray-900 z-10 flex items-center justify-center">
                  {areaValue.toLocaleString()} {unit}
                </div>
              );
            })()}
            {/* Image Counter - Mobile: Always visible with icon + count */}
            <div className="flex xl:hidden absolute bottom-1 left-1 px-2 py-1.5 rounded-lg flex items-center space-x-0.5 text-white text-base font-medium" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image size={16} className="w-4 h-4" />
              <span>{property.images.length}</span>
            </div>
            {/* Image Counter - Desktop: With hover behavior */}
            <div className="hidden xl:flex absolute bottom-2.5 left-1 lg:bottom-5 lg:left-1 text-white text-base font-medium px-3 py-1.5 xl:px-3.5 xl:py-1.5 rounded-lg shadow-lg items-center space-x-0.5 xl:space-x-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              {!isArrowHovered && (
                <>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image size={16} className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
                </>
              )}
              <span className="font-medium">
                {isArrowHovered 
                  ? (property.images.length === 0 ? '0 / 0' : `${previewImageIndex + 1} / ${property.images.length}`)
                  : property.images.length
                }
              </span>
            </div>
            
            {/* Edit Button - Bottom right corner of image (for admin/staff on my-properties) */}
            {hideBookmark && (onStatusChange || onEditClick || onEditImageClick) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onManageStart) {
                    onManageStart();
                  }
                  setShowActionPopup(true);
                  setPendingStatus(property.status);
                  setPendingImages(false);
                  setPendingDetails(false);
                }}
                className="flex xl:hidden absolute bottom-1 right-1 px-2 py-1.5 rounded-lg flex items-center space-x-0.5 text-white text-base font-medium z-20"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  outline: 'none',
                  touchAction: 'manipulation'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                title="Edit property"
              >
                <Pencil size={16} className="w-4 h-4" />
                <span style={{ userSelect: 'none' }}>Edit</span>
              </button>
            )}
            {/* Edit Button - Desktop version */}
            {hideBookmark && (onStatusChange || onEditClick || onEditImageClick) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onManageStart) {
                    onManageStart();
                  }
                  setShowActionPopup(true);
                  setPendingStatus(property.status);
                  setPendingImages(false);
                  setPendingDetails(false);
                }}
                className="hidden xl:flex absolute bottom-2.5 right-1 lg:bottom-5 lg:right-1 text-white text-base font-medium px-3 py-1.5 xl:px-3.5 xl:py-1.5 rounded-lg shadow-lg items-center space-x-0.5 xl:space-x-1 z-20"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  outline: 'none',
                  touchAction: 'manipulation'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                title="Edit property"
              >
                <Pencil size={16} className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
                <span className="font-medium" style={{ userSelect: 'none' }}>Edit</span>
              </button>
            )}
            
            {showEditImageIcon && onEditImageClick && null}
            
            {!hideBookmark && (
              <div 
                className="absolute top-1 right-1 px-2 py-1 xl:px-3 xl:py-1.5 rounded-md flex items-center justify-center text-white text-sm xl:text-base cursor-pointer z-20" 
                style={{ 
                  backgroundColor: showMinusIcon ? '#ef4444' : 'rgba(0, 0, 0, 0.5)'
                }}
                onMouseEnter={(e) => {
                  if (showMinusIcon) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fca5a5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (showMinusIcon) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#ef4444';
                  }
                }}
                onClick={handleBookmarkClick}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {showMinusIcon ? (
                  <span 
                    className="text-xl xl:text-2xl font-bold w-6 h-6 xl:w-7 xl:h-7 flex items-center justify-center"
                    style={{ 
                      transform: 'scaleX(1.3)', 
                      userSelect: 'none',
                      color: 'white',
                      lineHeight: '1'
                    }}
                  >
                    −
                  </span>
                ) : (
                  <Heart 
                    size={24} 
                    className="w-6 h-6 xl:w-7 xl:h-7" 
                    style={{ 
                      color: bookmarked ? 'white' : 'white', 
                      fill: bookmarked ? '#ef4444' : 'none',
                      strokeWidth: bookmarked ? 1.5 : 1.5
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Property Details */}
          <Link 
            href={`/property/${property.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
            prefetch={true}
            className={`flex-1 pt-0 pb-1 px-1.5 sm:pt-0 sm:pb-2.5 sm:px-3 md:pt-0 md:pb-3 md:px-4 lg:pt-0 lg:pb-5 lg:px-6 min-w-0 overflow-hidden cursor-pointer ${hideBookmark ? 'flex flex-col' : ''}`}
          >
            <div className="flex flex-col mb-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-0 flex items-center gap-1 min-w-0 flex-1">
                  <span className="truncate">{property.propertyTitle || property.title}</span>
                  {property.id === lastViewedId && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5 flex-shrink-0"></span>
                  )}
                </h3>
              </div>
                <div className="text-base sm:text-lg text-gray-600 mb-0 truncate">
                  <span className="font-bold">Price:</span> {formatPrice(property.price)}/{'pricingUnit' in property ? (property.pricingUnit?.replace('price-', '') || 'month') : 'month'}
                </div>
              <div className="text-base sm:text-lg text-gray-600 mb-0 truncate">
                <span className="font-bold">Plan:</span> {property.plan === 'flexible' ? 'Flexible' : `${property.plan} Months`}
              </div>
              {/* Uploader Information - Admin/Staff Only */}
              {(user?.role === 'admin' || (user?.role === 'staff' && user?.isApproved)) && (
                <div className="text-base sm:text-lg text-gray-600 mb-0 truncate">
                  {hideBookmark && ('ownerId' in property && property.ownerId === user?.id) ? (
                    // On my-properties page: show only type with braces
                    <span><span className="font-bold">Uploader:</span> {property.uploaderType ? `(${property.uploaderType})` : ''}</span>
                  ) : (
                    // On homepage: show name and type
                    ('ownerName' in property && property.ownerName) && (
                      <span><span className="font-bold">Uploader:</span> {property.ownerName.split(' ')[0]}{property.uploaderType ? ` (${property.uploaderType})` : ''}</span>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="text-sm sm:text-base text-gray-900 mb-0.5 bg-yellow-200 px-1 py-0 rounded w-fit max-w-full -mt-1 flex items-center justify-center border border-black min-w-0 overflow-hidden">
              <MapPin size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate min-w-0">{property.location}</span>
            </div>
            <div className="text-sm sm:text-base text-gray-500 mb-1 flex items-center ml-1 min-w-0 overflow-hidden">
              <Clock size={14} className="mr-0.5 flex-shrink-0" />
              <span className="truncate">Updated: {getRelativeTime(property.updatedAt)}</span>
            </div>

            {/* Amenities Display - Hidden for admin and staff */}
            {(property.amenities || []).length > 0 && (!user || (user.role !== 'admin' && !(user.role === 'staff' && user.isApproved))) && (
              <SmartAmenitiesDisplay
                amenities={property.amenities || []}
                onShowAll={() => {
                  markPropertyAsViewed();
                  setShowAllAmenitiesModal(true);
                }}
              />
            )}
            {/* Custom content after Updated section in card preview */}
            {renderAfterUpdated && (
              <div 
                className="mt-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {renderAfterUpdated}
              </div>
            )}
            {/* Confirm & Book / Confirm Status Button - Visible for all users (logged in or not) except approved staff/admin */}
            {!hideBookmark && (!user || (user.role !== 'admin' && !(user.role === 'staff' && user.isApproved))) && (
              <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                {property.status === 'available' ? (
                  <button
                    className="flex-1 flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg text-base font-medium select-none"
                    style={{ 
                      backgroundColor: 'rgba(34, 197, 94, 0.9)', 
                      maxWidth: '250px',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      userSelect: 'none',
                      outline: 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // Only allow logged-in users to book
                      if (!isAuthenticated) {
                        if (onLoginRequired) {
                          onLoginRequired();
                        } else {
                          alert('Please login to book this property.');
                        }
                        return;
                      }
                      markPropertyAsViewed();
                      setBookingModalType('book');
                      setShowBookingModal(true);
                    }}
                  >
                    <span>Confirm & Book</span>
                  </button>
                ) : (
                  <button
                    className="flex-1 flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg text-base font-medium select-none"
                    style={{ 
                      backgroundColor: '#f87171', 
                      maxWidth: '250px',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      userSelect: 'none',
                      outline: 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // Only allow logged-in users to confirm status
                      if (!isAuthenticated) {
                        if (onLoginRequired) {
                          onLoginRequired();
                        } else {
                          alert('Please login to confirm status of this property.');
                        }
                        return;
                      }
                      markPropertyAsViewed();
                      setBookingModalType('status');
                      setShowBookingModal(true);
                    }}
                  >
                    <span>Confirm Status</span>
                  </button>
                )}
              </div>
            )}
            {/* Status Button - Only for staff and admin users */}
            {!hideBookmark && user && ((user.role === 'staff' && user.isApproved) || user.role === 'admin') && (
              <div className="mt-2 flex items-center" onClick={(e) => e.stopPropagation()}>
                {/* Status Button - Shows current property status */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg text-base font-medium select-none relative"
                  style={{ 
                    backgroundColor: (showNotesButton || isPinged)
                        ? 'rgba(59, 130, 246, 0.9)' 
                      : (showClosedButton || isClosed)
                        ? 'rgba(34, 197, 94, 0.9)' 
                        : 'rgba(107, 114, 128, 0.9)',
                    maxWidth: '250px',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    outline: 'none',
                    touchAction: 'manipulation'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    markPropertyAsViewed(); // Track property view
                    // Open property actions modal for all states
                    if (showNotesButton || isPinged) {
                      // When followed, open property actions modal instead of notes directly
                      setShowThreeDotsModal(true);
                    } else if (showClosedButton || isClosed) {
                      // Staff and admin can open property actions modal
                      markPropertyAsViewed(); // Track property view
                      setShowThreeDotsModal(true);
                    } else {
                      // Staff and admin can open property actions modal
                      markPropertyAsViewed(); // Track property view
                      setShowThreeDotsModal(true);
                    }
                  }}
                >
                  {hasNotes && (
                    <span className="absolute left-2 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}></span>
                  )}
                  {(showClosedButton || isClosed) ? (
                    <>
                      <span className="select-none" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>Closed</span>
                    </>
                  ) : (showNotesButton || isPinged) ? (
                    <>
                      <span className="select-none" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>Followed</span>
                    </>
                  ) : (
                    <>
                      <span className="select-none" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>Default</span>
                    </>
                  )}
                </button>
              </div>
            )}
            {hideBookmark && user && ((user.role === 'staff' && user.isApproved) || user.role === 'admin') && (onStatusChange || onEditClick || onEditImageClick) && (
              <div className="mt-auto flex items-center" onClick={(e) => e.stopPropagation()}>
                {/* Status Button - Shows current property status */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg text-base font-medium select-none relative"
                  style={{ 
                    backgroundColor: (showNotesButton || isPinged)
                      ? 'rgba(59, 130, 246, 0.9)' 
                      : (showClosedButton || isClosed)
                        ? 'rgba(34, 197, 94, 0.9)' 
                        : 'rgba(107, 114, 128, 0.9)',
                    maxWidth: '250px',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    outline: 'none',
                    touchAction: 'manipulation'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    markPropertyAsViewed();
                    setShowThreeDotsModal(true);
                  }}
                >
                  {hasNotes && (
                    <span className="absolute left-2 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}></span>
                  )}
                  {(showClosedButton || isClosed) ? (
                    <span className="select-none" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>Closed</span>
                  ) : (showNotesButton || isPinged) ? (
                    <span className="select-none" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>Followed</span>
                  ) : (
                    <span className="select-none" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>Default</span>
                  )}
                </button>
              </div>
            )}
            {/* Private Notes Button - For regular users and admins (not staff) on my-properties */}
            {hideBookmark && user && userId && user.role !== 'staff' && (
              <div className="mt-auto flex items-center" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    // Load private notes
                    if (typeof window !== 'undefined') {
                      if (user.role === 'admin') {
                        // For admin, don't load into textarea - modal will show all notes
                        setPrivateNotes('');
                      } else {
                        const notes = getPrivateNotes(property.id, userId);
                        setPrivateNotes(notes);
                      }
                    }
                    setIsPrivateNotesEditable(false);
                    setShowPrivateNotesModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg text-base font-medium select-none relative"
                  style={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.9)',
                    maxWidth: '250px',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    outline: 'none',
                    touchAction: 'manipulation'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                  }}
                >
                  {hasPrivateNotes && (
                    <span className="absolute left-2 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}></span>
                  )}
                  <FileText size={18} />
                  <span className="select-none" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>Private Notes</span>
                </button>
              </div>
            )}
            {/* Removed inline share button on landing; moved to details popup */}
          </Link>
        </div>
      </div>

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
            images: property.images,
            description: property.description,
            propertyType: 'propertyType' in property ? property.propertyType : undefined
          }
        }}
      />

      {/* Image Lightbox */}
      {isLightboxOpen && (
        <ImageLightbox
          images={property.images}
          currentIndex={currentImageIndex}
          onClose={() => setIsLightboxOpen(false)}
          onImageChange={setCurrentImageIndex}
          onViewDetails={() => {
            setIsLightboxOpen(false);
            const queryString = searchParams.toString();
            router.push(`/property/${property.id}${queryString ? `?${queryString}` : ''}`);
          }}
        />
      )}


      {/* Bookmark Popup */}
      {showBookmarkPopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4" 
          style={{ overflow: 'hidden', touchAction: 'none', minHeight: '100vh', height: '100%' }}
          onClick={(e) => {
            // Only close on desktop when clicking the backdrop
            if (window.innerWidth >= 1280 && e.target === e.currentTarget) {
              setShowBookmarkPopup(false);
            } else {
              e.stopPropagation();
            }
          }}
        >
          <div 
            className="rounded-lg max-w-sm w-full p-6 shadow-lg"
            style={{ backgroundColor: '#0071c2' }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 px-4" style={{ borderBottom: '2px solid #eab308' }}>Save this Property</h3>
                <p className="text-white/80 text-sm">Are you sure you want to save this property to your bookmarks?</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveProperty}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={handleCancelBookmark}
                  className="flex-1 bg-red-400/75 hover:bg-red-500/75 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Bookmark Popup */}
      {showRemoveBookmarkPopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4" 
          style={{ overflow: 'hidden', touchAction: 'none', minHeight: '100vh', height: '100%' }}
          onClick={(e) => {
            // Only close on desktop when clicking the backdrop
            if (window.innerWidth >= 1280 && e.target === e.currentTarget) {
              setShowRemoveBookmarkPopup(false);
            } else {
              e.stopPropagation();
            }
          }}
        >
          <div 
            className="rounded-lg max-w-sm w-full p-6 shadow-lg"
            style={{ backgroundColor: '#0071c2' }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 px-4">Remove from Bookmarks</h3>
                <p className="text-white/80 text-sm">Are you sure you want to remove this property from your bookmarks?</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleRemoveBookmark}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={handleCancelRemoveBookmark}
                  className="flex-1 bg-red-400/75 hover:bg-red-500/75 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Selection Popup */}
      {showActionPopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ touchAction: 'none', minHeight: '100vh', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="rounded-lg w-full max-w-sm mx-auto p-6 shadow-lg"
            style={{ backgroundColor: '#0071c2' }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="space-y-3">
              {onStatusChange && (
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
              )}
              {onEditImageClick && (
                <button
                  onClick={() => {
                    setPendingImages(true);
                    onEditImageClick();
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white text-base px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ border: '1px solid #eab308' }}
                >
                  <Image size={15} />
                  Change images
                </button>
              )}
              {onEditClick && (
                <button
                  onClick={() => {
                    setPendingDetails(true);
                    onEditClick();
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white text-base px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ border: '1px solid #eab308' }}
                >
                  <Pencil size={15} />
                  Edit details
                </button>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    // Apply staged changes if pendingDetails or pendingImages is true
                    if ((pendingDetails || pendingImages) && onApplyStagedChanges) {
                      onApplyStagedChanges();
                    }
                    if (pendingStatus !== property.status && onStatusChange) {
                      onStatusChange(pendingStatus as 'available' | 'occupied');
                    }
                    setShowActionPopup(false);
                    setPendingImages(false);
                    setPendingDetails(false);
                    showSuccessMessage();
                  }}
                  disabled={isSubmitDisabled}
                  className={`w-1/2 text-base px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-white ${
                    isSubmitDisabled
                      ? 'bg-green-500 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowActionPopup(false);
                    setPendingStatus(property.status);
                    setPendingImages(false);
                    setPendingDetails(false);
                  }}
                  className="w-1/2 text-white text-base px-4 py-3 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
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
                className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-green-300 hover:bg-green-400 rounded-lg transition-colors"
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

      {/* Private Notes Modal - For regular users and admins (not staff) */}
      {showPrivateNotesModal && user && userId && user.role !== 'staff' && (
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
              transform: privateNotesKeyboardInset > 0 ? `translateY(-${privateNotesKeyboardInset}px)` : 'translateY(0)',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div className="flex justify-between items-center mb-3 relative pt-1">
              <h3 className="text-xl font-semibold text-black flex-1 text-center">
                {user.role === 'admin' ? 'Private Notes (All Users)' : 'Private Notes'}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrivateNotesInfo(true);
                }}
                className="absolute right-0 p-2 text-blue-500 hover:bg-gray-300 rounded transition-all cursor-pointer"
                title="Privacy information"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              >
                <Info size={22} />
              </button>
            </div>
            
            {user.role === 'admin' ? (
              // Admin view: Show all users' private notes (read-only)
              <div className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-800 max-h-60 overflow-y-auto">
                {(() => {
                  const allNotes: Array<{ userId: string; notes: string }> = [];
                  if (typeof window !== 'undefined') {
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('rentapp_notes_') && key.endsWith(`_${property.id}`) && !key.startsWith('rentapp_notes_staff_')) {
                        const match = key.match(/rentapp_notes_(.+?)_(.+)/);
                        if (match) {
                          const notes = localStorage.getItem(key) || '';
                          if (notes.trim().length > 0) {
                            allNotes.push({ userId: match[1], notes });
                          }
                        }
                      }
                    }
                  }
                  if (allNotes.length === 0) {
                    return <p className="text-gray-500 text-sm">No private notes from any users.</p>;
                  }
                  return allNotes.map((item, index) => (
                    <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                      <p className="text-xs text-gray-500 mb-1">User ID: {item.userId}</p>
                      <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              // Regular user view: Editable notes
              <textarea
                ref={privateNotesTextareaRef}
                className={`w-full px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isPrivateNotesEditable ? 'bg-gray-50 cursor-pointer' : ''}`}
                placeholder={isPrivateNotesEditable ? "Add your private notes about this property..." : "Double-click to edit/add notes..."}
                rows={6}
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                readOnly={!isPrivateNotesEditable}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setIsPrivateNotesEditable(true);
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      if (privateNotesTextareaRef.current) {
                        privateNotesTextareaRef.current.removeAttribute('readonly');
                        privateNotesTextareaRef.current.focus();
                        const length = privateNotesTextareaRef.current.value.length;
                        privateNotesTextareaRef.current.setSelectionRange(length, length);
                      }
                    }, 0);
                  });
                }}
                onTouchStart={(e) => {
                  if (!isPrivateNotesEditable) {
                    const target = e.currentTarget;
                    const now = Date.now();
                    const lastTap = (target as any).lastTap || 0;
                    
                    if (now - lastTap < 300) {
                      e.preventDefault();
                      setIsPrivateNotesEditable(true);
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
            )}

            <div className="flex gap-2 mt-1.5">
              {user.role !== 'admin' && (
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && userId) {
                      savePrivateNotes(property.id, userId, privateNotes);
                      setHasPrivateNotes(privateNotes.trim().length > 0);
                      // Track the property when notes are edited
                      if (onManageStart) {
                        onManageStart();
                      }
                    }
                    setIsPrivateNotesEditable(false);
                    setShowPrivateNotesModal(false);
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
              )}
              <button
                onClick={() => {
                  setIsPrivateNotesEditable(false);
                  setShowPrivateNotesModal(false);
                  // Reset to saved notes
                  if (typeof window !== 'undefined' && userId && user.role !== 'admin') {
                    const savedNotes = getPrivateNotes(property.id, userId);
                    setPrivateNotes(savedNotes);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium text-white select-none ${user.role === 'admin' ? 'w-full' : 'flex-1'}`}
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
                {user.role === 'admin' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Private Notes Info Modal */}
      {showPrivateNotesInfo && (
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
              setShowPrivateNotesInfo(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:pt-2 sm:pb-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mb-2">
              <h3 className="text-xl font-semibold text-black m-0">Private Notes</h3>
            </div>
            <div className="mb-4 space-y-3">
              <p className="text-gray-700 text-base leading-relaxed">
                {user?.role === 'admin' 
                  ? 'These private notes are only visible to the uploader of each property. As an admin, you can view all users\' private notes, but they cannot see each other\'s notes.'
                  : 'These notes are completely private and only visible to you. No one else can see them.'}
              </p>
              {user?.role !== 'admin' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                  <p className="text-gray-700 text-sm leading-relaxed font-medium mb-1">Why private notes are important:</p>
                  <ul className="text-gray-700 text-sm leading-relaxed space-y-1 ml-4 list-disc">
                    <li>Track inquiries and interactions with potential tenants</li>
                    <li>Remember important details about your property</li>
                    <li>Keep notes on maintenance schedules and reminders</li>
                    <li>Document property history and updates</li>
                    <li>Manage multiple properties more effectively</li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowPrivateNotesInfo(false)}
              className="w-full px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Ok, I got it
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
              ref={notesTextareaRef}
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
                      if (notesTextareaRef.current) {
                        // Remove readOnly attribute directly to ensure keyboard opens
                        notesTextareaRef.current.removeAttribute('readonly');
                        notesTextareaRef.current.focus();
                        // Move cursor to end of text
                        const length = notesTextareaRef.current.value.length;
                        notesTextareaRef.current.setSelectionRange(length, length);
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
                    if (typeof window !== 'undefined' && ((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin')) {
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
                className={`px-4 py-2 rounded-lg font-medium text-white select-none ${user?.role === 'admin' ? 'flex-1' : 'flex-1'}`}
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


      {/* Status Modal */}
      {showStatusModal && (
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
              setShowStatusModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:pt-2 sm:pb-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                    // Staff and admin can change status
                    if (((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && userId && user?.name) {
                  if (isPinged) {
                        removeFromFollowUp(property.id, userId, user.name);
                  }
                  if (isClosed) {
                        removeFromClosed(property.id, userId, user.name);
                      }
                  }
                  setShowStatusModal(false);
                }}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors text-white text-base"
                style={{ backgroundColor: 'rgba(107, 114, 128, 0.9)' }}
                onMouseEnter={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(107, 114, 128, 1)'}
                onMouseLeave={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(107, 114, 128, 0.9)'}
              >
                Default
              </button>
              {!isPinged && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                    // Staff and admin can change status
                    if (((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && userId && user?.name) {
                      addToFollowUp(property.id, userId, user.name);
                  }
                  setShowStatusModal(false);
                }}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors text-white text-base"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.9)' }}
                onMouseEnter={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(59, 130, 246, 1)'}
                onMouseLeave={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(59, 130, 246, 0.9)'}
              >
                  Set to Follow Up
              </button>
              )}
              {!isClosed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                    // Staff and admin can change status
                    // This will override follow-up status if property is in follow-up
                    if (((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && userId && user?.name) {
                      addToClosed(property.id, userId, user.name);
                  }
                  setShowStatusModal(false);
                }}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors text-white text-base"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.9)' }}
                onMouseEnter={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(34, 197, 94, 1)'}
                onMouseLeave={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(34, 197, 94, 0.9)'}
              >
                  Set to Closed
              </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusModal(false);
                }}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors text-gray-800 text-base bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Three Dots Options Modal */}
      {showThreeDotsModal && (
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
              {((user?.role === 'staff' && user?.isApproved) || user?.role === 'admin') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowThreeDotsModal(false);
                    // Load notes for staff/admin
                    if (typeof window !== 'undefined') {
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
              )}
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
