'use client';

import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { usePathname } from 'next/navigation';
import useNotifications from '../hooks/use-notifications';
import { useEffect } from 'react';

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // List of paths where both Navbar and BottomNav should be hidden
  const noNavPaths = [
    '/login',
    '/register',
    '/register/lawyer',
    '/lawyer-registration',
  ];

  // List of paths where only BottomNav should be hidden
  const noBottomNavPaths = [
    ...noNavPaths,
    '/chats/', // Hide on chat pages
    '/lawyers/*/chat', // Hide on lawyer chat pages
  ];

  // Show navbar only on home page
  const showNavbar = pathname === '/lawyers';

  // Show bottom nav except on auth pages and chat pages
  const showBottomNav = !noBottomNavPaths.some((path) =>
    pathname.includes(path)
  );

  const { token, notification } = useNotifications();

  useEffect(() => {
    if (notification) {
      console.log('Foreground notification:', notification);
      new Notification(notification.title, { body: notification.body });
    }
  }, [notification]);
  //asdas
  return (
    <div className='relative flex flex-col min-h-screen'>
      {showNavbar && <Navbar />}
      <main className='flex-1 pb-20 md:pb-0'>{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
