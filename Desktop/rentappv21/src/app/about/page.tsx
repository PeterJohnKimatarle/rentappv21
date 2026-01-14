"use client";

import Layout from '@/components/Layout';
import { Users, Heart, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

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
      description: "We are committed to creating a rental environment where tenants, brokers, and landlords feel protected, informed, and confident at every stage of the process."
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
              <p className="text-lg text-gray-600 mb-3 leading-relaxed">
                Founded in 2020, Rentapp emerged from a simple observation: the property rental process was largely unstructured for renters, brokers, and landlords. This lack of structure made the system untrustworthy, caused professional brokers to be undervalued, and increased fear among renters due to the actions of a few unprofessional actors.
              </p>
              <p className="text-lg text-gray-600 mb-3 leading-relaxed">
                Rentapp was created to bring structure, accountability, and confidence into renting. We support landlords, agents, and tenants throughout their entire journey, not only during the renting phase but also through additional services that streamline the rental process and help our customers feel safe and well-supported.
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
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-600 mb-3 leading-relaxed">
                Rentapp is built around a collaborative ecosystem.
              </p>
              <p className="text-lg text-gray-600 mb-3 leading-relaxed">
                At its core, Rentapp is led by its founder and supported by a growing operational framework designed to serve the rental market with structure and accountability.
              </p>
              <p className="text-lg text-gray-600 mb-3 leading-relaxed">
                Beyond the core platform, professional brokers and responsible property owners are an essential part of the Rentapp team. They work alongside Rentapp staff to deliver reliable rental services, uphold professional standards, and create better experiences for tenants.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Together, we form a system where responsibilities are clear, interactions are accountable, and trust can grow.
              </p>
            </div>
          </div>


          {/* Call to Action */}
          <div className="bg-blue-400 text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have transformed their property rental experience with Rentapp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                prefetch={true}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Browse Properties
              </Link>
              <Link
                href="/contact"
                prefetch={true}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
