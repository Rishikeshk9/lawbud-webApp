'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { mockLawyers } from '@/app/data/mockLawyers';
import { useParams, useRouter } from 'next/navigation';

export default function LawyerChatPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      content: 'Hello! How can I help you today?',
      sender: 'lawyer',
      timestamp: new Date(Date.now() - 100000).toISOString(),
    },
    {
      id: 2,
      content: 'I need legal advice regarding a contract dispute.',
      sender: 'user',
      timestamp: new Date(Date.now() - 80000).toISOString(),
    },
    {
      id: 3,
      content:
        'I understand. Could you provide more details about the dispute?',
      sender: 'lawyer',
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
  ]);

  // Find the lawyer based on the ID from the URL
  const lawyer = mockLawyers.find((l) => l.id === params.lawyerId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: chatMessages.length + 1,
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage('');

    // Simulate lawyer response after 1 second
    setTimeout(() => {
      const lawyerResponse = {
        id: chatMessages.length + 2,
        content: 'Ill look into this and get back to you shortly.',
        sender: 'lawyer',
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, lawyerResponse]);
    }, 1000);
  };

  return (
    <div className='container mx-auto px-4 py-4 max-w-4xl '>
      {/* Chat Header */}
      <Card className='fixed top-0 left-0 w-full bg-white p-4 shadow-none z-10 rounded-none'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mr-1'
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <Avatar>
            <AvatarImage src={lawyer?.imageUrl} alt={lawyer?.name} />
            <AvatarFallback>
              {lawyer?.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className='font-semibold text-lg'>{lawyer?.name}</h2>
            <p className='text-sm text-gray-500'>{lawyer?.specialization}</p>
          </div>
        </div>
      </Card>

      {/* Chat Messages */}
      <Card className='h-max my-20 p-4 border-none shadow-none'>
        <div className='space-y-4 overflow-y-auto'>
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  msg.sender === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-black'
                } rounded-lg p-3 shadow-md`}
                style={{
                  borderRadius:
                    msg.sender === 'user'
                      ? '20px 20px 0 20px'
                      : '20px 20px 20px 0',
                }}
              >
                <p>{msg.content}</p>
                <p className='text-xs mt-1 opacity-70 text-right'>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Message Input */}
      <div className='fixed bottom-0 left-0 w-full bg-white p-4 shadow-md'>
        <form
          onSubmit={handleSendMessage}
          className='flex gap-2 max-w-4xl mx-auto'
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Type your message...'
            className='flex-grow'
          />
          <Button className='  h-10 w-10' type='submit'>
            <Send className='h-5 w-5' />
          </Button>
        </form>
      </div>
    </div>
  );
}
