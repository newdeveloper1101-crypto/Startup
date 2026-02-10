"""
Production deployment configuration for Telegram Bot
"""

import os
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class BotConfig:
    """Configuration for Telegram Bot."""
    
    # Core
    telegram_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    admin_ids: set = field(default_factory=lambda: {
        int(uid) for uid in (os.getenv("ADMIN_IDS", "").split(",") if os.getenv("ADMIN_IDS") else [])
    })
    
    # Memory
    max_history: int = int(os.getenv("MAX_HISTORY", "6"))
    use_redis: bool = os.getenv("USE_REDIS", "False").lower() == "true"
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # AI Settings
    model: str = "gpt-4o-mini"
    temperature: float = 0.7
    max_tokens: int = 1500
    voice_max_tokens: int = 500
    
    # Voice Processing
    temp_audio_dir: str = os.getenv("TEMP_AUDIO_DIR", "./audio_temp")
    enable_voice: bool = True
    speech_engine: str = "google"  # google, azure, or other
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_file: Optional[str] = os.getenv("LOG_FILE", None)
    
    # Safety limits
    max_message_length: int = 2000
    max_voice_duration: int = 120  # seconds
    rate_limit_per_minute: int = 30
    
    # Deployment
    environment: str = os.getenv("FLASK_ENV", "production")
    webhook_enabled: bool = os.getenv("WEBHOOK_ENABLED", "False").lower() == "true"
    webhook_url: str = os.getenv("WEBHOOK_URL", "")
    webhook_port: int = int(os.getenv("WEBHOOK_PORT", "8443"))
    
    def validate(self) -> bool:
        """Validate configuration."""
        if not self.telegram_token:
            raise ValueError("TELEGRAM_BOT_TOKEN is required")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required")
        return True
    
    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "telegram_token": "***" if self.telegram_token else "",
            "openai_api_key": "***" if self.openai_api_key else "",
            "admin_ids": self.admin_ids,
            "max_history": self.max_history,
            "use_redis": self.use_redis,
            "model": self.model,
            "environment": self.environment,
        }


# Global config instance
config = BotConfig()
