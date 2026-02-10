# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment

### Code & Configuration
- [ ] All `.env` values set (never commit `.env`)
- [ ] `.env.example` updated with new variables
- [ ] `.gitignore` includes `.env`, `venv/`, `audio_temp/`
- [ ] Code reviewed for security issues
- [ ] No hardcoded secrets in code
- [ ] Tests passing locally
- [ ] Git history clean

### Environment Setup
- [ ] Python 3.9+ available
- [ ] FFmpeg installed (Linux: `apt install ffmpeg`)
- [ ] Redis ready (if `USE_REDIS=True`)
- [ ] OpenAI API key valid and has credit
- [ ] Telegram bot token created via @BotFather
- [ ] Admin IDs configured
- [ ] Logs will be written to persistent location

### Security Review
- [ ] API keys in environment variables only
- [ ] Admin-only commands protected
- [ ] Input validation in place
- [ ] Error handling doesn't expose secrets
- [ ] Rate limiting considered
- [ ] HTTPS/TLS enabled (if using webhooks)

## 🐳 Docker Deployment

### Single Instance
```bash
# Build
docker build -t telegram-bot:latest .

# Run
docker run -d \
  --name telegram-bot \
  -e TELEGRAM_BOT_TOKEN="$BOT_TOKEN" \
  -e OPENAI_API_KEY="$API_KEY" \
  -e ADMIN_IDS="$ADMIN_ID" \
  -e LOG_LEVEL=INFO \
  --restart unless-stopped \
  telegram-bot:latest

# Monitor
docker logs -f telegram-bot
```

### Full Stack with Docker Compose
```bash
# Create .env file first
cp .env.example .env
# Edit .env with actual values

# Start
docker-compose up -d

# Check health
docker-compose ps
docker logs telegram-bot-bot-1
docker logs telegram-bot-redis-1

# Stop
docker-compose down
```

- [ ] Docker installed
- [ ] Docker Compose installed (if using compose)
- [ ] Image builds successfully
- [ ] Container runs without errors
- [ ] Health check passing
- [ ] Logs accessible

## 🐧 Linux Systemd Deployment

### 1. Setup Service
```bash
# Create user
sudo useradd -m -s /bin/bash telegrambot

# Copy code to /opt
sudo mkdir -p /opt/telegram-bot
sudo cp -r . /opt/telegram-bot/
sudo chown -R telegrambot:telegrambot /opt/telegram-bot

# Setup venv
cd /opt/telegram-bot
python3 -m venv venv
./venv/bin/pip install -r requirements.txt

# Copy .env
sudo cp .env /opt/telegram-bot/
sudo chown telegrambot:telegrambot /opt/telegram-bot/.env
sudo chmod 600 /opt/telegram-bot/.env
```

### 2. Create Service File
```bash
sudo tee /etc/systemd/system/telegram-bot.service > /dev/null <<'EOF'
[Unit]
Description=Telegram AI Bot
After=network.target redis.service
Wants=redis.service

[Service]
Type=simple
User=telegrambot
WorkingDirectory=/opt/telegram-bot
EnvironmentFile=/opt/telegram-bot/.env
ExecStart=/opt/telegram-bot/venv/bin/python bot_advanced.py
Restart=always
RestartSec=10
StandardOutput=append:/var/log/telegram-bot.log
StandardError=append:/var/log/telegram-bot.log

[Install]
WantedBy=multi-user.target
EOF
```

### 3. Enable & Start
```bash
sudo systemctl daemon-reload
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
sudo systemctl status telegram-bot
tail -f /var/log/telegram-bot.log
```

- [ ] Service file created
- [ ] Service enabled
- [ ] Service started without errors
- [ ] Logs in `/var/log/`
- [ ] Restart on boot configured

## ☁️ Cloud Platform Deployment

### Railway
- [ ] Repository pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables set in Railway dashboard
- [ ] `Procfile` configured (see below)
- [ ] Deploy button clicked
- [ ] Bot responding

**Procfile:**
```
bot: python bot_advanced.py
```

### Heroku (if still available)
- [ ] Procfile created
- [ ] Buildpacks configured
- [ ] Environment variables set
- [ ] Dyno type selected
- [ ] Deploy successful

### AWS EC2
- [ ] Instance launched (Ubuntu 22.04+)
- [ ] Security group allows outbound
- [ ] Python installed
- [ ] FFmpeg installed
- [ ] Service file created
- [ ] Monitoring configured

### Google Cloud Run / Azure Container Instances
- [ ] Docker image built and tested
- [ ] Image pushed to registry
- [ ] Container instance created
- [ ] Environment variables set
- [ ] Health endpoint configured
- [ ] Scaling settings configured

- [ ] Chosen deployment platform
- [ ] Environment configured
- [ ] Secrets stored securely
- [ ] Deployment successful

## 🔍 Post-Deployment Verification

### Health Checks
```bash
# Check logs for errors
docker logs telegram-bot

# Test bot functionality
# Send /help to the bot via Telegram

# Check memory usage
docker stats telegram-bot

# Check Redis (if using Redis)
redis-cli PING
redis-cli DBSIZE
```

- [ ] No startup errors in logs
- [ ] Bot responds to /help command
- [ ] Bot stores messages in memory
- [ ] Voice processing works (if testing locally)
- [ ] Machine not overheating/out of memory
- [ ] Network connectivity stable

### API Integration
```bash
# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Telegram connection
curl https://api.telegram.org/bot$BOT_TOKEN/getMe
```

- [ ] OpenAI API responding
- [ ] Telegram API responding
- [ ] Bot can send messages
- [ ] Bot can receive messages

### Feature Testing
- [ ] Text messages working
- [ ] Memory persists across messages
- [ ] Admin can use /agent command
- [ ] Bot goes silent in agent mode
- [ ] Admin can use /bot to resume
- [ ] Voice messages work (if audio available)
- [ ] /clear command works
- [ ] /status shows correct information

## 📊 Monitoring Setup

### Logging
```bash
# View logs in real-time
docker logs -f telegram-bot

# Or via systemd
journalctl -u telegram-bot -f

# Or via file
tail -f /var/log/telegram-bot.log
```

- [ ] Logs accessible
- [ ] Log rotation configured (if file logging)
- [ ] Error alerts configured

### Metrics to Monitor
- [ ] Error rate in logs
- [ ] API response times
- [ ] Memory usage
- [ ] Disk space (for audio temp files)
- [ ] Redis memory (if applicable)

### Alerting
- [ ] Service down alerts configured
- [ ] Error rate alerts configured
- [ ] Memory usage alerts configured
- [ ] API failure alerts configured

## 🔄 Maintenance Schedule

### Daily
- [ ] Check logs for errors
- [ ] Monitor bot responsiveness
- [ ] Check API quota usage

### Weekly
- [ ] Review memory usage trends
- [ ] Check for storage issues (audio temp)
- [ ] Update logs archive

### Monthly
- [ ] Review conversation statistics
- [ ] Analyze error patterns
- [ ] Check for updates to dependencies
- [ ] Review Redis memory usage
- [ ] Backup conversation data (if stored)

## 🛠️ Rollback Plan

### If Deployment Fails

**Docker:**
```bash
# Remove failed container
docker rm -f telegram-bot

# Rollback to previous image
docker run -d --name telegram-bot \
  <previous-image-tag>
```

**Systemd:**
```bash
# Stop current version
sudo systemctl stop telegram-bot

# Check out previous git version
git checkout <previous-commit>

# Restart
sudo systemctl start telegram-bot
```

- [ ] Previous version tagged in git
- [ ] Previous Docker image available
- [ ] Rollback procedure documented

## 📝 Documentation

- [ ] Deployment steps documented in wiki
- [ ] Runbooks created for common issues
- [ ] Team members trained on deployment
- [ ] Disaster recovery plan written
- [ ] Contact info for on-call support

## 🔐 Security Hardening

### Secrets Management
- [ ] No secrets in git history
- [ ] Use environment variables
- [ ] Use secret management service (AWS Secrets Manager, etc.)
- [ ] Rotate API keys periodically

### Access Control
- [ ] Only authorized personnel can deploy
- [ ] SSH keys secured
- [ ] GitHub/GitLab access restricted
- [ ] API key access logged

### Network Security
- [ ] Firewall configured
- [ ] Only necessary ports open
- [ ] HTTPS/TLS enabled (if applicable)
- [ ] DDoS protection considered

## ✨ Final Checklist

```
BEFORE GOING LIVE:
☑️ All code merged to main branch
☑️ All tests passing
☑️ Security review completed
☑️ Performance tested under load
☑️ Disaster recovery plan ready
☑️ Team trained on operations
☑️ Monitoring and alerting active
☑️ Documentation complete
☑️ Backup strategy implemented
☑️ Rollback procedure tested

GO LIVE ✨

POST-DEPLOYMENT:
☑️ Monitor error rates closely
☑️ Check logs every 30 minutes for first 4 hours
☑️ Be ready to rollback if needed
☑️ Document any issues
☑️ Celebrate success! 🎉
```

---

**For questions or issues, check SETUP.md and TESTING.md**
