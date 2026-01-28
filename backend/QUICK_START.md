# AutoVerse Chat - Quick Start Guide

Get the AutoVerse Chat backend up and running in minutes!

## ⚡ 5-Minute Setup

### Step 1: Prerequisites Check
```bash
# Check Node.js version (v14 or higher)
node --version

# Check npm version
npm --version
```

### Step 2: Install Dependencies
```bash
cd c:\files\web-practice\chatapplication\backend
npm install
```

### Step 3: Set Up MongoDB

**Option A: Local MongoDB (Windows)**
```bash
# Download from https://www.mongodb.com/try/download/community
# Install and run MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud - No installation needed)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Copy connection string
4. Update `.env` file: `MONGODB_URI=your_connection_string`

### Step 4: Start the Server
```bash
npm run dev  # or npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server is running on port 5000
```

### Step 5: Test the API
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

Done! 🎉

---

## 📁 Project Structure

```
backend/
├── server.js                 # Main application file
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables
├── README.md               # Full API documentation
├── DATABASE_SETUP.md       # Database setup guide
├── API_TESTING.md          # API testing examples
└── QUICK_START.md          # This file
```

---

## 🔧 Available Commands

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Install new package
npm install package-name

# Uninstall package
npm uninstall package-name
```

---

## 📚 Key API Endpoints

### Authentication
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Logout**: `POST /api/auth/logout`

### Users
- **Get Profile**: `GET /api/users/profile`
- **Get All Users**: `GET /api/users`
- **Update Profile**: `PUT /api/users/:userId`

### Messages
- **Send Message**: `POST /api/messages`
- **Get Messages**: `GET /api/messages/:userId`
- **Mark Read**: `PUT /api/messages/:messageId/read`

### Friends
- **Send Request**: `POST /api/friend-requests`
- **Get Requests**: `GET /api/friend-requests/pending`
- **Accept**: `PUT /api/friend-requests/:requestId/accept`
- **Decline**: `PUT /api/friend-requests/:requestId/decline`

See [README.md](README.md) for complete API documentation.

---

## 🔐 Authentication

All protected endpoints require a JWT token in the header:

```bash
Authorization: Bearer your_token_here
```

Get a token by logging in:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

---

## 📝 Environment Variables

Edit `.env` file to configure:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/autoverse-chat

# JWT Secret (change in production!)
JWT_SECRET=your_super_secret_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### "MongoDB connection refused"
- Start MongoDB: `mongod`
- Or use MongoDB Atlas connection string in .env

### "Port 5000 already in use"
```bash
# Change PORT in .env or kill process on port 5000
netstat -ano | findstr :5000  # Windows
kill -9 <PID>                 # Unix/Mac
```

### "Token is invalid or expired"
- Get a new token from `/api/auth/login`
- Tokens expire after 24 hours

### "CORS error in browser"
- Update `CORS_ORIGIN` in .env
- Restart the server

---

## 🚀 Next Steps

1. **Connect to Frontend**
   - Update API URL in chatpage.html
   - Test authentication flow

2. **Add WebSocket Support**
   - Install socket.io
   - Implement real-time messaging

3. **Deploy to Production**
   - Use MongoDB Atlas
   - Deploy to Heroku, Railway, or similar
   - Set strong JWT_SECRET

4. **Add More Features**
   - File uploads
   - Message search
   - Group chats
   - Voice/video calls

---

## 📖 Documentation Files

- **[README.md](README.md)** - Complete API reference
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database configuration
- **[API_TESTING.md](API_TESTING.md)** - Test examples and scenarios

---

## 💡 Tips

1. **Use Postman** for easier API testing
   - Download: https://www.postman.com/downloads/

2. **Monitor Logs**
   - Server logs show all requests and errors
   - Check browser console for frontend issues

3. **Test in Isolation**
   - Test each endpoint individually first
   - Then test complete user flows

4. **Keep Tokens Handy**
   - Save tokens in Postman environment
   - Or use shell variables: `TOKEN=$(curl ... | jq -r '.token')`

---

## 🆘 Need Help?

1. Check error messages carefully
2. Review documentation files
3. Check database connection
4. Verify environment variables
5. Try the examples in API_TESTING.md

---

## 📊 Useful Tools

- **Postman**: API testing - https://www.postman.com/
- **MongoDB Compass**: Database GUI - https://www.mongodb.com/products/compass
- **Visual Studio Code**: Code editor - https://code.visualstudio.com/
- **Thunder Client**: VS Code REST client - Thunder Client extension

---

## 🎯 Success Checklist

- [ ] Node.js installed (v14+)
- [ ] npm modules installed (`npm install`)
- [ ] MongoDB running or MongoDB Atlas configured
- [ ] .env file configured
- [ ] Server starting without errors
- [ ] Can register a user
- [ ] Can login with registered user
- [ ] Can send a message
- [ ] Can send/accept friend requests

---

## 📞 Support

For issues:
1. Check this guide
2. Review README.md
3. Check server logs
4. Verify database connection

---

**Happy coding! 🚀**

Last updated: January 2024
