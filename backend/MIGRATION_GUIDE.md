# MongoDB to SQL Migration Guide

Complete guide for migrating your existing MongoDB chat data to SQL database.

---

## 📋 Overview

This guide helps you migrate from MongoDB (Mongoose) to MySQL/MariaDB while preserving all chat data.

---

## 🔄 Step 1: Export MongoDB Data

### Export Users Collection

```bash
mongoexport --db autoverse_chat --collection users --out users.json
```

**Sample MongoDB User Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john_dealer",
  "email": "john@example.com",
  "passwordHash": "$2b$10$...",
  "status": "online",
  "profilePicture": null,
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-20T14:45:00Z")
}
```

### Export Messages Collection

```bash
mongoexport --db autoverse_chat --collection messages --out messages.json
```

### Export Other Collections

```bash
mongoexport --db autoverse_chat --collection friendrequests --out friend_requests.json
mongoexport --db autoverse_chat --collection friendships --out friendships.json
mongoexport --db autoverse_chat --collection conversations --out conversations.json
```

---

## 🗄️ Step 2: Create SQL Database

Execute the provided `database.sql` script:

```bash
mysql -u root -p autoverse_chat < database.sql
```

Or via MySQL Workbench:
1. Open database.sql
2. Click "Execute" or press Ctrl+Shift+Enter

---

## 📝 Step 3: Create Migration Script

Create a new file: `migrate.js`

```javascript
// migrate.js - MongoDB to SQL Migration

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuration
const SQL_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'autoverse_chat'
};

// Read JSON files
function readJsonFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Create connection pool
async function getConnection() {
  return await mysql.createConnection(SQL_CONFIG);
}

// Map MongoDB ObjectId to a consistent number
function mongoIdToNumber(mongoId) {
  // Convert ObjectId hex string to decimal number
  if (typeof mongoId === 'object' && mongoId.toString) {
    mongoId = mongoId.toString();
  }
  return parseInt(mongoId.substring(0, 8), 16);
}

// Migrate Users
async function migrateUsers(users) {
  console.log('\n📦 Migrating users...');
  const connection = await getConnection();
  let migrated = 0;
  let failed = 0;

  try {
    for (const user of users) {
      try {
        const userId = mongoIdToNumber(user._id);
        
        // Check if user already exists
        const [existing] = await connection.query(
          'SELECT id FROM users WHERE id = ?',
          [userId]
        );

        if (existing.length > 0) {
          console.log(`  ⚠️  User ${user.username} (${userId}) already exists, skipping...`);
          continue;
        }

        await connection.query(
          `INSERT INTO users (id, username, email, password_hash, status, profile_picture, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            user.username?.toLowerCase() || 'unknown',
            user.email?.toLowerCase() || `user${userId}@example.com`,
            user.passwordHash || await bcrypt.hash('DefaultPassword123', 10),
            user.status || 'offline',
            user.profilePicture || null,
            user.createdAt || new Date(),
            user.updatedAt || new Date()
          ]
        );

        migrated++;
        console.log(`  ✅ Migrated user: ${user.username}`);
      } catch (error) {
        failed++;
        console.error(`  ❌ Failed to migrate user ${user.username}:`, error.message);
      }
    }
  } finally {
    connection.release();
  }

  console.log(`\n📊 Users Migration Complete: ${migrated} migrated, ${failed} failed`);
  return migrated;
}

// Migrate Messages
async function migrateMessages(messages, userIdMap = {}) {
  console.log('\n📨 Migrating messages...');
  const connection = await getConnection();
  let migrated = 0;
  let failed = 0;

  try {
    for (const msg of messages) {
      try {
        const messageId = mongoIdToNumber(msg._id);
        const senderId = mongoIdToNumber(msg.senderId);
        const receiverId = mongoIdToNumber(msg.receiverId);

        // Check if message already exists
        const [existing] = await connection.query(
          'SELECT id FROM messages WHERE id = ?',
          [messageId]
        );

        if (existing.length > 0) {
          continue; // Skip if already exists
        }

        await connection.query(
          `INSERT INTO messages (id, sender_id, receiver_id, content, message_type, is_read, created_at, read_at, attachment_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            messageId,
            senderId,
            receiverId,
            msg.content || '',
            msg.messageType || 'text',
            msg.isRead ? 1 : 0,
            msg.createdAt || new Date(),
            msg.readAt || null,
            msg.attachmentUrl || null
          ]
        );

        migrated++;
      } catch (error) {
        failed++;
        console.error(`  ❌ Failed to migrate message:`, error.message);
      }
    }
  } finally {
    connection.release();
  }

  console.log(`\n📊 Messages Migration Complete: ${migrated} migrated, ${failed} failed`);
  return migrated;
}

// Migrate Friend Requests
async function migrateFriendRequests(friendRequests) {
  console.log('\n👥 Migrating friend requests...');
  const connection = await getConnection();
  let migrated = 0;
  let failed = 0;

  try {
    for (const req of friendRequests) {
      try {
        const requestId = mongoIdToNumber(req._id);
        const senderId = mongoIdToNumber(req.senderId);
        const receiverId = mongoIdToNumber(req.receiverId);

        // Check if request already exists
        const [existing] = await connection.query(
          'SELECT id FROM friend_requests WHERE id = ?',
          [requestId]
        );

        if (existing.length > 0) {
          continue;
        }

        await connection.query(
          `INSERT INTO friend_requests (id, sender_id, receiver_id, status, created_at, responded_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            requestId,
            senderId,
            receiverId,
            req.status || 'pending',
            req.createdAt || new Date(),
            req.respondedAt || null
          ]
        );

        migrated++;
      } catch (error) {
        failed++;
        console.error(`  ❌ Failed to migrate friend request:`, error.message);
      }
    }
  } finally {
    connection.release();
  }

  console.log(`\n📊 Friend Requests Migration Complete: ${migrated} migrated, ${failed} failed`);
  return migrated;
}

// Migrate Friendships
async function migrateFriendships(friendships) {
  console.log('\n🤝 Migrating friendships...');
  const connection = await getConnection();
  let migrated = 0;
  let failed = 0;

  try {
    for (const friendship of friendships) {
      try {
        const friendshipId = mongoIdToNumber(friendship._id);
        const userId = mongoIdToNumber(friendship.userId);
        const friendId = mongoIdToNumber(friendship.friendId);

        // Check if friendship already exists
        const [existing] = await connection.query(
          'SELECT id FROM friendships WHERE user_id = ? AND friend_id = ?',
          [userId, friendId]
        );

        if (existing.length > 0) {
          continue;
        }

        await connection.query(
          `INSERT INTO friendships (id, user_id, friend_id, created_at)
           VALUES (?, ?, ?, ?)`,
          [
            friendshipId,
            userId,
            friendId,
            friendship.createdAt || new Date()
          ]
        );

        migrated++;
      } catch (error) {
        failed++;
        console.error(`  ❌ Failed to migrate friendship:`, error.message);
      }
    }
  } finally {
    connection.release();
  }

  console.log(`\n📊 Friendships Migration Complete: ${migrated} migrated, ${failed} failed`);
  return migrated;
}

// Main Migration Function
async function migrate() {
  console.log('🚀 Starting MongoDB to SQL Migration...\n');
  console.log('📁 Reading MongoDB export files...');

  try {
    // Read all JSON files
    const users = readJsonFile('users.json');
    const messages = readJsonFile('messages.json');
    const friendRequests = readJsonFile('friend_requests.json');
    const friendships = readJsonFile('friendships.json');

    console.log(`  Found ${users.length} users`);
    console.log(`  Found ${messages.length} messages`);
    console.log(`  Found ${friendRequests.length} friend requests`);
    console.log(`  Found ${friendships.length} friendships`);

    // Build user ID map
    const userIdMap = {};
    users.forEach(user => {
      userIdMap[user._id.toString()] = mongoIdToNumber(user._id);
    });

    // Migrate data
    const userCount = await migrateUsers(users);
    const messageCount = await migrateMessages(messages, userIdMap);
    const friendRequestCount = await migrateFriendRequests(friendRequests);
    const friendshipCount = await migrateFriendships(friendships);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ MIGRATION COMPLETE\n');
    console.log('📊 Migration Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Messages: ${messageCount}`);
    console.log(`   Friend Requests: ${friendRequestCount}`);
    console.log(`   Friendships: ${friendshipCount}`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
```

---

## ▶️ Step 4: Run Migration

### Prepare Files
1. Export MongoDB collections (see Step 1)
2. Place JSON files in backend directory:
   - `users.json`
   - `messages.json`
   - `friend_requests.json`
   - `friendships.json`

### Execute Migration

```bash
cd c:\files\web-practice\chatapplication\backend
node migrate.js
```

**Expected Output:**
```
🚀 Starting MongoDB to SQL Migration...

📁 Reading MongoDB export files...
  Found 5 users
  Found 8 messages
  Found 2 friend requests
  Found 6 friendships

📦 Migrating users...
  ✅ Migrated user: john_dealer
  ✅ Migrated user: sarah_buyer
  ✅ Migrated user: michael_inspector
  ✅ Migrated user: alice_seller
  ✅ Migrated user: bob_dealer

📨 Migrating messages...
  ✅ Migrated 8 messages

👥 Migrating friend requests...
  ✅ Migrated 2 friend requests

🤝 Migrating friendships...
  ✅ Migrated 6 friendships

==================================================
✅ MIGRATION COMPLETE

📊 Migration Summary:
   Users: 5
   Messages: 8
   Friend Requests: 2
   Friendships: 6
==================================================
```

---

## ✔️ Verify Migration

### Check Users
```sql
SELECT COUNT(*) as user_count FROM users;
SELECT * FROM users LIMIT 5;
```

### Check Messages
```sql
SELECT COUNT(*) as message_count FROM messages;
SELECT * FROM messages LIMIT 5;
```

### Check Friendships
```sql
SELECT COUNT(*) as friendship_count FROM friendships;
```

---

## 📊 Mapping Reference

| MongoDB | SQL | Notes |
|---------|-----|-------|
| `_id` | `id` | ObjectId converted to decimal |
| `createdAt` | `created_at` | Timestamp preserved |
| `passwordHash` | `password_hash` | Already hashed |
| `isRead` | `is_read` | Boolean to TINYINT |
| `messageType` | `message_type` | Text field preserved |

---

## ⚠️ Important Notes

1. **Backup First**: Always backup both MongoDB and SQL before migration
   ```bash
   # MongoDB backup
   mongodump --db autoverse_chat --out backup/

   # SQL backup
   mysqldump -u root -p autoverse_chat > backup/autoverse_chat_backup.sql
   ```

2. **Verify Data**: Check counts before and after
3. **Test Thoroughly**: Test all API endpoints with migrated data
4. **Keep MongoDB**: Don't delete MongoDB data until fully tested
5. **Update Connection**: Modify server.js to use SQL instead of MongoDB

---

## 🔄 Rollback Procedure

If migration fails or you need to rollback:

```bash
# Restore MongoDB from backup
mongorestore backup/

# Clear SQL database and restore from backup
mysql -u root -p autoverse_chat < backup/autoverse_chat_backup.sql
```

---

**Good luck with your migration! 🚀**
