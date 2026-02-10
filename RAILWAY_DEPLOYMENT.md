# 🚀 Railway Deployment Checklist

## Your Railway URL: https://startup-production-dd2f.up.railway.app

### ✅ STEP 1: Push Code to Git
```bash
git add .
git commit -m "Setup Railway deployment configuration"
git push origin main
```

### ✅ STEP 2: Set Environment Variables in Railway

Go to your Railway project → **Variables** tab and add the following:

#### Required Backend Environment Variables:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@postgres.railway.internal:5432/railway
PORT=4000
NODE_ENV=production
TELEGRAM_BOT_TOKEN=7123456789:ABCDefGhIjKlMnOpQrStUvWxYzAbCdEf
JWT_SECRET=your_super_secret_jwt_key_generate_a_random_string_here
FRONTEND_URL=https://startup-production-dd2f.up.railway.app
```

#### Steps to add variables:
1. Click **Variables** tab in Railway dashboard
2. For each variable, click **+ New Variable**
3. Enter the key and value
4. Click **Save** (Railway auto-redeploys)

---

### ✅ STEP 3: Test Health Check

Open your browser:
```
https://startup-production-dd2f.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "LeadSync backend running 🚀",
  "timestamp": "2026-02-11T10:30:45.123Z"
}
```

❌ **If not working:**
- Check Railway **Logs** tab
- Look for errors like `DATABASE_URL not set` or `Port already in use`
- Copy any errors and share them

---

### ✅ STEP 4: Check Logs (Critical Debugging)

In Railway: Click **View logs** and confirm you see:
- ✅ `🚀 LeadSync backend listening on port 4000`
- ✅ `Prisma connected` (or similar database connection message)
- ✅ `🌐 CORS Origin: https://startup-production-dd2f.up.railway.app`
- ❌ NO crash loops or repeated error messages

---

### ✅ STEP 5: Deploy/Update Frontend (if separate)

If your frontend is a separate Railway service:

1. Update frontend `.env.production` or `.env.local`:
```env
VITE_API_URL=https://startup-production-dd2f.up.railway.app
```

2. Build:
```bash
npm run build
```

3. If separate service, commit and let Railway auto-deploy:
```bash
git push origin main
```

---

### ✅ STEP 6: Test Backend API Routes

Test these endpoints to ensure everything works:

#### Health Check:
```bash
curl https://startup-production-dd2f.up.railway.app/health
```

#### Auth Signup (example):
```bash
curl -X POST https://startup-production-dd2f.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

---

### ✅ STEP 7: Set Telegram Webhook (IMPORTANT 🤖)

1. Get your Telegram Bot Token (copy it from BotFather)

2. Run this curl command (replace YOUR_BOT_TOKEN):
```bash
curl -X POST \
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook \
-d "url=https://startup-production-dd2f.up.railway.app/api/telegram/webhook"
```

**Expected Response:**
```json
{"ok": true, "result": true}
```

**If it says `false`:**
- Check your bot token is correct
- Ensure your Railway backend is accessible (test /health first)
- Check Railway logs for webhook errors

---

### ✅ STEP 8: Test Telegram Bot

1. Open Telegram and find your bot
2. Send a message (text, voice, etc.)
3. Check Railway logs to see:
   - `📨 Telegram message received`
   - `💾 Conversation created`
   - Reply sent back

4. Verify in database:
```bash
# Via Prisma Studio (if you have local access)
npx prisma studio
```

---

### ✅ STEP 9: Database Verification (Optional)

If you need to check the database directly:

1. **Via Prisma Studio** (local terminal):
```bash
cd leadsync-backend
npx prisma studio
```

2. **Via Railway Postgres Connection** (if exposed):
```bash
psql postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway
\dt  # List all tables
SELECT * FROM "Conversation" LIMIT 5;
```

---

### ✅ FINAL CHECKLIST

- [ ] Git pushed with deployment config files
- [ ] Railway variables set (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Health check working (`/health` returns ok)
- [ ] Backend logs show "listening on port 4000"
- [ ] Frontend `.env` updated with backend URL
- [ ] Frontend deployed/rebuilt
- [ ] Telegram webhook set (`setWebhook` returned true)
- [ ] Telegram bot responds to messages
- [ ] Database has conversations stored

---

### 🔧 Troubleshooting

#### "DATABASE_URL not set" error
- Go to Railway Variables and add DATABASE_URL
- Make sure you're using the PostgreSQL service DATABASE_URL from Railway
- Save and wait for auto-redeploy

#### "CORS error" when frontend tries to connect
- Check FRONTEND_URL environment variable is set correctly
- Make sure it matches your actual frontend URL
- For local frontend, use FRONTEND_URL=http://localhost:5173

#### Telegram webhook returns false
- Verify bot token is correct
- Check `/health` works first
- Look at Railway logs for specific error

#### Port already in use
- Railway assigns a random external port, but we use PORT=4000 internally
- Should auto-resolve on restart

---

### 📞 Need Help?

1. **Check logs first** - Railway → View logs
2. **Test health endpoint** - Your browser
3. **Verify environment variables** - Railway → Variables tab
4. **Check Telegram webhook response** - Run curl command and read response
