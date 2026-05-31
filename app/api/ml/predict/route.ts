import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'ML service error' },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    return NextResponse.json(prediction, { status: 200 });
  } catch (error) {
    console.error('ML API Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to ML service. Ensure it is running on port 5000.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${ML_SERVICE_URL}/health`);
    const health = await response.json();
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('ML Health Check Error:', error);
    return NextResponse.json(
      { error: 'ML service is not running' },
      { status: 503 }
    );
  }
}
