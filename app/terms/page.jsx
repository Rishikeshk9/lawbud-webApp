import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-3xl'>
      <Button asChild variant='ghost' size='sm' className='mb-6'>
        <Link href='/profile/settings'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Settings
        </Link>
      </Button>

      <h1 className='text-3xl font-bold mb-6'>Terms & Conditions</h1>

      <div className='prose max-w-none'>
        <p className='text-gray-600 mb-4'>Last updated: March 2024</p>

        <section className='mb-8'>
          <h2 className='text-xl font-semibold mb-4'>1. Acceptance of Terms</h2>
          <p className='mb-4'>
            By accessing and using LawBud, you accept and agree to be bound by
            the terms and provision of this agreement.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-xl font-semibold mb-4'>
            2. User Responsibilities
          </h2>
          <p className='mb-4'>
            Users are responsible for maintaining the confidentiality of their
            account information and for all activities that occur under their
            account.
          </p>
        </section>

        {/* Add more sections as needed */}
      </div>
    </div>
  );
}
