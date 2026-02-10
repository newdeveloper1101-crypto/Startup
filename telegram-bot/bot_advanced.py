"""
Advanced Telegram Bot Implementation
Uses modular architecture with:
- Pluggable memory backends (in-memory / Redis)
- Separate voice processing pipeline
- Production-grade error handling
"""

import os
import logging
import asyncio
from pathlib import Path

try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:
    # Dummy function if dotenv not installed
    def load_dotenv():
        pass

from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)
from telegram.constants import ChatAction
from openai import AsyncOpenAI

# Load environment variables
load_dotenv()

# Import custom modules
from config import config
from memory import get_memory_backend, MemoryManager
from voice import get_voice_manager

# Configure logging
logging.basicConfig(
    level=config.log_level,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(config.log_file) if config.log_file else logging.NullHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize clients and managers
config.validate()
openai_client = AsyncOpenAI(api_key=config.openai_api_key)
memory_backend = get_memory_backend()
memory_manager = MemoryManager(memory_backend)
voice_manager = get_voice_manager()

# Agent mode tracking
agent_mode = set()


# ===== 1️⃣ ADMIN COMMANDS =====

async def agent_on(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Enable human handover mode."""
    if update.effective_user.id not in config.admin_ids:
        await update.message.reply_text("❌ Unauthorized. Admin only.")
        return
    
    chat_id = update.effective_chat.id
    agent_mode.add(chat_id)
    
    logger.info(f"Agent mode activated for chat {chat_id}")
    await update.message.reply_text(
        "👨‍💼 Agent mode ON\n"
        "🤖 AI is silent. You handle all replies.\n"
        "/bot to resume AI"
    )


async def agent_off(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Resume bot mode."""
    if update.effective_user.id not in config.admin_ids:
        await update.message.reply_text("❌ Unauthorized. Admin only.")
        return
    
    chat_id = update.effective_chat.id
    was_active = chat_id in agent_mode
    agent_mode.discard(chat_id)
    
    logger.info(f"Bot mode resumed for chat {chat_id}")
    
    if was_active:
        await update.message.reply_text(
            "🤖 Bot mode ON\n"
            "AI resumed. I'll handle messages.\n"
            "/agent to take over manually"
        )


async def clear_history(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Clear conversation history (admin only)."""
    if update.effective_user.id not in config.admin_ids:
        await update.message.reply_text("❌ Unauthorized. Admin only.")
        return
    
    chat_id = update.effective_chat.id
    await memory_manager.clear_conversation(chat_id)
    
    logger.info(f"Conversation cleared for chat {chat_id}")
    await update.message.reply_text("🧹 Conversation history cleared.")


async def status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show bot status and conversation history."""
    chat_id = update.effective_chat.id
    mode = "👨‍💼 AGENT MODE" if chat_id in agent_mode else "🤖 BOT MODE"
    summary = await memory_manager.get_summary(chat_id)
    
    status_text = f"{mode}\n\n📋 Conversation:\n{summary}"
    await update.message.reply_text(status_text)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Start command."""
    await update.message.reply_text(
        "👋 Welcome to AI Assistant Bot!\n\n"
        "💬 Send text or 🎙️ voice messages\n"
        "🧠 I remember conversations\n\n"
        "📌 Commands:\n"
        "/help - All commands\n"
        "/status - Mode & history\n"
        "/agent - Admin: Take over\n"
        "/bot - Admin: Resume\n"
        "/clear - Admin: Clear history"
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Help command."""
    help_text = (
        "🤖 AI Assistant Commands\n\n"
        "💬 Chat:\n"
        "  • Text → AI replies\n"
        "  • Voice → STT → AI → TTS\n\n"
        "📌 General:\n"
        "  /help - This message\n"
        "  /status - Current mode\n\n"
        "👨‍💼 Admin:\n"
        "  /agent - Enable human mode\n"
        "  /bot - Resume AI\n"
        "  /clear - Clear history\n\n"
        "✨ Features:\n"
        "  • Conversation memory\n"
        "  • Voice support\n"
        "  • Human handover"
    )
    await update.message.reply_text(help_text)


# ===== 2️⃣ TEXT HANDLER =====

async def text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle text messages with AI and memory."""
    chat_id = update.effective_chat.id
    user_text = update.message.text
    
    # Skip if agent mode is active
    if chat_id in agent_mode:
        return
    
    # Skip commands
    if user_text.startswith("/"):
        return
    
    # Validate input
    if len(user_text) > config.max_message_length:
        await update.message.reply_text(f"❌ Message too long (max {config.max_message_length} chars)")
        return
    
    try:
        await update.message.chat.send_action(ChatAction.TYPING)
        
        # Save user message
        await memory_manager.add_user_message(chat_id, user_text)
        
        # Build messages for API
        messages = await memory_manager.build_messages(chat_id)
        
        # Call OpenAI
        logger.debug(f"Calling OpenAI for chat {chat_id}")
        response = await openai_client.chat.completions.create(
            model=config.model,
            messages=messages,
            temperature=config.temperature,
            max_tokens=config.max_tokens
        )
        
        ai_reply = response.choices[0].message.content
        
        # Save assistant response
        await memory_manager.add_assistant_message(chat_id, ai_reply)
        
        # Send reply
        await update.message.reply_text(ai_reply)
        logger.info(f"Text reply sent to chat {chat_id}")
        
    except Exception as e:
        logger.error(f"Error in text_handler for chat {chat_id}: {e}")
        await update.message.reply_text(
            "❌ Sorry, I encountered an error. Please try again."
        )


# ===== 3️⃣ VOICE HANDLER =====

async def voice_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle voice messages: voice → STT → AI → TTS."""
    chat_id = update.effective_chat.id
    
    # Skip if agent mode is active
    if chat_id in agent_mode:
        return
    
    try:
        # Create temp directory
        Path(config.temp_audio_dir).mkdir(exist_ok=True)
        
        # Download voice file
        voice_file = await update.message.voice.get_file()
        voice_path = os.path.join(config.temp_audio_dir, f"{chat_id}_input.ogg")
        await voice_file.download_to_drive(voice_path)
        
        # Show processing status
        await update.message.chat.send_action(ChatAction.TYPING)
        
        # Voice to text
        logger.info(f"Processing voice message for chat {chat_id}")
        transcribed_text = await voice_manager.voice_to_text(voice_path)
        logger.info(f"Transcribed: {transcribed_text[:50]}...")
        
        # Save to memory
        await memory_manager.add_user_message(chat_id, f"[Voice] {transcribed_text}")
        
        # Get AI response
        messages = await memory_manager.build_messages(chat_id)
        messages[0]["content"] = (
            "You are a helpful voice assistant. Keep responses natural and concise. "
            "Max 500 characters."
        )
        
        response = await openai_client.chat.completions.create(
            model=config.model,
            messages=messages,
            temperature=config.temperature,
            max_tokens=config.voice_max_tokens
        )
        
        ai_reply = response.choices[0].message.content
        await memory_manager.add_assistant_message(chat_id, ai_reply)
        
        # Text to voice
        await update.message.chat.send_action(ChatAction.RECORD_AUDIO)
        
        mp3_path = os.path.join(config.temp_audio_dir, f"{chat_id}_reply.mp3")
        await voice_manager.text_to_voice(ai_reply, mp3_path)
        
        # Send voice reply
        with open(mp3_path, "rb") as audio_file:
            await update.message.reply_voice(voice=audio_file)
        
        logger.info(f"Voice reply sent to chat {chat_id}")
        
        # Cleanup
        voice_manager.audio_processor.cleanup_temp_files(voice_path, mp3_path)
        
    except ValueError as e:
        logger.warning(f"Voice recognition error for chat {chat_id}: {e}")
        await update.message.reply_text("❌ Could not understand your voice. Please try text.")
    except RuntimeError as e:
        logger.error(f"Voice processing error for chat {chat_id}: {e}")
        await update.message.reply_text("❌ Voice processing failed. Please try text.")
    except Exception as e:
        logger.error(f"Unexpected error in voice_handler for chat {chat_id}: {e}")
        await update.message.reply_text("❌ Voice processing failed. Please try text.")


# ===== 4️⃣ ERROR HANDLER =====

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log errors caused by updates."""
    logger.error(f"Update {update} caused error {context.error}", exc_info=context.error)


# ===== 5️⃣ MAIN BOT SETUP =====

def main() -> None:
    """Start the bot."""
    logger.info("🚀 Initializing Telegram Bot")
    logger.info(f"Configuration: {config.to_dict()}")
    
    # Create application
    app = Application.builder().token(config.telegram_token).build()
    
    # Register handlers (order matters!)
    
    # Commands
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("status", status))
    app.add_handler(CommandHandler("agent", agent_on))
    app.add_handler(CommandHandler("bot", agent_off))
    app.add_handler(CommandHandler("clear", clear_history))
    
    # Messages (voice before text!)
    app.add_handler(MessageHandler(filters.VOICE, voice_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))
    
    # Error handling
    app.add_error_handler(error_handler)
    
    logger.info("✅ Bot initialized successfully")
    logger.info("🎬 Starting polling...")
    
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
