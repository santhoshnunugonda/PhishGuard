import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint is called daily by Vercel Cron to keep the Supabase
// free-tier project alive (prevents auto-pause after 7 days of inactivity).
export async function GET() {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[keep-alive] Fatal error:', message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

