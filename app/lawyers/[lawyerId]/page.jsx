'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLawyers } from '@/app/contexts/LawyersContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Mail,
  Phone,
  Star,
  MessageCircle,
  Bot,
  Award,
  Heart,
} from 'lucide-react';
import { useUser } from '@/app/contexts/UserContext';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/contexts/AuthContext';
import LawyerCard from '@/components/LawyerCard';

function LawyerDetailsPage() {
  const params = useParams();
  const { lawyers, isLoading, error } = useLawyers();
  const [lawyer, setLawyer] = useState(null);

  useEffect(() => {
    if (params.lawyerId && lawyers.length > 0) {
      const foundLawyer = lawyers.find((l) => l.id === params.lawyerId);
      setLawyer(foundLawyer);
      console.log(foundLawyer);
    }
  }, [params.lawyerId, lawyers]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!lawyer) {
    return <div>Lawyer not found</div>;
  }

  return (
    <div className='container px-4 py-4 mx-auto'>
      <LawyerCard lawyer={lawyer} enableButtons={true} />

      {/* Reviews Section - Only show for human lawyers */}
      {!lawyer.isAI && lawyer.reviews.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Reviews</h2>
          {lawyer.reviews.map((review, index) => (
            <Card key={index} className='p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <Avatar className='w-8 h-8'>
                    <AvatarFallback>{review?.userId[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{review?.user}</p>
                    <p className='text-sm text-gray-500'>{review?.date}</p>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                  <span>{review.rating}</span>
                </div>
              </div>
              <p className='mt-2 text-gray-600'>{review.comment}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default LawyerDetailsPage;
