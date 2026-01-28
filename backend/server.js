const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();


const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// ============================
// MIDDLEWARE
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// ============================
// DATABASE CONNECTION
// ============================
mongoose.connect('mongodb+srv://azharali1662003:vwbjNdb4y9EUbfEB@cluster0.0om7rba.mongodb.net/chatapp?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB Atlas connected successfully');
}).catch((err) => {
    console.error('MongoDB Atlas connection error:', err);
});

// ============================
// MONGOOSE SCHEMAS
// ============================

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'away'],
        default: 'offline',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Message Schema
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'link'],
        default: 'text',
    },
    attachmentUrl: {
        type: String,
        default: null,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Conversation Schema
const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Friend Request Schema
const friendRequestSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    respondedAt: {
        type: Date,
        default: null,
    },
});

// Friendship Schema
const friendshipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    friendId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Models
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
const Friendship = mongoose.model('Friendship', friendshipSchema);

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

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
        });

        if (existingUser) {
            // Suggest alternative usernames if username is taken
            let suggestions = [];
            if (existingUser.username === username.toLowerCase()) {
                for (let i = 1; i <= 3; i++) {
                    const suggestion = username + Math.floor(Math.random() * 1000);
                    const taken = await User.findOne({ username: suggestion.toLowerCase() });
                    if (!taken) suggestions.push(suggestion);
                    if (suggestions.length >= 3) break;
                }
                return res.status(409).json({ error: 'Username already exists', suggestions });
            } else {
                return res.status(409).json({ error: 'Email already exists' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        await newUser.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

// User search by username (for friend requests)
app.get('/api/users/search', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ error: 'Username query is required' });
        }
        // Find users whose username contains the search string (case-insensitive)
        const users = await User.find({
            username: { $regex: username, $options: 'i' }
        }).select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during user search' });
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Update user status to online
        user.status = 'online';
        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                status: user.status,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// ============================
// MIDDLEWARE: AUTHENTICATION
// ============================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token is missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token is invalid or expired' });
        }
        req.user = user;
        next();
    });
};

// ============================
// USER ROUTES
// ============================

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.userId } }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});

// Get current user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching profile' });
    }
});

// Get user by ID
app.get('/api/users/:userId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching user' });
    }
});

// Update user profile
app.put('/api/users/:userId', authenticateToken, async (req, res) => {
    try {
        if (req.user.userId !== req.params.userId) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        const { email, profilePicture, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If changing password
        if (currentPassword && newPassword) {
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        if (email) user.email = email;
        if (profilePicture) user.profilePicture = profilePicture;

        user.updatedAt = Date.now();
        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating profile' });
    }
});

// Update user status
app.put('/api/users/:userId/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['online', 'offline', 'away'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { status: status, updatedAt: Date.now() },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Status updated successfully',
            user,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating status' });
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

        // Create message
        const message = new Message({
            senderId: req.user.userId,
            receiverId,
            content,
            messageType,
            attachmentUrl,
        });

        await message.save();

        // Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.userId, receiverId] },
        });

        let isNewConversation = false;
        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user.userId, receiverId],
                lastMessage: message._id,
                lastMessageAt: Date.now(),
            });
            isNewConversation = true;
        } else {
            conversation.lastMessage = message._id;
            conversation.lastMessageAt = Date.now();
            conversation.updatedAt = Date.now();
        }

        await conversation.save();

        // Populate sender info
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', '-password');


        // Emit chat message as before
        io.emit('chat message', populatedMessage);

        // Emit conversations update for every message (not just new conversations)
        io.emit('conversations update');

        res.status(201).json({
            message: 'Message sent successfully',
            data: populatedMessage,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while sending message' });
    }
});

// Get messages between two users
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;

        const messages = await Message.find({
            $or: [
                { senderId: req.user.userId, receiverId: userId },
                { senderId: userId, receiverId: req.user.userId },
            ],
        })
            .populate('senderId', '-password')
            .populate('receiverId', '-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            count: messages.length,
            messages: messages.reverse(),
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching messages' });
    }
});

// Mark message as read
app.put('/api/messages/:messageId/read', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.messageId,
            { isRead: true, readAt: Date.now() },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.status(200).json({
            message: 'Message marked as read',
            data: message,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating message' });
    }
});

// ============================
// CONVERSATION ROUTES
// ============================

// Get all conversations for current user
app.get('/api/conversations', authenticateToken, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.userId,
        })
            .populate('participants', '-password')
            .populate({
                path: 'lastMessage',
                populate: { path: 'senderId', select: '-password' },
            })
            .sort({ lastMessageAt: -1 });

        res.status(200).json({
            count: conversations.length,
            conversations,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching conversations' });
    }
});

// Get specific conversation
app.get('/api/conversations/:conversationId', authenticateToken, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId)
            .populate('participants', '-password')
            .populate({
                path: 'lastMessage',
                populate: { path: 'senderId', select: '-password' },
            });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching conversation' });
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

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { senderId: req.user.userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: req.user.userId },
            ],
        });

        if (existingRequest) {
            return res.status(409).json({ error: 'Friend request already exists' });
        }

        // Check if already friends
        const friendship = await Friendship.findOne({
            userId: req.user.userId,
            friendId: receiverId,
        });

        if (friendship) {
            return res.status(409).json({ error: 'Already friends with this user' });
        }

        const friendRequest = new FriendRequest({
            senderId: req.user.userId,
            receiverId,
        });

        await friendRequest.save();

        const populatedRequest = await FriendRequest.findById(friendRequest._id)
            .populate('senderId', '-password')
            .populate('receiverId', '-password');

        res.status(201).json({
            message: 'Friend request sent',
            data: populatedRequest,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while sending friend request' });
    }
});

// Get pending friend requests
app.get('/api/friend-requests/pending', authenticateToken, async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            receiverId: req.user.userId,
            status: 'pending',
        })
            .populate('senderId', '-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: requests.length,
            requests,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching friend requests' });
    }
});

// Accept friend request
app.put('/api/friend-requests/:requestId/accept', authenticateToken, async (req, res) => {
    try {
        const friendRequest = await FriendRequest.findById(req.params.requestId);

        if (!friendRequest) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        if (friendRequest.receiverId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You can only accept your own requests' });
        }

        friendRequest.status = 'accepted';
        friendRequest.respondedAt = Date.now();
        await friendRequest.save();

        // Create friendship records
        const friendship1 = new Friendship({
            userId: friendRequest.senderId,
            friendId: friendRequest.receiverId,
        });

        const friendship2 = new Friendship({
            userId: friendRequest.receiverId,
            friendId: friendRequest.senderId,
        });

        await friendship1.save();
        await friendship2.save();

        const populatedRequest = await FriendRequest.findById(req.params.requestId)
            .populate('senderId', '-password')
            .populate('receiverId', '-password');

        // Emit conversations update for both users
        io.emit('conversations update');
        res.status(200).json({
            message: 'Friend request accepted',
            data: populatedRequest,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while accepting friend request' });
    }
});

// Decline friend request
app.put('/api/friend-requests/:requestId/decline', authenticateToken, async (req, res) => {
    try {
        const friendRequest = await FriendRequest.findById(req.params.requestId);

        if (!friendRequest) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        if (friendRequest.receiverId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You can only decline your own requests' });
        }

        friendRequest.status = 'declined';
        friendRequest.respondedAt = Date.now();
        await friendRequest.save();

        const populatedRequest = await FriendRequest.findById(req.params.requestId)
            .populate('senderId', '-password')
            .populate('receiverId', '-password');

        res.status(200).json({
            message: 'Friend request declined',
            data: populatedRequest,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while declining friend request' });
    }
});

// Get user friends
app.get('/api/users/:userId/friends', authenticateToken, async (req, res) => {
    try {
        const friendships = await Friendship.find({
            userId: req.params.userId,
        }).populate('friendId', '-password');

        const friends = friendships.map((f) => f.friendId);

        res.status(200).json({
            count: friends.length,
            friends,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching friends' });
    }
});

// ============================
// LOGOUT ROUTE
// ============================

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        // Update user status to offline
        await User.findByIdAndUpdate(
            req.user.userId,
            { status: 'offline' },
            { new: true }
        );

        res.status(200).json({
            message: 'Logout successful',
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during logout' });
    }
});

// ============================
// ERROR HANDLING
// ============================

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred' });
});

// ============================
// SOCKET.IO REAL-TIME CHAT
// ============================

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for chat messages (already handled in REST route)
    // No need to re-broadcast here

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// ============================
// SERVER START
// ============================

const PORT = 5002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
