# Google OAuth Setup for NutriGuide

## Overview
This document explains the Google OAuth integration implemented in the NutriGuide application.

## Components Added

### 1. Auth Provider Updates (`app/components/auth/auth-provider.tsx`)
- Added `signInWithGoogle()` method to the AuthContextType interface
- Implemented Google OAuth sign-in using Supabase's `signInWithOAuth` method
- Updated email verification logic to skip verification for OAuth users
- Redirect URL set to `/api/auth/callback` for handling OAuth responses

### 2. Google Login Button (`app/components/auth/google-login-button.tsx`)
- Standalone component for Google OAuth login
- Includes loading states and error handling
- Styled to match the application's design system
- Uses the Google logo SVG for branding

### 3. Auth Form Updates (`app/components/auth/auth-form.tsx`)
- Integrated Google login button at the top of the form
- Added visual divider between Google login and email/password form
- Maintains existing functionality for email/password authentication

### 4. OAuth Callback Handler (`app/api/auth/callback/route.ts`)
- Handles the OAuth callback from Supabase
- Automatically creates user records for new Google OAuth users
- Creates basic profile records for OAuth users
- Redirects to dashboard on successful authentication
- Handles errors and redirects to login with error messages

## Configuration Required

### Supabase Configuration
1. **Google OAuth Provider**: Already configured in your Supabase project
2. **Callback URL**: Set to `https://oskgxojtqczboxkfzogu.supabase.co/auth/v1/callback`
3. **Client ID and Secret**: Already configured in Supabase

### Environment Variables
The following environment variables are already configured:
```
NEXT_PUBLIC_SUPABASE_URL=https://oskgxojtqczboxkfzogu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## How It Works

### Authentication Flow
1. User clicks "Continuar con Google" button
2. Application calls `signInWithGoogle()` from auth provider
3. Supabase redirects user to Google OAuth consent screen
4. User authorizes the application
5. Google redirects back to Supabase callback URL
6. Supabase processes the OAuth response and redirects to `/api/auth/callback`
7. Callback handler checks if user exists in database
8. If new user, creates user and profile records automatically
9. User is redirected to dashboard

### User Creation for OAuth
When a new Google OAuth user signs in:
- User record is created with `email_verified: true`
- Name is extracted from Google profile (`full_name`, `name`, or email prefix)
- Role is set to 'patient' by default
- Basic profile record is created with empty arrays for goals, allergies, etc.

### Error Handling
- Network errors during OAuth initiation
- Database errors during user creation
- OAuth cancellation or denial
- Invalid OAuth responses

## Testing
1. Start the development server: `npm run dev`
2. Navigate to `/login` or `/register`
3. Click "Continuar con Google"
4. Complete Google OAuth flow
5. Verify user is created and redirected to dashboard

## Security Considerations
- OAuth users bypass email verification (Google handles verification)
- User data is automatically verified through Google's OAuth process
- Callback URL is secured through Supabase's OAuth implementation
- Service role key is used server-side for user creation

## Troubleshooting
- Ensure Google OAuth is enabled in Supabase Auth settings
- Verify callback URL matches Supabase configuration
- Check browser console for any JavaScript errors
- Monitor server logs for OAuth callback processing

## Flujo Actualizado

Con la configuración corregida y el nuevo onboarding:

1. Usuario hace clic en "Continuar con Google"
2. Supabase redirige a Google OAuth
3. Google redirige de vuelta a: `https://oskgxojtqczboxkfzogu.supabase.co/auth/v1/callback`
4. Supabase procesa la respuesta y redirige a: `/onboarding`
5. **NUEVO**: Usuario selecciona su rol (Paciente o Nutricionista)
6. **NUEVO**: Usuario completa el formulario correspondiente con su información
7. El sistema crea automáticamente el usuario y perfil en la base de datos
8. Usuario es redirigido al dashboard

## Páginas de Onboarding OAuth

### `/onboarding`
- **Selección de Rol**: Permite elegir entre Paciente o Nutricionista
- **Formularios Reutilizados**: Usa los mismos componentes que el registro normal
- **Campos Ocultos**: No muestra email/contraseña (ya autenticado con Google)
- **Datos Pre-poblados**: Nombre se llena automáticamente desde Google

### Formularios Adaptados
- **PatientForm**: Modo `oauth-onboarding` oculta email/password
- **NutritionistForm**: Modo `oauth-onboarding` oculta email/password
- **APIs Específicas**: 
  - `/api/user/create-oauth` para pacientes
  - `/api/user/create-oauth-nutritionist` para nutricionistas

## Ventajas del Nuevo Flujo

1. **Experiencia Consistente**: Mismos formularios para OAuth y registro normal
2. **Información Completa**: Los usuarios OAuth completan toda su información
3. **Flexibilidad de Rol**: Pueden elegir ser pacientes o nutricionistas
4. **Datos Completos**: Se crean perfiles completos desde el inicio 