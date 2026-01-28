# Connecting Node.js Backend to SQL Database

Complete guide to integrate the SQL database with your Node.js Express API.

---

## 📦 Installation

### Step 1: Install MySQL Package

```bash
cd c:\files\web-practice\chatapplication\backend
npm install mysql2 
```

Or for connection pooling:
```bash
npm install mysql2 mysql2/promise
```

### Step 2: Update package.json

Your package.json should include:
```json
{
  "dependencies": {
    "mysql2": "^3.6.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.0.3"
  }
}
```

---

## 🔧 Configuration

### Update .env File

Add these variables to your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=autoverse_chat

# Connection Pool
DB_CONNECTION_LIMIT=10
DB_WAIT_FOR_CONNECTIONS=true
DB_QUEUE_LIMIT=0
```

---

## 💾 Create Database Module

Create a new file: `database.js`

```javascript
// c:\files\web-practice\chatapplication\backend\database.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autoverse_chat',
  port: process.env.DB_PORT || 3306,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  queueLimit: process.env.DB_QUEUE_LIMIT || 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

// Test connection
pool.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

module.exports = pool;
```

---

## 🔌 Update server.js

Replace the MongoDB code with SQL code. Here's the key changes:

```javascript
// Import database pool instead of mongoose
const pool = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ... (keep all middleware and config)

// ============================
// AUTHENTICATION ROUTES
// ============================

// Register User
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validate input
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Get connection from pool
        const connection = await pool.getConnection();

        try {
            // Check if user already exists
            const [existingUser] = await connection.query(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [username.toLowerCase(), email.toLowerCase()]
            );

            if (existingUser.length > 0) {
                return res.status(409).json({ error: 'Username or email already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            await connection.query(
                'INSERT INTO users (username, email, password_hash, status) VALUES (?, ?, ?, ?)',
                [username.toLowerCase(), email.toLowerCase(), hashedPassword, 'offline']
            );

            // Create JWT token
            const token = jwt.sign(
                { username: username.toLowerCase() },
                process.env.JWT_SECRET || 'your_jwt_secret_key_here',
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    username: username.toLowerCase(),
                    email: email.toLowerCase(),
                },
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const connection = await pool.getConnection();

        try {
            // Find user
            const [users] = await connection.query(
                'SELECT id, username, email, password_hash, status FROM users WHERE username = ?',
                [username.toLowerCase()]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const user = users[0];

            // Compare password
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            // Update user status to online
            await connection.query(
                'UPDATE users SET status = ? WHERE id = ?',
                ['online', user.id]
            );

            // Create JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_SECRET || 'your_jwt_secret_key_here',
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    status: 'online',
                },
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// Logout User
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            // Update user status to offline
            await connection.query(
                'UPDATE users SET status = ? WHERE id = ?',
                ['offline', req.user.userId]
            );

            res.status(200).json({ message: 'Logout successful' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'An error occurred during logout' });
    }
});

// ============================
// USERS ROUTES
// ============================

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [users] = await connection.query(
                'SELECT id, username, email, status, created_at FROM users WHERE id != ? ORDER BY username',
                [req.user.userId]
            );

            res.status(200).json(users);
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});

// Get current user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [users] = await connection.query(
                'SELECT id, username, email, status, profile_picture, created_at FROM users WHERE id = ?',
                [req.user.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json(users[0]);
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching profile' });
    }
});

// Get user by ID
app.get('/api/users/:userId', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [users] = await connection.query(
                'SELECT id, username, email, status, profile_picture FROM users WHERE id = ?',
                [req.params.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json(users[0]);
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching user' });
    }
});

// ============================
// MESSAGE ROUTES
// ============================

// Send message
app.post('/api/messages', authenticateToken, async (req, res) => {
    try {
        const { receiverId, content, messageType = 'text', attachmentUrl } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Receiver ID and content are required' });
        }

        const connection = await pool.getConnection();

        try {
            // Insert message
            const [result] = await connection.query(
                'INSERT INTO messages (sender_id, receiver_id, content, message_type, attachment_url) VALUES (?, ?, ?, ?, ?)',
                [req.user.userId, receiverId, content, messageType, attachmentUrl]
            );

            const messageId = result.insertId;

            // Get the inserted message
            const [messages] = await connection.query(
                'SELECT * FROM messages WHERE id = ?',
                [messageId]
            );

            res.status(201).json({
                message: 'Message sent successfully',
                data: messages[0],
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Message error:', error);
        res.status(500).json({ error: 'An error occurred while sending message' });
    }
});

// Get messages between two users
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;

        const connection = await pool.getConnection();

        try {
            const [messages] = await connection.query(
                `SELECT * FROM v_message_details
                 WHERE (sender_id = ? AND receiver_id = ?)
                    OR (sender_id = ? AND receiver_id = ?)
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?`,
                [req.user.userId, userId, userId, req.user.userId, limit, skip]
            );

            res.status(200).json({
                count: messages.length,
                messages: messages.reverse(),
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching messages' });
    }
});

// Mark message as read
app.put('/api/messages/:messageId/read', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            await connection.query(
                'UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ?',
                [req.params.messageId]
            );

            const [messages] = await connection.query(
                'SELECT * FROM messages WHERE id = ?',
                [req.params.messageId]
            );

            if (messages.length === 0) {
                return res.status(404).json({ error: 'Message not found' });
            }

            res.status(200).json({
                message: 'Message marked as read',
                data: messages[0],
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating message' });
    }
});

// ============================
// FRIEND REQUEST ROUTES
// ============================

// Send friend request
app.post('/api/friend-requests', authenticateToken, async (req, res) => {
    try {
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ error: 'Receiver ID is required' });
        }

        if (req.user.userId === receiverId) {
            return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
        }

        const connection = await pool.getConnection();

        try {
            // Check if request already exists
            const [existingRequests] = await connection.query(
                `SELECT id FROM friend_requests 
                 WHERE (sender_id = ? AND receiver_id = ?)
                    OR (sender_id = ? AND receiver_id = ?)`,
                [req.user.userId, receiverId, receiverId, req.user.userId]
            );

            if (existingRequests.length > 0) {
                return res.status(409).json({ error: 'Friend request already exists' });
            }

            // Check if already friends
            const [friendships] = await connection.query(
                'SELECT id FROM friendships WHERE user_id = ? AND friend_id = ?',
                [req.user.userId, receiverId]
            );

            if (friendships.length > 0) {
                return res.status(409).json({ error: 'Already friends with this user' });
            }

            // Insert friend request
            const [result] = await connection.query(
                'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, ?)',
                [req.user.userId, receiverId, 'pending']
            );

            const [requests] = await connection.query(
                'SELECT * FROM v_pending_friend_requests WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json({
                message: 'Friend request sent',
                data: requests[0],
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Friend request error:', error);
        res.status(500).json({ error: 'An error occurred while sending friend request' });
    }
});

// Get pending friend requests
app.get('/api/friend-requests/pending', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [requests] = await connection.query(
                'SELECT * FROM v_pending_friend_requests WHERE receiver_id = ? ORDER BY created_at DESC',
                [req.user.userId]
            );

            res.status(200).json({
                count: requests.length,
                requests,
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching friend requests' });
    }
});

// Accept friend request
app.put('/api/friend-requests/:requestId/accept', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            // Get request details
            const [requests] = await connection.query(
                'SELECT sender_id, receiver_id FROM friend_requests WHERE id = ?',
                [req.params.requestId]
            );

            if (requests.length === 0) {
                return res.status(404).json({ error: 'Friend request not found' });
            }

            const { sender_id, receiver_id } = requests[0];

            if (receiver_id !== req.user.userId) {
                return res.status(403).json({ error: 'You can only accept your own requests' });
            }

            // Update request status
            await connection.query(
                'UPDATE friend_requests SET status = ?, responded_at = NOW() WHERE id = ?',
                ['accepted', req.params.requestId]
            );

            // Create friendships (both directions)
            await connection.query(
                'INSERT INTO friendships (user_id, friend_id) VALUES (?, ?), (?, ?)',
                [sender_id, receiver_id, receiver_id, sender_id]
            );

            const [updatedRequests] = await connection.query(
                'SELECT * FROM v_pending_friend_requests WHERE id = ?',
                [req.params.requestId]
            );

            res.status(200).json({
                message: 'Friend request accepted',
                data: updatedRequests[0] || { status: 'accepted' },
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({ error: 'An error occurred while accepting friend request' });
    }
});

// Decline friend request
app.put('/api/friend-requests/:requestId/decline', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            // Get request details
            const [requests] = await connection.query(
                'SELECT receiver_id FROM friend_requests WHERE id = ?',
                [req.params.requestId]
            );

            if (requests.length === 0) {
                return res.status(404).json({ error: 'Friend request not found' });
            }

            if (requests[0].receiver_id !== req.user.userId) {
                return res.status(403).json({ error: 'You can only decline your own requests' });
            }

            // Update request status
            await connection.query(
                'UPDATE friend_requests SET status = ?, responded_at = NOW() WHERE id = ?',
                ['declined', req.params.requestId]
            );

            res.status(200).json({
                message: 'Friend request declined',
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while declining friend request' });
    }
});

// Get user friends
app.get('/api/users/:userId/friends', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [friends] = await connection.query(
                'SELECT * FROM v_user_friends WHERE user_id = ?',
                [req.params.userId]
            );

            res.status(200).json({
                count: friends.length,
                friends: friends.map(f => ({
                    id: f.friend_id,
                    username: f.friend_username,
                    email: f.friend_email,
                    status: f.friend_status,
                })),
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching friends' });
    }
});

// ============================
// SERVER START
// ============================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

---

## ✅ Testing SQL Integration

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Test Get Users
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔄 Connection Pool Details

The database module uses connection pooling for performance:
- **connectionLimit**: Maximum number of connections
- **waitForConnections**: Queue requests if no connections available
- **enableKeepAlive**: Keep connections alive
- **queueLimit**: Maximum queued requests

---

## 📊 Common SQL Queries

### User Queries
```sql
-- Get user by username
SELECT * FROM users WHERE username = 'john_dealer';

-- Get all users except self
SELECT id, username, status FROM users WHERE id != 1;
```

### Message Queries
```sql
-- Get message history between two users
CALL sp_get_message_history(1, 2, 50, 0);

-- Get unread messages
SELECT * FROM messages WHERE receiver_id = 1 AND is_read = FALSE;
```

### Friend Queries
```sql
-- Get user's friends
SELECT * FROM v_user_friends WHERE user_id = 1;

-- Get pending friend requests
SELECT * FROM v_pending_friend_requests WHERE receiver_id = 1;
```

---

## 🐛 Troubleshooting

### "ER_ACCESS_DENIED_ERROR"
- Check DB_USER and DB_PASSWORD in .env
- Verify MySQL user has correct permissions

### "ER_BAD_DB_ERROR"
- Check DB_NAME in .env
- Ensure database was created

### "Connection timeout"
- Check if MySQL is running
- Verify DB_HOST and DB_PORT

### "Table doesn't exist"
- Run database.sql setup script
- Verify tables with: `SHOW TABLES;`

---

**Happy coding with SQL! 🚀**
