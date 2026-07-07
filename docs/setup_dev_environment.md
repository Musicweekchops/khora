# Guía Paso a Paso: Configuración del Entorno de Desarrollo (Dev) en la Nube
### Proyecto: Khora AI Sales Agent

Esta guía detalla los pasos prácticos para configurar un entorno de desarrollo (`dev`) aislado y seguro en la nube, utilizando **GitHub**, **Supabase Cloud**, **Render**, **Meta Developer Portal (WhatsApp Sandbox)** y **Mercado Pago Sandbox**.

---

## Paso 1: Configurar la Rama de Git (`dev`)
1. Abre tu terminal en la carpeta del proyecto local.
2. Crea una nueva rama local llamada `dev` a partir de tu rama principal:
   ```bash
   git checkout -b dev
   ```
3. Sube la nueva rama a tu repositorio de GitHub:
   ```bash
   git push -u origin dev
   ```

---

## Paso 2: Crear el Proyecto de Desarrollo en Supabase
1. Ve a [Supabase Cloud Dashboard](https://supabase.com/) e inicia sesión.
2. Haz clic en **New Project** y configúralo:
   * **Name:** `khora-dev`
   * **Database Password:** *(Genera y guarda una contraseña segura)*
   * **Region:** Selecciona la misma región de tu producción.
3. Espera a que se aprovisione la base de datos (toma de 1 a 2 minutos).
4. Copia las credenciales desde **Project Settings -> API**:
   * **Project Ref** (Ejemplo: `abcde12345`)
   * **Project URL**
   * **API Key (anon/public)**

---

## Paso 3: Inicializar la Estructura de Base de Datos
1. En tu panel del proyecto `khora-dev` en Supabase, ve al menú lateral y entra en **SQL Editor**.
2. Haz clic en **New query** (Nueva consulta).
3. Abre el archivo local [init_khora_v2.sql](file:///Users/arnaldoallende/Documents/GitHub/khora/init_khora_v2.sql), copia todo su contenido, pégalo en el editor de SQL web y haz clic en **Run**.
4. Verifica que las tablas (`StudentProfile`, `TeacherProfile`, `Booking`, `Class`, etc.) se hayan creado exitosamente en el menú **Table Editor**.

---

## Paso 4: Vincular Supabase CLI y Desplegar Edge Functions
1. Desde tu terminal local, inicia sesión en Supabase CLI si no lo has hecho:
   ```bash
   npx supabase login
   ```
2. Vincula tu código local al nuevo proyecto de desarrollo usando la **Project Ref** que copiaste en el Paso 2:
   ```bash
   npx supabase link --project-ref tu_project_ref_dev
   ```
3. Despliega todas las Edge Functions locales al nuevo proyecto de desarrollo:
   ```bash
   npx supabase functions deploy
   ```
4. **Configurar Variables de Entorno (Secretos) de Desarrollo:**
   Ve a **Settings -> Edge Functions** en el dashboard de Supabase `khora-dev` y agrega:
   * `MERCADOPAGO_ACCESS_TOKEN` = *(Tu access token del modo Sandbox de Mercado Pago)*
   * `RESEND_API_KEY` = *(Tu clave de correo de pruebas o de desarrollo)*
   * `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` *(Se inyectan automáticamente, pero verifica que existan)*

---

## Paso 5: Configurar el Sandbox de WhatsApp en Meta
1. Inicia sesión en el portal de [Meta for Developers](https://developers.facebook.com/).
2. Haz clic en **Crear App** -> Selecciona el tipo **Negocios (Business)** -> Ponle el nombre `Khora Dev Bot`.
3. En el panel de control de la app, busca el producto **WhatsApp** y agrégalo.
4. En el panel de WhatsApp, ve a **Configuración de la API**:
   * Meta te asignará un **Número de teléfono de prueba** y un token temporal.
   * Agrega tu número de teléfono celular personal en la sección de "Teléfonos destinatarios autorizados" para poder recibir mensajes del Sandbox.
5. Ve a **Configuración de Webhooks**:
   * Haz clic en **Editar**.
   * **Callback URL:** Ingresa la URL de la Edge Function de tu Supabase de desarrollo:
     `https://tu_project_ref_dev.supabase.co/functions/v1/whatsapp-webhook`
   * **Verify Token:** Crea una frase segura temporal (por ejemplo: `khora_dev_token_2026`) e ingresa la misma clave en las variables de entorno de tu Supabase.
   * Haz clic en **Verificar y Guardar**.
   * En el listado de campos del webhook, busca **messages** y haz clic en **Suscribirse**.

---

## Paso 6: Desplegar el Frontend en Render (Entorno `dev`)
1. Ve al dashboard de [Render](https://dashboard.render.com/).
2. Haz clic en **New** -> **Static Site**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio de Khora.
4. Configura el despliegue de desarrollo:
   * **Name:** `khora-dev`
   * **Branch:** Selecciona la rama **`dev`** (¡Muy importante!).
   * **Build Command:** `npm install && npm run build`
   * **Publish Directory:** `out`
5. En la pestaña **Environment**, agrega las siguientes variables de entorno:
   * `NEXT_PUBLIC_SUPABASE_URL` = *(URL de tu Supabase de desarrollo)*
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *(Clave anon de tu Supabase de desarrollo)*
6. Haz clic en **Create Static Site**.
7. Una vez completado el despliegue, copia la URL pública de desarrollo provista por Render (ej. `khora-dev.onrender.com`).

---

## Paso 7: Configurar Webhook de Mercado Pago Sandbox
1. Inicia sesión en el panel de [Mercado Pago Developers](https://www.mercadopago.cl/developers).
2. Ve a tus aplicaciones y selecciona la aplicación de desarrollo.
3. Ve a **Notificaciones IPN / Webhooks**.
4. Configura la URL del webhook de pagos apuntando a tu Supabase Dev:
   `https://tu_project_ref_dev.supabase.co/functions/v1/mercadopago-webhook`
5. Marca el evento **Pagos (payments)** para recibir alertas cuando se complete una transacción de prueba.

---

¡Listo! Con estos 7 pasos completados, tienes un entorno `dev` 100% independiente en la nube. Todo cambio que subas a la rama `dev` de Git se desplegará en tu sitio de pruebas de Render y podrás realizar pruebas completas de cobro y conversación con la IA de forma segura.
