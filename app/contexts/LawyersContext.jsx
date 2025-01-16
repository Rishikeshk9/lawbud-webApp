'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getStates, getDistricts } from '@/lib/location-data';
import { useAuth } from './AuthContext';

const LawyersContext = createContext();

export function LawyersProvider({ children }) {
  const [lawyers, setLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();
  const [savedLawyers, setSavedLawyers] = useState([]);
  useEffect(() => {
    fetchLawyers();
  }, [session?.user?.id]);

  useEffect(() => {
    fetchSavedLawyers();
  }, [lawyers]);

  const fetchSavedLawyers = async () => {
    if (!session?.user?.id) return;
    const { data: savedLawyers, error } = await supabase
      .from('saved_lawyers')
      .select('*')
      .eq('user_id', session?.user?.id);

    if (error) {
      console.error('Error fetching saved lawyers:', error);
      return;
    }

    setSavedLawyers(
      lawyers.filter((lawyer) =>
        savedLawyers.some((saved) => saved.lawyer_id === lawyer.id)
      )
    );
  };

  const fetchLawyers = async () => {
    try {
      setIsLoading(true);

      const { data: lawyersData, error } = await supabase
        .from('lawyers')
        .select(
          `
          *,
          users (
            name,
            email,
            phone
          ),
          lawyer_specializations (
            specializations (
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
        phone: lawyer.users.phone,
        auth_id: lawyer.auth_id,
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
        id: '0',
        name: 'AI Legal Assistant',
        specialization: 'All Legal Matters',
        experience: 'Available 24/7',
        location: 'Online',
        rating: 5.0,
        reviews: [],
        isAI: true,
      };

      setLawyers([aiLawyer, ...formattedLawyers]);
    } catch (err) {
      console.error('Error fetching lawyers:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLawyer = async (lawyerId) => {
    const { data: existingLawyer } = await supabase
      .from('saved_lawyers')
      .select()
      .eq('lawyer_id', lawyerId)
      .eq('user_id', session?.user?.id)
      .limit(1)
      .maybeSingle();

    if (existingLawyer) {
      const { error } = await supabase
        .from('saved_lawyers')
        .delete()
        .eq('lawyer_id', lawyerId)
        .eq('user_id', session?.user?.id);
    } else {
      const { error } = await supabase
        .from('saved_lawyers')
        .insert({ lawyer_id: lawyerId, user_id: session?.user?.id });
    }
  };

  const isLawyerSaved = async (lawyerId) => {
    const { data: savedLawyers, error } = await supabase
      .from('saved_lawyers')
      .select('*')
      .eq('lawyer_id', lawyerId)
      .eq('user_id', session?.user?.id)
      .limit(1);
    console.log(savedLawyers);
    return savedLawyers.length > 0;
  };

  return (
    <LawyersContext.Provider
      value={{
        lawyers,
        isLoading,
        error,
        saveLawyer,
        isLawyerSaved,
        savedLawyers,
        fetchSavedLawyers,
      }}
    >
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
