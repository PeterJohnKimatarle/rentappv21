'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePreventScroll } from '@/hooks/usePreventScroll';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onImageChange: (index: number) => void;
  onViewDetails?: () => void;
  rounded?: boolean;
}

export default function ImageLightbox({ 
  images, 
  currentIndex, 
  onClose, 
  onImageChange,
  onViewDetails,
  rounded = false
}: ImageLightboxProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const preloadedImagesRef = useRef<Set<number>>(new Set());
  const router = useRouter();
  
  // Zoom and pan state - simpler approach
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, [currentIndex]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onImageChange(newIndex);
  }, [currentIndex, images.length, onImageChange]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onImageChange(newIndex);
  }, [currentIndex, images.length, onImageChange]);

  // Preload images function
  const preloadImage = useCallback((index: number) => {
    if (preloadedImagesRef.current.has(index)) return;
    
    const img = new window.Image();
    img.onload = () => {
      preloadedImagesRef.current.add(index);
      setPreloadedImages(new Set(preloadedImagesRef.current));
    };
    img.onerror = () => {
      // Still mark as "loaded" but we'll handle the error in the display
      preloadedImagesRef.current.add(index);
      setPreloadedImages(new Set(preloadedImagesRef.current));
    };
    img.src = images[index];
  }, [images]);

  // Preload current and adjacent images
  useEffect(() => {
    // Reset loading and error states when image changes
    setIsLoading(true);
    setImageError(false);
    
    // Preload current image
    preloadImage(currentIndex);
    
    // Preload next image
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    preloadImage(nextIndex);
    
    // Preload previous image
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    preloadImage(prevIndex);
  }, [currentIndex, images.length, preloadImage]);

  // Prevent body scroll when lightbox is open
  usePreventScroll(images.length > 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, onClose, goToPrevious, goToNext]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // Check if current image is preloaded
  const isCurrentImagePreloaded = preloadedImages.has(currentIndex);

  // Touch gesture handlers for mobile - simpler approach
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [pinchStart, setPinchStart] = useState<{ distance: number; scale: number } | null>(null);

  const minSwipeDistance = 50;

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - prepare for swipe or pan
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
      setTouchEnd(null);
      if (scale > 1) {
        // If zoomed, prepare for panning
        setIsDragging(true);
        setDragStart({ x: touch.clientX - translateX, y: touch.clientY - translateY });
      }
    } else if (e.touches.length === 2) {
      // Two touches - pinch to zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      setPinchStart({ distance, scale });
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      // Panning when zoomed - allow free panning to fill screen
      e.preventDefault();
      const touch = e.touches[0];
      setTranslateX(touch.clientX - dragStart.x);
      setTranslateY(touch.clientY - dragStart.y);
    } else if (e.touches.length === 1 && touchStart) {
      // Track for swipe
      const touch = e.touches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2 && pinchStart) {
      // Pinch zoom - allow up to 5x for full screen feel
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scaleChange = distance / pinchStart.distance;
      const newScale = Math.min(Math.max(pinchStart.scale * scaleChange, 1), 5);
      setScale(newScale);
      if (newScale === 1) {
        setTranslateX(0);
        setTranslateY(0);
      }
    }
  };

  const onTouchEnd = () => {
    if (touchStart && touchEnd && scale === 1) {
      // Single touch swipe - only when not zoomed
      const distanceX = touchStart.x - touchEnd.x;
      const distanceY = touchEnd.y - touchStart.y;
      const absDistanceX = Math.abs(distanceX);
      const absDistanceY = Math.abs(distanceY);
      
      if (rounded) {
        // For profile images: swipe in any direction to dismiss
        if (absDistanceX > minSwipeDistance || absDistanceY > minSwipeDistance) {
          onClose();
        }
      } else {
        // For property images: horizontal swipe for navigation only
        if (absDistanceX > absDistanceY) {
          // Horizontal swipe for navigation
          const isLeftSwipe = distanceX > minSwipeDistance;
          const isRightSwipe = distanceX < -minSwipeDistance;

          if (isLeftSwipe) {
            goToNext();
          } else if (isRightSwipe) {
            goToPrevious();
          }
        }
        // Vertical swipes do nothing for property images - use X button to close
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
    setPinchStart(null);
    setIsDragging(false);
  };

  // Mouse drag for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      // Allow free panning to fill screen - no strict boundaries
      setTranslateX(e.clientX - dragStart.x);
      setTranslateY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Click/tap gesture handlers - only navigate when not zoomed
  const handleImageClick = (e: React.MouseEvent) => {
    // Don't navigate if zoomed in
    if (scale > 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const imageWidth = rect.width;
    const middleX = imageWidth / 2;

    if (clickX > middleX) {
      // Clicked on the right side - go to next image
      goToNext();
    } else {
      // Clicked on the left side - go to previous image
      goToPrevious();
    }
  };

  return (
         <div 
           className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" 
           style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }} 
           onClick={(e) => e.stopPropagation()}
         >

      {/* Navigation Arrows - Desktop Only */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hidden lg:block absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronLeft size={48} />
          </button>
          <button
            onClick={goToNext}
            className="hidden lg:block absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronRight size={48} />
          </button>
        </>
      )}

      {/* Image */}
      <div 
        ref={containerRef}
        className="relative max-w-4xl max-h-[90vh] mx-4"
        style={{ 
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
          overflow: scale > 1 ? 'visible' : 'hidden'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleImageClick}
      >
        {/* Close Button - Only show for property images (not profile images) */}
        {!rounded && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white transition-colors z-20 rounded-lg p-2 cursor-pointer"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(239, 68, 68, 1)'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
          >
            <X size={24} />
          </button>
        )}
        
        {/* Reset Zoom Button - Absolute position relative to container, only show when zoomed */}
        {scale > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setScale(1);
              setTranslateX(0);
              setTranslateY(0);
            }}
            className="absolute top-14 right-2 text-white transition-colors z-20 rounded-lg p-2 cursor-pointer"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(59, 130, 246, 1)'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
            title="Reset zoom"
          >
            <ZoomOut size={24} />
          </button>
        )}


               {isLoading && !isCurrentImagePreloaded && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                     <div className="text-white text-lg font-medium">Loading image...</div>
                   </div>
                 </div>
               )}
               {imageError || !images[currentIndex] ? (
                 <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 flex flex-col items-center justify-center min-h-[56vh] relative overflow-hidden">
                   {/* Main Content */}
                   <div className="flex flex-col items-center justify-center text-center px-8">
                     <div className="mb-8">
                       <img
                         src="/icon.png"
                         alt="Rentapp Logo"
                         className="w-24 h-24 rounded-lg"
                       />
                     </div>
                     
                     <div className="text-blue-200 mb-4">
                       <div className="text-2xl font-semibold mb-1">Sorry!</div>
                       <div className="text-lg">
                         {images.length > 1 
                           ? `Image ${currentIndex + 1} is not available`
                           : 'No images available'
                         }
                       </div>
                     </div>
                     
                     {/* Call to Action */}
                     <button 
                       onClick={() => {
                         onClose();
                         router.push('/');
                       }}
                       className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                     >
                       <div className="text-white text-sm">Explore more properties</div>
                     </button>
                   </div>
                 </div>
               ) : (
                 <img
                   ref={imageRef}
                   src={images[currentIndex]}
                   alt={`Property image ${currentIndex + 1}`}
                   className={`max-w-full max-h-full object-contain select-none ${rounded ? 'rounded-full' : ''}`}
                   onLoad={handleImageLoad}
                   onError={handleImageError}
                   draggable={false}
                   style={{ 
                     opacity: isCurrentImagePreloaded ? 1 : 0.7,
                     transition: scale === 1 ? 'opacity 0.3s ease-in-out, transform 0.2s ease-out' : 'opacity 0.3s ease-in-out',
                     transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                     transformOrigin: 'center center'
                   }}
                 />
               )}
        
               {/* Image Counter - Only show when there are multiple images */}
               {images.length > 1 && (
                 <div className="absolute bottom-1 left-1 lg:bottom-3 lg:left-1 text-white text-sm px-3 py-2 rounded-lg shadow-lg flex items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                   <span className="font-medium">{`${currentIndex + 1} / ${images.length}`}</span>
                 </div>
               )}
      </div>

    </div>
  );
}
