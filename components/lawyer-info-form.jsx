'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const SPECIALIZATIONS = [
  'Civil Law',
  'Criminal Law',
  'Corporate Law',
  'Family Law',
  'Constitutional Law',
  'Intellectual Property Law',
  'Labor Law',
  'Tax Law',
  'Conveyancing Law',
  'Environmental Law',
];

export default function LawyerInfoForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    barCouncilId: '',
    sanatNumber: '',
    specializations: [],
    experience: '',
    about: '',
    languages: '',
    degreeCertificate: null,
    barMembershipCertificate: null,
  });

  const [errors, setErrors] = useState({});
  const [showSpecializations, setShowSpecializations] = useState(false);

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case 'barCouncilId':
        if (!value) newErrors.barCouncilId = 'Bar Council ID is required';
        else delete newErrors.barCouncilId;
        break;
      case 'sanatNumber':
        if (!value) newErrors.sanatNumber = 'Sanat Number is required';
        else delete newErrors.sanatNumber;
        break;
      case 'specializations':
        if (!value || value.length === 0)
          newErrors.specializations = 'At least one specialization is required';
        else delete newErrors.specializations;
        break;
      case 'experience':
        if (!value) newErrors.experience = 'Experience is required';
        else if (isNaN(value) || value < 0)
          newErrors.experience = 'Please enter a valid number';
        else delete newErrors.experience;
        break;
      case 'about':
        if (!value) newErrors.about = 'About section is required';
        else if (value.length < 100)
          newErrors.about = 'Please provide at least 100 characters';
        else delete newErrors.about;
        break;
      case 'languages':
        if (!value) newErrors.languages = 'Languages are required';
        else delete newErrors.languages;
        break;
      case 'degreeCertificate':
        if (!value)
          newErrors.degreeCertificate = 'Degree Certificate is required';
        else delete newErrors.degreeCertificate;
        break;
      case 'barMembershipCertificate':
        if (!value)
          newErrors.barMembershipCertificate =
            'Bar Membership Certificate is required';
        else delete newErrors.barMembershipCertificate;
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (files[0].type !== 'application/pdf') {
        setErrors((prev) => ({
          ...prev,
          [name]: 'Please upload a PDF file',
        }));
        return;
      }
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'File size should be less than 5MB',
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      validateField(name, files[0]);
    }
  };

  const handleSpecializationToggle = (specialization) => {
    setFormData((prev) => {
      const newSpecializations = prev.specializations.includes(specialization)
        ? prev.specializations.filter((s) => s !== specialization)
        : [...prev.specializations, specialization];

      validateField('specializations', newSpecializations);
      return { ...prev, specializations: newSpecializations };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach((field) => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    // If validation passes, call the onSubmit prop with the form data
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='barCouncilId'>
          Bar Council ID <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='barCouncilId'
          name='barCouncilId'
          placeholder='Enter your Bar Council ID'
          value={formData.barCouncilId}
          onChange={handleChange}
          error={errors.barCouncilId}
        />
        {errors.barCouncilId && (
          <p className='text-sm text-red-500'>{errors.barCouncilId}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='sanatNumber'>
          Sanat Number <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='sanatNumber'
          name='sanatNumber'
          placeholder='Enter your Sanat Number'
          value={formData.sanatNumber}
          onChange={handleChange}
          error={errors.sanatNumber}
        />
        {errors.sanatNumber && (
          <p className='text-sm text-red-500'>{errors.sanatNumber}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label>
          Specializations <span className='text-red-500'>*</span>
        </Label>
        <div className='relative'>
          <div
            className='relative border rounded-md p-2 cursor-pointer'
            onClick={() => setShowSpecializations(!showSpecializations)}
          >
            <div className='flex flex-wrap gap-1'>
              {formData.specializations.length > 0 ? (
                formData.specializations.map((spec) => (
                  <span
                    key={spec}
                    className='bg-primary/10 text-primary rounded-full px-2 py-1 text-sm'
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <span className='text-gray-500'>Select specializations</span>
              )}
            </div>
          </div>
          {showSpecializations && (
            <div className='absolute z-50 left-0 right-0 mt-1 border rounded-md shadow-lg bg-white'>
              <ScrollArea className='h-[200px]'>
                <div className='p-2 space-y-1'>
                  {SPECIALIZATIONS.map((specialization) => (
                    <label
                      key={specialization}
                      className='flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer'
                    >
                      <Checkbox
                        checked={formData.specializations.includes(
                          specialization
                        )}
                        onCheckedChange={() =>
                          handleSpecializationToggle(specialization)
                        }
                      />
                      <span className='text-sm'>{specialization}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        {errors.specializations && (
          <p className='text-sm text-red-500'>{errors.specializations}</p>
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
          min='0'
          placeholder='Enter years of experience'
          value={formData.experience}
          onChange={handleChange}
          error={errors.experience}
        />
        {errors.experience && (
          <p className='text-sm text-red-500'>{errors.experience}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='about'>
          About <span className='text-red-500'>*</span>
        </Label>
        <Textarea
          id='about'
          name='about'
          placeholder='Tell us about your professional background and expertise'
          value={formData.about}
          onChange={handleChange}
          error={errors.about}
          className='min-h-[100px]'
        />
        {errors.about && <p className='text-sm text-red-500'>{errors.about}</p>}
        <p className='text-sm text-gray-500'>
          {formData.about.length}/500 characters (minimum 100)
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='languages'>
          Languages <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='languages'
          name='languages'
          placeholder='e.g., English, Hindi, Marathi'
          value={formData.languages}
          onChange={handleChange}
          error={errors.languages}
        />
        {errors.languages && (
          <p className='text-sm text-red-500'>{errors.languages}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='degreeCertificate'>
          Degree Certificate (PDF) <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='degreeCertificate'
          name='degreeCertificate'
          type='file'
          accept='application/pdf'
          onChange={handleFileChange}
          error={errors.degreeCertificate}
          className='file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20'
        />
        {errors.degreeCertificate && (
          <p className='text-sm text-red-500'>{errors.degreeCertificate}</p>
        )}
        <p className='text-sm text-gray-500'>Maximum file size: 5MB</p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='barMembershipCertificate'>
          Bar Membership Certificate (PDF){' '}
          <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='barMembershipCertificate'
          name='barMembershipCertificate'
          type='file'
          accept='application/pdf'
          onChange={handleFileChange}
          error={errors.barMembershipCertificate}
          className='file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20'
        />
        {errors.barMembershipCertificate && (
          <p className='text-sm text-red-500'>
            {errors.barMembershipCertificate}
          </p>
        )}
        <p className='text-sm text-gray-500'>Maximum file size: 5MB</p>
      </div>
    </form>
  );
}
