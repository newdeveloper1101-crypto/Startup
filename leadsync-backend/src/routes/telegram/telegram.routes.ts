import { Router } from 'express'
import { telegramWebhook } from './telegram.controller'

const router = Router()

// Webhook endpoint with optional integrationId parameter
// Supports both /api/telegram/webhook and /api/telegram/webhook/:integrationId
router.post('/webhook', telegramWebhook)
router.post('/webhook/:integrationId', telegramWebhook)

// GET endpoint for health checks
router.get('/webhook', (_req, res) => {
  res.json({ 
    status: 'Telegram webhook endpoint active',
    description: 'POST messages to this endpoint'
  })
})

export default router
