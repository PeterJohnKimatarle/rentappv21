'use client';

import { useState } from 'react';
import { Share2, Copy, MessageCircle, Facebook, Mail, Smartphone, Link, Send, Download, FileText, Instagram } from 'lucide-react';
import { ShareManager, ShareOptions } from '@/utils/shareUtils';
import { usePreventScroll } from '@/hooks/usePreventScroll';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  shareOptions: ShareOptions;
  showOtherActions?: boolean;
}

export default function SharePopup({ isOpen, onClose, shareOptions, showOtherActions = false }: SharePopupProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [detailsCopied, setDetailsCopied] = useState(false);

  // Block background scroll when popup is open
  usePreventScroll(isOpen);

  // Format property title to ensure parentheses are included for commercial building (frame)
  const formatPropertyTitle = (title: string, propertyType?: string) => {
    if (!title) return title;
    
    // If propertyType is commercial-building-frame, format the title
    if (propertyType === 'commercial-building-frame') {
      // Ensure Frame has parentheses
      if (title.toLowerCase().includes('frame')) {
        if (!title.includes('(') && !title.includes('[')) {
          // Replace "Frame" at the end with "(Frame)"
          if (/\bFrame\s*$/i.test(title)) {
            return title.replace(/\s+Frame\s*$/i, ' (Frame)');
          }
          // Replace "Building Frame" with "Building (Frame)"
          if (/\bBuilding\s+Frame\b/i.test(title)) {
            return title.replace(/\bBuilding\s+Frame\b/i, 'Building (Frame)');
          }
        }
      } else {
        // If title doesn't include "Frame", add it
        return title + ' (Frame)';
      }
    }
    
    // Fallback: Check if title has commercial and frame but missing parentheses
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('commercial') && lowerTitle.includes('frame') && !title.includes('(') && !title.includes('[')) {
      if (/\bFrame\s*$/i.test(title)) {
        return title.replace(/\s+Frame\s*$/i, ' (Frame)');
      }
      if (/\bBuilding\s+Frame\b/i.test(title)) {
        return title.replace(/\bBuilding\s+Frame\b/i, 'Building (Frame)');
      }
    }
    
    return title;
  };

  if (!isOpen) return null;

  const handleShare = async (shareMethod: string, shareFunction: () => void | Promise<boolean>) => {
    // Facebook button does nothing in share modal (only works in post modal)
    if (shareMethod === 'facebook' && !showOtherActions) {
      return;
    }

    setIsLoading(shareMethod);
    setError(null);
    
    try {
      if (shareMethod === 'copy') {
        const success = await ShareManager.copyToClipboard(shareOptions);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          setError('Failed to copy to clipboard. Please try again.');
          setTimeout(() => setError(null), 3000);
        }
      } else {
        shareFunction();
        // Don't close immediately for app-based sharing (let user interact with app)
        // Only close for web-based sharing
        if (shareMethod === 'email' || shareMethod === 'sms') {
          // These open system dialogs, so we can close
          setTimeout(() => onClose(), 100);
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      setError('Failed to share. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDownloadImages = async () => {
    const images = shareOptions.property.images || [];
    if (images.length === 0) {
      setError('No images to download');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsDownloading(true);
    setError(null);

    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        
        try {
          let blob: Blob;
          let filename: string;

          // Handle data URLs (base64)
          if (imageUrl.startsWith('data:image')) {
            const response = await fetch(imageUrl);
            if (!response.ok) {
              console.error(`Failed to fetch data URL image ${i + 1}`);
              failCount++;
              continue;
            }
            blob = await response.blob();
            const extension = blob.type.split('/')[1] || 'jpg';
            filename = `property-image-${i + 1}.${extension}`;
          } else {
            // Handle regular URLs
            let absoluteUrl = imageUrl;
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
              const origin = window.location.origin;
              const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
              absoluteUrl = `${origin}${path}`;
            }

            const response = await fetch(absoluteUrl);
            if (!response.ok) {
              console.error(`Failed to fetch image ${i + 1} from ${absoluteUrl}: ${response.status} ${response.statusText}`);
              failCount++;
              continue;
            }
            
            blob = await response.blob();
            
            // Determine filename and extension
            let extension = 'jpg';
            if (blob.type) {
              const mimeType = blob.type.split('/')[1];
              if (mimeType && ['jpeg', 'png', 'webp', 'gif'].includes(mimeType)) {
                extension = mimeType === 'jpeg' ? 'jpg' : mimeType;
              }
            } else if (imageUrl.includes('.')) {
              const urlExtension = imageUrl.split('.').pop()?.split('?')[0];
              if (urlExtension && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(urlExtension.toLowerCase())) {
                extension = urlExtension.toLowerCase();
              }
            }
            filename = `property-image-${i + 1}.${extension}`;
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          
          // Wait a bit before removing to ensure download is triggered
          await new Promise(resolve => setTimeout(resolve, 100));
          
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          successCount++;
          console.log(`Successfully downloaded image ${i + 1}/${images.length}`);

          // Delay between downloads to avoid overwhelming the browser
          // Increased delay to ensure each download is processed
          if (i < images.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (err) {
          console.error(`Error downloading image ${i + 1}:`, err);
          failCount++;
          // Continue with next image even if one fails
        }
      }

      // Log summary
      console.log(`Download complete: ${successCount} successful, ${failCount} failed out of ${images.length} total`);
      
      if (failCount > 0 && successCount === 0) {
        setError('Failed to download images. Please check your connection and try again.');
        setTimeout(() => setError(null), 3000);
      } else if (failCount > 0) {
        setError(`Downloaded ${successCount} image(s), ${failCount} failed.`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error downloading images:', err);
      setError('Failed to download images. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyDetails = async () => {
    try {
      const property = shareOptions.property;
      const price = new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
      }).format(property.price);

      let details = `🏠 ${property.title}\n\n`;
      details += `📍 Location: ${property.location}\n`;
      details += `💰 Price: ${price}\n`;
      
      if (property.bedrooms > 0) {
        details += `🛏️ Bedrooms: ${property.bedrooms}\n`;
      }
      if (property.bathrooms > 0) {
        details += `🚿 Bathrooms: ${property.bathrooms}\n`;
      }
      if (property.area > 0) {
        details += `📐 Area: ${property.area} sqm\n`;
      }
      
      if (property.description) {
        details += `\n📝 Description:\n${property.description}\n`;
      }

      const propertyUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/property/${property.id}`
        : `https://rentapp.co.tz/property/${property.id}`;
      
      details += `\n🔗 View property: ${propertyUrl}`;

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(details);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = details;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setDetailsCopied(true);
      setTimeout(() => setDetailsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy details:', error);
      setError('Failed to copy details. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const shareButtons = [
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: 'bg-gray-400 hover:bg-gray-500',
      action: () => ShareManager.shareEmail(shareOptions),
      show: true
    },
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? Link : Copy,
      color: copied ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600',
      action: () => ShareManager.copyToClipboard(shareOptions),
      show: true
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: Send,
      color: 'bg-cyan-500 hover:bg-cyan-600',
      action: () => ShareManager.shareTelegram(shareOptions),
      show: true
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => ShareManager.shareWhatsApp(shareOptions),
      show: true
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      color: 'bg-[#14B8A6] hover:bg-[#0D9488]',
      action: () => ShareManager.shareFacebook(shareOptions),
      show: true
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-[#E4405F] via-[#C13584] to-[#833AB4] hover:from-[#D32A4F] hover:via-[#B02574] hover:to-[#732BA4]',
      action: () => {
        // Placeholder - does nothing for now
      },
      show: true
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: Smartphone,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => ShareManager.shareSMS(shareOptions),
      show: true
    }
  ];

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[70] p-4"
      style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }}
      onClick={(e) => {
        // Close when clicking outside the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="rounded-xl max-w-md w-full shadow-lg overflow-hidden"
        style={{ backgroundColor: '#0071c2' }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center pt-2 pb-2 px-6">
          <h3 className="text-2xl font-semibold text-white px-4">
            {showOtherActions ? 'Post this property' : 'Share this property'}
          </h3>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500 text-white text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3 px-6">
          {shareButtons.filter(button => {
            // In post modal (showOtherActions), show Facebook and Instagram
            if (showOtherActions) {
              return button.show && (button.id === 'facebook' || button.id === 'instagram');
            }
            // In share modal, show all buttons except Instagram
            return button.show && button.id !== 'instagram';
          }).map((button) => {
            const IconComponent = button.icon;
            const isButtonLoading = isLoading === button.id;
            
            return (
              <button
                key={button.id}
                onClick={() => handleShare(button.id, button.action)}
                disabled={isButtonLoading}
                className={`${button.color} text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isButtonLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : button.id === 'facebook' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                ) : (
                  <IconComponent size={18} />
                )}
                <span className="text-sm">{button.label}</span>
              </button>
            );
          })}
        </div>

        {/* Other Actions Heading */}
        {showOtherActions && (
          <>
            <div className="flex items-center justify-center pt-4 pb-2 px-6">
              <h3 className="text-2xl font-semibold text-white px-4">
                Other actions
              </h3>
            </div>

            {/* Other Actions Buttons */}
            <div className="grid grid-cols-2 gap-3 px-6 mt-2">
              <button
                onClick={handleDownloadImages}
                disabled={isDownloading || shareOptions.property.images.length === 0}
                className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                <span className="text-sm">Images</span>
              </button>
              <button
                onClick={handleCopyDetails}
                className={`${
                  detailsCopied 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-500 hover:bg-gray-600'
                } text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {detailsCopied ? (
                  <>
                    <Link size={18} />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span className="text-sm">Copy Details</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 px-6 pb-6 border-t border-white/20">
          <div className="text-white/80 text-xs text-center mb-4">
            {showOtherActions ? 'Post this property to your favourite social media' : 'Share this amazing property with friends and family'}
          </div>
          <button
            onClick={onClose}
            className="w-full transition-colors rounded-lg p-2 cursor-pointer font-medium bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
