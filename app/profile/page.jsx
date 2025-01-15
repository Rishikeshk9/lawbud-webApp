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
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useLawyers } from '../contexts/LawyersContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Warning } from 'postcss';
import LocationDisplay from '@/components/LocationDisplay';

export default function ProfilePage() {
  const { user } = useUser();
  const { lawyers } = useLawyers();
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  // Get saved lawyers with full details
  const savedLawyers = profile.saved_lawyers
    ? lawyers.filter((lawyer) => profile.saved_lawyers.includes(lawyer.id))
    : [];

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card className='p-6 mb-6'>
        <div className='flex flex-col md:flex-row items-start gap-6'>
          <div className='relative'>
            <Avatar className='h-24 w-24'>
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
              <Edit2 className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex-grow'>
            <div className='flex items-center gap-2 justify-between w-max align-middle'>
              <h1 className='text-2xl font-bold '>{profile.name}</h1>{' '}
              {profile.role === 'lawyer' && (
                <p className='bg-black text-white py-1 w-max px-1  text-xs rounded flex items-center gap-1'>
                  <Scale className='h-4 w-4' /> Lawyer{' '}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <div className='flex items-center text-gray-600'>
                <Mail className='h-4 w-4 mr-2' />
                {profile.email}
                {userMetadata.email_verified ? (
                  <>
                    <Verified className='h-4 w-4 ml-2 text-green-500 mr-1' />
                    <p className='text-xs text-green-500'>Verified</p>
                  </>
                ) : (
                  <>
                    <MailWarningIcon className='h-4 w-4 ml-2 text-red-500 mr-1  ' />
                    <p className='text-xs text-red-500'>Unverified</p>
                  </>
                )}
              </div>
              {profile.phone && (
                <div className='flex items-center text-gray-600'>
                  <Phone className='h-4 w-4 mr-2' />
                  {profile.phone}
                  {userMetadata.phone_verified ? (
                    <>
                      <Verified className='h-4 w-4 ml-2 text-green-500 mr-1' />
                      <p className='text-xs text-green-500'>Verified</p>
                    </>
                  ) : (
                    <>
                      <PhoneOff className='h-4 w-4 ml-2 text-red-500 mr-1' />
                      <p className='text-xs text-red-500'>Unverified</p>
                    </>
                  )}
                </div>
              )}
              {profile.location && (
                <div className='flex items-center text-gray-600'>
                  <MapPin className='h-4 w-4 mr-2' />
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {savedLawyers.length > 0 ? (
              savedLawyers.map((lawyer) => (
                <div
                  key={lawyer.id}
                  className='border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                  onClick={() => router.push(`/lawyers/${lawyer.id}`)}
                >
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold'>{lawyer.name}</h2>
                    <div className='flex items-center mt-2 align-middle'>
                      <StarIcon className='w-4 h-4 text-yellow-400 mr-1' />
                      <span className='font-semibold'>{lawyer.rating}</span>
                      <span className='text-gray-500 ml-1 text-xs'>
                        ({lawyer.reviews.length})
                      </span>
                    </div>
                  </div>
                  <p className='text-gray-600'>{lawyer.specialization}</p>
                  <p className='text-gray-500'>{lawyer.location}</p>
                </div>
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
