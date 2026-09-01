import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const errorData = await req.json();
    
    console.error('🚨 [LAZOO SUPERADMIN ALERT] APP ERROR REPORT 🚨');
    console.error(`Time: ${new Date().toISOString()}`);
    console.error(`URL: ${errorData.url}`);
    console.error(`Message: ${errorData.message}`);
    if (errorData.digest) console.error(`Digest: ${errorData.digest}`);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
