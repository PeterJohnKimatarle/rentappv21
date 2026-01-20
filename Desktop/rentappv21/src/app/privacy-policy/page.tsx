'use client';

import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 21, 2026</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Rentapp. We respect your privacy and are committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our property rental platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
                <li><strong>Profile Information:</strong> Profile picture, bio, and user preferences</li>
                <li><strong>Property Listings:</strong> Property details, images, pricing, and location information</li>
                <li><strong>Communications:</strong> Messages, inquiries, and support requests</li>
                <li><strong>Usage Data:</strong> Browser type, device information, IP address, and browsing patterns</li>
                <li><strong>Location Data:</strong> Approximate location for property searches</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To provide, maintain, and improve our services</li>
                <li>To process and manage property listings</li>
                <li>To facilitate communication between users</li>
                <li>To personalize your experience on the platform</li>
                <li>To send you updates, notifications, and promotional materials</li>
                <li>To detect, prevent, and address technical issues and fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage</h2>
              <p className="text-gray-700 mb-4">
                Your data is stored locally on your device using browser storage (localStorage). This means:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your data remains on your device and is not automatically transmitted to our servers</li>
                <li>You maintain control over your data</li>
                <li>Clearing your browser data will remove stored information</li>
                <li>Data persistence depends on your browser settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>With Other Users:</strong> Property listings and contact information are visible to interested parties</li>
                <li><strong>Service Providers:</strong> Third-party services that help us operate the platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your personal information. However, no method 
                of transmission over the internet or electronic storage is 100% secure. While we strive to protect 
                your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use browser storage (localStorage) and similar technologies to enhance your experience. You can 
                control cookie settings through your browser preferences. Note that disabling certain storage may 
                affect platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Service is not intended for children under 18 years of age. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a child, please contact 
                us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by updating 
                the &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes acceptance 
                of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Phone:</strong> 0755-123-500</li>
                <li><strong>Email:</strong> privacy@rentapp.com</li>
                <li><strong>Support:</strong> Available 24/7</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Your Consent</h2>
              <p className="text-gray-700 mb-4">
                By using Rentapp, you consent to this Privacy Policy and agree to its terms. If you do not agree 
                with this policy, please do not use our Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
