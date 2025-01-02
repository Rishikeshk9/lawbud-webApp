'use client';

import { useState } from 'react';
import { RoleSelector } from '@/components/role-selector';
import { BasicInfoForm } from '@/components/basic-info-form';
import { LawyerInfoForm } from '@/components/lawyer-info-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function RegisterPage() {
  const [role, setRole] = useState('user');
  const [step, setStep] = useState('basic');
  const [basicInfo, setBasicInfo] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBasicInfoSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBasicInfo(data);
      setStep('otp');
      toast({
        title: 'OTP Sent',
        description: 'A One-Time Password has been sent to your mobile number.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.querySelector(
        `input[name="otp-${index + 1}"]`
      );
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 4) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 4-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (role === 'user') {
        toast({
          title: 'Registration Complete',
          description: 'Your account has been created successfully.',
        });
      } else {
        setStep('lawyer');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Verification failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLawyerInfoSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Lawyer data:', data);
      toast({
        title: 'Profile Created',
        description: 'Your lawyer profile has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('basic');
    } else if (step === 'lawyer') {
      setStep('otp');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg'>
        {step !== 'basic' && (
          <Button variant='ghost' size='sm' className='mb-4' onClick={goBack}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back
          </Button>
        )}

        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Create your account</h1>
          <p className='text-gray-600 mt-2'>
            {step === 'basic'
              ? 'Enter your details to get started'
              : step === 'otp'
              ? 'Enter the verification code'
              : 'Complete your lawyer profile'}
          </p>
        </div>

        {step === 'basic' && (
          <div className='space-y-6'>
            <RoleSelector role={role} setRole={setRole} />
            <BasicInfoForm
              onSubmit={handleBasicInfoSubmit}
              isLoading={isLoading}
            />
            <p className='text-center text-sm text-gray-600'>
              Already have an account?{' '}
              <Link href='/login' className='text-primary hover:underline'>
                Login
              </Link>
            </p>
          </div>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Verification Code</label>
              <div className='flex justify-center gap-2'>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    type='text'
                    name={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className='w-12 h-12 text-center text-lg'
                    maxLength={1}
                  />
                ))}
              </div>
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>
        )}

        {step === 'lawyer' && (
          <LawyerInfoForm
            onSubmit={handleLawyerInfoSubmit}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
