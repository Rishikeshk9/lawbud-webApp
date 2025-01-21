'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircle, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';

export function ChatFab({ lawyerId, lawyerName }) {
  // If lawyerId and lawyerName are provided, it's on a lawyer's profile page
  // Otherwise, it's on the main page
  const href = lawyerId ? `/lawyers/${lawyerId}/chat` : '/chats';
  const buttonText = lawyerId ? `Chat with ${lawyerName}` : 'My Chats';
  const { session } = useAuth();

  useEffect(() => {
    const checkExistingChat = async () => {
      try {
        const { data: existingChat, error } = await supabase
          .from('chats')
          .select('*')
          .or(
            `sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`
          )

          .single();

        if (error) {
          console.error('Error checking existing chat:', error);
          return;
        }

        if (existingChat) {
          console.log('Existing chat found:', existingChat);
          // Can store the existing chat ID in state if needed
        }
      } catch (error) {
        console.error('Error in checkExistingChat:', error);
      }
    };

    if (lawyerId && session?.user?.id) {
      checkExistingChat();
    }
  }, [lawyerId, session?.user?.id]);

  const createNewChat = async () => {
    try {
      // Insert new chat record
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([
          {
            sender_id: session.user.id,
            receiver_id: lawyerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating new chat:', error);
        return null;
      }

      console.log('New chat created:', newChat);
      return newChat.id;
    } catch (error) {
      console.error('Error in createNewChat:', error);
      return null;
    }
  };

  return (
    <Button
      asChild
      size='icon'
      className='fixed hidden md:flex bottom-8 right-8 h-14 w-14 rounded-full shadow-lg'
    >
      <Link href='/chats'>
        <MessageSquare className='h-6 w-6' />
      </Link>
    </Button>
  );
}
