'use client';

import { Navbar } from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // List of paths where Navbar should be hidden
  const noNavbarPaths = [
    '/login',
    '/register',
    '/register/lawyer',
    '/lawyer-registration',
  ];
  const showNavbar = !noNavbarPaths.includes(pathname);

  return (
    <div className='relative min-h-screen flex flex-col'>
      {showNavbar && <Navbar />}
      <main className='flex-1'>{children}</main>
    </div>
  );
}
