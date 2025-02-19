'use client';

import { Home, MessageSquare, Search, User, Book } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  // {
  //   label: 'Search',
  //   href: '/lawyers',
  //   icon: Search,
  // },
  {
    label: 'Chats',
    href: '/chats',
    icon: MessageSquare,
  },
  {
    label: 'Library',
    href: '/library',
    icon: Book,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on chat pages
  if (pathname.startsWith('/chats/')) {
    return null;
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t '>
      <nav className='flex justify-around p-2'>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 text-xs font-medium text-gray-500 hover:text-primary',
                pathname === item.href && 'text-primary'
              )}
            >
              <Icon className='w-6 h-6 mb-1' />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
