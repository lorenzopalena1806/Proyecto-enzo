// Simple In-Memory Rate Limiter para Server Actions
// Nota: En Vercel Serverless (producción), las variables globales se resetean 
// cuando el entorno muere, pero es útil para evitar ataques por ráfaga (burst).

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count += 1;
  return { success: true };
}
