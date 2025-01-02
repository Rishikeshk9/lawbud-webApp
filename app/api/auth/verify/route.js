import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // In production, fetch user data from database using decoded.userId
    const user = {
      id: decoded.userId,
      name: 'John Doe',
      phoneNumber: decoded.phoneNumber,
      email: 'john@example.com',
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
