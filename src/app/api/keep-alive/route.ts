import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint is called daily by Vercel Cron to keep the Supabase
// free-tier project alive (prevents auto-pause after 7 days of inactivity).
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (security check)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Lightweight ping — just count profiles, no heavy query
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[keep-alive] Supabase ping error:', error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();
    console.log(`[keep-alive] ✅ Supabase pinged at ${now}. Profiles: ${count}`);

    return NextResponse.json({
      ok: true,
      message: 'Supabase is alive!',
      profiles: count,
      timestamp: now,
    });
  } catch (err: any) {
    console.error('[keep-alive] Fatal error:', err.message);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
