import { Router } from 'express'
import { prisma } from '../../lib/prisma'

const router = Router()

/**
 * GET /api/leads?companyId=xxx
 * Fetch leads for a specific company
 */
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' })
    }

    const leads = await prisma.lead.findMany({
      where: {
        companyId: String(companyId),
      },
      include: {
        conversations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(leads)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch leads' })
  }
})

export default router
