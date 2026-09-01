import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const errorData = await req.json();
    
    console.error('🔥 [LAZOO SUPERADMIN ALERT] APP ERROR REPORT 🔥');
    console.error(`URL: ${errorData.url}`);
    console.error(`Message: ${errorData.message}`);
    
    // Insert into Supabase app_errors table
    const adminClient = createAdminClient();
    await adminClient.from('app_errors').insert([{
      url: errorData.url,
      message: errorData.message,
      digest: errorData.digest || null,
    }]);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
