import { NextResponse } from 'next/server';
import { getSchemes } from '@/firebase/schemes';

export async function GET() {
  try {
    const schemes = await getSchemes();
    return NextResponse.json(schemes, { status: 200 });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemes' },
      { status: 500 }
    );
  }
}

