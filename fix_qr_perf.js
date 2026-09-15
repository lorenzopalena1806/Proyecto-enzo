const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

const targetStr = `  // 1. Fetch active offers from active merchants
  const { data: offers } = await adminClient
    .from('merchant_offers')
    .select(\`
      *,
      merchant:profiles!inner (
        business_name,
        full_name,
        is_active
      )
    \`)
    .eq('is_active', true)
    .eq('merchant.is_active', true)
    .in('target_role', ['client', 'all'])
    .order('created_at', { ascending: false });

  // Filtrar ofertas por día válido y stock (stock logic usually handled here or in client, but let's do day filter)
  const argDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
  const todayString = argDate.getDay().toString();

  const activeOffers = (offers || []).filter((offer: any) => {
    // Si la oferta tiene un límite de stock y ya se agotó, no mostrarla (opcional, pero buena práctica)
    if (offer.stock_limit && offer.used_count >= offer.stock_limit) return false;
    
    // Si tiene días válidos configurados (array no vacío), debe incluir el día de hoy
    if (offer.valid_days && Array.isArray(offer.valid_days) && offer.valid_days.length > 0) {
      if (!offer.valid_days.includes(todayString)) return false;
    }
    
    return true;
  });

  // 2. Fetch this client's transaction history
  const { data: clientHistory } = await adminClient
    .from('discount_transactions')
    .select(\`
      *,
      scanner:profiles!scanner_id(business_name, full_name),
      offer:merchant_offers(title)
    \`)
    .eq('scanned_user_id', user.id)
    .order('applied_at', { ascending: false });

  // Calcular ahorro total histórico
  const totalSaved = (clientHistory || []).reduce((acc: number, tx: any) => {
    if (tx.status !== 'cancelled') {
      return acc + ((tx.original_amount || 0) - (tx.final_amount || 0));
    }
    return acc;
  }, 0);

  // 3. Fetch Locales Adheridos (active merchants)
  const { data: merchantsData } = await adminClient
    .from('profiles')
    .select('id, business_name, avatar_url, maps_url, category, is_featured, address, latitude, longitude, plan_type, created_at')
    .eq('role', 'merchant')
    .eq('is_active', true);
    
  // Sort: PRO first, then featured, then created_at
  const merchants = (merchantsData || []).sort((a, b) => {
    if (a.plan_type === 'pro' && b.plan_type !== 'pro') return -1;
    if (a.plan_type !== 'pro' && b.plan_type === 'pro') return 1;
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 4. Fetch Favorites for current user
  const { data: favoritesData } = await adminClient
    .from('favorites')
    .select('merchant_id')
    .eq('client_id', user.id);`;


const replacementStr = `  // 1-4. Fetch todo en paralelo para máxima performance
  const [
    { data: offers },
    { data: clientHistory },
    { data: merchantsData },
    { data: favoritesData }
  ] = await Promise.all([
    adminClient
      .from('merchant_offers')
      .select(\`
        *,
        merchant:profiles!inner (
          business_name,
          full_name,
          is_active
        )
      \`)
      .eq('is_active', true)
      .eq('merchant.is_active', true)
      .in('target_role', ['client', 'all'])
      .order('created_at', { ascending: false }),
      
    adminClient
      .from('discount_transactions')
      .select(\`
        *,
        scanner:profiles!scanner_id(business_name, full_name),
        offer:merchant_offers(title)
      \`)
      .eq('scanned_user_id', user.id)
      .order('applied_at', { ascending: false }),
      
    adminClient
      .from('profiles')
      .select('id, business_name, avatar_url, maps_url, category, is_featured, address, latitude, longitude, plan_type, created_at')
      .eq('role', 'merchant')
      .eq('is_active', true),
      
    adminClient
      .from('favorites')
      .select('merchant_id')
      .eq('client_id', user.id)
  ]);

  // Filtrar ofertas por día válido y stock
  const argDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
  const todayString = argDate.getDay().toString();

  const activeOffers = (offers || []).filter((offer: any) => {
    if (offer.stock_limit && offer.used_count >= offer.stock_limit) return false;
    if (offer.valid_days && Array.isArray(offer.valid_days) && offer.valid_days.length > 0) {
      if (!offer.valid_days.includes(todayString)) return false;
    }
    return true;
  });

  // Calcular ahorro total histórico
  const totalSaved = (clientHistory || []).reduce((acc: number, tx: any) => {
    if (tx.status !== 'cancelled') {
      return acc + ((tx.original_amount || 0) - (tx.final_amount || 0));
    }
    return acc;
  }, 0);

  // Sort: PRO first, then featured, then created_at
  const merchants = (merchantsData || []).sort((a, b) => {
    if (a.plan_type === 'pro' && b.plan_type !== 'pro') return -1;
    if (a.plan_type !== 'pro' && b.plan_type === 'pro') return 1;
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Fixed qr page parallelism');
