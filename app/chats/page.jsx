'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();

      if (!session?.session?.user?.id) {
        router.push('/login');
        return;
      }

      // Fetch chats with lawyer details and latest message
      // This query:
      // 1. Gets all chats for the current user (filtered by user_id)
      // 2. Joins with lawyers table to get lawyer details (using foreign key chats_lawyer_id_fkey)
      // 3. Further joins with users table to get lawyer's user info (name, email etc)
      // 4. Also gets all messages for each chat to find latest message and unread count
      // 5. Orders by updated_at descending to show most recent chats first
      const { data: chats, error } = await supabase
        .from('chats')
        .select(
          `
          *,
          lawyers!chats_lawyer_id_fkey (
            id,
            users (
              id,
              name,
              email
            )
          ),
          messages (
            content,
            created_at,
            sender_id
          )
        `
        )
        .eq('user_id', session.session.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Format chats with latest message
      const formattedChats = chats.map((chat) => {
        const latestMessage = chat.messages.reduce(
          (latest, current) => {
            return latest.created_at > current.created_at ? latest : current;
          },
          { created_at: chat.created_at }
        );

        return {
          id: chat.id,
          lawyerId: chat.lawyer_id,
          lawyerName: chat.lawyers.users.name,
          latestMessage: latestMessage.content || 'No messages yet',
          timestamp: latestMessage.created_at,
          unreadCount: chat.messages.filter(
            (msg) => msg.sender_id !== session.session.user.id && !msg.read
          ).length,
        };
      });

      setChats(formattedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch chat history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Your Conversations</h1>
      <div className='space-y-4 max-w-2xl mx-auto'>
        {chats.length === 0 ? (
          <Card className='p-6 text-center text-muted-foreground'>
            No conversations yet
          </Card>
        ) : (
          chats.map((chat) => (
            <Card
              key={chat.id}
              className='p-4 hover:shadow-lg transition-shadow cursor-pointer'
              onClick={() => router.push(`/lawyers/${chat.lawyerId}/chat`)}
            >
              <div className='flex items-center gap-4'>
                <Avatar>
                  <AvatarFallback>{chat.lawyerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <div className='flex justify-between items-start'>
                    <h3 className='font-semibold'>{chat.lawyerName}</h3>
                    <span className='text-sm text-muted-foreground'>
                      {new Date(chat.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground line-clamp-1'>
                    {chat.latestMessage}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className='bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs'>
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <Skeleton className='h-8 w-48 mb-6' />
      <div className='space-y-4 max-w-2xl mx-auto'>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className='p-4'>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='flex-1'>
                <Skeleton className='h-5 w-32 mb-2' />
                <Skeleton className='h-4 w-full' />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
