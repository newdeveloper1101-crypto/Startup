import express from 'express'
import cors from 'cors'

// Routes
import authRoutes from './routes/auth.routes'
import leadsRoutes from './routes/leads/leads.routes'
import telegramRoutes from './routes/telegram/telegram.routes'
import integrationsRoutes from './routes/integrations.routes'
import secureRoutes from './routes/secure.routes'
import conversationRoutes from './routes/conversations.routes'
import publicRoutes from './routes/public.routes'



console.log('🔥 app.ts loaded')

const app = express()

/* -------------------- Middleware -------------------- */
// Dynamic CORS configuration for development and production
const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'
console.log(`🌐 CORS Origin: ${corsOrigin}`)

app.use(cors({
  origin: corsOrigin,
  credentials: true
}))

app.use(express.json())

/* -------------------- Health Check -------------------- */
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    message: 'LeadSync backend running 🚀',
    timestamp: new Date().toISOString()
  })
})

/* -------------------- API Routes -------------------- */
console.log('🔥 mounting auth routes')
app.use('/api/auth', authRoutes)

app.use('/api/leads', leadsRoutes)
app.use('/api/integrations', integrationsRoutes)
app.use('/api', secureRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/telegram', telegramRoutes)
app.use('/api/public', publicRoutes)
app.use('/api', secureRoutes);


/* -------------------- Export App -------------------- */
export default app
