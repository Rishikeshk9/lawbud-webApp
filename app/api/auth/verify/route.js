import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    // For testing purposes, accept '1234' as valid OTP
    if (otp !== '1234') {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie with the JWT token
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const token = request.cookies.get('token');

    if (!token) {
      return NextResponse.json({ message: 'No token found' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET);

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
