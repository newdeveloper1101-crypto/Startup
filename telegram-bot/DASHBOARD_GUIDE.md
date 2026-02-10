# 📊 Live Dashboard AI Summaries Guide

Analyze real-time data from external APIs and get AI-powered insights directly in Telegram!

## 🎯 What It Does

- **Fetches live data** from APIs (ThingSpeak, Weather, custom endpoints)
- **Sends data to OpenAI** for intelligent analysis
- **Returns human-readable summaries** in Telegram

## 📋 Commands

### 1️⃣ Weather Forecast Summary
```bash
/weather <latitude> <longitude>
```

**Example:**
```
/weather 40.7128 -74.0060
```

**Output:**
```
🌤️ **Weather Summary**

📈 Current conditions: Clear skies with 72°F temperature
💨 Wind: 8 mph from the northwest
💧 Humidity: 45%

⚠️ Forecast: Sunny today, scattered clouds tomorrow. Temperature remains pleasant in the low 70s.
```

**Supported locations:**
- New York: 40.7128, -74.0060
- London: 51.5074, -0.1278
- Tokyo: 35.6762, 139.6503
- Sydney: -33.8688, 151.2093

---

### 2️⃣ IoT Sensor Data (ThingSpeak)
```bash
/thingspeak <channel_id> [api_key]
```

**Example (Public Channel):**
```
/thingspeak 2122234
```

**Example (Private Channel):**
```
/thingspeak 2125235 your_read_api_key
```

**What it analyzes:**
- Temperature trends
- Humidity patterns
- Pressure changes
- Custom sensor readings

**Output:**
```
📊 **ThingSpeak Channel 2122234 Summary**

🔴 Alert: Temperature spiked 8°C above average at 14:30
📈 Trend: Humidity has been steadily increasing over the last 6 hours
✅ Normal: Pressure readings stable within acceptable range

Recommendation: Check ventilation system - humidity rising unusually fast.
```

**How to get a ThingSpeak channel:**
1. Sign up at [ThingSpeak.com](https://thingspeak.com)
2. Create a channel and set up fields
3. Get your channel ID from the channel URL
4. (Optional) Get Read API Key from channel settings

---

### 3️⃣ Any REST API Data
```bash
/analyze <api_url> [analysis_type]
```

**Analysis Types:**
- `general` (default) - Basic data summary
- `thingspeak` - IoT sensor analysis
- `weather` - Weather pattern analysis
- `database` - Database metrics analysis

**Example (Generic API):**
```
/analyze https://jsonplaceholder.typicode.com/users

# Or with specific analysis type:
/analyze https://api.example.com/metrics database
```

**Output:**
```
📈 **Data Summary**

Found 10 user records with the following patterns:
- 8 users are from United States
- Average user ID: 5.5
- All users have email addresses in domain mapping

Key Insight: User base heavily concentrated in US, consider geographical expansion.
```

---

## 🛠️ Example Use Cases

### 📱 IoT Projects
Monitor sensor networks and get instant insights:
```
/thingspeak 123456
→ AI detects anomalies and trends in temperature/humidity/pressure
```

### 🌍 Weather Apps
Get natural language weather summaries for any location:
```
/weather 35.6762 139.6503
→ AI summarizes Tokyo's weather in an easy-to-understand format
```

### 📊 Database Monitoring
Track system performance with AI analysis:
```
/analyze https://monitoring.yourcompany.com/api/stats database
→ AI identifies performance bottlenecks and anomalies
```

### 💰 Financial Data
Analyze market data from public APIs:
```
/analyze https://api.example.com/stock-prices general
→ AI provides investment insights based on latest data
```

### 🏥 Health Monitoring
Track health metrics from wearables or health APIs:
```
/analyze https://yourhealth.api.com/vitals general
→ AI summarizes your health trends and patterns
```

---

## 🔧 Setup & Configuration

### Prerequisites
Ensure these are in your `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_IDS=your_telegram_id
```

### Installation
```bash
cd telegram-bot

# Install or upgrade dependencies
pip install -r requirements.txt

# Ensure aiohttp is installed (for async HTTP requests)
pip install aiohttp>=3.9.0
```

### Run the bot
```bash
python bot.py
```

---

## 🔐 Security Best Practices

⚠️ **API Keys in Commands:**
```bash
# ❌ DON'T - key visible in history
/thingspeak 123456 xyz_secret_api_key

# ✅ DO - use private channels or store in .env
# Set THINGSPEAK_API_KEY=xyz_secret_api_key in .env
```

⚠️ **Rate Limiting:**
- OpenAI API calls are rate-limited
- Each `/analyze` command uses ~1000-2000 tokens
- Keep monitoring to avoid high API costs

⚠️ **Data Privacy:**
- Data is sent to OpenAI for analysis
- Don't analyze sensitive personal data
- Review OpenAI's data privacy policy

---

## 📊 API Output Examples

### ThingSpeak API Response (Simplified)
```json
{
  "channel": {
    "id": 2122234,
    "name": "Temperature & Humidity",
    "updated_at": "2025-02-11T10:30:00Z"
  },
  "feeds": [
    {
      "created_at": "2025-02-11T10:30:00Z",
      "entry_id": 1,
      "field1": "72.5",
      "field2": "45"
    }
  ]
}
```

### Weather API Response (Simplified)
```json
{
  "current": {
    "temperature_2m": 72.5,
    "weather_code": 0,
    "humidity": 45,
    "wind_speed_10m": 8
  },
  "daily": {
    "weather_code": [0, 1, 2],
    "temperature_2m_max": [75, 73, 70]
  }
}
```

---

## ❓ Troubleshooting

### "❌ Could not fetch ThingSpeak data"
- Check channel ID is correct
- Verify channel is public or provide valid API key
- ThingSpeak API might be down

### "❌ Invalid coordinates"
- Use decimal format: `40.7128 -74.0060`
- Latitude range: -90 to 90
- Longitude range: -180 to 180

### "❌ Could not fetch data from [URL]"
- Verify API URL is public and accessible
- Check API doesn't require authentication
- API might be rate-limiting or down

### Timeout error
- API response took too long (>10 seconds)
- Try again or check API service status

---

## 💡 Advanced Tips

### 1. Create a Telegram Bot Group for Monitoring
```
Create a group → Add bot → Use /thingspeak commands
→ Team gets real-time IoT alerts
```

### 2. Scheduled Updates (Python Script)
```python
# Monitor data every 30 minutes
import schedule
import requests

def send_update():
    # Fetch data and send via bot
    pass

schedule.every(30).minutes.do(send_update)
```

### 3. Cost Optimization
- Analyze in batches to reduce API calls
- Use `general` analysis type (cheaper than specific types)
- Cache results for 5-10 minutes if possible

---

## 📞 Support & Feedback

Issues? Have suggestions?

1. Check logs: `tail -f bot_logs.txt`
2. Enable debug: `LOG_LEVEL=DEBUG python bot.py`
3. Review API documentation for ThingSpeak or Open-Meteo

---

## 🚀 What Comes Next

Planned features:
- [ ] Scheduled dashboard reports
- [ ] Multi-data-source comparison
- [ ] Custom alert thresholds
- [ ] Data export to CSV/JSON
- [ ] Webhook integration for automatic updates

---

Made with ❤️ by your AI Assistant Bot
