'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState({});
  const [participants, setParticipants] = useState({}); // Store participant details
  const [unreadCounts, setUnreadCounts] = useState({});
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchChats();

      // Subscribe to new messages
      const subscription = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const newMessage = payload.new;
            // Update unread count if message is for current user and not read
            if (
              newMessage.receiver_id === session.user.id &&
              !newMessage.read
            ) {
              setUnreadCounts((prev) => ({
                ...prev,
                [newMessage.chat_id]: (prev[newMessage.chat_id] || 0) + 1,
              }));
            }
            // Update last message for the relevant chat
            setLastMessages((prev) => ({
              ...prev,
              [newMessage.chat_id]: newMessage.content,
            }));

            // Update chat's updated_at timestamp and resort chats
            setChats((prevChats) => {
              const updatedChats = prevChats.map((chat) =>
                chat.id === newMessage.chat_id
                  ? { ...chat, updated_at: newMessage.created_at }
                  : chat
              );
              return [...updatedChats].sort(
                (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
              );
            });
          }
        )
        .subscribe();

      // Subscribe to message updates (for read status)
      const readSubscription = supabase
        .channel('message_updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const updatedMessage = payload.new;
            if (updatedMessage.read) {
              // Decrement unread count when a message is marked as read
              setUnreadCounts((prev) => ({
                ...prev,
                [updatedMessage.chat_id]: Math.max(
                  (prev[updatedMessage.chat_id] || 0) - 1,
                  0
                ),
              }));
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
        readSubscription.unsubscribe();
      };
    }
  }, [session?.user?.id]);

  const fetchUnreadCount = async (chatId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_id', chatId)
      .eq('receiver_id', session.user.id) // Changed from sender_id to receiver_id
      .eq('read', false);

    if (!error) {
      setUnreadCounts((prev) => ({
        ...prev,
        [chatId]: data.length,
      }));
    }
  };

  const fetchChats = async () => {
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('updated_at', { ascending: false });

    if (chatError) {
      console.error('Error fetching chats:', chatError);
      return;
    }

    const sortedChats = [...chatData].sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );
    setChats(sortedChats);

    // Fetch unread counts for each chat
    sortedChats.forEach((chat) => {
      fetchUnreadCount(chat.id);
      fetchMessage(chat.id);
      fetchParticipantDetails(chat.sender_id, chat.receiver_id);
    });

    setIsLoading(false);
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
        .eq('id', senderId)
        .limit(1)
        .single();

      const { data: receiver, error: receiverError } = await supabase
        .from('users')
        .select('*')
        .eq('id', receiverId)
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
      <div className='max-w-2xl p-1 mx-auto h-max'>
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
            const unreadCount = unreadCounts[chat.id] || 0;

            return (
              lastMessages[chat.id] &&
              lastMessages[chat.id].length > 0 && (
                <Card
                  key={chat.id}
                  className='p-4 transition-shadow border-b rounded cursor-pointer hover:shadow '
                  onClick={() => router.push(`/chats/${chat.id}`)}
                >
                  <div className='flex items-center gap-4'>
                    <div className='relative w-10 h-10 transition-all duration-100 bg-gray-100 rounded-full cursor-pointer active:scale-95'>
                      {otherUser?.avatar_url ? (
                        <Image
                          src={otherUser?.avatar_url}
                          alt={otherUser?.name || 'Profile picture'}
                          fill
                          className='object-cover rounded-full'
                          sizes='96px'
                        />
                      ) : (
                        <div className='flex items-center justify-center w-10 h-10 text-lg font-medium text-gray-400'>
                          {otherUser?.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 1)}
                        </div>
                      )}
                      {unreadCount > 0 && (
                        <div className='absolute w-5 h-5 text-xs text-center text-white bg-red-500 border border-white rounded-full -right-1 -bottom-1 aspect-square'>
                          {unreadCount}
                        </div>
                      )}
                    </div>

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
                      <div
                        className={`text-sm text-black truncate ${
                          unreadCount > 0 ? 'font-semibold' : ''
                        }`}
                      >
                        {lastMessages[chat.id] || (
                          <Skeleton className='w-[100px] h-[10px] rounded' />
                        )}
                      </div>
                    </div>
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
    <div className='container p-4 mx-auto'>
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
