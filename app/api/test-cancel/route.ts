import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  const url = new URL(request.url);
  const subId = url.searchParams.get('id');
  
  if (!subId) return NextResponse.json({ error: 'Missing id' });

  try {
    const res = await fetch(\https://api.mercadopago.com/preapproval/\\, {
      method: 'PUT',
      headers: {
        'Authorization': \Bearer \\,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelled' })
    });
    const data = await res.json();
    return NextResponse.json({ status: res.status, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
