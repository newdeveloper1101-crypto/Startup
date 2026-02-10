import { Request, Response } from 'express'
import { sendTelegramMessage } from '../../bot/telegram.sender'
import { switchToBot, switchToHuman } from '../../bot/bot.logic'
import {
  getCompanyByBotToken,
  getOrCreateLead,
  getOrCreateConversation,
  saveMessage,
  getConversationHistory,
} from '../../services/telegram.service'
import { generateAIReply, getCompanyAIContext, isAIEnabled } from '../../services/ai.service'
import { MessageSender } from '@prisma/client'

export async function telegramWebhook(req: Request, res: Response) {
  try {
    console.log('📩 Telegram webhook hit')
    console.log('🔗 Path params:', req.params)
    console.log('📦 Request body:', req.body)

    const message = req.body?.message
    if (!message?.text) {
      console.log('⚠️ No text message, sending 200 OK')
      return res.status(200).json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const text = message.text.trim()
    // Get bot token from environment variable (set in Railway)
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const username = message.from?.username ?? null

    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN not set in environment')
      return res.status(200).json({ ok: false, error: 'Bot token not configured' })
    }

    console.log('👤 Chat ID:', chatId)
    console.log('💬 Text:', text)

    /* -------------------- Company -------------------- */
    const company = await getCompanyByBotToken(botToken)
    if (!company) {
      console.warn('⚠️ Company not found for token, sending 200 OK')
      return res.status(200).json({ ok: true })
    }

    /* -------------------- Lead -------------------- */
    const lead = await getOrCreateLead(company.id, chatId, username)

    /* -------------------- Conversation -------------------- */
    const conversation = await getOrCreateConversation(lead.id, company.id)

    /* -------------------- Save CLIENT message -------------------- */
    await saveMessage(conversation.id, text, MessageSender.CLIENT)

    /* -------------------- AUTO BOT START (KEY FIX) -------------------- */
    if (conversation.mode === 'HUMAN') {
      await switchToBot(conversation.id)

      const greeting = `👋 Welcome to *${company.name}*!

How can we help you?
• Products
• Pricing
• Support
• 👨‍💼 Talk to agent`

      await saveMessage(conversation.id, greeting, MessageSender.SYSTEM)
      await sendTelegramMessage(botToken, chatId, greeting)

      return res.status(200).json({ ok: true })
    }

    /* -------------------- BOT MODE -------------------- */
    if (conversation.mode === 'BOT') {
      if (/agent|human|support/i.test(text)) {
        await switchToHuman(conversation.id)

        const handoff =
          '👨‍💼 You’re now connected to a human agent. Please type your question.'

        await saveMessage(conversation.id, handoff, MessageSender.SYSTEM)
        await sendTelegramMessage(botToken, chatId, handoff)

        return res.status(200).json({ ok: true })
      }

      // 🤖 Generate AI reply
      let botReply: string

      if (isAIEnabled()) {
        try {
          const history = await getConversationHistory(conversation.id, 8)
          const aiContext = await getCompanyAIContext(company.id)

          botReply = await generateAIReply({
            userMessage: text,
            conversationHistory: history,
            companyName: company.name,
            systemPrompt: aiContext.systemPrompt,
          })

          console.log('🤖 AI Reply Generated:', botReply)
        } catch (aiError) {
          console.error('⚠️ AI generation failed, using fallback:', aiError)
          botReply = `🤖 Thanks for your message! How can we help?\n\nType "agent" to speak with a human.`
        }
      } else {
        botReply = `🤖 Thanks for your message!\n\nType "agent" to speak with a human.`
      }

      await saveMessage(conversation.id, botReply, MessageSender.SYSTEM)
      await sendTelegramMessage(botToken, chatId, botReply)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('❌ Telegram webhook error:', err)
    return res.status(200).json({ ok: false })
  }
}
