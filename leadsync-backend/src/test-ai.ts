import { prisma } from './lib/prisma'
import { generateAIReply, isAIEnabled } from './services/ai.service'

/**
 * 🧪 Test AI Auto-Reply Locally
 * 
 * Run: npx ts-node src/test-ai.ts
 * 
 * This tests AI without needing Telegram or a real bot
 */

async function testAIAutoReply() {
  console.log('\n🧪 Testing AI Auto-Reply...\n')

  if (!isAIEnabled()) {
    console.error('❌ OpenAI API key not configured!')
    console.error('   Add OPENAI_API_KEY to your .env file')
    process.exit(1)
  }

  const testMessages = [
    'What are your products?',
    'How much does it cost?',
    'I need help with my account',
    'Can I talk to a human?',
    'What is your support hours?',
  ]

  console.log('📨 Testing AI responses...\n')

  for (const userMessage of testMessages) {
    console.log(`👤 User: "${userMessage}"`)

    try {
      const reply = await generateAIReply({
        userMessage,
        companyName: 'Test Company',
        conversationHistory: [],
      })

      console.log(`🤖 AI: "${reply}"`)
      console.log('---')
    } catch (error) {
      console.error(`❌ Error: ${error}`)
    }
  }

  console.log('\n✅ AI Test Complete!')
  console.log('\nNext: Send a real message to your Telegram bot 🚀')

  process.exit(0)
}

testAIAutoReply().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
