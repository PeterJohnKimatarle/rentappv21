import { useEffect, useLayoutEffect } from 'react';

// Global scroll lock manager
class GlobalScrollLock {
  private static instance: GlobalScrollLock;
  private modalCount = 0;
  private scrollY = 0;
  private isLocked = false;

  static getInstance(): GlobalScrollLock {
    if (!GlobalScrollLock.instance) {
      GlobalScrollLock.instance = new GlobalScrollLock();
    }
    return GlobalScrollLock.instance;
  }

  lock(): void {
    this.modalCount++;
    if (this.modalCount === 1 && !this.isLocked) {
      this.isLocked = true;
      this.scrollY = typeof window !== 'undefined' ?
        (window.scrollY || window.pageYOffset || 0) : 0;

      const body = document.body;
      const html = document.documentElement;

      // Lock scroll
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${this.scrollY}px`;
      body.style.width = '100%';
      body.style.left = '0';
      body.style.right = '0';
    }
  }

  unlock(): void {
    this.modalCount = Math.max(0, this.modalCount - 1);
    if (this.modalCount === 0 && this.isLocked) {
      this.isLocked = false;

      const body = document.body;
      const html = document.documentElement;

      // Unlock scroll
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.left = '';
      body.style.right = '';

      // Restore scroll position
      window.scrollTo(0, this.scrollY);
    }
  }

  isScrollLocked(): boolean {
    return this.isLocked;
  }
}

const globalScrollLock = GlobalScrollLock.getInstance();

// Global modal lock manager for gesture disabling
class GlobalModalLock {
  private static instance: GlobalModalLock;
  private modalCount = 0;

  static getInstance(): GlobalModalLock {
    if (!GlobalModalLock.instance) {
      GlobalModalLock.instance = new GlobalModalLock();
    }
    return GlobalModalLock.instance;
  }

  register(): void {
    this.modalCount++;
  }

  unregister(): void {
    this.modalCount = Math.max(0, this.modalCount - 1);
  }

  isAnyModalOpen(): boolean {
    return this.modalCount > 0;
  }
}

const globalModalLock = GlobalModalLock.getInstance();

/**
 * Hard global guard: Check if any blocking modal or overlay is currently visible
 * This function checks both the global modal lock state AND DOM presence of modal overlays
 * to catch modals that may not be registered (portaled, auth-controlled, etc.)
 * @returns true if any modal/overlay is blocking interactions, false otherwise
 */
export function isInteractionLocked(): boolean {
  // First check: Global modal lock state (for registered modals)
  if (globalModalLock.isAnyModalOpen()) {
    return true;
  }

  // Second check: DOM presence of modal overlays (catches unregistered modals)
  // Check for common modal patterns: fixed inset-0 with high z-index
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    // Check for elements with fixed positioning and inset-0 pattern
    // Common patterns: "fixed inset-0", "fixed" with top/right/bottom/left = 0
    const potentialModals = document.querySelectorAll(
      '[class*="fixed"][class*="inset-0"]'
    );
    
    for (const element of potentialModals) {
      const el = element as HTMLElement;
      const computedStyle = window.getComputedStyle(el);
      
      // Must be fixed position
      if (computedStyle.position !== 'fixed') {
        continue;
      }
      
      // Check z-index (modals typically have z-index >= 50)
      const zIndex = parseInt(computedStyle.zIndex) || 0;
      if (zIndex < 50) {
        continue;
      }
      
      // Check if it covers viewport (inset-0 pattern)
      const top = computedStyle.top;
      const bottom = computedStyle.bottom;
      const left = computedStyle.left;
      const right = computedStyle.right;
      const coversViewport = (
        (top === '0px' && bottom === '0px') ||
        (left === '0px' && right === '0px') ||
        (top === '0px' && left === '0px' && bottom === '0px' && right === '0px')
      );
      
      if (!coversViewport) {
        continue;
      }
      
      // Verify it's actually visible
      if (
        computedStyle.display !== 'none' &&
        computedStyle.visibility !== 'hidden' &&
        parseFloat(computedStyle.opacity) > 0
      ) {
        return true;
      }
    }
    
    // Also check for elements with inline styles that indicate modals
    // This catches modals that use inline styles instead of classes
    const allFixed = document.querySelectorAll('[style*="position: fixed"]');
    for (const element of allFixed) {
      const el = element as HTMLElement;
      const computedStyle = window.getComputedStyle(el);
      
      if (computedStyle.position !== 'fixed') continue;
      
      const zIndex = parseInt(computedStyle.zIndex) || 0;
      if (zIndex < 50) continue;
      
      // Check if covers viewport
      const top = computedStyle.top;
      const bottom = computedStyle.bottom;
      const coversViewport = (top === '0px' && bottom === '0px');
      
      if (coversViewport && 
          computedStyle.display !== 'none' &&
          computedStyle.visibility !== 'hidden' &&
          parseFloat(computedStyle.opacity) > 0) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if any modal is currently open (for disabling gestures)
 * @deprecated Use isInteractionLocked() instead for more reliable detection
 * @returns true if any modal is open, false otherwise
 */
export function isAnyModalOpen(): boolean {
  return globalModalLock.isAnyModalOpen();
}

/**
 * Hook to prevent page scrolling when a popup/modal is open
 * Also registers the modal in the global modal lock for gesture disabling
 * Uses global scroll lock to ensure only one lock regardless of multiple callers
 *
 * Usage:
 * ```tsx
 * const [isPopupOpen, setIsPopupOpen] = useState(false);
 * usePreventScroll(isOpen);
 *
 * // Also add these styles to your popup overlay:
 * <div
 *   className="fixed inset-0 ..."
 *   style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }}
 * >
 * ```
 *
 * @param isOpen - Whether the popup/modal is open
 */
export function usePreventScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      globalScrollLock.lock();
      globalModalLock.register();
    } else {
      globalScrollLock.unlock();
      globalModalLock.unregister();
    }

    // Cleanup on unmount
    return () => {
      if (isOpen) {
        globalScrollLock.unlock();
        globalModalLock.unregister();
      }
    };
  }, [isOpen]);
}

