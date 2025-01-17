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
      <nav className='sticky top-0 z-50 w-full    backdrop-blur supports-[backdrop-filter]:bg-white/60'>
        <div className='container flex items-center h-16 px-4 bg-black'>
          <div className='flex items-center w-full gap-4'>
            <Button variant='default' size='icon' onClick={() => router.back()}>
              <ArrowLeft className='w-5 h-5' />
            </Button>
            <h1 className='text-lg font-semibold text-white'>My Chats</h1>
          </div>
        </div>
      </nav>
    );
  }

  // Default navbar for other pages
  return (
    <nav className='sticky top-0 z-50 w-full bg-black backdrop-blur '>
      <div className='container flex items-center h-16 px-4'>
        <div className='flex justify-between w-full gap-6 md:gap-4'>
          {/* Brand/Logo - now links to /lawyers */}
          <Link href='/lawyers' className='flex items-center gap-2'>
            <span className='text-xl font-bold text-white'>LawBud</span>
          </Link>

          {/* Desktop: Search + Profile */}
          <div className='hidden md:flex md:flex-1 md:items-center md:justify-end md:gap-4'>
            {/* <LocationDisplay /> */}
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
      <div className='flex flex-row gap-2 px-4 pb-4 border-b md:hidden'>
        <LawyerSearch lawyers={lawyers} />
      </div>
    </nav>
  );
}
