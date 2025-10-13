import { NextResponse } from 'next/server';
import {
  initializeDatabase,
  isDatabaseConfigured,
  DatabaseNotConfiguredError,
} from '@/lib/db';

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { enabled: false, reason: 'Database URL not configured.' },
        { status: 503 }
      );
    }

    await initializeDatabase();

    return NextResponse.json({ enabled: true });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json(
        { enabled: false, reason: error.message },
        { status: 503 }
      );
    }

    console.error('Notes status check failed:', error);
    return NextResponse.json(
      { enabled: false, reason: 'Failed to verify database status.' },
      { status: 503 }
    );
  }
}

