# AutoVerse Chat - Database Setup Guide

## MongoDB Setup

### Option 1: Local MongoDB Installation

#### Windows

1. **Download MongoDB Community Edition**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows and download the installer

2. **Install MongoDB**
   - Run the installer (.msi file)
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)

3. **Verify Installation**
   ```cmd
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   ```cmd
   net start MongoDB
   ```

5. **Connect to MongoDB**
   ```cmd
   mongo
   ```

#### macOS

1. **Install using Homebrew**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**
   ```bash
   brew services start mongodb-community
   ```

3. **Connect to MongoDB**
   ```bash
   mongo
   ```

#### Linux (Ubuntu/Debian)

1. **Import the MongoDB GPG Key**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create an Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Click "Sign Up" and create a free account

2. **Create a Cluster**
   - Click "Create" to create a new project
   - Select "Build a Cluster"
   - Choose free tier (M0)
   - Select your region
   - Click "Create Cluster"

3. **Set Up Network Access**
   - Click "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Click "Confirm"

4. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Enter username and password
   - Click "Create User"

5. **Get Connection String**
   - Click "Clusters"
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<username>` and `<password>` with your credentials

6. **Update .env File**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/autoverse-chat
   ```

## Database Initialization

### Automatic Schema Creation

MongoDB with Mongoose automatically creates collections and indexes when you:

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Make the first API request**:
   - Mongoose will create the collections based on schemas
   - Indexes will be created automatically

### Manual Database Setup (Optional)

If you want to pre-create collections and indexes:

1. **Create a script** (`c:\files\web-practice\chatapplication\backend\scripts\setup-db.js`):

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autoverse-chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: String,
    status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    messageType: { type: String, enum: ['text', 'image', 'file', 'link'], default: 'text' },
    attachmentUrl: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    createdAt: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const friendRequestSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    respondedAt: Date,
});

const friendshipSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

// Create models
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
const Friendship = mongoose.model('Friendship', friendshipSchema);

// Create indexes
async function setupDatabase() {
    try {
        // Create indexes
        await User.collection.createIndex({ username: 1 });
        await User.collection.createIndex({ email: 1 });
        await Message.collection.createIndex({ senderId: 1, receiverId: 1 });
        await Message.collection.createIndex({ createdAt: -1 });
        await Conversation.collection.createIndex({ participants: 1 });
        await FriendRequest.collection.createIndex({ senderId: 1, receiverId: 1 });
        await Friendship.collection.createIndex({ userId: 1, friendId: 1 });

        console.log('✅ Database indexes created successfully!');
        
        // Create sample users (optional)
        const existingUsers = await User.countDocuments();
        if (existingUsers === 0) {
            const bcrypt = require('bcryptjs');
            const sampleUsers = [
                { username: 'john_dealer', email: 'john@example.com', password: await bcrypt.hash('password123', 10) },
                { username: 'sarah_thompson', email: 'sarah@example.com', password: await bcrypt.hash('password123', 10) },
                { username: 'michael_chen', email: 'michael@example.com', password: await bcrypt.hash('password123', 10) },
                { username: 'lisa_rodriguez', email: 'lisa@example.com', password: await bcrypt.hash('password123', 10) },
            ];

            await User.insertMany(sampleUsers);
            console.log('✅ Sample users created successfully!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
```

2. **Run the setup script**:
   ```bash
   node scripts/setup-db.js
   ```

## Verify Database Setup

### Using MongoDB CLI

1. **Connect to MongoDB**:
   ```bash
   mongo  # or mongosh for newer versions
   ```

2. **List databases**:
   ```javascript
   show databases
   ```

3. **Use the autoverse-chat database**:
   ```javascript
   use autoverse-chat
   ```

4. **List collections**:
   ```javascript
   show collections
   ```

5. **Check documents**:
   ```javascript
   db.users.find().pretty()
   db.messages.find().pretty()
   db.conversations.find().pretty()
   db.friendrequests.find().pretty()
   db.friendships.find().pretty()
   ```

### Using MongoDB Compass (GUI)

1. **Download MongoDB Compass**:
   - Visit: https://www.mongodb.com/products/compass

2. **Connect to your database**:
   - For local: `mongodb://localhost:27017`
   - For Atlas: Use your connection string

3. **Browse collections visually**

## Backup and Restore

### Backup Database

```bash
# For local MongoDB
mongodump --db autoverse-chat --out ./backup

# For MongoDB Atlas
mongodump --uri "mongodb+srv://username:password@cluster.mongodb.net/autoverse-chat"
```

### Restore Database

```bash
# For local MongoDB
mongorestore --db autoverse-chat ./backup/autoverse-chat

# For MongoDB Atlas
mongorestore --uri "mongodb+srv://username:password@cluster.mongodb.net" ./backup
```

## Performance Optimization

### Create Indexes (Already in server.js)

```javascript
// Indexes for faster queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });
conversationSchema.index({ participants: 1 });
```

### Pagination

Always use pagination for large result sets:

```bash
GET /api/messages/:userId?limit=50&skip=0
```

## Troubleshooting

### Connection Issues

**Error: "connect ECONNREFUSED 127.0.0.1:27017"**
- MongoDB service is not running
- Start MongoDB: `mongod` or `net start MongoDB`

**Error: "MongoParseError: Invalid connection string"**
- Check MONGODB_URI in .env file
- Verify format: `mongodb://localhost:27017/dbname`

### Authentication Issues

**Error: "Authentication failed"**
- Verify username and password in connection string
- Ensure user is created in the database
- Check IP whitelist in MongoDB Atlas

### Storage Issues

**Error: "Insufficient disk space"**
- Check available disk space
- Archive old messages to separate collection
- Consider database optimization

## Database Maintenance

### Regular Tasks

1. **Monitor disk usage**
   ```bash
   mongosh
   > use admin
   > db.stats()
   ```

2. **Rebuild indexes** (monthly)
   ```javascript
   db.collection.reIndex()
   ```

3. **Clean old data**
   ```javascript
   db.messages.deleteMany({ 
     createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
   })
   ```

4. **Compact database** (MongoDB Enterprise)
   ```javascript
   db.runCommand({ compact: 'collection_name' })
   ```

## References

- [MongoDB Official Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
