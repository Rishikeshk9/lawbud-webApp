'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
const UserContext = createContext();
import { supabase } from '@/lib/supabase';

export function UserProvider({ children }) {
  const [user, setUser] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('id', params.userId);

      console.log(users[0]);
      setUser(users[0]);
    } catch (err) {

      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
   // fetchUser(params.userId);
  }, [params.userId]);

  // const saveUser = (userId) => {
  //   setUser((prev) => ({
  //     ...prev,
  //     savedUsers: prev.savedUsers.includes(userId)
  //       ? prev.savedUsers.filter((id) => id !== userId) // Remove if already saved
  //       : [...prev.savedUsers, userId], // Add if not saved
  //   }));
  // };

  // const isUserSaved = (userId) => {
  //   return user.savedUsers.includes(userId);
  // };

  const value = {
    user,
    isLoading,
    error,

    fetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
