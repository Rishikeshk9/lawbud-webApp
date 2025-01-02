'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function HumanChatInterface({ lawyer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');

    // Add user message to chat
    const newMessage = {
      content: message,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    toast({
      title: 'Message Sent',
      description: 'The lawyer will respond soon.',
    });
  };

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex items-center gap-4 p-4 bg-black text-white border-b border-gray-800'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => router.back()}
          className='hover:bg-gray-800'
        >
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <Avatar className='h-10 w-10'>
          <AvatarFallback>{lawyer?.name?.charAt(0) || 'L'}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className='text-lg font-semibold'>{lawyer?.name || 'Lawyer'}</h1>
          <p className='text-sm text-gray-400'>
            {lawyer?.specialization || 'Legal Professional'}
          </p>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className='flex-1 p-4 bg-[#111]'>
        <div className='space-y-2'>
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
                      ? 'bg-primary rounded-tr-none'
                      : 'bg-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className='text-[0.9375rem] text-white whitespace-pre-wrap'>
                    {message.content}
                  </p>
                  <p className='text-[0.75rem] text-gray-400 text-right mt-1'>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className='p-4 bg-black border-t border-gray-800'>
        <form
          onSubmit={handleSubmit}
          className='flex gap-2 items-center max-w-3xl mx-auto'
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a message'
            disabled={isLoading}
            className='rounded-full bg-gray-800 border-gray-700 text-white'
          />
          <Button
            type='submit'
            disabled={isLoading || !input.trim()}
            className='rounded-full h-10 w-10 p-0 bg-primary hover:bg-primary/90 flex-shrink-0'
          >
            <Send className='h-5 w-5' />
          </Button>
        </form>
      </div>
    </div>
  );
}