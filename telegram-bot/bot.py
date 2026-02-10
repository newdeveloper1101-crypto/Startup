"""
Telegram Bot with Memory, Agent Handover, and Voice Support
Production-safe implementation with python-telegram-bot v20+
"""

import os
import logging
import asyncio
from datetime import datetime
from typing import List, Dict, Optional

try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:
    # Dummy function if dotenv not installed
    def load_dotenv():
        pass

from telegram import Update, File
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
    ConversationHandler,
)
from telegram.constants import ChatAction
from openai import AsyncOpenAI
from dashboard import DashboardManager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ADMIN_IDS = set(map(int, os.getenv("ADMIN_IDS", "").split(","))) if os.getenv("ADMIN_IDS") else set()
MAX_HISTORY = 6
TEMP_AUDIO_DIR = os.getenv("TEMP_AUDIO_DIR", "./audio_temp")

# Initialize clients
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
dashboard_manager = DashboardManager(openai_client)

# ===== 1️⃣ MEMORY MANAGEMENT =====

user_memory: Dict[int, List[Dict]] = {}
user_metadata: Dict[int, Dict] = {}


def get_memory(chat_id: int) -> List[Dict]:
    """Retrieve conversation history for a user."""
    return user_memory.get(chat_id, [])


def save_memory(chat_id: int, role: str, content: str) -> None:
    """Save message to user's conversation history."""
    if chat_id not in user_memory:
        user_memory[chat_id] = []
    
    user_memory[chat_id].append({
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # Keep only last MAX_HISTORY messages
    user_memory[chat_id] = user_memory[chat_id][-MAX_HISTORY:]


def clear_memory(chat_id: int) -> None:
    """Clear conversation history for a user."""
    user_memory.pop(chat_id, None)


def get_memory_summary(chat_id: int) -> str:
    """Get a formatted summary of user memory."""
    history = get_memory(chat_id)
    if not history:
        return "No conversation history."
    
    return "\n".join([
        f"[{msg['timestamp']}] {msg['role'].upper()}: {msg['content'][:100]}"
        for msg in history
    ])


# ===== 2️⃣ AGENT MODE (HUMAN HANDOVER) =====

agent_mode: set = set()
agent_info: Dict[int, Dict] = {}


async def agent_on(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Enable agent mode (human takes over)."""
    if update.effective_user.id not in ADMIN_IDS:
        await update.message.reply_text("❌ Unauthorized. Admin only.")
        return
    
    chat_id = update.effective_chat.id
    agent_mode.add(chat_id)
    agent_info[chat_id] = {
        "admin_id": update.effective_user.id,
        "started_at": datetime.utcnow().isoformat(),
        "admin_name": update.effective_user.full_name
    }
    
    logger.info(f"Agent mode ON for chat {chat_id} by {update.effective_user.full_name}")
    await update.message.reply_text(
        "👨‍💼 Agent mode ON\n"
        "🤖 AI is now silent. You handle all replies.\n"
        "Use /bot to resume AI."
    )


async def agent_off(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Disable agent mode (bot resumes)."""
    if update.effective_user.id not in ADMIN_IDS:
        await update.message.reply_text("❌ Unauthorized. Admin only.")
        return
    
    chat_id = update.effective_chat.id
    was_active = chat_id in agent_mode
    agent_mode.discard(chat_id)
    agent_info.pop(chat_id, None)
    
    logger.info(f"Agent mode OFF for chat {chat_id} by {update.effective_user.full_name}")
    
    if was_active:
        await update.message.reply_text(
            "🤖 Bot mode ON\n"
            "AI resumed. I'll handle messages again.\n"
            "Use /agent to take over manually."
        )
    else:
        await update.message.reply_text("Bot mode is already active.")


async def status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show current status and conversation history."""
    chat_id = update.effective_chat.id
    mode = "👨‍💼 AGENT MODE" if chat_id in agent_mode else "🤖 BOT MODE"
    
    status_text = f"{mode}\n\n📋 Conversation History:\n{get_memory_summary(chat_id)}"
    await update.message.reply_text(status_text)


async def clear_history(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Clear conversation memory."""
    if update.effective_user.id not in ADMIN_IDS:
        await update.message.reply_text("❌ Unauthorized. Admin only.")
        return
    
    chat_id = update.effective_chat.id
    clear_memory(chat_id)
    
    logger.info(f"Memory cleared for chat {chat_id}")
    await update.message.reply_text("🧹 Conversation history cleared.")


# ===== 3️⃣ TEXT HANDLER WITH AI & MEMORY =====

async def text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle text messages with AI and memory."""
    chat_id = update.effective_chat.id
    user_text = update.message.text
    user_id = update.effective_user.id
    
    # Skip if agent mode is active
    if chat_id in agent_mode:
        logger.debug(f"Agent mode active for {chat_id}, skipping AI reply")
        return
    
    # Skip bot commands
    if user_text.startswith("/"):
        return
    
    try:
        # Show typing indicator
        await update.message.chat.send_action(ChatAction.TYPING)
        
        # Save user message
        save_memory(chat_id, "user", user_text)
        
        # Build messages with system context
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful Telegram assistant. "
                    "Be concise, friendly, and helpful. "
                    "Keep responses under 2000 characters for Telegram."
                )
            }
        ] + [
            {"role": msg["role"], "content": msg["content"]}
            for msg in get_memory(chat_id)
        ]
        
        # Call OpenAI API
        logger.debug(f"Calling OpenAI for chat {chat_id}")
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=1500
        )
        
        ai_reply = response.choices[0].message.content
        
        # Save AI response
        save_memory(chat_id, "assistant", ai_reply)
        
        # Send reply
        await update.message.reply_text(ai_reply)
        logger.info(f"AI reply sent to chat {chat_id}")
        
    except Exception as e:
        logger.error(f"Error in text_handler for chat {chat_id}: {e}")
        await update.message.reply_text(
            "❌ Sorry, I encountered an error. Please try again."
        )


# ===== 4️⃣ VOICE HANDLER WITH STT & TTS =====

async def voice_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle voice messages: voice → STT → AI → TTS."""
    chat_id = update.effective_chat.id
    
    # Skip if agent mode is active
    if chat_id in agent_mode:
        logger.debug(f"Agent mode active for {chat_id}, skipping AI reply")
        return
    
    try:
        await update.message.chat.send_action(ChatAction.RECORD_AUDIO)
        
        # Create temp directory if needed
        os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)
        
        # Download voice file
        voice_file = await update.message.voice.get_file()
        voice_path = os.path.join(TEMP_AUDIO_DIR, f"{chat_id}_input.ogg")
        await voice_file.download_to_drive(voice_path)
        
        logger.info(f"Voice file downloaded for chat {chat_id}")
        
        # Convert OGG to WAV
        wav_path = os.path.join(TEMP_AUDIO_DIR, f"{chat_id}_input.wav")
        os.system(f"ffmpeg -y -i {voice_path} {wav_path} 2>/dev/null")
        
        # Speech recognition
        await update.message.chat.send_action(ChatAction.TYPING)
        
        try:
            try:
                import speech_recognition as sr  # type: ignore
            except ImportError:
                await update.message.reply_text(
                    "❌ Voice support not installed. Install with: pip install SpeechRecognition"
                )
                return
            
            recognizer = sr.Recognizer()
            
            with sr.AudioFile(wav_path) as source:
                audio = recognizer.record(source)
                text = recognizer.recognize_google(audio)
                logger.info(f"Voice transcribed for chat {chat_id}: {text[:50]}...")
        except sr.UnknownValueError:
            await update.message.reply_text(
                "❌ Could not understand your voice. Please try again."
            )
            return
        except sr.RequestError:
            await update.message.reply_text(
                "❌ Speech recognition service unavailable. Try text instead."
            )
            return
        
        # Save user's voice message as text
        save_memory(chat_id, "user", f"[Voice] {text}")
        
        # Build messages for AI
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful voice assistant. "
                    "Keep responses natural and concise for voice. "
                    "Max 500 characters."
                )
            }
        ] + [
            {"role": msg["role"], "content": msg["content"]}
            for msg in get_memory(chat_id)
        ]
        
        # Get AI response
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        ai_reply = response.choices[0].message.content
        save_memory(chat_id, "assistant", ai_reply)
        
        # Convert response to speech
        await update.message.chat.send_action(ChatAction.RECORD_AUDIO)
        
        from gtts import gTTS
        
        mp3_path = os.path.join(TEMP_AUDIO_DIR, f"{chat_id}_reply.mp3")
        tts = gTTS(ai_reply, lang="en", slow=False)
        tts.save(mp3_path)
        
        logger.info(f"Voice response generated for chat {chat_id}")
        
        # Send voice reply
        with open(mp3_path, "rb") as voice_file:
            await update.message.reply_voice(voice=voice_file)
        
        logger.info(f"Voice reply sent to chat {chat_id}")
        
        # Cleanup
        try:
            os.remove(voice_path)
            os.remove(wav_path)
            os.remove(mp3_path)
        except:
            pass
        
    except Exception as e:
        logger.error(f"Error in voice_handler for chat {chat_id}: {e}")
        await update.message.reply_text(
            "❌ Sorry, voice processing failed. Please try text instead."
        )


# ===== 5️⃣ LIVE DASHBOARD AI SUMMARIES =====

async def thingspeak(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Get AI summary of ThingSpeak IoT data."""
    try:
        # Usage: /thingspeak <channel_id> [api_key]
        args = context.args
        
        if not args:
            await update.message.reply_text(
                "❌ Usage: /thingspeak <channel_id> [api_key]\n\n"
                "Example: /thingspeak 2122234\n"
                "With API key: /thingspeak 2122234 your_read_key"
            )
            return
        
        channel_id = args[0]
        api_key = args[1] if len(args) > 1 else None
        
        await update.message.chat.send_action(ChatAction.TYPING)
        logger.info(f"Fetching ThingSpeak data for channel {channel_id}")
        
        summary = await dashboard_manager.get_thingspeak_summary(channel_id, api_key)
        await update.message.reply_text(summary, parse_mode="Markdown")
        
    except Exception as e:
        logger.error(f"Error in thingspeak handler: {e}")
        await update.message.reply_text(f"❌ Error: {str(e)}")


async def weather(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Get AI summary of weather forecast."""
    try:
        # Usage: /weather <latitude> <longitude>
        args = context.args
        
        if not args or len(args) < 2:
            await update.message.reply_text(
                "❌ Usage: /weather <latitude> <longitude>\n\n"
                "Example: /weather 40.7128 -74.0060"
            )
            return
        
        try:
            lat = float(args[0])
            lon = float(args[1])
        except ValueError:
            await update.message.reply_text("❌ Invalid coordinates. Use decimal format.\nExample: /weather 40.7128 -74.0060")
            return
        
        await update.message.chat.send_action(ChatAction.TYPING)
        logger.info(f"Fetching weather for {lat}, {lon}")
        
        summary = await dashboard_manager.get_weather_summary(lat, lon)
        await update.message.reply_text(summary, parse_mode="Markdown")
        
    except Exception as e:
        logger.error(f"Error in weather handler: {e}")
        await update.message.reply_text(f"❌ Error: {str(e)}")


async def analyze(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Get AI analysis of custom API data."""
    try:
        # Usage: /analyze <api_url> [analysis_type]
        args = context.args
        
        if not args:
            await update.message.reply_text(
                "❌ Usage: /analyze <api_url> [type]\n\n"
                "Types: general, thingspeak, weather, database\n"
                "Example: /analyze https://jsonplaceholder.typicode.com/posts/1 general"
            )
            return
        
        api_url = args[0]
        analysis_type = args[1] if len(args) > 1 else "general"
        
        await update.message.chat.send_action(ChatAction.TYPING)
        logger.info(f"Analyzing API: {api_url}")
        
        summary = await dashboard_manager.get_generic_summary(api_url, analysis_type)
        await update.message.reply_text(summary, parse_mode="Markdown")
        
    except Exception as e:
        logger.error(f"Error in analyze handler: {e}")
        await update.message.reply_text(f"❌ Error: {str(e)}")


# ===== 6️⃣ START & HELP COMMANDS =====

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Start command."""
    await update.message.reply_text(
        "👋 Welcome to AI Assistant Bot!\n\n"
        "💬 Send text or voice messages\n"
        "🧠 I remember our conversation\n"
        "📊 Analyze live data with AI\n\n"
        "📌 Commands:\n"
        "/help - Show all commands\n"
        "/status - Current mode & history\n"
        "/weather - Weather forecast summary\n"
        "/thingspeak - IoT data analysis\n"
        "/analyze - Analyze any API data"
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Help command."""
    help_text = (
        "🤖 AI Assistant Bot Commands\n\n"
        "📝 Chat:\n"
        "  • Send text → AI replies\n"
        "  • Send voice → STT → AI → TTS\n\n"
        "📌 General:\n"
        "  /help - Show this message\n"
        "  /status - Show mode & history\n\n"
        "� Live Dashboard & Analytics:\n"
        "  /thingspeak <id> [key] - Analyze IoT sensor data\n"
        "  /weather <lat> <lon> - AI weather summary\n"
        "  /analyze <url> [type] - Analyze any API data\n\n"
        "👨‍💼 Admin Only:\n"
        "  /agent - Enable human mode\n"
        "  /bot - Resume AI\n"
        "  /clear - Delete conversation history\n\n"
        "ℹ️ Features:\n"
        "  • Conversation memory (last 6 messages)\n"
        "  • Human handover\n"
        "  • Voice → Text → AI → Voice\n"
        "  • Live data analysis with AI insights"
    )
    await update.message.reply_text(help_text)


# ===== 6️⃣ ERROR HANDLER =====

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log errors."""
    logger.error(f"Update {update} caused error {context.error}", exc_info=context.error)


# ===== 7️⃣ MAIN APPLICATION SETUP =====

def main() -> None:
    """Start the bot."""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set in .env")
        return
    
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY not set in .env")
        return
    
    if not ADMIN_IDS:
        logger.warning("ADMIN_IDS not configured. Admin features disabled.")
    
    # Create application
    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Register handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("status", status))
    app.add_handler(CommandHandler("agent", agent_on))
    app.add_handler(CommandHandler("bot", agent_off))
    app.add_handler(CommandHandler("clear", clear_history))
    
    # Dashboard & Analytics handlers
    app.add_handler(CommandHandler("thingspeak", thingspeak))
    app.add_handler(CommandHandler("weather", weather))
    app.add_handler(CommandHandler("analyze", analyze))
    
    # Message handlers (order matters!)
    app.add_handler(MessageHandler(filters.VOICE, voice_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))
    
    # Error handler
    app.add_error_handler(error_handler)
    
    logger.info("🚀 Bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
