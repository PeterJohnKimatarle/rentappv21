# Rentapp - Tanzania's #1 Renting Platform

**Tagline:** Tanzania's #1 Renting Platform

## Overview

Rentapp is a digital platform that connects tenants, brokers & owners, staff, and admins to simplify the house rental process in Tanzania. It allows property owners to list properties, brokers to manage and share listings, tenants to search and book, and staff/admins to track activity and deal progress efficiently.

## Key Features

### Property Listings
Owners and brokers can list properties with images, details, and availability status.

### Confirm & Book
Tenants can instantly express interest and confirm bookings.

### Sharing
Properties can be shared with friends and family using prefilled messages to drive engagement.

### Staff Activity Tracking
Staff can log follow-ups, track property status (available, occupied, closed), and monitor broker performance.

### Admin Dashboard
Admins can see overall activity, closed deals, and manage platform users.

### Revenue Model
Commission-based; when a property is listed by a broker, commission is shared, but for owner-listed properties, Rentapp keeps 100% of the fee.

## Tech Stack

### Frontend
- **Framework**: Next.js (React-based)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

### Backend
- **API**: Next.js API routes
- **Database**: Supabase
- **Authentication**: Supabase
- **File Storage**: Supabase

### Deployment
- **Hosting**: Vercel (global hosting)

## Vision

Rentapp aims to make renting houses in Tanzania effortless, transparent, and efficient, building a marketplace that works seamlessly for all four sides: tenants, brokers & owners, staff, and admins.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rentapp-v03
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── staff/          # Staff activity tracking
│   ├── property/       # Property detail pages
│   ├── list-property/  # Property listing form
│   ├── my-properties/  # Owner/broker property management
│   ├── bookmarks/      # Tenant saved properties
│   ├── profile/        # User profile management
│   └── ...
├── components/
│   ├── Layout.tsx
│   ├── Navigation.tsx
│   ├── PropertyCard.tsx
│   ├── SharePopup.tsx
│   ├── LoginPopup.tsx
│   └── ...
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── hooks/
│   └── usePreventScroll.ts
└── utils/
    ├── propertyUtils.ts
    └── shareUtils.ts
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Manual Deployment

```bash
npm run build
npm start
```

## 📞 Contact Information

- **Official Contact**: 0755-123-500
- **Founder**: Peter
- **Platform**: Tanzania's #1 Renting Platform

## 📄 License

© 2024 Rentapp Limited. All rights reserved.
