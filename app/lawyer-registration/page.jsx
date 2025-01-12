'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lawyerRegistrationSchema } from '@/lib/validations/lawyer-registration';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getStates, getDistricts } from '@/lib/location';

const SPECIALIZATIONS = [
  {
    id: 'civil-law',
    label: 'Civil Law',
  },
  {
    id: 'criminal-law',
    label: 'Criminal Law',
  },
  {
    id: 'corporate-law',
    label: 'Corporate Law',
  },
  {
    id: 'family-law',
    label: 'Family Law',
  },
  {
    id: 'constitutional-law',
    label: 'Constitutional Law',
  },
  {
    id: 'intellectual-property-law',
    label: 'Intellectual Property Law',
  },
  {
    id: 'labor-law',
    label: 'Labor Law',
  },
  {
    id: 'tax-law',
    label: 'Tax Law',
  },
  {
    id: 'real-estate-law',
    label: 'Real Estate Law',
  },
  {
    id: 'environmental-law',
    label: 'Environmental Law',
  },
];

export default function LawyerRegistrationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState(null);

  const form = useForm({
    resolver: zodResolver(lawyerRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      sanatNumber: '',
      degreeCertificate: null,
      barMembershipCertificate: null,
      specializations: [],
      experience: '',
      state: '',
      district: '',
      languages: '',
      role: 'lawyer',
    },
  });

  useEffect(() => {
    async function fetchStates() {
      const statesData = await getStates();
      setStates(statesData);
    }
    fetchStates();
  }, []);

  useEffect(() => {
    async function fetchDistricts() {
      if (selectedState) {
        const districtsData = await getDistricts(selectedState);
        setDistricts(districtsData);
      } else {
        setDistricts([]);
      }
    }
    fetchDistricts();
  }, [selectedState]);

  async function onSubmit(data) {
    try {
      setIsLoading(true);
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === 'specializations') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (key === 'role') {
          formData.append(key, 'lawyer');
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      toast({
        title: 'Registration Successful',
        description: 'Your application has been submitted for review.',
      });

      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gray-50'>
      <Card className='w-full max-w-2xl p-6 space-y-8'>
        <div className='text-center space-y-2'>
          <h1 className='text-2xl font-bold'>Lawyer Registration</h1>
          <p className='text-gray-500'>Join our legal community</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='sanatNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sanat Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='degreeCertificate'
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Degree Certificate</FormLabel>
                    <FormControl>
                      <div className='flex items-center gap-2'>
                        <Input
                          type='file'
                          accept='application/pdf,image/*'
                          className='hidden'
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          className='w-full'
                          onClick={() =>
                            document
                              .querySelector(`input[name='degreeCertificate']`)
                              .click()
                          }
                        >
                          <Upload className='w-4 h-4 mr-2' />
                          {value?.name || 'Upload Certificate'}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='barMembershipCertificate'
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Bar Membership Certificate</FormLabel>
                    <FormControl>
                      <div className='flex items-center gap-2'>
                        <Input
                          type='file'
                          accept='application/pdf,image/*'
                          className='hidden'
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          className='w-full'
                          onClick={() =>
                            document
                              .querySelector(
                                `input[name='barMembershipCertificate']`
                              )
                              .click()
                          }
                        >
                          <Upload className='w-4 h-4 mr-2' />
                          {value?.name || 'Upload Certificate'}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='specializations'
              render={() => (
                <FormItem>
                  <div className='mb-4'>
                    <FormLabel>Specializations</FormLabel>
                    <FormDescription>
                      Select your areas of legal expertise
                    </FormDescription>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    {SPECIALIZATIONS.map((specialization) => (
                      <FormField
                        key={specialization.id}
                        control={form.control}
                        name='specializations'
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={specialization.id}
                              className='flex flex-row items-start space-x-3 space-y-0'
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    specialization.id
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          specialization.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) =>
                                              value !== specialization.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className='text-sm font-normal'>
                                {specialization.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='experience'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type='number' min='0' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedState(value);
                        // Reset district when state changes
                        form.setValue('district', '');
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select your state' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem
                            key={state.id}
                            value={state.id.toString()}
                          >
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='district'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedState}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select your district' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem
                            key={district.id}
                            value={district.id.toString()}
                          >
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='languages'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Languages</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., English, Hindi, Marathi'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
