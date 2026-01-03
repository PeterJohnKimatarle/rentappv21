/**
 * Property Types Data Structure
 * Hierarchical system with parent categories and their children
 */

export interface PropertyTypeCategory {
  label: string;
  value: string;
  children?: string[];
}

export const PROPERTY_TYPE_CATEGORIES: Record<string, string[]> = {
  'Apartment': [
    '1 Bdrm Apartment',
    '2 Bdrm Apartment',
    '3 Bdrm Apartment',
    '4 Bdrm Apartment',
    '5+ Bdrm Apartment',
    'Studio Apartment'
  ],
  'House': [
    '1 Bdrm House',
    '2 Bdrm House',
    '3 Bdrm House',
    '4 Bdrm House',
    '5+ Bdrm House'
  ],
  'Commercial Property': [
    'Office Space',
    'Shop (Frame)',
    'Co-Working Space',
    'Warehouse/Godown'
  ],
  'Short Stay/Hospitality': [
    'Hotel Room',
    'Lodge',
    'Hostel (travelers)',
    'Guest House'
  ],
  'Land & Outdoor': [
    'Parking Yard',
    'Farm House (Agricultural)',
    'Open Space'
  ],
  'Villa': [
    'Luxury Villa',
    'Beach Villa'
  ],
  'Event Hall': [
    'Conference Center',
    'Wedding Venue'
  ]
};

// Categories that have NO sub-categories (select directly)
export const DIRECT_SELECT_CATEGORIES = [
  'Single Room (Shared House)',
  'Master Room',
  'Hostel (student housing)'
];

// All main categories in the order specified by user
export const ALL_PROPERTY_CATEGORIES = [
  'Apartment',
  'House',
  'Commercial Property',
  'Single Room (Shared House)',
  'Master Room',
  'Short Stay/Hospitality',
  'Hostel (student housing)',
  'Event Hall',
  'Land & Outdoor',
  'Villa'
];

/**
 * Get children for a parent category
 * @param parent - The parent category name
 * @returns Array of children or null if category has no children
 */
export const getPropertyTypeChildren = (parent: string): string[] | null => {
  if (DIRECT_SELECT_CATEGORIES.includes(parent)) {
    return null; // No children, select directly
  }
  return PROPERTY_TYPE_CATEGORIES[parent] || null;
};

/**
 * Check if a category has sub-categories
 * @param category - The category name
 * @returns Boolean indicating if category has sub-categories
 */
export const hasSubCategories = (category: string): boolean => {
  return !DIRECT_SELECT_CATEGORIES.includes(category) && 
         category in PROPERTY_TYPE_CATEGORIES;
};

/**
 * Get all main property type categories
 * @returns Array of all main category names
 */
export const getAllPropertyTypes = (): string[] => {
  return ALL_PROPERTY_CATEGORIES;
};

/**
 * Parse property type string to extract parent and child
 * Handles both formats: "parent|child" and direct category names
 * @param propertyType - The property type string
 * @returns Object with parent and child, or null if invalid
 */
// Legacy property type mapping for backward compatibility
const LEGACY_PROPERTY_TYPE_MAPPING: Record<string, string> = {
  // Apartments
  '1-bdrm-apartment': 'Apartment|1 Bdrm Apartment',
  '2-bdrm-apartment': 'Apartment|2 Bdrm Apartment',
  '3-bdrm-apartment': 'Apartment|3 Bdrm Apartment',
  '4-bdrm-apartment': 'Apartment|4 Bdrm Apartment',
  '5-bdrm-apartment': 'Apartment|5 Bdrm Apartment',
  '5+-bdrm-apartment': 'Apartment|5+ Bdrm Apartment',
  'studio-apartment': 'Apartment|Studio Apartment',

  // Houses
  '1-bdrm-house': 'House|1 Bdrm House',
  '2-bdrm-house': 'House|2 Bdrm House',
  '3-bdrm-house': 'House|3 Bdrm House',
  '4-bdrm-house': 'House|4 Bdrm House',
  '5-bdrm-house': 'House|5 Bdrm House',
  '5+-bdrm-house': 'House|5+ Bdrm House',

  // Commercial Properties
  'commercial-building-frame': 'Commercial Property|Shop (Frame)',
  'office-space': 'Commercial Property|Office Space',
  'co-working-space': 'Commercial Property|Co-Working Space',
  'warehouse-godown': 'Commercial Property|Warehouse/Godown',
  'shop': 'Commercial Property|Shop (Frame)',

  // Short Stay/Hospitality
  'hotel-room': 'Short Stay/Hospitality|Hotel Room',
  'lodge': 'Short Stay/Hospitality|Lodge',
  'hostel': 'Short Stay/Hospitality|Hostel (travelers)',
  'guest-house': 'Short Stay/Hospitality|Guest House',

  // Land & Outdoor
  'parking-yard': 'Land & Outdoor|Parking Yard',
  'farm-house': 'Land & Outdoor|Farm House (Agricultural)',
  'open-space': 'Land & Outdoor|Open Space',

  // Villas
  'luxury-villa': 'Villa|Luxury Villa',
  'beach-villa': 'Villa|Beach Villa',

  // Event Halls
  'conference-center': 'Event Hall|Conference Center',
  'wedding-hall': 'Event Hall|Wedding Hall',
  'banquet-hall': 'Event Hall|Banquet Hall',

  // Other common legacy formats
  'apartment': 'Apartment|1 Bdrm Apartment',
  'house': 'House|1 Bdrm House',
  'commercial': 'Commercial Property|Office Space',
  'office': 'Commercial Property|Office Space',

  // Add more legacy mappings as needed
};

export const parsePropertyType = (propertyType: string): { parent: string; child: string | null } | null => {
  if (!propertyType) return null;

  // Check if it's a direct select category
  if (DIRECT_SELECT_CATEGORIES.includes(propertyType)) {
    return { parent: propertyType, child: null };
  }

  // Check if it's in format "parent|child"
  if (propertyType.includes('|')) {
    const [parent, child] = propertyType.split('|');
    return { parent: parent.trim(), child: child.trim() };
  }

  // Check for legacy property type format
  if (LEGACY_PROPERTY_TYPE_MAPPING[propertyType]) {
    const mappedType = LEGACY_PROPERTY_TYPE_MAPPING[propertyType];
    const [parent, child] = mappedType.split('|');
    return { parent: parent.trim(), child: child ? child.trim() : null };
  }

  // Try to find parent category
  for (const [parent, children] of Object.entries(PROPERTY_TYPE_CATEGORIES)) {
    if (children.includes(propertyType)) {
      return { parent, child: propertyType };
    }
  }

  // Check if it's a direct category name
  if (ALL_PROPERTY_CATEGORIES.includes(propertyType)) {
    return { parent: propertyType, child: null };
  }

  return null;
};

/**
 * Format property type for storage
 * @param parent - Parent category
 * @param child - Child category (optional)
 * @returns Formatted string for storage
 */
export const formatPropertyType = (parent: string, child?: string | null): string => {
  if (!child || DIRECT_SELECT_CATEGORIES.includes(parent)) {
    return parent;
  }
  return `${parent}|${child}`;
};

/**
 * Get display label for property type
 * @param propertyType - The property type string
 * @returns Display label
 */
export const getPropertyTypeDisplayLabel = (propertyType: string): string => {
  const parsed = parsePropertyType(propertyType);
  if (!parsed) return propertyType;
  
  if (parsed.child) {
    return parsed.child;
  }
  return parsed.parent;
};











