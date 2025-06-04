# Authentication Debugging Guide

## Issues Fixed

1. **Infinite Loading**: Added proper error handling and loading state management in the `useAuth` hook
2. **Missing Error Feedback**: Users now get clear error messages when authentication fails
3. **Data Inconsistency**: Added checks for users who exist in Supabase Auth but not in the custom users table
4. **Silent Failures**: Added comprehensive logging to help identify issues

## How to Debug User Login Issues

### 1. Check Browser Console
Open the browser developer tools and look for console logs when trying to log in. You should see:
- "Loading user data for: [user-id]"
- "User data loaded: [user-object]" 
- Any error messages

### 2. Use the Debug API Endpoint
Visit: `http://localhost:3000/api/debug/auth?email=user@example.com`

This will show you:
- Whether the user exists in Supabase Auth
- Whether the user exists in your custom users table
- Whether the user has a profile
- A diagnosis of any data inconsistencies

### 3. Common Issues and Solutions

#### Issue: "User data not found"
**Cause**: User exists in Supabase Auth but not in the custom users table
**Solution**: This usually happens when registration failed partway through. The user should try registering again, or you can manually create the user record in the database.

#### Issue: Infinite loading with no error
**Cause**: Database connection issues or query failures
**Solution**: Check the browser console for error logs and verify your Supabase configuration.

#### Issue: "Session error" 
**Cause**: Supabase configuration issues
**Solution**: Verify your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Manual Database Fixes

If you find users who exist in auth but not in the users table, you can manually fix them:

```sql
-- Insert missing user record
INSERT INTO users (id, email, name, role, created_at, updated_at)
VALUES (
  'auth-user-id-here',
  'user@example.com', 
  'User Name',
  'patient', -- or 'nutritionist'
  NOW(),
  NOW()
);

-- Create basic profile
INSERT INTO profiles (user_id, created_at, updated_at)
VALUES ('auth-user-id-here', NOW(), NOW());
```

### 5. Environment Variables Check

Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing the Fixes

1. Try logging in with an existing account
2. Check the browser console for any error messages
3. If login fails, use the debug endpoint to check the user's data consistency
4. Try creating a new account to ensure registration works properly

The authentication system should now provide clear feedback instead of infinite loading, making it much easier to identify and resolve any remaining issues. 