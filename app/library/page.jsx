'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

const legalTopics = [
  {
    title: 'Criminal Law',
    description: 'Understanding criminal offenses, procedures, and rights',
    href: '/library/criminal-law',
  },
  {
    title: 'Family Law',
    description: 'Marriage, divorce, custody, and domestic relations',
    href: '/library/family-law',
  },
  {
    title: 'Property Law',
    description: 'Real estate, property rights, and transactions',
    href: '/library/property-law',
  },
  {
    title: 'Constitutional Law',
    description: 'Fundamental rights and constitutional principles',
    href: '/library/constitutional-law',
  },
  {
    title: 'Corporate Law',
    description: 'Business regulations and corporate governance',
    href: '/library/corporate-law',
  },
];

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = legalTopics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='container max-w-2xl p-4 mx-auto'>
      <div className='relative flex items-center px-4 mb-6 border rounded-md'>
        <Search className='w-4 h-4 text-gray-400 ' />
        <Input
          placeholder='Search legal topics...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='border-none placeholder:text-gray-400'
        />
      </div>

      <div className='space-y-4'>
        {filteredTopics.map((topic) => (
          <Card
            key={topic.title}
            className='p-4 transition-all cursor-pointer hover:shadow-md'
          >
            <h3 className='mb-2 text-lg font-semibold'>{topic.title}</h3>
            <p className='text-sm text-gray-500'>{topic.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
