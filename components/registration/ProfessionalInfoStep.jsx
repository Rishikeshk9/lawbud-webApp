'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SPECIALIZATIONS = [
  'Civil Law',
  'Criminal Law',
  'Corporate Law',
  'Family Law',
  'Constitutional Law',
  'Intellectual Property Law',
  'Labor Law',
  'Tax Law',
  'Conveyancing Law',
  'Environmental Law',
];

const STATES = [
  'Andhra Pradesh',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  // Add more states as needed
];

export default function ProfessionalInfoStep({
  initialData,
  onSubmit,
  onBack,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    experience: initialData.experience || '',
    specialization: initialData.specialization || '',
    city: initialData.city || '',
    state: initialData.state || '',
    languages: initialData.languages || '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.experience) newErrors.experience = 'Experience is required';
    if (!formData.specialization)
      newErrors.specialization = 'Specialization is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.languages) newErrors.languages = 'Languages are required';

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
          <Label htmlFor='experience'>
            Years of Experience <span className='text-red-500'>*</span>
          </Label>
          <Input
            id='experience'
            type='number'
            min='0'
            placeholder='Enter years of experience'
            value={formData.experience}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                experience: e.target.value,
              }))
            }
          />
          {errors.experience && (
            <p className='text-sm text-red-500'>{errors.experience}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='specialization'>
            Specialization <span className='text-red-500'>*</span>
          </Label>
          <Select
            value={formData.specialization}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, specialization: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select your specialization' />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.specialization && (
            <p className='text-sm text-red-500'>{errors.specialization}</p>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='city'>
              City <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='city'
              placeholder='Enter your city'
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
            />
            {errors.city && (
              <p className='text-sm text-red-500'>{errors.city}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='state'>
              State <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.state}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, state: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select your state' />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className='text-sm text-red-500'>{errors.state}</p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='languages'>
            Languages <span className='text-red-500'>*</span>
          </Label>
          <Input
            id='languages'
            placeholder='Enter languages (comma-separated)'
            value={formData.languages}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                languages: e.target.value,
              }))
            }
          />
          {errors.languages && (
            <p className='text-sm text-red-500'>{errors.languages}</p>
          )}
          <p className='text-sm text-gray-500'>
            Example: English, Hindi, Marathi
          </p>
        </div>
      </div>

      <div className='flex gap-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onBack}
          disabled={isLoading}
          className='w-full'
        >
          Back
        </Button>
        <Button type='submit' disabled={isLoading} className='w-full'>
          {isLoading ? 'Registering...' : 'Complete Registration'}
        </Button>
      </div>
    </form>
  );
}
