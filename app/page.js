'use client';

import { useLawyers } from './contexts/LawyersContext';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Award, Bot, StarIcon } from 'lucide-react';
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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredLawyers.map((lawyer) => (
          <div
            key={lawyer.id}
            className='relative border rounded-lg p-2 px-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => router.push(`/lawyers/${lawyer.id}`)}
          >
            <div className='flex items-center justify-between '>
              <h2 className='text-lg font-semibold'>{lawyer.name}</h2>
              <div className='flex items-center align-middle'>
                <StarIcon className='w-4 h-4 text-yellow-400 mr-1' />
                <span className='font-semibold'>{lawyer.rating}</span>
                <span className='text-gray-500 ml-1 text-xs'>
                  ({lawyer.reviews.length})
                </span>
              </div>
            </div>
            <p className='text-gray-600 text-sm'>{lawyer.specialization}</p>
            <p className='text-gray-500 text-sm'>{lawyer.location}</p>
            <div className='absolute -bottom-0 right-0  flex gap-2'>
              {lawyer.isAI && (
                <div className='   bg-blue-500 text-white text-xs px-2 py-1 rounded-tl-lg rounded-br-lg flex items-center gap-2'>
                  <Bot className='h-4 w-4' /> AI
                </div>
              )}
              {lawyer.rating >= 4.9 && !lawyer.isAI && (
                <div className='   bg-zinc-800 text-white text-xs px-2 py-1 rounded-tl-lg rounded-br-lg flex items-center gap-2'>
                  <Award className='h-4 w-4' /> Awarded
                </div>
              )}{' '}
            </div>
          </div>
        ))}
      </div>

      <ChatFab />
    </div>
  );
}
