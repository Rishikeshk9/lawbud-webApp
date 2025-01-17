'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Lock, Circle, Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { Skeleton } from './ui/skeleton';
import { Card } from './ui/card';
import Image from 'next/image';

export function HumanChatInterface({ isLoading, chat, sender, receiver }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [otherParty, setOtherParty] = useState(null);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    let subscription;

    const initialize = async () => {
      try {
        fetchMessages(chat.id);
        console.log(chat.id);
        // Set up real-time subscription after chat is initialized
        if (chat.id) {
          subscription = supabase
            .channel(`chats:${chat?.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chat.id}`,
              },
              (payload) => {
                if (payload.eventType === 'UPDATE') {
                  // Update existing message
                  setMessages((current) =>
                    current.map((msg) =>
                      msg.id === payload.new.id ? payload.new : msg
                    )
                  );
                } else if (payload.eventType === 'INSERT') {
                  // Add new message
                  setMessages((current) => [...current, payload.new]);
                  scrollToBottom();
                }
                console.log(payload.new);
              }
            )
            .subscribe();
        }

        let otherUser;
        if (receiver.role === 'lawyer') {
          const { data } = await supabase
            .from('lawyers')
            .select('*')
            .eq('user_id', receiver.id)
            .single();
          otherUser = data;
        } else {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', receiver.id)
            .single();
          otherUser = data;
        }
        console.log(otherUser);
        setOtherParty(otherUser);
      } catch (error) {
        console.error('Error in initialization:', error);
      }
    };

    if (chat?.id && receiver?.id && session?.user?.id) {
      initialize();
      console.log(otherParty);
      console.log(receiver);
      console.log(sender);
    }

    // Cleanup subscription on unmount or when chatId changes
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [session?.user?.id, chat?.id, receiver?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior

    // Return early if:
    // - Input is empty after trimming whitespace
    // - No chat ID is set (chat not initialized)
    // - Already processing a message send
    if (!input.trim() || !chat?.id || isLoading) return;
    console.log(input);

    const messageContent = input.trim();
    setInput('');

    try {
      // Insert message with is_from_lawyer flag
      const { error: messageError } = await supabase.from('messages').insert([
        {
          chat_id: chat.id,
          sender_id: session.user.id,
          content: messageContent,
          is_from_lawyer: false,
          receiver_id: receiver.id,
        },
      ]);

      if (messageError) throw messageError;

      // Update chat's updated_at timestamp
      const { error: updateError } = await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chat.id);

      if (updateError) throw updateError;

      // Fetch latest messages to ensure consistency
      //await fetchMessages(chat.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      // Restore input if message failed to send
      setInput(messageContent);
    }
  };

  useEffect(() => {
    if (chat?.id && session?.user?.id) {
      // Mark messages as read when chat is opened
      fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chat.id,
          userId: session.user.id, // Current user is the receiver for messages they're reading
        }),
      });
    }
  }, [chat?.id, session?.user?.id, messages?.length]);

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <div
        onClick={() =>
          router.push(
            otherParty.role === 'user'
              ? `/users/${otherParty.id}`
              : `/lawyers/${otherParty.id}`
          )
        }
        className='sticky top-0 z-40 flex items-center w-full h-16 gap-4 p-4 text-white bg-black border-b border-gray-800'
      >
        <Button variant='default' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='w-5 h-5' />
        </Button>
        <div className='relative w-10 h-10 overflow-hidden transition-all duration-100 bg-gray-100 rounded-full cursor-pointer active:scale-95'>
          {receiver?.avatar_url ? (
            <Image
              src={receiver?.avatar_url}
              alt={receiver?.name || 'Profile picture'}
              fill
              className='object-cover'
              sizes='96px'
            />
          ) : (
            <div className='flex items-center justify-center w-10 h-10 text-lg font-medium text-gray-400'>
              {receiver?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 1)}
            </div>
          )}
        </div>
        <div className='flex-1'>
          <h2 className='text-lg font-semibold'>
            {receiver?.name || 'Loading...'}
          </h2>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <ScrollArea
          ref={scrollAreaRef}
          className='flex-1 py-2 px-2 w-full  max-h-[calc(100vh-8rem)]'
        >
          <div className='flex flex-col gap-2 mb-2 text-center'>
            <div className='flex flex-col gap-2 p-2 mx-auto border rounded-md border-black/10 w-max bg-black/[0.01]'>
              <h1 className='flex items-center max-w-xs text-xs text-black/50'>
                <Lock className='w-4 h-4' /> Messages are end-to-end encrypted.
                No one outside of you and your lawyer can read your messages.
              </h1>
            </div>
          </div>
          <div className='max-w-2xl mx-auto space-y-2'>
            {messages?.map((message, index) => (
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
                    className={` rounded-lg w-full px-3 py-2 ${
                      message.sender_id === session.user.id
                        ? 'bg-black/5 text-primary-foreground ml-auto border'
                        : 'bg-black text-white'
                    }`}
                  >
                    {message.content}

                    <p
                      className={`text-xs text-gray-400 flex mt-1 pr-3 whitespace-normal text-nowrap items-center gap-1 ${
                        message.sender_id !== session.user.id
                          ? ' text-right'
                          : 'text-left'
                      }`}
                    >
                      {message.sender_id === session.user.id && (
                        <span className='ml-2'>
                          {message.read ? (
                            <CheckCheck className='w-4 h-4 text-green-500' />
                          ) : (
                            <CheckCheck className='w-4 h-4 text-gray-400' />
                          )}
                        </span>
                      )}{' '}
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
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className='fixed bottom-0 z-40 flex justify-center w-full p-2 bg-black border-t border-gray-800'
      >
        <div className='flex w-full max-w-2xl gap-2 px-2'>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type your message...'
            disabled={isLoading}
            className='flex-1 text-white border border-white/10 placeholder:text-white/50'
          />
          <Button className='aspect-square ' type='submit' disabled={isLoading}>
            <Send className='w-8 h-8' />
          </Button>
        </div>
      </form>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='container px-4 py-8 mx-auto'>
      <div className='max-w-2xl mx-auto space-y-4'>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className='p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <Skeleton className='w-32 h-5 mb-2' />
                <Skeleton className='w-full h-4' />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
