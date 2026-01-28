# AutoVerse Chat API - Testing Guide

This guide provides examples for testing the AutoVerse Chat API endpoints using cURL, Postman, or any HTTP client.

## Base URL

```
http://localhost:5000
```

## Quick Start

### 1. Register a New User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_dealer",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "john_dealer",
    "email": "john@example.com"
  }
}
```

Save the token for subsequent requests!

### 2. Login User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_dealer",
    "password": "password123"
  }'
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "john_dealer",
    "email": "john@example.com",
    "status": "online",
    "profilePicture": null
  }
}
```

### 3. Get Current User Profile

**Request:**
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200):**
```json
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

## Complete Test Scenarios

### Scenario 1: User Registration and Profile Management

#### Step 1: Register First User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_seller",
    "email": "alice@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Store token as:** `TOKEN_ALICE=eyJhbGc...`

#### Step 2: Register Second User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob_buyer",
    "email": "bob@example.com",
    "password": "SecurePass456",
    "confirmPassword": "SecurePass456"
  }'
```

**Store token and user ID:** `TOKEN_BOB=eyJhbGc...` and `USER_ID_BOB=64f1a2...`

#### Step 3: Get All Users
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

#### Step 4: Update Profile
```bash
curl -X PUT http://localhost:5000/api/users/64f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.new@example.com",
    "profilePicture": "https://example.com/avatar.jpg"
  }'
```

#### Step 5: Change Password
```bash
curl -X PUT http://localhost:5000/api/users/64f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass123"
  }'
```

#### Step 6: Update Status
```bash
curl -X PUT http://localhost:5000/api/users/64f1a2b3c4d5e6f7g8h9i0j1/status \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "away"
  }'
```

---

### Scenario 2: Friend System

#### Step 1: Send Friend Request
```bash
curl -X POST http://localhost:5000/api/friend-requests \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "'$USER_ID_BOB'"
  }'
```

**Store request ID:** `REQUEST_ID=64f1a2...`

#### Step 2: Get Pending Requests (as Bob)
```bash
curl -X GET http://localhost:5000/api/friend-requests/pending \
  -H "Authorization: Bearer $TOKEN_BOB"
```

#### Step 3: Accept Friend Request (as Bob)
```bash
curl -X PUT http://localhost:5000/api/friend-requests/$REQUEST_ID/accept \
  -H "Authorization: Bearer $TOKEN_BOB"
```

#### Step 4: Get Friends List (as Alice)
```bash
curl -X GET http://localhost:5000/api/users/64f1a2b3c4d5e6f7g8h9i0j1/friends \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

#### Step 5: Decline Another Request
```bash
curl -X PUT http://localhost:5000/api/friend-requests/$REQUEST_ID/decline \
  -H "Authorization: Bearer $TOKEN_BOB"
```

---

### Scenario 3: Messaging

#### Step 1: Send Message from Alice to Bob
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "'$USER_ID_BOB'",
    "content": "Hi Bob! Is the car still available?",
    "messageType": "text"
  }'
```

**Store message ID:** `MESSAGE_ID=64f1a2...`

#### Step 2: Send Another Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "'$USER_ID_BOB'",
    "content": "I'm very interested in the 2022 Toyota Corolla.",
    "messageType": "text"
  }'
```

#### Step 3: Get Conversation Messages
```bash
curl -X GET "http://localhost:5000/api/messages/$USER_ID_BOB?limit=10&skip=0" \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

#### Step 4: Mark Message as Read
```bash
curl -X PUT http://localhost:5000/api/messages/$MESSAGE_ID/read \
  -H "Authorization: Bearer $TOKEN_BOB"
```

#### Step 5: Get All Conversations
```bash
curl -X GET http://localhost:5000/api/conversations \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

---

### Scenario 4: Message Types (Links and Files)

#### Send a Message with Link
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "'$USER_ID_BOB'",
    "content": "Check out this article about car maintenance",
    "messageType": "link",
    "attachmentUrl": "https://example.com/article"
  }'
```

#### Send a Message with Image
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "'$USER_ID_BOB'",
    "content": "Here's a photo of the car",
    "messageType": "image",
    "attachmentUrl": "https://example.com/car-photo.jpg"
  }'
```

#### Send a Message with File
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "'$USER_ID_BOB'",
    "content": "Here's the service history document",
    "messageType": "file",
    "attachmentUrl": "https://example.com/service-history.pdf"
  }'
```

---

### Scenario 5: Authentication and Logout

#### Logout User
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

#### Verify Token is Invalid
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

**Should return 403 Forbidden or similar**

---

## Error Testing

### Test Invalid Token
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response (403):**
```json
{
  "error": "Token is invalid or expired"
}
```

### Test Missing Authorization
```bash
curl -X GET http://localhost:5000/api/users/profile
```

**Expected Response (401):**
```json
{
  "error": "Access token is missing"
}
```

### Test Invalid Username/Password Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nonexistent_user",
    "password": "wrong_password"
  }'
```

**Expected Response (401):**
```json
{
  "error": "Invalid username or password"
}
```

### Test Duplicate Username Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_dealer",
    "email": "different@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Expected Response (409):**
```json
{
  "error": "Username or email already exists"
}
```

### Test Weak Password
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "new@example.com",
    "password": "weak",
    "confirmPassword": "weak"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Password must be at least 8 characters"
}
```

---

## Using Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Paste the following JSON as a Postman collection:

```json
{
  "info": {
    "name": "AutoVerse Chat API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "url": {
              "raw": "http://localhost:5000/api/auth/register",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "auth", "register"]
            },
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"username\": \"john_dealer\",\"email\": \"john@example.com\",\"password\": \"password123\",\"confirmPassword\": \"password123\"}"
            }
          }
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "url": {
              "raw": "http://localhost:5000/api/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "auth", "login"]
            },
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"username\": \"john_dealer\",\"password\": \"password123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## Performance Testing

### Load Testing Script (Node.js)

Create `load-test.js`:

```javascript
const http = require('http');

const API_URL = 'http://localhost:5000';
let totalRequests = 0;
let successRequests = 0;
let failedRequests = 0;

async function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        totalRequests++;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          successRequests++;
        } else {
          failedRequests++;
        }
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });

    req.on('error', (error) => {
      totalRequests++;
      failedRequests++;
      resolve({ status: 0, error: error.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runLoadTest() {
  console.log('🚀 Starting load test...\n');

  // Register users
  const users = [];
  for (let i = 0; i < 5; i++) {
    const response = await makeRequest('POST', '/api/auth/register', {}, {
      username: `user_${i}_${Date.now()}`,
      email: `user${i}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
    });
    if (response.data.token) {
      users.push({ token: response.data.token, id: response.data.user.id });
    }
  }

  console.log(`✅ Registered ${users.length} users\n`);

  // Send messages
  if (users.length >= 2) {
    for (let i = 0; i < 10; i++) {
      await makeRequest(
        'POST',
        '/api/messages',
        { Authorization: `Bearer ${users[0].token}` },
        {
          receiverId: users[1].id,
          content: `Test message ${i}`,
          messageType: 'text',
        }
      );
    }
    console.log('✅ Sent 10 test messages\n');
  }

  // Get messages
  if (users.length >= 2) {
    for (let i = 0; i < 5; i++) {
      await makeRequest(
        'GET',
        `/api/messages/${users[1].id}`,
        { Authorization: `Bearer ${users[0].token}` }
      );
    }
    console.log('✅ Retrieved messages 5 times\n');
  }

  console.log('📊 Load Test Results:');
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Success: ${successRequests}`);
  console.log(`Failed: ${failedRequests}`);
  console.log(`Success Rate: ${((successRequests / totalRequests) * 100).toFixed(2)}%`);
}

runLoadTest();
```

Run with:
```bash
node load-test.js
```

---

## Helpful Tips

1. **Save Token in Environment Variable:**
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"john_dealer","password":"password123"}' | jq -r '.token')
   
   echo $TOKEN
   ```

2. **Pretty Print JSON:**
   ```bash
   curl ... | jq '.'
   ```

3. **Save Response to File:**
   ```bash
   curl ... > response.json
   ```

4. **Test with Verbose Output:**
   ```bash
   curl -v http://localhost:5000/api/users/profile \
     -H "Authorization: Bearer $TOKEN"
   ```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Check if server is running on port 5000 |
| Invalid token | Get a new token from login/register |
| CORS error | Check CORS_ORIGIN in .env |
| Database error | Ensure MongoDB is running |
| Token expired | Tokens last 24 hours by default |

