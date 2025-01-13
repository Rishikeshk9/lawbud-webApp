'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getStates, getDistricts } from '@/lib/location-data';

const LawyersContext = createContext();

export function LawyersProvider({ children }) {
  const [lawyers, setLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setIsLoading(true);

      const { data: lawyersData, error } = await supabase
        .from('lawyers')
        .select(
          `
          *,
          users (
            id,
            name,
            email
          ),
          lawyer_specializations (
            specializations (
              id,
              name
            )
          )
        `
        )
        .eq('verification_status', 'approved');

      if (error) throw error;

      // Format the lawyers data
      const formattedLawyers = lawyersData.map((lawyer) => ({
        id: lawyer.id,
        name: lawyer.users.name,
        email: lawyer.users.email,
        specializations: lawyer.lawyer_specializations.map(
          (spec) => spec.specializations.name
        ),
        experience: lawyer.experience,
        state: getStates(lawyer.state_id),
        district: getDistricts(lawyer.state_id, lawyer.district_id),
        languages: lawyer.languages,
        rating: 4.5, // Default rating until we implement reviews
        reviews: [], // Placeholder until we implement reviews
        isAI: false,
      }));

      // Add AI Lawyer card
      const aiLawyer = {
        id: 'ai-assistant',
        name: 'AI Legal Assistant',
        specialization: 'All Legal Matters',
        experience: 'Available 24/7',
        location: 'Online',
        rating: 5.0,
        reviews: [],
        isAI: true,
      };

      setLawyers([aiLawyer, ...formattedLawyers]);
      console.log(formattedLawyers[0]);
    } catch (err) {
      console.error('Error fetching lawyers:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LawyersContext.Provider value={{ lawyers, isLoading, error }}>
      {children}
    </LawyersContext.Provider>
  );
}

export function useLawyers() {
  const context = useContext(LawyersContext);
  if (!context) {
    throw new Error('useLawyers must be used within a LawyersProvider');
  }
  return context;
}
