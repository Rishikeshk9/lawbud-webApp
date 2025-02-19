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
import Image from 'next/image';

export function ProfileButton() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function fetchUserData() {
      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id);
        if (userData?.[0]) {
          setAvatarUrl(userData[0].avatar_url);
          setUser(userData[0]);
        }
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }

    fetchUserData();
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='relative w-10 h-10 overflow-hidden transition-all duration-100 bg-gray-100 rounded-full cursor-pointer active:scale-95'>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={user?.name || 'Profile picture'}
              fill
              className='object-cover'
              sizes='96px'
            />
          ) : (
            <div className='flex items-center justify-center w-10 h-10 text-lg font-medium text-gray-400'>
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuItem asChild>
          <Link href='/profile' className='cursor-pointer'>
            <User className='w-4 h-4 mr-2' />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/profile/settings' className='cursor-pointer'>
            <Settings className='w-4 h-4 mr-2' />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className='text-red-600 cursor-pointer'
          onClick={handleLogout}
        >
          <LogOut className='w-4 h-4 mr-2' />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
