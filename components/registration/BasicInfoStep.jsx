'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function BasicInfoStep({ initialData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[1-9]\d{9,11}$/.test(formData.phone))
      newErrors.phone = 'Invalid phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>
            Full Name <span className='text-red-500'>*</span>
          </Label>
          <Input
            id='name'
            placeholder='Enter your full name'
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>
            Email <span className='text-red-500'>*</span>
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='Enter your email'
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          {errors.email && (
            <p className='text-sm text-red-500'>{errors.email}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='phone'>
            Phone Number <span className='text-red-500'>*</span>
          </Label>
          <Input
            id='phone'
            placeholder='Enter your phone number'
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
          {errors.phone && (
            <p className='text-sm text-red-500'>{errors.phone}</p>
          )}
        </div>
      </div>

      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Continue'}
      </Button>
    </form>
  );
}
