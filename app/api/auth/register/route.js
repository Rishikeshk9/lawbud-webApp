import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const userData = {
      email: formData.get('email'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      role: formData.get('role'),
    };

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await db.users.create(userData);

    // If registering as a lawyer, handle lawyer-specific data
    if (userData.role === 'lawyer') {
      const lawyerData = {
        user_id: user.id,
        bar_council_id: formData.get('barCouncilId'),
        sanat_number: formData.get('sanatNumber'),
        specializations: JSON.parse(formData.get('specializations')),
        experience: parseInt(formData.get('experience')),
        about: formData.get('about'),
        languages: formData
          .get('languages')
          .split(',')
          .map((lang) => lang.trim()),
      };

      const lawyer = await db.lawyers.create(lawyerData);

      // Handle document uploads
      const degreeCertificate = formData.get('degreeCertificate');
      const barMembershipCertificate = formData.get('barMembershipCertificate');

      if (degreeCertificate) {
        const degreeDoc = await storage.uploadDocument(
          degreeCertificate,
          `lawyers/${lawyer.id}/documents`
        );
        await db.documents.create({
          lawyer_id: lawyer.id,
          name: 'Degree Certificate',
          type: degreeCertificate.type,
          url: degreeDoc.url,
          path: degreeDoc.path,
        });
      }

      if (barMembershipCertificate) {
        const barDoc = await storage.uploadDocument(
          barMembershipCertificate,
          `lawyers/${lawyer.id}/documents`
        );
        await db.documents.create({
          lawyer_id: lawyer.id,
          name: 'Bar Membership Certificate',
          type: barMembershipCertificate.type,
          url: barDoc.url,
          path: barDoc.path,
        });
      }
    }

    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}
