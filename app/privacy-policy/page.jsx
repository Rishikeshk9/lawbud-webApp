import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-3xl'>
      <Button asChild variant='ghost' size='sm' className='mb-6'>
        <Link href='/profile/settings'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Settings
        </Link>
      </Button>

      <h1 className='text-3xl font-bold mb-6'>Privacy Policy</h1>

      <div className='prose max-w-none'>
        <p className='text-gray-600 mb-4'>Last updated: March 2024</p>

        <section className='mb-8'>
          <h2 className='text-xl font-semibold mb-4'>
            1. Information We Collect
          </h2>
          <p className='mb-4'>
            We collect information that you provide directly to us, including:
          </p>
          <ul className='list-disc pl-6 mb-4'>
            <li>Name and contact information</li>
            <li>Professional credentials (for lawyers)</li>
            <li>Communication history within the platform</li>
            <li>Payment information</li>
          </ul>
        </section>

        {/* Add more sections as needed */}
      </div>
    </div>
  );
}
