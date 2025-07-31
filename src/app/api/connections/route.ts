import { NextRequest, NextResponse } from 'next/server';
import { authenticateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the session
    const sessionResponse = await authenticateSession();
    const organizationId = sessionResponse.organization.organization_id;

    const db = getDb();
    const result = await db.query(
      'SELECT id, provider, is_active, created_at FROM connections WHERE organization_id = $1',
      [organizationId]
    );

    return NextResponse.json({
      connections: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching connections:', error);
    
    // Check if it's an authentication error
    if (error.message === 'No active session found') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
