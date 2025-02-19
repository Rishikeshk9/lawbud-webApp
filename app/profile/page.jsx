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
  Bot,
  MessageCircle,
  Heart,
  Loader2,
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useLawyers } from '../contexts/LawyersContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Warning } from 'postcss';
import { Badge as BadgeUI } from '@/components/ui/badge';
import LocationDisplay from '@/components/LocationDisplay';
import LawyerCard from '@/components/LawyerCard';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user } = useUser();
  const { lawyers, savedLawyers, fetchSavedLawyers } = useLawyers();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userMetadata, setUserMetadata] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

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

  const handleProfilePictureUpdate = (newAvatarUrl) => {
    setProfile((prev) => ({
      ...prev,
      avatar_url: newAvatarUrl,
    }));
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div className='container p-4 mx-auto'>
      <Card className='w-full p-6 mb-6 md:max-w-max'>
        <div className='flex flex-col items-start gap-6 md:flex-row'>
          <ProfilePictureUpload
            user={profile}
            onUpdate={handleProfilePictureUpdate}
          />
          <div className='flex-grow'>
            <div className='flex items-center justify-between gap-2 align-middle w-max'>
              <h1 className='text-2xl font-bold '>{profile.name}</h1>{' '}
              {profile.role === 'LAWYER' && (
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
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {savedLawyers?.length > 0 ? (
              savedLawyers?.map((lawyer) => (
                <LawyerCard
                  lawyer={lawyer}
                  enableButtons={true}
                  key={lawyer.id}
                />
              ))
            ) : (
              <div className='text-center text-gray-500'>No saved lawyers</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='container px-4 py-8 mx-auto'>
      <div className='max-w-2xl mx-auto space-y-4'>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className='p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <Skeleton className='w-32 h-5 mb-2' />
                <Skeleton className='w-full h-4' />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
