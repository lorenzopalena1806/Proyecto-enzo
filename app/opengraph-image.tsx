import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Lazoo — Red de Descuentos para Comercios';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'radial-gradient(circle at top, #0f1f4a 0%, #060d1f 50%, #000510 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            filter: 'blur(100px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '40px',
            padding: '60px 80px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo Title */}
          <div
            style={{
              fontSize: '84px',
              fontWeight: '900',
              letterSpacing: '4px',
              background: 'linear-gradient(to right, #818cf8, #38bdf8)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '20px',
            }}
          >
            Lazoo
          </div>

          <div
            style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#94a3b8',
              textAlign: 'center',
              maxWidth: '600px',
              lineHeight: '1.4',
            }}
          >
            Conectando comercios locales con una red inteligente de beneficios y descuentos por QR
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
