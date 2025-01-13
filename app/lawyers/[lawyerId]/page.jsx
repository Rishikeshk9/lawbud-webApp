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

export default function LawyerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { lawyers } = useLawyers();
  const { user, saveLawyer, isLawyerSaved } = useUser();
  const { toast } = useToast();
  const [lawyer, setLawyer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.lawyerId && lawyers.length > 0) {
      const foundLawyer = lawyers.find((l) => l.id === params.lawyerId);
      setLawyer(foundLawyer);
      setIsLoading(false);
    }
  }, [params.lawyerId, lawyers]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!lawyer) {
    return <div>Lawyer not found</div>;
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
    saveLawyer(lawyer.id);
  };

  const handleChat = () => {
    router.push(`/lawyers/${lawyer.id}/chat`);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card className='p-6 mb-6'>
        <div className='flex items-start gap-4'>
          <Avatar className={`h-20 w-20 ${lawyer.isAI ? 'bg-primary' : ''}`}>
            {lawyer.isAI ? (
              <Bot className='h-10 w-10 text-primary-foreground' />
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
                  <Star className='h-5 w-5 text-yellow-400 fill-yellow-400' />
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
                    <MapPin className='h-4 w-4 mr-1' />
                    <span>
                      {lawyer.district}, {lawyer.state}
                    </span>
                  </div>
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <Award className='h-4 w-4 mr-1' />
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
          <Button onClick={handleChat} className='flex-1 gap-2'>
            {lawyer.isAI ? (
              <>
                <Bot className='h-4 w-4' />
                Start AI Consultation
              </>
            ) : (
              <>
                <MessageCircle className='h-4 w-4' />
                Start Chat
              </>
            )}
          </Button>
          {!lawyer.isAI && (
            <Button
              variant='outline'
              onClick={handleSave}
              className='flex-1 gap-2'
            >
              {isLawyerSaved(lawyer.id) ? 'Saved' : 'Save'}
            </Button>
          )}
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
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>{review?.userId[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{review?.user}</p>
                    <p className='text-sm text-gray-500'>{review?.date}</p>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Star className='h-4 w-4 text-yellow-400 fill-yellow-400' />
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
