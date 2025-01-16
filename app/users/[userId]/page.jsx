'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLawyers } from '@/app/contexts/LawyersContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Mail,
  Phone,
  Star,
  MessageCircle,
  Bot,
  Award,
} from 'lucide-react';
import { useUser } from '@/app/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

function LawyerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading, fetchUser } = useUser();
  const { toast } = useToast();
  const { session } = useAuth();
  const [existingChatId, setExistingChatId] = useState(null);

  const checkExistingChat = async () => {
    if (!session?.user?.id || !user?.auth_id) return;

    try {
      const { data: existingChat, error } = await supabase
        .from('chats')
        .select('*')
        // Find chats where:
        // 1. Current user is sender and lawyer is receiver OR
        // 2. Lawyer is sender and current user is receiver
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${user.auth_id}`)

        .limit(1) // Get only the most recent chat
        .maybeSingle(); // Return single result or null
      console.log(existingChat);
      if (error) {
        console.error('Error checking existing chat:', error);
        return;
      }

      if (existingChat) {
        console.log('Existing chat found:', existingChat);
        setExistingChatId(existingChat.id);
        return existingChat.id;
      }
    } catch (error) {
      console.error('Error in checkExistingChat:', error);
    }
  };
  // useEffect(() => {
  //   checkExistingChat();
  // }, [session?.user?.id, user?.auth_id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const handleSave = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to save lawyers',
        variant: 'destructive',
      });
      return;
    }
    // saveUser(user.id);
  };

  const createNewChat = async () => {
    try {
      // Insert new chat record
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([
          {
            sender_id: session.user.id,
            receiver_id: user.auth_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating new chat:', error);
        return null;
      }

      console.log('New chat created:', newChat);
      return newChat.id;
    } catch (error) {
      console.error('Error in createNewChat:', error);
      return null;
    }
  };

  const handleChat = async () => {
    const chatId = await checkExistingChat();
    console.log(chatId);
    if (chatId) {
      router.push(`/chats/${chatId}`);
    } else {
      const newChatId = await createNewChat();
      router.push(`/chats/${newChatId}`);
    }
  };

  return (
    <div className='container px-4 py-8 mx-auto'>
      <Card className='p-6 mb-6'>
        <div className='flex items-start gap-4'>
          <Avatar className={`h-20 w-20 ${user.isAI ? 'bg-primary' : ''}`}>
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <div className='flex items-start justify-between'>
              <div>
                <h1 className='text-2xl font-bold'>{user.name}</h1>
                <p className='text-sm text-gray-500'>{user.email}</p>
                <p className='text-sm text-gray-500'>{user.phone}</p>
              </div>
              {!user.isAI && user.reviews?.length > 0 && (
                <div className='flex items-center gap-1'>
                  <Star className='w-5 h-5 text-yellow-400 fill-yellow-400' />
                  <span className='font-semibold'>{user.rating}</span>
                  <span className='text-gray-500'>({user.reviews.length})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex gap-4 mt-6'>
          <Button onClick={() => handleChat()} className='flex-1 gap-2'>
            <MessageCircle className='w-4 h-4' />
            Start Chat
          </Button>
        </div>
      </Card>

      {/* Reviews Section - Only show for human lawyers */}
      {user?.reviews?.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Reviews</h2>
          {user?.reviews?.map((review, index) => (
            <Card key={index} className='p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <Avatar className='w-8 h-8'>
                    <AvatarFallback>{review?.user[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{review?.user}</p>
                    <p className='text-sm text-gray-500'>{review?.date}</p>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                  <span>{review.rating}</span>
                </div>
              </div>
              <p className='mt-2 text-gray-600'>{review.comment}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default LawyerDetailsPage;
