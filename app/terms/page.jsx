'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className='container max-w-3xl px-4 py-12 mx-auto'>
      <h1 className='mb-8 text-4xl font-bold'>Terms of Service</h1>

      <div className='prose max-w-none'>
        <p className='mb-6 text-gray-600'>Last updated: {new Date().toLocaleDateString()}</p>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>1. Accepting Terms</h2>
          <p className='mb-4 text-gray-600'>By using LawBud, you agree to:</p>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Provide accurate information during registration and usage</li>
            <li>Not misuse AI-generated responses as formal legal advice</li>
            <li>Maintain the confidentiality of your account</li>
            <li>Accept platform notifications and updates</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>2. Services</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>AI Legal Assistant:</strong> Provides general legal information but{' '}
              <em>not a substitute for professional legal advice</em>
            </li>
            <li>
              <strong>Lawyer Matching:</strong> Connects clients with verified lawyers based on specialization and location
            </li>
            <li>
              <strong>Communication Platform:</strong> Secure messaging and document sharing between clients and lawyers
            </li>
            <li>
              <strong>Premium Features:</strong> Subscription-based access to advanced platform capabilities
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>3. User Responsibilities</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Maintain professional and respectful communication</li>
            <li>Verify AI-generated information with legal professionals</li>
            <li>Keep account credentials secure</li>
            <li>Report unauthorized access or suspicious activities</li>
            <li>Provide accurate information in legal queries</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>4. Payment Terms</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Transparent fee structure for all services</li>
            <li>Secure payment processing through Stripe</li>
            <li>Automatic renewal for subscriptions</li>
            <li>Refund policies as per platform guidelines</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>5. Content & Intellectual Property</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Users retain rights to their uploaded content</li>
            <li>Platform license to display and process content</li>
            <li>AI-generated content usage terms</li>
            <li>Respect for intellectual property rights</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>6. Liability</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Platform provided "as is" without warranties</li>
            <li>No liability for AI-generated advice outcomes</li>
            <li>Limitation of liability to fees paid</li>
            <li>User responsibility for professional advice</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>7. Termination</h2>
          <p className='text-gray-600'>
            We reserve the right to suspend or terminate accounts that:
          </p>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Violate these terms</li>
            <li>Engage in fraudulent activities</li>
            <li>Harm the platform or other users</li>
            <li>Misuse platform services</li>
          </ul>
        </section>

        <section className='pt-8 mt-12 border-t'>
          <p className='text-gray-600'>
            Questions about our terms? Contact us at{' '}
            <a href='mailto:legal@lawbud.com' className='text-primary hover:underline'>
              legal@lawbud.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
