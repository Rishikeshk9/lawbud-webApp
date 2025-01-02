'use client';

import { useLawyers } from '../contexts/LawyersContext';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { StarIcon } from 'lucide-react';
import { ChatFab } from '@/components/ChatFab';

export default function LawyersPage() {
  const { lawyers, isLoading, error } = useLawyers();
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className='text-center h-screen flex items-center justify-center'>
        Loading lawyers...
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Get unique specializations
  const specializations = [
    ...new Set(lawyers.map((lawyer) => lawyer.specialization)),
  ];

  // Filter lawyers based on selected specialization
  const filteredLawyers = selectedSpecialization
    ? lawyers.filter(
        (lawyer) => lawyer.specialization === selectedSpecialization
      )
    : lawyers;

  return (
    <div className='container mx-auto px-4 py-4'>
      {/* Specialization filters */}
      <div className='mb-4'>
        <div className='flex flex-wrap gap-2'>
          <Badge
            variant={selectedSpecialization === null ? 'default' : 'outline'}
            className='cursor-pointer hover:bg-primary/90'
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
              className='cursor-pointer hover:bg-primary/90'
              onClick={() => setSelectedSpecialization(specialization)}
            >
              {specialization}
            </Badge>
          ))}
        </div>
      </div>

      {/* Lawyers grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
        {filteredLawyers.map((lawyer) => (
          <div
            key={lawyer.id}
            className='border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => router.push(`/lawyers/${lawyer.id}`)}
          >
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>{lawyer.name}</h2>
              <div className='flex items-center mt-2 align-middle'>
                <StarIcon className='w-4 h-4 text-yellow-400 mr-1' />
                <span className='font-semibold'>{lawyer.rating}</span>
                <span className='text-gray-500 ml-1 text-xs'>
                  ({lawyer.reviews.length})
                </span>
              </div>
            </div>
            <p className='text-gray-600'>{lawyer.specialization}</p>
            <p className='text-gray-500'>{lawyer.location}</p>
          </div>
        ))}
      </div>

      <ChatFab />
    </div>
  );
}
