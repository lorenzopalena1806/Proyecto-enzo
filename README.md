# RedBeneficios MVP

Plataforma SaaS B2B de beneficios y descuentos para comerciantes locales.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS v4
- **Auth + DB**: Supabase (PostgreSQL + Auth + Storage)
- **QR Generation**: `qrcode.react`
- **QR Scanner**: `html5-qrcode`

## Configuración inicial

### 1. Clonar y instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

### 3. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el archivo `supabase/schema.sql`
3. Ir a **Storage** y crear el bucket `marketing-assets` (público)
4. Copiar la **URL** y **Anon Key** del proyecto a `.env.local`

### 4. Crear el primer SuperAdmin

1. Registrar un usuario desde `/auth/register`
2. Ir a Supabase SQL Editor y ejecutar:

```sql
UPDATE public.profiles
SET role = 'superadmin'
WHERE id = 'UUID_DEL_USUARIO';
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## Estructura del proyecto

```
/app
  /auth/login        → Página de login
  /auth/register     → Registro con selector de rol
  /dashboard         → Panel del Comerciante (protegido)
    /qr              → Ver y descargar QR propio
    /scanner         → Escáner + lógica de descuentos
    /marketing       → Galería de material de marketing
  /admin             → Panel del SuperAdmin (pendiente)
  /client/qr         → Vista QR del cliente
  /page.tsx          → Landing Page pública

/lib
  discount-logic.ts  → Algoritmo de descuentos (días/roles/métodos)
  qr-utils.ts        → Codificación/decodificación de QR tokens
  supabase.ts        → Cliente Supabase (browser)
  supabase-server.ts → Cliente Supabase (server)

/supabase
  schema.sql         → Schema completo de la base de datos
```

---

## Lógica de Descuentos

| QR Escaneado | Pago | Día | Descuento |
|---|---|---|---|
| Cliente | Transferencia | Lun–Jue | **10%** |
| Cliente | Efectivo | Lun–Jue | **15%** |
| Comerciante | Efectivo | Lun–Jue | **25% (B2B)** |
| Cualquiera | Tarjeta | — | ❌ No aplica |
| Cualquiera | — | Vie–Dom | ❌ No aplica |

---

## Próximos pasos

- [ ] Panel SuperAdmin completo (gestión de comerciantes + upload de assets)
- [ ] Vista del Cliente (solo ver su QR)
- [ ] Notificaciones por email al activar/desactivar suscripción
- [ ] Dashboard de analytics para SuperAdmin
- [ ] Tests unitarios para `discount-logic.ts`
- [ ] Deploy en Vercel
