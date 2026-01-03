# Popup/Modal Implementation Guide

## ✅ All Current Popups Are Configured

All existing popups in the codebase have been updated with:
- `usePreventScroll` hook for scroll prevention
- Proper overlay styles: `touchAction: 'none', minHeight: '100vh', height: '100%'`

## 📋 Current Popups (All Configured)

1. ✅ **SharePopup** (`src/components/SharePopup.tsx`)
2. ✅ **LoginPopup** (`src/components/LoginPopup.tsx`)
3. ✅ **SearchPopup** (`src/components/SearchPopup.tsx`)
4. ✅ **EditPropertyModal** (`src/components/EditPropertyModal.tsx`)
5. ✅ **PropertyCard** popups (bookmark, remove bookmark, property details) (`src/components/PropertyCard.tsx`)
6. ✅ **ImageLightbox** (`src/components/ImageLightbox.tsx`)
7. ✅ **Footer** gesture info popup (`src/components/Footer.tsx`)
8. ✅ **Layout** mobile menu (`src/components/Layout.tsx`)
9. ✅ **List Property Page** popups (ward, main image, other images, success, error) (`src/app/list-property/page.tsx`)
10. ✅ **Profile Page** popups (edit profile, change password) (`src/app/profile/page.tsx`)
11. ✅ **Bookmarks Page** remove modal (`src/app/bookmarks/page.tsx`)
12. ✅ **Contact Page** contact options popup (`src/app/contact/page.tsx`)

## 🚀 Creating New Popups

### Option 1: Use the Reusable Component (Recommended)

```tsx
import PopupOverlay from '@/components/PopupOverlay';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopupOverlay 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)}
      overlayClassName="bg-gray-500 bg-opacity-50"
    >
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2>My Popup</h2>
        {/* Your content */}
      </div>
    </PopupOverlay>
  );
}
```

### Option 2: Manual Implementation

If you need more control, follow this pattern:

```tsx
import { useState } from 'react';
import { usePreventScroll } from '@/hooks/usePreventScroll';

function MyComponent() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // ✅ REQUIRED: Use the hook
  usePreventScroll(isPopupOpen);

  if (!isPopupOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      // ✅ REQUIRED: Add these styles to the overlay
      style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsPopupOpen(false);
        }
        e.stopPropagation();
      }}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Your popup content */}
      </div>
    </div>
  );
}
```

## ✅ Checklist for New Popups

- [ ] Import `usePreventScroll` from `@/hooks/usePreventScroll`
- [ ] Call `usePreventScroll(isOpen)` with your popup state
- [ ] Add `style={{ touchAction: 'none', minHeight: '100vh', height: '100%' }}` to the overlay div
- [ ] Ensure overlay has `className="fixed inset-0 ..."`
- [ ] Test on mobile to ensure address bar doesn't show/hide
- [ ] Test scrolling inside popup content (should work)
- [ ] Test scrolling outside popup (should be prevented)

## 🔧 How It Works

The `usePreventScroll` hook:
1. Locks both `html` and `body` with `position: fixed` and explicit viewport height
2. Prevents all scroll events on `window`, `document`, `html`, and `body`
3. Allows scrolling inside modal content areas (elements with `overflow-y-auto` or `overflow-y-scroll`)
4. Prevents page scroll when scrolling at modal boundaries (top/bottom)
5. Blocks touch events that would cause page scrolling

## 📝 Notes

- The hook automatically handles cleanup when the popup closes
- Modal content can still scroll internally - only page scrolling is prevented
- Works on both desktop and mobile
- Prevents address bar show/hide on mobile browsers

