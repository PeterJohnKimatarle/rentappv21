"use client";

import Layout from '@/components/Layout';
import { Phone, MessageCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { usePreventScroll } from '@/hooks/usePreventScroll';

export default function ContactPage() {
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);

  // Block background scroll when popup is open
  usePreventScroll(isContactPopupOpen);


  const handlePhoneCardClick = () => {
    setIsContactPopupOpen(true);
  };

  const handleWhatsAppMessage = () => {
    window.open('https://wa.me/255755123500', '_blank');
    setIsContactPopupOpen(false);
  };

  const handleNormalCall = () => {
    window.open('tel:+255755123500', '_self');
    setIsContactPopupOpen(false);
  };

  const handleNormalMessage = () => {
    window.open('sms:+255755123500', '_self');
    setIsContactPopupOpen(false);
  };

  return (
    <Layout>
        <div className="bg-gray-50 pt-2 pb-2 min-h-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-600 mb-1">
                Contact Us
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We&apos;re here to help you with any questions about our services.
              </p>
            </div>

            <div className="flex justify-center">
              {/* Contact Information */}
              <div className="space-y-3 max-w-4xl w-full">
                <div>
                  <h2 className="text-2xl font-bold text-gray-600 mb-1 text-center">Get in Touch</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div 
                      onClick={handlePhoneCardClick}
                      className="bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 cursor-pointer"
                    >
                      <MessageCircle className="w-7 h-7" />
                      <div className="text-left">
                        <span className="text-lg font-semibold block">Phone/WhatsApp</span>
                        <p className="text-base text-white/90">0755-123-500</p>
                      </div>
                    </div>

                  <div className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105">
                    <Clock className="w-7 h-7" />
                    <div className="text-left">
                      <span className="text-lg font-semibold block">Business Hours</span>
                      <p className="text-base text-white/90">24/7 Available</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-600 mb-4 text-center">Follow Us</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <a
                    href="https://facebook.com/rentapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1877F2] hover:bg-[#166FE5] text-white px-4 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-base font-semibold">Facebook</span>
                  </a>

                  <a
                    href="https://instagram.com/rentapptz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-[#E4405F] via-[#C13584] to-[#833AB4] hover:from-[#D32A4F] hover:via-[#B02574] hover:to-[#732BA4] text-white px-4 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-base font-semibold">Instagram</span>
                  </a>

                  <a
                    href="https://youtube.com/@rentapptz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="text-base font-semibold">YouTube</span>
                  </a>

                  <a
                    href="https://tiktok.com/@rentapptz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#333333] hover:bg-[#404040] text-white px-4 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <span className="text-base font-semibold">TikTok</span>
                  </a>

                  <a
                    href="https://linkedin.com/company/rentapp-tanzania"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0077B5] hover:bg-[#006399] text-white px-4 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-base font-semibold">LinkedIn</span>
                  </a>

                  <a
                    href="https://twitter.com/rentapptz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white px-4 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-base font-semibold">(Twitter)</span>
                  </a>
                </div>
              </div>

            </div>

            </div>

          </div>
        </div>

        {/* Contact Options Popup */}
        {isContactPopupOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50" 
            style={{ touchAction: 'none', minHeight: '100vh', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsContactPopupOpen(false);
              }
            }}
          >
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-center items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Choose Contact Method</h3>
              </div>
              
              <div className="space-y-3 mb-4">
                <button
                  onClick={handleWhatsAppMessage}
                  className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-green-300 hover:bg-green-400 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">WhatsApp</p>
                    <p className="text-sm text-gray-600">Message or call via WhatsApp</p>
                  </div>
                </button>

                <button
                  onClick={handleNormalCall}
                  className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-blue-300 hover:bg-blue-400 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Normal Call</p>
                    <p className="text-sm text-gray-600">Regular phone call</p>
                  </div>
                </button>

                <button
                  onClick={handleNormalMessage}
                  className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-blue-300 hover:bg-blue-400 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Normal Message</p>
                    <p className="text-sm text-gray-600">SMS text message</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setIsContactPopupOpen(false)}
                className="w-full px-4 py-2 rounded-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
    </Layout>
  );
}
