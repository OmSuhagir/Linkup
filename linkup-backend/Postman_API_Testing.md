# Linkup API Testing with Postman

This guide provides step-by-step instructions to test the Linkup backend APIs using Postman. It includes setup, test flows, sample data, and common error responses.

## Prerequisites

- **Postman**: Download and install from [postman.com](https://www.postman.com/downloads/)
- **Backend Server**: Ensure the Linkup backend is running on `http://localhost:5000` (see main README.md for setup)
- **MongoDB**: Make sure MongoDB is running and accessible
- **Environment Variables**: Ensure `.env` file is configured with correct values

## Setup

### 1. Import Postman Collection

1. Download or locate the `Linkup_Postman_Collection.json` file from the project root
2. Open Postman
3. Click **Import** in the top left
4. Select **File** tab
5. Choose the `Linkup_Postman_Collection.json` file
6. Click **Import**

If the collection file doesn't exist, you can create requests manually using the endpoints below.

### 2. Create Environment

1. In Postman, click the **Environments** dropdown (top right, looks like a globe)
2. Click **Create Environment**
3. Name it: `Linkup Local`
4. Add the following variables:
   - `baseURL`: `http://localhost:5000`
   - `token`: (leave empty - this will be set after login)
5. Click **Save**

### 3. Select Environment

- Select `Linkup Local` from the environments dropdown

## Test Flow

Follow this sequence to test all API endpoints systematically.

### 1. User Registration & Authentication

#### Register User 1
- **Method**: POST
- **URL**: `{{baseURL}}/api/auth/register`
- **Body** (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```
- **Expected Response**: 201 Created with token and user data
- **Action**: Copy the `token` from response and set it in environment variable

#### Register User 2
- **Method**: POST
- **URL**: `{{baseURL}}/api/auth/register`
- **Body** (raw JSON):
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "latitude": 40.7129,
  "longitude": -74.0061
}
```
- **Expected Response**: 201 Created

#### Login
- **Method**: POST
- **URL**: `{{baseURL}}/api/auth/login`
- **Body** (raw JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Expected Response**: 200 OK with token
- **Action**: Update the `token` environment variable

#### Get Current User (Me)
- **Method**: GET
- **URL**: `{{baseURL}}/api/auth/me`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Expected Response**: 200 OK with user data

### 2. Profile Management

#### Update Profile
- **Method**: PUT
- **URL**: `{{baseURL}}/api/profile/update`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body** (raw JSON):
```json
{
  "bio": "Software Developer",
  "skills": ["JavaScript", "Node.js"],
  "interests": ["AI", "Web Development"],
  "projects": ["Linkup App"],
  "experience": ["2 years at Tech Corp"],
  "github": "https://github.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe"
}
```
- **Expected Response**: 200 OK with updated user data

#### Get User Profile
- **Method**: GET
- **URL**: `{{baseURL}}/api/profile/60d5ecb74b24c72b8c8b4568` (use User 2's ID)
- **Expected Response**: 200 OK with user profile data

### 3. Location & Discovery

#### Update Location
- **Method**: POST
- **URL**: `{{baseURL}}/api/location/update`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body** (raw JSON):
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```
- **Expected Response**: 200 OK with success message

#### Get Nearby Users
- **Method**: GET
- **URL**: `{{baseURL}}/api/users/nearby`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Expected Response**: 200 OK with array of nearby users (should include User 2)

### 4. Team Operations

#### Create Team
- **Method**: POST
- **URL**: `{{baseURL}}/api/teams/create`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body** (raw JSON):
```json
{
  "teamName": "Hackathon Heroes",
  "requiredSkills": ["React", "Node.js", "Python"],
  "teamSize": 4
}
```
- **Expected Response**: 201 Created with team data
- **Action**: Note the `teamId` from response

#### Get All Teams
- **Method**: GET
- **URL**: `{{baseURL}}/api/teams`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Expected Response**: 200 OK with array of teams

#### Join Team (as User 2)
- Switch to User 2's token in environment
- **Method**: POST
- **URL**: `{{baseURL}}/api/teams/join`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body** (raw JSON):
```json
{
  "teamId": "60d5ecb74b24c72b8c8b4569"  // Use the teamId from creation
}
```
- **Expected Response**: 200 OK with success message

#### Approve Join Request (as Team Leader - User 1)
- Switch back to User 1's token
- **Method**: POST
- **URL**: `{{baseURL}}/api/teams/approve`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body** (raw JSON):
```json
{
  "teamId": "60d5ecb74b24c72b8c8b4569",
  "userId": "60d5ecb74b24c72b8c8b4568"  // User 2's ID
}
```
- **Expected Response**: 200 OK with success message

### 5. Chat System

#### Get Private Chat Messages
- **Method**: GET
- **URL**: `{{baseURL}}/api/chat/60d5ecb74b24c72b8c8b4568` (User 2's ID)
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Expected Response**: 200 OK with messages array (initially empty)

#### Get Team Chat Messages
- **Method**: GET
- **URL**: `{{baseURL}}/api/chat/team/60d5ecb74b24c72b8c8b4569` (team ID)
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Expected Response**: 200 OK with messages array (initially empty)

## Socket.io Testing

For real-time features, you can test Socket.io connections using a client script or Postman's built-in WebSocket support.

### Using Node.js Script

Create a test file `socket-test.js`:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000');

// Join user room
socket.emit('joinUser', '60d5ecb74b24c72b8c8b4567'); // User 1 ID

// Join team room
socket.emit('joinTeam', '60d5ecb74b24c72b8c8b4569'); // Team ID

// Send private message
socket.emit('sendMessage', {
  senderId: '60d5ecb74b24c72b8c8b4567',
  receiverId: '60d5ecb74b24c72b8c8b4568',
  message: 'Hello from Postman testing!'
});

// Send team message
socket.emit('sendTeamMessage', {
  senderId: '60d5ecb74b24c72b8c8b4567',
  teamId: '60d5ecb74b24c72b8c8b4569',
  message: 'Team message from Postman!'
});

// Listen for messages
socket.on('receiveMessage', (data) => {
  console.log('Private message received:', data);
});

socket.on('receiveTeamMessage', (data) => {
  console.log('Team message received:', data);
});

socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

Run with: `node socket-test.js`

## Sample Test Data

### User 1 (Team Leader)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### User 2 (Nearby User)
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "latitude": 40.7129,
  "longitude": -74.0061
}
```

### Team Creation
```json
{
  "teamName": "Hackathon Heroes",
  "requiredSkills": ["React", "Node.js", "Python"],
  "teamSize": 4
}
```

## Common Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

## Troubleshooting

- **Connection Issues**: Ensure backend is running on port 5000
- **Authentication Errors**: Check that the `token` environment variable is set correctly
- **MongoDB Errors**: Verify MongoDB is running and connection string is correct
- **Validation Errors**: Ensure request bodies match the expected JSON structure

## Tips

- Use Postman's **Tests** tab to automatically set environment variables from responses
- Enable **Auto-generated headers** in Postman settings for Content-Type
- Use **Collections Runner** to run all requests sequentially
- Check the backend console for detailed error logs

---

Happy testing! 🚀