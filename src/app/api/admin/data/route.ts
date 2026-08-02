import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (session?.value !== 'authenticated') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all responses using service role key (bypasses RLS)
  const { data, error } = await supabaseServer
    .from('responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch data' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
