import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError, data } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('avatars').getPublicUrl(filePath);

    // Update user profile
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Profile picture updated successfully',
      avatarUrl: publicUrl,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
