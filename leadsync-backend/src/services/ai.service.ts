/**
 * 🤖 AI SERVICE (Sales-Optimized SaaS)
 * 
 * Core AI operations:
 * 1. generateSalesReply() - Auto respond to customers (BOT MODE)
 * 2. suggestAgentReply() - Help human agents respond faster
 * 3. summarizeConversation() - Quick summary for agents
 */

import { OpenAI } from 'openai'
import { SYSTEM_PROMPT, SHOP_CONTEXT, AGENT_SUGGESTION_PROMPT, SUMMARY_PROMPT } from './ai.prompts'
import { getConversationContext } from './ai.context'

// Initialize OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY

if (!openaiApiKey) {
  console.warn(
    '⚠️  OPENAI_API_KEY not set. AI auto-reply will be disabled.'
  )
}

const client = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

/**
 * ✅ MAIN: Generate AI sales reply
 * Uses:
 * - SYSTEM_PROMPT (professional sales assistant)
 * - SHOP_CONTEXT (best-selling products)
 * - Conversation history (real memory)
 * - Temperature 0.4 (controlled creativity for sales)
 */
export async function generateSalesReply(conversationId: string): Promise<string> {
  if (!client) {
    return '🤖 AI service is not configured. Please contact support or type "agent" to speak with our team.'
  }

  try {
    const conversationHistory = await getConversationContext(conversationId, 10)

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: SHOP_CONTEXT },
        ...conversationHistory,
      ],
      temperature: 0.4, // ✅ Sales = Controlled creativity
      max_tokens: 300,
    })

    const reply = completion.choices[0].message.content

    if (!reply) {
      throw new Error('No response from OpenAI')
    }

    return reply
  } catch (error) {
    console.error('❌ AI Sales Reply Error:', error)
    return "🤖 I'm having trouble responding right now. Let me connect you with a human agent!\n\nType: agent"
  }
}

/**
 * ✍️ AGENT-ASSIST: Suggest reply for human agents
 * Helps agents respond faster without writing from scratch
 */
export async function suggestAgentReply(conversationId: string): Promise<string> {
  if (!client) {
    return 'AI service not configured'
  }

  try {
    const conversationHistory = await getConversationContext(conversationId, 10)

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AGENT_SUGGESTION_PROMPT },
        { role: 'system', content: SHOP_CONTEXT },
        ...conversationHistory,
      ],
      temperature: 0.5,
      max_tokens: 200,
    })

    const suggestion = completion.choices[0].message.content

    if (!suggestion) {
      throw new Error('No suggestion generated')
    }

    return suggestion
  } catch (error) {
    console.error('❌ Agent Reply Suggestion Error:', error)
    return 'Unable to generate suggestion'
  }
}

/**
 * 🧠 Conversation summary
 * Quick overview for agents before taking over
 */
export async function summarizeConversation(conversationId: string): Promise<string> {
  if (!client) {
    return 'AI service not configured'
  }

  try {
    const conversationHistory = await getConversationContext(conversationId, 20) // Full context for summary

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SUMMARY_PROMPT },
        ...conversationHistory,
      ],
      temperature: 0.3, // Lower temp for factual summary
      max_tokens: 250,
    })

    const summary = completion.choices[0].message.content

    if (!summary) {
      throw new Error('No summary generated')
    }

    return summary
  } catch (error) {
    console.error('❌ Conversation Summary Error:', error)
    return 'Unable to generate summary'
  }
}

/**
 * Check if AI is enabled
 */
export function isAIEnabled(): boolean {
  return !!client
}

/**
 * Health check for AI service
 */
export async function checkAIHealth(): Promise<boolean> {
  if (!client) return false

  try {
    // Simple health check
    const response = await client.models.list()
    return !!response
  } catch (error) {
    console.error('❌ AI Health Check Failed:', error)
    return false
  }
}
