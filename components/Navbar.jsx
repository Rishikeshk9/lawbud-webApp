'use client';

import { LawyerSearch } from '@/components/LawyerSearch';
import { ProfileButton } from '@/components/ProfileButton';
import { useLawyers } from '@/app/contexts/LawyersContext';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import LocationDisplay from './LocationDisplay';

export function Navbar() {
  const { lawyers } = useLawyers();
  const pathname = usePathname();
  const router = useRouter();

  // Hide navbar in auth pages and individual chat pages
  if (
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    (pathname.includes('/lawyers/') && pathname.includes('/chat')) ||
    pathname.includes('/chats/')
  ) {
    return null;
  }

  // Show back button navbar for /chats page
  if (pathname === '/chats') {
    return (
      <nav className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'>
        <div className='container flex h-16 items-center px-4'>
          <div className='flex w-full items-center gap-4'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='mr-2'
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <h1 className='text-xl font-semibold'>My Chats</h1>
          </div>
        </div>
      </nav>
    );
  }

  // Default navbar for other pages
  return (
    <nav className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'>
      <div className='container flex h-16 items-center px-4'>
        <div className='flex w-full justify-between gap-6 md:gap-4'>
          {/* Brand/Logo - now links to /lawyers */}
          <Link href='/lawyers' className='flex items-center gap-2'>
            <span className='text-xl font-bold'>LawBud</span>
          </Link>

          {/* Desktop: Search + Profile */}
          <div className='hidden md:flex md:flex-1 md:items-center md:justify-end md:gap-4'>
            <LocationDisplay />
            <div className='flex-1 max-w-sm'>
              <LawyerSearch lawyers={lawyers} />
            </div>
            <ProfileButton />
          </div>

          {/* Mobile: Only Profile Button */}
          <div className='flex items-center gap-4 md:hidden'>
            <ProfileButton />
          </div>
        </div>
      </div>

      {/* Mobile: Search Bar (shown below navbar) */}
      <div className='border-b md:hidden px-4 pb-4 flex flex-row gap-2'>
        <LawyerSearch lawyers={lawyers} />
      </div>
    </nav>
  );
}
