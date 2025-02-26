'use client';

import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { usePathname } from 'next/navigation';
import useNotifications from '../hooks/use-notifications';
import { useEffect } from 'react';

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // List of paths where both Navbar and BottomNav should be hidden
  const noNavPaths = ['/login', '/register', '/lawyer-registration'];

  // List of landing page paths where BottomNav should be hidden on mobile
  const landingPaths = ['/', '/about', '/privacy', '/terms'];

  // Check if current path is in noNavPaths
  const showNavbar = !noNavPaths.includes(pathname);

  // Show BottomNav only if not in noNavPaths AND not in landingPaths
  const showBottomNav =
    !noNavPaths.includes(pathname) && !landingPaths.includes(pathname);

  const { notification } = useNotifications();

  useEffect(() => {
    if (notification) {
      console.log('Foreground notification:', notification);
      new Notification(notification.title, { body: notification.body });
    }
  }, [notification]);

  return (
    <div className='relative flex flex-col min-h-screen'>
      {showNavbar && <Navbar />}
      <main className='flex-1 pb-20 md:pb-0'>{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
