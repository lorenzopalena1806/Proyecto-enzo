'use server';

export async function extractCoordinatesFromMapsUrl(url: string) {
  try {
    if (!url) return { success: false, error: 'URL vacía' };
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Intento 1: Leer el header Location directamente sin seguir redirecciones
    let finalUrl = url;
    try {
      const resManual = await fetch(url, { redirect: 'manual' });
      if (resManual.status >= 300 && resManual.status < 400) {
        const loc = resManual.headers.get('location');
        if (loc) finalUrl = loc;
      }
    } catch (e) {
      // Ignorar error y seguir
    }

    // Intento 2: Si aún no tenemos coordenadas en la URL, seguimos la redirección completa
    let res: Response | null = null;
    if (!finalUrl.includes('@') && !finalUrl.includes('%2C')) {
      res = await fetch(finalUrl, { 
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7',
        }
      });
      finalUrl = decodeURIComponent(res.url);
    } else {
      finalUrl = decodeURIComponent(finalUrl);
    }

    // Bypass consent page if present
    if (finalUrl.includes('consent.google.com') && finalUrl.includes('continue=')) {
      const matchContinue = finalUrl.match(/continue=([^&]+)/);
      if (matchContinue) {
        finalUrl = decodeURIComponent(matchContinue[1]);
      }
    }

    const checkCoords = (lat: number, lng: number) => {
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    };
    
    // Patrón 1: Formato @latitud,longitud
    const matchAt = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (matchAt) {
      const lat = parseFloat(matchAt[1]);
      const lng = parseFloat(matchAt[2]);
      if (checkCoords(lat, lng)) return { success: true, lat, lng };
    }
    
    // Patrón 2: Formato /search/-31.351783,+-64.336169 o /search/-31.351783,-64.336169
    const matchSearch = finalUrl.match(/\/search\/(-?\d+\.\d+),?\+?(-?\d+\.\d+)/);
    if (matchSearch) {
      const lat = parseFloat(matchSearch[1]);
      const lng = parseFloat(matchSearch[2]);
      if (checkCoords(lat, lng)) return { success: true, lat, lng };
    }

    // Patrón 3: Cualquier combinación de lat,lng en la URL final (ej: -31.351783, -64.336169)
    const matchGeneric = finalUrl.match(/(-?\d{1,2}\.\d+),\s*\+?(-?\d{1,3}\.\d+)/);
    if (matchGeneric) {
      const lat = parseFloat(matchGeneric[1]);
      const lng = parseFloat(matchGeneric[2]);
      if (checkCoords(lat, lng)) return { success: true, lat, lng };
    }
    
    // Patrón 4: Parámetros ll o q
    try {
      const urlObj = new URL(finalUrl);
      const ll = urlObj.searchParams.get('ll') || urlObj.searchParams.get('q');
      if (ll) {
        const parts = ll.split(',');
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (checkCoords(lat, lng)) return { success: true, lat, lng };
        }
      }
    } catch (e) {
      // Ignorar error de parsing de URL
    }

    // Patrón 5: Buscar dentro del HTML retornado (meta tags o links de google maps static API)
    if (res) {
      const html = await res.text();
      const htmlMatch = html.match(/center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/i) || 
                        html.match(/q=(-?\d+\.\d+)%2C(-?\d+\.\d+)/i) ||
                        html.match(/!1s(-?\d+\.\d+)%2C\+?(-?\d+\.\d+)/i) ||
                        html.match(/!1s(-?\d+\.\d+),(-?\d+\.\d+)/i);
      if (htmlMatch) {
        const lat = parseFloat(htmlMatch[1]);
        const lng = parseFloat(htmlMatch[2]);
        if (checkCoords(lat, lng)) return { success: true, lat, lng };
      }
    }

    return { success: false, error: 'No se encontraron coordenadas exactas en este enlace.' };
  } catch (error: any) {
    console.error('Error extracting coordinates:', error);
    return { success: false, error: 'Ocurrió un error al intentar leer el enlace.' };
  }
}

