import { mockLawyers } from '@/app/data/mockLawyers';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(mockLawyers);
}
