'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Stepper, Step } from '@/components/ui/stepper';
import BasicInfoStep from '@/components/registration/BasicInfoStep';
import DocumentUploadStep from '@/components/registration/DocumentUploadStep';
import ProfessionalInfoStep from '@/components/registration/ProfessionalInfoStep';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

export default function LawyerRegistrationPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    phone: '',

    // Step 2: Documents
    sanatNumber: '',
    degreeCertificate: null,
    barMembershipCertificate: null,

    // Step 3: Professional Info
    experience: '',
    specialization: '',
    city: '',
    state: '',
    languages: '',
  });

  const handleBasicInfoSubmit = async (data) => {
    try {
      setIsLoading(true);

      // First create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36).slice(-8), // Generate a random password
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            role: 'lawyer',
          },
        },
      });

      if (authError) throw authError;

      // Check session immediately after signup
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      console.log('Session after signup:', session); // Debug log

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        // If no session, try to sign in with the credentials
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: Math.random().toString(36).slice(-8), // Use the same password generation
          });

        if (signInError) throw signInError;
        console.log('Session after sign in:', signInData.session); // Debug log
      }

      setFormData((prev) => ({ ...prev, ...data }));
      setStep(2);

      toast({
        title: 'Account Created',
        description: 'Please check your email for verification.',
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async (data) => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Please complete email verification first');
      }

      // Upload documents to Supabase Storage
      const degreeDoc = await storage.uploadDocument(
        data.degreeCertificate,
        `lawyer-documents/${session.session.user.id}`
      );
      const barDoc = await storage.uploadDocument(
        data.barMembershipCertificate,
        `lawyer-documents/${session.session.user.id}`
      );

      setFormData((prev) => ({
        ...prev,
        ...data,
        degreeCertificateUrl: degreeDoc.url,
        barMembershipCertificateUrl: barDoc.url,
      }));

      setStep(3);
    } catch (error) {
      console.error('Document upload error:', error);
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to upload documents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async (data) => {
    try {
      setIsLoading(true);

      // Get current session
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Authentication required');
      }

      // Create lawyer profile in Supabase
      const { error } = await supabase.from('lawyers').insert([
        {
          user_id: session.session.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          sanat_number: formData.sanatNumber,
          degree_certificate_url: formData.degreeCertificateUrl,
          bar_membership_url: formData.barMembershipCertificateUrl,
          experience: parseInt(data.experience),
          specialization: data.specialization,
          city: data.city,
          state: data.state,
          languages: data.languages.split(',').map((lang) => lang.trim()),
          status: 'pending',
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Registration Successful',
        description:
          'Your registration is complete. We will review your application shortly.',
      });

      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gray-50'>
      <Card className='w-full max-w-2xl p-6 space-y-8'>
        <div className='text-center space-y-2'>
          <h1 className='text-2xl font-bold'>Lawyer Registration</h1>
          <p className='text-gray-500'>Join our legal community</p>
        </div>

        <Stepper currentStep={step} className='mb-8'>
          <Step>Basic Information</Step>
          <Step>Document Upload</Step>
          <Step>Professional Details</Step>
        </Stepper>

        {step === 1 && (
          <BasicInfoStep
            initialData={formData}
            onSubmit={handleBasicInfoSubmit}
            isLoading={isLoading}
          />
        )}

        {step === 2 && (
          <DocumentUploadStep
            initialData={formData}
            onSubmit={handleDocumentUpload}
            onBack={() => setStep(1)}
            isLoading={isLoading}
          />
        )}

        {step === 3 && (
          <ProfessionalInfoStep
            initialData={formData}
            onSubmit={handleFinalSubmit}
            onBack={() => setStep(2)}
            isLoading={isLoading}
          />
        )}
      </Card>
    </div>
  );
}
