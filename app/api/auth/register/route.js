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

    let degreeUpload, barUpload;

    try {
      // Upload certificates to storage first
      [degreeUpload, barUpload] = await Promise.all([
        supabaseAdmin.storage
          .from('certificates')
          .upload(
            `degree/${Date.now()}-${degreeCertificate.name}`,
            degreeCertificate
          ),
        supabaseAdmin.storage
          .from('certificates')
          .upload(
            `bar/${Date.now()}-${barMembershipCertificate.name}`,
            barMembershipCertificate
          ),
      ]);

      if (degreeUpload.error)
        throw new Error('Failed to upload degree certificate');
      if (barUpload.error)
        throw new Error('Failed to upload bar membership certificate');

      // Map the role to the correct enum value (using lowercase as that's likely what's in the database)
      const roleMap = {
        lawyer: 'LAWYER',
        user: 'USER',
        admin: 'ADMIN',
        ai: 'AI',
      };

      // Get the normalized role or default to 'user'
      const normalizedRole = roleMap[role.toLowerCase()] || 'USER';

      // Create user in Supabase Auth with role in user_metadata
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.signUp({
          email: email,
          password: Math.random().toString(36).slice(-8),
          options: {
            data: {
              name: name,
              role: normalizedRole,
            },
          },
        });
      console.log(authData);
      console.log(authError);
      if (authError)
        throw new Error(`Failed to create user account: ${authError}`);

      // Use single query transaction for database operations
      const { data, error: transactionError } = await supabaseAdmin.rpc(
        'create_lawyer_profile',
        {
          p_user_id: authData.user.id,
          p_name: name,
          p_email: email,
          p_phone: phone,
          p_role: normalizedRole,
          p_sanat_number: sanatNumber,
          p_experience: experience,
          p_state_id: state,
          p_district_id: district,
          p_languages: languages.split(',').map((lang) => lang.trim()),
          p_degree_url: degreeUpload.data.path,
          p_bar_url: barUpload.data.path,
          p_specializations: specializations,
        }
      );

      if (transactionError) throw transactionError;

      return NextResponse.json({
        message: 'Registration successful',
        user: data,
      });
    } catch (error) {
      // Clean up uploaded files if they exist
      if (degreeUpload?.data?.path) {
        await supabaseAdmin.storage
          .from('certificates')
          .remove([degreeUpload.data.path]);
      }
      if (barUpload?.data?.path) {
        await supabaseAdmin.storage
          .from('certificates')
          .remove([barUpload.data.path]);
      }
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Registration failed',
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
