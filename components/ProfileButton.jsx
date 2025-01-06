'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from './ui/button';

export function ProfileButton() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return null; // or a loading spinner
  }

  if (!session) {
    return (
      <div className='flex gap-2'>
        <Button variant='outline' onClick={() => router.push('/login')}>
          Login
        </Button>
        <Button onClick={() => router.push('/register')}>Register</Button>
      </div>
    );
  }

  const userInitials = session.user.user_metadata?.name
    ? session.user.user_metadata.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : session.user.email[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className='h-8 w-8 cursor-pointer'>
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuItem asChild>
          <Link href='/profile' className='cursor-pointer'>
            <User className='mr-2 h-4 w-4' />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/profile/settings' className='cursor-pointer'>
            <Settings className='mr-2 h-4 w-4' />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className='text-red-600 cursor-pointer'
          onClick={handleLogout}
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
