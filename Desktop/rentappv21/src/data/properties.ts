export interface Property {
  id: string;
  title: string;
  location: string;
  description: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  plan: '3+' | '6+' | '12+';
  updatedAt: string;
  status: 'available' | 'occupied';
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  uploaderType?: 'Broker' | 'Owner';
  propertyTitle?: string;
  amenities: string[];
}

export const properties: Property[] = [];

