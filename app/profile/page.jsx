'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Edit2,
  MapPin,
  Mail,
  Phone,
  StarIcon,
  Verified,
  Badge,
  MailWarningIcon,
  PhoneOff,
  Scale,
  Award,
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useLawyers } from '../contexts/LawyersContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Warning } from 'postcss';
import { Badge as BadgeUI } from '@/components/ui/badge';
import LocationDisplay from '@/components/LocationDisplay';

export default function ProfilePage() {
  const { user } = useUser();
  const { lawyers, savedLawyers, fetchSavedLawyers } = useLawyers();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userMetadata, setUserMetadata] = useState(null);
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) return;

        //get user details from user table
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.session.user.email)
          .single();

        console.log(user);
        console.log(session.session.user.user_metadata);
        setProfile(user);
        setUserMetadata(session.session.user.user_metadata);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  useEffect(() => {
    fetchSavedLawyers();
  }, [profile]);

  useEffect(() => {
    console.log(savedLawyers);
  }, [savedLawyers]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div className='container px-4 py-8 mx-auto'>
      <Card className='p-6 mb-6'>
        <div className='flex flex-col items-start gap-6 md:flex-row'>
          <div className='relative'>
            <Avatar className='w-24 h-24'>
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback>
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <Button
              size='icon'
              variant='outline'
              className='absolute bottom-0 right-0 rounded-full'
            >
              <Edit2 className='w-4 h-4' />
            </Button>
          </div>
          <div className='flex-grow'>
            <div className='flex items-center justify-between gap-2 align-middle w-max'>
              <h1 className='text-2xl font-bold '>{profile.name}</h1>{' '}
              {profile.role === 'lawyer' && (
                <p className='flex items-center gap-1 px-1 py-1 text-xs text-white bg-black rounded w-max'>
                  <Scale className='w-4 h-4' /> Lawyer{' '}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <div className='flex items-center text-gray-600'>
                <Mail className='w-4 h-4 mr-2' />
                {profile.email}
                {userMetadata.email_verified ? (
                  <>
                    <Verified className='w-4 h-4 ml-2 mr-1 text-green-500' />
                    <p className='text-xs text-green-500'>Verified</p>
                  </>
                ) : (
                  <>
                    <MailWarningIcon className='w-4 h-4 ml-2 mr-1 text-red-500 ' />
                    <p className='text-xs text-red-500'>Unverified</p>
                  </>
                )}
              </div>
              {profile.phone && (
                <div className='flex items-center text-gray-600'>
                  <Phone className='w-4 h-4 mr-2' />
                  {profile.phone}
                  {userMetadata.phone_verified ? (
                    <>
                      <Verified className='w-4 h-4 ml-2 mr-1 text-green-500' />
                      <p className='text-xs text-green-500'>Verified</p>
                    </>
                  ) : (
                    <>
                      <PhoneOff className='w-4 h-4 ml-2 mr-1 text-red-500' />
                      <p className='text-xs text-red-500'>Unverified</p>
                    </>
                  )}
                </div>
              )}
              {profile.location && (
                <div className='flex items-center text-gray-600'>
                  <MapPin className='w-4 h-4 mr-2' />
                  {profile.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue='saved' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='saved'>Saved Lawyers</TabsTrigger>
        </TabsList>

        <TabsContent value='saved'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {savedLawyers?.length > 0 ? (
              savedLawyers?.map((lawyer) => (
                <Card
                  key={lawyer.id}
                  className='p-6 transition-shadow cursor-pointer hover:shadow-lg'
                  onClick={() =>
                    lawyer.isAI
                      ? router.push('/lawyers/0')
                      : router.push(`/lawyers/${lawyer.id}`)
                  }
                >
                  <div className='flex items-start gap-4'>
                    <Avatar
                      className={`h-12 w-12 ${lawyer.isAI ? 'bg-primary' : ''}`}
                    >
                      <AvatarFallback>
                        {lawyer.isAI ? (
                          <Bot className='w-6 h-6' />
                        ) : (
                          lawyer.name.charAt(0)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex items-start justify-between mb-2'>
                        <h3 className='text-lg font-semibold'>{lawyer.name}</h3>
                        {!lawyer.isAI && lawyer.reviews?.length > 0 && (
                          <div className='flex items-center gap-1'>
                            <Star className='w-5 h-5 text-yellow-400 fill-yellow-400' />
                            <span className='font-semibold'>
                              {lawyer.rating}
                            </span>
                            <span className='text-gray-500'>
                              ({lawyer.reviews.length})
                            </span>
                          </div>
                        )}
                      </div>

                      {lawyer.isAI ? (
                        <p className='text-sm text-muted-foreground '>
                          Get instant legal guidance 24/7
                        </p>
                      ) : (
                        <>
                          <div className='flex flex-wrap gap-2 mb-2'>
                            {lawyer.specializations?.map((spec, index) => (
                              <BadgeUI key={index} variant='secondary'>
                                {spec}
                              </BadgeUI>
                            ))}
                          </div>
                          <div className='space-y-2'>
                            <div className='flex items-center text-sm text-muted-foreground'>
                              <MapPin className='w-4 h-4 mr-1' />
                              <span>
                                {lawyer.district}, {lawyer.state}
                              </span>
                            </div>
                            <div className='flex items-center text-sm text-muted-foreground'>
                              <Award className='w-4 h-4 mr-1' />
                              <span>{lawyer.experience} years experience</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className='text-center text-gray-500'>Coming Soon!</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
