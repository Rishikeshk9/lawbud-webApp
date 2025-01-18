'use client';

import { Navbar } from '@/components/Navbar';
import { usePathname } from 'next/navigation';
import useNotifications from '../hooks/use-notifications'; // Adjust path as necessary
import { useEffect } from 'react';

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

  const { token, notification } = useNotifications();

  useEffect(() => {
    if (notification) {
      const { title, body } = notification;

      // Display notification as a browser notification
      new Notification(title, { body });
    }
  }, [notification]);

  return (
    <div className='relative flex flex-col min-h-screen'>
      {showNavbar && <Navbar />}
      <main className='flex-1'>{children}</main>
    </div>
  );
}
