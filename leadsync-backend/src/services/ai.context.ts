/**
 * 🧠 CONVERSATION CONTEXT (Real DB Memory)
 * 
 * Fetches true conversation history from Prisma
 * No in-memory hacks, pure SaaS memory
 */

import { prisma } from '../lib/prisma'

export enum MessageSender {
  CLIENT = 'CLIENT',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Fetch conversation history with proper OpenAI role mapping
 * 
 * Role mapping:
 * - CLIENT → "user" (customer)
 * - AGENT → "assistant" (human sales agent)
 * - SYSTEM → "assistant" (AI system)
 */
export async function getConversationContext(
  conversationId: string,
  limit: number = 10
): Promise<ConversationMessage[]> {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })

  return messages.map((msg: any) => ({
    role:
      msg.sender === MessageSender.CLIENT
        ? 'user'
        : msg.sender === MessageSender.AGENT
          ? 'assistant'
          : 'assistant', // SYSTEM messages also use 'assistant' role
    content: msg.content,
  }))
}

/**
 * Get conversation summary for display
 * Returns last customer message + metadata
 */
export async function getConversationSummary(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      lead: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  return {
    conversation,
    lastMessage: conversation?.messages[0],
  }
}

/**
 * Get full conversation for agent viewing
 */
export async function getFullConversation(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      lead: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}
