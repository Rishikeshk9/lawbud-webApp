import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  try {
    const { phoneNumber, otp } = await request.json();

    // In production, verify OTP against stored OTP
    // For demo, accept "1234" as valid OTP
    if (otp !== '1234') {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    // Mock user data - in production, fetch from database
    const user = {
      id: '1',
      name: 'John Doe',
      phoneNumber,
      email: 'john@example.com',
    };

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, phoneNumber }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Create the response
    const response = NextResponse.json({ token, user });

    // Set the token as an HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
