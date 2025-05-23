# Migration from Neon + Prisma to Supabase

This document outlines the migration process from Neon database with Prisma ORM to Supabase.

## Completed Steps

✅ **1. Installed Supabase dependencies**
- Added `@supabase/supabase-js`, `@supabase/ssr`, `@supabase/auth-ui-react`, `@supabase/auth-ui-shared`
- Removed deprecated auth helper packages

✅ **2. Created Supabase client configuration**
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client  
- `lib/supabase/middleware.ts` - Middleware client

✅ **3. Updated middleware for Supabase auth**
- Replaced NextAuth middleware with Supabase auth middleware

✅ **4. Created database schema**
- `supabase/schema.sql` - Complete SQL schema with RLS policies
- `lib/database.types.ts` - TypeScript types for the database

✅ **5. Removed old dependencies**
- Removed `@prisma/client`, `prisma`, `@auth/prisma-adapter`, `next-auth`

✅ **6. Created new auth utilities**
- `lib/auth.ts` - Server-side auth functions
- `hooks/use-auth.ts` - Client-side auth hook

## Remaining Steps

### 1. Set up Supabase Project

1. **Create a new Supabase project** at https://supabase.com
2. **Run the schema migration**:
   ```sql
   -- Copy and paste the contents of supabase/schema.sql into the Supabase SQL editor
   ```
3. **Update your environment variables**:
   ```bash
   # Replace these with your actual Supabase project values
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 2. Data Migration (if you have existing data)

If you have existing data in your Neon database, you'll need to migrate it:

1. **Export data from Neon** using Prisma or pg_dump
2. **Transform the data** to match the new schema (mainly ID format changes)
3. **Import data into Supabase** using the dashboard or SQL

### 3. Update Application Code

#### A. Update any remaining Prisma calls

Search for any remaining `prisma` or `db.` calls in your codebase and replace them with Supabase calls:

```typescript
// Old Prisma way
const user = await prisma.user.findUnique({ where: { id } })

// New Supabase way  
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', id)
  .single()
```

#### B. Update authentication flows

Replace NextAuth usage with the new Supabase auth:

```typescript
// Old NextAuth way
import { useSession } from 'next-auth/react'
const { data: session } = useSession()

// New Supabase way
import { useAuth } from '@/hooks/use-auth'
const { user, profile, loading } = useAuth()
```

#### C. Update API routes

Update your API routes to use Supabase instead of Prisma:

```typescript
// Old way
import { db } from '@/lib/db'
const users = await db.user.findMany()

// New way
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: users } = await supabase.from('users').select('*')
```

### 4. Update Authentication Pages

Update your login/register pages to use Supabase Auth UI or the custom hooks:

```typescript
import { useAuth } from '@/hooks/use-auth'

function LoginPage() {
  const { signInWithEmail } = useAuth()
  
  const handleLogin = async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password)
    if (error) {
      console.error('Login error:', error)
    }
  }
  
  // ... rest of component
}
```

### 5. Test the Migration

1. **Test authentication flows**: Sign up, sign in, sign out
2. **Test data operations**: Create, read, update, delete operations
3. **Test role-based access**: Ensure nutritionist/patient roles work correctly
4. **Test relationships**: Nutritionist-patient relationships, profiles, etc.

### 6. Clean up

Once everything is working:

1. **Remove Prisma files**:
   - Delete `prisma/` directory
   - Remove any `lib/db.ts` or similar Prisma client files

2. **Update package.json scripts**: Remove Prisma-related scripts

3. **Remove old environment variables** from production

## Key Differences

### Authentication
- **Before**: NextAuth with credentials provider
- **After**: Supabase Auth with built-in email/password and OAuth providers

### Database Access
- **Before**: Prisma ORM with type-safe queries
- **After**: Supabase client with SQL-like query builder

### User Management
- **Before**: Custom user table with NextAuth sessions
- **After**: Supabase auth.users + custom users table with RLS

### Real-time Features
- **Bonus**: Supabase provides real-time subscriptions out of the box

## Troubleshooting

### Common Issues

1. **RLS Policies**: If you get permission denied errors, check your Row Level Security policies
2. **Environment Variables**: Ensure all Supabase environment variables are correctly set
3. **Type Errors**: Make sure to update import statements from Prisma types to Supabase types

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- Use the [Supabase Discord Community](https://discord.supabase.com/)

## Benefits of Migration

1. **Integrated Auth**: No need for separate auth solution
2. **Real-time**: Built-in real-time subscriptions
3. **Row Level Security**: Database-level security policies
4. **Storage**: Built-in file storage solution
5. **Edge Functions**: Serverless functions at the edge
6. **Cost**: Often more cost-effective than separate solutions 