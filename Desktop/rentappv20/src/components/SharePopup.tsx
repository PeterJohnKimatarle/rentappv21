'use client';

import { useState } from 'react';
import { Share2, Copy, MessageCircle, Facebook, Mail, Smartphone, Link, Send } from 'lucide-react';
import { ShareManager, ShareOptions } from '@/utils/shareUtils';
import { usePreventScroll } from '@/hooks/usePreventScroll';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  shareOptions: ShareOptions;
}

export default function SharePopup({ isOpen, onClose, shareOptions }: SharePopupProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => ShareManager.shareFacebook(shareOptions),
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
            Share this property
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
          {shareButtons.filter(button => button.show).map((button) => {
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
                ) : (
                  <IconComponent size={18} />
                )}
                <span className="text-sm">{button.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 px-6 pb-6 border-t border-white/20">
          <div className="text-white/80 text-xs text-center mb-4">
            Share this amazing property with friends and family
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
