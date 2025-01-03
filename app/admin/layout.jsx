'use client';

import { Card } from '@/components/ui/card';
import {
  LayoutDashboard,
  Users,
  Scale,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Lawyers',
    href: '/admin/lawyers',
    icon: Scale,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className='flex h-screen bg-gray-100 p-2 gap-2'>
      {/* Mobile Menu Button */}
      <Button
        variant='ghost'
        size='icon'
        className='fixed top-4 left-4 z-50 md:hidden'
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <X className='h-6 w-6' />
        ) : (
          <Menu className='h-6 w-6' />
        )}
      </Button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 md:hidden'
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Card
        className={cn(
          'fixed inset-y-2 left-2 w-64 p-4 flex-col justify-between border-r z-50 transition-transform duration-300 ease-in-out md:translate-x-0 md:relative',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          <div className='mb-8'>
            <h1 className='text-2xl font-bold'>Admin Panel</h1>
          </div>
          <nav className='space-y-2'>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors',
                    pathname === item.href &&
                      'bg-gray-100 text-black font-medium'
                  )}
                >
                  <Icon className='h-5 w-5' />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        <Link
          href='/login'
          className='flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-auto'
        >
          <LogOut className='h-5 w-5' />
          Logout
        </Link>
      </Card>

      {/* Main Content */}
      <main className='flex-1 overflow-y-auto md:ml-0 ml-12'>{children}</main>
    </div>
  );
}
