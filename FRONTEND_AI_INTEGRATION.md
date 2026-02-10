✅ FRONTEND INTEGRATION - AI AGENT-ASSIST FEATURES

This guide shows how to integrate AI features into your React dashboard.

═══════════════════════════════════════════════════════════════

## 🎯 Overview

Your dashboard should display:
1. Chat conversation (messages from customer + AI/agent)
2. ACTION BUTTON: "Suggest Reply" (get AI suggestion)
3. ACTION BUTTON: "Summarize" (get quick overview)
4. TOGGLE: "AI Auto-Reply ON/OFF" (switch BOT/HUMAN mode)

═══════════════════════════════════════════════════════════════

## 📁 Component Structure

```
src/components/
├── conversations/
│   ├── ConversationView.tsx        (Main chat window)
│   ├── MessageList.tsx             (Display messages)
│   ├── AgentAssistPanel.tsx        (NEW: Suggest + Summary)
│   └── ConversationControls.tsx    (NEW: Mode toggle)
```

═══════════════════════════════════════════════════════════════

## 1️⃣ Suggest Reply Button

### Component: AgentAssistPanel.tsx

```typescript
import { useState } from 'react'
import { api } from '@/config/api'

export function AgentAssistPanel({ conversationId }: { conversationId: string }) {
  const [suggestion, setSuggestion] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSuggestReply = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/conversations/${conversationId}/suggest-reply`)
      setSuggestion(response.data.suggestion)
    } catch (err) {
      setError('Failed to generate suggestion. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="agent-assist-panel border-l pl-4">
      <h3 className="text-sm font-semibold mb-3">AI Agent Assist</h3>

      {/* Suggest Reply Section */}
      <div className="mb-4">
        <button
          onClick={handleSuggestReply}
          disabled={loading}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Generating...' : '✍️ Suggest Reply'}
        </button>

        {suggestion && (
          <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
            <p className="font-semibold text-xs text-gray-600 mb-2">AI SUGGESTION:</p>
            <p className="text-gray-800">{suggestion}</p>
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ Edit this before sending to customer
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}
```

### Usage in ConversationView:

```typescript
import { AgentAssistPanel } from './AgentAssistPanel'

export function ConversationView({ conversationId }: Props) {
  return (
    <div className="flex gap-4">
      {/* Left: Messages */}
      <div className="flex-1">
        <MessageList conversationId={conversationId} />
        <MessageInput conversationId={conversationId} />
      </div>

      {/* Right: AI Assist Panel */}
      <div className="w-80">
        <AgentAssistPanel conversationId={conversationId} />
      </div>
    </div>
  )
}
```

═══════════════════════════════════════════════════════════════

## 2️⃣ Summarize Button

### Add to AgentAssistPanel:

```typescript
const [summary, setSummary] = useState<string>('')
const [summaryLoading, setSummaryLoading] = useState(false)

const handleSummarize = async () => {
  setSummaryLoading(true)
  setError('')
  try {
    const response = await api.get(`/conversations/${conversationId}/summary`)
    setSummary(response.data.summary)
  } catch (err) {
    setError('Failed to generate summary.')
    console.error(err)
  } finally {
    setSummaryLoading(false)
  }
}

return (
  <div className="agent-assist-panel border-l pl-4">
    <h3 className="text-sm font-semibold mb-3">AI Agent Assist</h3>

    {/* Summarize Section */}
    <div className="mb-4">
      <button
        onClick={handleSummarize}
        disabled={summaryLoading}
        className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
      >
        {summaryLoading ? 'Summarizing...' : '🧠 Summarize'}
      </button>

      {summary && (
        <div className="mt-3 p-3 bg-purple-50 rounded text-sm">
          <p className="font-semibold text-xs text-gray-600 mb-2">CONVERSATION SUMMARY:</p>
          <div className="text-gray-800 whitespace-pre-wrap text-xs">
            {summary}
          </div>
        </div>
      )}
    </div>

    {/* Suggest Reply Section */}
    {/* ... same as above ... */}
  </div>
)
```

═══════════════════════════════════════════════════════════════

## 3️⃣ AI Mode Toggle (BOT vs HUMAN)

### Component: ConversationControls.tsx

```typescript
import { useState } from 'react'
import { api } from '@/config/api'

interface ConversationControlsProps {
  conversationId: string
  mode: 'BOT' | 'HUMAN'
  onModeChange: (mode: 'BOT' | 'HUMAN') => void
}

export function ConversationControls({
  conversationId,
  mode,
  onModeChange,
}: ConversationControlsProps) {
  const [loading, setLoading] = useState(false)

  const handleToggleMode = async () => {
    setLoading(true)
    try {
      const newMode = mode === 'BOT' ? 'HUMAN' : 'BOT'

      // Update mode in database
      await api.put(`/conversations/${conversationId}`, {
        mode: newMode,
      })

      onModeChange(newMode)

      // Show notification
      if (newMode === 'HUMAN') {
        console.log('✅ Switched to HUMAN mode - AI auto-reply disabled')
      } else {
        console.log('🤖 Switched to BOT mode - AI auto-reply enabled')
      }
    } catch (error) {
      console.error('Failed to toggle mode:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conversation Controls</h2>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mode:</span>

          <button
            onClick={handleToggleMode}
            disabled={loading}
            className={`px-4 py-2 rounded font-semibold transition ${
              mode === 'BOT'
                ? 'bg-green-500 text-white'
                : 'bg-yellow-500 text-white'
            } hover:opacity-90 disabled:opacity-50`}
          >
            {loading ? 'Switching...' : mode === 'BOT' ? '🤖 BOT' : '👨‍💼 HUMAN'}
          </button>
        </div>
      </div>

      {mode === 'BOT' && (
        <p className="text-xs text-green-600 mt-2">
          ✅ AI is automatically responding to customer messages
        </p>
      )}

      {mode === 'HUMAN' && (
        <p className="text-xs text-yellow-600 mt-2">
          ℹ️ You must respond manually. AI will not send auto-replies.
        </p>
      )}
    </div>
  )
}
```

### Usage in ConversationView:

```typescript
import { ConversationControls } from './ConversationControls'

export function ConversationView({ conversationId }: Props) {
  const [mode, setMode] = useState<'BOT' | 'HUMAN'>('BOT')

  return (
    <div className="flex flex-col h-full">
      <ConversationControls
        conversationId={conversationId}
        mode={mode}
        onModeChange={setMode}
      />

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <MessageList conversationId={conversationId} />
          <MessageInput conversationId={conversationId} />
        </div>

        <div className="w-80 border-l overflow-auto">
          <AgentAssistPanel conversationId={conversationId} />
        </div>
      </div>
    </div>
  )
}
```

═══════════════════════════════════════════════════════════════

## 🎨 Styling with Tailwind

```css
.agent-assist-panel {
  @apply bg-gradient-to-b from-gray-50 to-white;
}

.suggestion-box {
  @apply border-l-4 border-blue-500 bg-blue-50 p-4 rounded;
}

.summary-box {
  @apply border-l-4 border-purple-500 bg-purple-50 p-4 rounded;
}

.mode-indicator {
  @apply inline-block px-2 py-1 rounded text-xs font-semibold;
}

.mode-bot {
  @apply bg-green-100 text-green-800;
}

.mode-human {
  @apply bg-yellow-100 text-yellow-800;
}
```

═══════════════════════════════════════════════════════════════

## 🔌 API Integration

All endpoints are already available:

### Fetch Conversations
```typescript
GET /api/conversations
// Returns: List of conversations with metadata
```

### Fetch Messages
```typescript
GET /api/conversations/:id/messages
// Returns: Array of all messages in conversation
```

### Get Suggest Reply
```typescript
GET /api/conversations/:id/suggest-reply
// Returns: { suggestion: string }
```

### Get Summary
```typescript
GET /api/conversations/:id/summary
// Returns: { summary: string }
```

### Toggle BOT/HUMAN Mode
```typescript
PUT /api/conversations/:id
// Body: { mode: "BOT" | "HUMAN" }
```

═══════════════════════════════════════════════════════════════

## 🎯 User Flow

### For Agent in Dashboard:

1. **View Conversation**
   - See all messages between customer and AI
   - See current mode (BOT or HUMAN)

2. **Option A: Let AI Continue (BOT MODE)**
   - Toggle to/confirm BOT mode
   - AI automatically responds to new messages
   - Agent can monitor

3. **Option B: Take Over (HUMAN MODE)**
   - Toggle to HUMAN mode
   - AI stops sending auto-replies
   - Click "Summarize" to quickly understand context
   - Click "Suggest Reply" to get AI-drafted response
   - Edit suggested reply if needed
   - Send custom message to customer

4. **Handoff Back to AI (if needed)**
   - Toggle back to BOT mode
   - AI resumes auto-replies

═══════════════════════════════════════════════════════════════

## 🛡️ Error Handling

```typescript
try {
  const response = await api.get(`/conversations/${conversationId}/suggest-reply`)

  if (response.status === 503) {
    setError('AI service is temporarily unavailable')
  } else if (response.status === 404) {
    setError('Conversation not found')
  } else {
    setSuggestion(response.data.suggestion)
  }
} catch (error) {
  if (error.response?.status === 401) {
    // User not authenticated, redirect to login
    window.location.href = '/login'
  } else {
    setError('Failed to generate suggestion. Please try again.')
  }
}
```

═══════════════════════════════════════════════════════════════

## 🚀 Deployment Checklist

- [ ] API routes are registered in backend
- [ ] Frontend components created and imported
- [ ] Styling matches brand guidelines
- [ ] Error messages are user-friendly
- [ ] Loading states show proper feedback
- [ ] Mode toggle persists to database
- [ ] Test suggest reply generation
- [ ] Test conversation summarization
- [ ] Test mode toggle
- [ ] Verify conversation list updates

═══════════════════════════════════════════════════════════════

## 📊 Analytics to Track

Add tracking to measure effectiveness:

```typescript
// Track when suggestion is used
const handleUseSuggestion = () => {
  analytics.track('ai_suggestion_used', {
    conversationId,
    suggestionLength: suggestion.length,
  })
}

// Track mode switches
const handleToggleMode = async (newMode) => {
  analytics.track('conversation_mode_changed', {
    conversationId,
    previousMode: mode,
    newMode,
  })
}

// Track summary views
const handleSummarize = async () => {
  analytics.track('conversation_summarized', {
    conversationId,
  })
}
```

═══════════════════════════════════════════════════════════════

✅ Your dashboard is now AI-powered! 🚀

Agents can work faster with AI assistance while maintaining full control.
