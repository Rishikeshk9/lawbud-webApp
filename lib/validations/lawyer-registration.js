import * as z from 'zod';

export const lawyerRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{9,11}$/, 'Invalid phone number'),
  sanatNumber: z.string().min(1, 'Sanat number is required'),
  degreeCertificate: z
    .any()
    .refine((file) => file, 'Degree certificate is required')
    .refine(
      (file) => file?.size <= 5 * 1024 * 1024,
      'File size should be less than 5MB'
    ),
  barMembershipCertificate: z
    .any()
    .refine((file) => file, 'Bar membership certificate is required')
    .refine(
      (file) => file?.size <= 5 * 1024 * 1024,
      'File size should be less than 5MB'
    ),
  specializations: z.array(z.string()).refine((value) => value.length > 0, {
    message: 'Select at least one specialization.',
  }),
  experience: z.string().min(1, 'Experience is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  languages: z
    .array(z.string())
    .min(1, 'Select at least one language')
    .max(15, 'You can select up to 15 languages'),
  role: z.string().default('lawyer'),
});
