# Data Migration Guide: Neon to Supabase

This guide helps you migrate your existing data from Neon database to Supabase.

## Prerequisites

- Access to your Neon database
- Supabase project set up with the new schema
- PostgreSQL tools installed (psql, pg_dump)

## Step 1: Export Data from Neon

### 1.1 Using pg_dump (Recommended)

```bash
# Export all data from your Neon database
  --data-only \
  --inserts \
  --no-owner \
  --no-privileges \
  > neon_data_export.sql
```

### 1.2 Export Specific Tables

If you prefer to export tables individually:

```bash
# Export users table
pg_dump "your_neon_connection_string" \
  --data-only \
  --inserts \
  --table='"User"' \
  > users_export.sql

# Export profiles table
pg_dump "your_neon_connection_string" \
  --data-only \
  --inserts \
  --table='"Profile"' \
  > profiles_export.sql

# Export AI rules table
pg_dump "your_neon_connection_string" \
  --data-only \
  --inserts \
  --table='"AIRules"' \
  > ai_rules_export.sql
```

## Step 2: Transform Data Format

The exported data needs to be transformed to match the new Supabase schema:

### 2.1 Table Name Changes

- `"User"` → `users`
- `"Profile"` → `profiles`
- `"AIRules"` → `ai_rules`
- `"Account"` → `accounts`
- `"Session"` → `sessions`
- `"VerificationToken"` → `verification_tokens`

### 2.2 Column Name Changes

**Users table:**
- `nutritionistKey` → `nutritionist_key`
- `nutritionistId` → `nutritionist_id`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

**Profiles table:**
- `userId` → `user_id`
- `firstName` → `first_name`
- `lastName` → `last_name`
- `phoneNumber` → `phone_number`
- `birthDate` → `birth_date`
- `activityLevel` → `activity_level`
- `dietaryRestrictions` → `dietary_restrictions`
- `medicalConditions` → `medical_conditions`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

**AI Rules table:**
- `userId` → `user_id`
- `dietPhilosophy` → `diet_philosophy`
- `generalGuidelines` → `general_guidelines`
- `responseStyle` → `response_style`
- `specialInstructions` → `special_instructions`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

### 2.3 Data Transformation Script

Create a Python script to transform the data:

```python
import re

def transform_sql_file(input_file, output_file):
    with open(input_file, 'r') as f:
        content = f.read()
    
    # Transform table names
    content = re.sub(r'"User"', 'users', content)
    content = re.sub(r'"Profile"', 'profiles', content)
    content = re.sub(r'"AIRules"', 'ai_rules', content)
    content = re.sub(r'"Account"', 'accounts', content)
    content = re.sub(r'"Session"', 'sessions', content)
    content = re.sub(r'"VerificationToken"', 'verification_tokens', content)
    
    # Transform column names for users table
    content = re.sub(r'"nutritionistKey"', 'nutritionist_key', content)
    content = re.sub(r'"nutritionistId"', 'nutritionist_id', content)
    content = re.sub(r'"createdAt"', 'created_at', content)
    content = re.sub(r'"updatedAt"', 'updated_at', content)
    
    # Transform column names for profiles table
    content = re.sub(r'"userId"', 'user_id', content)
    content = re.sub(r'"firstName"', 'first_name', content)
    content = re.sub(r'"lastName"', 'last_name', content)
    content = re.sub(r'"phoneNumber"', 'phone_number', content)
    content = re.sub(r'"birthDate"', 'birth_date', content)
    content = re.sub(r'"activityLevel"', 'activity_level', content)
    content = re.sub(r'"dietaryRestrictions"', 'dietary_restrictions', content)
    content = re.sub(r'"medicalConditions"', 'medical_conditions', content)
    
    # Transform column names for ai_rules table
    content = re.sub(r'"dietPhilosophy"', 'diet_philosophy', content)
    content = re.sub(r'"generalGuidelines"', 'general_guidelines', content)
    content = re.sub(r'"responseStyle"', 'response_style', content)
    content = re.sub(r'"specialInstructions"', 'special_instructions', content)
    
    with open(output_file, 'w') as f:
        f.write(content)

# Transform the exported data
transform_sql_file('neon_data_export.sql', 'supabase_data_import.sql')
```

## Step 3: Handle Authentication Data

Since we're moving from NextAuth to Supabase Auth, user authentication data needs special handling:

### 3.1 Create Users in Supabase Auth

For each user in your `users` table, you'll need to create a corresponding auth user:

```sql
-- Example for creating auth users (run this in Supabase SQL editor)
-- Note: You'll need to use the Supabase Admin API for this

-- For each user, create auth user and then insert into users table
-- This is pseudocode - you'll need to use the Admin API
```

### 3.2 Supabase Admin API Script

Create a Node.js script to migrate users:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateUsers(users) {
  for (const user of users) {
    try {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'temporary_password_123', // Users will need to reset
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role
        }
      })

      if (authError) {
        console.error('Auth error for', user.email, authError)
        continue
      }

      // Insert into users table
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          nutritionist_key: user.nutritionist_key,
          nutritionist_id: user.nutritionist_id,
          created_at: user.created_at,
          updated_at: user.updated_at
        })

      if (dbError) {
        console.error('DB error for', user.email, dbError)
      } else {
        console.log('Migrated user:', user.email)
      }
    } catch (error) {
      console.error('Error migrating user:', user.email, error)
    }
  }
}

// Run the migration
// migrateUsers(yourUsersArray)
```

## Step 4: Import Data to Supabase

### 4.1 Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Paste the transformed SQL file content
4. Execute the queries

### 4.2 Using psql

```bash
# Connect to your Supabase database and import
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase_data_import.sql
```

## Step 5: Verification

After migration, verify the data:

```sql
-- Check user count
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM auth.users;

-- Check profile count
SELECT COUNT(*) FROM profiles;

-- Check AI rules count
SELECT COUNT(*) FROM ai_rules;

-- Verify relationships
SELECT u.email, p.first_name, p.last_name
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LIMIT 10;
```

## Step 6: Update Users About Password Reset

Since users will have temporary passwords, send them password reset emails:

```javascript
async function sendPasswordResets(users) {
  for (const user of users) {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: 'https://yourapp.com/reset-password'
    })
    
    if (error) {
      console.error('Reset error for', user.email, error)
    } else {
      console.log('Reset email sent to:', user.email)
    }
  }
}
```

## Important Notes

1. **Test First**: Always test the migration on a small dataset first
2. **Backup**: Keep backups of your original Neon database
3. **Downtime**: Plan for some downtime during migration
4. **User Communication**: Inform users about password resets
5. **Rollback Plan**: Have a plan to rollback if needed

## Troubleshooting

### Common Issues

1. **ID Conflicts**: Ensure UUIDs don't conflict between auth.users and your users table
2. **Data Types**: Some data types might need conversion
3. **Constraints**: Foreign key constraints might fail if referenced data doesn't exist

### Solutions

1. Use transactions for atomic operations
2. Disable constraints temporarily during import
3. Import in the correct order (users first, then profiles, etc.)

```sql
-- Disable constraints temporarily
ALTER TABLE profiles DISABLE TRIGGER ALL;
-- Import data
ALTER TABLE profiles ENABLE TRIGGER ALL;
``` 