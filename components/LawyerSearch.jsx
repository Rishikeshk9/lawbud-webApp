'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Star, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';

export function LawyerSearch({ lawyers = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const router = useRouter();
  const { session } = useAuth();

  // Filter lawyers based on search query and selected filter
  const filteredLawyers = lawyers
    .filter((lawyer) => {
      // Filter out AI lawyer and current user
      if (
        lawyer.isAI || // Assuming 'ai-lawyer' is the AI's ID
        lawyer.user_id === session?.user?.id || // Filter out current user if they're a lawyer
        !searchQuery
      ) {
        return false;
      }

      const searchLower = searchQuery.toLowerCase().trim();

      const name = lawyer?.name || '';
      const specializations = lawyer?.specializations || [];
      const location = `${lawyer?.district || ''} ${lawyer?.state || ''}`;

      switch (selectedFilter) {
        case 'name':
          return name.toLowerCase().includes(searchLower);
        case 'specialization':
          return specializations.some((spec) =>
            spec?.toLowerCase().includes(searchLower)
          );
        case 'location':
          return location.toLowerCase().includes(searchLower);
        default:
          return (
            name.toLowerCase().includes(searchLower) ||
            specializations.some((spec) =>
              spec?.toLowerCase().includes(searchLower)
            ) ||
            location.toLowerCase().includes(searchLower)
          );
      }
    })
    .sort((a, b) => (b?.rating || 0) - (a?.rating || 0))
    .slice(0, 5); // Limit to top 5 results

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  const handleLawyerClick = (lawyerId) => {
    router.push(`/lawyers/${lawyerId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative w-full search-container'>
      {/* Search Input */}
      <div className='relative'>
        <Input
          type='text'
          placeholder='Search lawyers by name, specialization, or location...'
          value={searchQuery}
          onChange={handleSearchChange}
          className='w-full h-10 pl-10 pr-4 text-black bg-white border border-gray-200 rounded-lg placeholder:text-sm placeholder:text-black/30 focus:border-primary'
        />
        <Search className='absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2' />
      </div>

      {/* Filter Buttons */}
      <div className='hidden gap-2 mt-2 '>
        {['all', 'name', 'specialization', 'location'].map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedFilter(filter)}
            className='text-xs'
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className='absolute z-50 w-full mt-2'>
          <Card className='p-2 bg-white shadow-lg max-h-[400px] overflow-y-auto'>
            {filteredLawyers.length === 0 ? (
              <div className='p-4 text-center text-gray-500'>
                No lawyers found matching your search.
              </div>
            ) : (
              <div className='space-y-2'>
                {filteredLawyers.map((lawyer) => (
                  <div
                    key={lawyer.id}
                    onClick={() => handleLawyerClick(lawyer.id)}
                    className='p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-50'
                  >
                    <div className='flex items-center gap-3'>
                      {/* Lawyer Avatar */}
                      <div className='relative w-12 h-12 overflow-hidden bg-gray-100 rounded-full'>
                        {lawyer.avatar ? (
                          <Image
                            src={lawyer.avatar}
                            alt={lawyer.name}
                            fill
                            className='object-cover'
                          />
                        ) : (
                          <div className='flex items-center justify-center w-full h-full text-lg font-medium text-gray-400'>
                            {lawyer.name?.[0]}
                          </div>
                        )}
                      </div>

                      {/* Lawyer Info */}
                      <div className='flex-1 '>
                        <div className='flex items-center justify-between'>
                          <h3 className='font-medium text-gray-900'>
                            {lawyer.name}
                          </h3>
                          <div className='flex items-center text-yellow-500'>
                            <Star className='w-4 h-4 fill-current' />
                            <span className='ml-1 text-sm'>
                              {lawyer.rating || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <p className='text-sm text-gray-600'>
                          {lawyer.specializations?.join(', ')}
                        </p>
                        <div className='flex items-center mt-1 text-sm text-gray-500'>
                          <MapPin className='w-3 h-3 mr-1' />
                          {lawyer.district}, {lawyer.state}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
