'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLawyers } from '@/app/contexts/LawyersContext';
import { HumanChatInterface } from '@/components/HumanChatInterface';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ChatPage() {
  const params = useParams();
  const { lawyers } = useLawyers();
  const { session } = useAuth();
  const [lawyer, setLawyer] = useState(null);
  const [user, setUser] = useState(null);
  const [isLawyer, setIsLawyer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      try {
        if (!session?.user?.id) return;

        // First check if the logged-in user is a lawyer
        const { data: lawyerData, error: lawyerError } = await supabase
          .from('lawyers')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (lawyerError && lawyerError.code !== 'PGRST116') {
          console.error('Error checking lawyer status:', lawyerError);
        }

        // Set isLawyer based on whether we found a lawyer record
        const userIsLawyer = !!lawyerData;
        setIsLawyer(userIsLawyer);

        if (userIsLawyer) {
          // If user is a lawyer, we need to fetch the client's details
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', params.lawyerId)
            .single();

          if (userError) throw userError;
          setUser(userData);
        } else {
          // If user is a client, find the lawyer from context
          const foundLawyer = lawyers.find((l) => l.id === params.lawyerId);
          setLawyer(foundLawyer);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing chat page:', error);
        setIsLoading(false);
      }
    };

    initializePage();
  }, [params.lawyerId, lawyers, session?.user?.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!lawyer && !user) {
    return <div>Chat not found</div>;
  }

  return <HumanChatInterface lawyer={lawyer} user={user} isLawyer={isLawyer} />;
}
