# 🤖 Telegram AI Assistant Bot

Production-safe Telegram bot with conversation memory, human handover, and voice support. Built with **python-telegram-bot v20+** and **OpenAI API**.

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Features

### 1️⃣ **Conversation Memory**
- Per-user context storage
- Last 6 messages retained
- Redis support for distributed deployments
- Conversation history retrieval

### 2️⃣ **Human Handover**
- Admin commands: `/agent` (human takes over), `/bot` (resume AI)
- Prevents double replies in production
- Track agent sessions
- Admin-only protected

### 3️⃣ **Voice Support** 🎙️
- Speech-to-Text (Google Speech Recognition)
- Text-to-Speech (gTTS)
- Full voice conversation pipeline
- Automatic audio format conversion (OGG → WAV)

### 4️⃣ **Production-Grade**
- Error handling & logging
- Rate limiting ready
- Docker + docker-compose support
- Redis backend option
- Async/await throughout
- Security best practices

## 📂 Project Structure

```
telegram-bot/
├── bot.py                 # Simple implementation
├── bot_advanced.py       # Production implementation (recommended)
├── config.py             # Configuration management
├── memory.py             # Memory backends (in-memory / Redis)
├── voice.py              # Voice processing (STT / TTS)
├── requirements.txt      # Dependencies
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── Dockerfile            # Docker image
├── docker-compose.yml    # Full stack (bot + Redis)
├── SETUP.md              # Setup & deployment guide
├── TESTING.md            # Testing guide
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- FFmpeg (for audio processing)
- Telegram account
- OpenAI API key

### 1. Clone & Setup

```bash
cd telegram-bot
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your keys
TELEGRAM_BOT_TOKEN=your_bot_token
OPENAI_API_KEY=your_openai_key
ADMIN_IDS=your_user_id
```

### 3. Run

```bash
# Simple version
python bot.py

# Production version (recommended)
python bot_advanced.py
```

## 🎮 Bot Commands

| Command | Description | Admin |
|---------|-------------|-------|
| `/start` | Welcome message | ❌ |
| `/help` | Show all commands | ❌ |
| `/status` | Current mode & history | ❌ |
| `/agent` | Enable human handover | ✅ |
| `/bot` | Resume AI | ✅ |
| `/clear` | Clear conversation | ✅ |

## 🧠 Architecture

```
User Input (Text/Voice)
    ↓
Handler Layer
    ├── CommandHandler (/help, /agent, etc.)
    ├── MessageHandler (text messages)
    └── VoiceHandler (audio messages)
    ↓
Agent Mode Check
    ├── YES → Skip AI (human handover active)
    └── NO → Continue
    ↓
Memory Manager
    ├── Retrieve conversation history
    ├── Add user message
    └── Build context for API
    ↓
OpenAI API
    ├── GPT-4o-mini model
    ├── Streaming capable
    └── Error handling
    ↓
Voice Processing (if voice message)
    ├── STT: Audio → Text
    ├── TTS: Response → Audio
    └── Send voice reply
    ↓
Telegram Reply
```

## 🔐 Security

✅ **Implemented**
- Admin-only sensitive commands
- API key via environment variables
- No credentials in code
- Input validation & sanitization
- Error logging without sensitive data
- Rate limiting support

## 📊 Memory Backends

### In-Memory (Development)
```python
USE_REDIS=False
```
- Fast for single instance
- Data lost on restart
- Perfect for testing

### Redis (Production)
```python
USE_REDIS=True
REDIS_URL=redis://your-server:6379
```
- Distributed memory
- Persistent between restarts
- Multi-instance support
- Perfect for scaling

## 🐳 Docker Deployment

### Single Bot
```bash
docker build -t telegram-bot .
docker run -e TELEGRAM_BOT_TOKEN=xxx -e OPENAI_API_KEY=yyy telegram-bot
```

### Full Stack (Bot + Redis)
```bash
docker-compose up -d
```

## 🧪 Testing

```bash
# Test imports
python -c "import telegram; import openai; print('✅ All imports ok')"

# Run memory tests
python -c "
import asyncio
from memory import get_memory_backend, MemoryManager

async def test():
    backend = get_memory_backend()
    manager = MemoryManager(backend)
    await manager.add_user_message(123, 'Hi')
    history = await manager.get_conversation(123)
    print(f'✅ Memory test passed: {len(history)} messages')

asyncio.run(test())
"
```

## 📈 Scaling

1. **Single Instance**: Use in-memory backend
2. **Multiple Instances**: Enable Redis backend
3. **Load Balancing**: Use webhook instead of polling
4. **Database**: Add persistence layer for user preferences

## 🔄 Update Memory

```python
# Add custom memory logic
async def add_user_preference(chat_id, key, value):
    await memory_manager.backend.set_metadata(chat_id, key, value)

async def get_user_preference(chat_id, key):
    return await memory_manager.backend.get_metadata(chat_id, key)
```

## 🎤 Voice Configuration

```python
# In config.py
speech_engine: str = "google"  # or "azure", "watson", etc.
max_voice_duration: int = 120  # seconds
enable_voice: bool = True
```

## 📝 Logging

```python
# Default: INFO level
# Set to DEBUG for verbose output
LOG_LEVEL=DEBUG python bot_advanced.py

# Log to file
LOG_FILE=bot.log python bot_advanced.py
```

## 🚨 Common Issues

### Bot not responding
- Check `TELEGRAM_BOT_TOKEN` is valid
- Check network connectivity
- Look at logs: `LOG_LEVEL=DEBUG`

### Voice not working
- Verify FFmpeg installed: `ffmpeg -version`
- Check audio format is OGG
- May need `apt-get install ffmpeg` on Linux

### Memory not persisting
- If using in-memory backend, data is lost on restart
- Enable Redis: `USE_REDIS=True`
- Set proper `REDIS_URL`

### High API latency
- Check OpenAI API status
- Network issues?
- Consider caching responses

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup & deployment guide
- **[TESTING.md](TESTING.md)** - Testing & debugging guide
- [python-telegram-bot docs](https://docs.python-telegram-bot.org)
- [OpenAI API docs](https://platform.openai.com/docs)

## 🛣️ Roadmap

- [ ] Message rate limiting middleware
- [ ] Database persistence (SQLite/PostgreSQL)
- [ ] Analytics & usage tracking
- [ ] NLP intent detection
- [ ] Multi-language support
- [ ] Voice model selection
- [ ] Custom system prompts per user
- [ ] Webhook support for higher throughput
- [ ] User preferences storage
- [ ] Conversation threading

## 🤝 Contributing

Pull requests welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Add tests
4. Submit PR

## 📜 License

MIT License - See LICENSE file

## 💬 Support

- 📖 Read [SETUP.md](SETUP.md) for detailed guides
- 🧪 Check [TESTING.md](TESTING.md) for troubleshooting
- 🐛 Enable debug logging: `LOG_LEVEL=DEBUG`
- 📞 Check GitHub issues

## 🎓 Learn More

- [python-telegram-bot v20 Migration](https://github.com/python-telegram-bot/python-telegram-bot/wiki/Introduction-to-the-API-based-MTProtoAPI)
- [OpenAI Async Client](https://github.com/openai/openai-python)
- [Redis in Python](https://redis-py.readthedocs.io)
- [GTTs Documentation](https://gtts.readthedocs.io)

---

**Made with ❤️ for Telegram Bot Developers**

**Last Updated:** February 11, 2025
