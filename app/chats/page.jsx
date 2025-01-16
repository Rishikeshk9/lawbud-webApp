'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState({});
  const [participants, setParticipants] = useState({}); // Store participant details
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchChats();
    }
  }, [session?.user?.id]);

  const fetchChats = () => {
    supabase
      .from('chats')
      .select('*')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('updated_at', { ascending: false })
      .then(({ data: chatData, error: chatError }) => {
        if (chatError) {
          console.error('Error fetching chats:', chatError);
          return;
        }
        setChats(chatData);
        chatData.forEach((chat) => {
          fetchMessage(chat.id);
          fetchParticipantDetails(chat.sender_id, chat.receiver_id);
        });
        setIsLoading(false);
      });
  };

  const fetchMessage = (chatId) => {
    supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data: lastMessage, error: messagesError }) => {
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          return;
        }
        if (lastMessage && lastMessage.length > 0) {
          setLastMessages((prev) => ({
            ...prev,
            [chatId]: lastMessage[0].content,
          }));
        }
      });
  };

  const fetchParticipantDetails = async (senderId, receiverId) => {
    try {
      // Check if we already have the participant details
      if (participants[senderId] && participants[receiverId]) {
        return;
      }

      const { data: sender, error: senderError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', senderId)
        .limit(1)
        .single();

      const { data: receiver, error: receiverError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', receiverId)
        .limit(1)
        .single();

      if (senderError) throw senderError;
      if (receiverError) throw receiverError;

      // Update participants state with new user details
      setParticipants((prev) => ({
        ...prev,
        [senderId]: sender,
        [receiverId]: receiver,
      }));
    } catch (error) {
      console.error('Error fetching participant details:', error);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className='container p-0 mx-auto h-max '>
      <div className='max-w-2xl mx-auto h-max '>
        {chats.length === 0 ? (
          <Card className='p-6 text-center text-muted-foreground'>
            No conversations yet
          </Card>
        ) : (
          chats.map((chat) => {
            const otherUserId =
              chat.sender_id === session.user.id
                ? chat.receiver_id
                : chat.sender_id;
            const otherUser = participants[otherUserId];

            return (
              lastMessages[chat.id] &&
              lastMessages[chat.id].length > 0 && (
                <Card
                  key={chat.id}
                  className='p-4 transition-shadow border-b rounded-none cursor-pointer hover:shadow '
                  onClick={() => router.push(`/chats/${chat.id}`)}
                >
                  <div className='flex items-center gap-4'>
                    <Avatar>
                      <AvatarFallback>
                        {otherUser?.name?.[0] || 'LB'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between'>
                        <h3 className='font-semibold text-black truncate'>
                          {otherUser?.name || (
                            <Skeleton className='w-[100px] h-[10px] rounded' />
                          )}
                        </h3>
                        <span className='flex-shrink-0 ml-2 text-sm text-muted-foreground'>
                          {(() => {
                            const date = new Date(chat.updated_at);
                            const now = new Date();
                            const diffInHours = (now - date) / (1000 * 60 * 60);

                            if (diffInHours < 24) {
                              return date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              });
                            } else if (diffInHours < 48) {
                              return 'Yesterday';
                            } else if (diffInHours < 168) {
                              // 7 days
                              return date.toLocaleDateString([], {
                                weekday: 'long',
                              });
                            } else {
                              return date.toLocaleDateString();
                            }
                          })()}
                        </span>
                      </div>
                      <div className='text-sm text-black truncate'>
                        {lastMessages[chat.id] || (
                          <Skeleton className='w-[100px] h-[10px] rounded' />
                        )}
                      </div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className='px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground'>
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </Card>
              )
            );
          })
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='container px-4 py-8 mx-auto'>
      <Skeleton className='w-48 h-8 mb-6' />
      <div className='max-w-2xl mx-auto space-y-4'>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className='p-4'>
            <div className='flex items-center gap-4'>
              <Skeleton className='w-12 h-12 rounded-full' />
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
