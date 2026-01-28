# 🎯 SQL Backend - Visual Quick Start Guide

A visual guide to get your SQL chat backend running in 5 minutes.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      YOUR CHAT APPLICATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐                                            │
│  │   FRONTEND       │                                            │
│  │  chatpage.html   │                                            │
│  └────────┬─────────┘                                            │
│           │ HTTP/REST                                            │
│           ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    EXPRESS SERVER (Node.js) - server-sql.js             │   │
│  │                                                           │   │
│  │  Routes:                                                 │   │
│  │  • /api/auth/register & login                           │   │
│  │  • /api/messages - send & receive messages              │   │
│  │  • /api/friend-requests - manage friend requests        │   │
│  │  • /api/users - user management                         │   │
│  │  • /api/conversations - group chats                     │   │
│  └────────┬───────────────────────────────────────────────┘   │
│           │ SQL Queries                                         │
│           ▼                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    DATABASE CONNECTION POOL (database.js)               │  │
│  │    • Connection pooling                                 │  │
│  │    • Query execution                                    │  │
│  │    • Connection management                              │  │
│  └────────┬───────────────────────────────────────────────┘  │
│           │ SQL                                               │
│           ▼                                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         MYSQL/MARIADB DATABASE                          │ │
│  │                                                          │ │
│  │  Tables:                                                │ │
│  │  ✓ users - 5 sample users                              │ │
│  │  ✓ messages - direct messaging                         │ │
│  │  ✓ friend_requests - friend management                 │ │
│  │  ✓ friendships - active friendships                    │ │
│  │  ✓ conversations - group conversations                 │ │
│  │  ✓ + 7 more tables for features                        │ │
│  │                                                          │ │
│  │  Views:                                                 │ │
│  │  ✓ v_message_details - messages with user info         │ │
│  │  ✓ v_user_friends - user friend lists                  │ │
│  │  ✓ + 3 more views                                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ 5-Minute Quick Start

### Step 1️⃣: Install Dependencies (1 minute)
```bash
cd c:\files\web-practice\chatapplication\backend
npm install
```

**What it does**: Downloads express, mysql2, jwt, bcryptjs, cors, dotenv

---

### Step 2️⃣: Create Database (1 minute)
```bash
# Open MySQL and create database
mysql -u root -p

# Inside MySQL:
CREATE DATABASE autoverse_chat;
EXIT;

# Import schema
mysql -u root -p autoverse_chat < database.sql
```

**What it does**: Creates 12 tables, 5 views, 6 stored procedures, adds sample data

---

### Step 3️⃣: Configure Environment (1 minute)
Create/edit `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=autoverse_chat
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
CORS_ORIGIN=http://localhost:3000
```

**What it does**: Sets up database connection credentials

---

### Step 4️⃣: Use SQL Server (1 minute)
```bash
# Switch to SQL version
cp server-sql.js server.js

# Start server
npm start
```

**What it does**: Runs Express server connected to SQL database

---

### Step 5️⃣: Test It Works (1 minute)
```bash
# In another terminal:
curl http://localhost:5000/api/health
```

**Expected response**:
```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

## 📱 Testing the API

### Test 1: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Response** (save the token!):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {"username": "john", "email": "john@example.com"}
}
```

---

### Test 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "password123"
  }'
```

---

### Test 3: Get All Users
```bash
# Replace YOUR_TOKEN with token from registration
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Test 4: Send Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "receiverId": 2,
    "content": "Hello, how are you?"
  }'
```

---

## 🗄️ Database Structure (Visual)

```
┌─────────────────────────────────────────────────────────────┐
│              AUTOVERSE_CHAT DATABASE (SQL)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Users Table                                                │
│  ┌────────────────────────────────┐                        │
│  │ id │ username │ email │ status │ created_at │           │
│  ├────────────────────────────────┤                        │
│  │ 1  │ john     │ j@... │ online │ 2024-01-15 │           │
│  │ 2  │ sarah    │ s@... │ online │ 2024-01-16 │           │
│  │ 3  │ michael  │ m@... │ offline│ 2024-01-17 │           │
│  └────────────────────────────────┘                        │
│           ↓ References                                     │
│  Messages Table                                            │
│  ┌───────────────────────────────────────────┐            │
│  │ id │ sender_id │ receiver_id │ content │   │            │
│  ├───────────────────────────────────────────┤            │
│  │ 1  │ 1         │ 2           │ "Hello" │   │            │
│  │ 2  │ 2         │ 1           │ "Hi!" │     │            │
│  │ 3  │ 1         │ 3           │ "How r u?"  │            │
│  └───────────────────────────────────────────┘            │
│                                                             │
│  Friend_Requests Table                                     │
│  ┌──────────────────────────────────┐                     │
│  │ id │ sender_id │ receiver_id │... │                    │
│  ├──────────────────────────────────┤                     │
│  │ 1  │ 1         │ 3           │    │                    │
│  └──────────────────────────────────┘                     │
│           ↓ When Accepted ↓                                │
│  Friendships Table                                         │
│  ┌───────────────────────────────┐                        │
│  │ id │ user_id │ friend_id │... │                        │
│  ├───────────────────────────────┤                        │
│  │ 1  │ 1       │ 2         │    │                        │
│  │ 2  │ 2       │ 1         │    │                        │
│  │ 3  │ 1       │ 3         │    │                        │
│  │ 4  │ 3       │ 1         │    │                        │
│  └───────────────────────────────┘                        │
│                                                             │
│  + 8 More Tables:                                          │
│  • conversations (group chats)                            │
│  • conversation_participants (members)                    │
│  • message_attachments (files)                            │
│  • blocked_users (blocked relationships)                  │
│  • user_sessions (login sessions)                         │
│  • message_reactions (emoji reactions)                    │
│  • user_activity_log (tracking)                           │
│  • notifications (user notifications)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Example

### Sending a Message Flow:

```
1. Frontend sends POST request
   POST /api/messages
   {receiverId: 2, content: "Hello"}
                ↓
2. Express server receives request
   app.post('/api/messages', authenticateToken, async...)
                ↓
3. Validate JWT token
   if (token invalid) return 403 Forbidden
                ↓
4. Connect to database
   const connection = await pool.getConnection()
                ↓
5. Execute SQL INSERT query
   INSERT INTO messages (sender_id, receiver_id, content, ...)
   VALUES (1, 2, "Hello", ...)
                ↓
6. Database inserts and returns ID
   messageId = 5
                ↓
7. Fetch inserted message
   SELECT * FROM messages WHERE id = 5
                ↓
8. Return response to frontend
   {"message": "sent", "data": {...}}
                ↓
9. Frontend receives and displays
   Message appears in chat UI
```

---

## 📁 File Organization

```
YOUR BACKEND FOLDER
├─ 🗄️ DATABASE FILES
│  ├─ database.sql ..................... SQL Schema (import this!)
│  └─ database.js ...................... Connection Pool
│
├─ 🖥️ SERVER FILES
│  ├─ server-sql.js .................... SQL Version (USE THIS)
│  ├─ server.js ........................ MongoDB Version (original)
│  └─ package.json ..................... Dependencies
│
├─ ⚙️ CONFIG
│  ├─ .env ............................ Environment Variables
│  └─ .env.example .................... Template
│
└─ 📚 DOCUMENTATION
   ├─ COMPLETE_SQL_SETUP.md ............ START HERE
   ├─ SQL_INTEGRATION_GUIDE.md ......... Node.js Integration
   ├─ MIGRATION_GUIDE.md .............. MongoDB → SQL
   ├─ SQL_DATABASE_SETUP.md ........... Database Info
   ├─ API_TESTING.md .................. Testing Examples
   ├─ README.md ....................... API Reference
   └─ ... 15+ more docs
```

---

## ✅ Checklist - Are You Ready?

- [ ] Node.js installed (check: `node --version`)
- [ ] MySQL installed (check: `mysql --version`)
- [ ] Backend folder accessible (c:\files\web-practice\chatapplication\backend\)
- [ ] Dependencies installed (`npm install`)
- [ ] Database created (`CREATE DATABASE autoverse_chat;`)
- [ ] Schema imported (`mysql ... < database.sql`)
- [ ] .env file configured with credentials
- [ ] server-sql.js copied to server.js
- [ ] Server starts (`npm start`)
- [ ] Health check passes (`curl http://localhost:5000/api/health`)

---

## 🎯 Common Commands

```bash
# Install dependencies
npm install

# Start server with SQL
npm start

# Stop server
Ctrl + C

# Check database
mysql -u root -p autoverse_chat

# View all tables
SHOW TABLES;

# View users
SELECT * FROM users;

# Backup database
mysqldump -u root -p autoverse_chat > backup.sql

# Restore database
mysql -u root -p autoverse_chat < backup.sql

# Test API
curl http://localhost:5000/api/health
```

---

## 🐛 If Something Goes Wrong

### Problem: "Cannot connect to database"
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check credentials in .env
cat .env
```

### Problem: "Port 5000 already in use"
```bash
# Change port in .env or kill process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <number> /F
```

### Problem: "Table doesn't exist"
```bash
# Re-import schema
mysql -u root -p autoverse_chat < database.sql

# Verify
mysql -u root -p autoverse_chat -e "SHOW TABLES;"
```

---

## 🎉 What's Next?

✅ Backend is running with SQL database
✅ All endpoints are working
✅ Sample data is loaded

Now:
1. **Test more endpoints** using [API_TESTING.md](API_TESTING.md)
2. **Connect your frontend** to http://localhost:5000/api
3. **Add real-time features** with Socket.IO
4. **Deploy to production** using [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📞 Need Help?

- **Setup issues**: Read [COMPLETE_SQL_SETUP.md](COMPLETE_SQL_SETUP.md)
- **API questions**: Check [README.md](README.md)
- **Testing**: Use [API_TESTING.md](API_TESTING.md) examples
- **File reference**: See [SQL_FILES_INDEX.md](SQL_FILES_INDEX.md)

---

## 🚀 You're All Set!

Your SQL-based chat backend is ready to power your application!

**Start exploring the API and building awesome features!** 🎉

