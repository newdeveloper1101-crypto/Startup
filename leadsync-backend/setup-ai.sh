#!/usr/bin/env bash
# 🤖 AI Auto-Reply Quick Setup Script
# Run this to quickly set up AI auto-reply

echo "✅ AI Auto-Reply Setup"
echo "===================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in backend directory. Run from leadsync-backend/"
    exit 1
fi

# Install dependencies
echo "📦 Installing OpenAI SDK..."
npm install openai

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️ Creating .env from .env.example..."
    cp .env.example .env
    echo "     ✏️ Edit .env and add your OPENAI_API_KEY"
else
    echo "✅ .env already exists"
fi

# Check for OpenAI key
if grep -q "OPENAI_API_KEY=sk-" .env; then
    echo "✅ OPENAI_API_KEY is configured"
else
    echo "❌ OPENAI_API_KEY not set in .env"
    echo "   Get one at: https://platform.openai.com/api/keys"
    echo "   Then add to .env"
fi

echo ""
echo "🚀 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Add your OpenAI API key to .env:"
echo "   OPENAI_API_KEY=sk-proj-xxxxxxxxxx"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Send a message to your Telegram bot"
echo "   The AI will automatically reply! 🎉"
echo ""
echo "📖 Full guide: Read AI_AUTO_REPLY_SETUP.md"
