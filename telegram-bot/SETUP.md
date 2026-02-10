# 🤖 Telegram Bot Setup & Deployment Guide

## 📋 Quick Start

### 1️⃣ Prerequisites
```bash
# Python 3.9+
python --version

# FFmpeg (for audio conversion)
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg
# Linux: apt-get install ffmpeg
```

### 2️⃣ Installation

```bash
cd telegram-bot
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3️⃣ Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your keys
nano .env
```

**Required environment variables:**
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPENAI_API_KEY=your_openai_api_key
ADMIN_IDS=123456789,987654321
```

**Optional:**
```env
USE_REDIS=False                    # Set to True for distributed memory
REDIS_URL=redis://localhost:6379
TEMP_AUDIO_DIR=./audio_temp
LOG_LEVEL=INFO                     # DEBUG, INFO, WARNING, ERROR
WEBHOOK_ENABLED=False              # For webhooks instead of polling
```

### 4️⃣ Run Locally

```bash
python bot.py
```

Expected output:
```
2025-02-11 10:30:45 - bot - INFO - 🚀 Bot starting...
2025-02-11 10:30:47 - bot - INFO - Bot is polling...
```

## 🏭 Production Deployment

### Option A: Docker (Recommended)

```bash
docker build -t telegram-bot .
docker run -d \
  --name telegram-bot \
  -e TELEGRAM_BOT_TOKEN="your_token" \
  -e OPENAI_API_KEY="your_key" \
  -e ADMIN_IDS="123456789" \
  telegram-bot
```

### Option B: systemd (Linux)

Create `/etc/systemd/system/telegram-bot.service`:

```ini
[Unit]
Description=Telegram AI Bot
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=telegrambot
WorkingDirectory=/opt/telegram-bot
EnvironmentFile=/opt/telegram-bot/.env
ExecStart=/opt/telegram-bot/venv/bin/python bot.py

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
sudo systemctl status telegram-bot
```

### Option C: Railway/Cloud Platform

1. Push to GitHub
2. Connect repository to Railway
3. Set environment variables
4. Deploy

### Option D: Supervisor (Linux)

Create `/etc/supervisor/conf.d/telegram-bot.conf`:

```ini
[program:telegram-bot]
command=/opt/telegram-bot/venv/bin/python bot.py
directory=/opt/telegram-bot
user=telegrambot
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/telegram-bot.log
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use secret management (GitHub Secrets, Railway Secrets, etc.)
- Rotate API keys regularly

### 2. Admin Authentication
```python
# In bot.py - Only admins can use sensitive commands
if update.effective_user.id not in ADMIN_IDS:
    await update.message.reply_text("❌ Unauthorized")
    return
```

### 3. Rate Limiting
```python
# Add rate limiting middleware (future enhancement)
MAX_REQUESTS_PER_MINUTE = 30
```

### 4. Input Validation
```python
# Validate message length
if len(user_text) > 2000:
    await update.message.reply_text("❌ Message too long")
    return
```

### 5. Logging
- Log all important events
- Don't log sensitive data (API keys, user data)
- Use structured logging

### 6. HTTPS/TLS
- If using webhooks, always use HTTPS
- Configure proper SSL certificates

## 📊 Monitoring & Logs

### View Real-time Logs
```bash
# Local
python bot.py

# Docker
docker logs -f telegram-bot

# systemd
sudo journalctl -u telegram-bot -f

# Supervisor
tail -f /var/log/telegram-bot.log
```

### Key Metrics to Monitor
- Message count per day
- Response times (AI latency)
- Error rates
- Voice processing success rate
- Memory usage (in-memory vs Redis)

## 🔄 Scaling to Production

### 1. Use Redis for Distributed Memory
```env
USE_REDIS=True
REDIS_URL=redis://your-redis-server:6379
```

### 2. Horizontal Scaling
- One bot instance per token (Telegram allows multiple)
- Load balance API calls
- Use shared Redis

### 3. Database Integration
- Persist conversation history
- Track user preferences
- Analytics

```python
# Example: Integration with database
async def save_message_to_db(chat_id, role, content):
    async with get_db_connection() as conn:
        await conn.execute(
            "INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)",
            (chat_id, role, content)
        )
```

### 4. Webhook Support
For higher throughput, use webhooks instead of polling.

## 🧪 Testing

```bash
# Test voice recognition
python -c "
from speech_recognition import Recognizer, AudioFile
r = Recognizer()
with AudioFile('test.wav') as source:
    audio = r.record(source)
    print(r.recognize_google(audio))
"

# Test TTS
python -c "
from gtts import gTTS
gTTS('Hello').save('test.mp3')
"

# Test OpenAI connection
python -c "
from openai import AsyncOpenAI
import asyncio

async def test():
    client = AsyncOpenAI()
    response = await client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[{'role': 'user', 'content': 'Hi'}]
    )
    print(response.choices[0].message.content)

asyncio.run(test())
"
```

## 🐛 Troubleshooting

### Bot not responding
1. Check `TELEGRAM_BOT_TOKEN` is valid
2. Check network connectivity
3. Look at logs: `python bot.py` (verbose mode)

### Voice not working
1. Ensure FFmpeg is installed: `ffmpeg -version`
2. Check `SpeechRecognition` library
3. Verify audio format is OGG

### High latency
1. Check OpenAI API status
2. Network issues?
3. Consider caching responses

### Memory growing
1. Check Redis connection if `USE_REDIS=True`
2. Review log file sizes
3. Monitor long-running instances

## 📚 Architecture

```
User Message
    ↓
CommandHandler / MessageHandler
    ↓
Agent Mode Check
    ↓
Memory Manager (get_memory)
    ↓
OpenAI API (async)
    ↓
Memory Manager (save_memory)
    ↓
Telegram Reply
```

## 🚀 Next Steps

1. **Rate Limiting**: Add `python-ratelimit` package
2. **Database**: Add SQLite/PostgreSQL for persistence
3. **Webhooks**: For higher throughput
4. **Analytics**: Track usage, costs
5. **NLP**: Add intent detection
6. **Multilingual**: Support more languages

## 📞 Support

For issues:
1. Check logs carefully
2. Verify environment variables
3. Test individual components
4. Check GitHub issues

---

**Happy botting! 🤖**
