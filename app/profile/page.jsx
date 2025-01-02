'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, MapPin, Mail, Phone, StarIcon } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useLawyers } from '../contexts/LawyersContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useUser();
  const { lawyers } = useLawyers();
  const router = useRouter();

  // Get saved lawyers with full details
  const savedLawyers = user.savedLawyers
    .map((id) => lawyers.find((lawyer) => lawyer.id === id))
    .filter(Boolean); // Remove any undefined values

  // Get recent cases with lawyer details
  const recentCasesWithDetails = user.recentCases.map((case_) => ({
    ...case_,
    lawyer: lawyers.find((l) => l.id === case_.lawyerId),
  }));

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card className='p-6 mb-6'>
        <div className='flex flex-col md:flex-row items-start gap-6'>
          <div className='relative'>
            <Avatar className='h-24 w-24'>
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name
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
            <h1 className='text-2xl font-bold mb-4'>{user.name}</h1>
            <div className='space-y-2'>
              <div className='flex items-center text-gray-600'>
                <Mail className='h-4 w-4 mr-2' />
                {user.email}
              </div>
              <div className='flex items-center text-gray-600'>
                <Phone className='h-4 w-4 mr-2' />
                {user.phone}
              </div>
              <div className='flex items-center text-gray-600'>
                <MapPin className='h-4 w-4 mr-2' />
                {user.location}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue='saved' className='space-y-4'>
        <TabsList>
          {/* <TabsTrigger value='cases'>Recent Cases</TabsTrigger> */}
          <TabsTrigger value='saved'>Saved Lawyers</TabsTrigger>
        </TabsList>

        <TabsContent value='cases'>
          <div className='space-y-4'>
            {recentCasesWithDetails.map((case_) => (
              <Card key={case_.id} className='p-4'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='font-semibold'>{case_.title}</h3>
                    <p className='text-sm text-gray-500'>
                      Lawyer: {case_.lawyer?.name}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Date: {new Date(case_.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      case_.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {case_.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='saved'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {savedLawyers.map((lawyer) => (
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
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
