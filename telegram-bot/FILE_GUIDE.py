"""
Quick reference for all Telegram Bot files and their purposes
"""

FILES_STRUCTURE = {
    "Core Bot Files": {
        "bot.py": "Simple production-safe implementation with all 3 features (memory, agent, voice)",
        "bot_advanced.py": "Advanced modular implementation using separate config/memory/voice modules",
        "config.py": "Configuration management with validation (in-memory or Redis backend)",
        "memory.py": "Memory management layer - supports both InMemory and Redis backends",
        "voice.py": "Voice processing - STT (Google Speech Rec) and TTS (gTTS) utilities",
    },
    
    "Configuration Files": {
        ".env.example": "Template for environment variables (copy to .env and fill in)",
        ".gitignore": "Git ignore rules to prevent committing sensitive data",
        "requirements.txt": "Python dependencies (python-telegram-bot, openai, gtts, etc.)",
    },
    
    "Deployment": {
        "Dockerfile": "Docker image for containerized deployment",
        "docker-compose.yml": "Full stack with bot + Redis service for local dev/production",
    },
    
    "Documentation": {
        "README.md": "Main project documentation with features, architecture, and quick start",
        "SETUP.md": "Complete setup and deployment guide - read this first!",
        "TESTING.md": "Testing guide, debug mode, and troubleshooting",
    },
}

CHOOSE_IMPLEMENTATION = {
    "Simple Start": {
        "file": "bot.py",
        "pros": ["All-in-one file", "Easy to understand", "Good for learning"],
        "cons": ["Not modular", "Harder to extend"],
        "use_case": "Learning, quick prototyping",
    },
    
    "Production Use (RECOMMENDED)": {
        "file": "bot_advanced.py",
        "pros": ["Modular architecture", "Redis support", "Scalable", "Clean separation of concerns"],
        "cons": ["Slightly more complex"],
        "use_case": "Real deployments, scaling, teams",
    },
}

# == FEATURE BREAKDOWN ==

FEATURE_1_MEMORY = """
✅ Feature 1: Conversation Memory
   Goal: Bot remembers last messages per user
   
   Implementation:
   - InMemoryBackend: Dict-based storage (fast, single instance)
   - RedisBackend: Redis-based (distributed, persistent)
   - MemoryManager: High-level API for both backends
   
   Key Functions:
   - get_memory(chat_id) / get_conversation(chat_id)
   - save_memory(chat_id, role, content) / add_user_message()
   - clear_memory(chat_id) / clear_conversation()
   - get_memory_summary(chat_id) / get_summary()
   
   Usage in bot.py:
   ```
   save_memory(chat_id, "user", user_text)
   messages = [system_context] + get_memory(chat_id)
   response = openai_client.chat.completions.create(model="gpt-4o-mini", messages=messages)
   save_memory(chat_id, "assistant", reply)
   ```
"""

FEATURE_2_AGENT = """
✅ Feature 2: Human Handover (Agent Mode)
   Goal: Admin can take over conversation, bot stays silent
   
   Implementation:
   - agent_mode: Set of chat_ids where agent is active
   - agent_on() / agent_off(): Admin-only commands
   
   Key Functions:
   - /agent: Enable human mode
   - /bot: Resume AI
   - /status: Show current mode
   
   Logic in handlers:
   ```
   if chat_id in agent_mode:
       return  # Skip AI reply
   ```
   
   Production features:
   - Admin-only validation
   - Track agent sessions
   - Prevent double replies
   - Zero configuration needed
"""

FEATURE_3_VOICE = """
✅ Feature 3: Voice Messages (STT → AI → TTS)
   Goal: User sends voice → bot replies with voice
   
   Implementation Pipeline:
   1. Download voice file (OGG format from Telegram)
   2. Convert OGG → WAV (FFmpeg)
   3. Speech-to-Text: WAV → transcribed text (Google Speech Rec)
   4. Send text to AI (same as text handler)
   5. Get AI response
   6. Text-to-Speech: response → MP3 (gTTS)
   7. Send voice reply back
   
   Key Classes:
   - GoogleSTT: Speech Recognition wrapper
   - GoogleTTS: gTTS wrapper
   - AudioProcessor: OGG↔WAV conversion
   - VoiceManager: Orchestrates full pipeline
   
   Error Handling:
   - UnknownValueError: "Could not understand audio"
   - RequestError: "Service unavailable, use text"
   - Cleanup temp files on error
"""

# == QUICK COMMAND REFERENCE ==

QUICK_COMMANDS = """
🚀 QUICK START COMMANDS

1. Setup:
   cd telegram-bot
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env file

2. Run:
   python bot.py              # Simple version
   python bot_advanced.py    # Production version

3. Test:
   python -c "import telegram; print('✅ OK')"
   LOG_LEVEL=DEBUG python bot_advanced.py   # Verbose logging

4. Docker:
   docker-compose up -d      # Full stack (bot + Redis)
   docker-compose down       # Stop everything
   docker logs -f <container_id>  # View logs

5. Monitor:
   tail -f bot.log           # If LOG_FILE=bot.log
   redis-cli KEYS '*'        # Check Redis storage
"""

# == CONFIGURATION GUIDE ==

CONFIGURATION = """
📋 ENVIRONMENT VARIABLES (.env file)

Required:
  TELEGRAM_BOT_TOKEN    → Get from @BotFather on Telegram
  OPENAI_API_KEY        → Get from https://platform.openai.com/api-keys
  ADMIN_IDS             → Your Telegram user ID(s), comma-separated

Optional:
  LOG_LEVEL             → DEBUG, INFO (default), WARNING, ERROR
  LOG_FILE              → botname.log (default: no file logging)
  
Memory:
  USE_REDIS             → False (default, in-memory), True (Redis)
  REDIS_URL             → redis://localhost:6379 (if USE_REDIS=True)
  MAX_HISTORY           → 6 (default number of messages to remember)

Voice:
  TEMP_AUDIO_DIR        → ./audio_temp (temp files location)
  
Deployment:
  WEBHOOK_ENABLED       → False (polling), True (webhook)
  WEBHOOK_URL           → Your bot's webhook URL
  WEBHOOK_PORT          → 8443 (default for Telegram)

Which one to choose?
├── Single instance, local testing
│   └── USE_REDIS=False
│
├── Production, single server
│   ├── USE_REDIS=False  (simpler)
│   └── LOG_FILE=bot.log
│
└── Scale to multiple instances
    ├── USE_REDIS=True
    ├── REDIS_URL=redis://redis-server:6379
    └── WEBHOOK_ENABLED=True (higher throughput)
"""

# == FILES EXPLAINED ==

FILE_DESCRIPTIONS = {
    "bot.py": {
        "lines": 400,
        "features": ["Memory", "Agent Mode", "Voice", "Complete functionality"],
        "good_for": "Learning, quick prototyping",
        "imports": "telegram, openai, speech_recognition, gtts",
        "entry_point": "main()",
    },
    
    "bot_advanced.py": {
        "lines": 300,
        "features": ["Uses modular imports (config, memory, voice)"],
        "good_for": "Production, scaling, teams",
        "imports": "telegram, openai, config, memory, voice",
        "entry_point": "main()",
        "note": "Recommended - cleaner architecture",
    },
    
    "config.py": {
        "lines": 100,
        "purpose": "Centralized configuration with validation",
        "classes": ["BotConfig"],
        "usage": "from config import config; config.validate()",
    },
    
    "memory.py": {
        "lines": 280,
        "purpose": "Memory abstraction layer",
        "classes": ["MemoryBackend (abstract)", "InMemoryBackend", "RedisBackend", "MemoryManager"],
        "usage": "memory_backend = get_memory_backend(); manager = MemoryManager(backend)",
    },
    
    "voice.py": {
        "lines": 250,
        "purpose": "Voice processing pipeline",
        "classes": ["STTBackend", "TTSBackend", "GoogleSTT", "GoogleTTS", "AudioProcessor", "VoiceManager"],
        "usage": "voice_mgr = get_voice_manager(); text = await voice_mgr.voice_to_text(filepath)",
    },
}

def print_help():
    print("=" * 70)
    print("🤖 TELEGRAM BOT - PROJECT STRUCTURE")
    print("=" * 70)
    
    print("\n📂 FILES ORGANIZATION:\n")
    for category, files in FILES_STRUCTURE.items():
        print(f"  {category}:")
        for filename, description in files.items():
            print(f"    • {filename}: {description}")
    
    print("\n" + "=" * 70)
    print("🎯 CHOOSE YOUR IMPLEMENTATION:\n")
    for choice, details in CHOOSE_IMPLEMENTATION.items():
        print(f"  {choice}:")
        print(f"    File: {details['file']}")
        print(f"    Pros: {', '.join(details['pros'])}")
        print(f"    Cons: {', '.join(details['cons'])}")
        print(f"    Use: {details['use_case']}\n")
    
    print("=" * 70)
    print(FEATURE_1_MEMORY)
    print(FEATURE_2_AGENT)
    print(FEATURE_3_VOICE)
    print("=" * 70)
    print(QUICK_COMMANDS)
    print("=" * 70)
    print(CONFIGURATION)


if __name__ == "__main__":
    print_help()
