'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, ChevronRight, Pencil, MapPin, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import LoginPopup from '@/components/LoginPopup';
import PopupOverlay from '@/components/PopupOverlay';
import { isStaffEnrollmentEnabled } from '@/utils/adminSettings';

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

const regions = Object.keys(wardsByRegion).map(key => ({
  value: key,
  label: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}));

const RegisterPage: React.FC = () => {
  const [registrationType, setRegistrationType] = useState<'member' | 'staff' | 'admin'>('member');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    region: '',
    ward: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    role: 'tenant' as 'tenant' | 'landlord' | 'broker',
    profileImage: ''
  });
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isRegisterAsExpanded, setIsRegisterAsExpanded] = useState(false);
  const [staffEnrollmentEnabled, setStaffEnrollmentEnabled] = useState(false);
  const [birthYear, setBirthYear] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthDay, setBirthDay] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if staff enrollment is enabled
    const enabled = isStaffEnrollmentEnabled();
    setStaffEnrollmentEnabled(enabled);
    
    // Reset to member if staff is selected but enrollment is disabled
    if (registrationType === 'staff' && !enabled) {
      setRegistrationType('member');
    }
  }, [registrationType]);

  // Parse dateOfBirth into year, month, day
  useEffect(() => {
    if (formData.dateOfBirth) {
      const date = new Date(formData.dateOfBirth + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setBirthYear(String(date.getFullYear()));
        setBirthMonth(String(date.getMonth() + 1).padStart(2, '0'));
        setBirthDay(String(date.getDate()).padStart(2, '0'));
      }
    } else {
      setBirthYear('');
      setBirthMonth('');
      setBirthDay('');
    }
  }, [formData.dateOfBirth]);

  // Format phone number: first 4 digits, then groups of 3
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    
    // Take first 4 digits as one group
    const firstGroup = digits.slice(0, 4);
    const remaining = digits.slice(4);
    
    // Group remaining digits in groups of 3
    const groups = [firstGroup];
    for (let i = 0; i < remaining.length; i += 3) {
      groups.push(remaining.slice(i, i + 3));
    }
    
    return groups.filter(g => g.length > 0).join(' ');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters and spaces
    const digits = value.replace(/\D/g, '');
    // Format and store
    const formatted = formatPhoneNumber(digits);
    handleInputChange('phone', formatted);
  };

  // Get number of days in a month
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  // Format date as DD/MM/YYYY
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Update dateOfBirth when year, month, or day changes
  const updateDateOfBirth = (year: string, month: string, day: string) => {
    if (year && month && day) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      const daysInMonth = getDaysInMonth(yearNum, monthNum);
      
      // Validate day
      const validDay = Math.min(dayNum, daysInMonth);
      const dateStr = `${year}-${month.padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
      handleInputChange('dateOfBirth', dateStr);
    } else {
      handleInputChange('dateOfBirth', '');
    }
  };

  const handleYearChange = (year: string) => {
    setBirthYear(year);
    // Adjust day if it's invalid for the new year (e.g., Feb 29 in non-leap year)
    if (year && birthMonth && birthDay) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(birthMonth);
      const dayNum = parseInt(birthDay);
      const daysInMonth = getDaysInMonth(yearNum, monthNum);
      const validDay = Math.min(dayNum, daysInMonth);
      setBirthDay(String(validDay).padStart(2, '0'));
      updateDateOfBirth(year, birthMonth, String(validDay).padStart(2, '0'));
    } else {
      updateDateOfBirth(year, birthMonth, birthDay);
    }
  };

  const handleMonthChange = (month: string) => {
    setBirthMonth(month);
    // Adjust day if it's invalid for the new month
    if (birthYear && birthDay) {
      const yearNum = parseInt(birthYear);
      const monthNum = parseInt(month);
      const dayNum = parseInt(birthDay);
      const daysInMonth = getDaysInMonth(yearNum, monthNum);
      const validDay = Math.min(dayNum, daysInMonth);
      setBirthDay(String(validDay).padStart(2, '0'));
      updateDateOfBirth(birthYear, month, String(validDay).padStart(2, '0'));
    } else {
      updateDateOfBirth(birthYear, month, birthDay);
    }
  };

  const handleDayChange = (day: string) => {
    setBirthDay(day);
    updateDateOfBirth(birthYear, birthMonth, day);
  };

  const handleProfileImageChange = (file: File | null) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData(prev => ({ ...prev, profileImage: result }));
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.profileImage) {
      setError('Please upload a profile image to continue');
      return;
    }

    setIsLoading(true);

    try {
      // Prevent admin registration
      if (registrationType === 'admin') {
        setError('Admin registration is not available');
        setIsLoading(false);
        return;
      }

      // Check if staff enrollment is enabled
      if (registrationType === 'staff' && !staffEnrollmentEnabled) {
        setError('Staff registration is currently disabled');
        setIsLoading(false);
        return;
      }

      // Map registration type to role
      let finalRole: 'tenant' | 'landlord' | 'broker' | 'staff' | 'admin';
      if (registrationType === 'member') {
        finalRole = 'tenant'; // Default to tenant for members
      } else if (registrationType === 'staff') {
        finalRole = 'staff';
      } else {
        finalRole = 'tenant'; // Fallback to tenant
      }

      const result = await register({
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone.replace(/\s/g, ''), // Remove spaces before saving
        region: formData.region || undefined,
        ward: formData.ward || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        password: formData.password,
        role: finalRole,
        bio: '',
        profileImage: formData.profileImage
      });

      if (result.success) {
        if (finalRole === 'staff') {
          // Show message that staff account needs approval
          alert('Staff account created! Your account is pending admin approval. You will be able to access staff features once approved.');
        }
        router.push('/');
      } else {
        setError(result.message ?? 'Registration failed. Please try again.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Layout>
        <div className="bg-gray-50">
        {/* Registration Form */}
        <div className="py-8">
          <div className="max-w-md mx-auto px-6">
            {/* Form Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Join Rentapp Today</h2>
              <p className="text-gray-600">Create your account and get started</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* First Name Field */}
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First name"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Last Name Field */}
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email address"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Phone number"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Place of Birth - Region and Ward Fields (Stacked Vertically) */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">Place of birth</div>
                <div className="space-y-2">
                {/* Region Field */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      handleInputChange('region', e.target.value);
                      handleInputChange('ward', ''); // Reset ward when region changes
                    }}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                  >
                    <option value="">Select region</option>
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ward Field */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={formData.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    disabled={!selectedRegion}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select ward</option>
                    {selectedRegion && wardsByRegion[selectedRegion as keyof typeof wardsByRegion]?.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </select>
                </div>
                </div>
              </div>

              {/* Date of Birth Field */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">Date of birth</div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                  <input
                    type="text"
                    readOnly
                    value={formatDateDisplay(formData.dateOfBirth)}
                    onClick={() => setIsDatePickerOpen(true)}
                    placeholder="Click to select date"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer bg-white"
                  />
                </div>
              </div>

              {/* Date Picker Modal */}
              <PopupOverlay
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                overlayClassName="bg-black/50"
              >
                <div className="bg-white rounded-xl px-6 pt-4 pb-6 max-w-sm w-full mx-auto flex flex-col">
                  <div className="mb-5">
                    <h3 className="text-xl font-semibold text-black text-center">Select Date of Birth</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Day Dropdown */}
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                      <select
                        value={birthDay}
                        onChange={(e) => handleDayChange(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                        autoFocus
                      >
                        <option value="">Day</option>
                        {birthYear && birthMonth ? (
                          Array.from({ length: getDaysInMonth(parseInt(birthYear), parseInt(birthMonth)) }, (_, i) => {
                            const day = i + 1;
                            return (
                              <option key={day} value={String(day).padStart(2, '0')}>
                                {day}
                              </option>
                            );
                          })
                        ) : (
                          Array.from({ length: 31 }, (_, i) => {
                            const day = i + 1;
                            return (
                              <option key={day} value={String(day).padStart(2, '0')}>
                                {day}
                              </option>
                            );
                          })
                        )}
                      </select>
                    </div>
                    
                    {/* Month Dropdown */}
                    <select
                      value={birthMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      <option value="">Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((monthName, i) => {
                        const month = i + 1;
                        return (
                          <option key={month} value={String(month).padStart(2, '0')}>
                            {monthName}
                          </option>
                        );
                      })}
                    </select>
                    
                    {/* Year Dropdown */}
                    <select
                      value={birthYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      <option value="">Year</option>
                      {(() => {
                        const currentYear = new Date().getFullYear();
                        const minAge = 13;
                        const maxAge = 100; // Allow up to 100 years old
                        const startYear = currentYear - minAge;
                        const endYear = currentYear - maxAge;
                        const years = [];
                        for (let year = startYear; year >= endYear; year--) {
                          years.push(year);
                        }
                        return years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                </div>
              </PopupOverlay>

              {/* Register As Section */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsRegisterAsExpanded(!isRegisterAsExpanded)}
                  className="flex items-center justify-end gap-2 w-full text-sm font-medium text-gray-700 mb-3 cursor-pointer"
                >
                  <span>Register as</span>
                  <ChevronRight 
                    size={16} 
                    className={`text-gray-500 transition-transform duration-200 ${isRegisterAsExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
                {isRegisterAsExpanded && (
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="registrationType"
                        value="member"
                        checked={registrationType === 'member'}
                        onChange={(e) => {
                          setRegistrationType(e.target.value as 'member' | 'staff' | 'admin');
                          setIsRegisterAsExpanded(false);
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-0 focus:outline-none"
                      />
                      <span className="ml-3 text-sm text-gray-700">Member (Tenant, Landlord, or Broker)</span>
                    </label>
                    <label className={`flex items-center p-3 border border-gray-300 rounded-lg transition-colors ${
                      !staffEnrollmentEnabled ? 'cursor-not-allowed opacity-75 bg-gray-50' : 'cursor-pointer hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="registrationType"
                        value="staff"
                        checked={registrationType === 'staff'}
                        onChange={(e) => {
                          setRegistrationType(e.target.value as 'member' | 'staff' | 'admin');
                          setIsRegisterAsExpanded(false);
                        }}
                        disabled={!staffEnrollmentEnabled}
                        className="w-4 h-4 text-blue-600 focus:ring-0 focus:outline-none"
                      />
                      <span className={`ml-3 text-sm ${!staffEnrollmentEnabled ? 'text-gray-600' : 'text-gray-700'}`}>
                        Staff {!staffEnrollmentEnabled ? '(Disabled)' : '(Requires admin approval)'}
                      </span>
                    </label>
                    <label className={`flex items-center p-3 border border-gray-300 rounded-lg transition-colors ${
                      true ? 'cursor-not-allowed opacity-75 bg-gray-50' : 'cursor-pointer hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="registrationType"
                        value="admin"
                        checked={registrationType === 'admin'}
                        onChange={(e) => {
                          setRegistrationType(e.target.value as 'member' | 'staff' | 'admin');
                          setIsRegisterAsExpanded(false);
                        }}
                        disabled={true}
                        className="w-4 h-4 text-blue-600 focus:ring-0 focus:outline-none"
                      />
                      <span className="ml-3 text-sm text-gray-600">Admin (Not applicable)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Profile Image Upload */}
              <div style={{ transform: 'translateX(-20%)' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Profile image</label>
                <div className="flex flex-col items-center gap-2">
                  <label className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleProfileImageChange(event.target.files?.[0] ?? null)}
                      />
                    {previewImage ? (
                      <>
                        <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Pencil size={20} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs text-center px-2">Upload image</span>
                    )}
                    </label>
                  <p className="text-xs text-gray-500 text-center">Required. PNG or JPG up to 2MB.</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-1"
              >
                {isLoading ? (
                  'Creating Account...'
                ) : (
                  'Submit'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-2 text-center">
              <p className="text-gray-600 mb-2">
                Already have an account?
              </p>
              <button 
                onClick={() => setIsLoginPopupOpen(true)}
                className="text-blue-500 hover:text-blue-600 font-medium underline cursor-pointer"
              >
                Login here
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Popup */}
      <LoginPopup
        isOpen={isLoginPopupOpen}
        onClose={() => setIsLoginPopupOpen(false)}
      />
    </Layout>
  );
};

export default RegisterPage;