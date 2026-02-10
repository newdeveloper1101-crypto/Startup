"""
Voice processing utilities for STT and TTS
"""

import os
import logging
from typing import Optional
from pathlib import Path
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

# Optional imports - will be checked when actually used
try:
    import speech_recognition as sr  # type: ignore
    HAS_SR = True
except ImportError:
    HAS_SR = False

try:
    from gtts import gTTS
    HAS_GTTS = True
except ImportError:
    HAS_GTTS = False


class STTBackend(ABC):
    """Abstract Speech-To-Text backend."""
    
    @abstractmethod
    async def transcribe(self, audio_path: str) -> str:
        """Transcribe audio file to text."""
        pass


class TTSBackend(ABC):
    """Abstract Text-To-Speech backend."""
    
    @abstractmethod
    async def synthesize(self, text: str, output_path: str, language: str = "en") -> bool:
        """Synthesize text to audio file."""
        pass


class GoogleSTT(STTBackend):
    """Google Speech Recognition."""
    
    def __init__(self):
        if not HAS_SR:
            logger.error("SpeechRecognition not installed. pip install SpeechRecognition")
            raise ImportError("SpeechRecognition not installed")
        self.recognizer = sr.Recognizer()
        logger.info("GoogleSTT initialized")
    
    async def transcribe(self, audio_path: str) -> str:
        """Transcribe using Google Speech Recognition."""
        try:
            import speech_recognition as sr  # type: ignore
            
            with sr.AudioFile(audio_path) as source:
                audio = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio)
                logger.info(f"Transcribed: {text[:50]}...")
                return text
        
        except sr.UnknownValueError:
            raise ValueError("Could not understand audio")
        except sr.RequestError as e:
            raise RuntimeError(f"Speech recognition service error: {e}")


class GoogleTTS(TTSBackend):
    """Google Text-To-Speech (via gTTS)."""
    
    def __init__(self):
        if not HAS_GTTS:
            logger.error("gtts not installed. pip install gtts")
            raise ImportError("gtts not installed")
        self.gTTS = gTTS
        logger.info("GoogleTTS initialized")
    
    async def synthesize(self, text: str, output_path: str, language: str = "en") -> bool:
        """Synthesize text to MP3."""
        try:
            tts = self.gTTS(text, lang=language, slow=False)
            tts.save(output_path)
            logger.info(f"Synthesized {len(text)} chars to {output_path}")
            return True
        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            raise


class AudioProcessor:
    """Unified audio processing."""
    
    def __init__(self):
        self.temp_dir = "./audio_temp"
        Path(self.temp_dir).mkdir(exist_ok=True)
    
    async def convert_ogg_to_wav(self, ogg_path: str, wav_path: str) -> bool:
        """Convert OGG to WAV using ffmpeg."""
        try:
            import subprocess
            
            # Windows-safe command
            cmd = f'ffmpeg -y -i "{ogg_path}" "{wav_path}" 2>nul'
            result = os.system(cmd)
            
            if result == 0 and os.path.exists(wav_path):
                logger.info(f"Converted {ogg_path} to {wav_path}")
                return True
            else:
                logger.error(f"FFmpeg conversion failed: {result}")
                return False
        except Exception as e:
            logger.error(f"Audio conversion error: {e}")
            return False
    
    def cleanup_temp_files(self, *file_paths):
        """Clean up temporary audio files."""
        for path in file_paths:
            try:
                if os.path.exists(path):
                    os.remove(path)
                    logger.debug(f"Cleaned up {path}")
            except Exception as e:
                logger.warning(f"Could not delete {path}: {e}")
    
    def get_temp_path(self, chat_id: int, filename: str) -> str:
        """Get unique temp file path."""
        return os.path.join(self.temp_dir, f"{chat_id}_{filename}")


class VoiceManager:
    """Orchestrate voice processing (STT → processing → TTS)."""
    
    def __init__(self, stt_backend: Optional[STTBackend] = None, 
                 tts_backend: Optional[TTSBackend] = None):
        self.stt = stt_backend or GoogleSTT()
        self.tts = tts_backend or GoogleTTS()
        self.audio_processor = AudioProcessor()
    
    async def voice_to_text(self, voice_file_path: str) -> str:
        """
        Convert voice file to text.
        Handles OGG → WAV → STT.
        """
        chat_id = int(voice_file_path.split("_")[1]) if "_" in voice_file_path else 0
        
        wav_path = voice_file_path.replace(".ogg", ".wav")
        
        # Convert OGG to WAV
        success = await self.audio_processor.convert_ogg_to_wav(voice_file_path, wav_path)
        if not success:
            raise RuntimeError("Failed to convert OGG to WAV")
        
        # Transcribe
        text = await self.stt.transcribe(wav_path)
        
        # Cleanup
        self.audio_processor.cleanup_temp_files(voice_file_path, wav_path)
        
        return text
    
    async def text_to_voice(self, text: str, output_path: str, language: str = "en") -> bool:
        """Convert text to voice file."""
        return await self.tts.synthesize(text, output_path, language)
    
    async def process_voice_conversation(self,
                                         voice_file_path: str,
                                         ai_response: str,
                                         output_voice_path: str) -> tuple[str, bool]:
        """
        Full voice pipeline.
        Returns: (transcribed_text, tts_success)
        """
        try:
            # Speech to text
            text = await self.voice_to_text(voice_file_path)
            
            # Text to speech
            tts_success = await self.text_to_voice(ai_response, output_voice_path)
            
            return text, tts_success
        except Exception as e:
            logger.error(f"Voice processing pipeline error: {e}")
            raise


# Global instance
_voice_manager: Optional[VoiceManager] = None


def get_voice_manager() -> VoiceManager:
    """Get or create voice manager."""
    global _voice_manager
    if _voice_manager is None:
        _voice_manager = VoiceManager()
    return _voice_manager
