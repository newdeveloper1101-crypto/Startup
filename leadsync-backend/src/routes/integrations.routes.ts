import { Router } from 'express'

const router = Router()

router.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Frontend connected to backend 🚀',
  })
})

export default router
