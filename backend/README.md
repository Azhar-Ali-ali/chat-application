# AutoVerse Chat Backend API

A comprehensive backend API for the AutoVerse Chat application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Register and login with JWT tokens
- **User Management**: Update profile, change password, manage user status
- **Messaging**: Send and receive text messages with read status tracking
- **Conversations**: Manage chat conversations with other users
- **Friend System**: Send friend requests, accept/decline, and manage friends list
- **Real-time Status**: Track user online/offline status
- **Message History**: Retrieve paginated message history

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or remote)
- npm or yarn

### Setup Steps

1. **Navigate to the backend directory**:
```bash
cd c:\files\web-practice\chatapplication\backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
   - Edit `.env` file with your configuration
   - Set MongoDB URI
   - Set JWT secret
   - Configure CORS origin

4. **Start the server**:
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_dealer",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response (201):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "john_dealer",
    "email": "john@example.com"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_dealer",
  "password": "password123"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "john_dealer",
    "email": "john@example.com",
    "status": "online",
    "profilePicture": null
  }
}
```

#### Logout User
```
POST /api/auth/logout
Authorization: Bearer {token}

Response (200):
{
  "message": "Logout successful"
}
```

### User Endpoints

#### Get All Users
```
GET /api/users
Authorization: Bearer {token}

Response (200):
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "john_dealer",
    "email": "john@example.com",
    "status": "online",
    "profilePicture": null,
    "createdAt": "2024-01-26T10:00:00.000Z"
  },
  ...
]
```

#### Get Current User Profile
```
GET /api/users/profile
Authorization: Bearer {token}

Response (200):
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "username": "john_dealer",
  "email": "john@example.com",
  "status": "online",
  "profilePicture": null,
  "createdAt": "2024-01-26T10:00:00.000Z",
  "updatedAt": "2024-01-26T10:00:00.000Z"
}
```

#### Get User by ID
```
GET /api/users/:userId
Authorization: Bearer {token}

Response (200):
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "username": "john_dealer",
  "email": "john@example.com",
  "status": "online",
  "profilePicture": null
}
```

#### Update User Profile
```
PUT /api/users/:userId
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "profilePicture": "https://example.com/image.jpg",
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}

Response (200):
{
  "message": "Profile updated successfully",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "john_dealer",
    "email": "newemail@example.com",
    "profilePicture": "https://example.com/image.jpg"
  }
}
```

#### Update User Status
```
PUT /api/users/:userId/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "online" // or "offline", "away"
}

Response (200):
{
  "message": "Status updated successfully",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "john_dealer",
    "status": "online"
  }
}
```

### Message Endpoints

#### Send Message
```
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiverId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "content": "Hey, are you available?",
  "messageType": "text", // or "image", "file", "link"
  "attachmentUrl": null
}

Response (201):
{
  "message": "Message sent successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "senderId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "john_dealer"
    },
    "receiverId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "content": "Hey, are you available?",
    "messageType": "text",
    "isRead": false,
    "createdAt": "2024-01-26T10:05:00.000Z"
  }
}
```

#### Get Messages Between Users
```
GET /api/messages/:userId?limit=50&skip=0
Authorization: Bearer {token}

Response (200):
{
  "count": 10,
  "messages": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "senderId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "username": "john_dealer"
      },
      "receiverId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "username": "sarah_thompson"
      },
      "content": "Hey, are you available?",
      "messageType": "text",
      "isRead": true,
      "createdAt": "2024-01-26T10:05:00.000Z"
    },
    ...
  ]
}
```

#### Mark Message as Read
```
PUT /api/messages/:messageId/read
Authorization: Bearer {token}

Response (200):
{
  "message": "Message marked as read",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "isRead": true,
    "readAt": "2024-01-26T10:06:00.000Z"
  }
}
```

### Conversation Endpoints

#### Get All Conversations
```
GET /api/conversations
Authorization: Bearer {token}

Response (200):
{
  "count": 5,
  "conversations": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
      "participants": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "username": "john_dealer"
        },
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "username": "sarah_thompson"
        }
      ],
      "lastMessage": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "content": "Hey, are you available?",
        "senderId": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "username": "john_dealer"
        },
        "createdAt": "2024-01-26T10:05:00.000Z"
      },
      "lastMessageAt": "2024-01-26T10:05:00.000Z",
      "createdAt": "2024-01-26T09:00:00.000Z",
      "updatedAt": "2024-01-26T10:05:00.000Z"
    },
    ...
  ]
}
```

#### Get Specific Conversation
```
GET /api/conversations/:conversationId
Authorization: Bearer {token}

Response (200):
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
  "participants": [...],
  "lastMessage": {...},
  "lastMessageAt": "2024-01-26T10:05:00.000Z",
  "createdAt": "2024-01-26T09:00:00.000Z",
  "updatedAt": "2024-01-26T10:05:00.000Z"
}
```

### Friend Request Endpoints

#### Send Friend Request
```
POST /api/friend-requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiverId": "64f1a2b3c4d5e6f7g8h9i0j2"
}

Response (201):
{
  "message": "Friend request sent",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "senderId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "john_dealer"
    },
    "receiverId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "username": "sarah_thompson"
    },
    "status": "pending",
    "createdAt": "2024-01-26T10:10:00.000Z"
  }
}
```

#### Get Pending Friend Requests
```
GET /api/friend-requests/pending
Authorization: Bearer {token}

Response (200):
{
  "count": 3,
  "requests": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
      "senderId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "username": "john_dealer"
      },
      "receiverId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "username": "sarah_thompson"
      },
      "status": "pending",
      "createdAt": "2024-01-26T10:10:00.000Z"
    },
    ...
  ]
}
```

#### Accept Friend Request
```
PUT /api/friend-requests/:requestId/accept
Authorization: Bearer {token}

Response (200):
{
  "message": "Friend request accepted",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "senderId": {...},
    "receiverId": {...},
    "status": "accepted",
    "respondedAt": "2024-01-26T10:15:00.000Z"
  }
}
```

#### Decline Friend Request
```
PUT /api/friend-requests/:requestId/decline
Authorization: Bearer {token}

Response (200):
{
  "message": "Friend request declined",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "senderId": {...},
    "receiverId": {...},
    "status": "declined",
    "respondedAt": "2024-01-26T10:15:00.000Z"
  }
}
```

#### Get User Friends
```
GET /api/users/:userId/friends
Authorization: Bearer {token}

Response (200):
{
  "count": 5,
  "friends": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "username": "sarah_thompson",
      "email": "sarah@example.com",
      "status": "online"
    },
    ...
  ]
}
```

## Error Responses

All endpoints return appropriate error responses:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET/PUT request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User not authorized to perform action
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (duplicate)
- `500 Internal Server Error`: Server error

## Database Schema

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  profilePicture: String (optional),
  status: String (online|offline|away),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  content: String (required),
  messageType: String (text|image|file|link),
  attachmentUrl: String (optional),
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

### Conversation Schema
```javascript
{
  participants: [ObjectId] (ref: User),
  lastMessage: ObjectId (ref: Message),
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### FriendRequest Schema
```javascript
{
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  status: String (pending|accepted|declined),
  createdAt: Date,
  respondedAt: Date
}
```

### Friendship Schema
```javascript
{
  userId: ObjectId (ref: User),
  friendId: ObjectId (ref: User),
  createdAt: Date
}
```

## Environment Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/autoverse-chat
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345678
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Change JWT_SECRET to a strong random string in production**
3. **Implement rate limiting for authentication endpoints**
4. **Use environment variables for sensitive data**
5. **Validate and sanitize all user inputs**
6. **Implement CORS properly with specific origins**
7. **Use secure password hashing (bcryptjs)**
8. **Implement request validation middleware**

## Future Enhancements

- [ ] WebSocket support for real-time messaging
- [ ] File upload functionality
- [ ] Message search and filtering
- [ ] Group chat support
- [ ] Message encryption
- [ ] User typing indicators
- [ ] Voice/video call integration
- [ ] Message reactions/emojis
- [ ] Admin dashboard
- [ ] Rate limiting and throttling
- [ ] Logging and monitoring
- [ ] Automated tests

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

### JWT Token Errors
- Ensure token is included in Authorization header
- Check token format: `Authorization: Bearer {token}`
- Verify JWT_SECRET matches the one used to sign the token

### CORS Errors
- Update CORS_ORIGIN in .env to match your frontend URL
- Check browser console for specific origin errors

## Support

For issues and questions, please create an issue in the repository or contact the development team.

## License

ISC
