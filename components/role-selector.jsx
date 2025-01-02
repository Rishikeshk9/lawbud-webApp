'use client';

import { Button } from '@/components/ui/button';
import { User, Scale } from 'lucide-react';

export function RoleSelector({ role, setRole }) {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <Button
        type='button'
        variant={role === 'user' ? 'default' : 'outline'}
        className='h-24 flex flex-col items-center justify-center space-y-2'
        onClick={() => setRole('user')}
      >
        <User className='h-6 w-6' />
        <span>User</span>
      </Button>
      <Button
        type='button'
        variant={role === 'lawyer' ? 'default' : 'outline'}
        className='h-24 flex flex-col items-center justify-center space-y-2'
        onClick={() => setRole('lawyer')}
      >
        <Scale className='h-6 w-6' />
        <span>Lawyer</span>
      </Button>
    </div>
  );
}
