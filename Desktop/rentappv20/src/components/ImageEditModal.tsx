'use client';

import { useState, useEffect } from 'react';
import { Image, Info } from 'lucide-react';
import { usePreventScroll } from '@/hooks/usePreventScroll';

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: (wasStaging?: boolean) => void;
  currentImages: string[];
  onStageChanges?: (mainImage: string, additionalImages: string[]) => void;
}

export default function ImageEditModal({ isOpen, onClose, currentImages, onStageChanges }: ImageEditModalProps) {
  const [showMainImagePopup, setShowMainImagePopup] = useState(false);
  const [showOtherImagesPopup, setShowOtherImagesPopup] = useState(false);
  const [tempMainImage, setTempMainImage] = useState<string>(() => currentImages[0] ?? '');
  const [tempAdditionalImages, setTempAdditionalImages] = useState<string[]>(() => currentImages.length > 1 ? currentImages.slice(1) : []);
  const [originalMainImage, setOriginalMainImage] = useState<string>('');
  const [originalAdditionalImages, setOriginalAdditionalImages] = useState<string[]>([]);
  // Staged changes - only applied when Submit is clicked
  const [stagedMainImage, setStagedMainImage] = useState<string | null>(null);
  const [stagedAdditionalImages, setStagedAdditionalImages] = useState<string[] | null>(null);
  // Popup editing state - separate from main display
  const [popupMainImage, setPopupMainImage] = useState<string>('');
  const [popupAdditionalImages, setPopupAdditionalImages] = useState<string[]>([]);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showRemoveAllInfo, setShowRemoveAllInfo] = useState(false);

  // Prevent scroll when modal is open
  usePreventScroll(isOpen);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTempMainImage(currentImages[0] ?? '');
      setTempAdditionalImages(currentImages.length > 1 ? currentImages.slice(1) : []);
      setOriginalMainImage(currentImages[0] ?? '');
      setOriginalAdditionalImages(currentImages.length > 1 ? currentImages.slice(1) : []);
      // Reset staged changes
      setStagedMainImage(null);
      setStagedAdditionalImages(null);
    } else {
      // Reset all popups when main modal closes
      setShowMainImagePopup(false);
      setShowOtherImagesPopup(false);
      setShowDeleteAllConfirm(false);
      setShowRemoveAllInfo(false);
    }
  }, [isOpen, currentImages]);

  // Initialize popup state when popup opens
  useEffect(() => {
    if (showMainImagePopup) {
      // Use staged value if exists, otherwise use current temp value
      setPopupMainImage(stagedMainImage !== null ? stagedMainImage : tempMainImage);
    }
  }, [showMainImagePopup, stagedMainImage, tempMainImage]);

  useEffect(() => {
    if (showOtherImagesPopup) {
      // Use staged value if exists, otherwise use current temp value
      setPopupAdditionalImages(stagedAdditionalImages !== null ? stagedAdditionalImages : tempAdditionalImages);
    }
  }, [showOtherImagesPopup, stagedAdditionalImages, tempAdditionalImages]);

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPopupMainImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const readers = files.map(file => {
        const reader = new FileReader();
        return new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results => {
        setPopupAdditionalImages(prev => [...prev, ...results]);
      });
    }
  };

  const removeTempAdditionalImage = (index: number) => {
    setPopupAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageLongPress = (e: React.TouchEvent<HTMLImageElement> | React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    if (popupAdditionalImages.length > 0) {
      setShowDeleteAllConfirm(true);
    }
  };

  const handleConfirmDeleteAll = () => {
    setPopupAdditionalImages([]);
    setShowDeleteAllConfirm(false);
  };

  const handleCancelDeleteAll = () => {
    setShowDeleteAllConfirm(false);
  };

  const hasAnyChanges = () => {
    // Check if there are staged changes
    const finalMainImage = stagedMainImage !== null ? stagedMainImage : tempMainImage;
    const finalAdditionalImages = stagedAdditionalImages !== null ? stagedAdditionalImages : tempAdditionalImages;
    
    if (finalMainImage !== originalMainImage) return true;
    if (finalAdditionalImages.length !== originalAdditionalImages.length) return true;
    return finalAdditionalImages.some((img, idx) => img !== originalAdditionalImages[idx]);
  };

  const handleMainImagePopupOk = () => {
    // Stage the changes - don't apply until Submit is clicked
    setStagedMainImage(popupMainImage);
    setShowMainImagePopup(false);
    // Reset file input
    const input = document.getElementById('main-image-upload-popup') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleOtherImagesPopupOk = () => {
    // Stage the changes - don't apply until Submit is clicked
    setStagedAdditionalImages([...popupAdditionalImages]);
    setShowOtherImagesPopup(false);
    // Reset file input
    const input = document.getElementById('additional-images-upload-popup') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleSave = () => {
    // Stage changes - don't save yet
    const finalMainImage = stagedMainImage !== null ? stagedMainImage : tempMainImage;
    const finalAdditionalImages = stagedAdditionalImages !== null ? stagedAdditionalImages : tempAdditionalImages;
    
    if (onStageChanges) {
      onStageChanges(finalMainImage, finalAdditionalImages);
    }
    onClose(true); // Pass true to indicate we're staging changes
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        style={{ minHeight: '100vh', height: '100%', touchAction: 'none' }}
      >
        <div 
          className="bg-white rounded-xl p-6 w-full mx-4 shadow-2xl overflow-hidden max-w-md xl:max-w-[22rem]"
          style={{ touchAction: 'pan-y', transform: 'translateY(-10px)' }}
        >
          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={() => {
                // Set popup main image synchronously before opening to prevent flash
                setPopupMainImage(stagedMainImage !== null ? stagedMainImage : tempMainImage);
                  setShowMainImagePopup(true);
              }}
              className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12"
              style={{ backgroundColor: '#6b7280' }}
            >
              <Image size={20} />
              <span className="text-base whitespace-nowrap">Change main image ({stagedMainImage !== null ? (stagedMainImage ? '1' : '0') : (tempMainImage ? '1' : '0')})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                // Set popup images synchronously before opening to prevent flash
                setPopupAdditionalImages(stagedAdditionalImages !== null ? stagedAdditionalImages : tempAdditionalImages);
                setShowOtherImagesPopup(true);
              }}
              className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12"
              style={{ backgroundColor: '#6b7280' }}
            >
              <Image size={20} />
              <span className="text-base whitespace-nowrap">Other images ({stagedAdditionalImages !== null ? stagedAdditionalImages.length : tempAdditionalImages.length})</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!hasAnyChanges()}
            >
              Submit
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 text-white rounded-lg font-medium"
              style={{ backgroundColor: '#ef4444' }}
              onClick={() => onClose(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Popup - Matching list-property form */}
      {showMainImagePopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ touchAction: 'none', minHeight: '100vh', height: '100%', pointerEvents: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="rounded-xl px-4 pt-2 pb-4 w-full mx-4 shadow-2xl overflow-hidden bg-white" 
            style={{ maxWidth: '24rem', pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-black">Main image</h3>
            </div>
            
            {/* Image Preview (if popup image exists) */}
            {popupMainImage && (
              <div className="mb-4">
                <img 
                  src={popupMainImage} 
                  alt="Main image preview" 
                  className="w-full h-48 sm:h-56 object-cover rounded border"
                />
              </div>
            )}
            
            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="hidden"
                id="main-image-upload-popup"
              />
              <button
                type="button"
                className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12"
                style={{ backgroundColor: '#0071c2' }}
                onClick={() => {
                  document.getElementById('main-image-upload-popup')?.click();
                }}
              >
                <Image size={20} />
                <span className="text-base whitespace-nowrap">{popupMainImage ? 'Change main image' : 'Add main image'} ({popupMainImage ? '1' : '0'})</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  onClick={handleMainImagePopupOk}
                >
                  OK
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 text-white rounded-lg font-medium"
                  style={{ backgroundColor: '#ef4444' }}
                  onClick={() => {
                    // Restore to original popup state and close popup (discard changes in popup)
                    setPopupMainImage(stagedMainImage !== null ? stagedMainImage : tempMainImage);
                    setShowMainImagePopup(false);
                    // Reset file input
                    const input = document.getElementById('main-image-upload-popup') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Images Popup - Matching list-property form */}
      {showOtherImagesPopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ touchAction: 'none', minHeight: '100vh', height: '100%', pointerEvents: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className={`rounded-xl px-4 pt-2 pb-4 w-full mx-4 shadow-2xl overflow-hidden ${popupAdditionalImages.length > 0 ? 'flex flex-col max-h-[85vh] xl:max-h-[95vh]' : ''} bg-white`}
            style={{ maxWidth: '24rem', pointerEvents: 'auto', paddingBottom: popupAdditionalImages.length > 0 ? 'env(safe-area-inset-bottom)' : undefined }}
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {popupAdditionalImages.length > 0 ? (
              <>
            {/* Header - Fixed */}
                <div className="px-4 pt-3 flex-shrink-0 relative pb-3 -mx-4 -mt-2">
                  <div className="flex items-center justify-start relative">
                    <h3 className="text-xl font-bold text-black leading-tight">Other images</h3>
                <button
                  type="button"
                  onClick={() => setShowRemoveAllInfo(true)}
                      className="absolute right-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                  title="How to remove all images"
                      style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                      <Info size={22} className="text-gray-700" />
                </button>
                  </div>
            </div>
            
            {/* Images Preview - Scrollable */}
                <div className="flex-1 overflow-y-auto px-4 pb-2 -mx-4 min-h-0">
                  <div className="mb-0">
                  <div className="flex flex-col gap-2">
                      {popupAdditionalImages.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <img 
                          src={image} 
                          alt={`Additional ${index + 1}`} 
                          className="w-3/4 xl:w-4/5 h-44 sm:h-48 object-cover rounded border"
                          onTouchStart={(e) => {
                            const timer = setTimeout(() => {
                              handleImageLongPress(e);
                            }, 800);
                            (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer = timer;
                          }}
                          onTouchEnd={(e) => {
                            const timer = (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer;
                            if (timer) {
                              clearTimeout(timer);
                              (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer = undefined;
                            }
                          }}
                          onTouchMove={(e) => {
                            const timer = (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer;
                            if (timer) {
                              clearTimeout(timer);
                              (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer = undefined;
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleImageLongPress(e);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeTempAdditionalImage(index)}
                          onDragStart={(e) => e.preventDefault()}
                          onMouseDown={(e) => {
                            // Prevent text selection on mouse down
                            if (e.detail > 1) {
                              e.preventDefault(); // Prevent double-click selection
                            }
                          }}
                          onMouseEnter={(e) => {
                            // Only apply hover effect on desktop
                            if (window.innerWidth >= 1280) {
                              const button = e.currentTarget as HTMLButtonElement;
                              button.style.backgroundColor = '#dc2626';
                              const span = button.querySelector('span') as HTMLElement;
                              if (span) {
                                span.style.color = '#000000';
                              }
                            }
                          }}
                          onMouseLeave={(e) => {
                            // Only apply hover effect on desktop
                            if (window.innerWidth >= 1280) {
                              const button = e.currentTarget as HTMLButtonElement;
                              button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                              const span = button.querySelector('span') as HTMLElement;
                              if (span) {
                                span.style.color = '#ffffff';
                              }
                            }
                          }}
                          className="flex-1 xl:flex-none xl:w-[60px] px-4 py-2 xl:px-2 xl:py-1.5 text-white rounded-lg font-medium self-center text-2xl xl:text-xl select-none outline-none focus:outline-none"
                          style={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            WebkitTouchCallout: 'none',
                            WebkitTapHighlightColor: 'transparent',
                            outline: 'none',
                            touchAction: 'manipulation',
                            transition: 'none'
                          }}
                          onTouchEnd={(e) => {
                            // Ensure button resets to default state on mobile after touch
                            if (window.innerWidth < 1280) {
                              const button = e.currentTarget as HTMLButtonElement;
                              button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                              const span = button.querySelector('span') as HTMLElement;
                              if (span) {
                                span.style.color = '#ffffff';
                              }
                            }
                          }}
                        >
                          <span 
                            style={{ 
                              transform: 'scaleX(1.3)', 
                              display: 'inline-block', 
                              userSelect: 'none',
                              color: '#ffffff',
                              transition: 'none'
                            }}
                          >
                            −
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
              </>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-black">Other images</h3>
                </div>
              </>
            )}
            
            {/* Buttons */}
            <div className={`flex flex-col gap-2 ${popupAdditionalImages.length > 0 ? 'p-4 pt-2 pb-3 flex-shrink-0 -mx-4' : ''}`}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAdditionalImagesUpload}
                className="hidden"
                id="additional-images-upload-popup"
              />
              <button
                type="button"
                className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12"
                style={{ backgroundColor: '#0071c2' }}
                onClick={() => {
                  document.getElementById('additional-images-upload-popup')?.click();
                }}
              >
                <Image size={20} />
                <span className="text-base whitespace-nowrap">{popupAdditionalImages.length > 0 ? 'Add more images' : 'Add images'} ({popupAdditionalImages.length})</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  onClick={handleOtherImagesPopupOk}
                >
                  OK
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 text-white rounded-lg font-medium"
                  style={{ backgroundColor: '#ef4444' }}
                  onClick={() => {
                    // Restore to original popup state and close popup (discard changes in popup)
                    setPopupAdditionalImages(stagedAdditionalImages !== null ? stagedAdditionalImages : tempAdditionalImages);
                    setShowOtherImagesPopup(false);
                    // Reset file input
                    const input = document.getElementById('additional-images-upload-popup') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Popup */}
      {showDeleteAllConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelDeleteAll();
            }
            e.stopPropagation();
          }}
        >
          <div 
            className="rounded-xl p-4 w-full mx-4 shadow-2xl overflow-hidden max-w-[20rem] xl:max-w-[20rem]"
            style={{ backgroundColor: '#0071c2' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white mb-1.5">Remove All Images</h3>
              <p className="text-white/80 text-sm">Are you sure you want to remove all images at once ?</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleCancelDeleteAll}
                className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-gray-800 rounded-lg font-medium transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove All Info Popup */}
      {showRemoveAllInfo && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRemoveAllInfo(false);
            }
            e.stopPropagation();
          }}
        >
          <div 
            className="rounded-xl p-4 w-full mx-4 shadow-2xl overflow-hidden max-w-[20rem] xl:max-w-[20rem]"
            style={{ backgroundColor: '#0071c2' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white mb-1.5">Remove All Images</h2>
              <p className="text-white/80 text-base xl:hidden"><span className="font-bold">Remove all images at once</span><br />by long pressing any image.</p>
              <p className="text-white/80 text-base hidden xl:block"><span className="font-bold">Remove all images at once</span><br />right-click any image.</p>
            </div>
            <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowRemoveAllInfo(false)}
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
