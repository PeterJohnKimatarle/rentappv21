'use client';

import Layout from '@/components/Layout';
import PropertyCard from '@/components/PropertyCard';
import { getAllProperties } from '@/utils/propertyUtils';
import { useEffect, useState } from 'react';

export default function Home() {
  const [properties, setProperties] = useState(getAllProperties());

  // Update properties when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProperties(getAllProperties());
    };

    const handlePropertyAdded = () => {
      setProperties(getAllProperties());
    };

    const handlePropertyUpdated = () => {
      setProperties(getAllProperties());
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom property added event
    window.addEventListener('propertyAdded', handlePropertyAdded);
    
    // Listen for property updated event
    window.addEventListener('propertyUpdated', handlePropertyUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('propertyAdded', handlePropertyAdded);
      window.removeEventListener('propertyUpdated', handlePropertyUpdated);
    };
  }, []);

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4">
        {/* Properties Grid */}
        <div className="space-y-2 sm:space-y-3 lg:space-y-6">
          {properties.length > 0 ? (
            properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No properties available at the moment.</p>
              <p className="text-gray-400 text-sm mt-2">Check back later!</p>
            </div>
          )}
        </div>
    </div>
    </Layout>
  );
}
