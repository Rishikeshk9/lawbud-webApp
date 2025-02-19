'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email || isLoading) return;

    try {
      setIsLoading(true);

      // First verify if user exists
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Account not found',
            description: 'Please register first to continue.',
            variant: 'destructive',
          });
          router.push('/register');
          return;
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setShowOtpInput(true);
      toast({
        title: 'OTP Sent',
        description: 'Please check your email for the verification code.',
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || isLoading) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'magiclink',
      });

      if (error) throw error;

      // Get the session data
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('No session created');

      // Store the access token in a cookie
      Cookies.set('access_token', session.access_token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
      });

      toast({
        title: 'Success',
        description: 'Login successful!',
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <Card className='w-full max-w-md p-6 space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>Welcome</h1>
          <p className='text-gray-500'>Login to your account</p>
        </div>

        <form onSubmit={showOtpInput ? handleVerifyOTP : handleSendOTP}>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={showOtpInput || isLoading}
                required
              />
            </div>

            {showOtpInput && (
              <div className='space-y-2'>
                <Label htmlFor='otp'>Verification Code</Label>
                <Input
                  id='otp'
                  type='text'
                  placeholder='Enter verification code'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <Button
              type='submit'
              className='w-full'
              disabled={
                isLoading || (!showOtpInput && !email) || (showOtpInput && !otp)
              }
            >
              {isLoading
                ? 'Processing...'
                : showOtpInput
                ? 'Verify Code'
                : 'Send Code'}
            </Button>
          </div>
        </form>

        <div className='space-y-2 text-center'>
          <p className='text-sm text-gray-500'>
            Don&apos;t have an account?{' '}
            <Link href='/register' className='text-primary hover:underline'>
              Register
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
