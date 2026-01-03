"use client";

import Layout from '@/components/Layout';
import { Users, Heart, Shield, Globe } from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/api/placeholder/150/150",
      description: "Real estate expert with 15+ years of experience in property management and technology innovation."
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "/api/placeholder/150/150",
      description: "Tech visionary leading our platform development with expertise in scalable web applications."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image: "/api/placeholder/150/150",
      description: "Operations specialist ensuring seamless service delivery and customer satisfaction."
    },
    {
      name: "David Thompson",
      role: "Head of Customer Success",
      image: "/api/placeholder/150/150",
      description: "Customer advocate dedicated to providing exceptional support and building lasting relationships."
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We prioritize the security of your data and transactions, ensuring a safe platform for all users."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Every decision we make is guided by what's best for our customers and their property needs."
    },
    {
      icon: Globe,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge solutions for modern property management."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a strong community of landlords, agents, and renters who support each other."
    }
  ];


  return (
    <Layout>
      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bio Section */}
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-black mb-6 text-center">About Rentapp</h1>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded in 2020, Rentapp emerged from a simple observation: the property rental process was unnecessarily complex and fragmented. Our founders, experienced in both real estate and technology, saw an opportunity to create a unified platform that would streamline every aspect of property management.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                What started as a vision to simplify property listings has evolved into a comprehensive ecosystem that supports landlords, agents, and renters throughout their entire journey. Today, we&apos;re proud to serve thousands of users across multiple cities, helping them find, list, and manage properties with unprecedented ease.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our commitment to innovation, customer satisfaction, and community building continues to drive us forward as we expand our services and reach new markets.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-blue-500 border-2 shadow-blue-100">
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-black mb-1">{value.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Team</h2>
            <div className="grid grid-cols-1 gap-8">
              {/* Core Team Members */}
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-blue-500 border-2 shadow-blue-100">
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-black mb-1">{member.name}</h3>
                      <p className="text-blue-600 font-medium">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              ))}

              {/* Community Card - Last Position */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-500 border-2 shadow-blue-100">
                <div className="flex items-center space-x-6 mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-black mb-1">Brokers & Property Owners</h3>
                    <p className="text-blue-600 font-medium">Our Community</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The heart of our platform. Without our dedicated brokers and property owners, Rentapp wouldn&apos;t exist. 
                  They are the foundation of our success, bringing quality properties and expertise to help renters find their perfect home.
                </p>
              </div>
            </div>
          </div>


          {/* Call to Action */}
          <div className="bg-blue-400 text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have transformed their property rental experience with Rentapp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/list-property"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                List Your Property
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
