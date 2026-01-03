"use client";

import Layout from '@/components/Layout';
import { User, Building, Heart, Mail, Pencil, ChevronRight, MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user, updateUser, changePassword, deleteOwnAccount, isLoading } = useAuth();
  const router = useRouter();
  const isStaffUser = user?.role === 'staff';
  const isAdminUser = user?.role === 'admin';
  const [userType, setUserType] = useState<'member' | 'staff' | 'admin'>('member');
  const [isUserTypeExpanded, setIsUserTypeExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Block background scroll when popup is open
  usePreventScroll(isEditPopupOpen || isPasswordPopupOpen || showDeleteConfirm);

  // Auto-close delete confirmation modal after 60 seconds
  useEffect(() => {
    if (showDeleteConfirm) {
      const timer = window.setTimeout(() => {
        setShowDeleteConfirm(false);
      }, 60000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [showDeleteConfirm]);

  const [userData, setUserData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: '',
    role: 'tenant' as 'tenant' | 'landlord' | 'broker' | 'staff' | 'admin'
  });

  const [formData, setFormData] = useState(userData);
  const [saveError, setSaveError] = useState('');
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const editProfileScrollRef = useRef<HTMLDivElement | null>(null);
  const passwordScrollRef = useRef<HTMLDivElement | null>(null);
  
  const handleEditProfileInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputEl = e.currentTarget;
    // Defer to allow viewport resize due to keyboard before scrolling
    setTimeout(() => {
      // Scroll the input into view within the popup
      inputEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      // Nudge the container slightly for extra space
      editProfileScrollRef.current?.scrollBy({ top: -24, behavior: 'smooth' });
    }, 0);
  };

  const handlePasswordInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    // Defer to allow viewport resize due to keyboard before scrolling
    setTimeout(() => {
      // Scroll the input into view within the popup
      inputEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      // Nudge the container slightly for extra space
      passwordScrollRef.current?.scrollBy({ top: -24, behavior: 'smooth' });
    }, 0);
  };
  const handlePasswordInputBlur = () => {
    // no-op
  };

  // Dynamically add bottom padding equal to the virtual keyboard height (when present)
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [editProfileKeyboardInset, setEditProfileKeyboardInset] = useState(0);
  
  useEffect(() => {
    if (!isEditPopupOpen) {
      setEditProfileKeyboardInset(0);
      return;
    }
    const vv = typeof window !== 'undefined'
      ? (window as Window & { visualViewport?: VisualViewport }).visualViewport
      : undefined;
    if (!vv) return;
    const handleResize = () => {
      // Amount of viewport covered by keyboard (rough estimate)
      const covered = Math.max(0, window.innerHeight - vv.height);
      // Add a small buffer so last input and buttons stay above keyboard
      setEditProfileKeyboardInset(covered > 0 ? covered + 32 : 0);
    };
    handleResize();
    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, [isEditPopupOpen]);

  useEffect(() => {
    if (!isPasswordPopupOpen) {
      setKeyboardInset(0);
      return;
    }
    const vv = typeof window !== 'undefined'
      ? (window as Window & { visualViewport?: VisualViewport }).visualViewport
      : undefined;
    if (!vv) return;
    const handleResize = () => {
      // Amount of viewport covered by keyboard (rough estimate)
      const covered = Math.max(0, window.innerHeight - vv.height);
      // Add a small buffer so last input and buttons stay above keyboard
      setKeyboardInset(covered > 0 ? covered + 32 : 0);
    };
    handleResize();
    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, [isPasswordPopupOpen]);

  useEffect(() => {
    if (!user) return;
    const derivedFirst = user.firstName ?? user.name?.split(' ')[0] ?? '';
    const derivedLast = user.lastName ?? user.name?.split(' ').slice(1).join(' ')?.trim() ?? '';
    setUserData({
      name: user.name,
      firstName: derivedFirst,
      lastName: derivedLast,
      email: user.email,
      phone: user.phone ?? '',
      bio: user.bio ?? '',
      profileImage: user.profileImage ?? '',
      role: user.role
    });
    
    // Map role to userType for the collapsible section
    if (user.role === 'staff') {
      setUserType('staff');
    } else if (user.role === 'admin') {
      setUserType('admin');
    } else {
      setUserType('member');
    }
  }, [user]);

  useEffect(() => {
    setFormData(userData);
  }, [userData]);

  const handleEdit = () => {
    setIsEditPopupOpen(true);
    setSaveError('');
  };

  const handleSave = async () => {
    setSaveError('');
    setIsSavingChanges(true);

    const combinedName = `${formData.firstName} ${formData.lastName}`.trim();

    // Map userType to role
    let finalRole: 'tenant' | 'landlord' | 'broker' | 'staff' | 'admin';
    let isApprovedStatus: boolean | undefined;
    
    if (userType === 'member') {
      finalRole = 'tenant'; // Default to tenant for members
      isApprovedStatus = undefined; // No approval needed for members
    } else if (userType === 'staff') {
      finalRole = 'staff';
      // If user is already approved staff, keep approval. Otherwise set to false (pending)
      isApprovedStatus = (isStaffUser && user?.isApproved === true) ? true : false;
    } else {
      finalRole = 'admin';
      isApprovedStatus = undefined; // No approval needed for admin
    }

    const result = await updateUser({
      name: combinedName || formData.name || userData.name,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      profileImage: formData.profileImage,
      role: finalRole,
      isApproved: isApprovedStatus
    });

    setIsSavingChanges(false);

    if (result.success) {
      setIsEditPopupOpen(false);
      // Only reload if role changed (user context updates automatically otherwise)
      const roleChanged = finalRole !== user?.role;
      if (roleChanged) {
        // Role change requires reload to update permissions/UI
        window.location.reload();
      }
      // Otherwise, user state is already updated by updateUser, no reload needed
    } else {
      setSaveError(result.message ?? 'Unable to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditPopupOpen(false);
    setSaveError('');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      if (field === 'firstName' || field === 'lastName') {
        const updated = {
          ...prev,
          [field]: value,
        };
        const combined = `${updated.firstName} ${updated.lastName}`.trim();
        return {
          ...updated,
          name: combined || updated.name,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleProfileImageChange = async (file: File | null) => {
    if (!file) return;

    setIsUpdatingImage(true);
    setSaveError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : '';
      setFormData(prev => ({
        ...prev,
        profileImage: imageData
      }));
      setUserData(prev => ({
        ...prev,
        profileImage: imageData
      }));
      setIsUpdatingImage(false);
      
      // Wait 2 seconds then save automatically
      setTimeout(async () => {
        setIsSavingChanges(true);
        const combinedName = `${formData.firstName} ${formData.lastName}`.trim();
        
        // Map userType to role
        let finalRole: 'tenant' | 'landlord' | 'broker' | 'staff' | 'admin';
        let isApprovedStatus: boolean | undefined;
        
        if (userType === 'member') {
          finalRole = 'tenant';
          isApprovedStatus = undefined;
        } else if (userType === 'staff') {
          finalRole = 'staff';
          isApprovedStatus = (isStaffUser && user?.isApproved === true) ? true : false;
        } else {
          finalRole = 'admin';
          isApprovedStatus = undefined;
        }

        const updateResult = await updateUser({
          name: combinedName || formData.name || userData.name,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          profileImage: imageData,
          role: finalRole,
          isApproved: isApprovedStatus
        });

        setIsSavingChanges(false);

        if (updateResult.success) {
          setSaveError('');
          setUserData(prev => ({
            ...prev,
            name: combinedName || formData.name || userData.name,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio,
            profileImage: imageData,
            role: finalRole
          }));
        } else {
          setSaveError(updateResult.message ?? 'Unable to update profile image. Please try again.');
        }
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = () => {
    setIsPasswordPopupOpen(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSave = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setIsChangingPassword(true);

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

    setIsChangingPassword(false);

    if (result.success) {
      setPasswordSuccess('Password updated successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setIsPasswordPopupOpen(false);
        setPasswordSuccess('');
      }, 800);
    } else {
      setPasswordError(result.message ?? 'Unable to change password.');
    }
  };

  const handlePasswordCancel = () => {
    setIsPasswordPopupOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await deleteOwnAccount();
    setIsDeleting(false);
    
    if (result.success) {
      setShowDeleteConfirm(false);
      setIsEditPopupOpen(false);
      // Redirect to homepage after account deletion
      router.push('/');
    } else {
      alert(result.message ?? 'Failed to delete account. Please try again.');
    }
  };

  // Wait silently during loading - don't show anything
  if (isLoading) {
    return null;
  }

  // Only show login message after loading is complete
  if (!user) {
    return (
      <Layout>
        <div className="bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
            <p className="text-gray-600 mb-6">Please log in to view your profile information.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl xl:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm mb-8 border border-blue-500 border-2 shadow-blue-100">
            <div className="p-8">
              {/* Profile Header */}
              <div className="flex items-center space-x-6 mb-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <label className="relative block w-24 h-24 rounded-full overflow-hidden cursor-pointer">
                  {userData.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt={userData.name}
                        className="w-full h-full object-cover border-2 border-blue-500"
                    />
                  ) : (
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center border-2 border-blue-500">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleProfileImageChange(event.target.files?.[0] ?? null)}
                    />
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full p-1 flex items-center justify-center">
                      {isUpdatingImage ? (
                        <span className="text-[10px] px-1">…</span>
                      ) : (
                        <Pencil size={12} className="-rotate-12" />
                      )}
                    </div>
                  </label>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {userData.firstName || userData.name?.split(' ')[0] || 'Unnamed user'}
                  </h2>
                  <p className="text-gray-600 mb-1">{userData.email || 'No email provided'}</p>
                  <p className="text-gray-600">{userData.phone || 'No phone number provided'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handlePasswordChange}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 whitespace-nowrap"
                >
                  Change Password
                </button>
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 whitespace-nowrap"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/my-properties"
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-blue-500 border-2 shadow-blue-100 flex items-center space-x-4"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black">My Properties</h3>
            </a>

            <a
              href="/bookmarks"
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-blue-500 border-2 shadow-blue-100 flex items-center space-x-4"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black">Bookmarks</h3>
            </a>

            <a
              href="/contact"
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-blue-500 border-2 shadow-blue-100 flex items-center space-x-4"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black">Support</h3>
            </a>
          </div>
        </div>
      </div>

      {/* Edit Profile Popup */}
      {isEditPopupOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            // Only close on desktop (screen width >= 1280px) when clicking outside
            if (window.innerWidth >= 1280) {
              const target = e.target as HTMLElement;
              const modal = target.closest('.bg-white.rounded-xl');
              // Close if clicking outside the modal
              if (!modal) {
              handleCancel();
            }
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] xl:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-center pt-3 pb-2 px-4 bg-white sticky top-0 z-10 relative">
              <h3 className="text-2xl font-semibold text-black">Edit Details</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="absolute right-2 text-gray-700 px-2 py-2 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                title="Delete Account"
              >
                <MoreVertical size={24} />
              </button>
            </div>
            {/* Content */}
            <div 
              ref={editProfileScrollRef}
              className="p-4 overflow-y-auto flex-1"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: editProfileKeyboardInset || 16 }}
            >
            
            <div className="space-y-3">
                {/* Basic Info Fields */}
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    onFocus={handleEditProfileInputFocus}
                    placeholder="First Name"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    onFocus={handleEditProfileInputFocus}
                    placeholder="Last Name"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onFocus={handleEditProfileInputFocus}
                    placeholder="Email"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onFocus={handleEditProfileInputFocus}
                    placeholder="Phone"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* User Type Section - Full Width */}
              <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setIsUserTypeExpanded(!isUserTypeExpanded)}
                    className="flex items-center justify-end gap-2 w-full text-sm font-medium text-gray-700 mb-0.5 cursor-pointer"
                  >
                    <span>User Type</span>
                    <ChevronRight 
                      size={16} 
                      className={`text-gray-500 transition-transform duration-200 ${isUserTypeExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {isUserTypeExpanded && (
                    <div className="space-y-2 mb-4">
                      <label className={`flex items-center p-3 border border-gray-300 rounded-lg transition-colors whitespace-nowrap ${
                        isAdminUser
                          ? 'cursor-not-allowed opacity-50 bg-gray-100'
                          : 'cursor-pointer hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="userType"
                          value="member"
                          checked={userType === 'member'}
                          onChange={(e) => setUserType(e.target.value as 'member' | 'staff' | 'admin')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                          disabled={isAdminUser}
                        />
                        <span className={`ml-3 text-sm whitespace-nowrap ${isAdminUser ? 'text-gray-500' : 'text-gray-700'}`}>
                          Member {isAdminUser ? '(Not available)' : '(Tenant, Landlord or Broker)'}
                        </span>
                      </label>
                      <label className={`flex items-center p-3 border border-gray-300 rounded-lg transition-colors whitespace-nowrap ${
                        isAdminUser
                          ? 'cursor-not-allowed opacity-50 bg-gray-100'
                          : 'cursor-pointer hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="userType"
                          value="staff"
                          checked={userType === 'staff'}
                          onChange={(e) => setUserType(e.target.value as 'member' | 'staff' | 'admin')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                          disabled={isAdminUser}
                        />
                        <span className={`ml-3 text-sm whitespace-nowrap ${isAdminUser ? 'text-gray-500' : 'text-gray-700'}`}>
                          Staff {isAdminUser ? '(Not available)' : '(Requires an admin approval)'}
                        </span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="userType"
                          value="admin"
                          checked={userType === 'admin'}
                          onChange={(e) => setUserType(e.target.value as 'member' | 'staff' | 'admin')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="ml-3 text-sm text-gray-700 whitespace-nowrap">Admin</span>
                      </label>
                    </div>
                  )}
              </div>

              {/* Error Message */}
                {saveError && (
                  <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {saveError}
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex flex-row gap-3 pt-3">
                <button
                  onClick={handleSave}
                  disabled={isSavingChanges}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingChanges ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Popup */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const modal = target.closest('.bg-white.rounded-xl, .rounded-xl');
            // Close if clicking outside the modal
            if (!modal) {
              setShowDeleteConfirm(false);
            }
          }}
          onTouchEnd={(e) => {
            const target = e.target as HTMLElement;
            const modal = target.closest('.bg-white.rounded-xl, .rounded-xl');
            // Close if touching outside the modal
            if (!modal) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div 
            className="rounded-xl p-6 w-full mx-4 shadow-2xl overflow-hidden max-w-sm"
            style={{ backgroundColor: '#0071c2' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
              <p className="text-white/80 text-sm">Are you sure you want to delete your account? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Popup */}
      {isPasswordPopupOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            // Only close on desktop (screen width >= 1280px) when clicking outside
            if (window.innerWidth >= 1280) {
              const target = e.target as HTMLElement;
              const modal = target.closest('.bg-white.rounded-xl');
              // Close if clicking outside the modal
              if (!modal) {
              handlePasswordCancel();
            }
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-sm w-full max-h-[65vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-center pt-3 pb-2 px-4 bg-white sticky top-0 z-10">
              <h3 className="text-2xl font-semibold text-black">Change Password</h3>
            </div>
            {/* Content */}
            <div
              ref={passwordScrollRef}
              className="p-4 overflow-y-auto flex-1"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: keyboardInset || 16 }}
            >
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                    placeholder="Current Password"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onFocus={handlePasswordInputFocus}
                    onBlur={handlePasswordInputBlur}
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                    placeholder="New Password"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onFocus={handlePasswordInputFocus}
                    onBlur={handlePasswordInputBlur}
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onFocus={handlePasswordInputFocus}
                    onBlur={handlePasswordInputBlur}
                  />
                </div>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                    {passwordSuccess}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-row gap-3 pt-3">
                  <button
                    onClick={handlePasswordSave}
                    disabled={isChangingPassword}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handlePasswordCancel}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}