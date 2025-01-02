'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

// Mock user data - this would come from your API in production
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 234 567 890',
  location: 'New York, USA',
  image: '/placeholder.svg',
  savedLawyers: ['1', '2'], // Array of lawyer IDs that the user has saved
  recentCases: [
    {
      id: 1,
      title: 'Contract Dispute',
      lawyerId: '1',
      date: '2024-03-15',
      status: 'Active',
    },
    {
      id: 2,
      title: 'Property Documentation',
      lawyerId: '2',
      date: '2024-02-28',
      status: 'Completed',
    },
  ],
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      // In production, this would be an API call
      // const response = await fetch('/api/user');
      // const data = await response.json();
      setUser(mockUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLawyer = (lawyerId) => {
    setUser((prev) => ({
      ...prev,
      savedLawyers: prev.savedLawyers.includes(lawyerId)
        ? prev.savedLawyers.filter((id) => id !== lawyerId) // Remove if already saved
        : [...prev.savedLawyers, lawyerId], // Add if not saved
    }));
  };

  const isLawyerSaved = (lawyerId) => {
    return user.savedLawyers.includes(lawyerId);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    isLoading,
    error,
    saveLawyer,
    isLawyerSaved,
    refreshUser: fetchUser,
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
