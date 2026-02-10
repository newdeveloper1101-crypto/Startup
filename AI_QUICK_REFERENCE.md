✅ AI SALES AUTOMATION - QUICK REFERENCE

═══════════════════════════════════════════════════════════════

## 🚀 GET STARTED IN 5 MINUTES

### 1. Verify Setup
```bash
echo $OPENAI_API_KEY  # Should show your API key
```

### 2. Run Tests
```bash
cd leadsync-backend
npx ts-node src/test-ai.ts  # Should show ✅ All Tests Passed
```

### 3. Send Test Message to Telegram Bot
```
Message: "What products do you have?"
Expected: AI responds with sales pitch for products
```

### 4. Test API Endpoints
```bash
curl -X GET http://localhost:5000/api/conversations/{id}/summary \
  -H "Authorization: Bearer {token}"
```

✅ Done! Your AI is working.

═══════════════════════════════════════════════════════════════

## 📁 WHAT TO MODIFY

### Change Sales Behavior
```
File: src/services/ai.prompts.ts
Edit: SYSTEM_PROMPT + SHOP_CONTEXT
Restart: backends
```

### Add New Products
```
File: src/services/ai.prompts.ts
Edit: SHOP_CONTEXT → Add product details
Restart: backend
```

### Change Reply Style
```
File: src/services/ai.prompts.ts
Edit: SYSTEM_PROMPT → Adjust tone/rules
Restart: backend
```

### Adjust Creativity
```
File: src/services/ai.service.ts
Edit: temperature: 0.4 → 0.3 (focused) or 0.6 (creative)
Restart: backend
```

═══════════════════════════════════════════════════════════════

## 🎯 CORE FUNCTIONS (IMPORT & USE)

### Auto-Reply Customer (Called automatically)
```typescript
import { generateSalesReply } from '../services/ai.service'

const reply = await generateSalesReply(conversationId)
// Result: Sales-optimized message string
```

### Suggest Reply to Agent (API endpoint)
```typescript
GET /api/conversations/:id/suggest-reply
// Returns: { suggestion: "..." }
```

### Summarize Conversation (API endpoint)
```typescript
GET /api/conversations/:id/summary
// Returns: { summary: "..." }
```

### Check if AI Enabled
```typescript
import { isAIEnabled } from '../services/ai.service'

if (isAIEnabled()) {
  // Safe to use AI
}
```

═══════════════════════════════════════════════════════════════

## 📊 CONVERSATION FLOW

### Customer Initiates

```
Customer: "What products do you have?"
           ↓
       BOT MODE?
           ↓
        YES → AI automatically responds:
               "We have Premium Cotton Shirts and Bluetooth Earbuds..."
           ↓
       Customer continues...
```

### Customer Asks for Human

```
Customer: "Can I talk to an agent?"
           ↓
       Keyword detected: "agent" / "human" / "support"
           ↓
       Mode switches to HUMAN
           ↓
       Dashboard notifies: "New conversation waiting"
           ↓
       Agent can:
       - Use Summarize button (get quick context)
       - Use Suggest Reply button (draft response)
       - Type custom message
```

### Agent Takes Over

```
Agent clicks: "Suggest Reply"
           ↓
AI generates: Draft response
           ↓
Agent can:
- Copy & modify
- Use as-is
- Ignore & write own
           ↓
Agent sends message
           ↓
Mode stays HUMAN until agent switches back to BOT
```

═══════════════════════════════════════════════════════════════

## 🛡️ ERROR HANDLING

### AI Not Responding?

1. Check logs:
```bash
tail -f logs/application.log | grep "AI"
```

2. Run diagnostics:
```bash
npx ts-node src/test-ai.ts
```

3. Verify API key:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Conversation Not Found?

```bash
# Check database
SELECT * FROM Conversation WHERE id = 'xxx';

# If empty, create test data:
npx ts-node src/test-ai.ts
```

### Message Not Saving?

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT * FROM Message LIMIT 1;"
```

═══════════════════════════════════════════════════════════════

## 🔧 TROUBLESHOOTING QUICK FIX

| Problem | Solution |
|---------|----------|
| AI not responding | Add OPENAI_API_KEY, run test, check logs |
| Timeout errors | Increase timeout in OpenAI config |
| Rate limited | Reduce temp webhooks, check quota |
| Wrong replies | Update SYSTEM_PROMPT in ai.prompts.ts |
| Cost too high | Reduce max_tokens, use fewer messages |
| Conversation list empty | Send test message to Telegram bot |
| API returns 401 | Check auth token, regenerate |
| API returns 503 | AI service unavailable, check OpenAI status |

═══════════════════════════════════════════════════════════════

## 📈 MONITORING CHECKLIST

Daily:
- [ ] Check error logs for AI failures
- [ ] Verify conversation count is increasing
- [ ] Test manual message → AI reply flow

Weekly:
- [ ] Review OpenAI API usage and costs
- [ ] Check conversation quality (random sampling)
- [ ] Review agent handoff reasons
- [ ] Monitor database size

Monthly:
- [ ] Analyze conversion metrics
- [ ] Update SHOP_CONTEXT with trending products
- [ ] Review SYSTEM_PROMPT effectiveness
- [ ] Plan Phase 2 enhancements

═══════════════════════════════════════════════════════════════

## 🚀 API CHEAT SHEET

### Get All Conversations
```bash
curl -X GET http://localhost:5000/api/conversations \
  -H "Authorization: Bearer $TOKEN"
```

### Get Messages
```bash
curl -X GET http://localhost:5000/api/conversations/{id}/messages \
  -H "Authorization: Bearer $TOKEN"
```

### Get AI Suggestion
```bash
curl -X GET http://localhost:5000/api/conversations/{id}/suggest-reply \
  -H "Authorization: Bearer $TOKEN"
```

### Get Summary
```bash
curl -X GET http://localhost:5000/api/conversations/{id}/summary \
  -H "Authorization: Bearer $TOKEN"
```

### Toggle Mode
```bash
curl -X PUT http://localhost:5000/api/conversations/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mode": "HUMAN"}'
```

═══════════════════════════════════════════════════════════════

## 🎨 FRONTEND COMPONENT IMPORTS

```typescript
import { AgentAssistPanel } from '@/components/conversations/AgentAssistPanel'
import { ConversationControls } from '@/components/conversations/ConversationControls'

// Then use:
<ConversationControls mode={mode} onModeChange={setMode} />
<AgentAssistPanel conversationId={id} />
```

═══════════════════════════════════════════════════════════════

## 📚 FILENAMES TO KNOW

```
Backend:
- src/services/ai.prompts.ts    ← Change sales behavior here
- src/services/ai.service.ts    ← Change AI logic here
- src/services/ai.context.ts    ← Database helpers
- src/routes/telegram/          ← Telegram integration

Frontend:
- components/conversations/ConversationView.tsx
- components/conversations/AgentAssistPanel.tsx (NEW)
- components/conversations/ConversationControls.tsx (NEW)
```

═══════════════════════════════════════════════════════════════

## ⚡ COMMON TASKS

### Add a New Product
```typescript
// In: src/services/ai.prompts.ts
// Find: export const SHOP_CONTEXT
// Add:
3. Product Name: Your New Product
   Why it sells: Benefits here
   Ideal for: Target audience
   Approx Price: ₹xxx
```

### Change Temperature (Creativity)
```typescript
// In: src/services/ai.service.ts
// Find: temperature: 0.4
// Change to:
temperature: 0.3  // More focused (recommended for sales)
temperature: 0.6  // More creative
```

### Disable AI Temporarily
```bash
# Unset API key
unset OPENAI_API_KEY

# Frontend shows: "AI service not configured"
# isAIEnabled() returns false
# Agents must handle all messages manually
```

### View All Conversations
```bash
cd leadsync-backend
npx ts-node -e "
const { prisma } = require('./src/lib/prisma');
(async () => {
  const convs = await prisma.conversation.findMany({ include: { messages: true } });
  console.log(JSON.stringify(convs, null, 2));
  process.exit(0);
})();
"
```

═══════════════════════════════════════════════════════════════

## 🎓 LEARNING RESOURCES

1. **Backend Guide**: See `AI_IMPLEMENTATION_GUIDE.md`
2. **Frontend Guide**: See `FRONTEND_AI_INTEGRATION.md`
3. **Architecture**: See `AI_ARCHITECTURE_DIAGRAMS.md`
4. **Summary**: See `AI_SALES_AUTOMATION_SUMMARY.md`
5. **Prompts**: See `src/services/ai.prompts.ts` (inline comments)

═══════════════════════════════════════════════════════════════

## ✅ SUCCESS INDICATORS

Your system is working well if:

✅ Customer messages get AI reply within 5 seconds
✅ Agents can switch to manual mode
✅ Suggest reply generates in <10 seconds
✅ Summary appears in <15 seconds
✅ No errors in logs
✅ Conversation count increases daily
✅ OpenAI costs < $1/day

═══════════════════════════════════════════════════════════════

## 🆘 SUPPORT

Issues? Start here:

1. Check logs: `tail -f logs/application.log`
2. Run test: `npx ts-node src/test-ai.ts`
3. Read docs: `AI_IMPLEMENTATION_GUIDE.md`
4. Check code comments in service files
5. Review test-ai.ts for usage examples

═══════════════════════════════════════════════════════════════

You're all set! Your AI sales automation is live. 🚀

Make sales, not scripts.
