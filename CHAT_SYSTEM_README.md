# Chat System Implementation

## Overview

This chat system provides a comprehensive solution for saving and managing AI conversations in NutriGuide. It supports both **session-only chats** (temporary, not saved) and **persistent chats** (saved to database).

## Key Features

### ✅ **Dual Chat Modes**
- **Session Chats**: Temporary conversations that don't persist after refresh
- **Saved Chats**: Conversations saved to database with full history

### ✅ **Complete Chat Management**
- Create new chats
- Load chat history
- Archive old chats
- Auto-save messages as they're sent

### ✅ **User Experience**
- Seamless transition between session and saved chats
- Chat history sidebar in messages page
- Quick chat creation from dashboard
- Visual indicators for chat status

## Database Schema

### Tables Added

#### `chats` Table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- title: TEXT (Default: 'Nueva conversación')
- summary: TEXT (AI-generated summary, future use)
- status: ENUM ('active', 'archived', 'deleted')
- last_message_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `messages` Table
```sql
- id: UUID (Primary Key)
- chat_id: UUID (Foreign Key to chats)
- role: TEXT ('user' | 'assistant')
- content: TEXT
- tokens_used: INTEGER (for API usage tracking)
- model_used: TEXT (AI model version)
- created_at: TIMESTAMPTZ
```

## API Endpoints

### Chat Management
- `GET /api/chats` - List user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/[chatId]` - Get specific chat with messages
- `PATCH /api/chats/[chatId]` - Update chat (title, status)
- `DELETE /api/chats/[chatId]` - Delete chat

### Messages
- `GET /api/chats/[chatId]/messages` - Get messages for a chat
- `POST /api/chats/[chatId]/messages` - Save message to chat

### Enhanced Chat API
- `POST /api/chat` - Send message (now supports optional `chatId` parameter)

## Component Architecture

### Core Components

#### `NutritionChatbot` (Enhanced Version)
- **File**: `app/components/nutrition-chatbot-v2.tsx`
- **Features**:
  - Support for both session and saved chats
  - Chat history sidebar
  - Auto-save functionality
  - Chat management controls

#### `useChat` Hook
- **File**: `hooks/useChat.ts`
- **Purpose**: Manages chat state and provides helper functions
- **Functions**:
  - `loadChats()` - Fetch user's chats
  - `createChat()` - Create new saved chat
  - `deleteChat()` - Delete chat
  - `archiveChat()` - Archive chat

### Updated Pages

#### Dashboard (`/dashboard`)
- Still uses the original chatbot for session-only chats
- Quick action buttons to create saved chats
- Same user experience for main AI interaction

#### Messages Page (`/dashboard/messages`)
- Full chat history with sidebar
- Load any previous conversation
- Create and manage multiple chats

## Implementation Strategy

### 🎯 **Best Approach for Your Use Case**

Based on your requirements, here's the recommended implementation:

#### **Main Dashboard**: Session Chats (Current Behavior)
- Keep the current `NutritionChatbot` component
- Messages are temporary and reset on refresh
- Users can optionally save interesting conversations

#### **Messages Tab**: Persistent Chats with History
- Use the new `NutritionChatbot` with `showChatList={true}`
- Display all saved conversations
- Full chat management capabilities

#### **Hybrid Approach**: Best of Both Worlds
```typescript
// Dashboard - Quick session chat
<NutritionChatbot 
  showChatList={false}  // No sidebar, clean interface
  onChatChange={handleChatChange}  // Optional: save interesting chats
/>

// Messages page - Full chat management
<NutritionChatbot 
  showChatList={true}   // Show chat history sidebar
  chatId={selectedChatId}
  onChatChange={setSelectedChatId}
/>
```

## Migration Steps

### 1. Run Database Migration
```sql
-- Run the migration script in Supabase SQL editor
-- File: scripts/migrate-chat-system.sql
```

### 2. Deploy API Endpoints
- All API routes are already created in the `/api` folder
- Test with your existing authentication system

### 3. Update Components (Optional)
- The original chatbot continues to work as-is
- Update the messages page to use the new system
- Optionally enhance the dashboard chat

### 4. Test the System
```bash
# Start your development server
npm run dev

# Test the messages page
# Navigate to /dashboard/messages
# Create new chats and verify they save
```

## Usage Examples

### Creating a New Saved Chat
```typescript
const { createChat } = useChat()

// Create a new chat
const chatId = await createChat("Consulta sobre diabetes")
```

### Loading a Specific Chat
```typescript
// Component automatically loads when chatId prop changes
<NutritionChatbot 
  chatId="uuid-of-chat"
  onChatChange={handleChatChange}
/>
```

### Session-Only Chat (No Saving)
```typescript
// Don't provide a chatId - messages won't be saved
<NutritionChatbot 
  chatId={null}
  showChatList={false}
/>
```

## Benefits

### 🚀 **For Users**
- **Choice**: Session chats for quick questions, saved chats for important conversations
- **History**: Never lose important nutritional advice
- **Organization**: Organize conversations by topic/date
- **Continuity**: Pick up conversations where they left off

### 👩‍💻 **For Development**
- **Gradual Migration**: Implement incrementally without breaking existing functionality
- **Flexible**: Support both temporary and persistent conversations
- **Scalable**: Database design supports future features (summaries, sharing, etc.)
- **Analytics**: Track user engagement and popular topics

### 🏥 **For Nutritionists**
- **Patient History**: See patient conversation patterns (with proper permissions)
- **Insights**: Understand common questions and concerns
- **Follow-up**: Reference previous conversations during consultations

## Future Enhancements

### Phase 2 Features
- **AI-Generated Summaries**: Automatic conversation summaries
- **Search**: Find specific conversations or advice
- **Categories**: Tag conversations by topic
- **Export**: PDF exports of important conversations
- **Sharing**: Share conversations with nutritionists

### Phase 3 Features
- **Voice Messages**: Audio input/output
- **Image Analysis**: Photo analysis of meals
- **Scheduled Reminders**: Based on conversation content
- **Multi-language**: Support for multiple languages

## Security & Privacy

### ✅ **Row Level Security (RLS)**
- Users can only access their own chats and messages
- Nutritionists can view their patients' chats (with proper permissions)
- All database access is properly authenticated

### ✅ **Data Protection**
- Messages are encrypted in transit
- Database backups include chat data
- GDPR compliant (users can delete their data)

### ✅ **API Security**
- All endpoints require authentication
- Input validation and sanitization
- Rate limiting on message creation

## Monitoring & Analytics

### Metrics to Track
- Average messages per chat
- Most active conversation topics
- User engagement with saved vs session chats
- API usage and costs (tokens used)

## Troubleshooting

### Common Issues
1. **Messages not saving**: Check chatId is provided and valid
2. **Chat list not loading**: Verify RLS policies and authentication
3. **Performance issues**: Check database indexes are created

### Debug Tools
```typescript
// Enable debug logging in components
console.log('Current chat ID:', currentChatId)
console.log('Messages:', messages.length)
```

## Conclusion

This chat system provides a solid foundation for persistent conversations while maintaining the simplicity of session-based chats. The implementation is designed to be:

- **Non-disruptive**: Existing functionality continues to work
- **User-friendly**: Clear distinction between temporary and saved chats
- **Scalable**: Database design supports future enhancements
- **Flexible**: Easy to customize behavior per page/component

The dual approach (session + saved chats) gives users the best of both worlds: quick interactions when they want them, and persistent history when they need it. 