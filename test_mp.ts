import * as fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf-8');
let MP_TOKEN = '';
env.split('\n').forEach(line => {
  if (line.startsWith('MP_ACCESS_TOKEN=')) {
    MP_TOKEN = line.split('=')[1].trim();
  }
});

async function run() {
  const payload = {
    reason: 'Lazoo Plan PRO',
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: 80000,
      currency_id: 'ARS'
    },
    back_url: 'https://lazoo.com.ar/dashboard',
    payer_email: 'comercio-adc3af80@lazoo.com.ar',
    external_reference: 'adc3af80-e599-4c74-ad67-11388572d9bd'
  };
  
  const response = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      'Authorization': \Bearer \\,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  console.log(data);
}
run();
