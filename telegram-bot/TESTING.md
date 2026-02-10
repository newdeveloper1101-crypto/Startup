# Development & Testing Guide

## 🧪 Local Testing

### 1. Test Memory Module

```bash
python -c "
import asyncio
from memory import get_memory_backend, MemoryManager

async def test_memory():
    backend = get_memory_backend()
    manager = MemoryManager(backend)
    
    # Add messages
    await manager.add_user_message(123, 'Hi there')
    await manager.add_assistant_message(123, 'Hello!')
    
    # Get history
    history = await manager.get_conversation(123)
    print('History:', history)
    
    # Get summary
    summary = await manager.get_summary(123)
    print('Summary:', summary)
    
    # Clear
    await manager.clear_conversation(123)
    print('Cleared!')

asyncio.run(test_memory())
"
```

### 2. Test Voice Processing

```bash
# Create test WAV file
python -c "
import wave
import struct

# Generate 1kHz sine wave
rate = 44100
freq = 1000
duration = 2
frames = []

for i in range(int(rate * duration)):
    value = int(32767 * 0.5 * ((i / rate) % (1/freq)))
    frames.append(struct.pack('h', value))

with wave.open('test.wav', 'w') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(rate)
    wav.writeframes(b''.join(frames))
    
print('Created test.wav')
"

# Test STT
python -c "
import asyncio
from voice import GoogleSTT

async def test_stt():
    stt = GoogleSTT()
    text = await stt.transcribe('test.wav')
    print(f'Transcribed: {text}')

# asyncio.run(test_stt())  # Requires real audio
"

# Test TTS
python -c "
import asyncio
from voice import GoogleTTS

async def test_tts():
    tts = GoogleTTS()
    success = await tts.synthesize('Hello world', 'test_output.mp3')
    print(f'TTS success: {success}')

asyncio.run(test_tts())
"
```

### 3. Test OpenAI Integration

```bash
python -c "
import asyncio
from openai import AsyncOpenAI

async def test_openai():
    client = AsyncOpenAI()
    response = await client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[{'role': 'user', 'content': 'Say hello'}]
    )
    print(response.choices[0].message.content)

asyncio.run(test_openai())
"
```

## 🔍 Integration Tests

### Full Text Pipeline

```python
# tests/test_text_pipeline.py
import asyncio
import os
from dotenv import load_dotenv
from unittest.mock import Mock, patch, AsyncMock

load_dotenv()

from bot_advanced import text_handler

async def test_text_handler():
    # Mock update and context
    update = Mock()
    update.effective_chat.id = 123
    update.effective_user.id = 456
    update.message.text = "Hello, bot!"
    update.message.chat.send_action = AsyncMock()
    update.message.reply_text = AsyncMock()
    
    context = Mock()
    
    # Mock agent mode
    from bot_advanced import agent_mode
    agent_mode.clear()
    
    # Run handler
    await text_handler(update, context)
    
    # Verify reply was sent
    update.message.reply_text.assert_called_once()
    print("✅ Text handler test passed")

# Run test
asyncio.run(test_text_handler())
```

### Full Voice Pipeline

```python
# tests/test_voice_pipeline.py
import asyncio
import os
from unittest.mock import Mock, patch, AsyncMock

from bot_advanced import voice_handler

async def test_voice_handler():
    # Mock update and context
    update = Mock()
    update.effective_chat.id = 123
    update.message.voice.get_file = AsyncMock()
    update.message.chat.send_action = AsyncMock()
    update.message.reply_voice = AsyncMock()
    
    # Mock file operations
    mock_file = AsyncMock()
    mock_file.download_to_drive = AsyncMock()
    update.message.voice.get_file.return_value = mock_file
    
    context = Mock()
    
    # Mock agent mode
    from bot_advanced import agent_mode
    agent_mode.clear()
    
    # Would need mocked STT/TTS for real test
    print("⚠️ Voice test requires mocked STT/TTS")

```

## 📊 Performance Testing

### Load Test

```bash
# Test with multiple concurrent users
python -c "
import asyncio
import random
from datetime import datetime

async def simulate_user(user_id, messages_count):
    '''Simulate a user sending messages'''
    for i in range(messages_count):
        # Simulate message processing
        await asyncio.sleep(random.uniform(0.1, 0.5))
        print(f'User {user_id}: Message {i+1}')

async def main():
    # Simulate 10 users with 5 messages each
    start = datetime.now()
    
    tasks = [
        simulate_user(uid, 5)
        for uid in range(10)
    ]
    
    await asyncio.gather(*tasks)
    
    duration = (datetime.now() - start).total_seconds()
    print(f'Completed 50 messages in {duration:.2f}s')
    print(f'Throughput: {50/duration:.2f} msg/s')

asyncio.run(main())
"
```

## 🐛 Debug Mode

Enable verbose logging:

```bash
LOG_LEVEL=DEBUG python bot.py
```

Or in code:

```python
import logging
logging.getLogger().setLevel(logging.DEBUG)
```

## 📝 Unit Test Examples

### Test Memory Backend

```python
# tests/test_memory.py
import pytest
import asyncio
from memory import InMemoryBackend, RedisBackend, MemoryManager

@pytest.mark.asyncio
async def test_in_memory_backend():
    backend = InMemoryBackend(max_history=3)
    
    # Add messages
    await backend.add_message(123, "user", "Hello")
    await backend.add_message(123, "assistant", "Hi there!")
    
    # Get history
    history = await backend.get_history(123)
    assert len(history) == 2
    assert history[0]["role"] == "user"
    
    # Clear
    await backend.clear_history(123)
    history = await backend.get_history(123)
    assert len(history) == 0

@pytest.mark.asyncio
async def test_max_history():
    backend = InMemoryBackend(max_history=2)
    
    for i in range(5):
        await backend.add_message(123, "user", f"Message {i}")
    
    history = await backend.get_history(123)
    assert len(history) == 2  # Only last 2
    assert history[-1]["content"] == "Message 4"

# Run tests
# pytest tests/test_memory.py -v
```

### Test Config

```python
# tests/test_config.py
from config import BotConfig
import os

def test_config_validation():
    # Test with missing token
    os.environ.pop('TELEGRAM_BOT_TOKEN', None)
    
    try:
        config = BotConfig()
        config.validate()
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "TELEGRAM_BOT_TOKEN" in str(e)

def test_config_parsing():
    os.environ['ADMIN_IDS'] = '123,456,789'
    config = BotConfig()
    
    assert 123 in config.admin_ids
    assert 456 in config.admin_ids
    assert 789 in config.admin_ids
```

## ✅ Production Checklist

- [ ] All environment variables set
- [ ] Logging configured
- [ ] Error handling tested
- [ ] Rate limiting considered
- [ ] Security audit passed
- [ ] Monitoring set up
- [ ] Backup strategy defined
- [ ] API keys rotated
- [ ] Tests passing
- [ ] Documentation updated

## 🚀 CI/CD Testing

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-asyncio
      
      - name: Run tests
        run: pytest tests/ -v
      
      - name: Lint
        run: |
          pip install pylint
          pylint telegram_bot/
```

---

**Happy testing! 🧪**
