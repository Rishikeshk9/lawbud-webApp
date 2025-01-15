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

export function HumanChatInterface({ chat, sender, receiver }) {
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
    let subscription;

    const initialize = async () => {
      console.log(chat);
      console.log(sender);
      console.log(receiver);

      try {
        if (!session?.user?.id) {
          router.push('/login');
          return;
        }

        if (!chat.id) {
          router.push('/chats');
          return;
        }

        fetchMessages(chat.id);
        console.log(chat.id);
        // Set up real-time subscription after chat is initialized
        if (chat.id) {
          subscription = supabase
            .channel(`chats:${chat.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chat.id}`,
              },
              (payload) => {
                setMessages((current) => [...current, payload.new]);
                scrollToBottom();
                console.log(payload.new);
              }
            )
            .subscribe();
        }
      } catch (error) {
        console.error('Error in initialization:', error);
      }
    };

    initialize();

    // Cleanup subscription on unmount or when chatId changes
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [chat?.id, sender?.id, receiver?.id]);

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
    console.log(input);
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
      setIsLoading(true);

      // Insert message with is_from_lawyer flag
      const { error: messageError } = await supabase.from('messages').insert([
        {
          chat_id: chat.id,
          sender_id: session.user.id,
          content: messageContent,
          is_from_lawyer: false,
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
      await fetchMessages(chat.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      // Restore input if message failed to send
      setInput(messageContent);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <div
        onClick={() => router.push(`/lawyers/${receiver.id}`)}
        className='h-18 sticky top-0 w-full z-40 flex items-center gap-4 p-4 bg-black text-white border-b border-gray-800'
      >
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <Avatar className='h-8 w-8'>
          <AvatarFallback>{receiver?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <h2 className='text-lg font-semibold'>
            {receiver?.name || 'Loading...'}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        ref={scrollAreaRef}
        className='flex-1 py-1 px-4 w-full  max-h-[calc(100vh-8rem)]'
      >
        <div className='space-y-2 max-w-2xl mx-auto'>
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
                      ? 'bg-primary text-primary-foreground ml-auto border'
                      : 'bg-black text-white'
                  }`}
                >
                  {message.content}
                  <p
                    className={`text-xs text-gray-400 flex mt-1 pr-3 whitespace-normal text-nowrap ${
                      message.sender_id !== session.user.id
                        ? ' text-right'
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
        className='p-2 bg-black border-t border-gray-800 fixed bottom-0 w-full z-40 flex justify-center'
      >
        <div className='flex w-full max-w-2xl gap-2 px-2'>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type your message...'
            disabled={isLoading}
            className='flex-1 text-white border border-white/10 placeholder:text-white/50'
          />
          <Button
            className='aspect-square  '
            type='submit'
            disabled={isLoading}
          >
            <Send className='h-8 w-8' />
          </Button>
        </div>
      </form>
    </div>
  );
}
