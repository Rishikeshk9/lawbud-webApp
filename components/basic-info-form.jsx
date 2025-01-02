'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function BasicInfoForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Full Name</Label>
        <Input
          id='name'
          name='name'
          type='text'
          required
          placeholder='John Doe'
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          name='email'
          type='email'
          required
          placeholder='john@example.com'
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='phone'>Phone Number</Label>
        <Input
          id='phone'
          name='phone'
          type='tel'
          required
          placeholder='Enter your phone number'
          value={formData.phone}
          onChange={handleChange}
          maxLength={10}
        />
      </div>
      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? 'Sending OTP...' : 'Continue'}
      </Button>
    </form>
  );
}
