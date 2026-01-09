/**
 * Guest User Tracking Utilities
 * Basic standard guest user tracking
 */

const GUEST_USERS_KEY = 'rentapp_guest_users';

interface GuestUser {
  id: string;
  firstVisit: number;        // timestamp of first visit
  lastVisit: number;          // timestamp of last visit
  isActive: boolean;          // true if currently active
}

/**
 * Generate a unique guest ID
 */
const generateGuestId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all guest users
 */
export const getGuestUsers = (): GuestUser[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = localStorage.getItem(GUEST_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error getting guest users:', error);
    return [];
  }
};

/**
 * Get guest user count
 */
export const getGuestUserCount = (): number => {
  return getGuestUsers().length;
};

/**
 * Get active guest count
 */
export const getActiveGuestCount = (): number => {
  return getGuestUsers().filter(guest => guest.isActive).length;
};

/**
 * Track guest visit - called when guest first visits
 */
export const trackGuestVisit = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const guests = getGuestUsers();
    const guestIdKey = 'rentapp_current_guest_id';
    
    // Check if there's an existing guest ID for this session
    let guestId = sessionStorage.getItem(guestIdKey);
    let existingGuest: GuestUser | undefined;
    
    if (guestId) {
      existingGuest = guests.find(g => g.id === guestId);
    }
    
    const now = Date.now();
    
    if (existingGuest) {
      // Update existing guest
      existingGuest.lastVisit = now;
      existingGuest.isActive = true;
    } else {
      // Check if there's a recent inactive guest (same user returning)
      const RECENT_GUEST_THRESHOLD = 5 * 60 * 1000; // 5 minutes
      const recentInactiveGuest = guests
        .filter(g => !g.isActive)
        .sort((a, b) => b.lastVisit - a.lastVisit)[0];
      
      if (recentInactiveGuest && (now - recentInactiveGuest.lastVisit) < RECENT_GUEST_THRESHOLD) {
        // Reuse the recent inactive guest
        guestId = recentInactiveGuest.id;
        sessionStorage.setItem(guestIdKey, guestId);
        recentInactiveGuest.lastVisit = now;
        recentInactiveGuest.isActive = true;
      } else {
        // Create new guest
        guestId = generateGuestId();
        sessionStorage.setItem(guestIdKey, guestId);
        
        const newGuest: GuestUser = {
          id: guestId,
          firstVisit: now,
          lastVisit: now,
          isActive: true
        };
        
        guests.push(newGuest);
      }
    }
    
    localStorage.setItem(GUEST_USERS_KEY, JSON.stringify(guests));
  } catch (error) {
    console.error('Error tracking guest visit:', error);
  }
};

/**
 * Mark guest as inactive - called when guest leaves/closes app
 */
export const markGuestInactive = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const guestIdKey = 'rentapp_current_guest_id';
    const guestId = sessionStorage.getItem(guestIdKey);
    
    if (!guestId) return;
    
    const guests = getGuestUsers();
    const guest = guests.find(g => g.id === guestId);
    
    if (guest && guest.isActive) {
      const now = Date.now();
      guest.isActive = false;
      guest.lastVisit = now;
      
      localStorage.setItem(GUEST_USERS_KEY, JSON.stringify(guests));
    }
  } catch (error) {
    console.error('Error marking guest inactive:', error);
  }
};













