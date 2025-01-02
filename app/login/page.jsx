'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // In production, make API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowOtpInput(true);
      toast({
        title: 'OTP Sent',
        description: 'A verification code has been sent to your phone',
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

  const handleVerifyOtp = async (e) => {
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
      const success = await login(phoneNumber, enteredOtp);

      if (success) {
        toast({
          title: 'Success',
          description: 'Login successful!',
        });
        router.push('/lawyers');
      } else {
        toast({
          title: 'Invalid OTP',
          description: 'The OTP you entered is incorrect',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Login failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md p-6 space-y-6 bg-white rounded-xl shadow-lg'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Welcome to LawBud</h1>
          <p className='text-gray-600 mt-2'>
            {showOtpInput
              ? 'Enter the verification code'
              : 'Login with your phone number'}
          </p>
        </div>

        {!showOtpInput ? (
          <form onSubmit={handleSendOtp} className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Phone Number</label>
              <Input
                type='tel'
                placeholder='Enter your phone number'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
                className='w-full'
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
            <p className='text-center text-sm text-gray-600'>
              Don't have an account?{' '}
              <Link href='/register' className='text-primary hover:underline'>
                Register
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Verification Code</label>
              <div className='flex justify-center gap-2'>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    type='number'
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
            <Button
              type='button'
              variant='link'
              className='w-full'
              onClick={() => setShowOtpInput(false)}
            >
              Change Phone Number
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
