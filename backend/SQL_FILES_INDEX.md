# 📚 SQL Backend Files Index

Complete guide to all SQL database files and documentation.

---

## 📂 File Structure

```
backend/
├── 🗄️ DATABASE FILES
│   ├── database.sql                    # SQL schema (12 tables, views, procedures)
│   └── database.js                     # Connection pool configuration
│
├── 🖥️ SERVER FILES
│   ├── server.js                       # Express server (MongoDB version)
│   └── server-sql.js                   # Express server (SQL version) ⭐ NEW
│
├── ⚙️ CONFIGURATION
│   ├── package.json                    # Dependencies
│   ├── .env                            # Environment variables
│   └── .env.example                    # Configuration template
│
└── 📖 DOCUMENTATION
    ├── 📋 SQL GUIDES (NEW)
    │   ├── SQL_DATABASE_SETUP.md       # SQL database configuration
    │   ├── SQL_INTEGRATION_GUIDE.md    # Integrate SQL with Node.js
    │   ├── MIGRATION_GUIDE.md          # MongoDB to SQL migration
    │   └── COMPLETE_SQL_SETUP.md       # Complete setup walkthrough
    │
    ├── 🌐 API DOCUMENTATION
    │   ├── README.md                   # Complete API reference (35+ endpoints)
    │   ├── API_TESTING.md              # Testing examples & Postman collection
    │   └── QUICK_START.md              # 5-minute quick start
    │
    ├── 📚 GENERAL GUIDES
    │   ├── DATABASE_SETUP.md           # MongoDB setup (original)
    │   ├── DEPLOYMENT.md               # Production deployment (4 platforms)
    │   ├── PACKAGE_CONTENTS.md         # Package overview
    │   └── COMPLETION.md               # Project completion status
    │
    └── 📋 REFERENCE
        ├── INDEX.md                    # Navigation guide
        ├── DELIVERY_SUMMARY.md         # Delivery details
        └── READ_ME_FIRST.txt           # Start here!
```

---

## 🆕 SQL-Specific Files (What's New)

### 1. **database.sql**
**Purpose**: Complete SQL database schema

**Contains**:
- 12 tables (users, messages, conversations, friend_requests, etc.)
- 5 database views (v_message_details, v_user_friends, etc.)
- 6 stored procedures (sp_get_message_history, sp_send_friend_request, etc.)
- Indexes for performance optimization
- Sample data (5 users, 8 messages, 6 friendships)

**Use**: Import once to set up database
```bash
mysql -u root -p autoverse_chat < database.sql
```

---

### 2. **database.js**
**Purpose**: Node.js MySQL connection pool

**Contains**:
- MySQL connection pool configuration
- Connection validation
- Error handling
- Connection release management

**How it works**:
```javascript
const pool = require('./database');
const connection = await pool.getConnection();
const [rows] = await connection.query('SELECT * FROM users');
connection.release();
```

---

### 3. **server-sql.js** ⭐ NEW
**Purpose**: Express.js server using SQL database

**Contains**:
- 35+ API endpoints (all working with SQL)
- Authentication routes (register, login, logout)
- User management (CRUD operations)
- Messaging system (send, fetch, mark read, delete)
- Friend request system (send, accept, decline)
- Conversation management
- Block user functionality

**When to use**: Use this instead of `server.js` if you want SQL

**How to switch**:
```bash
# Backup original
cp server.js server-mongodb.js

# Use SQL version
cp server-sql.js server.js

# Start
npm start
```

---

## 📖 Documentation by Use Case

### 🚀 Getting Started
1. **Start here**: [READ_ME_FIRST.txt](READ_ME_FIRST.txt)
2. **Quick setup**: [QUICK_START.md](QUICK_START.md) - 5 minutes
3. **Complete guide**: [COMPLETE_SQL_SETUP.md](COMPLETE_SQL_SETUP.md) - Detailed walkthrough

---

### 🗄️ Setting Up SQL Database
1. **Database setup**: [SQL_DATABASE_SETUP.md](SQL_DATABASE_SETUP.md)
   - Table structure
   - Create tables
   - Views and stored procedures
   - Sample data

2. **Node.js integration**: [SQL_INTEGRATION_GUIDE.md](SQL_INTEGRATION_GUIDE.md)
   - Install mysql2 package
   - Configure connection pool
   - Update server.js
   - Test endpoints

---

### 📊 Database Management
- **View table structure**: Check [SQL_DATABASE_SETUP.md](SQL_DATABASE_SETUP.md#tables)
- **Run queries**: See examples in [COMPLETE_SQL_SETUP.md](COMPLETE_SQL_SETUP.md#database-operations)
- **Stored procedures**: [SQL_DATABASE_SETUP.md](SQL_DATABASE_SETUP.md#stored-procedures)

---

### 🔄 Migrating from MongoDB to SQL
1. **Migration guide**: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
   - Export MongoDB data
   - Create SQL database
   - Run migration script
   - Verify data
   - Troubleshoot issues

---

### 🧪 Testing API Endpoints
1. **API documentation**: [README.md](README.md) - All endpoints documented
2. **Testing guide**: [API_TESTING.md](API_TESTING.md) - 50+ cURL examples
3. **Quick test**: [COMPLETE_SQL_SETUP.md](COMPLETE_SQL_SETUP.md#step-6-test-api-endpoints)

---

### 🚀 Deploying to Production
- **Deployment guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
  - Heroku
  - Railway
  - DigitalOcean
  - AWS

---

## 🔧 Configuration Files

### .env (Environment Variables)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=autoverse_chat

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_secret_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

### package.json (Dependencies)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
```

---

## 📊 Database Schema Overview

### Tables (12)
| Table | Purpose |
|-------|---------|
| users | User accounts & authentication |
| messages | Direct messages between users |
| conversations | Group conversations |
| conversation_participants | Users in conversations |
| friend_requests | Friend request management |
| friendships | Active friendships |
| message_attachments | File attachments |
| user_sessions | User login sessions |
| user_activity_log | Activity tracking |
| blocked_users | Blocked user relationships |
| message_reactions | Message reactions/emoji |
| notifications | User notifications |

### Views (5)
| View | Purpose |
|------|---------|
| v_message_details | Messages with user info |
| v_user_friends | User friend lists |
| v_unread_messages_count | Unread message counts |
| v_conversation_summary | Conversation details |
| v_pending_friend_requests | Pending friend requests |

### Stored Procedures (6)
| Procedure | Purpose |
|-----------|---------|
| sp_get_message_history | Fetch paginated messages |
| sp_create_conversation | Create conversation with participants |
| sp_send_friend_request | Send friend request with validation |
| sp_accept_friend_request | Accept request and create friendship |
| sp_get_unread_count | Get unread messages count |
| sp_mark_messages_read | Mark multiple messages as read |

---

## 🎯 Quick Reference

### Start Backend with SQL
```bash
cd c:\files\web-practice\chatapplication\backend
npm install          # Install dependencies
cp server-sql.js server.js  # Use SQL version
npm start           # Start server
```

### Common Tasks

**View database**:
```bash
mysql -u root -p autoverse_chat
SHOW TABLES;
SELECT * FROM users;
```

**Test API**:
```bash
curl http://localhost:5000/api/health
```

**View logs**:
```bash
npm start
# Watch console output
```

**Backup database**:
```bash
mysqldump -u root -p autoverse_chat > backup.sql
```

**Restore database**:
```bash
mysql -u root -p autoverse_chat < backup.sql
```

---

## ❓ FAQ

**Q: Should I use MongoDB or SQL?**
A: Both are fully supported. SQL is better for relational data (friends, conversations). MongoDB is simpler for NoSQL. Choose based on your preference.

**Q: How do I switch between MongoDB and SQL?**
A: Replace server.js with server-sql.js and install mysql2 package instead of mongoose.

**Q: Can I use both simultaneously?**
A: Yes, but you'd need to modify the code to support both databases via an abstraction layer.

**Q: How do I migrate existing MongoDB data to SQL?**
A: Use [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for step-by-step instructions.

**Q: Where do I put uploaded files?**
A: Create a `uploads/` folder and configure the server to serve static files (examples in [server-sql.js](server-sql.js#L47-L49)).

**Q: How do I add real-time chat (WebSockets)?**
A: Install `socket.io`: `npm install socket.io` and follow examples in [README.md](README.md).

---

## 📞 Support Files

- **API Reference**: [README.md](README.md) - All endpoints with examples
- **Testing**: [API_TESTING.md](API_TESTING.md) - Postman collection + cURL examples
- **Troubleshooting**: [COMPLETE_SQL_SETUP.md](COMPLETE_SQL_SETUP.md#-troubleshooting)
- **Security**: [DEPLOYMENT.md](DEPLOYMENT.md#-security-considerations)

---

## ✅ Verification Checklist

- [ ] Node.js and npm installed
- [ ] MySQL/MariaDB installed and running
- [ ] Dependencies installed: `npm install`
- [ ] Database created: `mysql -u root -p -e "CREATE DATABASE autoverse_chat;"`
- [ ] Schema imported: `mysql -u root -p autoverse_chat < database.sql`
- [ ] .env configured with DB credentials
- [ ] Server starts: `npm start`
- [ ] Health check passes: `curl http://localhost:5000/api/health`
- [ ] Can register user
- [ ] Can send message
- [ ] Frontend can connect

---

## 🚀 Next Steps

1. **Complete SQL Setup**: Follow [COMPLETE_SQL_SETUP.md](COMPLETE_SQL_SETUP.md)
2. **Test All Endpoints**: Use [API_TESTING.md](API_TESTING.md)
3. **Connect Frontend**: Update chatpage.html with API URL
4. **Add Real-time Features**: Implement WebSockets with Socket.IO
5. **Deploy to Production**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Happy coding! 🎉**

For detailed help, refer to specific documentation files listed above.
