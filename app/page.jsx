'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Scale, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  const { session } = useAuth();
  const router = useRouter();

  // Redirect to /lawyers if already logged in
  useEffect(() => {
    if (session) {
      router.push('/lawyers');
    }
  }, [session, router]);

  const features = [
    {
      icon: Scale,
      title: 'Expert Legal Advice',
      description:
        'Connect with qualified lawyers specializing in various fields of law.',
    },
    {
      icon: MessageSquare,
      title: 'Instant AI Assistance',
      description:
        'Get immediate responses to your legal queries with our AI-powered assistant.',
    },
    {
      icon: Shield,
      title: 'Secure & Confidential',
      description:
        'Your conversations and information are protected with end-to-end encryption.',
    },
  ];

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <div className='relative px-6 pt-14 lg:px-8'>
        <div className='max-w-2xl py-32 mx-auto sm:py-48 lg:py-56'>
          <div className='text-center'>
            <h1 className='text-6xl font-bold tracking-tight sm:text-8xl'>
              Lawbud
            </h1>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              Connect with expert lawyers or get instant AI assistance for your
              legal queries. Professional legal help is just a click away.
            </p>
            <div className='flex items-center justify-center mt-10 gap-x-6'>
              <Button asChild size='lg'>
                <Link href='/register'>
                  Get Started
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Link>
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link href='/login'>Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='py-24 sm:py-32'>
        <div className='px-6 mx-auto max-w-7xl lg:px-8'>
          <div className='max-w-2xl mx-auto lg:text-center'>
            <h2 className='text-base font-semibold leading-7 text-primary'>
              Why Choose LawBud?
            </h2>
            <p className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>
              Everything you need for legal assistance
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              Access professional legal help and AI-powered assistance in one
              platform.
            </p>
          </div>
          <div className='max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-none'>
            <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3'>
              {features.map((feature) => (
                <div key={feature.title} className='flex flex-col'>
                  <dt className='flex items-center text-base font-semibold leading-7 gap-x-3'>
                    <feature.icon
                      className='flex-none w-5 h-5 text-primary'
                      aria-hidden='true'
                    />
                    {feature.title}
                  </dt>
                  <dd className='flex flex-col flex-auto mt-4 text-base leading-7 text-gray-600'>
                    <p className='flex-auto'>{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='bg-black'>
        <div className='px-6 py-24 sm:px-6 sm:py-32 lg:px-8'>
          <div className='max-w-2xl mx-auto text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
              Get the help you need
              <br />
              Join Lawbud today.
            </h2>
            <p className='max-w-xl mx-auto mt-6 text-lg leading-8 text-gray-300'>
              Get access to expert legal advice and AI assistance. Sign up now
              to connect with qualified lawyers.
            </p>
            <div className='flex items-center justify-center mt-10 gap-x-6'>
              <Button asChild size='lg' variant='default'>
                <Link href='/register'>
                  Get Started
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Link>
              </Button>
              <Button
                variant='outline'
                size='lg'
                asChild
                className='text-white bg-transparent border-white hover:bg-white hover:text-black'
              >
                <Link href='/login'>Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
