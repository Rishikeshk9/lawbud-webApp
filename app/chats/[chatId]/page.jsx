'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLawyers } from '@/app/contexts/LawyersContext';
import { HumanChatInterface } from '@/components/HumanChatInterface';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const { session } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        if (!session?.user?.id) return;

        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('id', params.chatId)
          .single();

        if (chatError && chatError.code !== 'PGRST116') {
          console.error('Error checking chat status:', chatError);
        }
        setChat(chatData);

        // Always fetch current user as sender
        const { data: senderData, error: senderError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (senderError && senderError.code !== 'PGRST116') {
          console.error('Error checking sender status:', senderError);
        }
        setSender(senderData);

        // Fetch receiver based on who is not the current user
        const receiverId =
          chatData.sender_id === session.user.id
            ? chatData.receiver_id
            : chatData.sender_id;

        const { data: receiverData, error: receiverError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', receiverId)
          .single();

        if (receiverError && receiverError.code !== 'PGRST116') {
          console.error('Error checking receiver status:', receiverError);
        }
        setReceiver(receiverData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing chat page:', error);
        setIsLoading(false);
      }
    };

    initializePage();
  }, [params.chatId, session?.user?.id]);

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8 flex justify-center items-center h-screen'>
        <Button disabled>
          <Loader2 className='animate-spin' />
          connecting...
        </Button>
      </div>
    );
  }

  if (!chat) {
    return <div>Chat not found</div>;
  }

  return <HumanChatInterface chat={chat} sender={sender} receiver={receiver} />;
}
