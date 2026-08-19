# Implementar Sección de Locales Adheridos

El objetivo es permitir a los clientes ver una lista de "Locales Adheridos", incluyendo el nombre del comercio, su logo y un botón para abrir su ubicación en Google Maps. Además, los dueños de los locales deben poder cargar estos datos desde su panel.

## User Review Required

> [!IMPORTANT]
> Esta actualización requiere un cambio en la base de datos de Supabase. Deberás ejecutar un pequeño comando SQL en el panel de Supabase para agregar la columna de Google Maps.

## Open Questions

> [!QUESTION]
> **Subida de Logos:** Para que los comercios pongan su logo, ¿preferís que peguen directamente un link a una imagen que ya esté en internet (más fácil de programar ahora mismo), o querés que tengan un botón para "Subir foto" desde su computadora/celular? (Esto último requiere configurar el "Storage" en Supabase). Por ahora en el plan puse que puedan pegar un link, pero confirmame qué preferís.

## Proposed Changes

### Cambios en Base de Datos (SQL)
Se deberá ejecutar el siguiente SQL en el panel de Supabase -> SQL Editor para añadir la nueva columna al perfil de los comercios:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS maps_url TEXT;
```
*(El perfil ya tiene una columna `avatar_url` que usaremos para el logo).*

### Types

#### [MODIFY] [types/index.ts](file:///C:/Users/loren/.gemini/antigravity/scratch/saas-beneficios-mvp/types/index.ts)
- Actualizar la interfaz `Profile` para incluir `maps_url: string | null;`.

### Panel del Dueño (Comercio)

#### [MODIFY] [components/dashboard/ProfileEditForm.tsx](file:///C:/Users/loren/.gemini/antigravity/scratch/saas-beneficios-mvp/components/dashboard/ProfileEditForm.tsx)
- Agregar un campo (input text) para que el dueño pueda cargar el "Link del Logo (URL)".
- Agregar un campo (input text) para que el dueño pueda cargar el "Link de Google Maps".
- Actualizar la función `updateProfile` para enviar estos nuevos campos a la base de datos.

### Panel del Cliente

#### [MODIFY] [app/client/qr/page.tsx](file:///C:/Users/loren/.gemini/antigravity/scratch/saas-beneficios-mvp/app/client/qr/page.tsx)
- Hacer una consulta a la tabla `profiles` para traer todos los usuarios con rol `merchant` que estén activos (`is_active = true`).
- Crear una nueva sección visual ("Locales Adheridos") encima o debajo de "Ofertas Disponibles".
- Mostrar los locales en tarjetas de cristal, incluyendo:
  - Imagen del logo (usando `avatar_url`).
  - Nombre del negocio (`business_name`).
  - Botón interactivo "Cómo llegar" que abra el `maps_url` en una nueva pestaña.

## Verification Plan

### Manual Verification
1. Ingresar al panel del dueño (`/dashboard/profile`).
2. Completar los campos de Logo y Google Maps y guardar.
3. Ingresar al panel del cliente (`/client/qr`).
4. Verificar que el local aparece en la sección "Locales Adheridos" con la foto y el enlace funcionando.
