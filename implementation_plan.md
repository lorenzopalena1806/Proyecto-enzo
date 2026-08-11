# Rediseño del Flujo de Cobro (Estilo MercadoPago)

El objetivo es cambiar la responsabilidad del escaneo: ahora el **Comerciante generará el cobro (QR)** y el **Cliente será quien escanee**, o en su defecto, el cliente le dictará un **Código Corto** al comerciante.

## Open Questions

> [!IMPORTANT]
> **Pregunta sobre el "código corto":**
> Cuando decís *"o sino puede escanear que le diga como un codigo"*, ¿te referís a que el **Cliente** tenga un número de 6 dígitos fijo en su pantalla (ej: `142-592`) y se lo dicte al Comerciante para que el Comerciante lo tipee y le aplique el descuento directamente? 
> *Asumiré que sí en este plan, ya que es el método más rápido y estándar en apps de beneficios físicos.*

## Proposed Changes

El flujo quedará de la siguiente manera:

### 1. El Panel del Comerciante (Generar Cobro)
El comerciante ya no usará su cámara. En su lugar:
- Ingresa el monto (ej: $10.000) y el método de pago.
- El sistema le genera un **Código QR gigante en la pantalla**.
- La pantalla se queda "escuchando" en tiempo real.
- **Opción B (Código manual):** En la misma pantalla, el comerciante tendrá un campo para tipear el código de 6 dígitos del cliente si este no tiene batería o no puede escanear el QR. Al ingresarlo, el cobro se procesa al instante.

### 2. El Panel del Cliente
- El cliente entrará a su app y verá su **Código de Cliente (6 dígitos)** bien grande (ej: `839-214`).
- También tendrá un botón grande que diga "Escanear QR de un local" (o directamente puede usar la cámara nativa de su celular sin entrar a la app).

### 3. La Confirmación del Cliente (Si escanea el QR)
- El cliente escanea el QR del local con la cámara de su celular.
- Se le abre una pantalla en su celular que dice: *"El local Pepis te está cobrando $10.000. Tu descuento es del 15%. Total a pagar: $8.500"*.
- El cliente presiona **"Confirmar"**.
- Mágicamente y al instante, la pantalla del Comerciante se pone en verde diciendo "¡Cobro Exitoso!".

---

### Cambios técnicos requeridos:
#### [MODIFY] Base de datos
- Se agregará un campo `short_code` (código de 6 dígitos) a los usuarios para que puedan dictarlo.
- Necesitaré proporcionarte un script SQL para que ejecutes en tu panel de Supabase y crees la tabla `payment_intents` (intenciones de cobro) que permitirá conectar la pantalla del comercio con el celular del cliente en tiempo real.

#### [MODIFY] app/dashboard/scanner/page.tsx -> app/dashboard/charge/page.tsx
- Eliminar la librería de la cámara.
- Crear la interfaz de "Generador de QR de cobro" y el input para "Código manual".
- Agregar Supabase Realtime para que la pantalla del comerciante reaccione cuando el cliente confirma desde su celular.

#### [MODIFY] app/client/qr/page.tsx
- Mostrar el código de 6 dígitos de forma visible.

#### [NEW] app/pay/[intent_id]/page.tsx
- La pantalla pública (protegida por login) donde el cliente ve el resumen del descuento y presiona "Confirmar".

## Verification Plan
1. Ejecutar las migraciones SQL en Supabase.
2. Ingresar como Comerciante, generar un cobro de $10.000.
3. Ingresar como Cliente desde otro navegador, escanear el QR generado (o tipear el enlace), confirmar el pago, y verificar que la pantalla del comerciante se actualiza a "Éxito" automáticamente.
4. Probar el flujo alternativo: el comerciante tipea el código de 6 dígitos del cliente y el cobro se procesa instantáneamente.
