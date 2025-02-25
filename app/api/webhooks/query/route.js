import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req) {
  try {
    const { role } = await req.json();

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    // Map the role to the correct enum value
    const roleMap = {
      lawyer: 'LAWYER',
      user: 'USER',
      admin: 'ADMIN',
      ai: 'AI',
    };

    const normalizedRole = roleMap[role.toLowerCase()];

    if (!normalizedRole) {
      return NextResponse.json(
        { error: 'Invalid role provided' },
        { status: 400 }
      );
    }

    // Query users based on role
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', normalizedRole);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
