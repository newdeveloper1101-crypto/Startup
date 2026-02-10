# 🧪 Dashboard Feature Quick Test Guide

> Test the new Live Dashboard AI Summaries feature in under 5 minutes!

---

## ✅ Prerequisites

Ensure your bot is running and configured:

```bash
# 1. Navigate to telegram-bot folder
cd telegram-bot

# 2. Install/update dependencies
pip install -r requirements.txt

# 3. Check .env file has:
# TELEGRAM_BOT_TOKEN=your_token
# OPENAI_API_KEY=your_key
# ADMIN_IDS=your_id

# 4. Start the bot
python bot.py
```

Expected output:
```
2025-02-11 10:30:45 - bot - INFO - 🚀 Bot starting...
```

---

## 🎯 Test Commands

### Test 1: Weather Forecast (5 seconds)

**Command:**
```
/weather 40.7128 -74.0060
```

**Expected Output:**
```
🌤️ **Weather Summary**

Current conditions: [Temperature], [Humidity], [Wind]
...
[AI analysis of weather patterns]
```

**What this tests:**
- ✅ API HTTP request
- ✅ JSON parsing
- ✅ OpenAI integration
- ✅ Response formatting

---

### Test 2: ThingSpeak Public Channel (8 seconds)

**Command:**
```
/thingspeak 2122234
```

**Expected Output:**
```
📊 **ThingSpeak Channel 2122234 Summary**

[AI summary of sensor data]
[Trend analysis]
[Recommendations]
```

**What this tests:**
- ✅ ThingSpeak API
- ✅ Real sensor data parsing
- ✅ Trend analysis with AI
- ✅ Error handling if channel invalid

---

### Test 3: Custom API Analysis (5 seconds)

**Command (using free public API):**
```
/analyze https://jsonplaceholder.typicode.com/posts/1 general
```

**Expected Output:**
```
📈 **Data Summary**

[Key insights from API response]
```

**What this tests:**
- ✅ Generic API support
- ✅ Dynamic URL handling
- ✅ Analysis type switching
- ✅ Async-await flow

---

### Test 4: Error Handling (2 seconds)

**Command with invalid channel:**
```
/thingspeak invalid_id
```

**Expected Output:**
```
❌ Could not fetch ThingSpeak data. Check channel ID and API key.
```

**What this tests:**
- ✅ Error handling
- ✅ User-friendly messages
- ✅ No bot crashes

---

## 📋 Full Test Sequence

```
⏱️ Total time: ~5 minutes

1. /start                           (1 sec) - Welcome message
2. /weather 40.7128 -74.0060        (5 sec) - ✅ Weather works
3. /thingspeak 2122234              (8 sec) - ✅ ThingSpeak works
4. /analyze https://... general     (5 sec) - ✅ Generic API works
5. /thingspeak invalid_id           (2 sec) - ✅ Error handling works
6. /help                            (1 sec) - ✅ Help updated with new commands
```

---

## 🔍 Debugging

### Enable Debug Logging
```bash
# In .env:
LOG_LEVEL=DEBUG

# Or set in code:
export LOG_LEVEL=DEBUG
python bot.py
```

### Check for API Key Issues
```
Error: OPENAI_API_KEY not set

Solution:
1. Verify .env file: cat .env | grep OPENAI
2. Reload: python bot.py
```

### Monitor API Calls
```bash
LOG_LEVEL=DEBUG python bot.py 2>&1 | grep -i "api\|fetch\|analyze"
```

---

## 📊 Performance Benchmarks

Expected response times (first run):

| Command | Time | Tokens Used | Cost |
|---------|------|-------------|------|
| `/weather` | 3-5s | 200-300 | ~$0.1 |
| `/thingspeak` | 5-8s | 400-600 | ~$0.2 |
| `/analyze` | 4-6s | 300-500 | ~$0.15 |

(Costs are approximate for GPT-4o-mini)

---

## 🎮 Interactive Testing

### Test in Telegram Bot

1. **Find your bot** in Telegram
2. **Send:** `/start` → See welcome
3. **Send:** `/help` → See all commands with dashboard options
4. **Send:** `/weather 35.6762 139.6503` → Tokyo weather
5. **Send:** `/status` → See conversation history
6. **Send:** `/weather 51.5074 -0.1278` → London weather

### Test All Features Together

```
1. /start
2. /help
3. /weather 40.7128 -74.0060
4. /thingspeak 2122234
5. /analyze https://api.example.com/data general
6. /status (should show all previous messages)
```

---

## ✨ Success Criteria

✅ All tests pass if:

- [x] `/weather` returns formatted summary with AI analysis
- [x] `/thingspeak` returns IoT data summary
- [x] `/analyze` accepts custom URLs and analyzes data
- [x] Error messages are user-friendly
- [x] No bot crashes or timeouts
- [x] `/status` shows message history
- [x] `/help` includes dashboard commands
- [x] Response times < 10 seconds

---

## 🚀 Production Test

Before deploying to Railway:

```bash
# 1. Run locally and test all commands
python bot.py

# 2. Check logs for errors
tail -f /your/log/file.txt

# 3. Test in actual Telegram chat
# Send test commands and verify responses

# 4. Monitor costs
# Check OpenAI API usage dashboard

# 5. Deploy to production
git push  # If using Railway CI/CD
```

---

## 📞 Troubleshooting Test Failures

### Test: Weather returns empty data
```
Cause: Coordinate error or API timeout
Solution:
- Use decimal format: 40.7128 not 40°42'46"N
- Check internet connection
- Try different coordinates
```

### Test: ThingSpeak returns error
```
Cause: Channel doesn't exist or is private without key
Solution:
- Use public channel: 2122234
- Or provide API key: /thingspeak 123456 your_key
- Check channel at thingspeak.com
```

### Test: Analyze returns error
```
Cause: URL inaccessible or wrong format
Solution:
- Try public API: https://jsonplaceholder.typicode.com/posts/1
- Check URL is accessible (curl -I <url>)
- Ensure it returns JSON
```

### Test: OpenAI error
```
Error: Invalid API key

Solution:
- Check OPENAI_API_KEY in .env
- Verify it's valid at openai.com/account/api-keys
- Restart bot
```

---

## 📈 Advanced Testing

### Load Test
```python
import asyncio
import requests

async def load_test():
    """Test 10 concurrent requests"""
    for i in range(10):
        # Send /weather command 10 times
        # Monitor response times
        pass
```

### Cost Test
```
Track API usage:
1. Set OpenAI API alerts
2. Monitor dashboard: openai.com/account/billing
3. Calculate cost per query
4. Optimize if needed
```

---

## 🎓 Example Outputs

### ✅ Good Weather Response
```
🌤️ **Weather Summary**

📍 Location: 40.7128°N, 74.0060°W

Current Conditions:
🌡️ Temperature: 72°F
💧 Humidity: 45%
💨 Wind: 8 mph NW

📈 Forecast Analysis:
Excellent weather today! Clear skies with mild temperatures. 
Perfect for outdoor activities. Tomorrow expect scattered clouds 
but remaining pleasant.

⚠️ Note: No weather warnings for this region.
```

### ✅ Good ThingSpeak Response
```
📊 **ThingSpeak Channel 2122234 Summary**

🔴 Alert! Temperature spike detected
- Normally: 20-22°C
- Current: 28°C (+6°C above baseline)
- Time: Today 14:30

📈 Hourly Trend:
Most recent readings show steady increase. This could indicate:
- HVAC system malfunction (check ventilation)
- High sun exposure in measurement location
- Sensor calibration issue

✅ Humidity: Stable
⚠️ Pressure: Watch for weather change (slight rise)

🔧 Recommendation: Investigate temperature sensor location
```

### ✅ Good Custom API Response
```
📈 **Data Summary**

Analyzed 100 user records from the database:

📊 Key Metrics:
- Total Active Users: 1,234
- Monthly Growth: +12%
- Average Session Duration: 23 minutes
- Top Location: United States (62%)

📈 Insights:
User engagement is trending upward! Particularly strong growth from 
US market segment. Consider expanding targeted campaigns there.

⚠️ Note: EU users declining slightly - investigate retention.
```

---

## ✅ Test Completion

Once all tests pass:

1. ✅ Mark feature as "Production Ready"
2. ✅ Document any issues found
3. ✅ Deploy to Railway
4. ✅ Monitor production logs

---

**Ready to test?** Start with `/weather 40.7128 -74.0060` 🎯
