import { Request, Response } from 'express'
import { sendTelegramMessage } from '../../bot/telegram.sender'
import { switchToBot, switchToHuman } from '../../bot/bot.logic'
import {
  getCompanyByBotToken,
  getOrCreateLead,
  getOrCreateConversation,
  saveMessage,
} from '../../services/telegram.service'
import { MessageSender } from '@prisma/client'

export async function telegramWebhook(req: Request, res: Response) {
  try {
    console.log('📩 Telegram webhook hit')

    const message = req.body?.message
    if (!message?.text) {
      return res.json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const text = message.text.trim()
    const botToken = req.params.botToken
    const username = message.from?.username ?? null

    console.log('👤 Chat ID:', chatId)
    console.log('💬 Text:', text)

    /* -------------------- Company -------------------- */
    const company = await getCompanyByBotToken(botToken)
    if (!company) return res.json({ ok: true })

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

      return res.json({ ok: true })
    }

    /* -------------------- BOT MODE -------------------- */
    if (conversation.mode === 'BOT') {
      if (/agent|human|support/i.test(text)) {
        await switchToHuman(conversation.id)

        const handoff =
          '👨‍💼 You’re now connected to a human agent. Please type your question.'

        await saveMessage(conversation.id, handoff, MessageSender.SYSTEM)
        await sendTelegramMessage(botToken, chatId, handoff)

        return res.json({ ok: true })
      }

      const botReply = `🤖 Thanks for your message!

Ask about:
• Products
• Pricing
• Support

Or type *agent* to talk to a human.`

      await saveMessage(conversation.id, botReply, MessageSender.SYSTEM)
      await sendTelegramMessage(botToken, chatId, botReply)
    }

    return res.json({ ok: true })
  } catch (err) {
    console.error('❌ Telegram webhook error:', err)
    return res.status(500).json({ ok: false })
  }
}
