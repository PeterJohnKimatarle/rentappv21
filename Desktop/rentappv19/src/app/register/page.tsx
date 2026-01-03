'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, ChevronRight, Pencil } from 'lucide-react';
import Layout from '@/components/Layout';
import LoginPopup from '@/components/LoginPopup';
import { isStaffEnrollmentEnabled } from '@/utils/adminSettings';

const RegisterPage: React.FC = () => {
  const [registrationType, setRegistrationType] = useState<'member' | 'staff' | 'admin'>('member');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant' as 'tenant' | 'landlord' | 'broker',
    profileImage: ''
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isRegisterAsExpanded, setIsRegisterAsExpanded] = useState(false);
  const [staffEnrollmentEnabled, setStaffEnrollmentEnabled] = useState(false);
  
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        phone: formData.phone,
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Phone number"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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