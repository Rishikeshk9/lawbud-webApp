'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLawyers } from '@/app/contexts/LawyersContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AIChatInterface } from '@/components/AIChatInterface';

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

        setIsAI(true);

        const { data: chatData, error: chatError } = await supabase
          .from('ai_chats')
          .select('*')
          .eq('id', params.chatId)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (chatError && chatError.code !== 'PGRST116') {
          console.error('Error checking chat status:', chatError);
        }
        setChat(chatData);

        const { data: receiverData, error: receiverError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'ai')
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
          .eq('auth_id', session.user.id)
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

  if (isLoading) {
    return (
      <div className='container flex items-center justify-center h-screen px-4 py-8 mx-auto'>
        <Button disabled>
          <Loader2 className='animate-spin' />
          connecting...
        </Button>
      </div>
    );
  }

  if (receiver.isAI) {
    return <div>AI chat interface</div>; // TODO: add AI chat interface
  }
  if (!chat) {
    return <div>Chat not found</div>;
  }

  return <AIChatInterface chat={chat} sender={sender} receiver={receiver} />;
}
