# Complete SQL Backend Setup Guide

Everything you need to set up and run your Node.js backend with SQL database.

---

## 📋 Overview

This guide covers:
1. ✅ Database installation and setup
2. ✅ Node.js backend configuration
3. ✅ Running the server
4. ✅ Testing all endpoints
5. ✅ Troubleshooting

---

## 🔧 Prerequisites

Before you start, ensure you have:
- **Node.js** v14+ and npm installed
- **MySQL** 5.7+ or **MariaDB** 10.3+ installed
- Basic knowledge of SQL and JavaScript
- Your frontend files in place

### Check Versions

```bash
node --version
npm --version
mysql --version
```

---

## 📦 Step 1: Install Dependencies

Navigate to your backend directory:

```bash
cd c:\files\web-practice\chatapplication\backend
```

Install all required packages:

```bash
npm install
```

This will install:
- `express` - Web framework
- `mysql2` - MySQL database driver
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

---

## 🗄️ Step 2: Create the Database

### Option A: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE autoverse_chat;

# Select database
USE autoverse_chat;

# Import SQL schema
SOURCE c:/files/web-practice/chatapplication/backend/database.sql;
```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script → Select `database.sql`
4. Click Execute (Ctrl + Shift + Enter)
5. Verify tables were created: `SHOW TABLES;`

### Option C: Using Command Line Import

```bash
mysql -u root -p autoverse_chat < c:\files\web-practice\chatapplication\backend\database.sql
```

### Verify Database Creation

```bash
mysql -u root -p autoverse_chat -e "SHOW TABLES;"
```

Expected output:
```
+-----------------------------------+
| Tables_in_autoverse_chat          |
+-----------------------------------+
| blocked_users                     |
| conversation_participants         |
| conversations                     |
| friend_requests                   |
| friendships                       |
| message_attachments               |
| message_reactions                 |
| messages                          |
| notifications                     |
| user_activity_log                 |
| user_sessions                     |
| users                             |
+-----------------------------------+
```

---

## ⚙️ Step 3: Configure Environment Variables

Create or edit `.env` file in your backend directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=autoverse_chat

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Important: JWT_SECRET

The JWT_SECRET should be:
- At least 32 characters long
- Random and unique
- Kept secure
- Changed in production

Example secure JWT_SECRET:
```
JWT_SECRET=aB3$xK9@mL2#pQ7!nW5^vC6&hD4*jF8%eR0~tY1+sU2-iO3(lA4)
```

---

## ▶️ Step 4: Start the Server

### Option A: Production Mode

```bash
npm start
```

### Option B: Development Mode (with auto-reload)

```bash
npm run dev
```

### Expected Output

```
🚀 Server is running on port 5000
📊 Database: SQL (MySQL/MariaDB)
🌐 CORS enabled for: http://localhost:3000
📍 Environment: development
```

---

## ✅ Step 5: Verify Server is Running

### Test Health Endpoint

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

## 🧪 Step 6: Test API Endpoints

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_dealer",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "john_dealer",
    "email": "john@example.com"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_dealer",
    "password": "password123"
  }'
```

**Save the returned token for subsequent requests!**

### 3. Get All Users

Replace `YOUR_TOKEN` with the token from login:

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Your Profile

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Send a Message

```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "receiverId": 2,
    "content": "Hey, how are you?",
    "messageType": "text"
  }'
```

### 6. Get Messages with a User

```bash
curl -X GET "http://localhost:5000/api/messages/2?limit=50&skip=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Send Friend Request

```bash
curl -X POST http://localhost:5000/api/friend-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "receiverId": 2
  }'
```

### 8. Get Pending Friend Requests

```bash
curl -X GET http://localhost:5000/api/friend-requests/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 9. Accept Friend Request

```bash
curl -X PUT http://localhost:5000/api/friend-requests/1/accept \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Get Friends

```bash
curl -X GET http://localhost:5000/api/users/2/friends \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Database Operations

### View All Users

```sql
SELECT id, username, email, status, created_at FROM users;
```

### View All Messages

```sql
SELECT m.id, u1.username as sender, u2.username as receiver, m.content, m.created_at
FROM messages m
LEFT JOIN users u1 ON m.sender_id = u1.id
LEFT JOIN users u2 ON m.receiver_id = u2.id
ORDER BY m.created_at DESC;
```

### View Friend Requests

```sql
SELECT fr.id, u_sender.username as from_user, u_receiver.username as to_user, fr.status, fr.created_at
FROM friend_requests fr
LEFT JOIN users u_sender ON fr.sender_id = u_sender.id
LEFT JOIN users u_receiver ON fr.receiver_id = u_receiver.id;
```

### View Friendships

```sql
SELECT u1.username as user1, u2.username as user2
FROM friendships f
LEFT JOIN users u1 ON f.user_id = u1.id
LEFT JOIN users u2 ON f.friend_id = u2.id;
```

---

## 🔧 Switching Between MongoDB and SQL

### Using MongoDB (Original)
```bash
npm start
# Runs server.js (uses MongoDB with Mongoose)
```

### Using SQL (New)
```bash
# Update server.js or rename server-sql.js to server.js
# Then:
npm start
```

### How to Switch

**Option 1: Replace server.js**
```bash
# Backup original
cp server.js server-mongodb.js

# Use SQL version
cp server-sql.js server.js

# Start server
npm start
```

**Option 2: Keep both and switch via package.json**

Update `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "start-sql": "node server-sql.js",
    "start-mongo": "node server.js"
  }
}
```

Then run:
```bash
npm run start-sql    # Use SQL
npm run start-mongo  # Use MongoDB
```

---

## 🚀 Connect Frontend to Backend

### Update Frontend Configuration

In your `chatpage.html`, set the API URL:

```javascript
const API_URL = 'http://localhost:5000/api';

// Login example
async function login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
}

// Send message example
async function sendMessage(receiverId, content) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            receiverId,
            content,
            messageType: 'text'
        })
    });
    
    return await response.json();
}
```

---

## 🐛 Troubleshooting

### ❌ "Cannot connect to MySQL server"

**Cause**: MySQL is not running or credentials are wrong

**Solution**:
```bash
# Check if MySQL is running
mysql -u root -p -e "SELECT 1"

# Start MySQL (Windows)
net start MySQL80
```

### ❌ "ER_BAD_DB_ERROR: Unknown database"

**Cause**: Database doesn't exist

**Solution**:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE autoverse_chat;"

# Import schema
mysql -u root -p autoverse_chat < database.sql
```

### ❌ "ER_ACCESS_DENIED_ERROR"

**Cause**: Wrong username or password in .env

**Solution**:
1. Check .env file DB_USER and DB_PASSWORD
2. Verify credentials work: `mysql -u root -p`
3. Update .env with correct values

### ❌ "Connection timeout"

**Cause**: MySQL not responding

**Solution**:
```bash
# Check connection
mysql -u root -p -h localhost -e "SELECT 1"

# Verify host and port in .env
# Default: localhost:3306
```

### ❌ "Cannot find module 'mysql2'"

**Cause**: Dependencies not installed

**Solution**:
```bash
npm install
# or
npm install mysql2
```

### ❌ "Port 5000 is already in use"

**Cause**: Another process is using port 5000

**Solution**:
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### ❌ "CORS error when connecting from frontend"

**Cause**: CORS_ORIGIN doesn't match frontend URL

**Solution**:
Check your frontend URL and update .env:
```env
# If frontend is on port 3000
CORS_ORIGIN=http://localhost:3000

# If frontend is on different port
CORS_ORIGIN=http://localhost:YOUR_PORT
```

---

## 📁 Project Structure

```
backend/
├── server.js                    # MongoDB version (original)
├── server-sql.js               # SQL version (new)
├── database.js                 # SQL connection pool
├── database.sql                # SQL schema and sample data
├── package.json                # Dependencies
├── .env                        # Configuration
├── .env.example               # Configuration template
├── README.md                  # Complete API documentation
├── QUICK_START.md             # Quick setup guide
├── DATABASE_SETUP.md          # MongoDB setup guide
├── SQL_DATABASE_SETUP.md      # SQL database guide
├── SQL_INTEGRATION_GUIDE.md   # SQL integration with Node.js
├── MIGRATION_GUIDE.md         # MongoDB to SQL migration
├── API_TESTING.md             # API testing examples
├── DEPLOYMENT.md              # Production deployment
└── node_modules/              # Installed dependencies
```

---

## ✨ Next Steps

1. ✅ Database is set up
2. ✅ Server is running
3. ✅ API endpoints are tested
4. ✅ Frontend is connected

Now you can:
- Build your chat interface in the frontend
- Add real-time features (WebSockets)
- Implement file uploads
- Add advanced security features
- Deploy to production

---

## 🔒 Security Best Practices

1. **Always use .env for secrets** (never commit to git)
2. **Hash passwords** (bcryptjs is already used)
3. **Validate all inputs** (already implemented)
4. **Use HTTPS in production** (update CORS_ORIGIN)
5. **Implement rate limiting** (add express-rate-limit)
6. **Log all activities** (user_activity_log table provided)
7. **Regular backups** (backup autoverse_chat database monthly)

### Add Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [JWT Documentation](https://jwt.io/)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)

---

**Happy coding! 🚀**

For more help, refer to:
- [README.md](README.md) - Complete API reference
- [API_TESTING.md](API_TESTING.md) - Testing examples
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

