import { Router } from 'express'
import { telegramWebhook } from './telegram.controller'

const router = Router()

// Standard webhook endpoint (POST for Telegram messages)
router.post('/webhook', telegramWebhook)

// Optional: GET endpoint for health checks
router.get('/webhook', (_req, res) => {
  res.json({ 
    status: 'Telegram webhook endpoint active',
    description: 'POST messages to this endpoint'
  })
})

export default router
