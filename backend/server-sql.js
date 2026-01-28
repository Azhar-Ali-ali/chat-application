// server-sql.js
// Complete Express.js API server using SQL database (MySQL/MariaDB)
// Use this instead of server.js if you want to use SQL

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./database'); // Import SQL connection pool
require('dotenv').config();

const app = express();

// ============================
// MIDDLEWARE
// ============================

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================
// AUTHENTICATION MIDDLEWARE
// ============================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token is required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// ============================
// HEALTH CHECK
// ============================

app.get('/api/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        connection.release();
        
        res.status(200).json({
            status: 'OK',
            database: 'connected',
            timestamp: new Date(),
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            error: error.message,
        });
    }
});

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
// USER ROUTES
// ============================

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [users] = await connection.query(
                'SELECT id, username, email, status, profile_picture, created_at FROM users WHERE id != ? ORDER BY username',
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

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { email, profilePicture } = req.body;

        const connection = await pool.getConnection();

        try {
            // Check if email is already taken
            if (email) {
                const [existingUser] = await connection.query(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [email.toLowerCase(), req.user.userId]
                );

                if (existingUser.length > 0) {
                    return res.status(409).json({ error: 'Email already in use' });
                }
            }

            // Update user
            await connection.query(
                'UPDATE users SET email = ?, profile_picture = ? WHERE id = ?',
                [email || null, profilePicture || null, req.user.userId]
            );

            const [users] = await connection.query(
                'SELECT id, username, email, status, profile_picture FROM users WHERE id = ?',
                [req.user.userId]
            );

            res.status(200).json({
                message: 'Profile updated successfully',
                user: users[0],
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating profile' });
    }
});

// Change password
app.put('/api/users/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const connection = await pool.getConnection();

        try {
            // Get user
            const [users] = await connection.query(
                'SELECT password_hash FROM users WHERE id = ?',
                [req.user.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = users[0];

            // Verify current password
            const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

            if (!passwordMatch) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await connection.query(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [hashedPassword, req.user.userId]
            );

            res.status(200).json({ message: 'Password changed successfully' });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while changing password' });
    }
});

// Get user status
app.get('/api/users/:userId/status', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [users] = await connection.query(
                'SELECT status FROM users WHERE id = ?',
                [req.params.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ status: users[0].status });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching user status' });
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
            // Verify receiver exists
            const [receiver] = await connection.query(
                'SELECT id FROM users WHERE id = ?',
                [receiverId]
            );

            if (receiver.length === 0) {
                return res.status(404).json({ error: 'Receiver not found' });
            }

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
                `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.message_type, 
                        m.is_read, m.created_at, m.read_at, m.attachment_url,
                        u_sender.username as sender_username, u_receiver.username as receiver_username
                 FROM messages m
                 LEFT JOIN users u_sender ON m.sender_id = u_sender.id
                 LEFT JOIN users u_receiver ON m.receiver_id = u_receiver.id
                 WHERE (m.sender_id = ? AND m.receiver_id = ?)
                    OR (m.sender_id = ? AND m.receiver_id = ?)
                 ORDER BY m.created_at DESC
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

// Delete message
app.delete('/api/messages/:messageId', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            // Check if user is the sender
            const [messages] = await connection.query(
                'SELECT sender_id FROM messages WHERE id = ?',
                [req.params.messageId]
            );

            if (messages.length === 0) {
                return res.status(404).json({ error: 'Message not found' });
            }

            if (messages[0].sender_id !== req.user.userId) {
                return res.status(403).json({ error: 'You can only delete your own messages' });
            }

            // Delete message
            await connection.query(
                'DELETE FROM messages WHERE id = ?',
                [req.params.messageId]
            );

            res.status(200).json({ message: 'Message deleted successfully' });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting message' });
    }
});

// Get unread messages count
app.get('/api/messages/unread/count', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [result] = await connection.query(
                'SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
                [req.user.userId]
            );

            res.status(200).json({ unreadCount: result[0].unread_count });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching unread count' });
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
                'SELECT * FROM friend_requests WHERE id = ?',
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
                `SELECT fr.id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at,
                        u.username, u.email, u.status as user_status
                 FROM friend_requests fr
                 LEFT JOIN users u ON fr.sender_id = u.id
                 WHERE fr.receiver_id = ? AND fr.status = 'pending'
                 ORDER BY fr.created_at DESC`,
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
                'INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)',
                [sender_id, receiver_id]
            );

            await connection.query(
                'INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)',
                [receiver_id, sender_id]
            );

            res.status(200).json({
                message: 'Friend request accepted',
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
                `SELECT u.id, u.username, u.email, u.status, u.profile_picture
                 FROM friendships f
                 LEFT JOIN users u ON f.friend_id = u.id
                 WHERE f.user_id = ?
                 ORDER BY u.username`,
                [req.params.userId]
            );

            res.status(200).json({
                count: friends.length,
                friends,
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching friends' });
    }
});

// ============================
// CONVERSATION ROUTES
// ============================

// Create conversation (auto-created when messaging)
app.post('/api/conversations', authenticateToken, async (req, res) => {
    try {
        const { participantIds } = req.body;

        if (!participantIds || participantIds.length === 0) {
            return res.status(400).json({ error: 'Participant IDs are required' });
        }

        const connection = await pool.getConnection();

        try {
            // Create conversation
            const [result] = await connection.query(
                'INSERT INTO conversations (created_by, conversation_type) VALUES (?, ?)',
                [req.user.userId, participantIds.length > 1 ? 'group' : 'one-to-one']
            );

            const conversationId = result.insertId;

            // Add participants
            for (const participantId of participantIds) {
                await connection.query(
                    'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
                    [conversationId, participantId]
                );
            }

            // Add creator as participant
            await connection.query(
                'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
                [conversationId, req.user.userId]
            );

            res.status(201).json({
                message: 'Conversation created',
                conversationId,
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating conversation' });
    }
});

// Get user conversations
app.get('/api/conversations', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [conversations] = await connection.query(
                `SELECT DISTINCT c.id, c.created_by, c.conversation_type, c.created_at
                 FROM conversations c
                 LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
                 WHERE cp.user_id = ?
                 ORDER BY c.created_at DESC`,
                [req.user.userId]
            );

            res.status(200).json({
                count: conversations.length,
                conversations,
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching conversations' });
    }
});

// ============================
// BLOCK USER ROUTES
// ============================

// Block user
app.post('/api/users/block/:blockUserId', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const blockUserId = req.params.blockUserId;

            if (req.user.userId === blockUserId) {
                return res.status(400).json({ error: 'You cannot block yourself' });
            }

            // Check if already blocked
            const [blocked] = await connection.query(
                'SELECT id FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
                [req.user.userId, blockUserId]
            );

            if (blocked.length > 0) {
                return res.status(409).json({ error: 'User already blocked' });
            }

            // Block user
            await connection.query(
                'INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)',
                [req.user.userId, blockUserId]
            );

            res.status(201).json({ message: 'User blocked successfully' });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while blocking user' });
    }
});

// Unblock user
app.delete('/api/users/block/:blockUserId', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const blockUserId = req.params.blockUserId;

            // Unblock user
            await connection.query(
                'DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
                [req.user.userId, blockUserId]
            );

            res.status(200).json({ message: 'User unblocked successfully' });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while unblocking user' });
    }
});

// ============================
// ERROR HANDLING
// ============================

app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        error: 'An unexpected error occurred',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
});

// ============================
// 404 HANDLER
// ============================

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
    });
});

// ============================
// SERVER START
// ============================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Database: SQL (MySQL/MariaDB)`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
