import { OpenAI } from 'openai'

const openaiApiKey = process.env.OPENAI_API_KEY
if (!openaiApiKey) {
  console.warn('⚠️ OPENAI_API_KEY not set. AI auto-reply will be disabled.')
}

const client = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

interface AIReplyOptions {
  userMessage: string
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  systemPrompt?: string
  companyName?: string
}

export async function generateAIReply(options: AIReplyOptions): Promise<string> {
  if (!client) {
    return '🤖 AI service is not configured. Please contact support.'
  }

  try {
    const {
      userMessage,
      conversationHistory = [],
      systemPrompt,
      companyName = 'our service',
    } = options

    const defaultSystemPrompt = `You are a helpful customer support AI assistant for ${companyName}.
- Be concise and friendly
- Provide helpful information
- If you don't know something, suggest contacting a human agent
- Keep responses under 300 characters when possible
- Use emojis appropriately but sparingly`

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt || defaultSystemPrompt,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ]

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = response.choices[0].message.content
    if (!reply) {
      throw new Error('No response from OpenAI')
    }

    return reply
  } catch (error) {
    console.error('❌ AI Service Error:', error)
    return "🤖 I'm having trouble thinking right now. Let me connect you to a human agent who can help!\n\nType: agreed"
  }
}

export async function getCompanyAIContext(
  companyId: string
): Promise<{ systemPrompt?: string; companyName: string }> {
  // This can be extended to fetch company-specific AI prompts from database
  // For now, returning defaults

  return {
    systemPrompt: undefined, // Uses default
    companyName: 'our service', // Should be fetched from company in DB
  }
}

export function isAIEnabled(): boolean {
  return !!client
}
