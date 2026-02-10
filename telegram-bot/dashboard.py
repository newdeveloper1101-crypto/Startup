"""
Live Dashboard AI Summaries Module
Fetches real-time data from APIs and generates AI-powered insights
"""

import logging
import aiohttp
import json
from typing import Dict, Optional, Any
from datetime import datetime
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


class DashboardManager:
    """Manage live data fetching and AI analysis."""
    
    def __init__(self, openai_client: AsyncOpenAI):
        self.openai_client = openai_client
        self.data_sources: Dict[str, Dict[str, Any]] = {
            "thingspeak": {
                "url": "https://api.thingspeak.com/channels/{channel_id}/feeds.json",
                "description": "IoT sensor data from ThingSpeak"
            },
            "weather": {
                "url": "https://api.open-meteo.com/v1/forecast",
                "description": "Weather forecast data"
            },
            "database": {
                "url": None,  # Custom database integration
                "description": "Custom database queries"
            }
        }
    
    async def fetch_thingspeak_data(self, channel_id: str, api_key: Optional[str] = None, results: int = 20) -> Optional[Dict]:
        """Fetch data from ThingSpeak API."""
        try:
            url = f"https://api.thingspeak.com/channels/{channel_id}/feeds.json"
            params = {
                "results": results,
            }
            if api_key:
                params["api_key"] = api_key
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"✅ Fetched {len(data.get('feeds', []))} records from ThingSpeak channel {channel_id}")
                        return data
                    else:
                        logger.error(f"❌ ThingSpeak API error: {resp.status}")
                        return None
        except Exception as e:
            logger.error(f"❌ Error fetching ThingSpeak data: {e}")
            return None
    
    async def fetch_weather_data(self, latitude: float, longitude: float) -> Optional[Dict]:
        """Fetch weather forecast data from Open-Meteo."""
        try:
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,weather_code,humidity,wind_speed_10m",
                "hourly": "temperature_2m",
                "daily": "weather_code,temperature_2m_max,temperature_2m_min",
                "timezone": "auto"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"✅ Fetched weather data for ({latitude}, {longitude})")
                        return data
                    else:
                        logger.error(f"❌ Weather API error: {resp.status}")
                        return None
        except Exception as e:
            logger.error(f"❌ Error fetching weather data: {e}")
            return None
    
    async def fetch_generic_api(self, api_url: str, headers: Optional[Dict] = None) -> Optional[Dict]:
        """Fetch data from a generic REST API."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(api_url, headers=headers or {}, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"✅ Fetched data from {api_url}")
                        return data
                    else:
                        logger.error(f"❌ API error: {resp.status}")
                        return None
        except Exception as e:
            logger.error(f"❌ Error fetching API data: {e}")
            return None
    
    async def analyze_with_ai(self, data: Dict, analysis_type: str = "general") -> str:
        """Use OpenAI to analyze and summarize data."""
        try:
            # Format data for AI consumption
            data_json = json.dumps(data, indent=2)[:2000]  # Limit to 2000 chars for token efficiency
            
            prompts = {
                "general": f"""Analyze this data and provide a brief, human-readable summary:

{data_json}

Give 2-3 key insights in bullet points. Be concise.""",
                
                "thingspeak": f"""Analyze these IoT sensor readings and identify patterns or anomalies:

{data_json}

Provide actionable insights. Focus on trends and any concerning values.""",
                
                "weather": f"""Summarize this weather forecast data for a user:

{data_json}

Include current conditions and any weather warnings or notable changes.""",
                
                "database": f"""Summarize these database metrics and highlight important statistics:

{data_json}

Focus on performance indicators and anomalies.""",
            }
            
            prompt = prompts.get(analysis_type, prompts["general"])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a data analyst. Provide clear, concise insights from data. Keep responses under 500 characters."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            summary = response.choices[0].message.content
            logger.info(f"✅ AI analysis complete")
            return summary
        except Exception as e:
            logger.error(f"❌ Error analyzing data with AI: {e}")
            return f"❌ Could not analyze data: {str(e)}"
    
    async def get_thingspeak_summary(self, channel_id: str, api_key: Optional[str] = None) -> str:
        """Get AI-powered summary of ThingSpeak data."""
        data = await self.fetch_thingspeak_data(channel_id, api_key)
        if not data:
            return "❌ Could not fetch ThingSpeak data. Check channel ID and API key."
        
        summary = await self.analyze_with_ai(data, "thingspeak")
        return f"📊 **ThingSpeak Channel {channel_id} Summary**\n\n{summary}"
    
    async def get_weather_summary(self, latitude: float, longitude: float) -> str:
        """Get AI-powered weather summary."""
        data = await self.fetch_weather_data(latitude, longitude)
        if not data:
            return "❌ Could not fetch weather data."
        
        summary = await self.analyze_with_ai(data, "weather")
        return f"🌤️ **Weather Summary**\n\n{summary}"
    
    async def get_generic_summary(self, api_url: str, analysis_type: str = "general") -> str:
        """Get AI-powered summary of generic API data."""
        data = await self.fetch_generic_api(api_url)
        if not data:
            return f"❌ Could not fetch data from {api_url}"
        
        summary = await self.analyze_with_ai(data, analysis_type)
        return f"📈 **Data Summary**\n\n{summary}"
