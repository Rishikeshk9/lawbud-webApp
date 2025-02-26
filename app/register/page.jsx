'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import BasicInfoForm from '@/components/basic-info-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scale } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});
  let stripeCustomer;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    let hasErrors = false;
    let newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!acceptedTerms) {
      toast({
        title: "Terms & Conditions Required",
        description: "Please accept the Terms & Conditions to continue.",
        variant: "destructive",
      });
      return;
    }

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
            phone: formData.phone,
            email: formData.email,
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
          role: 'USER',
        },
      ]);

      if (profileError) throw profileError;

      // Create Stripe customer with user ID
      stripeCustomer = await stripe.customers.create({
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        metadata: {
          role: 'USER',
          userId: authData.user.id, // Add user ID to metadata
        },
      });

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
      if (stripeCustomer?.id) {
        await stripe.customers.del(stripeCustomer.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <Card className='w-full max-w-md p-6 space-y-6'>
        <div className='space-y-2 text-center'>
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

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={setAcceptedTerms}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accept terms and conditions
              </label>
              <p className="text-sm text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <Button 
            type='submit' 
            className='w-full' 
            disabled={isLoading || !acceptedTerms}
          >
            {isLoading ? 'Processing...' : 'Create Account'}
          </Button>
        </form>

        <div className='space-y-4 text-center'>
          <p className='text-sm text-gray-500'>
            Already have an account?{' '}
            <Link href='/login' className='text-primary hover:underline'>
              Login
            </Link>
          </p>
          
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>Or</span>
            </div>
          </div>

          <div className='inline-block'>
            <Link
              href='/lawyer-registration'
              className='flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors'
            >
              <Scale className='w-4 h-4' />
              Register as a Lawyer
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
