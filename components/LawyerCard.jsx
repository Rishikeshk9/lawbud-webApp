import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useLawyers } from '@/app/contexts/LawyersContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from './ui/button';
import {
  MapPin,
  Mail,
  Phone,
  Star,
  MessageCircle,
  Bot,
  Award,
  Heart,
  HeartCrack,
  HeartOff,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

function LawyerCard({ lawyer, enableButtons }) {
  const router = useRouter();
  const { lawyers, saveLawyer, isLawyerSaved } = useLawyers();
  const [isSaved, setIsSaved] = useState(false);
  const { session } = useAuth();

  const { toast } = useToast();

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (enableButtons && lawyer && !lawyer.isAI) {
        const saved = await isLawyerSaved(lawyer.id);
        setIsSaved(saved);
      }
    };
    checkSavedStatus();
    console.log(lawyer);
  }, [lawyer, enableButtons]);

  useEffect(() => {
    if (enableButtons) {
      checkExistingChat();
    }
  }, [session?.user?.id, lawyer?.auth_id, enableButtons]);

  const checkExistingChat = async () => {
    if (lawyer?.isAI) {
      console.log('AI lawyer');
      const { data: existingChat, error } = await supabase
        .from('ai_chats')
        .select('*')
        .eq(`user_id`, session.user.id)
        .order('created_at', { ascending: false }) // Sort by latest chat
        .limit(10);
      if (error) {
        console.error('Error checking existing chat:', error);
        return;
      }

      if (existingChat.length > 0) {
        console.log('Existing chat found:', existingChat);
        return existingChat[0].id;
      }
    }

    if (!session?.user?.id || !lawyer?.auth_id) return;

    try {
      console.log(session.user.id, lawyer.auth_id);
      const { data: existingChat, error } = await supabase
        .from('chats')
        .select('*')
        // Find chats where either:
        // 1. Current user is sender and lawyer is receiver OR
        // 2. Lawyer is sender and current user is receiver
        .or(
          `and(sender_id.eq.${session.user.id},receiver_id.eq.${lawyer.auth_id}),and(sender_id.eq.${lawyer.auth_id},receiver_id.eq.${session.user.id})`
        )
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('Error checking existing chat:', error);
        return;
      }

      if (existingChat) {
        console.log('Existing chat found:', existingChat);
        return existingChat.id;
      }
    } catch (error) {
      console.error('Error in checkExistingChat:', error);
    }
  };

  const handleSave = async (lawyerId) => {
    if (!session?.user?.id) {
      toast({
        title: 'Login Required',
        description: 'Please login to save lawyers',
        variant: 'destructive',
      });
      return;
    }
    await saveLawyer(lawyerId);
    const saved = await isLawyerSaved(lawyerId);
    setIsSaved(saved);
    toast({
      title: saved ? 'Lawyer Saved' : 'Lawyer Removed',
      description: saved
        ? 'Lawyer has been saved to your list'
        : 'Lawyer has been removed from your list',
    });
  };

  const handleChat = async () => {
    const chatId = await checkExistingChat();

    if (lawyer.isAI && chatId) {
      router.push(`/chats/ai/${chatId}`);
    } else if (lawyer.isAI) {
      const newChatId = await createNewAIChat();
      router.push(`/chats/ai/${newChatId}`);
    } else if (chatId) {
      router.push(`/chats/${chatId}`);
    } else {
      const newChatId = await createNewChat();
      router.push(`/chats/${newChatId}`);
    }
  };

  const createNewChat = async () => {
    try {
      // Insert new chat record
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([
          {
            sender_id: session.user.id,
            receiver_id: lawyer.auth_id,
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

  const createNewAIChat = async () => {
    const { data: newChat, error } = await supabase
      .from('ai_chats')
      .insert([{ user_id: session.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating new AI chat:', error);
      return null;
    }
    return newChat.id;
  };

  return (
    <Card
      key={lawyer.id}
      className='max-w-md p-6 transition-shadow cursor-pointer '
      onClick={(e) => {
        // Only navigate if the click was directly on the card
        if (e.target === e.currentTarget || e.target.closest('.card-content')) {
          lawyer.isAI
            ? router.push('/lawyers/0')
            : router.push(`/lawyers/${lawyer.id}`);
        }
      }}
    >
      <div className='flex items-start gap-4 card-content'>
        <div className='relative w-12 h-12 overflow-hidden bg-gray-100 rounded-full card-content'>
          {lawyer.isAI ? (
            <div className='flex items-center justify-center w-full h-full text-lg font-medium text-gray-400 card-content'>
              <Bot className='w-6 h-6' />
            </div>
          ) : lawyer.avatar_url ? (
            <Image
              src={lawyer.avatar_url}
              alt={lawyer.name || 'Lawyer picture'}
              fill
              className='object-cover card-content'
              sizes='96px'
            />
          ) : (
            <div className='flex items-center justify-center w-full h-full text-lg font-medium text-gray-400 card-content'>
              {lawyer.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 1)}
            </div>
          )}
        </div>
        <div className='flex-1 card-content'>
          <div className='flex items-center justify-between mb-2 card-content'>
            <h3 className='text-lg font-semibold card-content '>
              {lawyer.name}
            </h3>
            {!lawyer.isAI && enableButtons && (
              <Button
                variant='ghost'
                onClick={(e) => {
                  e.stopPropagation(); // Stop event bubbling
                  handleSave(lawyer.id);
                }}
                className='gap-2'
              >
                {isSaved ? (
                  <HeartOff className='w-4 h-4 text-black/50' />
                ) : (
                  <Heart className='w-4 h-4 text-red-500' />
                )}
              </Button>
            )}
            {!lawyer.isAI && lawyer.reviews?.length > 0 && (
              <div className='flex items-center gap-1 card-content'>
                <Star className='w-5 h-5 text-yellow-400 fill-yellow-400' />
                <span className='font-semibold card-content'>
                  {lawyer.rating}
                </span>
                <span className='text-gray-500 card-content'>
                  ({lawyer.reviews.length})
                </span>
              </div>
            )}
          </div>

          {lawyer.isAI ? (
            <p className='text-sm text-muted-foreground card-content'>
              Get instant legal guidance 24/7
            </p>
          ) : (
            <>
              <div className='flex flex-wrap gap-2 mb-2 card-content'>
                {lawyer.specializations?.map((spec, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='card-content'
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
              <div className='space-y-2 card-content'>
                <div className='flex items-center text-sm card-content'>
                  <MapPin className='w-4 h-4 mr-1' />
                  <span className='card-content text-black/50'>
                    {lawyer.district}, {lawyer.state}
                  </span>
                </div>
                <div className='flex items-center text-sm card-content'>
                  <Award className='w-4 h-4 mr-1' />
                  <span className='card-content text-black/50'>
                    {lawyer.experience} years experience
                  </span>
                </div>
              </div>
            </>
          )}

          {enableButtons && (
            <div className='flex gap-2 mt-6'>
              <Button
                onClick={(e) => {
                  e.stopPropagation(); // Stop event bubbling
                  handleChat();
                }}
                className='flex-1 gap-2'
              >
                {lawyer.isAI ? (
                  <>
                    <Bot className='w-4 h-4' />
                    Start AI Consultation
                  </>
                ) : (
                  <>
                    <MessageCircle className='w-4 h-4' />
                    Start Chat
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default LawyerCard;
