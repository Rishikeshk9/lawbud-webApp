'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function LocationDisplay() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            //   console.log(latitude, longitude);
            // Reverse geocoding using OpenStreetMap Nominatim API
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              setAddress(data.address.county);

              // console.log(data);
            } catch (error) {
              console.error('Error fetching address:', error);
              setError('Failed to get address');
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Unable to get your location');
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }, []);

  if (error) {
    return (
      <Card className='p-4 mb-6 bg-red-50 text-red-600'>
        <div className='flex items-center gap-2'>
          <MapPin className='h-5 w-5' />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (!location || !address) {
    return (
      <Card className='p-2 rounded-md drop-shadow-sm animate-pulse'>
        <div className='flex items-center gap-2'>
          <MapPin className='h-5 w-5' />
          <div className='h-4 w-6 bg-gray-200 rounded  '></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-2 rounded-md drop-shadow-sm'>
      <div className='flex items-center gap-2'>
        <MapPin className='h-5 w-5 text-primary' />
        <p className='text-sm text-gray-600'>{address}</p>
      </div>
    </Card>
  );
}
