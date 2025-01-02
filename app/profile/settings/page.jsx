'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Flags from 'country-flag-icons/react/3x2';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: Flags.IN },
  { code: 'US', name: 'United States', flag: Flags.US },
  { code: 'GB', name: 'United Kingdom', flag: Flags.GB },
  { code: 'CA', name: 'Canada', flag: Flags.CA },
  { code: 'AU', name: 'Australia', flag: Flags.AU },
];

export default function SettingsPage() {
  const router = useRouter();
  const [country, setCountry] = useState('IN');

  const selectedCountry = COUNTRIES.find((c) => c.code === country);
  const Flag = selectedCountry?.flag;

  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <div className='flex items-center mb-6'>
        <Button
          variant='ghost'
          size='sm'
          className='mr-2'
          onClick={() => router.back()}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-2xl font-bold'>Settings</h1>
      </div>

      {/* Region Settings */}
      <Card className='p-4 mb-4'>
        <h2 className='text-lg font-semibold mb-4'>Region</h2>
        <div className='space-y-2'>
          <label className='text-sm text-gray-500'>Country</label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <div className='flex items-center gap-2'>
                {Flag && <Flag className='w-4 h-4' />}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => {
                const CountryFlag = country.flag;
                return (
                  <SelectItem
                    key={country.code}
                    value={country.code}
                    className='flex items-center gap-2'
                  >
                    <div className='flex items-center gap-2'>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Legal & About */}
      <Card className='p-4 mb-4'>
        <h2 className='text-lg font-semibold mb-4'>Legal & About</h2>
        <div className='space-y-2'>
          <Link
            href='/privacy-policy'
            className='flex items-center justify-between p-2 hover:bg-gray-100 rounded-md transition-colors'
          >
            <span>Privacy Policy</span>
            <ChevronRight className='h-4 w-4 text-gray-500' />
          </Link>
          <Link
            href='/terms'
            className='flex items-center justify-between p-2 hover:bg-gray-100 rounded-md transition-colors'
          >
            <span>Terms & Conditions</span>
            <ChevronRight className='h-4 w-4 text-gray-500' />
          </Link>
          <div className='flex items-center justify-between p-2'>
            <span>App Version</span>
            <span className='text-gray-500'>{APP_VERSION}</span>
          </div>
        </div>
      </Card>

      {/* Delete Account */}
      <Card className='p-4'>
        <Button variant='destructive' className='w-full'>
          Delete Account
        </Button>
      </Card>
    </div>
  );
}
