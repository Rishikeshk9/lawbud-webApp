'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function ChatFab({ lawyerId, lawyerName }) {
  // If lawyerId and lawyerName are provided, it's on a lawyer's profile page
  // Otherwise, it's on the main page
  const href = lawyerId ? `/lawyers/${lawyerId}/chat` : '/chats';
  const buttonText = lawyerId ? `Chat with ${lawyerName}` : 'My Chats';

  return (
    <div className='fixed bottom-6 right-6'>
      <Button
        asChild
        size='md'
        className='rounded-full shadow-lg hover:shadow-xl transition-all duration-200'
      >
        <Link href={href} className='flex items-center gap-2'>
          <MessageCircle className='w-5 h-5' />
          <span>{buttonText}</span>
        </Link>
      </Button>
    </div>
  );
}
