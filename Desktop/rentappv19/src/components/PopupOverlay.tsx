'use client';

import { ReactNode } from 'react';
import { usePreventScroll } from '@/hooks/usePreventScroll';

interface PopupOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  zIndex?: number;
}

/**
 * Reusable PopupOverlay component with built-in scroll prevention
 * 
 * Usage:
 * ```tsx
 * <PopupOverlay isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <div className="bg-white rounded-xl p-6">
 *     Your popup content here
 *   </div>
 * </PopupOverlay>
 * ```
 */
export default function PopupOverlay({
  isOpen,
  onClose,
  children,
  className = '',
  overlayClassName = '',
  zIndex = 50
}: PopupOverlayProps) {
  // Automatically prevent scroll when popup is open
  usePreventScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${overlayClassName}`}
      style={{ touchAction: 'none', minHeight: '100vh', height: '100%', zIndex }}
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) {
          onClose();
        }
        e.stopPropagation();
      }}
    >
      <div
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

