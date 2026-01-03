/**
 * Admin Settings Utilities
 * Manages admin-controlled settings stored in localStorage
 */

const STAFF_ENROLLMENT_ENABLED_KEY = 'rentapp_staff_enrollment_enabled';

/**
 * Check if staff enrollment is currently enabled
 * Defaults to false (disabled) if not set
 */
export const isStaffEnrollmentEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const value = localStorage.getItem(STAFF_ENROLLMENT_ENABLED_KEY);
  if (value === null) {
    // Default to disabled
    return false;
  }
  
  return value === 'true';
};

/**
 * Enable staff enrollment
 */
export const enableStaffEnrollment = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STAFF_ENROLLMENT_ENABLED_KEY, 'true');
};

/**
 * Disable staff enrollment
 */
export const disableStaffEnrollment = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STAFF_ENROLLMENT_ENABLED_KEY, 'false');
};

/**
 * Toggle staff enrollment status
 */
export const toggleStaffEnrollment = (): boolean => {
  const currentStatus = isStaffEnrollmentEnabled();
  if (currentStatus) {
    disableStaffEnrollment();
    return false;
  } else {
    enableStaffEnrollment();
    return true;
  }
};













