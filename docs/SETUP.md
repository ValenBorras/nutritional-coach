# NutriGuide MVP - Setup Guide

## 🚀 Quick Start

### 1. Environment Variables
Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# NextAuth Configuration (optional)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Database Setup
Run the SQL schema in your Supabase dashboard:
```bash
# Copy and paste the contents of supabase/schema.sql
# into your Supabase SQL editor and run it
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

## 🔧 Configuration Details

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your keys
3. Run the schema.sql in the SQL editor
4. Enable Row Level Security (RLS) - already included in schema

### OpenAI Setup
1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Make sure you have credits in your account
3. The app uses `gpt-4o-mini` model for cost efficiency

### Testing the Setup
1. Navigate to `http://localhost:3000`
2. Try registering as a nutritionist
3. Generate a patient key
4. Register as a patient with that key
5. Test the AI chat functionality

## 🧪 Testing Checklist

- [ ] Nutritionist registration works
- [ ] Patient key generation works
- [ ] Patient registration with key works
- [ ] AI chat responds for patients
- [ ] AI chat responds for nutritionists
- [ ] Responses are in Spanish
- [ ] Error handling works properly

## 🚨 Common Issues

### "OpenAI API Error"
- Check your OPENAI_API_KEY is correct
- Verify you have credits in your OpenAI account
- Check API rate limits

### "Database Connection Error"
- Verify Supabase URLs and keys
- Check if RLS policies are set up correctly
- Ensure schema.sql was run completely

### "Registration Fails"
- Check browser console for errors
- Verify all environment variables are set
- Check Supabase auth settings

## 📁 Project Structure

```
app/
├── api/
│   ├── chat/route.ts          # AI chat endpoint
│   ├── auth/register/route.ts # User registration
│   └── nutritionist/         # Nutritionist-specific APIs
├── components/
│   ├── nutrition-chatbot.tsx  # Main chat component
│   └── auth/                  # Authentication forms
├── dashboard/
│   ├── page.tsx              # Main dashboard
│   ├── meal-plans/           # (commented out for MVP)
│   ├── nutrition/            # (commented out for MVP)
│   ├── patients/             # (commented out for MVP)
│   └── settings/             # (commented out for MVP)
└── login/                    # Login pages
```

## 🎯 MVP Features

✅ **Working Features:**
- User registration (patient/nutritionist)
- AI chat with personalized responses
- Patient key system
- Authentication
- Basic dashboard

🚧 **In Development:**
- End-to-end testing
- Error handling improvements
- Production deployment

⏳ **Post-MVP:**
- Meal planning
- Nutrition tracking
- Patient management
- Advanced settings 