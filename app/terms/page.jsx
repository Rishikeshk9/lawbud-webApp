import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className='container max-w-3xl px-4 py-12 mx-auto'>
      <h1 className='mb-8 text-4xl font-bold'>Terms of Service</h1>

      <div className='prose max-w-none'>
        <p className='mb-6 text-gray-600'>Last updated: February 2025</p>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>1. Accepting Terms</h2>
          <p className='mb-4 text-gray-600'>By using Lawbud, you agree to:</p>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Provide accurate information (e.g., no fake legal queries)</li>
            <li>Not misuse AI answers as formal legal advice</li>
            <li>Maintain the confidentiality of your account</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>2. Services</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>AI Chat:</strong> Trained on Bhartiya Nyay Sanhita but{' '}
              <em>not a substitute for lawyer advice</em>
            </li>
            <li>
              <strong>Lawyer Matches:</strong> We verify licenses but don't
              endorse individual lawyers
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>
            3. User Responsibilities
          </h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Don't harass lawyers or post illegal content</li>
            <li>
              AI responses may have errors—double-check with professionals
            </li>
            <li>Keep your account credentials secure</li>
            <li>Report any unauthorized account access</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>4. Liability</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>We're not liable for outcomes from AI/lawyer advice</li>
            <li>Maximum liability: Fees paid in the last 6 months</li>
            <li>Service provided "as is" without warranties of any kind</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>5. Termination</h2>
          <p className='text-gray-600'>
            We reserve the right to suspend or terminate accounts that violate
            these terms, engage in fraudulent activities, or harm our platform
            or other users.
          </p>
        </section>

        <section className='pt-8 mt-12 border-t'>
          <p className='text-gray-600'>
            Questions about our terms? Contact us at{' '}
            <a
              href='mailto:legal@Lawbud.com'
              className='text-primary hover:underline'
            >
              legal@Lawbud.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
