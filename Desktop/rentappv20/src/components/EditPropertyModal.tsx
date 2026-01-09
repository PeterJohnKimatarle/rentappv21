'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PropertyFormData } from '@/utils/propertyUtils';
import { Image, MoreVertical, ChevronRight } from 'lucide-react';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { 
  getAllPropertyTypes, 
  getPropertyTypeChildren, 
  hasSubCategories,
  formatPropertyType,
  parsePropertyType
} from '@/utils/propertyTypes';

// Ward data (same as list-property page)
const wardsByRegion = {
  'arusha': ['Arusha Central', 'Arusha North', 'Arusha South', 'Engaruka', 'Karatu', 'Kimandolu', 'Kisongo', 'Longido', 'Makuyuni', 'Mbuguni', 'Meru', 'Monduli', 'Mto wa Mbu', 'Ngaramtoni', 'Ngorongoro', 'Sakina', 'Tengeru', 'Themi', 'Unga Limited', 'Usa River', 'Other'],
  'dar-es-salaam': ['Buguruni', 'Chang\'ombe', 'Ilala', 'Kawe', 'Kariakoo', 'Kigamboni', 'Kijitonyama', 'Kinondoni', 'Kivukoni', 'Mbagala', 'Mbagala Kuu', 'Mbagala Rangi Tatu', 'Masaki', 'Mbezi', 'Mchikichini', 'Mikocheni', 'Msasani', 'Mtoni', 'Oyster Bay', 'Sinza', 'Tabata', 'Tandika', 'Temeke', 'Ubungo', 'Other'],
  'dodoma': ['Bahi', 'Chamwino', 'Chemba', 'Dodoma Central', 'Dodoma Urban', 'Hombolo', 'Kigwe', 'Kikombo', 'Kisese', 'Kongwa', 'Makutupora', 'Mlali', 'Mpwapwa', 'Mvumi', 'Ntyuka', 'Other'],
  'geita': ['Bukombe', 'Chato', 'Geita', 'Geita Town', 'Kakubilo', 'Katoro', 'Mabale', 'Mbogwe', 'Nyakabale', 'Nyang\'hwale', 'Other'],
  'iringa': ['Iringa Central', 'Iringa North', 'Iringa Urban', 'Kilolo', 'Kiponzelo', 'Mafinga', 'Mlowa', 'Mufindi', 'Other'],
  'kagera': ['Biharamulo', 'Bukoba', 'Bukoba Urban', 'Kanyigo', 'Karagwe', 'Kashasha', 'Kyerwa', 'Missenyi', 'Muleba', 'Ngara', 'Other'],
  'katavi': ['Karema', 'Mlele', 'Mpanda', 'Mpanda Town', 'Mpanda Urban', 'Other'],
  'kigoma': ['Buhigwe', 'Kakonko', 'Kasulu', 'Kibondo', 'Kigoma', 'Kigoma Urban', 'Uvinza', 'Other'],
  'kilimanjaro': ['Hai', 'Mawenzi', 'Moshi', 'Moshi Urban', 'Mwanga', 'Rombo', 'Same', 'Shirimatunda', 'Siha', 'Other'],
  'lindi': ['Kilwa', 'Kilwa Kivinje', 'Kilwa Masoko', 'Lindi', 'Lindi Urban', 'Liwale', 'Nachingwea', 'Ruangwa', 'Other'],
  'manyara': ['Babati', 'Babati Urban', 'Dareda', 'Hanang', 'Kiteto', 'Mbulu', 'Simanjiro', 'Other'],
  'mara': ['Bunda', 'Butiama', 'Musoma', 'Musoma Urban', 'Rorya', 'Serengeti', 'Tarime', 'Other'],
  'mbeya': ['Busokelo', 'Chunya', 'Ileje', 'Kyela', 'Mbarali', 'Mbeya', 'Mbeya Urban', 'Mbozi', 'Momba', 'Rungwe', 'Other'],
  'morogoro': ['Gairo', 'Kilombero', 'Kilosa', 'Malinyi', 'Morogoro', 'Morogoro Urban', 'Mvomero', 'Ulanga', 'Other'],
  'mtwara': ['Masasi', 'Masasi Urban', 'Mtwara', 'Mtwara Urban', 'Nanyumbu', 'Newala', 'Tandahimba', 'Other'],
  'mwanza': ['Ilemela', 'Kwimba', 'Magu', 'Misungwi', 'Mwanza Urban', 'Nyamagana', 'Sengerema', 'Ukerewe', 'Other'],
  'njombe': ['Ludewa', 'Makambako', 'Makete', 'Njombe', 'Njombe Urban', 'Wanging\'ombe', 'Other'],
  'pwani': ['Bagamoyo', 'Chalinze', 'Kibaha', 'Kibaha Urban', 'Kisarawe', 'Mafia', 'Mkuranga', 'Rufiji', 'Other'],
  'rukwa': ['Kalambo', 'Nkasi', 'Sumbawanga', 'Sumbawanga Urban', 'Other'],
  'ruvuma': ['Mbinga', 'Songea', 'Songea Urban', 'Tunduru', 'Other'],
  'shinyanga': ['Kahama', 'Kahama Urban', 'Kishapu', 'Msalala', 'Shinyanga', 'Shinyanga Urban', 'Other'],
  'simiyu': ['Bariadi', 'Busega', 'Itilima', 'Maswa', 'Meatu', 'Other'],
  'singida': ['Ikungi', 'Iramba', 'Manyoni', 'Mkalama', 'Singida', 'Singida Urban', 'Other'],
  'songwe': ['Ileje', 'Mbozi', 'Momba', 'Songwe', 'Other'],
  'tabora': ['Igunga', 'Kaliua', 'Nzega', 'Sikonge', 'Tabora', 'Tabora Urban', 'Urambo', 'Uyui', 'Other'],
  'tanga': ['Handeni', 'Handeni Urban', 'Kilindi', 'Korogwe', 'Korogwe Urban', 'Lushoto', 'Mkinga', 'Muheza', 'Pangani', 'Tanga', 'Tanga Urban', 'Other'],
  'unguja-north': ['Kaskazini A', 'Kaskazini B', 'Mkokotoni', 'Nungwi', 'Other'],
  'unguja-south': ['Kizimkazi', 'Kusini', 'Kusini Unguja', 'Makunduchi', 'Other'],
  'urban-west': ['Magharibi', 'Malindi', 'Mjini', 'Stone Town', 'Other'],
  'other': ['Other']
};

// Delete Confirmation Popup Component with countdown
function DeleteConfirmPopup({ 
  onConfirm, 
  onCancel
}: { 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onCancel();
    }, 60000);

    return () => {
      clearTimeout(timer);
    };
  }, [onCancel]);

  const handleCancel = () => {
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ touchAction: 'none', minHeight: '100vh', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
        e.stopPropagation();
      }}
    >
      <div 
        className="rounded-xl p-4 w-full mx-4 shadow-2xl overflow-hidden max-w-sm"
        style={{ backgroundColor: 'white' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-black mb-1.5">Delete this property</h3>
          <p className="text-gray-600 text-sm">Are you sure you want to delete this property?</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-gray-800 rounded-lg font-medium transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyFormData | null;
  onDelete?: (propertyId: string) => void;
  onStageChanges?: (stagedProperty: PropertyFormData) => void;
  onCancel?: () => void;
}

export default function EditPropertyModal({ isOpen, onClose, property, onDelete, onStageChanges, onCancel }: EditPropertyModalProps) {
  const [formData, setFormData] = useState<PropertyFormData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [customWard, setCustomWard] = useState('');
  const [showWardPopup, setShowWardPopup] = useState(false);
  const [showMainImagePopup, setShowMainImagePopup] = useState(false);
  const [showOtherImagesPopup, setShowOtherImagesPopup] = useState(false);
  const [tempMainImage, setTempMainImage] = useState<string>('');
  const [tempAdditionalImages, setTempAdditionalImages] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [originalProperty, setOriginalProperty] = useState<PropertyFormData | null>(null);
  // Staged changes - only applied when Save Changes is clicked
  const [stagedFormData, setStagedFormData] = useState<PropertyFormData | null>(null);
  const [stagedRegion, setStagedRegion] = useState<string>('');
  const [stagedWard, setStagedWard] = useState<string>('');
  const [stagedCustomWard, setStagedCustomWard] = useState<string>('');
  const [stagedMainImage, setStagedMainImage] = useState<string>('');
  const [stagedAdditionalImages, setStagedAdditionalImages] = useState<string[]>([]);
  const [selectedPropertyCategory, setSelectedPropertyCategory] = useState('');
  const [selectedPropertySubType, setSelectedPropertySubType] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');
  const [rentalRateValue, setRentalRateValue] = useState('');

  // Collapsible section state
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  // Swipe gesture handling for tab navigation
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const minSwipeDistance = 30; // Minimum horizontal distance for swipe recognition (30px for deliberate gestures)
  // Angle-based gesture detection: allows gestures up to 45° from horizontal
  // This means moderately diagonal swipes are accepted, but mostly vertical gestures are rejected

  // Keyboard navigation for tabs (desktop only)
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1280 || ('ontouchstart' in window)) {
      return; // Only for desktop non-touch devices
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (activeTab === 'basic') {
          setActiveTab('details');
        }
      } else if (event.key === 'ArrowLeft') {
        if (activeTab === 'details') {
          setActiveTab('basic');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Touch event handlers for swipe navigation between tabs
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) {
      touchStartRef.current = null;
      touchEndRef.current = null;
      return;
    }

    const touchStart = touchStartRef.current;
    const touchEnd = touchEndRef.current;

    // Calculate gesture properties
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Reset touch refs
    touchStartRef.current = null;
    touchEndRef.current = null;

    // Filter out gestures that don't meet criteria
    if (absDeltaX < minSwipeDistance) return; // Not far enough horizontally

    // Angle-based filtering: calculate gesture angle from horizontal
    // Allow gestures up to 45° from horizontal (moderately diagonal)
    const angle = Math.abs(Math.atan2(absDeltaY, absDeltaX) * 180 / Math.PI);
    if (angle > 45) return; // Gesture too diagonal (over 45° from horizontal)

    // Handle tab switching based on current tab and horizontal swipe direction
    if (activeTab === 'basic' && deltaX > 0) {
      // On Basic Info: left-to-right swipe → switch to Extra Info
      setActiveTab('details');
    } else if (activeTab === 'details' && deltaX < 0) {
      // On Extra Info: right-to-left swipe → switch to Basic Info
      setActiveTab('basic');
    }
  }, [activeTab, minSwipeDistance]);

  // Initialize form data when property changes
  useEffect(() => {
    if (property) {
      try {
        // Ensure pricingUnit has a default value if missing
        const propertyWithDefaults = {
          ...property,
          pricingUnit: property.pricingUnit || 'month'
        };
        setFormData(propertyWithDefaults);
        setOriginalProperty(property);
        setSelectedRegion(property.region || '');
        setSelectedWard(property.ward || '');
        
        // Split images into main and additional
        if (property.images && property.images.length > 0) {
          setTempMainImage(property.images[0]);
          setTempAdditionalImages(property.images.slice(1));
        } else {
          setTempMainImage('');
          setTempAdditionalImages([]);
        }
        
        // Parse property type to set category and sub-type
        const parsedType = parsePropertyType(property.propertyType || '');
        if (parsedType) {
          setSelectedPropertyCategory(parsedType.parent);
          setSelectedPropertySubType(parsedType.child || '');
        } else {
          setSelectedPropertyCategory('');
          setSelectedPropertySubType('');
        }
        
        // Initialize rental rate value from existing property (default to month if no pricingUnit)
        const pricingUnit = property.pricingUnit || 'month';
        console.log('🎯 EditPropertyModal - Property pricingUnit:', property.pricingUnit, 'Final pricingUnit:', pricingUnit);

        // Handle pricing unit format - some properties might already have 'price-' prefix
        const rentalRateValue = pricingUnit.startsWith('price-') ? pricingUnit : `price-${pricingUnit}`;
        console.log('🎯 EditPropertyModal - Final rentalRateValue:', rentalRateValue);
        setRentalRateValue(rentalRateValue);

        // Reset staged changes
        setStagedFormData(null);
        setStagedRegion('');
        setStagedWard('');
        setStagedCustomWard('');
        setStagedMainImage('');
        setStagedAdditionalImages([]);
      } catch (error) {
        console.error('Error initializing edit form:', error);
      }
    }
  }, [property]);

  // Block background scroll when modal is open
  usePreventScroll(isOpen);

  const handleInputChange = (field: keyof PropertyFormData, value: string | string[]) => {
    if (!formData) return;
    // Stage the change - don't update formData directly
    setStagedFormData(prev => {
      const base = prev || formData;
      return { ...base, [field]: value };
    });
  };

  const handleMainImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempMainImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };

  const handleAdditionalImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imagePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagePromises).then(base64Images => {
        setTempAdditionalImages(prev => {
          const uniqueNewImages = base64Images.filter(newImage => 
            !prev.some(existingImage => existingImage === newImage)
          );
          return [...prev, ...uniqueNewImages];
        });
      });
      event.target.value = '';
    }
  };

  const handleMainImagePopupOk = () => {
    // Stage the image changes
    setStagedMainImage(tempMainImage);
    setStagedAdditionalImages([...tempAdditionalImages]);
    setShowMainImagePopup(false);
  };

  const handleOtherImagesPopupOk = () => {
    // Stage the image changes
    setStagedMainImage(tempMainImage);
    setStagedAdditionalImages([...tempAdditionalImages]);
    setShowOtherImagesPopup(false);
  };

  const removeTempAdditionalImage = (index: number) => {
    setTempAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllTempAdditionalImages = () => {
    setTempAdditionalImages([]);
  };

  // Check if there are any staged changes
  const hasChanges = (): boolean => {
    if (!formData || !originalProperty) return false;

    // Use staged values if they exist, otherwise use current values
    const currentFormData = stagedFormData || formData;
    const currentRegion = stagedRegion || selectedRegion;
    const currentWard = stagedWard || selectedWard || stagedCustomWard || customWard;
    const currentMainImage = stagedMainImage !== '' ? stagedMainImage : tempMainImage;
    const currentAdditionalImages = stagedAdditionalImages.length > 0 ? stagedAdditionalImages : tempAdditionalImages;

    // Check form fields
    const fieldsToCheck: (keyof PropertyFormData)[] = [
      'title', 'description', 'price', 'bedrooms', 'bathrooms', 'squareFootage', 'area',
      'contactName', 'contactPhone', 'contactEmail', 'status', 'propertyType', 'paymentPlan', 'pricingUnit', 'amenities', 'propertyTitle'
    ];
    
    for (const field of fieldsToCheck) {
      if (field === 'amenities') {
        // Special handling for amenities array
        const currentAmenities = currentFormData.amenities || [];
        const originalAmenities = originalProperty.amenities || [];
        if (currentAmenities.length !== originalAmenities.length ||
            !currentAmenities.every(a => originalAmenities.includes(a)) ||
            !originalAmenities.every(a => currentAmenities.includes(a))) {
          return true;
        }
      } else if (currentFormData[field] !== originalProperty[field]) {
        return true;
      }
    }

    // Check uploaderType separately (normalize empty string to undefined for comparison)
    const formUploaderType = (currentFormData.uploaderType === 'Broker' || currentFormData.uploaderType === 'Owner') ? currentFormData.uploaderType : undefined;
    const originalUploaderType = (originalProperty.uploaderType === 'Broker' || originalProperty.uploaderType === 'Owner') ? originalProperty.uploaderType : undefined;
    if (formUploaderType !== originalUploaderType) {
      return true;
    }

    // Check region and ward
    if (currentRegion !== originalProperty.region) return true;
    if (currentWard !== originalProperty.ward) return true;

    // Check images
    const currentImages = [currentMainImage, ...currentAdditionalImages].filter(img => img);
    const originalImages = originalProperty.images || [];
    
    if (currentImages.length !== originalImages.length) return true;
    
    for (let i = 0; i < currentImages.length; i++) {
      if (currentImages[i] !== originalImages[i]) {
        return true;
      }
    }

    return false;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !property || !hasChanges()) return;

    // Validate rental rate selection
    const currentRentalRate = (stagedFormData || formData).pricingUnit;
    if (!currentRentalRate) {
      alert('Choose rental rate.');
      return;
    }

    // Use staged values if they exist, otherwise use current values
    const finalFormData = stagedFormData || formData;
    const finalRegion = stagedRegion || selectedRegion;
    const finalWard = stagedWard || selectedWard || stagedCustomWard || customWard;
    const finalMainImage = stagedMainImage !== '' ? stagedMainImage : tempMainImage;
    const finalAdditionalImages = stagedAdditionalImages.length > 0 ? stagedAdditionalImages : tempAdditionalImages;

    const stagedProperty: PropertyFormData = {
      ...finalFormData,
      id: property.id, // Preserve ID
      createdAt: property.createdAt, // Preserve creation date
      images: [finalMainImage, ...finalAdditionalImages].filter(img => img),
      region: finalRegion,
      ward: finalWard,
      // Normalize uploaderType: empty string becomes undefined
      uploaderType: (finalFormData.uploaderType === 'Broker' || finalFormData.uploaderType === 'Owner') ? finalFormData.uploaderType : undefined,
    };

    // Stage the changes - don't save yet
    if (onStageChanges) {
      onStageChanges(stagedProperty);
    }
    // Close modal but don't clear editingProperty - it's needed for Update button
    onClose();
  };

  if (!isOpen || !property || !formData) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ minHeight: '100vh', height: '100%', touchAction: 'none', padding: '0.3125rem 10px' }}
      onTouchStart={(e) => {
        e.stopPropagation();
        onTouchStart(e);
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
        onTouchMove(e);
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        onTouchEnd();
      }}
    >
      <div
        className="bg-white flex flex-col shadow-2xl max-h-[calc(90vh-2px)] xl:max-h-[calc(95vh-2px)]"
        style={{
          touchAction: 'pan-y',
          width: 'calc(100vw - 20px)',
          margin: '0 auto',
          marginTop: '-13px',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white pt-2 pb-2 px-4 z-10 flex-shrink-0"
             style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <div className="flex items-center justify-center relative mb-2">
            <h2 className="text-2xl font-bold text-gray-900 px-4" style={{ paddingBottom: '0', lineHeight: '1.2', display: 'inline-block' }}>Edit Details</h2>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteConfirm(true);
                }}
                className="absolute right-2 text-gray-700 px-2 py-2 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                title="Delete Property"
              >
                <MoreVertical size={24} />
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="border-b-[3px] border-transparent max-w-sm mx-auto">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex-1 px-4 py-2 font-semibold text-base transition-colors relative cursor-pointer ${
                  activeTab === 'basic'
                    ? 'text-blue-500'
                    : 'text-gray-500'
                }`}
              >
                Basic info
                {activeTab === 'basic' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-4 py-2 font-semibold text-base transition-colors relative cursor-pointer ${
                  activeTab === 'details'
                    ? 'text-blue-500'
                    : 'text-gray-500'
                }`}
              >
                Extra info
                {activeTab === 'details' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <form onSubmit={handleSave} className="w-full px-1 sm:px-2 lg:px-4 xl:pb-0 pb-4">
          {/* Tab 1: Basic Information */}
          {activeTab === 'basic' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Basic Information Section */}
              <div className="text-center mb-1 mt-2">
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
                  Basic Information
                </h2>
              </div>

          {/* Basic Information Card */}
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-[calc(26rem-4.5px)] xl:max-w-[calc(28rem-4.5px)] mx-auto">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-2">
                <label className="block text-base font-bold text-white mb-2 text-center">
                  Property Type
                </label>
                <select 
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                  value={selectedPropertyCategory}
                  onChange={(e) => {
                    const category = e.target.value;
                    setSelectedPropertyCategory(category);
                    setSelectedPropertySubType('');
                    
                    // If category has no sub-categories, set propertyType directly
                    if (category && !hasSubCategories(category)) {
                      handleInputChange('propertyType', category);
                    } else {
                      handleInputChange('propertyType', '');
                    }
                  }}
                  required
                >
                  <option value="" className="text-gray-400">---</option>
                  {getAllPropertyTypes().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-base font-bold text-white mb-2 text-center">
                  Profile
                </label>
                {selectedPropertyCategory && hasSubCategories(selectedPropertyCategory) ? (
                  <select 
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                    value={selectedPropertySubType}
                    onChange={(e) => {
                      const subType = e.target.value;
                      setSelectedPropertySubType(subType);
                      if (selectedPropertyCategory && subType) {
                        handleInputChange('propertyType', formatPropertyType(selectedPropertyCategory, subType));
                      }
                    }}
                    required
                  >
                    <option value="" className="text-gray-400">---</option>
                    {getPropertyTypeChildren(selectedPropertyCategory)?.map((child) => (
                      <option key={child} value={child}>
                        {child}
                      </option>
                    ))}
                  </select>
                ) : selectedPropertyCategory ? (
                  <div className="w-full px-3 py-2 rounded-lg text-center h-10 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-700 text-sm">{selectedPropertyCategory}</span>
                  </div>
                ) : (
                  <div className="w-full px-3 py-2 rounded-lg text-center h-10 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Select type</span>
                  </div>
                )}
              </div>
              {/* Property Details Dropdown - DO NOT CHANGE: flex justify-end needed for button alignment */}
              {/* IMPORTANT: Button MUST stay in its own col-span-4 container. DO NOT merge with collapsible content below! */}
              <div className="col-span-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPropertyDetails(!showPropertyDetails)}
                  className="flex items-center gap-2 w-fit text-sm font-medium text-white cursor-pointer ml-auto" // DO NOT CHANGE: w-fit for content sizing, ml-auto for right alignment
                >
                  <span>Extra details</span>
                  <ChevronRight
                    size={16}
                    className={`text-white transition-transform duration-200 ${showPropertyDetails ? 'rotate-90' : ''}`}
                  />
                </button>
              </div>

              {/* Collapsible Content - CRITICAL: Must be in SEPARATE container to prevent button layout shift */}
              {/* NEVER merge this back into the button container above! Keep them separate! */}
              <div className={`col-span-4 overflow-hidden transition-all duration-300 ease-in-out ${showPropertyDetails ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
                  <div>
                    <label className="block text-base font-bold text-white mb-2 text-center">
                      Bathrooms
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    >
                      <option value="" className="text-gray-400">---</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-white mb-2 text-center">
                      Area (sqm)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                      placeholder="---"
                      value={formData.area}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, '');
                        if (value) {
                          value = parseInt(value).toLocaleString();
                        }
                        handleInputChange('area', value);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-4">
                <label className="block text-base font-bold text-white mb-2 text-center">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                  value={(stagedFormData || formData).status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  required
                >
                  <option value="" className="text-gray-400">---</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="text-center mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
              Location
            </h2>
          </div>

          {/* Location Card */}
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-[calc(26rem-4.5px)] xl:max-w-[calc(28rem-4.5px)] mx-auto">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-base font-bold text-white mb-2 text-center">
                  Region
                </label>
                <select 
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                  value={stagedRegion || selectedRegion}
                  onChange={(e) => {
                    setStagedRegion(e.target.value);
                    setStagedWard('');
                    setStagedCustomWard('');
                    setSelectedRegion(e.target.value);
                    setSelectedWard('');
                    setCustomWard('');
                  }}
                  required
                >
                  <option value="" className="text-gray-400">---</option>
                    <option value="arusha">Arusha</option>
                    <option value="dar-es-salaam">Dar es Salaam</option>
                    <option value="dodoma">Dodoma</option>
                    <option value="geita">Geita</option>
                    <option value="iringa">Iringa</option>
                    <option value="kagera">Kagera</option>
                    <option value="katavi">Katavi</option>
                    <option value="kigoma">Kigoma</option>
                    <option value="kilimanjaro">Kilimanjaro</option>
                    <option value="lindi">Lindi</option>
                    <option value="manyara">Manyara</option>
                    <option value="mara">Mara</option>
                    <option value="mbeya">Mbeya</option>
                    <option value="morogoro">Morogoro</option>
                    <option value="mtwara">Mtwara</option>
                    <option value="mwanza">Mwanza</option>
                    <option value="njombe">Njombe</option>
                    <option value="pwani">Pwani</option>
                    <option value="rukwa">Rukwa</option>
                    <option value="ruvuma">Ruvuma</option>
                    <option value="shinyanga">Shinyanga</option>
                    <option value="simiyu">Simiyu</option>
                    <option value="singida">Singida</option>
                    <option value="songwe">Songwe</option>
                    <option value="tabora">Tabora</option>
                    <option value="tanga">Tanga</option>
                    <option value="unguja-north">Unguja North</option>
                    <option value="unguja-south">Unguja South</option>
                    <option value="urban-west">Urban West</option>
                    <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-bold text-white mb-2 text-center">
                  Ward
                </label>
                <select 
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                  disabled={!(stagedRegion || selectedRegion)}
                  value={stagedWard || selectedWard}
                  onChange={(e) => {
                    if (e.target.value === 'other') {
                      setShowWardPopup(true);
                      setStagedWard('');
                      setSelectedWard('');
                    } else {
                      setStagedWard(e.target.value);
                      setStagedCustomWard('');
                      setSelectedWard(e.target.value);
                      setCustomWard('');
                    }
                  }}
                  required
                >
                  <option value="" className="text-gray-400">---</option>
                    {selectedRegion && wardsByRegion[selectedRegion as keyof typeof wardsByRegion]?.map((ward) => (
                      <option key={ward} value={ward.toLowerCase().replace(/\s+/g, '-')}>
                        {ward}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="text-center mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
              Pricing & Terms
            </h2>
          </div>

          {/* Pricing Card */}
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-[calc(26rem-4.5px)] xl:max-w-[calc(28rem-4.5px)] mx-auto">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-base font-bold text-white mb-2 text-center">
                  {rentalRateValue === 'price-night' ? 'Price/night (Tsh)' :
                   rentalRateValue === 'price-hour' ? 'Price/hour (Tsh)' :
                   rentalRateValue === 'price-day' ? 'Price/day (Tsh)' :
                   rentalRateValue === 'price-month' ? 'Price/month (Tsh)' :
                   'Price (Tsh)'}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                  placeholder="---"
                  value={(stagedFormData || formData).price}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^\d]/g, '');
                    if (value) {
                      value = parseInt(value).toLocaleString();
                    }
                    handleInputChange('price', value);
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-base font-bold text-white mb-2 text-center">
                  Payment Plan
                </label>
                <select
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                  value={(stagedFormData || formData).paymentPlan}
                  onChange={(e) => handleInputChange('paymentPlan', e.target.value)}
                  required
                >
                  <option value="" className="text-gray-400">---</option>
                  <option value="3+">3+ Months</option>
                  <option value="6+">6+ Months</option>
                  <option value="12+">12+ Months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              {/* Rental Rate Dropdown */}
              <div className="col-span-2 flex justify-end">
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center justify-end gap-2 w-auto pr-2 text-sm font-medium text-white cursor-pointer bg-transparent border-none outline-none whitespace-nowrap"
                    style={{ backgroundColor: 'transparent' }}
                    onClick={(e) => {
                      const select = e.currentTarget.nextElementSibling as HTMLSelectElement;
                      if (select) select.click();
                    }}
                  >
                    <span>Rental rate</span>
                    <ChevronRight
                      size={16}
                      className="text-white"
                    />
                  </button>
                  <select
                    value={rentalRateValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRentalRateValue(value);
                      // Update the pricingUnit in the form data (empty string for no selection)
                      const pricingUnit = value ? value.replace('price-', '') as 'month' | 'night' | 'day' | 'hour' : '';
                      handleInputChange('pricingUnit' as keyof PropertyFormData, pricingUnit);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="" className="text-gray-400">---</option>
                    <option value="price-month">Price/month</option>
                    <option value="price-night">Price/night</option>
                    <option value="price-hour">Price/hour</option>
                    <option value="price-day">Price/day</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Property Ownership Section */}
          <div className="text-center mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
              Property ownership
            </h2>
          </div>

          {/* Property Ownership Card */}
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-[calc(26rem-4.5px)] xl:max-w-[calc(28rem-4.5px)] mx-auto">
            <div>
              <label className="block text-base font-bold text-white mb-2 text-center">
                Ownership Type
              </label>
              <select
                className="w-full px-3 py-2  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                value={(stagedFormData || formData).uploaderType || ''}
                onChange={(e) => handleInputChange('uploaderType', e.target.value)}
                required
              >
                <option value="" className="text-gray-400">---</option>
                <option value="Owner">I own this property (Owner)</option>
                <option value="Broker">I do not own this property (Broker)</option>
              </select>
            </div>
          </div>
            </div>
          )}

          {/* Tab 2: Details */}
          {activeTab === 'details' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Property Title Section */}
          <div className="text-center mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
              Property Title
            </h2>
          </div>

          {/* Property Title Card */}
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-[calc(26rem-4.5px)] xl:max-w-[calc(28rem-4.5px)] mx-auto">
            <input
              type="text"
              className="w-full px-3 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-800"
              placeholder="Name of your Property (Optional)"
              value={(stagedFormData || formData).propertyTitle || ''}
              onChange={(e) => handleInputChange('propertyTitle', e.target.value)}
            />
          </div>

          {/* Description Section */}
          <div className="text-center mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
              Description
            </h2>
          </div>

          {/* Description Card */}
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-[calc(26rem-4.5px)] xl:max-w-[calc(28rem-4.5px)] mx-auto">
            <textarea
              className="w-full px-3 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-800 min-h-[120px] resize-y"
              placeholder="Describe your property... (Optional)"
              value={(stagedFormData || formData).description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Amenities Section */}
          <div className="text-center mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
              Amenities
            </h2>
          </div>

          {/* Amenities Card */}
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-[calc(26rem-4.5px)] xl:max-w-[calc(28rem-4.5px)] mx-auto">
            <div className="grid grid-cols-2 gap-2">
              {[
                'Wi-Fi',
                'Parking',
                'Security',
                'Water Supply',
                'Electricity',
                'Air Conditioning',
                'Furnished',
                'Kitchen',
                'Balcony',
                'Garden',
                'Swimming Pool',
                'Gym',
                'Elevator',
                'Pet Friendly'
              ].map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(stagedFormData || formData).amenities.includes(amenity)}
                    onChange={(e) => {
                      const currentAmenities = (stagedFormData || formData).amenities;
                      const newAmenities = e.target.checked
                        ? [...currentAmenities, amenity]
                        : currentAmenities.filter(a => a !== amenity);
                      handleInputChange('amenities', newAmenities);
                    }}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

            </div>
          )}

          </form>
        </div>

        {/* Submit and Cancel Buttons - Fixed at bottom of modal */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-1 sm:px-2 lg:px-4 py-2"
             style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
          <div className="max-w-[26rem] xl:max-w-md mx-auto">
            <div className="flex gap-2">
              <div className="flex-1">
                <button
                  type="submit"
                  disabled={!hasChanges()}
                  className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:cursor-not-allowed h-12"
                  style={{ backgroundColor: 'rgb(34, 197, 94)' }}
                  onClick={() => {
                    // Trigger form submission
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                >
                  <span className="text-base">Save Changes</span>
                </button>
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onCancel) {
                      onCancel();
                    }
                    onClose();
                  }}
                  className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12"
                  style={{ backgroundColor: 'rgb(239, 68, 68)' }}
                >
                  <span className="text-base">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Ward Popup */}
      {showWardPopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ 
            touchAction: 'none', 
            minHeight: '100vh', 
            height: '100%', 
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="rounded-xl p-4 w-full mx-4 shadow-2xl overflow-hidden bg-white" 
            style={{ 
              maxWidth: '21.6rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Custom Ward</h3>
              <p className="text-gray-600 mt-2">Enter the name of your ward in {selectedRegion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center h-10 bg-white text-gray-800 placeholder-gray-400"
                placeholder="Enter ward name"
                value={customWard}
                onChange={(e) => setCustomWard(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                onClick={() => {
                  setShowWardPopup(false);
                  setCustomWard('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors"
                onClick={() => {
                  if (customWard.trim()) {
                    // Add the custom ward to the region's ward list
                    const regionKey = selectedRegion as keyof typeof wardsByRegion;
                    if (regionKey && wardsByRegion[regionKey]) {
                      // Create a new ward list with the custom ward added
                      const updatedWards = [...wardsByRegion[regionKey].filter(ward => ward !== 'Other'), customWard.trim(), 'Other'];
                      wardsByRegion[regionKey] = updatedWards;
                      
                      // Stage and set the selected ward to the custom ward
                      const wardValue = customWard.trim().toLowerCase().replace(/\s+/g, '-');
                      setStagedCustomWard(customWard.trim());
                      setStagedWard(wardValue);
                      setSelectedWard(wardValue);
                      setCustomWard('');
                      setShowWardPopup(false);
                    }
                  }
                }}
                disabled={!customWard.trim()}
              >
                Add Ward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Image Popup */}
      {showMainImagePopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-xl p-4 w-full mx-4 shadow-2xl overflow-hidden" style={{ backgroundColor: '#0071c2', maxWidth: '24rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white">Main image</h3>
            </div>
            {tempMainImage && (
              <div className="mb-4">
                <img src={tempMainImage} alt="Main image preview" className="w-full h-32 object-cover rounded border" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" id="main-image-upload-edit" />
              <button
                type="button"
                className="w-full text-black px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12 border-2 border-black"
                style={{ backgroundColor: 'white' }}
                onClick={() => document.getElementById('main-image-upload-edit')?.click()}
              >
                <Image size={20} />
                <span className="text-base whitespace-nowrap">{tempMainImage ? 'Change image' : 'Add image'} ({tempMainImage ? '1' : '0'})</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                  onClick={() => {
                    if (tempMainImage) {
                      setTempMainImage('');
                    } else {
                      setShowMainImagePopup(false);
                    }
                  }}
                >
                  {tempMainImage ? 'Remove' : 'Cancel'}
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  onClick={handleMainImagePopupOk}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Images Popup */}
      {showOtherImagesPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-xl w-full mx-4 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ backgroundColor: '#0071c2', maxWidth: '24rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="text-center p-4 pb-2 flex-shrink-0">
              <h3 className="text-xl font-bold text-white">Other images</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              {tempAdditionalImages.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-col gap-2">
                    {tempAdditionalImages.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <img src={image} alt={`Additional ${index + 1}`} className="w-3/4 h-32 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => removeTempAdditionalImage(index)}
                          onDragStart={(e) => e.preventDefault()}
                          onMouseDown={(e) => { if (e.detail > 1) { e.preventDefault(); } }}
                          className="flex-1 px-4 py-2 text-white rounded-lg font-medium self-center text-2xl select-none outline-none focus:outline-none"
                          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', WebkitTouchCallout: 'none', WebkitTapHighlightColor: 'transparent', outline: 'none', touchAction: 'manipulation' }}
                        >
                          <span style={{ transform: 'scaleX(1.3)', display: 'inline-block', userSelect: 'none' }}>−</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 p-4 pt-2 flex-shrink-0">
              <input type="file" multiple accept="image/*" onChange={handleAdditionalImagesUpload} className="hidden" id="additional-images-upload-edit" />
              <button
                type="button"
                className="w-full text-black px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12 border-2 border-black"
                style={{ backgroundColor: 'white' }}
                onClick={() => document.getElementById('additional-images-upload-edit')?.click()}
              >
                <Image size={20} />
                <span className="text-base whitespace-nowrap">{tempAdditionalImages.length > 0 ? 'Add more images' : 'Add images'} ({tempAdditionalImages.length})</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                  onClick={() => {
                    if (tempAdditionalImages.length > 0) {
                      removeAllTempAdditionalImages();
                    } else {
                      setShowOtherImagesPopup(false);
                    }
                  }}
                >
                  {tempAdditionalImages.length > 0 ? 'Remove all' : 'Cancel'}
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  onClick={handleOtherImagesPopupOk}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && onDelete && property && (
        <DeleteConfirmPopup
          onConfirm={() => {
            if (onDelete && property) {
              onDelete(property.id);
              setShowDeleteConfirm(false);
              onClose();
            }
          }}
          onCancel={() => {
            setShowDeleteConfirm(false);
          }}
        />
      )}


    </div>
  );
}
