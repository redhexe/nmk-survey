import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabaseServer';

export async function DELETE() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (session?.value !== 'authenticated') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Delete all rows where is_test is true using service role key
  const { error } = await supabaseServer
    .from('responses')
    .delete()
    .eq('is_test', true);

  if (error) {
    console.error("Error deleting test data:", error);
    return NextResponse.json({ success: false, message: 'Failed to delete test data' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
