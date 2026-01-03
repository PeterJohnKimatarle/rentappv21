'use client';

import Layout from '@/components/Layout';
import PropertyCard from '@/components/PropertyCard';
import EditPropertyModal from '@/components/EditPropertyModal';
import ImageEditModal from '@/components/ImageEditModal';
import { getUserCreatedProperties, updateProperty, getPropertyById, deleteProperty, PropertyFormData } from '@/utils/propertyUtils';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useAuth } from '@/contexts/AuthContext';

type SearchFilters = {
  propertyType?: string;
  status?: string;
  region?: string;
  ward?: string;
};

export default function MyPropertiesPage() {
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const [properties, setProperties] = useState<ReturnType<typeof getUserCreatedProperties>>([]);
  const [editingProperty, setEditingProperty] = useState<PropertyFormData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImageProperty, setEditingImageProperty] = useState<PropertyFormData | null>(null);
  const [isImageEditModalOpen, setIsImageEditModalOpen] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  // Handle active property tracker persistence vs page refresh clearing
  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      // Simple and reliable approach: only clear on actual page refresh
      // Use beforeunload to detect when user leaves/refreshes the page
      const handleBeforeUnload = () => {
        // Clear the session flag when page unloads (refresh or navigation away)
        sessionStorage.removeItem('rentapp_my_properties_visited');
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Page is being hidden (user switching tabs or minimizing)
          // Don't clear tracker
        } else {
          // Page is becoming visible again
          // If we don't have the visited flag, this might be a refresh
          if (!sessionStorage.getItem('rentapp_my_properties_visited')) {
            console.log('🔄 Page refresh detected - clearing tracker');
            localStorage.removeItem(`rentapp_active_property_${userId}`);
            setActivePropertyId(null);
          }
        }
      };

      // Check if this is the first visit to this page in this session
      const hasVisitedBefore = sessionStorage.getItem('rentapp_my_properties_visited');

      if (!hasVisitedBefore) {
        console.log('🏠 First visit to My Properties - clearing any stale tracker');
        // First visit in this session - clear any stale tracker
        localStorage.removeItem(`rentapp_active_property_${userId}`);
        setActivePropertyId(null);
        // Mark as visited
        sessionStorage.setItem('rentapp_my_properties_visited', 'true');
      } else {
        console.log('↩️ Returning to My Properties - loading existing tracker');
        // Returning to page - load existing tracker
        const storedActivePropertyId = localStorage.getItem(`rentapp_active_property_${userId}`);
        if (storedActivePropertyId) {
          setActivePropertyId(storedActivePropertyId);
        }
      }

      // Set up event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [userId]);

  // Helper function to update active property ID with localStorage persistence
  const updateActivePropertyId = (propertyId: string | null) => {
    setActivePropertyId(propertyId);
    if (typeof window !== 'undefined' && userId) {
      if (propertyId) {
        localStorage.setItem(`rentapp_active_property_${userId}`, propertyId);
      } else {
        localStorage.removeItem(`rentapp_active_property_${userId}`);
      }
    }
  };
  const [stagedPropertyChanges, setStagedPropertyChanges] = useState<PropertyFormData | null>(null);
  const [stagedImageChanges, setStagedImageChanges] = useState<{ mainImage: string; additionalImages: string[] } | null>(null);
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null);

  // Prevent scroll when success messages are shown
  usePreventScroll(showUpdateSuccess || showDeleteSuccess);

  // Load properties on mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (userId) {
      setProperties(getUserCreatedProperties(userId));
    } else {
      setProperties([]);
    }
  }, [userId]);

  // Update properties when localStorage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = () => {
      if (userId) {
        setProperties(getUserCreatedProperties(userId));
      }
    };

    const handlePropertyAdded = () => {
      if (userId) {
        setProperties(getUserCreatedProperties(userId));
      }
      setIsHydrated(true);
    };

    const handlePropertyUpdated = () => {
      if (userId) {
        setProperties(getUserCreatedProperties(userId));
      }
      setIsHydrated(true);
    };

    const handlePropertyDeleted = () => {
      if (userId) {
        setProperties(getUserCreatedProperties(userId));
      }
      setIsHydrated(true);
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom property added event
    window.addEventListener('propertyAdded', handlePropertyAdded);
    
    // Listen for property updated event
    window.addEventListener('propertyUpdated', handlePropertyUpdated);
    
    // Listen for property deleted event
    window.addEventListener('propertyDeleted', handlePropertyDeleted);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('propertyAdded', handlePropertyAdded);
      window.removeEventListener('propertyUpdated', handlePropertyUpdated);
      window.removeEventListener('propertyDeleted', handlePropertyDeleted);
    };
  }, [userId]);

  const applyFilters = useCallback((items: ReturnType<typeof getUserCreatedProperties>, filters: SearchFilters | null) => {
    if (!filters) return items;

    const normalise = (value?: string) => value?.toLowerCase().trim();

    return items.filter((property) => {
      const matchesPropertyType = filters.propertyType
        ? normalise(property.propertyType) === normalise(filters.propertyType)
        : true;

      const matchesStatus = filters.status ? property.status === filters.status : true;

      const matchesRegion = filters.region
        ? normalise(property.region) === normalise(filters.region)
        : true;

      const matchesWard = filters.ward ? normalise(property.ward) === normalise(filters.ward) : true;

      return matchesPropertyType && matchesStatus && matchesRegion && matchesWard;
    });
  }, []);

  const filteredProperties = useMemo(
    () => applyFilters(properties, activeFilters),
    [properties, activeFilters, applyFilters]
  );

  const hasActiveFilters = useMemo(() => {
    if (!activeFilters) return false;
    return Object.values(activeFilters).some((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return Boolean(value);
    });
  }, [activeFilters]);

  useEffect(() => {
    const handleSearch = (event: Event) => {
      const { detail } = event as CustomEvent<SearchFilters>;
      const filters = detail || {};

      const hasFilters = Object.values(filters).some((value) => {
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        return Boolean(value);
      });

      setActiveFilters(hasFilters ? filters : null);
    };

    window.addEventListener('rentappSearch', handleSearch as EventListener);

    return () => {
      window.removeEventListener('rentappSearch', handleSearch as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSuccess = () => {
      setShowUpdateSuccess(true);
      window.setTimeout(() => {
        setShowUpdateSuccess(false);
      }, 2000);
    };

    window.addEventListener('propertyEditSuccess', handleSuccess);

    return () => {
      window.removeEventListener('propertyEditSuccess', handleSuccess);
    };
  }, []);


  const handleEditClick = (propertyId: string) => {
    try {
      const property = getPropertyById(propertyId, userId);
      if (property) {
        setEditingProperty(property);
        setIsEditModalOpen(true);
        updateActivePropertyId(propertyId);
      }
    } catch (error) {
      console.error('Error loading property for editing:', error);
    }
  };

  const handleSaveProperty = (updatedProperty: PropertyFormData) => {
    if (editingProperty) {
      const success = updateProperty(editingProperty.id, updatedProperty, userId);
      if (success) {
        if (userId) {
          setProperties(getUserCreatedProperties(userId));
        }
        setIsEditModalOpen(false);
        // Clear editingProperty and stagedPropertyChanges after successful save
        setEditingProperty(null);
        setStagedPropertyChanges(null);
        updateActivePropertyId(editingProperty.id);
        // Dispatch event to notify other components and show success message
        window.dispatchEvent(new CustomEvent('propertyUpdated'));
        window.dispatchEvent(new CustomEvent('propertyEditSuccess'));
      }
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    // Don't clear editingProperty and stagedPropertyChanges here
    // They should only be cleared when:
    // 1. Changes are actually applied (in handleSaveProperty)
    // 2. User explicitly cancels (in handleCancelEdit)
    // This allows the Update button to work after staging changes
  };

  const handleCancelEdit = () => {
    // Clear editing state but keep the tracker visible
    // This allows users to see which property they were working on
    setEditingProperty(null);
    setStagedPropertyChanges(null);
    // Don't clear activePropertyId here - keep tracker visible for reference
  };

  const handleStageChanges = (stagedProperty: PropertyFormData) => {
    // Store staged changes - don't save yet
    setStagedPropertyChanges(stagedProperty);
  };

  const handleApplyStagedChanges = () => {
    // Apply staged property changes when Update button is clicked
    if (stagedPropertyChanges && editingProperty) {
      handleSaveProperty(stagedPropertyChanges);
      // handleSaveProperty will clear stagedPropertyChanges and editingProperty
    }
    // Apply staged image changes when Update button is clicked
    if (stagedImageChanges && editingImageProperty) {
      handleSaveImages(stagedImageChanges.mainImage, stagedImageChanges.additionalImages);
      setStagedImageChanges(null);
      // Clear editingImageProperty after successfully applying changes
      setEditingImageProperty(null);
    }
  };

  const handleEditImageClick = (propertyId: string) => {
    try {
      const property = getPropertyById(propertyId, userId);
      if (property) {
        setEditingImageProperty(property);
        setIsImageEditModalOpen(true);
        updateActivePropertyId(propertyId);
      }
    } catch (error) {
      console.error('Error loading property for image editing:', error);
    }
  };

  const handleSaveImages = (mainImage: string, additionalImages: string[]) => {
    if (editingImageProperty) {
      const allImages = mainImage ? [mainImage, ...additionalImages] : additionalImages;
      const updatedProperty: PropertyFormData = {
        ...editingImageProperty,
        images: allImages
      };
      const success = updateProperty(editingImageProperty.id, updatedProperty, userId);
      if (success) {
        if (userId) {
          setProperties(getUserCreatedProperties(userId));
        }
        setIsImageEditModalOpen(false);
        setEditingImageProperty(null);
        updateActivePropertyId(editingImageProperty.id);
      }
    }
  };

  const handleCloseImageEditModal = (wasStaging: boolean = false) => {
    setIsImageEditModalOpen(false);
    // If staging changes, keep editingImageProperty for applying changes later
    // If canceling without staging, clear everything
    if (!wasStaging) {
    setEditingImageProperty(null);
      setStagedImageChanges(null);
    }
  };

  const handleStageImageChanges = (mainImage: string, additionalImages: string[]) => {
    // Store staged image changes - don't save yet
    // Keep editingImageProperty set so we can apply changes later
    setStagedImageChanges({ mainImage, additionalImages });
  };

  const handleDeleteProperty = (propertyId: string) => {
    const success = deleteProperty(propertyId, userId);
    if (success) {
      if (userId) {
        setProperties(getUserCreatedProperties(userId));
      }
      setIsEditModalOpen(false);
      setEditingProperty(null);
      if (activePropertyId === propertyId) {
        updateActivePropertyId(null);
      }
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('propertyDeleted'));
      
        // Show success message
        setShowDeleteSuccess(true);
        setTimeout(() => {
          setShowDeleteSuccess(false);
        }, 2000);
    }
  };

  const handleStatusChange = (propertyId: string, newStatus: 'available' | 'occupied') => {
    try {
      const property = getPropertyById(propertyId, userId);
      if (property) {
        const updatedProperty: PropertyFormData = {
          ...property,
          status: newStatus
        };
        const success = updateProperty(propertyId, updatedProperty, userId);
        if (success) {
          if (userId) {
            setProperties(getUserCreatedProperties(userId));
          }
          updateActivePropertyId(propertyId);
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('propertyUpdated'));
        }
      }
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const renderContent = () => {
    // Wait silently during loading - don't show anything
    if (isLoading) {
      return null;
    }

    if (!isHydrated) {
      return null;
    }

    // Only show login message after loading is complete
    if (!userId) {
      return (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Log in to manage your listed properties.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-1 sm:pt-2 lg:pt-3">
        {/* Properties Grid */}
        <div className="space-y-2 sm:space-y-3 lg:space-y-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard 
                  property={property} 
                  hideBookmark={true}
                  showEditImageIcon={true}
                  onEditImageClick={() => handleEditImageClick(property.id)}
                  onStatusChange={(newStatus) => handleStatusChange(property.id, newStatus)}
                  onEditClick={() => handleEditClick(property.id)}
                  onManageStart={() => updateActivePropertyId(property.id)}
                  isActiveProperty={activePropertyId === property.id}
                  onApplyStagedChanges={handleApplyStagedChanges}
                  stagedImageCount={stagedImageChanges && editingImageProperty?.id === property.id 
                    ? (stagedImageChanges.mainImage ? 1 : 0) + stagedImageChanges.additionalImages.length 
                    : undefined}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              {properties.length === 0 && !hasActiveFilters ? (
                <>
                  <p className="text-gray-500 text-xl">You haven&apos;t listed any properties yet.</p>
                  <p className="text-gray-400 text-base mt-1">List properties to see them here.</p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-xl">No properties match your filters.</p>
                  <p className="text-gray-400 text-base mt-1">Try adjusting your search filters or add a new property.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout
      totalCount={properties.length}
      filteredCount={filteredProperties.length}
      hasActiveFilters={hasActiveFilters}
    >
      {renderContent()}

      {/* Edit Property Modal */}
      {isEditModalOpen && editingProperty && (
        <EditPropertyModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          property={editingProperty}
          onDelete={handleDeleteProperty}
          onStageChanges={handleStageChanges}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Image Edit Modal */}
      {isImageEditModalOpen && editingImageProperty && (
        <ImageEditModal
          isOpen={isImageEditModalOpen}
          onClose={(wasStaging) => handleCloseImageEditModal(wasStaging)}
          currentImages={editingImageProperty.images || []}
          onStageChanges={handleStageImageChanges}
        />
      )}

      {/* Update Success Message */}
      {showUpdateSuccess && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-8"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const modal = target.closest('.bg-green-500, .bg-blue-500');
            if (!modal) {
              setShowUpdateSuccess(false);
            }
          }}
        >
          <div className="bg-green-500 text-white p-6 rounded-xl text-center max-w-sm w-full mx-4 shadow-lg">
            <h2 className="text-2xl font-bold mb-1">Congratulations</h2>
            <h3 className="text-xl font-bold">Property Updated Successfully</h3>
          </div>
        </div>
      )}

      {/* Delete Success Message */}
      {showDeleteSuccess && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-8"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const modal = target.closest('.bg-green-500, .bg-blue-500, .bg-red-400');
            if (!modal) {
              setShowDeleteSuccess(false);
            }
          }}
        >
          <div className="bg-red-400 p-5 rounded-xl text-center max-w-xs w-full mx-4 shadow-lg">
            <h2 className="text-2xl font-bold text-white">Property deleted</h2>
          </div>
        </div>
      )}
    </Layout>
  );
}
