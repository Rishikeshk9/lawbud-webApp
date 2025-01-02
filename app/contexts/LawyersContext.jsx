'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { mockLawyers } from '../data/mockLawyers';

const LawyersContext = createContext();

export function LawyersProvider({ children }) {
  const [lawyers, setLawyers] = useState(mockLawyers);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLawyers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/lawyers');
      if (!response.ok) {
        throw new Error('Failed to fetch lawyers');
      }
      const data = await response.json();
      setLawyers(data);
    } catch (err) {
      setError(err.message);
      setLawyers(mockLawyers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  const value = {
    lawyers,
    isLoading,
    error,
    refreshLawyers: fetchLawyers,
  };

  return (
    <LawyersContext.Provider value={value}>{children}</LawyersContext.Provider>
  );
}

export function useLawyers() {
  const context = useContext(LawyersContext);
  if (context === undefined) {
    throw new Error('useLawyers must be used within a LawyersProvider');
  }
  return context;
}
