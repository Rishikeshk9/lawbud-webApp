'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DocumentUploadStep({
  initialData,
  onSubmit,
  onBack,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    sanatNumber: initialData.sanatNumber || '',
    degreeCertificate: null,
    barMembershipCertificate: null,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sanatNumber)
      newErrors.sanatNumber = 'Sanat Number is required';
    if (!formData.degreeCertificate)
      newErrors.degreeCertificate = 'Degree Certificate is required';
    if (!formData.barMembershipCertificate)
      newErrors.barMembershipCertificate =
        'Bar Membership Certificate is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors((prev) => ({
          ...prev,
          [field]: 'Please upload a PDF file',
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [field]: 'File size should be less than 5MB',
        }));
        return;
      }

      try {
        setFormData((prev) => ({ ...prev, [field]: file }));
        setErrors((prev) => ({ ...prev, [field]: null }));
      } catch (error) {
        console.error('File upload error:', error);
        setErrors((prev) => ({
          ...prev,
          [field]: 'Failed to upload file. Please try again.',
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='sanatNumber'>
            Sanat Number <span className='text-red-500'>*</span>
          </Label>
          <Input
            id='sanatNumber'
            placeholder='Enter your Sanat Number'
            value={formData.sanatNumber}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sanatNumber: e.target.value,
              }))
            }
          />
          {errors.sanatNumber && (
            <p className='text-sm text-red-500'>{errors.sanatNumber}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='degreeCertificate'>
            Degree Certificate (PDF) <span className='text-red-500'>*</span>
          </Label>
          <div className='flex items-center gap-4'>
            <Input
              id='degreeCertificate'
              type='file'
              accept='application/pdf'
              onChange={(e) => handleFileChange(e, 'degreeCertificate')}
              className='hidden'
            />
            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={() =>
                document.getElementById('degreeCertificate').click()
              }
            >
              <Upload className='w-4 h-4 mr-2' />
              {formData.degreeCertificate
                ? formData.degreeCertificate.name
                : 'Upload Degree Certificate'}
            </Button>
          </div>
          {errors.degreeCertificate && (
            <p className='text-sm text-red-500'>{errors.degreeCertificate}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='barMembershipCertificate'>
            Bar Membership Certificate (PDF){' '}
            <span className='text-red-500'>*</span>
          </Label>
          <div className='flex items-center gap-4'>
            <Input
              id='barMembershipCertificate'
              type='file'
              accept='application/pdf'
              onChange={(e) => handleFileChange(e, 'barMembershipCertificate')}
              className='hidden'
            />
            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={() =>
                document.getElementById('barMembershipCertificate').click()
              }
            >
              <Upload className='w-4 h-4 mr-2' />
              {formData.barMembershipCertificate
                ? formData.barMembershipCertificate.name
                : 'Upload Bar Membership Certificate'}
            </Button>
          </div>
          {errors.barMembershipCertificate && (
            <p className='text-sm text-red-500'>
              {errors.barMembershipCertificate}
            </p>
          )}
        </div>
      </div>

      <div className='flex gap-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onBack}
          disabled={isLoading}
          className='w-full'
        >
          Back
        </Button>
        <Button type='submit' disabled={isLoading} className='w-full'>
          {isLoading ? 'Uploading...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
}
