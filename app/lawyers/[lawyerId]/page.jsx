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
  Heart,
} from 'lucide-react';
import { useUser } from '@/app/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

function LawyerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { lawyers, saveLawyer, isLawyerSaved } = useLawyers();
  const { toast } = useToast();
  const [lawyer, setLawyer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const [existingChatId, setExistingChatId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (params.lawyerId && lawyers.length > 0) {
      const foundLawyer = lawyers.find((l) => l.id === params.lawyerId);
      setLawyer(foundLawyer);
      console.log(foundLawyer);
      setIsLoading(false);
    }
  }, [params.lawyerId, lawyers]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      console.log(lawyer);
      if (lawyer && !lawyer.isAI) {
        const saved = await isLawyerSaved(lawyer.id);
        setIsSaved(saved);
      }
    };
    checkSavedStatus();
  }, [lawyer]);

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
        setExistingChatId(existingChat[0]);
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
  useEffect(() => {
    checkExistingChat();
  }, [session?.user?.id, lawyer?.auth_id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!lawyer) {
    return <div>Lawyer not found</div>;
  }

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

  return (
    <div className='container px-4 py-8 mx-auto'>
      <Card className='p-6 mb-6'>
        <div className='flex items-start gap-4'>
          <Avatar className={`h-20 w-20 ${lawyer.isAI ? 'bg-primary' : ''}`}>
            {lawyer.isAI ? (
              <Bot className='w-10 h-10 text-primary-foreground' />
            ) : (
              <>
                <AvatarImage src={lawyer.image} alt={lawyer.name} />
                <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
              </>
            )}
          </Avatar>
          <div className='flex-1'>
            <div className='flex items-start justify-between'>
              <div>
                <h1 className='text-2xl font-bold'>{lawyer.name}</h1>
                {!lawyer.isAI && (
                  <p className='text-gray-600'>{lawyer.specialization}</p>
                )}
              </div>
              {!lawyer.isAI && lawyer.reviews?.length > 0 && (
                <div className='flex items-center gap-1'>
                  <Star className='w-5 h-5 text-yellow-400 fill-yellow-400' />
                  <span className='font-semibold'>{lawyer.rating}</span>
                  <span className='text-gray-500'>
                    ({lawyer.reviews.length})
                  </span>
                </div>
              )}
            </div>

            {!lawyer.isAI && (
              <>
                <div className='flex flex-wrap gap-2 mb-4'>
                  {lawyer.specializations?.map((spec, index) => (
                    <Badge key={index} variant='secondary'>
                      {spec}
                    </Badge>
                  ))}
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <MapPin className='w-4 h-4 mr-1' />
                    <span>
                      {lawyer.district}, {lawyer.state}
                    </span>
                  </div>
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <Award className='w-4 h-4 mr-1' />
                    <span>{lawyer.experience} years experience</span>
                  </div>
                </div>{' '}
              </>
            )}

            {lawyer.isAI && (
              <div className='mt-4'>
                <p className='text-gray-600'>
                  Get instant legal guidance 24/7 with our AI Legal Assistant.
                  Ask questions, get clarifications, and understand legal
                  concepts better.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='flex gap-4 mt-6'>
          {!lawyer.isAI && (
            <Button
              variant='outline'
              onClick={() => handleSave(lawyer.id)}
              className='gap-2 '
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500' : ''}`} />
              {isSaved ? 'Remove' : 'Save'}
            </Button>
          )}
          <Button onClick={handleChat} className='flex-1 gap-2'>
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
      </Card>

      {/* Reviews Section - Only show for human lawyers */}
      {!lawyer.isAI && lawyer.reviews.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Reviews</h2>
          {lawyer.reviews.map((review, index) => (
            <Card key={index} className='p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <Avatar className='w-8 h-8'>
                    <AvatarFallback>{review?.userId[0]}</AvatarFallback>
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
