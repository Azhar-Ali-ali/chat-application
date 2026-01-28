# AutoVerse Chat - SQL Database Setup Guide

## Overview

This guide helps you set up the SQL database for the AutoVerse Chat application using MySQL or MariaDB.

---

## 📋 Prerequisites

- MySQL 5.7+ or MariaDB 10.3+
- MySQL Command Line Client or MySQL Workbench
- Administrator access to MySQL server
- The `database.sql` file from this backend directory

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Locate the SQL File
```bash
# The file is at:
c:\files\web-practice\chatapplication\backend\database.sql
```

### Step 2: Connect to MySQL
```bash
mysql -u root -p
# Enter your MySQL password when prompted
```

### Step 3: Run the SQL File
```bash
source c:\files\web-practice\chatapplication\backend\database.sql
# Or on Windows, use forward slashes:
source c:/files/web-practice/chatapplication/backend/database.sql
```

**Done!** Your database is created with all tables, indexes, views, and sample data.

---

## 📊 Database Tables

### 1. **users**
Stores user accounts and profiles
```
Columns:
- id (INT, Primary Key)
- username (VARCHAR 50, UNIQUE)
- email (VARCHAR 100, UNIQUE)
- password_hash (VARCHAR 255)
- profile_picture (LONGTEXT)
- status (ENUM: online, offline, away)
- created_at, updated_at, last_seen
```

### 2. **messages**
Stores all chat messages
```
Columns:
- id (INT, Primary Key)
- sender_id, receiver_id (INT, Foreign Keys)
- content (LONGTEXT)
- message_type (ENUM: text, image, file, link)
- attachment_url (LONGTEXT)
- is_read (BOOLEAN)
- read_at, created_at, updated_at
```

### 3. **conversations**
Stores conversation metadata
```
Columns:
- id (INT, Primary Key)
- last_message_id (INT, Foreign Key)
- last_message_at, created_at, updated_at
```

### 4. **conversation_participants**
Stores users in conversations (junction table)
```
Columns:
- id (INT, Primary Key)
- conversation_id, user_id (INT, Foreign Keys)
- added_at
```

### 5. **friend_requests**
Stores friend request status
```
Columns:
- id (INT, Primary Key)
- sender_id, receiver_id (INT, Foreign Keys)
- status (ENUM: pending, accepted, declined)
- created_at, responded_at
```

### 6. **friendships**
Stores friend relationships
```
Columns:
- id (INT, Primary Key)
- user_id, friend_id (INT, Foreign Keys)
- created_at
```

### 7. **message_attachments**
Stores file attachments
```
Columns:
- id (INT, Primary Key)
- message_id (INT, Foreign Key)
- file_name, file_path, file_type
- file_size, uploaded_at
```

### 8. **user_sessions**
Stores active user sessions
```
Columns:
- id (INT, Primary Key)
- user_id (INT, Foreign Key)
- token (VARCHAR 500, UNIQUE)
- ip_address, user_agent
- login_at, last_activity, expiry_at
```

### 9. **user_activity_log**
Logs user activities
```
Columns:
- id (INT, Primary Key)
- user_id (INT, Foreign Key)
- activity_type (VARCHAR 50)
- description, ip_address
- created_at
```

### 10. **blocked_users**
Stores blocked user relationships
```
Columns:
- id (INT, Primary Key)
- user_id, blocked_user_id (INT, Foreign Keys)
- reason, created_at
```

### 11. **message_reactions**
Stores emoji reactions on messages
```
Columns:
- id (INT, Primary Key)
- message_id, user_id (INT, Foreign Keys)
- reaction (VARCHAR 50)
- created_at
```

### 12. **notifications**
Stores user notifications
```
Columns:
- id (INT, Primary Key)
- user_id, sender_id (INT, Foreign Keys)
- notification_type (VARCHAR 50)
- title, message
- related_id, is_read, read_at
- created_at
```

---

## 📚 Database Views

### 1. **v_message_details**
Messages with sender and receiver information
```sql
SELECT * FROM v_message_details;
```

### 2. **v_user_friends**
User's friend list with status
```sql
SELECT * FROM v_user_friends WHERE user_id = 1;
```

### 3. **v_unread_messages_count**
Unread message count per user
```sql
SELECT * FROM v_unread_messages_count;
```

### 4. **v_conversation_summary**
Conversation details with participants
```sql
SELECT * FROM v_conversation_summary;
```

### 5. **v_pending_friend_requests**
Pending friend requests with user details
```sql
SELECT * FROM v_pending_friend_requests;
```

---

## 🔧 Stored Procedures

### 1. **sp_get_message_history**
Get messages between two users
```sql
CALL sp_get_message_history(1, 2, 50, 0);
-- Parameters: user1_id, user2_id, limit, offset
```

### 2. **sp_create_conversation**
Create new conversation with participants
```sql
CALL sp_create_conversation(1, 2);
```

### 3. **sp_send_friend_request**
Send friend request with validation
```sql
CALL sp_send_friend_request(1, 3);
```

### 4. **sp_accept_friend_request**
Accept friend request and create friendship
```sql
CALL sp_accept_friend_request(1);
```

### 5. **sp_get_unread_count**
Get unread message count for user
```sql
CALL sp_get_unread_count(1);
```

### 6. **sp_mark_messages_read**
Mark messages as read
```sql
CALL sp_mark_messages_read(1, 2);
-- Parameters: receiver_id, sender_id
```

---

## 🎯 Common Queries

### Get User by Username
```sql
SELECT * FROM users WHERE username = 'john_dealer';
```

### Get User's Friends
```sql
SELECT * FROM v_user_friends WHERE user_id = 1;
```

### Get Message History
```sql
CALL sp_get_message_history(1, 2, 50, 0);
```

### Get Unread Messages
```sql
SELECT * FROM messages 
WHERE receiver_id = 1 AND is_read = FALSE
ORDER BY created_at DESC;
```

### Get Pending Friend Requests
```sql
SELECT * FROM v_pending_friend_requests 
WHERE receiver_id = 1;
```

### Get Conversation Details
```sql
SELECT * FROM v_conversation_summary 
WHERE id = 1;
```

### Get Conversation Messages
```sql
SELECT m.* 
FROM messages m
JOIN conversation_participants cp1 ON cp1.conversation_id = ?
JOIN conversation_participants cp2 ON cp2.conversation_id = ?
WHERE (m.sender_id = cp1.user_id AND m.receiver_id = cp2.user_id)
   OR (m.sender_id = cp2.user_id AND m.receiver_id = cp1.user_id)
ORDER BY m.created_at DESC;
```

---

## 📊 Sample Data

The database includes sample data:
- **5 Users**: john_dealer, sarah_thompson, michael_chen, lisa_rodriguez, alex_kim
- **8 Messages**: Sample chat messages between users
- **6 Friendships**: Pre-created friend relationships
- **2 Pending Friend Requests**: Example pending requests

### Sample Users:
```
username: john_dealer
email: john@example.com
password_hash: $2a$10$... (use bcryptjs to generate real passwords)

username: sarah_thompson
email: sarah@example.com

username: michael_chen
email: michael@example.com

username: lisa_rodriguez
email: lisa@example.com

username: alex_kim
email: alex@example.com
```

---

## 🔐 Security Considerations

### 1. **Password Hashing**
Never store plain passwords. Use bcryptjs to hash passwords:
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(userPassword, 10);
```

### 2. **Password Column**
The `password_hash` column stores bcryptjs hashed passwords (255 characters).

### 3. **SQL Injection Prevention**
Always use parameterized queries:
```javascript
// ❌ DON'T DO THIS
connection.query(`SELECT * FROM users WHERE username = '${username}'`);

// ✅ DO THIS
connection.query('SELECT * FROM users WHERE username = ?', [username]);
```

### 4. **Data Validation**
- Validate all inputs before database operations
- Use foreign key constraints
- Use UNIQUE constraints for username/email

### 5. **Access Control**
Create database user with limited privileges:
```sql
CREATE USER 'chat_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON autoverse_chat.* TO 'chat_app'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🔄 Backup and Restore

### Backup Database
```bash
mysqldump -u root -p autoverse_chat > backup_autoverse_chat.sql
```

### Restore Database
```bash
mysql -u root -p autoverse_chat < backup_autoverse_chat.sql
```

### Backup with Date
```bash
mysqldump -u root -p autoverse_chat > backup_autoverse_chat_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🔍 Performance Optimization

### Indexes Created
The database includes indexes on:
- `username` (users table) - Fast username lookups
- `email` (users table) - Fast email lookups
- `sender_id, receiver_id` (messages) - Fast conversation queries
- `status` (users table) - Fast online/offline queries
- `created_at` - Fast time-based sorting
- `is_read` (messages) - Fast unread message queries

### Query Performance Tips
1. Use indexes on WHERE clauses
2. Use LIMIT and OFFSET for pagination
3. Use views for complex queries
4. Use stored procedures for frequent operations
5. Monitor slow queries

---

## 📊 Data Integrity

### Foreign Keys
All relationships use foreign keys with:
- ON DELETE CASCADE - Delete related records
- ON UPDATE RESTRICT - Prevent orphaned records

### UNIQUE Constraints
- `username` - One username per user
- `email` - One email per user
- `unique_friend_request` - One friend request per pair
- `unique_friendship` - One friendship per pair
- `unique_reaction` - One reaction per user per message

### Check Constraints
- Message types: text, image, file, link
- User status: online, offline, away
- Friend request status: pending, accepted, declined

---

## 🐛 Troubleshooting

### "Access denied for user 'root'"
```bash
# Reset MySQL root password (Windows)
mysqld --skip-grant-tables
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
```

### "Database already exists"
```sql
DROP DATABASE IF EXISTS autoverse_chat;
-- Then run the setup script again
```

### "Foreign key constraint fails"
- Ensure parent records exist before inserting child records
- Check data types match between foreign keys
- Verify referential integrity

### "Syntax error"
- Use proper MySQL version (5.7+)
- Check for typos in SQL statements
- Use backticks for reserved keywords

---

## 📈 Monitoring

### Check Database Size
```sql
SELECT 
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'autoverse_chat'
ORDER BY (data_length + index_length) DESC;
```

### Check Table Row Count
```sql
SELECT 
    table_name,
    table_rows
FROM information_schema.tables
WHERE table_schema = 'autoverse_chat'
ORDER BY table_rows DESC;
```

### Check Index Usage
```sql
SELECT 
    object_schema,
    object_name,
    COUNT(*) as count
FROM performance_schema.objects_summary_global_by_type
WHERE object_schema = 'autoverse_chat'
GROUP BY object_schema, object_name;
```

---

## 🔄 Migration from MongoDB

If migrating from MongoDB to SQL:

1. **Export MongoDB data** as JSON
2. **Parse and transform** JSON to match SQL schema
3. **Create users** with hashed passwords
4. **Create messages** with correct foreign keys
5. **Create relationships** (friendships, friend requests)
6. **Verify data integrity** with SELECT queries

---

## 📝 Database Naming Conventions

- **Tables**: singular nouns (user, message)
- **Columns**: snake_case (user_id, created_at)
- **Primary Keys**: id
- **Foreign Keys**: {table}_id
- **Views**: v_{descriptive_name}
- **Procedures**: sp_{action}_{object}

---

## ✅ Verification Checklist

After setup, verify:
```
✅ Database 'autoverse_chat' exists
✅ 12 tables created
✅ 5 views created
✅ 6 stored procedures created
✅ Sample data inserted
✅ Foreign key constraints active
✅ Indexes created
✅ Can query users table
✅ Can query messages table
✅ Stored procedures callable
```

---

## 🚀 Next Steps

1. **Connect from Application**
   - Update backend to use MySQL instead of MongoDB
   - Use mysql or mysql2 package

2. **Test Queries**
   - Run sample queries above
   - Verify data integrity

3. **Create Database User**
   - For security, use limited privilege user

4. **Set Up Backups**
   - Daily automated backups
   - Test restore procedures

5. **Monitor Performance**
   - Check slow query log
   - Optimize as needed

---

## 📚 Related Files

- **database.sql** - Complete database schema
- **README.md** - Main API documentation
- **API_TESTING.md** - Database query examples
- **DEPLOYMENT.md** - Production database setup

---

## 🔗 Useful Resources

- [MySQL Official Documentation](https://dev.mysql.com/doc/)
- [MySQL Best Practices](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [MariaDB Documentation](https://mariadb.com/kb/en/)
- [SQL Best Practices](https://sqlperformance.com/)

---

**Database Version**: 1.0.0  
**Created**: January 2024  
**Compatible with**: MySQL 5.7+, MariaDB 10.3+
