import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data: errorTest, error } = await adminClient.from('discount_transactions').insert({
    scanner_id: '123e4567-e89b-12d3-a456-426614174000', // Need real UUIDs to test FK constraints
    scanned_user_id: '123e4567-e89b-12d3-a456-426614174000',
    original_amount: 100,
    discount_pct: 10,
    final_amount: 90,
    payment_method: 'cash',
    qr_token_used: 'abc',
  });
  console.log("Error object:", JSON.stringify(error, null, 2));
}

testInsert();
