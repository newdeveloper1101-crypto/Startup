import { prisma } from '../lib/prisma'

export async function switchToHuman(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { mode: 'HUMAN' },
  })
}

export async function switchToBot(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { mode: 'BOT' },
  })
}
