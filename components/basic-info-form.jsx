'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BasicInfoForm({
  formData,
  setFormData,
  role,
  errors,
  setErrors,
}) {
  const validateField = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value) newErrors.name = 'Name is required';
        else delete newErrors.name;
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) newErrors.email = 'Email is required';
        else if (!emailRegex.test(value))
          newErrors.email = 'Invalid email format';
        else delete newErrors.email;
        break;
      case 'phone':
        const phoneRegex = /^\+?[1-9]\d{9,11}$/;
        if (role === 'lawyer' && !value) {
          newErrors.phone = 'Phone number is required for lawyers';
        } else if (value && !phoneRegex.test(value)) {
          newErrors.phone = 'Invalid phone number format';
        } else {
          delete newErrors.phone;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>
          Full Name <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='name'
          name='name'
          placeholder='Enter your full name'
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email'>
          Email <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='email'
          name='email'
          type='email'
          placeholder='Enter your email'
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='phone'>
          Phone Number{' '}
          {role === 'lawyer' && <span className='text-red-500'>*</span>}
        </Label>
        <Input
          id='phone'
          name='phone'
          placeholder='Enter your phone number'
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        {errors.phone && <p className='text-sm text-red-500'>{errors.phone}</p>}
      </div>
    </div>
  );
}
