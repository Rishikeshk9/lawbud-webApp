'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  BadgeCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { checkLawyerChatInitiation } from '@/lib/subscription';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Add this CSS at the top of your file or in your globals.css
const aiCardStyles = {
  background: 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
  backdropFilter: 'blur(10px)',
};

const LawyerCard = memo(function LawyerCard({ lawyer, enableButtons }) {
  const router = useRouter();
  const { lawyers, saveLawyer, isLawyerSaved } = useLawyers();
  const [isSaved, setIsSaved] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const [showAllSpecializations, setShowAllSpecializations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canChat, setCanChat] = useState(true);

  // Define checkExistingChat before using it in useEffect
  const checkExistingChat = useCallback(async () => {
    if (lawyer?.isAI) {
      const { data: existingChat, error } = await supabase
        .from('ai_chats')
        .select('*')
        .eq(`user_id`, session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) {
        console.error('Error checking existing chat:', error);
        return;
      }

      if (existingChat.length > 0) {
        return existingChat[0].id;
      }
    }

    if (!session?.user?.id || !lawyer?.user_id) return;

    try {
      const { data: existingChat, error } = await supabase
        .from('chats')
        .select('*')
        .or(
          `and(sender_id.eq.${session.user.id},receiver_id.eq.${lawyer.user_id}),and(sender_id.eq.${lawyer.user_id},receiver_id.eq.${session.user.id})`
        )
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('Error checking existing chat:', error);
        return;
      }

      if (existingChat) {
        return existingChat.id;
      }
    } catch (error) {
      console.error('Error in checkExistingChat:', error);
    }
  }, [lawyer?.isAI, lawyer?.user_id, session?.user?.id]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (enableButtons && lawyer && !lawyer.isAI) {
        const saved = await isLawyerSaved(lawyer.id);
        setIsSaved(saved);
      }
    };
    checkSavedStatus();
  }, [lawyer?.id, enableButtons, isLawyerSaved]);

  useEffect(() => {
    if (enableButtons) {
      checkExistingChat();
    }
  }, [enableButtons, checkExistingChat]);

  useEffect(() => {
    const checkChatAccess = async () => {
      if (!lawyer.isAI && session?.user?.id) {
        const { allowed } = await checkLawyerChatInitiation(
          session.user.id,
          lawyer.user_id
        );
        setCanChat(allowed);
      }
    };
    checkChatAccess();
  }, [lawyer.isAI, lawyer.user_id, session?.user?.id]);

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
  const createNewChat = async () => {
    try {
      // Insert new chat record
      console.log('Creating new chat');
      console.log(session.user.id, lawyer.user_id);
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([
          {
            sender_id: session.user.id,
            receiver_id: lawyer.user_id,
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
      console.error('Error in handleChat:', error);
      toast({
        title: 'Error',
        description: 'Failed to start chat',
        variant: 'destructive',
      });
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
  const handleChat = async () => {
    try {
      // Only check subscription for non-AI lawyers
      if (!lawyer.isAI) {
        const { allowed, remaining, existing } =
          await checkLawyerChatInitiation(session.user.id, lawyer.user_id);

        if (!allowed && !existing) {
          toast({
            title: 'Subscription Limit Reached',
            description:
              'You have reached your limit for lawyer conversations. Please upgrade your plan to chat with more lawyers.',
            variant: 'destructive',
          });
          router.push('/profile/billing');
          return;
        }

        // Show warning if approaching limit
        if (!existing && remaining <= 1) {
          toast({
            title: 'Almost at Limit',
            description: `You can only start chat with ${remaining} more lawyer${
              remaining === 1 ? '' : 's'
            } on your current plan.`,
            variant: 'warning',
          });
        }
      }

      // Continue with existing chat logic
      const chatId = await checkExistingChat();

      if (lawyer.isAI && chatId) {
        console.log('AI chat already exists');
        router.push(`/chats/ai/${chatId}`);
      } else if (lawyer.isAI) {
        console.log('Creating new AI chat');
        const newChatId = await createNewAIChat();
        router.push(`/chats/ai/${newChatId}`);
      } else if (chatId) {
        console.log('Chat already exists');
        router.push(`/chats/${chatId}`);
      } else {
        const newChatId = await createNewChat();
        router.push(`/chats/${newChatId}`);
      }
    } catch (error) {
      console.error('Error in handleChat:', error);
      toast({
        title: 'Error',
        description: 'Failed to start chat',
        variant: 'destructive',
      });
    }
  };

  // Function to handle specializations display
  const renderSpecializations = useCallback(() => {
    if (!lawyer.specializations?.length) return null;

    const MAX_VISIBLE = 2; // Maximum badges to show in one line

    if (
      showAllSpecializations ||
      lawyer.specializations.length <= MAX_VISIBLE
    ) {
      return lawyer.specializations.map((spec, index) => (
        <Badge key={index} variant='secondary' className='card-content'>
          {spec}
        </Badge>
      ));
    }

    return (
      <>
        {lawyer.specializations.slice(0, MAX_VISIBLE).map((spec, index) => (
          <Badge key={index} variant='secondary' className='card-content'>
            {spec}
          </Badge>
        ))}
        <Badge
          variant='secondary'
          className='cursor-pointer card-content hover:bg-secondary/80'
          onClick={(e) => {
            e.stopPropagation();
            setShowAllSpecializations(true);
          }}
        >
          +{lawyer.specializations.length - MAX_VISIBLE} more
        </Badge>
      </>
    );
  }, [lawyer.specializations, showAllSpecializations]);

  return (
    <Card
      key={lawyer.id}
      className={cn('transition-all border-2 border-transparent  relative', {
        'max-w-md p-6 hover:border-2  hover:shadow-md': !lawyer.isAI,
        'w-full  max-h-max p-1 ai-card before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-pink-500 before:rounded-xl before:content-[""] before:animate-gradient-rotate overflow-hidden': lawyer.isAI,
      })}
      style={lawyer.isAI ? aiCardStyles : {}}
    >
      {lawyer.isAI && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-pink-100/20 animate-gradient blur-lg" />
      )}
      <div className={cn(
        'flex items-start gap-3 card-content relative',
        { 'bg-black/5   p-2 backdrop-blur-md text-white': lawyer.isAI }
      )}>
        <div className={cn('relative card-content', {
          'w-12 h-12': !lawyer.isAI,
          'w-10 h-10': lawyer.isAI
        })}>
          <div className='relative w-full h-full overflow-hidden bg-gray-100 rounded-full'>
            {lawyer.isAI ? (
              <div className='flex items-center justify-center w-full h-full text-lg font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'>
                <Bot className='w-5 h-5 text-white' />
              </div>
            ) : lawyer.avatar_url ? (
              <div className="relative w-full h-full">
                <Image
                  src={lawyer.avatar_url}
                  alt={lawyer.name || 'Lawyer picture'}
                  fill
                  className='object-cover rounded-full card-content'
                  sizes='96px'
                />
              </div>
            ) : (
              <div className='flex items-center justify-center w-full h-full text-lg font-medium text-gray-400 card-content'>
                {lawyer.name?.split(' ').map((n) => n[0]).join('').slice(0, 1)} 
              </div>
            )}
          </div>
          {!lawyer.isAI && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute bottom-0 -right-1 bg-transparent rounded-full">
                    <BadgeCheck className="h-5 w-5 text-white fill-blue-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verified Lawyer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className='flex-1 min-w-0 card-content'>
          <div className='flex items-center justify-between mb-2 card-content'>
            <h3 className={cn('text-lg font-semibold truncate card-content', {
              '  text-white': lawyer.isAI
            })}>
              {lawyer.isAI && `${lawyer.name} ✨`}
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
            <p className='text-sm text-muted-foreground card-content mb-3'>
              Get instant legal guidance powered by AI, available 24/7
            </p>
          ) : (
            <>
              <div className='flex flex-wrap gap-2 mb-2 card-content'>
                {renderSpecializations()}
                {showAllSpecializations && (
                  <Badge
                    variant='secondary'
                    className='cursor-pointer card-content hover:bg-secondary/80'
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllSpecializations(false);
                    }}
                  >
                    Show less
                  </Badge>
                )}
              </div>
              <div className='space-y-1.5 card-content'>
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
            <div className='flex gap-2 mt-3'>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canChat && !lawyer.isAI) {
                    router.push('/profile/billing');
                  } else {
                    handleChat();
                  }
                }}
                disabled={isLoading}
                className={cn('gap-2 w-full justify-center', {
                  'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white': lawyer.isAI
                })}
              >
                {isLoading ? (
                  'Starting Chat...'
                ) : !canChat && !lawyer.isAI ? (
                  'Upgrade to Chat'
                ) : lawyer.isAI ? (
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
});

export default LawyerCard;
