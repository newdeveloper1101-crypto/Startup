import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { prisma } from '../lib/prisma'

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

export default router
