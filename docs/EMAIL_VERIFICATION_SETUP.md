# Email Verification Setup Guide

This guide will help you configure email verification for your NutriGuide application using Supabase.

## 🔧 Supabase Configuration

### 1. Enable Email Confirmation

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **User Signups**, ensure:
   - ✅ **Enable email confirmations** is turned ON
   - ✅ **Enable email change confirmations** is turned ON (optional but recommended)

### 2. Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the **Confirm signup** template:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>If you didn't sign up for NutriGuide, you can safely ignore this email.</p>
```

3. Update the **Confirm signup** settings:
   - **Subject**: "Confirma tu registro en NutriGuide"
   - **Redirect URL**: `https://yourdomain.com/verify-email`

### 3. Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set your **Site URL**: `https://yourdomain.com` (or `http://localhost:3000` for development)
3. Add **Redirect URLs**:
   - `https://yourdomain.com/verify-email`
   - `https://yourdomain.com/check-email`
   - `http://localhost:3000/verify-email` (for development)
   - `http://localhost:3000/check-email` (for development)

### 4. Email Provider Setup

#### Option A: Use Supabase's Built-in Email (Development)
- For development and testing, Supabase provides a built-in email service
- Limited to 30 emails per hour
- Emails may go to spam folder

#### Option B: Configure Custom SMTP (Recommended for Production)

1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Configure your SMTP provider (recommended: SendGrid, Mailgun, or AWS SES):

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your-sendgrid-api-key
Sender Email: noreply@yourdomain.com
Sender Name: NutriGuide
```

## 🚀 Implementation Features

The email verification system includes:

### ✅ What's Implemented

1. **Modified Registration Flow**:
   - Users no longer get automatically signed in after registration
   - Instead, they're redirected to a "check email" page

2. **Email Verification Pages**:
   - `/check-email` - Informs users to check their email
   - `/verify-email` - Handles the email confirmation process

3. **Middleware Protection**:
   - Automatically redirects unverified users from protected routes
   - Redirects verified users away from auth pages

4. **Enhanced Auth Provider**:
   - Checks email verification status before loading user data
   - Provides clear error messages for unverified users

5. **Resend Functionality**:
   - Users can resend verification emails if needed
   - Built-in rate limiting and error handling

### 🔄 User Flow

1. **Registration**:
   ```
   User fills form → API creates account → Redirect to /check-email
   ```

2. **Email Verification**:
   ```
   User clicks email link → /verify-email processes → Redirect to dashboard
   ```

3. **Login with Unverified Email**:
   ```
   User tries to login → Error message → Link to /check-email
   ```

4. **Accessing Protected Routes**:
   ```
   Unverified user → Automatic redirect to /check-email
   ```

## 🛠️ Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🧪 Testing the Implementation

### 1. Test Registration Flow
1. Go to `/register`
2. Fill out the form with a real email address
3. Submit the form
4. Verify you're redirected to `/check-email`
5. Check your email for the verification link

### 2. Test Email Verification
1. Click the verification link in your email
2. Verify you're redirected to `/verify-email`
3. Confirm successful verification message
4. Verify automatic redirect to dashboard

### 3. Test Unverified User Protection
1. Register a new account but don't verify email
2. Try to access `/dashboard` directly
3. Verify you're redirected to `/check-email`

### 4. Test Login with Unverified Email
1. Try to login with an unverified account
2. Verify you get an appropriate error message
3. Verify the "Check your email" link works

## 🔧 Troubleshooting

### Common Issues

1. **Emails going to spam**:
   - Configure a custom SMTP provider
   - Add SPF, DKIM, and DMARC records to your domain

2. **Verification links not working**:
   - Check your redirect URLs in Supabase dashboard
   - Ensure the Site URL is correctly configured

3. **Users can't resend verification emails**:
   - Check rate limiting in Supabase
   - Verify the resend API is working correctly

4. **Middleware not redirecting properly**:
   - Check the middleware configuration
   - Verify protected routes are correctly defined

### Debug Tools

1. **Check user verification status**:
   ```
   GET /api/debug/auth?email=user@example.com
   ```

2. **Check Supabase logs**:
   - Go to Supabase Dashboard → Logs
   - Filter by authentication events

3. **Browser console**:
   - Check for console errors during verification process
   - Monitor network requests for failed API calls

## 📧 Email Template Customization

You can customize the email templates in Supabase to match your brand:

1. **HTML Template**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background-color: #f8f4f0; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #ff6b6b; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NutriGuide</h1>
        </div>
        <div class="content">
            <h2>¡Bienvenido a NutriGuide!</h2>
            <p>Gracias por registrarte. Para completar tu registro, necesitas verificar tu dirección de email.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="button">Verificar Email</a>
            </p>
            <p>Si no te registraste en NutriGuide, puedes ignorar este email de forma segura.</p>
            <p>Este enlace expirará en 24 horas por tu seguridad.</p>
        </div>
    </div>
</body>
</html>
```

## 🚀 Production Deployment

Before deploying to production:

1. ✅ Configure custom SMTP provider
2. ✅ Set up proper domain and DNS records
3. ✅ Update Site URL and Redirect URLs
4. ✅ Test email delivery thoroughly
5. ✅ Monitor email delivery rates
6. ✅ Set up email analytics (optional)

## 📈 Monitoring and Analytics

Consider implementing:

1. **Email delivery tracking**
2. **Verification completion rates**
3. **Bounce and spam rates**
4. **User drop-off points in verification flow**

This implementation provides a robust, secure, and user-friendly email verification system that enhances your application's security and user trust. 