'use client';

import { useLawyers } from '../contexts/LawyersContext';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Award, Bot, MapPin, Star, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getDistrictName, getStateName } from '@/lib/location-data';

export default function LawyersPage() {
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
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Legal Assistance</h1>

      {/* Specialization filters */}
      <div className='mb-6'>
        <div className='flex flex-wrap gap-2'>
          <Badge
            variant={selectedSpecialization === null ? 'default' : 'outline'}
            className='cursor-pointer  '
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
              className='cursor-pointer  '
              onClick={() => setSelectedSpecialization(specialization)}
            >
              {specialization}
            </Badge>
          ))}
        </div>
      </div>

      {/* Lawyers grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredLawyers.map((lawyer) => (
          <Card
            key={lawyer.id}
            className='p-6 hover:shadow-lg transition-shadow cursor-pointer'
            onClick={() =>
              lawyer.isAI
                ? router.push('/lawyers/ai-assistant')
                : router.push(`/lawyers/${lawyer.id}`)
            }
          >
            <div className='flex items-start gap-4'>
              <Avatar
                className={`h-12 w-12 ${lawyer.isAI ? 'bg-primary' : ''}`}
              >
                <AvatarFallback>
                  {lawyer.isAI ? (
                    <Bot className='h-6 w-6' />
                  ) : (
                    lawyer.name.charAt(0)
                  )}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-semibold text-lg'>{lawyer.name}</h3>
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 text-yellow-400 mr-1' />
                    <span className='text-sm'>{lawyer.rating}</span>
                  </div>
                </div>

                {lawyer.isAI ? (
                  <p className='text-sm text-muted-foreground mb-4'>
                    Get instant legal guidance 24/7
                  </p>
                ) : (
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
                          {lawyer.state}, {lawyer.district}
                        </span>
                      </div>
                      <div className='flex items-center text-sm text-muted-foreground'>
                        <Award className='h-4 w-4 mr-1' />
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
    <div className='container mx-auto px-4 py-8'>
      <Skeleton className='h-8 w-48 mb-6' />
      <div className='flex gap-2 mb-6'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-8 w-20' />
        ))}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className='p-6'>
            <div className='flex items-start gap-4'>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='flex-1'>
                <Skeleton className='h-6 w-3/4 mb-2' />
                <div className='flex gap-2 mb-4'>
                  <Skeleton className='h-5 w-16' />
                  <Skeleton className='h-5 w-16' />
                </div>
                <Skeleton className='h-4 w-full mb-2' />
                <Skeleton className='h-4 w-2/3' />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
