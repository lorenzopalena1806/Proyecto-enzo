const fs = require('fs');
let code = fs.readFileSync('app/api/log/route.ts', 'utf8');

const replacement = `
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// Basic in-memory rate limiting (won't persist across serverless instances, but offers basic flood protection)
const rateLimit = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const lastRequest = rateLimit.get(ip);
    
    // Max 1 log per second per IP
    if (lastRequest && now - lastRequest < 1000) {
      return NextResponse.json({ success: false, reason: 'Too many requests' }, { status: 429 });
    }
    rateLimit.set(ip, now);

    // Limit payload size to avoid memory exhaustion attacks
    const text = await req.text();
    if (text.length > 5000) {
      return NextResponse.json({ success: false, reason: 'Payload too large' }, { status: 413 });
    }
    
    const errorData = JSON.parse(text);
    
    // Basic schema validation
    if (!errorData || typeof errorData.message !== 'string') {
       return NextResponse.json({ success: false, reason: 'Invalid payload' }, { status: 400 });
    }
    
    console.error('🔥 [LAZOO SUPERADMIN ALERT] APP ERROR REPORT 🔥');
    console.error(\`URL: \${errorData.url}\`);
    console.error(\`Message: \${errorData.message}\`);
    
    // Insert into Supabase app_errors table
    const adminClient = createAdminClient();
    await adminClient.from('app_errors').insert([{
      url: (errorData.url || '').substring(0, 500),
      message: errorData.message.substring(0, 2000),
      digest: (errorData.digest || '').substring(0, 100),
    }]);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
`;

fs.writeFileSync('app/api/log/route.ts', replacement.trim() + '\n');
console.log('Fixed log route');
