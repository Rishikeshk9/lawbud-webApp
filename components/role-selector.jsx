'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Scale, User } from 'lucide-react';

export default function RoleSelector({ role, setRole }) {
  const roles = [
    {
      id: 'user',
      title: 'User',
      description: 'I need legal assistance',
      icon: User,
    },
    {
      id: 'lawyer',
      title: 'Lawyer',
      description: 'I want to provide legal services',
      icon: Scale,
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {roles.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.id}
            className={cn(
              'relative p-4 cursor-pointer transition-all hover:shadow-md',
              role === item.id
                ? 'border-2 border-primary shadow-sm'
                : 'border border-gray-200'
            )}
            onClick={() => setRole(item.id)}
          >
            <div className='flex flex-col items-center text-center gap-2'>
              <div
                className={cn(
                  'p-3 rounded-full',
                  role === item.id ? 'bg-primary/10' : 'bg-gray-100'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6',
                    role === item.id ? 'text-primary' : 'text-gray-500'
                  )}
                />
              </div>
              <div>
                <h3 className='font-medium'>{item.title}</h3>
                <p className='text-sm text-gray-500'>{item.description}</p>
              </div>
            </div>
            <input
              type='radio'
              name='role'
              value={item.id}
              checked={role === item.id}
              onChange={() => setRole(item.id)}
              className='sr-only'
            />
          </Card>
        );
      })}
    </div>
  );
}
