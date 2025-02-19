'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLawyers } from '@/app/contexts/LawyersContext';
import { HumanChatInterface } from '@/components/HumanChatInterface';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function ChatPage() {
  const params = useParams();
  const { session } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [isAI, setIsAI] = useState(false);

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

        // Fetch receiver based on who is not the current user
        const receiverId =
          chatData.sender_id === session.user.id
            ? chatData.receiver_id
            : chatData.sender_id;

        const { data: receiverData, error: receiverError } = await supabase
          .from('users')
          .select('*')
          .eq('id', receiverId)
          .single();

        if (receiverError && receiverError.code !== 'PGRST116') {
          console.error('Error checking receiver status:', receiverError);
        }
        setReceiver(receiverData);
        console.log(receiverData);

        // Always fetch current user as sender
        const { data: senderData, error: senderError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (senderError && senderError.code !== 'PGRST116') {
          console.error('Error checking sender status:', senderError);
        }
        setSender(senderData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing chat page:', error);
        setIsLoading(false);
      }
    };

    initializePage();
  }, [params.chatId, session?.user?.id]);

  return (
    <HumanChatInterface
      isLoading={isLoading}
      chat={chat}
      sender={sender}
      receiver={receiver}
    />
  );
}
