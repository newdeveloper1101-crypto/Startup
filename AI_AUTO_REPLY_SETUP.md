# 🤖 AI Auto-Reply Setup Guide

This guide walks you through setting up **OpenAI-powered AI Auto-Reply** for your Telegram bot.

## ✅ Architecture (What's Working)

```
User Message (Telegram)
    ↓
Webhook receives message
    ↓
Get conversation history (last 8 messages)
    ↓
Call OpenAI GPT-4o-mini API
    ↓
AI generates intelligent reply
    ↓
Send reply back via Telegram
    ↓
Save in database for history
```

## 🛠️ What Was Installed

1. ✅ **OpenAI SDK** (`openai` package) - Added to `package.json`
2. ✅ **AI Service** (`src/services/ai.service.ts`) - Handles OpenAI API calls with:
   - System prompts for context
   - Conversation history (for coherent multi-turn chat)
   - Error handling & fallbacks
   - Company-specific configurations
3. ✅ **Telegram Integration** - Updated `telegram.controller.ts` to:
   - Fetch conversation history before generating reply
   - Call AI service instead of hardcoded responses
   - Gracefully fallback if AI fails
   - Save AI responses to database

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd leadsync-backend
npm install
```

### Step 2: Get Your OpenAI API Key

1. Go to [https://platform.openai.com/api/keys](https://platform.openai.com/api/keys)
2. Sign up / Log in
3. Create a new API key
4. Copy it (you'll need it below)

⚠️ **Security Note**: Never commit `.env` files to git. Only `.env.example` should be in version control.

### Step 3: Set Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI key:

```
OPENAI_API_KEY=sk-proj-your_actual_key_here
```

**Other required variables:**

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/leadsync

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Server
PORT=4000
JWT_SECRET=any_random_secret_key

# Frontend
FRONTEND_URL=http://localhost:5173

# For production webhook
API_BASE_URL=https://your-domain.com
```

## ▶️ Test It

```bash
npm run dev
```

Then:

1. Send a message to your Telegram bot
2. The AI will automatically reply using OpenAI GPT-4o-mini
3. Check the console for logs:
   ```
   🤖 AI Reply Generated: Your intelligent response...
   ```

## 📊 Features Built In

### ✨ Intelligent Responses
- AI reads conversation history (last 8 messages)
- Understands context from previous replies
- Generates natural, contextual responses
- Falls back gracefully if API fails

### 🎯 System Prompt
- Customizable per company
- Defaults to helpful customer support assistant
- Concise responses (under 300 chars preferred)
- Professional yet friendly tone

### 🔄 Handoff to Human
- User types "agent", "human", or "support"
- Conversation switches to HUMAN mode
- Agent can then take over

### 💾 Full Conversation History
- All messages saved to database
- AI uses last 8 messages for context
- Enables coherent multi-turn conversations

## ⚙️ Configuration Options

### Customize AI Behavior

Edit **`src/services/ai.service.ts`**:

```typescript
// Change the model
model: 'gpt-4',  // or 'gpt-3.5-turbo' for cheaper responses

// Adjust temperature (0-1)
temperature: 0.7,  // Lower = more deterministic, Higher = more creative

// Change context size
const history = await getConversationHistory(conversation.id, 10)  // More context
```

### Custom System Prompts per Company

In `src/services/ai.service.ts`, the `getCompanyAIContext()` function can be extended:

```typescript
export async function getCompanyAIContext(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })
  
  return {
    systemPrompt: company.aiPrompt,  // Custom prompt from DB
    companyName: company.name
  }
}
```

Then add a column to your Prisma schema:

```prisma
model Company {
  // ... existing fields
  aiPrompt: String?  // Custom AI system prompt
}
```

## 🧪 Example Flows

### Normal Chat
```
User: "What's your pricing?"
AI: "Our standard plans start at $99/month with 50 leads/day. 
     Would you like details on features?"

User: "What about custom plans?"
AI: "Absolutely! We offer custom plans for enterprise customers.
     Let me connect you with our sales team..."
```

### IoT/Alert Explanation
```
User: "Temperature sensor offline"
AI: "The temperature sensor at Location A is unreachable.
     Last reading was 23°C at 2:30 PM.
     This could mean: WiFi issue, power loss, or hardware failure.
     Would you like me to trigger a diagnostic?"
```

### FAQ Auto-Response
```
User: "How do I reset my password?"
AI: "You can reset your password by:
     1. Click the login page 'Forgot Password' link
     2. Enter your email
     3. Check your inbox for reset link
        (Check spam folder too!)
     
     Need more help? Type 'agent'"
```

## 🔐 Security Best Practices

1. ✅ **Never share API keys** - Keep in `.env` only
2. ✅ **Rotate keys regularly** - For production, rotate quarterly
3. ✅ **Use environment variables** - Never hardcode keys
4. ✅ **Monitor costs** - Set OpenAI API limits in your account
5. ✅ **Validate inputs** - Backend already validates message.text

### Cost Estimates

Using **GPT-4o-mini** (cheapest option):
- ~0.005 per message (with 8-message history)
- 1,000 messages = ~$5
- Typical pricing: <$100/month for small-medium bots

Check current pricing: https://openai.com/pricing/

## 🚨 Troubleshooting

### Red Flag: "AI service is not configured"

**Problem**: `OPENAI_API_KEY` not set

**Fix**:
```bash
# Check your .env file
cat .env | grep OPENAI

# Add missing key
echo "OPENAI_API_KEY=sk-proj-XXX" >> .env
```

### Red Flag: "429 Rate LIMITED"

**Problem**: Too many API calls too fast

**Solution**: Add rate limiting:
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60000,  // 1 minute
  max: 30           // 30 requests per minute
})

router.post('/webhook', limiter, telegramWebhook)
```

### Red Flag: "Invalid API key"

**Problem**: Wrong or expired key

**Fix**:
1. Go to https://platform.openai.com/api/keys
2. Generate a new key
3. Update `.env`
4. Restart app

### Red Flag: No reply sent

**Problem**: Network, database, or Telegram API issue

**Solution**: Check logs
```bash
npm run dev
# Look for 📩 Telegram webhook hit logs
# Look for 🤖 AI Reply Generated logs
# Look for ❌ error logs
```

## 📝 Code Changes Summary

### Files Created
- ✅ `src/services/ai.service.ts` - Core AI logic
- ✅ `AI_AUTO_REPLY_SETUP.md` - This guide

### Files Modified
- ✅ `package.json` - Added openai
- ✅ `src/services/telegram.service.ts` - Added getConversationHistory()
- ✅ `src/routes/telegram/telegram.controller.ts` - Integrated AI
- ✅ `.env.example` - Added OPENAI_API_KEY

### Database
- No schema changes needed ✅ (Existing Message/Conversation tables work)

## 🔥 Next Steps

1. **Test locally**:
   ```bash
   npm run dev
   ```
   Send messages to your bot

2. **Deploy to Railway**:
   ```bash
   git push
   # AI will work automatically in production
   ```

3. **Monitor costs**:
   - Check OpenAI dashboard weekly
   - Set budget alerts

4. **Optimize**:
   - Adjust temperature based on your needs
   - Add company-specific prompts
   - Implement conversation summarization for long chats

5. **Advanced**:
   - Add voice replies (Telegram supports voice)
   - Add specific AI agents (sales, support, technical)
   - Implement user feedback loop (thumbs up/down)

## 🤝 Support

If something doesn't work:

1. Check `.env` has `OPENAI_API_KEY`
2. Run `npm install` (make sure openai package is installed)
3. Check console logs for error messages
4. Check OpenAI account for insufficient credits/limits

---

**You're ready! 🎉 Send a message to your bot and watch the AI magic happen.**
