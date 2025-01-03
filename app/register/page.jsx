'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import RoleSelector from '@/components/role-selector';
import BasicInfoForm from '@/components/basic-info-form';
import LawyerInfoForm from '@/components/lawyer-info-form';
import { Stepper, Step } from '@/components/ui/stepper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  const router = useRouter();

  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      let newErrors = {};
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (role === 'lawyer' && !formData.phone)
        newErrors.phone = 'Phone is required for lawyers';
      if (!formData.location) newErrors.location = 'Location is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Please fill in all required fields');
      }

      // If user role, proceed to send OTP
      if (role === 'user') {
        // Here you would make an API call to send OTP
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
        setStep(3);
      } else {
        // If lawyer role, proceed to lawyer info form
        setStep(2);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLawyerInfoSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would make an API call to submit lawyer info
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setStep(3);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit lawyer information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would make an API call to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      router.push('/');
      toast({
        title: 'Success',
        description: 'Registration successful!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid OTP. Please try again.',
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
          <p className='text-gray-500'>Join LawBud today</p>
        </div>

        <Stepper currentStep={step} className='mb-6'>
          <Step>Role</Step>
          {role === 'lawyer' && <Step>Professional Info</Step>}
          <Step>Verification</Step>
        </Stepper>

        {step === 1 && (
          <form onSubmit={handleBasicInfoSubmit} className='space-y-6'>
            <RoleSelector role={role} setRole={setRole} />
            <BasicInfoForm
              formData={formData}
              setFormData={setFormData}
              role={role}
              errors={errors}
              setErrors={setErrors}
            />
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Continue'}
            </Button>
          </form>
        )}

        {step === 2 && role === 'lawyer' && (
          <form onSubmit={handleLawyerInfoSubmit} className='space-y-6'>
            <LawyerInfoForm />
            <div className='flex gap-4'>
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Continue'}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleVerifyOTP} className='space-y-6'>
            <div className='text-center'>
              <p>
                We've sent a verification code to{' '}
                <span className='font-medium'>{formData.email}</span>
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='otp'>Verification Code</Label>
              <Input
                id='otp'
                type='text'
                placeholder='Enter verification code'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
            <Button
              type='button'
              variant='link'
              className='w-full'
              onClick={() => setStep(1)}
            >
              Change Email
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
