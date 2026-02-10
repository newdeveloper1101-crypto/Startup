import { prisma } from '../lib/prisma'
import { Channel, MessageSender } from '@prisma/client'

export async function getCompanyByBotToken(botToken: string) {
  return prisma.company.findFirst({
    where: { telegramBotToken: botToken },
  })
}

export async function getOrCreateLead(
  companyId: string,
  chatId: string,
  username?: string | null
) {
  let lead = await prisma.lead.findFirst({
    where: {
      contact: chatId,
      channel: Channel.TELEGRAM,
      companyId,
    },
  })

  if (lead) return lead

  return prisma.lead.create({
    data: {
      contact: chatId,
      name: username,
      channel: Channel.TELEGRAM,
      companyId,
    },
  })
}

export async function getOrCreateConversation(
  leadId: string,
  companyId: string
) {
  let conversation = await prisma.conversation.findFirst({
    where: {
      leadId,
      companyId,
      channel: Channel.TELEGRAM,
    },
  })

  if (conversation) return conversation

  return prisma.conversation.create({
    data: {
      leadId,
      companyId,
      channel: Channel.TELEGRAM,
      mode: 'BOT',
    },
  })
}

export async function saveMessage(
  conversationId: string,
  content: string,
  sender: MessageSender
) {
  return prisma.message.create({
    data: {
      conversationId,
      content,
      sender,
    },
  })
}
