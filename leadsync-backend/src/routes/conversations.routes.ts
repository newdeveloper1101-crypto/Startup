import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { prisma } from '../lib/prisma'
import { suggestAgentReply, summarizeConversation, isAIEnabled } from '../services/ai.service'

const router = Router()

/**
 * GET /api/conversations
 * Fetch all TELEGRAM conversations for logged-in company
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const companyId = req.user.companyId

    const conversations = await prisma.conversation.findMany({
      where: {
        companyId,
        channel: 'TELEGRAM'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            contact: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    const response = conversations.map(conversation => ({
      id: conversation.id,
      lead: conversation.lead,
      lastMessage: conversation.messages[0]?.content || '',
      lastMessageAt: conversation.messages[0]?.createdAt || null,
      unreadCount: 0 // placeholder for next steps
    }))

    res.json(response)
  } catch (error) {
    console.error('Fetch conversations error:', error)
    res.status(500).json({ message: 'Failed to fetch conversations' })
  }
})

/**
 * GET /api/conversations/:id/messages
 * Fetch all messages for a conversation
 */
router.get(
  '/:id/messages',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const companyId = req.user.companyId
      const conversationId = req.params.id

      // Ensure conversation belongs to this company
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          companyId
        }
      })

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }

      const messages = await prisma.message.findMany({
        where: {
          conversationId
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      res.json(messages)
    } catch (error) {
      console.error('Fetch messages error:', error)
      res.status(500).json({ message: 'Failed to fetch messages' })
    }
  }
)

/**
 * GET /api/conversations/:id/suggest-reply
 * 🤖 AI Agent-Assist: Suggest a reply for human agent
 * 
 * Helps agents respond faster by suggesting a sales-optimized reply
 */
router.get(
  '/:id/suggest-reply',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      if (!isAIEnabled()) {
        return res.status(503).json({ message: 'AI service not available' })
      }

      const companyId = req.user.companyId
      const conversationId = req.params.id

      // Verify conversation belongs to this company
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          companyId,
        },
      })

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }

      const suggestion = await suggestAgentReply(conversationId)

      res.json({ suggestion })
    } catch (error) {
      console.error('Suggest reply error:', error)
      res
        .status(500)
        .json({ message: 'Failed to generate reply suggestion' })
    }
  }
)

/**
 * GET /api/conversations/:id/summary
 * 🧠 AI Agent-Assist: Summarize conversation
 * 
 * Quick overview for agents before taking over conversation
 */
router.get(
  '/:id/summary',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      if (!isAIEnabled()) {
        return res.status(503).json({ message: 'AI service not available' })
      }

      const companyId = req.user.companyId
      const conversationId = req.params.id

      // Verify conversation belongs to this company
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          companyId,
        },
      })

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }

      const summary = await summarizeConversation(conversationId)

      res.json({ summary })
    } catch (error) {
      console.error('Summarize conversation error:', error)
      res.status(500).json({ message: 'Failed to summarize conversation' })
    }
  }
)

export default router
