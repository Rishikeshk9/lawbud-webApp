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

export function LawyerSearch({ lawyers = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const commandRef = useRef(null);

  // Filter and sort lawyers based on search query
  const filteredLawyers = (lawyers ?? [])
    .filter((lawyer) => {
      if (searchQuery.length === 0) return false;
      const searchLower = searchQuery?.toLowerCase().trim();

      // Safely check lawyer properties
      const name = lawyer?.name || '';
      const specializations = lawyer?.specializations || [];

      return (
        name.toLowerCase().includes(searchLower) ||
        specializations.some((spec) =>
          spec?.toLowerCase().includes(searchLower)
        )
      );
    })
    .sort((a, b) => (b?.rating || 0) - (a?.rating || 0));

  const handleSelect = (lawyerId) => {
    router.push(`/lawyers/${lawyerId}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setIsOpen(!!value);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commandRef.current && !commandRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative w-full max-w-md' ref={commandRef}>
      <Command className='border rounded-lg shadow'>
        <CommandInput
          placeholder='Search lawyers by name or specialization...'
          value={searchQuery}
          onValueChange={handleSearchChange}
          className='h-9'
        />
        {isOpen && searchQuery && (
          <CommandList className='absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg dark:bg-gray-950'>
            {filteredLawyers.length === 0 ? (
              <CommandEmpty className='p-4 text-sm text-gray-500'>
                No lawyers found.
              </CommandEmpty>
            ) : (
              filteredLawyers.length > 0 &&
              isOpen && (
                <CommandGroup className='max-h-[300px] overflow-y-auto'>
                  <div className='p-2 text-xs text-gray-500 border-b'>
                    Top Results
                  </div>
                  {(filteredLawyers ?? []).map((lawyer) => (
                    <CommandItem
                      key={lawyer.id}
                      onSelect={() => handleSelect(lawyer.id)}
                    >
                      <div className='flex flex-col w-full'>
                        <div className='flex items-center justify-between w-full'>
                          <span className='font-medium'>
                            {lawyer?.name ?? 'Unknown'}
                          </span>
                          <div className='flex items-center'>
                            <StarIcon className='w-4 h-4 mr-1 text-yellow-400' />
                            <span>{lawyer?.rating ?? 0}</span>
                          </div>
                        </div>
                        <span className='text-sm text-gray-500'>
                          {(lawyer?.specializations ?? []).join(', ')}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
