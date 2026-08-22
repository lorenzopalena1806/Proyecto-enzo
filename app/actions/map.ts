'use server';

export async function extractCoordinatesFromMapsUrl(url: string) {
  try {
    if (!url) return { success: false, error: 'URL vacía' };
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Usamos fetch en el servidor para seguir las redirecciones automáticamente.
    // Los enlaces cortos de Google Maps (maps.app.goo.gl) hacen una redirección 302 a la URL completa.
    const res = await fetch(url, { 
      redirect: 'follow',
      headers: {
        // Añadimos un user agent común por si google bloquea peticiones de bots
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const finalUrl = res.url;
    
    // Google Maps suele poner las coordenadas en el formato @latitud,longitud
    const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      // Chequeo de validez de lat/lng
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { success: true, lat, lng };
      }
    }
    
    // Fallback: A veces viene en un parámetro 'll=' o 'q='
    const searchParams = new URL(finalUrl).searchParams;
    const ll = searchParams.get('ll') || searchParams.get('q');
    if (ll) {
      const parts = ll.split(',');
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { success: true, lat, lng };
        }
      }
    }

    return { success: false, error: 'No se encontraron coordenadas exactas en este enlace.' };
  } catch (error: any) {
    console.error('Error extracting coordinates:', error);
    return { success: false, error: 'Ocurrió un error al intentar leer el enlace.' };
  }
}
