'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import BasicInfoForm from '@/components/basic-info-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    let hasErrors = false;
    let newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.location) newErrors.location = 'Location is required';

    hasErrors = Object.keys(newErrors).length > 0;
    setErrors(newErrors);

    if (hasErrors) return;

    try {
      setIsLoading(true);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-8), // Generate a random password
        options: {
          data: {
            name: formData.name,
            role: 'user',
          },
        },
      });

      if (authError) throw authError;

      // Create user profile in the database
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          role: 'user',
        },
      ]);

      if (profileError) throw profileError;

      toast({
        title: 'Registration Successful',
        description: 'Please check your email to verify your account.',
      });

      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <Card className='w-full max-w-md p-6 space-y-6'>
        <div className='text-center space-y-2'>
          <h1 className='text-2xl font-bold'>Create an Account</h1>
          <p className='text-gray-500'>Join our legal community</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <BasicInfoForm
            formData={formData}
            setFormData={setFormData}
            role='user'
            errors={errors}
            setErrors={setErrors}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Create Account'}
          </Button>
        </form>

        <div className='text-center space-y-2'>
          <p className='text-sm text-gray-500'>
            Already have an account?{' '}
            <Link href='/login' className='text-primary hover:underline'>
              Login
            </Link>
          </p>
          <p className='text-sm text-gray-500'>
            Are you a lawyer?{' '}
            <Link
              href='/lawyer-registration'
              className='text-primary hover:underline'
            >
              Register as a Lawyer
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
