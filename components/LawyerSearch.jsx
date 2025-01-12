'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { StarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LawyerSearch({ lawyers }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const commandRef = useRef(null);

  // Filter and sort lawyers based on search query
  const filteredLawyers = lawyers
    .filter((lawyer) => {
      if (!searchQuery) return false;
      const searchLower = searchQuery.toLowerCase().trim();
      return (
        lawyer.name.toLowerCase().includes(searchLower) ||
        lawyer.specialization.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => b.rating - a.rating);

  const handleSelect = (lawyerId) => {
    router.push(`/lawyers/${lawyerId}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setIsOpen(value.length > 0);
  };

  return (
    <div className='relative w-full max-w-md' ref={commandRef}>
      <Command className='rounded-lg border shadow '>
        <CommandInput
          placeholder='Search lawyers by name or specialization...'
          value={searchQuery}
          onValueChange={handleSearchChange}
          className='h-9'
        />
        {isOpen && searchQuery && (
          <div className='absolute w-full bg-white dark:bg-gray-950 rounded-lg border mt-10 shadow-lg z-50'>
            {filteredLawyers.length === 0 ? (
              <div className='p-4 text-sm text-gray-500'>No lawyers found.</div>
            ) : (
              <div className='max-h-[300px] overflow-y-auto '>
                <p className='text-xs text-gray-500 p-2 border-b'>
                  Top Results
                </p>
                <div>
                  {filteredLawyers.map((lawyer) => (
                    <div
                      key={lawyer.id}
                      onClick={() => handleSelect(lawyer.id)}
                      className='p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                    >
                      <div className='flex items-center justify-between w-full'>
                        <span className='font-medium'>{lawyer.name}</span>
                        <div className='flex items-center'>
                          <StarIcon className='w-4 h-4 text-yellow-400 mr-1' />
                          <span>{lawyer.rating}</span>
                        </div>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {lawyer.specialization}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Command>
    </div>
  );
}
