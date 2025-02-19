'use client';

import { useLawyers } from '@/app/contexts/LawyersContext';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatFab } from '@/components/ChatFab';
import { useAuth } from '../contexts/AuthContext';
import LawyerCard from '@/components/LawyerCard';

function LawyersPage() {
  const { lawyers, isLoading, error } = useLawyers();
  const { session } = useAuth();
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);

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

  // Filter lawyers based on selected specialization and exclude current logged in lawyer
  const filteredLawyers = selectedSpecialization
    ? lawyers.filter(
        (lawyer) =>
          (lawyer.isAI ||
            lawyer.specializations?.includes(selectedSpecialization)) &&
          lawyer.user_id !== session?.user?.id
      )
    : lawyers.filter((lawyer) => lawyer.user_id !== session?.user?.id);

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
          <LawyerCard lawyer={lawyer} key={lawyer.id} />
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
