import { prisma } from './lib/prisma'
import {
  generateSalesReply,
  suggestAgentReply,
  summarizeConversation,
  isAIEnabled,
  checkAIHealth,
} from './services/ai.service'
import { MessageSender } from '@prisma/client'

/**
 * 🧪 Test AI Sales Automation System
 *
 * Run: npx ts-node src/test-ai.ts
 *
 * Tests:
 * 1. AI Health Check
 * 2. Sales Reply Generation
 * 3. Agent Reply Suggestion
 * 4. Conversation Summary
 */

async function testAISystem() {
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('🧪 AI Sales Automation System - Test Suite')
  console.log('═══════════════════════════════════════════════════════════\n')

  try {
    // ✅ Test 1: Health Check
    console.log('✅ Test 1: AI Health Check')
    console.log('─────────────────────────────────────')

    if (!isAIEnabled()) {
      console.error('❌ OpenAI API key not configured!')
      console.error('   Add OPENAI_API_KEY to your .env file')
      process.exit(1)
    }

    const apiHealth = await checkAIHealth()
    if (apiHealth) {
      console.log('✅ OpenAI API is reachable\n')
    } else {
      console.error('❌ OpenAI API check failed\n')
      process.exit(1)
    }

    // ✅ Test 2: Create Test Conversation
    console.log('✅ Test 2: Create Test Conversation')
    console.log('─────────────────────────────────────')

    // Find or create test company
    let company = await prisma.company.findFirst({
      where: { name: 'Test Company' },
    })

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Test Company',
          telegramBotToken: 'test-token-123',
        },
      })
      console.log('✅ Created test company:', company.id)
    } else {
      console.log('✅ Using existing test company:', company.id)
    }

    // Find or create test lead
    let lead = await prisma.lead.findFirst({
      where: {
        contact: 'test-customer-123',
        companyId: company.id,
      },
    })

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          contact: 'test-customer-123',
          name: 'Test Customer',
          channel: 'TELEGRAM',
          companyId: company.id,
        },
      })
      console.log('✅ Created test lead:', lead.id)
    } else {
      console.log('✅ Using existing test lead:', lead.id)
    }

    // Create test conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        leadId: lead.id,
        companyId: company.id,
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          leadId: lead.id,
          companyId: company.id,
          channel: 'TELEGRAM',
          mode: 'BOT',
        },
      })
      console.log('✅ Created test conversation:', conversation.id)
    } else {
      console.log('✅ Using existing test conversation:', conversation.id)
    }

    // Add test messages
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: "Hi, what products do you have?",
        sender: MessageSender.CLIENT,
      },
    })

    console.log('✅ Added test message\n')

    // ✅ Test 3: Generate Sales Reply
    console.log('✅ Test 3: Generate Sales Reply')
    console.log('─────────────────────────────────────')

    const salesReply = await generateSalesReply(conversation.id)
    console.log('🤖 Sales Reply Generated:')
    console.log(`   "${salesReply}"\n`)

    // Save AI reply to conversation
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: salesReply,
        sender: MessageSender.SYSTEM,
      },
    })

    // ✅ Test 4: Suggest Agent Reply
    console.log('✅ Test 4: Suggest Agent Reply')
    console.log('─────────────────────────────────────')

    // Add customer follow-up
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: "Can you tell me more about the earbuds?",
        sender: MessageSender.CLIENT,
      },
    })

    const agentSuggestion = await suggestAgentReply(conversation.id)
    console.log('✍️  Agent Reply Suggestion:')
    console.log(`   "${agentSuggestion}"\n`)

    // ✅ Test 5: Summarize Conversation
    console.log('✅ Test 5: Summarize Conversation')
    console.log('─────────────────────────────────────')

    const summary = await summarizeConversation(conversation.id)
    console.log('📝 Conversation Summary:')
    console.log(`${summary}\n`)

    // ✅ Cleanup
    console.log('═══════════════════════════════════════════════════════════')
    console.log('✅ All Tests Passed!')
    console.log('═══════════════════════════════════════════════════════════\n')

    console.log('📊 Test Results Summary:')
    console.log(`   Company ID: ${company.id}`)
    console.log(`   Lead ID: ${lead.id}`)
    console.log(`   Conversation ID: ${conversation.id}`)
    console.log(`   Messages Exchanged: 3`)
    console.log(`\n🚀 Next Steps:`)
    console.log(`   1. Send real message to Telegram bot`)
    console.log(`   2. Verify AI auto-reply in Telegram`)
    console.log(`   3. Test /suggest-reply API endpoint`)
    console.log(`   4. Test /summary API endpoint`)
    console.log(`\n📖 See AI_IMPLEMENTATION_GUIDE.md for full docs\n`)

  } catch (error) {
    console.error('❌ Test Failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testAISystem().catch((err) => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
