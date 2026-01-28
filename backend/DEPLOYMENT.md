# AutoVerse Chat - Deployment Guide

Guide for deploying the AutoVerse Chat backend to production.

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Error handling implemented
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] HTTPS certificate obtained
- [ ] Domain name configured
- [ ] Rate limiting implemented
- [ ] Logging system in place

---

## 🚀 Deployment Options

### Option 1: Heroku (Easiest for Beginners)

#### Prerequisites
- Heroku account: https://www.heroku.com/
- Heroku CLI installed: https://devcenter.heroku.com/articles/heroku-cli

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
heroku create autoverse-chat-api
```

3. **Set Environment Variables**
```bash
heroku config:set PORT=5000
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/autoverse-chat"
heroku config:set JWT_SECRET="your_production_secret_key_here"
```

4. **Deploy Code**
```bash
git push heroku main
```

5. **View Logs**
```bash
heroku logs --tail
```

6. **Your API URL**
```
https://autoverse-chat-api.herokuapp.com
```

---

### Option 2: Railway.app (Modern Alternative)

#### Prerequisites
- Railway account: https://railway.app/
- Railway CLI or GitHub connected

#### Steps

1. **Create Project**
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub" or "Empty Project"

2. **Add MongoDB Add-on**
   - Click "Add" in Services
   - Search "MongoDB"
   - Click "MongoDB"

3. **Set Environment Variables**
   - Go to Variables tab
   - Add:
     ```
     PORT=5000
     NODE_ENV=production
     JWT_SECRET=your_production_secret_key_here
     ```
   - MongoDB URI will be auto-generated

4. **Deploy**
   - Connect GitHub repo and select branch
   - Railway auto-deploys on push

5. **Your API URL**
   - Found in Settings > Domains

---

### Option 3: DigitalOcean (More Control)

#### Prerequisites
- DigitalOcean account: https://www.digitalocean.com/
- Basic Linux knowledge

#### Steps

1. **Create Droplet**
   - Size: Basic ($5-6/month)
   - OS: Ubuntu 22.04
   - Region: Closest to users

2. **Connect via SSH**
```bash
ssh root@your_droplet_ip
```

3. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install MongoDB**
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

5. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

6. **Clone Your Repository**
```bash
git clone https://github.com/yourusername/autoverse-chat.git
cd autoverse-chat/backend
npm install
```

7. **Create .env File**
```bash
nano .env
```

Add production settings:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/autoverse-chat
JWT_SECRET=your_production_secret_key_here
CORS_ORIGIN=https://yourdomain.com
```

8. **Start with PM2**
```bash
pm2 start server.js --name "autoverse-chat"
pm2 startup
pm2 save
```

9. **Install Nginx (Reverse Proxy)**
```bash
sudo apt-get install nginx
```

Create `/etc/nginx/sites-available/autoverse`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/autoverse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Install SSL Certificate (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### Option 4: AWS EC2

#### Steps

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04
   - Type: t3.micro (free tier eligible)

2. **Security Group**
   - Allow port 80 (HTTP)
   - Allow port 443 (HTTPS)
   - Allow port 22 (SSH)

3. **Connect and Setup**
   - Follow DigitalOcean steps above
   - Similar process for Node.js and MongoDB installation

4. **Use AWS RDS for Database**
   - More managed approach
   - Create MongoDB Atlas cluster instead

---

## 🔒 Security Best Practices

### 1. Environment Variables
```env
# NEVER commit .env to git
# Use strong, random JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)

# Use HTTPS only
CORS_ORIGIN=https://yourdomain.com

# Set secure database passwords
MONGODB_URI=mongodb+srv://username:strong_password@cluster...
```

### 2. Rate Limiting
Add to server.js:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // 5 attempts per 15 minutes
});

app.use('/api/auth/', authLimiter);
```

### 3. Input Validation
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/auth/login', [
  body('username').trim().notEmpty(),
  body('password').isLength({ min: 8 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process login
});
```

### 4. HTTPS Enforcement
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(443);
```

### 5. MongoDB Security
```javascript
// Use IP whitelist in MongoDB Atlas
// Set strong database passwords
// Enable encryption at rest
// Use connection strings with credentials
```

---

## 📊 Monitoring and Logging

### 1. Winston Logger
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Use in code
logger.info('User logged in', { userId: user._id });
logger.error('Database error', { error: error.message });
```

### 2. PM2 Monitoring
```bash
pm2 install pm2-auto-pull
pm2 install pm2-logrotate
pm2 monit  # Real-time monitoring
```

### 3. Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

---

## 🔄 Continuous Integration/Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "autoverse-chat-api"
          heroku_email: "your-email@example.com"
          usedocker: false
```

---

## 🚨 Troubleshooting Deployment

### App Crashes
```bash
# View logs
heroku logs --tail          # Heroku
pm2 logs                    # PM2
docker logs container_name  # Docker
```

### Database Connection Issues
```bash
# Test connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/db"

# Check IP whitelist (MongoDB Atlas)
# Check firewall rules (DigitalOcean)
```

### High CPU/Memory Usage
```bash
# Monitor
pm2 monit

# Check for memory leaks
node --inspect server.js
# Then use Chrome DevTools
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check expiration
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 📈 Performance Optimization

### 1. Caching
```bash
npm install redis
```

### 2. Database Indexing
Already implemented in schemas - ensure indexes are created:
```javascript
db.users.createIndex({ username: 1 })
db.messages.createIndex({ senderId: 1, receiverId: 1 })
```

### 3. Pagination
Implement for all list endpoints:
```
GET /api/messages/:userId?limit=50&skip=0
```

### 4. Compression
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

---

## 📋 Post-Deployment Checklist

- [ ] Health check endpoint returning 200
- [ ] Can register new user
- [ ] Can login
- [ ] Can send message
- [ ] Database backups working
- [ ] Logs being collected
- [ ] SSL certificate valid
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Monitoring alerts set up

---

## 🔄 Update Process

```bash
# SSH into server
ssh root@droplet_ip

# Pull latest code
cd autoverse-chat/backend
git pull origin main

# Install dependencies
npm install

# Restart application
pm2 restart autoverse-chat

# Verify
pm2 logs
```

---

## 💰 Cost Estimates (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Heroku | $7-50 | Easiest, varies with usage |
| Railway | $5+ | Pay-as-you-go |
| DigitalOcean | $6+ | Basic droplet + object storage |
| AWS EC2 | $0-10 | Free tier available |
| MongoDB Atlas | Free-$30 | Free tier available |

---

## 📚 Resources

- [Heroku Deployment](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Railway Documentation](https://docs.railway.app/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-web-app-basic-deployments/)

---

**Good luck with your deployment! 🚀**
