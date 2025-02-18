'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className='bg-gray-50 border-t'>
      <div className='mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8'>
        <div className='flex justify-center space-x-6 md:order-2'>
          <Link
            href='/about'
            className='text-sm leading-6 text-gray-600 hover:text-gray-900'
          >
            About Us
          </Link>
          <Link
            href='/terms'
            className='text-sm leading-6 text-gray-600 hover:text-gray-900'
          >
            Terms of Service
          </Link>
          <Link
            href='/privacy'
            className='text-sm leading-6 text-gray-600 hover:text-gray-900'
          >
            Privacy Policy
          </Link>
        </div>
        <div className='mt-8 md:order-1 md:mt-0'>
          <p className='text-center text-xs leading-5 text-gray-500'>
            &copy; {new Date().getFullYear()} Lawbud. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
