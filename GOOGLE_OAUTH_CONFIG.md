# Configuración de Google OAuth - Solución para redirect_uri_mismatch

## Problema
Error 400: `redirect_uri_mismatch` - La URL de redirección no coincide entre Google Cloud Console y Supabase.

## Solución

### 1. Configuración en Google Cloud Console

Ve a [Google Cloud Console](https://console.cloud.google.com/) y sigue estos pasos:

1. **Selecciona tu proyecto** o crea uno nuevo
2. **Habilita la Google+ API**:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google+ API" y habilítala
3. **Configura OAuth 2.0**:
   - Ve a "APIs & Services" > "Credentials"
   - Crea credenciales > "OAuth 2.0 Client ID"
   - Tipo de aplicación: "Web application"

### 2. URLs de Redirección Autorizadas

En Google Cloud Console, en la configuración de tu OAuth Client ID, agrega estas URLs en "Authorized redirect URIs":

```
https://oskgxojtqczboxkfzogu.supabase.co/auth/v1/callback
```

**IMPORTANTE**: Esta debe ser exactamente la URL que tienes configurada en Supabase.

### 3. Configuración en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a "Authentication" > "Providers"
3. Habilita "Google"
4. Configura:
   - **Client ID**: El Client ID de Google Cloud Console
   - **Client Secret**: El Client Secret de Google Cloud Console
   - **Redirect URL**: `https://oskgxojtqczboxkfzogu.supabase.co/auth/v1/callback`

### 4. Verificación de URLs

Asegúrate de que estas URLs coincidan exactamente:

**En Google Cloud Console:**
```
Authorized redirect URIs: https://oskgxojtqczboxkfzogu.supabase.co/auth/v1/callback
```

**En Supabase:**
```
Redirect URL: https://oskgxojtqczboxkfzogu.supabase.co/auth/v1/callback
```

### 5. Configuración de Dominio (Opcional)

Si quieres restringir el acceso, en Google Cloud Console también puedes configurar:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://tu-dominio-de-produccion.com
```

## Flujo Actualizado

Con la configuración corregida:

1. Usuario hace clic en "Continuar con Google"
2. Supabase redirige a Google OAuth
3. Google redirige de vuelta a: `https://oskgxojtqczboxkfzogu.supabase.co/auth/v1/callback`
4. Supabase procesa la respuesta y redirige a: `/dashboard`
5. El AuthProvider detecta el nuevo usuario OAuth y lo crea automáticamente

## Testing

1. Guarda los cambios en Google Cloud Console
2. Verifica la configuración en Supabase
3. Reinicia el servidor de desarrollo: `npm run dev`
4. Prueba el login con Google en: `http://localhost:3000/login`

## Notas Importantes

- Los cambios en Google Cloud Console pueden tardar unos minutos en propagarse
- Asegúrate de que el proyecto de Google Cloud Console sea el correcto
- La URL de callback debe ser exactamente la misma en ambos lugares
- No uses URLs locales (localhost) en producción

# Google OAuth Configuration for NutriGuide

## Current Setup
- **Client ID**: Configured in Supabase
- **Client Secret**: Configured in Supabase  
- **Callback URL**: `https://oskgxojtqczboxkfzogu.supabase.co/auth/v1/callback`

## OAuth Flow
1. User clicks "Continuar con Google"
2. Redirects to Google OAuth
3. User authorizes → Google redirects to Supabase callback
4. Supabase processes → redirects to `/onboarding`
5. User completes profile → redirects to `/dashboard`

## ✨ Personalizing the OAuth Experience

### Changing the App Name (Removes "oskgxojtqczboxkfzogu.supabase.co")

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Consent Screen**:
   - Go to **APIs & Services** → **OAuth consent screen**

3. **Update App Information**:
   - **App name**: Change to "NutriGuide" (instead of default)
   - **User support email**: Your support email
   - **App logo**: Upload NutriGuide logo (120x120px, JPG/PNG)
   - **App domain**: Add your domain if you have one

4. **Save Changes**:
   - Click **Save and Continue**
   - Changes take 5 minutes to a few hours to take effect

### Result
Instead of: "Iniciar sesión en oskgxojtqczboxkfzogu.supabase.co"
Users will see: "Iniciar sesión en NutriGuide"

## Important Notes
- Changes can take up to a few hours to propagate
- For production apps, you may need app verification
- Test in incognito mode to see changes faster 