"""
Memory management with support for in-memory and Redis backends
"""

import json
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
from abc import ABC, abstractmethod
from config import config

logger = logging.getLogger(__name__)

# Optional Redis import
try:
    import redis.asyncio as redis  # type: ignore
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False


class MemoryBackend(ABC):
    """Abstract memory storage backend."""
    
    @abstractmethod
    async def get_history(self, chat_id: int) -> List[Dict]:
        pass
    
    @abstractmethod
    async def add_message(self, chat_id: int, role: str, content: str) -> None:
        pass
    
    @abstractmethod
    async def clear_history(self, chat_id: int) -> None:
        pass
    
    @abstractmethod
    async def get_metadata(self, chat_id: int, key: str) -> Optional[Any]:
        pass
    
    @abstractmethod
    async def set_metadata(self, chat_id: int, key: str, value: Any) -> None:
        pass


class InMemoryBackend(MemoryBackend):
    """In-memory storage backend (development/single-instance)."""
    
    def __init__(self, max_history: int = 6):
        self.history: Dict[int, List[Dict]] = {}
        self.metadata: Dict[int, Dict[str, Any]] = {}
        self.max_history = max_history
        logger.info("InMemoryBackend initialized")
    
    async def get_history(self, chat_id: int) -> List[Dict]:
        return self.history.get(chat_id, [])
    
    async def add_message(self, chat_id: int, role: str, content: str) -> None:
        if chat_id not in self.history:
            self.history[chat_id] = []
        
        self.history[chat_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Keep only last N messages
        self.history[chat_id] = self.history[chat_id][-self.max_history:]
    
    async def clear_history(self, chat_id: int) -> None:
        self.history.pop(chat_id, None)
    
    async def get_metadata(self, chat_id: int, key: str) -> Optional[Any]:
        return self.metadata.get(chat_id, {}).get(key)
    
    async def set_metadata(self, chat_id: int, key: str, value: Any) -> None:
        if chat_id not in self.metadata:
            self.metadata[chat_id] = {}
        self.metadata[chat_id][key] = value


class RedisBackend(MemoryBackend):
    """Redis-backed storage backend (production/distributed)."""
    
    def __init__(self, redis_url: str, max_history: int = 6):
        if not HAS_REDIS:
            logger.error("redis package not installed. Use: pip install redis")
            raise ImportError("redis package not installed")
        self.max_history = max_history
        self.url = redis_url
        self._client = None
        logger.info("RedisBackend configured")
    
    async def _get_client(self):
        """Get or create Redis client."""
        if self._client is None:
            self._client = redis.from_url(self.url, decode_responses=True)
        return self._client
    
    async def get_history(self, chat_id: int) -> List[Dict]:
        client = await self._get_client()
        key = f"history:{chat_id}"
        data = await client.get(key)
        return json.loads(data) if data else []
    
    async def add_message(self, chat_id: int, role: str, content: str) -> None:
        client = await self._get_client()
        key = f"history:{chat_id}"
        
        history = await self.get_history(chat_id)
        history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        history = history[-self.max_history:]
        await client.set(key, json.dumps(history))
        await client.expire(key, 30 * 24 * 3600)  # 30 days
    
    async def clear_history(self, chat_id: int) -> None:
        client = await self._get_client()
        key = f"history:{chat_id}"
        await client.delete(key)
    
    async def get_metadata(self, chat_id: int, key: str) -> Optional[Any]:
        client = await self._get_client()
        meta_key = f"meta:{chat_id}:{key}"
        data = await client.get(meta_key)
        return json.loads(data) if data else None
    
    async def set_metadata(self, chat_id: int, key: str, value: Any) -> None:
        client = await self._get_client()
        meta_key = f"meta:{chat_id}:{key}"
        await client.set(meta_key, json.dumps(value))


# Initialize memory backend based on config
def get_memory_backend() -> MemoryBackend:
    """Factory function to get appropriate memory backend."""
    if config.use_redis:
        return RedisBackend(config.redis_url, config.max_history)
    else:
        return InMemoryBackend(config.max_history)


class MemoryManager:
    """High-level memory management."""
    
    def __init__(self, backend: MemoryBackend):
        self.backend = backend
    
    async def get_conversation(self, chat_id: int) -> List[Dict]:
        """Get full conversation history."""
        return await self.backend.get_history(chat_id)
    
    async def add_user_message(self, chat_id: int, content: str) -> None:
        """Add user message."""
        await self.backend.add_message(chat_id, "user", content)
    
    async def add_assistant_message(self, chat_id: int, content: str) -> None:
        """Add assistant message."""
        await self.backend.add_message(chat_id, "assistant", content)
    
    async def get_system_context(self) -> str:
        """Get system context for AI."""
        return (
            "You are a helpful Telegram assistant. "
            "Be concise, friendly, and helpful. "
            "Keep responses under 2000 characters for Telegram."
        )
    
    async def build_messages(self, chat_id: int) -> List[Dict]:
        """Build messages for OpenAI API."""
        system_context = await self.get_system_context()
        history = await self.get_conversation(chat_id)
        
        return [
            {"role": "system", "content": system_context}
        ] + [
            {"role": msg["role"], "content": msg["content"]}
            for msg in history
        ]
    
    async def clear_conversation(self, chat_id: int) -> None:
        """Clear conversation history."""
        await self.backend.clear_history(chat_id)
    
    async def get_summary(self, chat_id: int) -> str:
        """Get formatted summary of conversation."""
        history = await self.get_conversation(chat_id)
        if not history:
            return "No conversation history."
        
        return "\n".join([
            f"[{msg['timestamp']}] {msg['role'].upper()}: {msg['content'][:80]}"
            for msg in history
        ])
