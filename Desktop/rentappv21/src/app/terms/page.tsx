'use client';

import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'T&Cs';
  }, []);
  const router = useRouter();

  return (
    <Layout customTitle="T&Cs">
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 21, 2026</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Rentapp (&quot;the Service&quot;), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these Terms & Conditions, please do not use 
                the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use of Service</h2>
              <p className="text-gray-700 mb-4">
                Rentapp is a property rental platform that connects property owners, brokers, and renters. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and truthful information when listing or inquiring about properties</li>
                <li>Not use the Service for any illegal or unauthorized purpose</li>
                <li>Not violate any laws in your jurisdiction</li>
                <li>Respect the intellectual property rights of Rentapp and other users</li>
                <li>Not transmit any harmful code, viruses, or malicious software</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current 
                at all times. You are responsible for safeguarding your account credentials and for any activities or 
                actions under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Property Listings</h2>
              <p className="text-gray-700 mb-4">
                Property owners and brokers are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Ensuring all property information is accurate and up-to-date</li>
                <li>Having proper authorization to list the property</li>
                <li>Complying with all applicable housing laws and regulations</li>
                <li>Providing accurate pricing and availability information</li>
                <li>Responding to inquiries in a timely and professional manner</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Disclaimer of Warranties</h2>
              <p className="text-gray-700 mb-4">
                The Service is provided &quot;as is&quot; without any warranties, expressed or implied. Rentapp does not 
                guarantee the accuracy, completeness, or usefulness of any information on the Service. We do not 
                warrant that the Service will be uninterrupted, timely, secure, or error-free.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Rentapp shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                resulting from your use or inability to use the Service. This includes damages for loss of profits, 
                goodwill, use, data, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. User Content</h2>
              <p className="text-gray-700 mb-4">
                You retain ownership of any content you submit to Rentapp. By posting content, you grant Rentapp a 
                worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content 
                in connection with the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice 
                or liability, for any reason, including breach of these Terms & Conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any changes by 
                updating the &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes 
                acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Phone:</strong> 0755-123-500</li>
                <li><strong>Email:</strong> support@rentapp.com</li>
                <li><strong>Support:</strong> Available 24/7</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
