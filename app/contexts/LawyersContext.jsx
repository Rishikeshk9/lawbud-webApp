'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getStates, getDistricts } from '@/lib/location-data';
import { useAuth } from './AuthContext';

const LawyersContext = createContext();

export function LawyersProvider({ children }) {
  const [lawyers, setLawyers] = useState([]);
  const [savedLawyers, setSavedLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();

  const fetchLawyers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: lawyersData, error } = await supabase
        .from('lawyers')
        .select(`
          *,
          user:users!inner(
            id,
            name,
            email,
            phone,
            avatar_url,
            role
          ),
          specializations:lawyer_specializations(
            specializations(name)
          )
        `)
        .eq('verification_status', 'approved') 
        .eq('user.role', 'LAWYER');

      if (error) throw error;

      // Transform the data to include user details and add AI lawyer
      const transformedLawyers = lawyersData.map(lawyer => ({
        ...lawyer,
        name: lawyer.user.name,
        email: lawyer.user.email,
        phone: lawyer.user.phone,
        avatar_url: lawyer.user.avatar_url,
        role: lawyer.user.role,
        state: getStates(lawyer.state_id),
        district: getDistricts(lawyer.state_id, lawyer.district_id),
        yearsOfExperience: lawyer.experience || 0,
        specializations: lawyer.specializations?.map(s => s.specializations.name) || []
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
        yearsOfExperience: 0,
        specializations: ['All Legal Matters']
      };

      setLawyers([aiLawyer, ...transformedLawyers]);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLawyers();
  }, [session?.user?.id, fetchLawyers]);

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
