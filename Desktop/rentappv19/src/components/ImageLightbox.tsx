'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePreventScroll } from '@/hooks/usePreventScroll';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onImageChange: (index: number) => void;
  onViewDetails?: () => void;
}

export default function ImageLightbox({ 
  images, 
  currentIndex, 
  onClose, 
  onImageChange,
  onViewDetails
}: ImageLightboxProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const preloadedImagesRef = useRef<Set<number>>(new Set());
  const router = useRouter();

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

  // Touch gesture handlers for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Click/tap gesture handlers
  const handleImageClick = (e: React.MouseEvent) => {
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
         <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }} onClick={(e) => e.stopPropagation()}>

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
               className="relative max-w-4xl max-h-[90vh] mx-4 cursor-pointer"
               onTouchStart={onTouchStart}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEnd}
               onClick={handleImageClick}
             >
               {/* Close Button - Inside Image at Top Edge */}
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
                   src={images[currentIndex]}
                   alt={`Property image ${currentIndex + 1}`}
                   className="max-w-full max-h-full object-contain"
                   onLoad={handleImageLoad}
                   onError={handleImageError}
                   style={{ 
                     opacity: isCurrentImagePreloaded ? 1 : 0.7,
                     transition: 'opacity 0.3s ease-in-out'
                   }}
                 />
               )}
        
               {/* Image Counter */}
               <div className="absolute bottom-1 left-1 lg:bottom-3 lg:left-1 text-white text-sm px-3 py-2 rounded-lg shadow-lg flex items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                 <span className="font-medium">{images.length === 0 ? '0 / 0' : `${currentIndex + 1} / ${images.length}`}</span>
               </div>
      </div>

    </div>
  );
}
