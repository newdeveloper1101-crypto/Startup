# 🚀 Quick Start: Deploy to Railway NOW

## 1️⃣ Prepare Your Code
```bash
# Make sure you're in the project root
cd d:\new\ version\ startup\Startup-main

# Commit all changes
git add .
git commit -m "Setup Railway deployment"
git push origin main
```

## 2️⃣ Go to Railway Dashboard
- Open: https://railway.app
- Go to your project: **startup-production-dd2f**
- Click **Variables** tab

## 3️⃣ Add These Environment Variables (COPY-PASTE)

Click **+ New Variable** for each:

| Variable | Value | Notes |
|----------|-------|-------|
| `PORT` | `4000` | Required |
| `NODE_ENV` | `production` | Required |
| `JWT_SECRET` | `generate-random-string-here-at-least-32-chars` | Change this! Use: openssl rand -hex 32 |
| `TELEGRAM_BOT_TOKEN` | `YOUR_BOT_TOKEN_FROM_BOTFATHER` | Get from @BotFather on Telegram |
| `FRONTEND_URL` | `https://startup-production-dd2f.up.railway.app` | Adjust if frontend is separate |
| `DATABASE_URL` | *Should already exist from Railway Postgres* | Don't touch this unless missing |

**After adding each variable, click SAVE**

⚠️ Railway auto-redeploys after you save variables!

## 4️⃣ Verify It's Working

Wait ~2-3 minutes for deployment, then:

```bash
# Open in browser
https://startup-production-dd2f.up.railway.app/health
```

**Should return:**
```json
{
  "status": "ok",
  "message": "LeadSync backend running 🚀",
  "timestamp": "2026-02-11T10:30:45.123Z"
}
```

## 5️⃣ Check Logs
- Railway dashboard → **View logs** tab
- Should see: `🚀 LeadSync backend listening on port 4000`
- No errors should appear

## 6️⃣ Set Telegram Webhook (If using Telegram bot)

```bash
# Replace YOUR_BOT_TOKEN with your actual token
curl -X POST \
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook \
-d "url=https://startup-production-dd2f.up.railway.app/api/telegram/webhook"
```

**Response should be:** `{"ok": true, "result": true}`

## 7️⃣ Update Frontend (if separate)

If frontend is deployed separately:
1. Update frontend .env to: `VITE_API_URL=https://startup-production-dd2f.up.railway.app`
2. Rebuild: `npm run build`
3. Redeploy frontend

## ✅ You're Done!

Your backend is now live on Railway. 
- API: https://startup-production-dd2f.up.railway.app
- Health: https://startup-production-dd2f.up.railway.app/health

---

## 🆘 Troubleshooting

### Health check not working?
1. Wait 2-3 minutes after saving variables
2. Check Railway **Logs** for errors
3. Make sure DATABASE_URL is set

### Telegram not working?
1. Verify bot token is correct (copy from BotFather again)
2. Test /health endpoint first
3. Check Railway logs for webhook errors

### Frontend can't connect?
1. Make sure FRONTEND_URL is set in variables
2. Check CORS error in browser console
3. Verify API URL in frontend .env matches backend URL

---

## 📚 Full Guide
See RAILWAY_DEPLOYMENT.md for complete documentation with all steps.
