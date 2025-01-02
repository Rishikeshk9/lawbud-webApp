import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarIcon } from 'lucide-react';
import { mockLawyers } from '@/app/data/mockLawyers';
import { ChatFab } from '@/components/ChatFab';

async function getLawyer(lawyerId) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find lawyer by ID
  const lawyer = mockLawyers.find((lawyer) => lawyer.id === lawyerId);

  if (!lawyer) {
    return null;
  }

  return lawyer;
}

export async function generateMetadata({ params }) {
  const lawyer = await getLawyer(params.lawyerId);
  return {
    title: `${lawyer.name} - Lawyer Profile`,
    description: `View the profile of ${lawyer.name}, a ${lawyer.specialization} lawyer with ${lawyer.experience} years of experience.`,
  };
}

export default async function LawyerProfilePage({ params }) {
  const lawyer = await getLawyer(params.lawyerId);

  if (!lawyer) {
    notFound();
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card className='mb-8'>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-6'>
            <div className='flex-shrink-0'>
              <Avatar className='w-32 h-32'>
                <AvatarImage src={lawyer.imageUrl} alt={lawyer.name} />
                <AvatarFallback>
                  {lawyer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className='flex-grow'>
              <h1 className='text-3xl font-bold mb-2'>{lawyer.name}</h1>
              <div className='flex items-center mb-2'>
                <Badge variant='secondary' className='mr-2'>
                  {lawyer.specialization}
                </Badge>
                <span className='text-sm text-neutral-500 dark:text-neutral-400'>
                  {lawyer.experience} years experience
                </span>
              </div>
              <div className='flex items-center mb-4'>
                <StarIcon className='w-5 h-5 text-yellow-400 mr-1' />
                <span className='font-semibold'>{lawyer.rating}</span>
              </div>
              <p className='text-neutral-500 dark:text-neutral-400'>
                {lawyer.bio}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {lawyer.reviews.map((review, i) => (
            <div key={i} className='mb-4 last:mb-0'>
              <p className='font-semibold'>{review.userName}</p>
              <p className='text-neutral-500 dark:text-neutral-400'>
                {review.comment}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
      <ChatFab lawyerId={lawyer.id} lawyerName={lawyer.name} />
    </div>
  );
}
