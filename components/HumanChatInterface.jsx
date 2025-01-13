'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';

export function HumanChatInterface({ lawyer, user, isLawyer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [otherParty, setOtherParty] = useState(null);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    initializeChat();
    // Set the other party based on who is logged in
    setOtherParty(isLawyer ? user : lawyer);
  }, [lawyer?.id, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      if (!session?.user?.id) {
        router.push('/login');
        return;
      }

      // Check for existing chat - query changes based on who is logged in
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq(isLawyer ? 'lawyer_id' : 'user_id', session.user.id)
        .eq(isLawyer ? 'user_id' : 'lawyer_id', isLawyer ? user.id : lawyer.id)
        .single();

      if (chatError && chatError.code !== 'PGRST116') {
        throw chatError;
      }

      let activeChat;
      if (existingChat) {
        activeChat = existingChat;
      } else {
        // Create new chat with correct user/lawyer assignment
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert([
            {
              user_id: isLawyer ? user.id : session.user.id,
              lawyer_id: isLawyer ? session.user.id : lawyer.id,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        activeChat = newChat;
      }

      setChatId(activeChat.id);

      // Fetch existing messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChat.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messages || []);

      // Set up real-time subscription
      const subscription = supabase
        .channel(`chat:${activeChat.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${activeChat.id}`,
          },
          (payload) => {
            setMessages((current) => [...current, payload.new]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize chat',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    try {
      setIsLoading(true);

      // Insert message with is_from_lawyer flag
      const { data: message, error } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: session.user.id,
            content: input.trim(),
            is_from_lawyer: isLawyer,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col h-[calc(100vh-4rem)]'>
      {/* Header */}
      <div className='fixed top-0 w-full z-40 flex items-center gap-4 p-4 bg-black text-white border-b border-gray-800'>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <Avatar className='h-8 w-8'>
          <AvatarFallback>{otherParty?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <h2 className='text-lg font-semibold'>{otherParty?.name}</h2>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        ref={scrollAreaRef}
        className='flex-1 py-1 px-4 w-full max-h-[calc(100vh-8rem)] mt-16'
      >
        <div className='space-y-4 max-w-2xl mx-auto'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender_id === session.user.id
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div className='flex flex-col gap-2'>
                <div
                  className={`max-w-[85%] rounded-lg w-full px-3 py-2 ${
                    message.sender_id === session.user.id
                      ? 'bg-primary text-primary-foreground ml-auto border'
                      : 'bg-black text-white'
                  }`}
                >
                  {message.content}
                  <p
                    className={`text-xs text-gray-400 flex mt-1 pr-3 whitespace-normal text-nowrap ${
                      message.sender_id === session.user.id
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className='p-4 bg-black border-t border-gray-800 fixed bottom-0 w-full z-40 flex justify-center'
      >
        <div className='flex w-full max-w-2xl gap-2 px-4'>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type your message...'
            disabled={isLoading}
            className='flex-1 text-white'
          />
          <Button type='submit' disabled={isLoading}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </form>
    </div>
  );
}
