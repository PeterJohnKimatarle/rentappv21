'use client';

import Link from 'next/link';
import { Chrome, Compass, Globe } from 'lucide-react';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useRef, useLayoutEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface InstallInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCROLL_STORAGE_KEY = 'installModalScroll';

export default function InstallInstructionsModal({ isOpen, onClose }: InstallInstructionsModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguage();
  
  // Block background scroll when modal is open
  usePreventScroll(isOpen);

  // Restore scroll position when modal opens (useLayoutEffect prevents flash)
  useLayoutEffect(() => {
    if (isOpen && contentRef.current) {
      const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (savedScroll) {
        contentRef.current.scrollTop = parseInt(savedScroll, 10);
      }
    }
  }, [isOpen]);

  // Save scroll position when navigating to terms/privacy
  const handleLinkClick = () => {
    if (contentRef.current) {
      sessionStorage.setItem(SCROLL_STORAGE_KEY, contentRef.current.scrollTop.toString());
    }
  };

  // Clear saved scroll on modal close
  const handleClose = () => {
    sessionStorage.removeItem(SCROLL_STORAGE_KEY);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center z-[60] pt-16 pb-4 px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        const modal = target.closest('.bg-white.rounded-xl');
        // Close if clicking outside the modal
        if (!modal) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col relative z-[70]"
      >
        {/* Header */}
        <div className="flex items-center justify-center pt-3 pb-2 px-4 bg-white sticky top-0 z-10 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-black">Install Rentapp</h3>
        </div>

        {/* Content */}
        <div ref={contentRef} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Get the full Rentapp experience by installing it on your phone!
              </p>
            </div>

            {/* iOS Safari Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Compass className="text-blue-600" size={20} />
                <h4 className="font-semibold text-blue-900">iPhone / iPad (Safari)</h4>
              </div>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Tap the share button <span className="font-semibold">⬆️</span></li>
                <li>Scroll down and tap <span className="font-semibold">"Add to Home Screen"</span></li>
                <li>Tap <span className="font-semibold">"Add"</span> in the top right</li>
              </ol>
            </div>

            {/* Android Chrome Instructions */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Chrome className="text-green-600" size={20} />
                <h4 className="font-semibold text-green-900">Android (Chrome)</h4>
              </div>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Tap the menu button <span className="font-semibold">⋮</span></li>
                <li>Tap <span className="font-semibold">"Add to Home screen"</span></li>
                <li>Tap <span className="font-semibold">"Add"</span></li>
              </ol>
            </div>

            {/* Other Browsers */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Globe className="text-purple-600" size={20} />
                <h4 className="font-semibold text-purple-900">Other Browsers</h4>
              </div>
              <p className="text-sm text-purple-800">
                Look for "Add to Home Screen" or "Install App" in your browser's menu or address bar.
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
              <h4 className="font-semibold text-yellow-900 mb-2">✨ Benefits of Installing:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Faster loading times</li>
                <li>• App-like experience</li>
                <li>• Easy access from home screen</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Rentapp will appear as an app icon on your home screen or app drawer after installation.
              </p>
            </div>

            {/* Terms & Conditions */}
            <div className="text-center pt-2 pb-2">
              <p className="text-sm text-gray-600">
                By using Rentapp you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline" prefetch={true} onClick={handleLinkClick}>
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline" prefetch={true} onClick={handleLinkClick}>
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="text-center mb-3">
            <span className="text-sm text-gray-600">Change language (</span>
            <button
              onClick={() => setLanguage('sw')}
              className={`text-sm ${language === 'sw' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
            >
              sw
            </button>
            <span className="text-sm text-gray-600">/</span>
            <button
              onClick={() => setLanguage('en')}
              className={`text-sm ${language === 'en' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
            >
              en
            </button>
            <span className="text-sm text-gray-600">)</span>
          </div>

          <button
            onClick={handleClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors"
          >
            Ok, I got it
          </button>
        </div>
      </div>
    </div>
  );
}
