'use client';

import { useLawyers } from '@/app/contexts/LawyersContext';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Award, Bot, MapPin, Star, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatFab } from '@/components/ChatFab';

function LawyersPage() {
  const { lawyers, isLoading, error } = useLawyers();
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const router = useRouter();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Get unique specializations
  const specializations = [
    ...new Set(
      lawyers
        .filter((lawyer) => !lawyer.isAI)
        .flatMap((lawyer) => lawyer.specializations || [])
    ),
  ];

  // Filter lawyers based on selected specialization
  const filteredLawyers = selectedSpecialization
    ? lawyers.filter(
        (lawyer) =>
          lawyer.isAI ||
          lawyer.specializations?.includes(selectedSpecialization)
      )
    : lawyers;

  return (
    <div className='container px-4 py-4 mx-auto'>
      <ChatFab />

      {/* Specialization filters */}
      <div className='mb-4'>
        <div className='flex flex-wrap gap-2'>
          <Badge
            variant={selectedSpecialization === null ? 'default' : 'outline'}
            className='cursor-pointer '
            onClick={() => setSelectedSpecialization(null)}
          >
            All
          </Badge>
          {specializations.map((specialization) => (
            <Badge
              key={specialization}
              variant={
                selectedSpecialization === specialization
                  ? 'default'
                  : 'outline'
              }
              className='cursor-pointer '
              onClick={() => setSelectedSpecialization(specialization)}
            >
              {specialization}
            </Badge>
          ))}
        </div>
      </div>

      {/* Lawyers grid */}
      <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
        {filteredLawyers.map((lawyer) => (
          <Card
            key={lawyer.id}
            className='p-6 transition-shadow cursor-pointer hover:shadow-lg'
            onClick={() =>
              lawyer.isAI
                ? router.push('/lawyers/0')
                : router.push(`/lawyers/${lawyer.id}`)
            }
          >
            <div className='flex items-start gap-4'>
              <Avatar
                className={`h-12 w-12 ${lawyer.isAI ? 'bg-primary' : ''}`}
              >
                <AvatarFallback>
                  {lawyer.isAI ? (
                    <Bot className='w-6 h-6' />
                  ) : (
                    lawyer.name.charAt(0)
                  )}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex items-start justify-between mb-2'>
                  <h3 className='text-lg font-semibold'>{lawyer.name}</h3>
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

                {lawyer.isAI ? (
                  <p className='text-sm text-muted-foreground '>
                    Get instant legal guidance 24/7
                  </p>
                ) : (
                  <>
                    <div className='flex flex-wrap gap-2 mb-2'>
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
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='container px-4 py-8 mx-auto'>
      <Skeleton className='w-48 h-8 mb-6' />
      <div className='flex gap-2 mb-6'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='w-20 h-8' />
        ))}
      </div>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className='p-6'>
            <div className='flex items-start gap-4'>
              <Skeleton className='w-12 h-12 rounded-full' />
              <div className='flex-1'>
                <Skeleton className='w-3/4 h-6 mb-2' />
                <div className='flex gap-2 mb-4'>
                  <Skeleton className='w-16 h-5' />
                  <Skeleton className='w-16 h-5' />
                </div>
                <Skeleton className='w-full h-4 mb-2' />
                <Skeleton className='w-2/3 h-4' />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default LawyersPage;
