'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stepper } from '@/components/ui/stepper';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

const LAWYER_REGISTRATION_STEPS = ['Verification', 'Documents', 'Professional'];

const SPECIALIZATIONS = [
  'Criminal Law',
  'Family Law',
  'Corporate Law',
  'Real Estate Law',
  'Intellectual Property',
  'Tax Law',
  'Civil Law',
  'Constitutional Law',
  'Environmental Law',
  'Labor Law',
];

export function LawyerInfoForm({ onSubmit, isLoading }) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    barCouncilId: '',
    sanatNumber: '',
    degreeCertificate: null,
    barMembership: null,
    specializations: [],
    experience: '',
    location: '',
    bio: '',
  });

  const [fileErrors, setFileErrors] = useState({
    degreeCertificate: '',
    barMembership: '',
  });

  const [formErrors, setFormErrors] = useState({
    barCouncilId: '',
    sanatNumber: '',
    degreeCertificate: '',
    barMembership: '',
    specializations: '',
    experience: '',
    location: '',
    bio: '',
  });

  const validateFile = (file, fieldName) => {
    if (!file) {
      return 'File is required';
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Only PDF files are allowed';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size should be less than 5MB';
    }

    return '';
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    const error = validateFile(file, fieldName);

    setFileErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    if (!error) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for experience field
    if (name === 'experience') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, '');

      // Ensure value is between 0 and 99
      if (
        numericValue === '' ||
        (parseInt(numericValue) >= 0 && parseInt(numericValue) <= 99)
      ) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Handle other fields normally
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecializationToggle = (specialization) => {
    setFormData((prev) => {
      const specializations = prev.specializations.includes(specialization)
        ? prev.specializations.filter((s) => s !== specialization)
        : [...prev.specializations, specialization];
      return { ...prev, specializations };
    });
  };

  const removeSpecialization = (specialization) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((s) => s !== specialization),
    }));
  };

  const validateStep = (stepNumber) => {
    const errors = { ...formErrors };
    let isValid = true;

    if (stepNumber === 0) {
      // Validate verification step
      if (!formData.barCouncilId.trim()) {
        errors.barCouncilId = 'Bar Council ID is required';
        isValid = false;
      }
      if (!formData.sanatNumber.trim()) {
        errors.sanatNumber = 'Sanat Number is required';
        isValid = false;
      }
    } else if (stepNumber === 1) {
      // Validate documents step
      const degreeError = validateFile(
        formData.degreeCertificate,
        'degreeCertificate'
      );
      const barError = validateFile(formData.barMembership, 'barMembership');

      if (degreeError) {
        errors.degreeCertificate = degreeError;
        isValid = false;
      }
      if (barError) {
        errors.barMembership = barError;
        isValid = false;
      }
    } else if (stepNumber === 2) {
      // Validate professional info step
      if (formData.specializations.length === 0) {
        errors.specializations = 'Please select at least one specialization';
        isValid = false;
      }
      if (!formData.experience) {
        errors.experience = 'Years of experience is required';
        isValid = false;
      }
      if (!formData.location.trim()) {
        errors.location = 'Location is required';
        isValid = false;
      }
      if (!formData.bio.trim()) {
        errors.bio = 'Bio is required';
        isValid = false;
      } else if (formData.bio.trim().length < 50) {
        errors.bio = 'Bio should be at least 50 characters long';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(2)) {
      onSubmit(formData);
      toast({
        title: 'Registration Request Received',
        description:
          'We will review your application and get back to you within 24-48 hours.',
        duration: 5000, // Show for 5 seconds
      });
    }
  };

  return (
    <div className='space-y-6'>
      <Stepper steps={LAWYER_REGISTRATION_STEPS} currentStep={step} />

      <form onSubmit={handleSubmit} className='space-y-4'>
        {step === 0 && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='barCouncilId'>
                Bar Council ID <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='barCouncilId'
                name='barCouncilId'
                required
                placeholder='Enter your Bar Council ID'
                value={formData.barCouncilId}
                onChange={handleChange}
                className={formErrors.barCouncilId ? 'border-red-500' : ''}
              />
              {formErrors.barCouncilId && (
                <p className='text-sm text-red-500'>
                  {formErrors.barCouncilId}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='sanatNumber'>
                Sanat Number <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='sanatNumber'
                name='sanatNumber'
                required
                placeholder='Enter your Sanat Number'
                value={formData.sanatNumber}
                onChange={handleChange}
                className={formErrors.sanatNumber ? 'border-red-500' : ''}
              />
              {formErrors.sanatNumber && (
                <p className='text-sm text-red-500'>{formErrors.sanatNumber}</p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className='space-y-4'>
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
                    : 'Upload Certificate'}
                </Button>
              </div>
              {fileErrors.degreeCertificate && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    {fileErrors.degreeCertificate}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='barMembership'>
                Bar Membership Certificate (PDF){' '}
                <span className='text-red-500'>*</span>
              </Label>
              <div className='flex items-center gap-4'>
                <Input
                  id='barMembership'
                  type='file'
                  accept='application/pdf'
                  onChange={(e) => handleFileChange(e, 'barMembership')}
                  className='hidden'
                />
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={() =>
                    document.getElementById('barMembership').click()
                  }
                >
                  <Upload className='w-4 h-4 mr-2' />
                  {formData.barMembership
                    ? formData.barMembership.name
                    : 'Upload Certificate'}
                </Button>
              </div>
              {fileErrors.barMembership && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    {fileErrors.barMembership}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>
                Specializations <span className='text-red-500'>*</span>
              </Label>
              <div className='flex flex-wrap gap-2 mb-2'>
                {formData.specializations.map((spec) => (
                  <Badge
                    key={spec}
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    {spec}
                    <button
                      type='button'
                      onClick={() => removeSpecialization(spec)}
                      className='ml-1 hover:text-destructive'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className='grid grid-cols-2 gap-2 border rounded-lg p-4'>
                {SPECIALIZATIONS.map((specialization) => (
                  <div
                    key={specialization}
                    className='flex items-center space-x-2'
                  >
                    <Checkbox
                      id={specialization}
                      checked={formData.specializations.includes(
                        specialization
                      )}
                      onCheckedChange={() =>
                        handleSpecializationToggle(specialization)
                      }
                    />
                    <label
                      htmlFor={specialization}
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                      {specialization}
                    </label>
                  </div>
                ))}
              </div>
              {formErrors.specializations && (
                <p className='text-sm text-red-500'>
                  {formErrors.specializations}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='experience'>
                Years of Experience <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='experience'
                name='experience'
                type='number'
                required
                min='0'
                max='99'
                placeholder='Years of experience'
                value={formData.experience}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  formErrors.experience ? 'border-red-500' : ''
                }`}
              />
              {formErrors.experience && (
                <p className='text-sm text-red-500'>{formErrors.experience}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='location'>
                Location <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='location'
                name='location'
                required
                placeholder='City, State'
                value={formData.location}
                onChange={handleChange}
                className={formErrors.location ? 'border-red-500' : ''}
              />
              {formErrors.location && (
                <p className='text-sm text-red-500'>{formErrors.location}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>
                Bio <span className='text-red-500'>*</span>
              </Label>
              <textarea
                id='bio'
                name='bio'
                required
                placeholder='Write a brief description about yourself (minimum 50 characters)'
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className={`w-full p-2 border rounded ${
                  formErrors.bio ? 'border-red-500' : ''
                }`}
              />
              {formErrors.bio && (
                <p className='text-sm text-red-500'>{formErrors.bio}</p>
              )}
            </div>
          </div>
        )}

        <div className='flex justify-between pt-4'>
          {step > 0 && (
            <Button type='button' variant='outline' onClick={handleBack}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button
              type='button'
              className='ml-auto'
              onClick={handleNext}
              disabled={isLoading}
            >
              Next
            </Button>
          ) : (
            <Button type='submit' className='ml-auto' disabled={isLoading}>
              {isLoading ? 'Creating Profile...' : 'Complete Registration'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
