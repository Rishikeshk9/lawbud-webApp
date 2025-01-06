'use client';

import { useLawyers } from '../contexts/LawyersContext';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function ChatsPage() {
  // This would eventually come from a chats context/API
  // For now, we'll simulate with mock data
  const mockChats = [
    {
      lawyerId: '1',
      lastMessage: 'Thank you for your help!',
      timestamp: '2024-03-20T10:30:00',
      unread: 2,
    },
  ];

  const { lawyers } = useLawyers();

  // Enhance chat data with lawyer information
  const chatsWithLawyerInfo = mockChats.map((chat) => {
    const lawyer = lawyers.find((l) => l.id === chat.lawyerId);
    return {
      ...chat,
      lawyer,
    };
  });

  return (
    <div className='container mx-auto px-4 py-4'>
      <div className='space-y-4'>
        {chatsWithLawyerInfo.map((chat) => (
          <Link
            key={chat.lawyerId}
            href={`/lawyers/${chat.lawyerId}/chat`}
            className='block'
          >
            <Card className='p-4 hover:shadow-md transition-shadow cursor-pointer'>
              <div className='flex items-center gap-4'>
                <Avatar>
                  <AvatarImage
                    src={chat.lawyer?.imageUrl}
                    alt={chat.lawyer?.name}
                  />
                  <AvatarFallback>
                    {chat.lawyer?.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-grow'>
                  <div className='flex justify-between items-start'>
                    <h3 className='font-semibold'>{chat.lawyer?.name}</h3>
                    <span className='text-sm text-gray-500'>
                      {new Date(chat.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 truncate'>
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className='bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs'>
                    {chat.unread}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
