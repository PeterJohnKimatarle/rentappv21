"use client";

import Layout from '@/components/Layout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Image, Info, PlusCircle, ChevronRight } from 'lucide-react';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useAuth } from '@/contexts/AuthContext';
import { invalidatePropertiesCache } from '@/utils/propertyUtils';
import { 
  getAllPropertyTypes, 
  getPropertyTypeChildren, 
  hasSubCategories,
  formatPropertyType
} from '@/utils/propertyTypes';

// Ward data organized by region (most common and well-known wards, alphabetically sorted)
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

// Common amenities list
const commonAmenities = [
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
];

// Property interface
interface Property {
  id: string;
  propertyType: string;
  status: string;
  region: string;
  ward: string;
  price: string;
  paymentPlan: string;
  amenities: string[];
  images: string[];
  description?: string;
  uploaderType?: 'Broker' | 'Owner';
  createdAt: string;
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
  bathrooms?: string;
  area?: string;
  propertyTitle?: string;
  pricingUnit?: 'month' | 'night' | 'day' | 'hour' | '';
}

export default function ListPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [customWard, setCustomWard] = useState('');
  const [showWardPopup, setShowWardPopup] = useState(false);
  const [showMainImagePopup, setShowMainImagePopup] = useState(false);
  const [showOtherImagesPopup, setShowOtherImagesPopup] = useState(false);
  const [tempMainImage, setTempMainImage] = useState<string>('');
  const [tempAdditionalImages, setTempAdditionalImages] = useState<string[]>([]);
  const [originalMainImage, setOriginalMainImage] = useState<string>('');
  const [originalAdditionalImages, setOriginalAdditionalImages] = useState<string[]>([]);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showRemoveAllInfo, setShowRemoveAllInfo] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [selectedPropertyCategory, setSelectedPropertyCategory] = useState('');

  const [selectedPropertySubType, setSelectedPropertySubType] = useState('');


  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');
  const [rentalRateValue, setRentalRateValue] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    propertyType: '',
    status: '',
    region: '',
    ward: '',
    price: '',
    paymentPlan: '',
    amenities: [] as string[],
    mainImage: '',
    additionalImages: [] as string[],
    uploaderType: '' as 'Broker' | 'Owner' | '',
    propertyTitle: '', // New property title field
    description: '',
    bathrooms: '',
    area: '',
    pricingUnit: '' as 'month' | 'night' | 'day' | 'hour' | ''
  });

  // Sync rentalRateValue with formData.pricingUnit
  useEffect(() => {
    if (formData.pricingUnit) {
      setRentalRateValue(`price-${formData.pricingUnit}`);
    } else {
      setRentalRateValue('');
    }
  }, [formData.pricingUnit]);

  // Collapsible section state
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  // Touch gesture handling for tab switching across entire page
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const minSwipeDistance = 30; // Minimum horizontal distance for swipe recognition (30px for deliberate gestures)
  // Angle-based gesture detection: allows gestures up to 45° from horizontal
  // This means moderately diagonal swipes are accepted, but mostly vertical gestures are rejected

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchEndRef.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.targetTouches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
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
  }, [activeTab]);

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


  // localStorage functions
  const saveProperty = (property: Property) => {
    try {
      const existingProperties = JSON.parse(localStorage.getItem('rentapp_properties') || '[]');
      
      // Check if images are too large (base64 images can be huge)
      const propertySize = JSON.stringify(property).length;
      console.log('Property size:', propertySize, 'bytes');
      
      if (propertySize > 5000000) { // 5MB limit
        console.warn('Property data is too large, removing images to save');
        // Remove images if too large
        property.images = [];
      }
      
      existingProperties.push(property);
      localStorage.setItem('rentapp_properties', JSON.stringify(existingProperties));
      invalidatePropertiesCache(); // Invalidate cache for instant updates
      console.log('Property saved successfully');
      return true; // Success
    } catch (error) {
      console.error('Failed to save property:', error);
      console.log('Error details:', (error as Error).name, (error as Error).message);
      
      // Only try to manage storage if it's actually a quota error
      if ((error as Error).name === 'QuotaExceededError') {
        console.log('Storage quota exceeded, trying to make space...');
        try {
          // Keep only the last 10 properties to make room (more conservative)
          const existingProperties = JSON.parse(localStorage.getItem('rentapp_properties') || '[]');
          const recentProperties = existingProperties.slice(-10); // Keep last 10
          recentProperties.push(property);
          localStorage.setItem('rentapp_properties', JSON.stringify(recentProperties));
          invalidatePropertiesCache(); // Invalidate cache for instant updates
          console.log('Property saved after removing old properties');
          return true; // Success after cleanup
        } catch (quotaError) {
          console.error('Still failed after removing old properties:', quotaError);
          setShowError(true);
          return false; // Failure
        }
      } else {
        // For other errors, just show the error without modifying existing data
        console.error('Non-quota error occurred:', error);
        setShowError(true);
        return false; // Failure
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleMainImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempMainImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Reset input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  const handleMainImagePopupOk = () => {
    setFormData(prev => ({ ...prev, mainImage: tempMainImage }));
    setShowMainImagePopup(false);
    setTempMainImage('');
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
          // Filter out duplicates by comparing base64 strings
          const uniqueNewImages = base64Images.filter(newImage => 
            !prev.some(existingImage => existingImage === newImage)
          );
          return [...prev, ...uniqueNewImages];
        });
      });
      // Reset input value to allow selecting the same files again
      event.target.value = '';
    }
  };

  const handleOtherImagesPopupOk = () => {
    setFormData(prev => ({ ...prev, additionalImages: tempAdditionalImages }));
    setShowOtherImagesPopup(false);
    setTempAdditionalImages([]);
  };



  const removeTempAdditionalImage = (index: number) => {
    setTempAdditionalImages(prev => {
      const imageToRemove = prev[index];
      // Remove from temp
      const updatedTemp = prev.filter((_, i) => i !== index);
      // Also remove from form data by matching the base64 string
      setFormData(formPrev => ({
        ...formPrev,
        additionalImages: formPrev.additionalImages.filter(img => img !== imageToRemove)
      }));
      return updatedTemp;
    });
  };

  const removeAllTempAdditionalImages = () => {
    setTempAdditionalImages([]);
    setFormData(prev => ({ ...prev, additionalImages: [] }));
    // Reset file input
    const input = document.getElementById('additional-images-upload-popup') as HTMLInputElement;
    if (input) input.value = '';
  };

  // Long press handler for individual images
  const handleImageLongPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tempAdditionalImages.length > 0) {
      setShowDeleteAllConfirm(true);
    }
  };

  const handleConfirmDeleteAll = () => {
    removeAllTempAdditionalImages();
    setShowDeleteAllConfirm(false);
  };

  const handleCancelDeleteAll = () => {
    setShowDeleteAllConfirm(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to list a property.');
      return;
    }

    // Validate required fields with specific messages
    if (!formData.propertyType) {
      alert('Choose property category and type.');
      return;
    }
    
    if (selectedPropertyCategory && hasSubCategories(selectedPropertyCategory) && !selectedPropertySubType) {
      alert('Please select a property type.');
      return;
    }

    if (!formData.status) {
      alert('Choose status.');
      return;
    }

    if (!selectedRegion) {
      alert('Choose region.');
      return;
    }

    if (!selectedWard && !customWard) {
      alert('Choose ward.');
      return;
    }

    if (!formData.pricingUnit) {
      alert('Please select a rental rate (Price/month, Price/night, etc.).');
      return;
    }

    if (!formData.price) {
      alert('Enter price.');
      return;
    }

    if (!formData.paymentPlan) {
      alert('Choose payment plan.');
      return;
    }

    if (!formData.uploaderType) {
      alert('Choose ownership type.');
      return;
    }

    if (!formData.mainImage) {
      alert('Please add a main image for your property.');
      return;
    }

    setIsSubmitting(true);

    // Create property object
    const property: Property = {
      id: Date.now().toString(),
      propertyType: formData.propertyType,
      status: formData.status,
      region: selectedRegion,
      ward: selectedWard || customWard,
      price: formData.price,
      paymentPlan: formData.paymentPlan,
      amenities: formData.amenities,
      images: [formData.mainImage, ...formData.additionalImages].filter(img => img), // Combine main and additional images
      uploaderType: (formData.uploaderType === 'Broker' || formData.uploaderType === 'Owner') ? formData.uploaderType : undefined,
      createdAt: new Date().toISOString(),
      ownerId: user.id,
      ownerEmail: user.email,
      ownerName: user.name,
      bathrooms: formData.bathrooms || undefined,
      area: formData.area || undefined,
      propertyTitle: formData.propertyTitle || undefined,
      description: formData.description || undefined,
      pricingUnit: formData.pricingUnit
    };

    // Save to localStorage
    const saveSuccess = saveProperty(property);
    
    if (!saveSuccess) {
      setIsSubmitting(false);
      return; // Stop execution if save failed
    }

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('propertyAdded', { detail: property }));

    // Wait 2 seconds to show submit animation
    setTimeout(() => {
      // Show success message
      setShowSuccess(true);
      setIsSubmitting(false);

      // Reset form and redirect to homepage
      setTimeout(() => {
      setFormData({
        propertyType: '',
        status: '',
        region: '',
        ward: '',
        price: '',
        paymentPlan: '',
        amenities: [],
        description: '',
        mainImage: '',
        additionalImages: [],
        uploaderType: '',
        propertyTitle: '', // Reset property title
        bathrooms: '',
        area: '',
        pricingUnit: 'month'
      });
      setSelectedRegion('');
      setSelectedWard('');
      setCustomWard('');
      setSelectedPropertyCategory('');
      setSelectedPropertySubType('');
      setShowSuccess(false);
      
      // Go back to the previous page
      router.back();
    }, 3000);
    }, 2000); // 2 second delay to show submit animation
  };

  // Prevent body scroll when popup is open
  usePreventScroll(showWardPopup || showMainImagePopup || showOtherImagesPopup || showSuccess || showError || showDeleteAllConfirm || showRemoveAllInfo);
  return (
    <Layout>
      <div
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md mx-auto px-1 sm:px-2 lg:px-4 xl:pb-0 pb-20"
        >
        {/* Header Section - Mobile Only */}
            <div className="fixed xl:hidden top-14 left-0 right-0 z-10 bg-white">
                  <h1 className="text-2xl sm:text-3xl font-bold text-black text-center pt-3 pb-1">
                    List Your Property
              </h1>
              
              {/* Tab Navigation - Mobile */}
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
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500"></span>
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
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500"></span>
                  )}
                </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Desktop Only */}
            <div className="hidden xl:block xl:fixed xl:top-14 xl:left-0 xl:right-0 xl:z-10 xl:bg-gray-50 xl:mb-4">
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
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500"></span>
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
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500"></span>
                  )}
                </button>
                </div>
              </div>
            </div>
            
            {/* Spacer to account for fixed header and tabs */}
            <div className="xl:hidden h-24"></div>
            {/* Spacer for fixed tabs on desktop */}
            <div className="hidden xl:block h-14"></div>

         {/* Tab 1: Basic Information & Images */}
         {activeTab === 'basic' && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-300">
         {/* Basic Information Section */}
         <div className="text-center mb-1">
           <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
             Basic Information
           </h2>
         </div>

            {/* Basic Information Card */}
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-sm mx-auto">
               <div className="grid grid-cols-4 gap-2">
                 {/* Property Type and Profile Row - Side by Side */}
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
                         // Clear propertyType until sub-type is selected
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

                 {/* Collapsible Content - CRITICAL: Must be in SEPARATE col-span-4 container to prevent button layout shift */}
                 {/* NEVER merge this back into the button container above! Keep them separate! */}
                 {showPropertyDetails && (
                   <div className="col-span-4">
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
                 )}

                 {/* Status Row */}
                 <div className="col-span-4">
                   <label className="block text-base font-bold text-white mb-2 text-center">
                     Status
                   </label>
                   <select 
                     className="w-full px-3 py-2  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                     value={formData.status}
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
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-sm mx-auto">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-base font-bold text-white mb-2 text-center">
                    Region
                  </label>
                  <select 
                    className="w-full px-3 py-2  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
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
                    {selectedRegion ? (
                  <select 
                    className="w-full px-3 py-2  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                    value={selectedWard}
                    onChange={(e) => {
                      if (e.target.value === 'other') {
                        setShowWardPopup(true);
                        setSelectedWard('');
                      } else {
                        setSelectedWard(e.target.value);
                        setCustomWard('');
                      }
                    }}
                        required
                  >
                    <option value="" className="text-gray-400">---</option>
                        {wardsByRegion[selectedRegion as keyof typeof wardsByRegion]?.map((ward) => (
                      <option key={ward} value={ward.toLowerCase().replace(/\s+/g, '-')}>
                        {ward}
                      </option>
                    ))}
                  </select>
                    ) : (
                      <div className="w-full px-3 py-2 rounded-lg text-center h-10 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Select region</span>
                      </div>
                    )}
                  
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
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-sm mx-auto">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-base font-bold text-white mb-2 text-center">
                    Price{rentalRateValue ? '/' + rentalRateValue.replace('price-', '').charAt(0).toUpperCase() + rentalRateValue.replace('price-', '').slice(1) : ''} (Tsh)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                    placeholder="---"
                    value={formData.price}
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
                    className="w-full px-3 py-2  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                    value={formData.paymentPlan}
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

                {/* Pricing Details Dropdown - DO NOT CHANGE: flex justify-end needed for button alignment */}
                <div className="col-span-2 flex justify-end">
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-2 w-fit text-sm font-medium text-white cursor-pointer bg-transparent border-none outline-none ml-auto" // DO NOT CHANGE: w-fit for content sizing, ml-auto for right alignment
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
                        const pricingUnit = value ? value.replace('price-', '') as 'month' | 'night' | 'day' | 'hour' : '';
                        handleInputChange('pricingUnit' as keyof typeof formData, pricingUnit);
                      }}
                      required
                      className="absolute inset-0 w-fit h-full opacity-0 cursor-pointer" // DO NOT CHANGE: w-fit to match button content width
                    >
                      <option value="" className="text-gray-800">---</option>
                      <option value="price-month" className="text-gray-800">Price/month</option>
                      <option value="price-night" className="text-gray-800">Price/night</option>
                      <option value="price-hour" className="text-gray-800">Price/hour</option>
                      <option value="price-day" className="text-gray-800">Price/day</option>
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
            <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-sm mx-auto">
              <div>
                <label className="block text-base font-bold text-white mb-2 text-center">
                  Ownership Type
                </label>
                  <select 
                  className="w-full px-3 py-2  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center h-10 bg-gray-100"
                  value={formData.uploaderType}
                  onChange={(e) => handleInputChange('uploaderType', e.target.value)}
                  required
                >
                  <option value="" className="text-gray-400">---</option>
                  <option value="Owner">I own this property (Owner)</option>
                  <option value="Broker">I do not own this property (Broker)</option>
                </select>
              </div>
            </div>

         {/* Images Section */}
         <div className="text-center mb-2">
           <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
             Property Images
           </h2>
         </div>

        {/* Images Card */}
        <div className="border-2 border-black rounded-lg p-2 sm:p-3 mb-2 max-w-sm mx-auto" style={{ backgroundColor: 'rgb(190, 190, 190)' }}>
           <div className="flex gap-2 justify-center">
             {/* Main Image Button */}
             <div className="flex-1">
               <input
                 type="file"
                 accept="image/*"
                 onChange={handleMainImageUpload}
                 className="hidden"
                 id="main-image-upload"
               />
               <label htmlFor="main-image-upload" className="cursor-pointer">
                   <button 
                     type="button"
                     onClick={() => {
                       // Open popup
                       setTempMainImage(formData.mainImage); // Load current image into temp
                       setOriginalMainImage(formData.mainImage); // Store original for comparison
                       setShowMainImagePopup(true);
                     }}
                     className="w-full text-black px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12 border-2 border-black" 
                     style={{ backgroundColor: 'white' }}
                   >
                     <Image size={20} />
                     <span className="text-base whitespace-nowrap">Main image ({formData.mainImage ? '1' : '0'})</span>
                   </button>
               </label>
             </div>

             {/* Other Images Button */}
             <div className="flex-1">
               <input
                 type="file"
                 multiple
                 accept="image/*"
                 onChange={handleAdditionalImagesUpload}
                 className="hidden"
                 id="additional-images-upload"
               />
               <label htmlFor="additional-images-upload" className="cursor-pointer">
                   <button 
                     type="button"
                     onClick={() => {
                       // Open popup
                       setTempAdditionalImages([...formData.additionalImages]); // Load current images into temp
                       setOriginalAdditionalImages([...formData.additionalImages]); // Store original for comparison
                       setShowOtherImagesPopup(true);
                     }}
                     className="w-full text-black px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12 border-2 border-black" 
                     style={{ backgroundColor: 'white' }}
                   >
                     <Image size={20} />
                     <span className="text-base whitespace-nowrap">Other images ({formData.additionalImages.length})</span>
                   </button>
               </label>
             </div>
           </div>
         </div>
          </div>
         )}

         {/* Tab 2: Description & Amenities */}
         {activeTab === 'details' && (
           <div className="animate-in fade-in slide-in-from-left-4 duration-300">
         {/* Property Title Section */}
         <div className="text-center mb-1">
           <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
             Property Title
           </h2>
         </div>

         {/* Property Title Card */}
         <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-sm mx-auto">
           <input
             type="text"
             className="w-full px-3 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-800"
             placeholder="Name of your Property (Optional)"
             value={formData.propertyTitle}
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
         <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-sm mx-auto">
           <textarea
             className="w-full px-3 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-800 min-h-[120px] resize-y"
             placeholder="Describe your property... (Optional)"
             value={formData.description}
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
         <div className="bg-blue-500 rounded-lg p-2 sm:p-3 mb-2 max-w-sm mx-auto">
           <div className="grid grid-cols-2 gap-2">
             {commonAmenities.map((amenity) => (
               <label
                 key={amenity}
                 className="flex items-center gap-2 cursor-pointer p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
               >
                 <input
                   type="checkbox"
                   checked={formData.amenities.includes(amenity)}
                   onChange={() => handleAmenityToggle(amenity)}
                   className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                 />
                 <span className="text-sm text-gray-800">{amenity}</span>
               </label>
             ))}
           </div>
         </div>
           </div>
         )}

         {/* Submit and Cancel Buttons - Desktop: Show on Basic info tab */}
         {activeTab === 'basic' && (
           <div className="hidden xl:block mt-4 mb-4 xl:mb-8 max-w-sm mx-auto">
           <div className="flex gap-2">
             <div className="flex-1">
               <button 
                 type="submit"
                 disabled={isSubmitting}
                 className={`w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12 ${
                   isSubmitting ? 'cursor-wait' : ''
                 }`} 
                 style={{ backgroundColor: 'rgb(34, 197, 94)' }}
               >
                 {isSubmitting ? (
                  <span className="text-base flex items-center gap-1">
                    Posting
                    <span className="inline-flex items-center gap-0.5 translate-y-0.5">
                      <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1 h-1 rounded-full bg-white animate-bounce"></span>
                    </span>
                  </span>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    <span className="text-base">Post</span>
                  </>
                )}
               </button>
             </div>
             <div className="flex-1">
               <button 
                 type="button"
                 onClick={() => {
                   // Reset form
                   setFormData({
                     propertyType: '',
                     status: '',
                     region: '',
                     ward: '',
                     price: '',
                     paymentPlan: '',
                     amenities: [],
                    description: '',
                     mainImage: '',
                    additionalImages: [],
                      uploaderType: '',
                      propertyTitle: '',
                      bathrooms: '',
                      area: '',
                      pricingUnit: 'month'
                  });
                   setSelectedRegion('');
                   setSelectedWard('');
                   setCustomWard('');
                   setSelectedPropertyCategory('');
                   setSelectedPropertySubType('');
                   // Go back to the previous page
                   router.back();
                 }}
                 className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 h-12" 
                 style={{ backgroundColor: '#ef4444' }}
               >
                 <span className="text-base">Cancel</span>
               </button>
             </div>
           </div>
         </div>
         )}


         {/* Success Message */}
         {showSuccess && (
           <div 
             className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-8"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
             onClick={(e) => {
               const target = e.target as HTMLElement;
               const modal = target.closest('.bg-green-500, .bg-blue-500');
               if (!modal) {
                 setShowSuccess(false);
               }
             }}
           >
             <div className="bg-green-500 text-white p-6 rounded-xl text-center max-w-sm w-full mx-4 shadow-lg">
               <h2 className="text-2xl font-bold mb-1">Congratulations</h2>
               <h3 className="text-xl font-bold">Property Listed Successfully</h3>
            </div>
           </div>
         )}

         {/* Custom Error Modal */}
         {showError && (
           <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }}>
             <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
               {/* Header */}
               <div className="bg-red-500 px-6 py-4 text-center">
                 <div className="flex items-center justify-center mb-2">
                   <img
                     src="/icon.png"
                     alt="Rentapp Logo"
                     className="w-12 h-12 rounded-lg mr-3"
                   />
                   <div className="text-left">
                     <h3 className="text-xl font-bold text-white leading-tight">Rentapp</h3>
                     <p className="text-red-100 text-sm leading-tight">Tanzania&apos;s #1 Renting Platform</p>
                   </div>
                 </div>
               </div>
               
               {/* Content */}
               <div className="px-6 py-6 text-center">
                 <div className="text-red-500 text-6xl mb-4">⚠️</div>
                 <h4 className="text-lg font-semibold text-gray-800 mb-3">Technical Issue</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Sorry, it seems we are having a technical issue. Please Call/WA on{' '}
                   <a 
                     href="tel:+255755123500" 
                     className="text-blue-600 hover:text-blue-800 underline font-medium"
                   >
                     0755-123-500
                   </a>
                   {' '}for further assistance.
                 </p>
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                   <p className="text-blue-800 text-sm">
                     <strong>Quick Fix:</strong> Try refreshing the page or check your internet connection.
                   </p>
                 </div>
               </div>
               
               {/* Footer */}
               <div className="bg-gray-50 px-6 py-4 flex justify-center">
                 <button
                   onClick={() => setShowError(false)}
                   className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-lg font-medium transition-colors"
                 >
                   Ok, I got it
                 </button>
               </div>
             </div>
           </div>
         )}
        </form>

        {/* Fixed Submit and Cancel Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 xl:hidden z-40">
          <div className="max-w-sm mx-auto">
            <div className="flex gap-2">
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    // Trigger form submission
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                  disabled={isSubmitting}
                  className={`w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12 ${
                    isSubmitting ? 'cursor-wait' : ''
                  }`}
                  style={{ backgroundColor: 'rgb(34, 197, 94)' }}
                >
                  {isSubmitting ? (
                    <span className="text-base flex items-center gap-1">
                      Posting
                      <span className="inline-flex items-center gap-0.5 translate-y-0.5">
                        <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-1 rounded-full bg-white animate-bounce"></span>
                      </span>
                    </span>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      <span className="text-base">Post</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    // Reset form
                    setFormData({
                      propertyType: '',
                      status: '',
                      region: '',
                      ward: '',
                      price: '',
                      paymentPlan: '',
                      amenities: [],
                      description: '',
                      mainImage: '',
                    additionalImages: [],
                      uploaderType: '',
                      propertyTitle: '',
                      bathrooms: '',
                      area: '',
                      pricingUnit: 'month'
                  });
                    setSelectedRegion('');
                    setSelectedWard('');
                    setCustomWard('');
                    setSelectedPropertyCategory('');
                    setSelectedPropertySubType('');
                    // Go back to the previous page
                    router.back();
                  }}
                  className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 h-12"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  <span className="text-base">Cancel</span>
                </button>
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
                          
                          // Set the selected ward to the custom ward
                          setSelectedWard(customWard.trim().toLowerCase().replace(/\s+/g, '-'));
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
            <div 
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ touchAction: 'none', minHeight: '100vh', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', pointerEvents: 'auto' }}
            >
              <div 
                className="rounded-xl px-4 pt-2 pb-4 w-full mx-4 shadow-2xl overflow-hidden bg-white" 
                style={{ maxWidth: '24rem', pointerEvents: 'auto' }}
                onClick={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-black">Main image</h3>
                </div>
                
                {/* Image Preview (if temp image exists) */}
                {tempMainImage && (
                  <div className="mb-4">
                    <img 
                      src={tempMainImage} 
                      alt="Main image preview" 
                      className="w-full h-48 sm:h-56 object-cover rounded border"
                    />
                  </div>
                )}
                
                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                    id="main-image-upload-popup"
                  />
                  <button
                    type="button"
                    className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12"
                    style={{ backgroundColor: '#0071c2' }}
                    onClick={() => {
                      document.getElementById('main-image-upload-popup')?.click();
                    }}
                  >
                    <Image size={20} />
                    <span className="text-base whitespace-nowrap">{tempMainImage ? 'Change main image' : 'Add main image'} ({tempMainImage ? '1' : '0'})</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      onClick={handleMainImagePopupOk}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 text-white rounded-lg font-medium"
                      style={{ backgroundColor: '#ef4444' }}
                      onClick={() => {
                        // Restore original image and close popup (discard all changes)
                        setTempMainImage(originalMainImage);
                        setShowMainImagePopup(false);
                        // Reset file input
                        const input = document.getElementById('main-image-upload-popup') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Images Popup */}
          {showOtherImagesPopup && (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ touchAction: 'none', minHeight: '100vh', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', pointerEvents: 'auto' }}
            >
              <div 
                className={`rounded-xl px-4 pt-2 pb-4 w-full mx-4 shadow-2xl overflow-hidden ${tempAdditionalImages.length > 0 ? 'flex flex-col max-h-[85vh] xl:max-h-[95vh]' : ''} bg-white`}
                style={{ maxWidth: '24rem', pointerEvents: 'auto', paddingBottom: tempAdditionalImages.length > 0 ? 'env(safe-area-inset-bottom)' : undefined }}
                onClick={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                {tempAdditionalImages.length > 0 ? (
                  <>
                {/* Header - Fixed */}
                    <div className="px-4 pt-3 flex-shrink-0 relative pb-3 -mx-4 -mt-2">
                      <div className="flex items-center justify-start relative">
                        <h3 className="text-xl font-bold text-black leading-tight">Other images</h3>
                    <button
                      type="button"
                      onClick={() => setShowRemoveAllInfo(true)}
                          className="absolute right-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                      title="How to remove all images"
                          style={{ top: '50%', transform: 'translateY(-50%)' }}
                    >
                          <Info size={22} className="text-gray-700" />
                    </button>
                      </div>
                </div>
                
                {/* Images Preview - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-4 pb-2 -mx-4 min-h-0">
                      <div className="mb-0">
                      <div className="flex flex-col gap-2">
                        {tempAdditionalImages.map((image, index) => (
                          <div key={index} className="flex gap-2">
                            <img 
                              src={image} 
                              alt={`Additional ${index + 1}`} 
                                className="w-3/4 xl:w-4/5 h-44 sm:h-48 object-cover rounded border"
                              onTouchStart={(e) => {
                                const timer = setTimeout(() => {
                                  handleImageLongPress(e);
                                }, 800);
                                (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer = timer;
                              }}
                              onTouchEnd={(e) => {
                                const timer = (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer;
                                if (timer) {
                                  clearTimeout(timer);
                                  (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer = undefined;
                                }
                              }}
                              onTouchMove={(e) => {
                                const timer = (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer;
                                if (timer) {
                                  clearTimeout(timer);
                                  (e.currentTarget as HTMLElement & { longPressTimer?: NodeJS.Timeout }).longPressTimer = undefined;
                                }
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                handleImageLongPress(e);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeTempAdditionalImage(index)}
                              onDragStart={(e) => e.preventDefault()}
                              onMouseDown={(e) => {
                                // Prevent text selection on mouse down
                                if (e.detail > 1) {
                                  e.preventDefault(); // Prevent double-click selection
                                }
                              }}
                                onMouseEnter={(e) => {
                                  // Only apply hover effect on desktop
                                  if (window.innerWidth >= 1280) {
                                    const button = e.currentTarget as HTMLButtonElement;
                                    button.style.backgroundColor = '#dc2626';
                                    const span = button.querySelector('span') as HTMLElement;
                                    if (span) {
                                      span.style.color = '#000000';
                                    }
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  // Only apply hover effect on desktop
                                  if (window.innerWidth >= 1280) {
                                    const button = e.currentTarget as HTMLButtonElement;
                                    button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                                    const span = button.querySelector('span') as HTMLElement;
                                    if (span) {
                                      span.style.color = '#ffffff';
                                    }
                                  }
                                }}
                                className="flex-1 xl:flex-none xl:w-[60px] px-4 py-2 xl:px-2 xl:py-1.5 text-white rounded-lg font-medium self-center text-2xl xl:text-xl select-none outline-none focus:outline-none"
                              style={{ 
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none',
                                WebkitTouchCallout: 'none',
                                WebkitTapHighlightColor: 'transparent',
                                outline: 'none',
                                  touchAction: 'manipulation',
                                  transition: 'none'
                                }}
                                onTouchEnd={(e) => {
                                  // Ensure button resets to default state on mobile after touch
                                  if (window.innerWidth < 1280) {
                                    const button = e.currentTarget as HTMLButtonElement;
                                    button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                                    const span = button.querySelector('span') as HTMLElement;
                                    if (span) {
                                      span.style.color = '#ffffff';
                                    }
                                  }
                              }}
                            >
                              <span 
                                style={{ 
                                  transform: 'scaleX(1.3)', 
                                  display: 'inline-block', 
                                    userSelect: 'none',
                                    color: '#ffffff',
                                    transition: 'none'
                                }}
                              >
                                −
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
                  </>
                ) : (
                  <>
                    {/* Header */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-black">Other images</h3>
                    </div>
                  </>
                )}
                
                {/* Buttons */}
                <div className={`flex flex-col gap-2 ${tempAdditionalImages.length > 0 ? 'p-4 pt-2 pb-3 flex-shrink-0 -mx-4' : ''}`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAdditionalImagesUpload}
                    className="hidden"
                    id="additional-images-upload-popup"
                  />
                  <button
                    type="button"
                    className="w-full text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors h-12"
                    style={{ backgroundColor: '#0071c2' }}
                    onClick={() => {
                      document.getElementById('additional-images-upload-popup')?.click();
                    }}
                  >
                    <Image size={20} />
                    <span className="text-base whitespace-nowrap">{tempAdditionalImages.length > 0 ? 'Add more images' : 'Add images'} ({tempAdditionalImages.length})</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      onClick={handleOtherImagesPopupOk}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 text-white rounded-lg font-medium"
                      style={{ backgroundColor: '#ef4444' }}
                      onClick={() => {
                        // Restore original images and close popup (discard all changes)
                        setTempAdditionalImages([...originalAdditionalImages]);
                        setShowOtherImagesPopup(false);
                        // Reset file input
                        const input = document.getElementById('additional-images-upload-popup') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remove All Info Popup */}
          {showRemoveAllInfo && (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }}
            >
              <div 
                className="rounded-xl p-4 w-full mx-4 shadow-2xl overflow-hidden max-w-[20rem] xl:max-w-[20rem]"
                style={{ backgroundColor: '#0071c2' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-white mb-1.5 xl:hidden">Long Press Gestures</h2>
                  <h2 className="text-2xl font-bold text-white mb-1.5 hidden xl:block">Remove All Images</h2>
                  <p className="text-white/80 text-base xl:hidden"><span className="font-bold">Remove all images at once</span><br />by long pressing any image.</p>
                  <p className="text-white/80 text-base hidden xl:block"><span className="font-bold">Remove all images at once</span><br />right-click any image.</p>
                </div>
                <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowRemoveAllInfo(false)}
                    className="w-2/3 px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Ok, I got it
                </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete All Confirmation Popup */}
          {showDeleteAllConfirm && (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }}
            >
              <div 
                className="rounded-xl p-4 w-full mx-4 shadow-2xl overflow-hidden max-w-[20rem] xl:max-w-[20rem]"
                style={{ backgroundColor: '#0071c2' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-3">
                  <h2 className="text-2xl font-bold text-white mb-1">Remove All Images</h2>
                  <p className="text-white/80 text-base">Are you sure you want to remove all images at once ?</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmDeleteAll}
                    className="flex-1 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelDeleteAll}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }












