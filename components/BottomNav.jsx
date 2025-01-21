'use client';

import { Home, MessageSquare, Search, User, Book } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Home',
    icon: Home,
    href: '/lawyers',
  },
  {
    label: 'Chat',
    icon: MessageSquare,
    href: '/chats',
  },

  {
    label: 'Library',
    icon: Book,
    href: '/library',
  },
  {
    label: 'Profile',
    icon: User,
    href: '/profile',
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 md:hidden'>
      <nav className='flex justify-around'>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center py-2 px-3 text-xs',
                isActive ? 'text-white' : 'text-gray-400'
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
