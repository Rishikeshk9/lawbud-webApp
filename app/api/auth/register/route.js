import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Extract data from formData
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const sanatNumber = formData.get('sanatNumber');
    const specializations = JSON.parse(formData.get('specializations'));
    const experience = formData.get('experience');
    const state = formData.get('state');
    const district = formData.get('district');
    const languages = formData.get('languages');
    const role = formData.get('role');

    // Get files
    const degreeCertificate = formData.get('degreeCertificate');
    const barMembershipCertificate = formData.get('barMembershipCertificate');

    // Upload certificates to storage
    const { data: degreeUrl, error: degreeError } = await supabaseAdmin.storage
      .from('certificates')
      .upload(
        `degree/${Date.now()}-${degreeCertificate.name}`,
        degreeCertificate
      );

    if (degreeError) throw degreeError;

    const { data: barUrl, error: barError } = await supabaseAdmin.storage
      .from('certificates')
      .upload(
        `bar/${Date.now()}-${barMembershipCertificate.name}`,
        barMembershipCertificate
      );

    if (barError) throw barError;

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signUp({
        email: email,
        password: Math.random().toString(36).slice(-8), // Generate a random password
        options: {
          data: {
            name: name,
            phone: phone,
            email: email,
            role: role,
          },
        },
      });

    if (authError) throw authError;

    // Begin transaction
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_id: authData.user.id,
        id: authData.user.id,
        name,
        email,
        phone,
        role,
      })
      .select()
      .single();

    if (userError) throw userError;

    // Insert lawyer details
    const { error: lawyerError, data: lawyer } = await supabaseAdmin
      .from('lawyers')
      .insert({
        user_id: user.id,
        sanat_number: sanatNumber,
        experience,
        state_id: state,
        district_id: district,
        languages: languages.split(',').map((lang) => lang.trim()),
        degree_certificate_url: degreeUrl.path,
        bar_membership_url: barUrl.path,
        verification_status: 'pending',
        auth_id: authData.user.id,
      })
      .select()
      .single();

    if (lawyerError) throw lawyerError;

    // Insert specializations
    const specializationInserts = specializations.map((spec) => ({
      lawyer_id: lawyer.id,
      specialization_id: spec,
    }));

    const { error: specError } = await supabaseAdmin
      .from('lawyer_specializations')
      .insert(specializationInserts);

    if (specError) throw specError;

    return NextResponse.json({
      message: 'Registration successful',
      user: user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
