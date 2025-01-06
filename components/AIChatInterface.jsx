'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AIChatInterface({ lawyer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const scrollAreaRef = useRef(null);
  const { toast } = useToast();
  const router = useRouter();

  // Save message to database
  const saveMessage = async (content, role) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) throw new Error('No user session');

      // If no chatId exists, create a new chat first
      if (!chatId) {
        const { data: newChat, error: chatError } = await supabase
          .from('ai_chats')
          .insert([{ user_id: session.session.user.id }])
          .select()
          .single();

        if (chatError) throw chatError;
        setChatId(newChat.id);
      }

      // Save the message
      const { error: messageError } = await supabase
        .from('ai_messages')
        .insert([
          {
            chat_id: chatId,
            content,
            role,
            user_id: session.session.user.id,
          },
        ]);

      if (messageError) throw messageError;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return;

      // Get the most recent chat for this user
      const { data: chats, error: chatError } = await supabase
        .from('ai_chats')
        .select('id, ai_messages(id, content, role, created_at)')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (chatError) throw chatError;

      if (chats && chats.length > 0) {
        setChatId(chats[0].id);
        const sortedMessages = chats[0].ai_messages
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map((msg) => ({
            content: msg.content,
            role: msg.role,
            timestamp: msg.created_at,
          }));

        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    }
  };

  // Load chat history when component mounts
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    const newUserMessage = {
      content: userMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // Save user message to database
    await saveMessage(userMessage, 'user');

    try {
      // Send message to AI
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: chatId,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      // Add AI response to chat
      const aiMessage = {
        content: data.message,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save AI response to database
      await saveMessage(data.message, 'assistant');
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col h-screen w-full max-w-3xl mx-auto items-center align-middle bg-black/5'>
      <div className='max-w-3xl mx-auto fixed top-0   w-full z-50 flex items-center gap-4 p-4 bg-black text-white border-b border-gray-800'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => router.back()}
          className='hover:bg-white/10 hover:text-white'
        >
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <Avatar className='h-10 w-10'>
          <AvatarFallback>
            <Bot className='h-6 w-6' />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className='text-lg font-semibold'>
            {lawyer?.name || 'AI Legal Assistant'}
          </h1>
          <p className='text-sm text-gray-400'>
            {lawyer?.specialization || 'Legal AI'}
          </p>
        </div>
      </div>

      <ScrollArea
        ref={scrollAreaRef}
        className='flex-1 p-4  max-h-[calc(100vh-100px)] my-auto  '
      >
        <div className='space-y-2 py-12'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex items-start gap-2 max-w-[65%] ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`rounded-lg p-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-black/5  rounded-tr-none'
                      : 'bg-white  rounded-tl-none'
                  }`}
                >
                  <p className='text-[0.9375rem] text-black whitespace-pre-wrap'>
                    {message.content}
                  </p>
                  <p className='text-[0.75rem] text-gray-400 text-right mt-1'>
                    {new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className='flex justify-start'>
              <div className='flex items-center gap-2 bg-gray-800 rounded-lg p-3 rounded-tl-none shadow-sm'>
                <div className='animate-pulse flex space-x-1'>
                  <div className='h-2 w-2 bg-gray-400 rounded-full' />
                  <div className='h-2 w-2 bg-gray-400 rounded-full' />
                  <div className='h-2 w-2 bg-gray-400 rounded-full' />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className='p-4 bg-black border-t border-gray-800 fixed bottom-0  w-full z-50 flex justify-center max-w-3xl mx-auto'>
        <form
          onSubmit={handleSubmit}
          className='flex gap-2 items-center max-w-3xl mx-auto w-full'
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type your legal question...'
            disabled={isLoading}
            className='rounded bg-white/10 border-black  text-white w-full text-base'
          />
          <Button
            type='submit'
            disabled={isLoading || !input.trim()}
            className='rounded  h-10 w-10 p-0 bg-primary hover:bg-white/10 flex-shrink-0'
          >
            <Send className='h-5 w-5' />
          </Button>
        </form>
      </div>
    </div>
  );
}
