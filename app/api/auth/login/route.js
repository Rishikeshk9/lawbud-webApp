// import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
// import { emailService } from '@/lib/email';
// import { otpService } from '@/lib/redis';

// export async function POST(request) {
//   try {
//     const { email } = await request.json();

//     // Check if user exists
//     const { data: existingUser } = await supabase
//       .from('users')
//       .select()
//       .eq('email', email)
//       .single();

//     if (!existingUser) {
//       return NextResponse.json({ message: 'User not found' }, { status: 404 });
//     }

//     // Generate OTP
//     const otp = Math.random().toString().substring(2, 8);

//     // Store OTP in Redis
//     await otpService.storeOTP(email, otp);

//     // Send OTP via email
//     await emailService.sendOTP(email, otp);

//     return NextResponse.json(
//       { message: 'OTP sent successfully' },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Login error:', error);
//     return NextResponse.json(
//       { message: 'Failed to send OTP' },
//       { status: 500 }
//     );
//   }
// }
