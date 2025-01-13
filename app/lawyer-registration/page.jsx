'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Terminal, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lawyerRegistrationSchema } from '@/lib/validations/lawyer-registration';
import Link from 'next/link';

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SPECIALIZATIONS, LANGUAGES } from '@/lib/constants';

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
      languages: [],
      role: 'lawyer',
    },
  });

  useEffect(() => {
    const statesData = getStates();
    setStates(statesData);
  }, []);

  useEffect(() => {
    if (selectedState) {
      const districtsData = getDistricts(selectedState);
      setDistricts(districtsData);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  useEffect(() => {
    //  console.log(form.getValues());
  }, [form.getValues()]);

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
          <p className='text-sm text-red-500'>* All fields are mandatory</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
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
                    <FormLabel>Email *</FormLabel>
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
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='experience'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience *</FormLabel>
                    <FormControl>
                      <Input type='number' min='0' {...field} />
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
                    <FormLabel>Sanad Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
              <Alert>
                <Terminal className='h-4 w-4' />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  Documents should be in PDF. File size should be less than 5MB.
                </AlertDescription>
              </Alert>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='degreeCertificate'
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Degree Certificate *</FormLabel>
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
                                  `input[name='degreeCertificate']`
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

                <FormField
                  control={form.control}
                  name='barMembershipCertificate'
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Bar Membership Certificate *</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name='specializations'
              render={() => (
                <FormItem>
                  <div className='mb-4'>
                    <FormLabel>Specializations *</FormLabel>
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

            <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
              <Alert>
                <Terminal className='h-4 w-4' />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  Your Location will be used to match your clients with You in
                  your area.
                </AlertDescription>
              </Alert>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
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
                      <FormLabel>District *</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name='languages'
              render={() => (
                <FormItem>
                  <div className='mb-4'>
                    <FormLabel>Languages *</FormLabel>
                    <FormDescription>
                      Select languages you can communicate in
                    </FormDescription>
                  </div>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    {LANGUAGES.map((language) => (
                      <FormField
                        key={language.id}
                        control={form.control}
                        name='languages'
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={language.id}
                              className='flex flex-row items-start space-x-3 space-y-0'
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(language.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          language.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== language.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className='text-sm font-normal'>
                                {language.label}
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

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </form>
        </Form>
        <div className='text-center '>
          <p className='text-sm text-gray-500'>
            Want to Register as a Client?{' '}
            <Link href='/register' className='text-primary hover:underline'>
              Register
            </Link>
          </p>
          <p className='text-sm text-gray-500'>
            Already have an account?{' '}
            <Link href='/login' className='text-primary hover:underline'>
              Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
