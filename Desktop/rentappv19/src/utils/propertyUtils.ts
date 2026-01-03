import { properties as staticProperties } from '@/data/properties';
import { parsePropertyType, getPropertyTypeDisplayLabel } from '@/utils/propertyTypes';

// Cache for getAllProperties to improve performance
let propertiesCache: DisplayProperty[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 100; // 100ms cache to batch rapid calls

// Interface for properties saved from the form (localStorage)
export interface PropertyFormData {
  id: string;
  title?: string;
  description?: string;
  propertyType: string;
  status: string;
  region: string;
  ward: string;
  streetAddress?: string;
  price: string;
  paymentPlan: string;
  pricingUnit?: 'month' | 'night' | 'day' | 'hour' | '';
  bedrooms?: string;
  bathrooms?: string;
  squareFootage?: string;
  area?: string;
  amenities: string[];
  images: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  uploaderType?: 'Broker' | 'Owner';
  propertyTitle?: string;
  petPolicy?: string;
  parking?: string;
  furnishing?: string;
  utilities?: string[];
  availableDate?: string;
  leaseTerms?: string;
  createdAt: string;
  updatedAt?: string;
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
}

// Combined property interface for display
export interface DisplayProperty {
  id: string;
  title: string;
  location: string;
  description: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  plan: '3+' | '6+' | '12+' | 'flexible';
  pricingUnit?: 'month' | 'night' | 'day' | 'hour' | '';
  updatedAt: string;
  status: 'available' | 'occupied';
  // Additional fields from form
  propertyType?: string;
  region?: string;
  ward?: string;
  streetAddress?: string;
  amenities?: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  uploaderType?: 'Broker' | 'Owner';
  propertyTitle?: string;
  petPolicy?: string;
  parking?: string;
  furnishing?: string;
  utilities?: string[];
  availableDate?: string;
  leaseTerms?: string;
  createdAt?: string;
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
}

// Convert form data to display format
export const convertFormDataToDisplayProperty = (formData: PropertyFormData): DisplayProperty => {
  // Parse property type to get display label
  const propertyTypeDisplay = getPropertyTypeDisplayLabel(formData.propertyType || '');
  
  // Generate title from property type or custom title
  const title = formData.propertyTitle || propertyTypeDisplay;
  
  // Generate description from property details
  const description = formData.description || `A ${propertyTypeDisplay} located in ${String(formData.ward || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}, ${String(formData.region || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}.`;

  // Extract bedrooms and bathrooms from property type if not provided
  // Handle both old format (1-bdrm-apartment) and new format (Apartments|1 Bdrm Apartment)
  const propertyTypeLower = formData.propertyType?.toLowerCase() || '';
  const bedrooms = formData.bedrooms ? parseInt(formData.bedrooms) : 
    (propertyTypeLower.includes('1 bdrm') || propertyTypeLower.includes('1-bdrm') ? 1 :
     propertyTypeLower.includes('2 bdrm') || propertyTypeLower.includes('2-bdrm') ? 2 :
     propertyTypeLower.includes('3 bdrm') || propertyTypeLower.includes('3-bdrm') ? 3 :
     propertyTypeLower.includes('4 bdrm') || propertyTypeLower.includes('4-bdrm') ? 4 :
     propertyTypeLower.includes('5+ bdrm') || propertyTypeLower.includes('5+ bdrm') || propertyTypeLower.includes('5-bdrm') ? 5 : 2);

  const bathrooms = formData.bathrooms ? parseInt(formData.bathrooms) : 
    (bedrooms === 1 ? 1 : bedrooms === 2 ? 2 : bedrooms >= 3 ? 2 : 1);

  // Build location string with street address if available
  const locationParts = [
    formData.streetAddress,
    String(formData.ward || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    String(formData.region || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  ].filter(Boolean);
  const location = locationParts.join(', ');

  return {
    id: formData.id,
    title: title,
    location: location,
    description: description,
    price: parseInt(String(formData.price || '0').replace(/,/g, '')),
    images: formData.images,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    area: parseInt(formData.squareFootage || '0') || 0,
    plan: formData.paymentPlan as '3+' | '6+' | '12+' | 'flexible',
    pricingUnit: formData.pricingUnit || 'month',
    updatedAt: formData.updatedAt || formData.createdAt,
    status: formData.status as 'available' | 'occupied',
    propertyType: formData.propertyType,
    region: formData.region,
    ward: formData.ward,
    streetAddress: formData.streetAddress,
    amenities: formData.amenities,
    contactName: formData.contactName,
    contactPhone: formData.contactPhone,
    contactEmail: formData.contactEmail,
    uploaderType: formData.uploaderType,
    propertyTitle: formData.propertyTitle,
    petPolicy: formData.petPolicy,
    parking: formData.parking,
    furnishing: formData.furnishing,
    utilities: formData.utilities,
    availableDate: formData.availableDate,
    leaseTerms: formData.leaseTerms,
    createdAt: formData.createdAt,
    ownerId: formData.ownerId,
    ownerEmail: formData.ownerEmail,
    ownerName: formData.ownerName
  };
};

// Invalidate the properties cache (call this when properties are added/updated/deleted)
export const invalidatePropertiesCache = () => {
  propertiesCache = null;
  cacheTimestamp = 0;
};

// Get all properties (static + localStorage)
export const getAllProperties = (): DisplayProperty[] => {
  const now = Date.now();
  
  // Return cached result if available and fresh
  if (propertiesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return propertiesCache;
  }

  // Get static properties (this is fast, no need to cache)
  const staticProps: DisplayProperty[] = staticProperties.map(prop => ({
    ...prop,
    plan: prop.plan as '3+' | '6+' | '12+'
  }));

  // Get localStorage properties (only in browser environment)
  const localStorageProperties: PropertyFormData[] = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('rentapp_properties') || '[]')
    : [];

  // Convert localStorage properties to display format
  const convertedProperties: DisplayProperty[] = localStorageProperties.map(convertFormDataToDisplayProperty);

  // Combine and sort by creation date (newest first)
  const allProperties = [...convertedProperties, ...staticProps];
  
  const sortedProperties = allProperties.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || '');
    const dateB = new Date(b.updatedAt || b.createdAt || '');
    return dateB.getTime() - dateA.getTime();
  });

  // Cache the result
  propertiesCache = sortedProperties;
  cacheTimestamp = now;
  
  return sortedProperties;
};

// Get properties by status
export const getPropertiesByStatus = (status: 'available' | 'occupied'): DisplayProperty[] => {
  return getAllProperties().filter(property => property.status === status);
};

// Get available properties only
export const getAvailableProperties = (): DisplayProperty[] => {
  return getPropertiesByStatus('available');
};

// Bookmark utilities
const BOOKMARKS_STORAGE_KEY = 'rentapp_bookmarks';

const getBookmarksStorageKey = (userId?: string) =>
  `${BOOKMARKS_STORAGE_KEY}_${userId ?? 'guest'}`;

// Get all bookmarked property IDs
export const getBookmarkedIds = (userId?: string): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(getBookmarksStorageKey(userId)) || '[]');
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
};

// Check if a property is bookmarked
export const isBookmarked = (propertyId: string, userId?: string): boolean => {
  const bookmarkedIds = getBookmarkedIds(userId);
  return bookmarkedIds.includes(propertyId);
};

// Add a property to bookmarks
export const addBookmark = (propertyId: string, userId?: string): boolean => {
  try {
    const key = getBookmarksStorageKey(userId);
    const bookmarkedIds = getBookmarkedIds(userId);
    if (!bookmarkedIds.includes(propertyId)) {
      bookmarkedIds.push(propertyId);
      localStorage.setItem(key, JSON.stringify(bookmarkedIds));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('bookmarksChanged'));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

// Remove a property from bookmarks
export const removeBookmark = (propertyId: string, userId?: string): boolean => {
  try {
    const key = getBookmarksStorageKey(userId);
    const bookmarkedIds = getBookmarkedIds(userId);
    const updatedIds = bookmarkedIds.filter(id => id !== propertyId);
    localStorage.setItem(key, JSON.stringify(updatedIds));
    
    // Save to recently removed bookmarks
    addToRecentlyRemoved(propertyId, userId);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('bookmarksChanged'));
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

// Get all bookmarked properties
export const getBookmarkedProperties = (userId?: string): DisplayProperty[] => {
  const bookmarkedIds = getBookmarkedIds(userId);
  const allProperties = getAllProperties();
  return allProperties.filter(property => bookmarkedIds.includes(property.id));
};

// Recently removed bookmarks utilities
const RECENTLY_REMOVED_STORAGE_KEY = 'rentapp_recently_removed_bookmarks';

interface RecentlyRemovedBookmark {
  propertyId: string;
  removedAt: string;
}

const getRecentlyRemovedStorageKey = (userId?: string) =>
  `${RECENTLY_REMOVED_STORAGE_KEY}_${userId ?? 'guest'}`;

// Add a property to recently removed bookmarks
const addToRecentlyRemoved = (propertyId: string, userId?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const key = getRecentlyRemovedStorageKey(userId);
    const recentlyRemoved: RecentlyRemovedBookmark[] = JSON.parse(
      localStorage.getItem(key) || '[]'
    );
    
    // Remove if already exists (to update timestamp)
    const filtered = recentlyRemoved.filter(item => item.propertyId !== propertyId);
    
    // Add with current timestamp
    filtered.push({
      propertyId,
      removedAt: new Date().toISOString()
    });
    
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error adding to recently removed:', error);
  }
};

// Get all recently removed bookmark IDs
export const getRecentlyRemovedIds = (userId?: string): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const key = getRecentlyRemovedStorageKey(userId);
    const recentlyRemoved: RecentlyRemovedBookmark[] = JSON.parse(
      localStorage.getItem(key) || '[]'
    );
    return recentlyRemoved.map(item => item.propertyId);
  } catch (error) {
    console.error('Error reading recently removed bookmarks:', error);
    return [];
  }
};

// Get all recently removed bookmarks with their removal timestamps
export const getRecentlyRemovedBookmarks = (userId?: string): RecentlyRemovedBookmark[] => {
  if (typeof window === 'undefined') return [];
  try {
    const key = getRecentlyRemovedStorageKey(userId);
    const recentlyRemoved: RecentlyRemovedBookmark[] = JSON.parse(
      localStorage.getItem(key) || '[]'
    );
    // Sort by removal date (most recent first)
    return recentlyRemoved.sort((a, b) => 
      new Date(b.removedAt).getTime() - new Date(a.removedAt).getTime()
    );
  } catch (error) {
    console.error('Error reading recently removed bookmarks:', error);
    return [];
  }
};

// Get recently removed properties (full property objects)
export const getRecentlyRemovedProperties = (userId?: string): DisplayProperty[] => {
  const recentlyRemovedIds = getRecentlyRemovedIds(userId);
  const allProperties = getAllProperties();
  return allProperties.filter(property => recentlyRemovedIds.includes(property.id));
};

// Restore a bookmark from recently removed
export const restoreBookmark = (propertyId: string, userId?: string): boolean => {
  try {
    // Add back to bookmarks
    const added = addBookmark(propertyId, userId);
    
    if (added) {
      // Remove from recently removed
      const key = getRecentlyRemovedStorageKey(userId);
      const recentlyRemoved: RecentlyRemovedBookmark[] = JSON.parse(
        localStorage.getItem(key) || '[]'
      );
      const filtered = recentlyRemoved.filter(item => item.propertyId !== propertyId);
      localStorage.setItem(key, JSON.stringify(filtered));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('bookmarksChanged'));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error restoring bookmark:', error);
    return false;
  }
};

// Permanently delete a bookmark from recently removed (without restoring)
export const permanentlyDeleteRemovedBookmark = (propertyId: string, userId?: string): boolean => {
  try {
    const key = getRecentlyRemovedStorageKey(userId);
    const recentlyRemoved: RecentlyRemovedBookmark[] = JSON.parse(
      localStorage.getItem(key) || '[]'
    );
    const filtered = recentlyRemoved.filter(item => item.propertyId !== propertyId);
    localStorage.setItem(key, JSON.stringify(filtered));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('bookmarksChanged'));
    return true;
  } catch (error) {
    console.error('Error permanently deleting removed bookmark:', error);
    return false;
  }
};

// Get only user-created properties (from localStorage, not static)
export const getUserCreatedProperties = (ownerId?: string): DisplayProperty[] => {
  if (typeof window === 'undefined') return [];
  if (!ownerId) return [];
  
  try {
    const localStorageProperties: PropertyFormData[] = JSON.parse(
      localStorage.getItem('rentapp_properties') || '[]'
    );

    let shouldPersist = false;
    const enhancedProperties = localStorageProperties.map((property) => {
      if (!property.ownerId) {
        if (ownerId) {
          shouldPersist = true;
          return {
            ...property,
            ownerId,
            ownerEmail: property.ownerEmail ?? property.contactEmail,
            ownerName: property.ownerName ?? property.contactName
          };
        }
      }
      return property;
    });

    if (shouldPersist) {
      localStorage.setItem('rentapp_properties', JSON.stringify(enhancedProperties));
    }
    
    // Convert to display format
    const convertedProperties = enhancedProperties
      .filter(property => property.ownerId === ownerId)
      .map(convertFormDataToDisplayProperty);
    
    // Sort by updatedAt (most recent first), fallback to createdAt if updatedAt doesn't exist
    return convertedProperties.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || '');
      const dateB = new Date(b.updatedAt || b.createdAt || '');
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  } catch (error) {
    console.error('Error reading user properties:', error);
    return [];
  }
};

// Update an existing property in localStorage
export const updateProperty = (
  propertyId: string,
  updatedProperty: PropertyFormData,
  currentUserId?: string,
  userRole?: string
): boolean => {
  try {
    const existingProperties: PropertyFormData[] = JSON.parse(
      localStorage.getItem('rentapp_properties') || '[]'
    );
    
    const propertyIndex = existingProperties.findIndex(p => p.id === propertyId);
    
    if (propertyIndex === -1) {
      console.error('Property not found:', propertyId);
      return false;
    }

    const existingProperty = existingProperties[propertyIndex];

    // Allow admin users to update any property, otherwise check ownership
    if (userRole !== 'admin' && existingProperty.ownerId && currentUserId && existingProperty.ownerId !== currentUserId) {
      console.error('User not authorized to update this property');
      return false;
    }

    // Update the property while preserving ownership metadata
    existingProperties[propertyIndex] = {
      ...existingProperty,
      ...updatedProperty,
      id: propertyId,
      ownerId: existingProperty.ownerId,
      ownerEmail: existingProperty.ownerEmail,
      ownerName: existingProperty.ownerName,
      createdAt: existingProperty.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('rentapp_properties', JSON.stringify(existingProperties));
    
    // Invalidate cache
    invalidatePropertiesCache();
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('propertyUpdated', { detail: updatedProperty }));
    
    return true;
  } catch (error) {
    console.error('Error updating property:', error);
    return false;
  }
};

// Get a property by ID from localStorage
export const getPropertyById = (propertyId: string, ownerId?: string): PropertyFormData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const localStorageProperties: PropertyFormData[] = JSON.parse(
      localStorage.getItem('rentapp_properties') || '[]'
    );

    const property = localStorageProperties.find(p => p.id === propertyId);

    if (!property) {
      return null;
    }

    if (ownerId && property.ownerId && property.ownerId !== ownerId) {
      console.warn('Attempt to access property owned by another user');
      return null;
    }

    return property;
  } catch (error) {
    console.error('Error reading property:', error);
    return null;
  }
};

// Delete a property from localStorage
export const deleteProperty = (propertyId: string, currentUserId?: string): boolean => {
  try {
    const existingProperties: PropertyFormData[] = JSON.parse(
      localStorage.getItem('rentapp_properties') || '[]'
    );
    
    const propertyIndex = existingProperties.findIndex(p => p.id === propertyId);
    
    if (propertyIndex === -1) {
      console.error('Property not found:', propertyId);
      return false;
    }

    const property = existingProperties[propertyIndex];

    if (property.ownerId && currentUserId && property.ownerId !== currentUserId) {
      console.error('User not authorized to delete this property');
      return false;
    }
    
    // Remove the property
    existingProperties.splice(propertyIndex, 1);
    
    localStorage.setItem('rentapp_properties', JSON.stringify(existingProperties));
    
    // Invalidate cache
    invalidatePropertiesCache();
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('propertyDeleted', { detail: propertyId }));
    
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    return false;
  }
};

// Follow-up/Ping properties storage
// Shared property status storage - single source of truth for all users
const PROPERTY_STATUS_STORAGE_KEY = 'rentapp_property_status';

interface PropertyStatus {
  status: 'default' | 'followup' | 'closed';
  updatedAt: number;
  updatedBy: {
    id: string;
    name: string;
  };
}

interface PropertyStatusMap {
  [propertyId: string]: PropertyStatus;
}

// Get all property statuses
const getPropertyStatusMap = (): PropertyStatusMap => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(PROPERTY_STATUS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading property statuses:', error);
    return {};
  }
};

// Save property status map
const savePropertyStatusMap = (statusMap: PropertyStatusMap): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROPERTY_STATUS_STORAGE_KEY, JSON.stringify(statusMap));
  } catch (error) {
    console.error('Error saving property statuses:', error);
  }
};

// Get status for a specific property
export const getPropertyStatus = (propertyId: string): PropertyStatus | null => {
  const statusMap = getPropertyStatusMap();
  return statusMap[propertyId] || null;
};

// Set property status (only for staff)
export const setPropertyStatus = (
  propertyId: string,
  status: 'default' | 'followup' | 'closed',
  staffId: string,
  staffName: string
): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const statusMap = getPropertyStatusMap();
    statusMap[propertyId] = {
      status,
      updatedAt: Date.now(),
      updatedBy: {
        id: staffId,
        name: staffName
      }
    };
    savePropertyStatusMap(statusMap);
      
    // Dispatch events for UI updates
    window.dispatchEvent(new CustomEvent('propertyStatusChanged', { detail: { propertyId, status } }));
      window.dispatchEvent(new CustomEvent('followUpChanged'));
    window.dispatchEvent(new CustomEvent('closedChanged'));
    
      return true;
  } catch (error) {
    console.error('Error setting property status:', error);
    return false;
  }
};

// Add a property to follow-up list (staff only)
export const addToFollowUp = (propertyId: string, userId?: string, staffName?: string): boolean => {
  if (typeof window === 'undefined' || !userId || !staffName) return false;
  
  return setPropertyStatus(propertyId, 'followup', userId, staffName);
};

// Get all follow-up property IDs (shared across all users)
export const getFollowUpPropertyIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const statusMap = getPropertyStatusMap();
    return Object.keys(statusMap).filter(id => statusMap[id].status === 'followup');
  } catch (error) {
    console.error('Error reading follow-up properties:', error);
    return [];
  }
};

// Check if a property is in follow-up (shared across all users)
export const isPropertyInFollowUpAnyUser = (propertyId: string): boolean => {
  const status = getPropertyStatus(propertyId);
  return status?.status === 'followup';
};

// Get all follow-up properties (shared across all users)
export const getFollowUpProperties = (): DisplayProperty[] => {
  try {
    const followUpIds = getFollowUpPropertyIds();
    const allProperties = getAllProperties();
    return allProperties.filter(property => followUpIds.includes(property.id));
  } catch (error) {
    console.error('Error getting follow-up properties:', error);
    return [];
  }
};

// Get follow-up properties by a specific staff member
// Returns properties marked as follow-up by this staff member OR properties in follow-up status with notes
export const getFollowUpPropertiesByStaff = (staffId: string): DisplayProperty[] => {
  try {
    const statusMap = getPropertyStatusMap();
    const allProperties = getAllProperties();
    
    // Filter properties that:
    // 1. Are marked as follow-up by this staff member, OR
    // 2. Are in follow-up status AND have notes (contributed to notes)
    return allProperties.filter(property => {
      const status = statusMap[property.id];
      if (!status || status.status !== 'followup') return false;
      
      // Check if marked as follow-up by this staff member
      if (status.updatedBy?.id === staffId) {
        return true;
      }
      
      // Check if property has notes (staff contributed to notes)
      const notes = getStaffNotes(property.id);
      if (notes && notes.trim().length > 0) {
        return true;
      }
      
    return false;
    });
  } catch (error) {
    console.error('Error getting follow-up properties by staff:', error);
    return [];
  }
};

// Remove a property from follow-up list (set to default) - staff only
export const removeFromFollowUp = (propertyId: string, userId?: string, staffName?: string): boolean => {
  if (typeof window === 'undefined' || !userId || !staffName) return false;
  
  return setPropertyStatus(propertyId, 'default', userId, staffName);
};

// Add a property to closed list (staff only)
export const addToClosed = (propertyId: string, userId?: string, staffName?: string): boolean => {
  if (typeof window === 'undefined' || !userId || !staffName) return false;
  
  return setPropertyStatus(propertyId, 'closed', userId, staffName);
};

// Get all closed property IDs (shared across all users)
export const getClosedPropertyIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const statusMap = getPropertyStatusMap();
    return Object.keys(statusMap).filter(id => statusMap[id].status === 'closed');
  } catch (error) {
    console.error('Error reading closed properties:', error);
    return [];
  }
};

// Check if a property is closed (shared across all users)
export const isPropertyClosedAnyUser = (propertyId: string): boolean => {
  const status = getPropertyStatus(propertyId);
  return status?.status === 'closed';
};

// Get all closed properties (shared across all users)
export const getClosedProperties = (): DisplayProperty[] => {
  try {
    const closedIds = getClosedPropertyIds();
    const allProperties = getAllProperties();
    return allProperties.filter(property => closedIds.includes(property.id));
  } catch (error) {
    console.error('Error getting closed properties:', error);
    return [];
  }
};

// Get closed properties by a specific staff member
export const getClosedPropertiesByStaff = (staffId: string): DisplayProperty[] => {
  try {
    const statusMap = getPropertyStatusMap();
    const allProperties = getAllProperties();
    
    // Filter properties that are closed AND were closed by this staff member
    return allProperties.filter(property => {
      const status = statusMap[property.id];
      return status?.status === 'closed' && status?.updatedBy?.id === staffId;
    });
  } catch (error) {
    console.error('Error getting closed properties by staff:', error);
    return [];
  }
};

// Remove a property from closed list (set to default) - staff only
export const removeFromClosed = (propertyId: string, userId?: string, staffName?: string): boolean => {
  if (typeof window === 'undefined' || !userId || !staffName) return false;
  
  return setPropertyStatus(propertyId, 'default', userId, staffName);
};

// Get shared staff notes for a property
const getStaffNotesStorageKey = (propertyId: string) => {
  return `rentapp_notes_staff_${propertyId}`;
};

// Get shared staff notes for a property
export const getStaffNotes = (propertyId: string): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    const key = getStaffNotesStorageKey(propertyId);
    return localStorage.getItem(key) || '';
  } catch (error) {
    console.error('Error getting staff notes:', error);
    return '';
  }
};

// Save shared staff notes for a property
export const saveStaffNotes = (propertyId: string, notes: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const key = getStaffNotesStorageKey(propertyId);
    localStorage.setItem(key, notes);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('notesChanged'));
      return true;
  } catch (error) {
    console.error('Error saving staff notes:', error);
    return false;
  }
};

// Get notes for a property from ANY user (for admin/staff visibility)
// This function now prioritizes staff shared notes, then falls back to any user's notes
export const getPropertyNotesAnyUser = (propertyId: string): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    // First check for shared staff notes
    const staffNotes = getStaffNotes(propertyId);
    if (staffNotes.trim().length > 0) {
      return staffNotes;
    }
    
    // Fallback: Check all localStorage keys that match the notes pattern for this property
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rentapp_notes_') && key.endsWith(`_${propertyId}`) && !key.startsWith('rentapp_notes_staff_')) {
        const notes = localStorage.getItem(key) || '';
        if (notes.trim().length > 0) {
          return notes;
        }
      }
    }
    return '';
  } catch (error) {
    console.error('Error getting notes across users:', error);
    return '';
  }
};

// Clear all follow-up and closed properties for all users
export const clearAllFollowUpAndClosed = (userId?: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    let clearedCount = 0;
    
    // Clear all follow-up properties
    keys.forEach(key => {
      if (key.startsWith('rentapp_followup')) {
        localStorage.removeItem(key);
        clearedCount++;
      }
    });
    
    // Clear all closed properties
    keys.forEach(key => {
      if (key.startsWith('rentapp_closed')) {
        localStorage.removeItem(key);
        clearedCount++;
      }
    });
    
    // Also clear all notes for follow-up properties if userId is provided
    if (userId) {
      keys.forEach(key => {
        if (key.startsWith(`rentapp_notes_${userId}_`)) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      });
    }
    
    console.log(`Cleared ${clearedCount} entries from localStorage`);
    
    // Dispatch events to update UI
    window.dispatchEvent(new CustomEvent('followUpChanged'));
    window.dispatchEvent(new CustomEvent('closedChanged'));
  } catch (error) {
    console.error('Error clearing follow-up and closed properties:', error);
  }
};

// Status confirmation storage
interface StatusConfirmation {
  propertyId: string;
  staffId: string;
  staffName: string;
  confirmedAt: string; // ISO timestamp
}

const getStatusConfirmationStorageKey = () => {
  return 'rentapp_status_confirmations';
};

// Confirm property status (save confirmation record)
export const confirmPropertyStatus = (
  propertyId: string,
  staffId: string,
  staffName: string
): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const key = getStatusConfirmationStorageKey();
    const confirmations: StatusConfirmation[] = JSON.parse(
      localStorage.getItem(key) || '[]'
    );
    
    // Remove any existing confirmation for this property
    const filtered = confirmations.filter(c => c.propertyId !== propertyId);
    
    // Add new confirmation
    const newConfirmation: StatusConfirmation = {
      propertyId,
      staffId,
      staffName,
      confirmedAt: new Date().toISOString()
    };
    
    filtered.push(newConfirmation);
    localStorage.setItem(key, JSON.stringify(filtered));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('statusConfirmationChanged'));
    return true;
  } catch (error) {
    console.error('Error confirming property status:', error);
    return false;
  }
};

// Get status confirmation for a property
export const getStatusConfirmation = (propertyId: string): StatusConfirmation | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = getStatusConfirmationStorageKey();
    const confirmations: StatusConfirmation[] = JSON.parse(
      localStorage.getItem(key) || '[]'
    );
    
    return confirmations.find(c => c.propertyId === propertyId) || null;
  } catch (error) {
    console.error('Error reading status confirmation:', error);
    return null;
  }
};
