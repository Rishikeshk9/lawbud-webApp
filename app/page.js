'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        router.push('/lawyers');
      } else {
        router.push('/lawyers');
      }
    };

    checkAuth();
  }, [router]);

  return null;
}

export default HomePage;
