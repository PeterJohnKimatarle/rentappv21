'use client';

import { Smartphone, Info, Zap, Heart } from 'lucide-react';
import { usePreventScroll } from '@/hooks/usePreventScroll';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppInfoModal({ isOpen, onClose }: AppInfoModalProps) {
  // Block background scroll when modal is open
  usePreventScroll(isOpen);

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
          <h3 className="text-xl font-semibold text-black">App info</h3>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Welcome to Rentapp! Here's what you can do with our installed app.
              </p>
            </div>

            {/* App Features */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="text-blue-600" size={20} />
                <h4 className="font-semibold text-blue-900">App Features</h4>
              </div>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center space-x-2">
                  <Zap className="text-blue-500" size={16} />
                  <span>Faster loading times</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Smartphone className="text-blue-500" size={16} />
                  <span>Full mobile app experience</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Heart className="text-blue-500" size={16} />
                  <span>Enhanced user experience</span>
                </li>
              </ul>
            </div>

            {/* How to Use */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Smartphone className="text-green-600" size={20} />
                <h4 className="font-semibold text-green-900">How to Use</h4>
              </div>
              <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                <li>Tap the app icon from your home screen</li>
                <li>Browse properties with improved speed</li>
                <li>Enjoy the full mobile app experience</li>
              </ol>
            </div>

            {/* Version Info */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="text-purple-600" size={20} />
                <h4 className="font-semibold text-purple-900">App Version</h4>
              </div>
              <p className="text-sm text-purple-800">
                <strong>Release:</strong> Stable<br/>
                <strong>Platform:</strong> Progressive Web App<br/>
                Optimized for speed and reliability
              </p>
            </div>

            {/* Support */}
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
              <h4 className="font-semibold text-yellow-900 mb-2">💡 Help & Support</h4>
              <p className="text-sm text-yellow-800 mb-2">
                If you encounter any issues with the app, try refreshing or reinstalling.
              </p>
              <p className="text-sm text-yellow-800">
                <strong>Contact:</strong> 0755-123-500<br/>
                <strong>Support:</strong> Available 24/7 for app users
              </p>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Thank you for choosing Rentapp! Enjoy your property search experience.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Built for renters, brokers, and owners.
              </p>
              <div className="flex justify-center items-center gap-4 mt-4">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">
                  Terms & Conditions
                </a>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors"
          >
            Ok, I got it
          </button>
        </div>
      </div>
    </div>
  );
}



