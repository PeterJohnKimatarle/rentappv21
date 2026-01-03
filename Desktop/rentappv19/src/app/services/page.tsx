"use client";

import Layout from '@/components/Layout';
import { Home, Search, Calendar, MapPin, Package, Settings, Headphones } from 'lucide-react';
import { useRouter } from 'next/navigation';



export default function ServicesPage() {
  const router = useRouter();

  const handleContactClick = () => {
    router.push('/contact');
  };

  const services = [
    {
      id: 1,
      title: "Property Listing",
      description: "List your property with us and reach thousands of potential tenants. Our platform makes it easy to showcase your property with photos, detailed descriptions, and contact information.",
      icon: Home,
      features: [
        "Professional property photos",
        "Detailed property descriptions",
        "Contact management",
        "Tenant screening tools"
      ]
    },
    {
      id: 2,
      title: "Property Renting",
      description: "Find your perfect rental property with our comprehensive search tools. Browse through verified listings and connect directly with landlords.",
      icon: Search,
      features: [
        "Verified property listings",
        "Direct landlord contact",
        "Rental application process",
        "Lease management tools"
      ]
    },
    {
      id: 3,
      title: "Property Visitation",
      description: "Schedule and manage property visits with ease. Our system allows you to book viewings and coordinate with property owners seamlessly.",
      icon: Calendar,
      features: [
        "Online visit scheduling",
        "Calendar integration",
        "Visit reminders",
        "Property tour coordination"
      ]
    },
    {
      id: 4,
      title: "Relocation Services",
      description: "Get comprehensive support for your relocation needs. From finding the right neighborhood to settling into your new home.",
      icon: MapPin,
      features: [
        "Neighborhood guides",
        "Moving assistance",
        "Local service connections",
        "Settlement support"
      ]
    },
    {
      id: 5,
      title: "Temporal Storage Services",
      description: "Secure storage solutions for your belongings during transitions. Safe, accessible, and flexible storage options for all your needs.",
      icon: Package,
      features: [
        "Secure storage facilities",
        "Flexible rental periods",
        "24/7 access options",
        "Insurance coverage"
      ]
    },
    {
      id: 6,
      title: "Property Management",
      description: "Professional property management services for landlords. From tenant screening to maintenance coordination, we handle it all.",
      icon: Settings,
      features: [
        "Tenant screening",
        "Rent collection",
        "Maintenance coordination",
        "Property inspections"
      ]
    },
    {
      id: 7,
      title: "24/7 Customer Care",
      description: "Round-the-clock support for all your property needs. Our dedicated team is always available to assist you with any questions or concerns.",
      icon: Headphones,
      features: [
        "24/7 availability",
        "Multi-channel support",
        "Emergency assistance",
        "Quick response times"
      ]
    }
  ];

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-6 mt-6 flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 whitespace-nowrap text-center mx-auto">
            Explore Rentapp Services
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Rentapp empowers landlords, agents, and renters to connect, list, and manage properties effortlessly — all in one trusted platform. Explore our services with complete peace of mind.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-blue-500 border-2 shadow-blue-100"
              >
                {/* Service Icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-lg mb-4 mx-auto shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <IconComponent size={32} className="text-white" />
                </div>

                {/* Service Title */}
                <h3 className="text-xl font-bold mb-3 text-center text-blue-600">
                  {service.title}
                </h3>

                {/* Service Description */}
                <p className="text-gray-600 mb-4 text-center leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="bg-blue-600 rounded-xl p-4 text-center text-white">
          <p className="text-base mb-4 opacity-90">
            Have questions about our services? our team is available 24/7 to assist you.
          </p>
          
          {/* Contact Us Button */}
          <button 
            onClick={handleContactClick}
            className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Contact us
          </button>
        </div>
      </div>
    </Layout>
  );
}
