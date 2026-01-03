"use client";

import Layout from '@/components/Layout';
import { Phone, MessageCircle } from 'lucide-react';
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
            <div className="text-center mb-1">
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
                      className="bg-white px-6 py-3 rounded-xl shadow-lg border border-blue-500 border-2 shadow-blue-100 cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-black">Phone/WhatsApp</h3>
                        <p className="text-gray-600">0755-123-500</p>
                      </div>
                    </div>

                  <div className="bg-white px-6 py-3 rounded-xl shadow-lg border border-blue-500 border-2 shadow-blue-100">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-black">Business Hours</h3>
                      <p className="text-gray-600">24/7 Available</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            </div>

          </div>
        </div>

        {/* Contact Options Popup */}
        {isContactPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ touchAction: 'none', minHeight: '100vh', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={(e) => {
            // Only close on desktop when clicking the backdrop
            if (window.innerWidth >= 1280 && e.target === e.currentTarget) {
              setIsContactPopupOpen(false);
            } else {
              e.stopPropagation();
            }
          }}>
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-center items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Choose Contact Method</h3>
              </div>
              
              <div className="space-y-3 mb-4">
                <button
                  onClick={handleWhatsAppMessage}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">WhatsApp</p>
                    <p className="text-sm text-gray-600">Message or call via WhatsApp</p>
                  </div>
                </button>

                <button
                  onClick={handleNormalCall}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Normal Call</p>
                    <p className="text-sm text-gray-600">Regular phone call</p>
                  </div>
                </button>

                <button
                  onClick={handleNormalMessage}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
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
                className="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#ef4444', color: 'white' }}
                onMouseEnter={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
                onMouseLeave={(e: React.MouseEvent) => (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
    </Layout>
  );
}
