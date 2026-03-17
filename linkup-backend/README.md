# Linkup Backend

A scalable backend for Linkup, a proximity-based professional networking and hackathon collaboration platform.

## Features

- User authentication with JWT
- Professional profiles with skills, interests, projects, experience
- Real-time location updates and nearby user discovery
- Hackathon team formation and management
- Real-time chat (private and team)
- Notifications system
- Socket.io integration for real-time features

## Tech Stack

- **Backend Framework**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Real-time Communication**: Socket.io
- **Validation**: express-validator
- **Environment**: dotenv

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/linkup
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:3000
   PORT=5000
   ```
4. Start MongoDB service
5. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ecb74b24c72b8c8b4567",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": [],
    "interests": [],
    "bio": null,
    "github": null,
    "linkedin": null,
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "lastUpdated": "2026-03-15T13:30:00.000Z"
    },
    "isDiscoverable": true,
    "createdAt": "2026-03-15T13:30:00.000Z"
  }
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ecb74b24c72b8c8b4567",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": [],
    "interests": [],
    "bio": null,
    "github": null,
    "linkedin": null,
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "lastUpdated": "2026-03-15T13:30:00.000Z"
    },
    "isDiscoverable": true,
    "createdAt": "2026-03-15T13:30:00.000Z"
  }
}
```

#### GET /api/auth/me
Get current user info.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "60d5ecb74b24c72b8c8b4567",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["JavaScript", "Node.js"],
    "interests": ["AI", "Web Development"],
    "bio": "Software Developer",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "projects": ["Linkup App"],
    "experience": ["2 years at Tech Corp"],
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "lastUpdated": "2026-03-15T13:35:00.000Z"
    },
    "isDiscoverable": true,
    "createdAt": "2026-03-15T13:30:00.000Z"
  }
}
```

### Profile Management

#### GET /api/profile/:id
Get user profile by ID.

**Response (200):**
```json
{
  "user": {
    "id": "60d5ecb74b24c72b8c8b4567",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["JavaScript", "Node.js"],
    "interests": ["AI", "Web Development"],
    "bio": "Software Developer",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "projects": ["Linkup App"],
    "experience": ["2 years at Tech Corp"],
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "lastUpdated": "2026-03-15T13:35:00.000Z"
    },
    "isDiscoverable": true,
    "createdAt": "2026-03-15T13:30:00.000Z"
  }
}
```

#### PUT /api/profile/update
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
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

**Response (200):**
```json
{
  "user": {
    "id": "60d5ecb74b24c72b8c8b4567",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["JavaScript", "Node.js"],
    "interests": ["AI", "Web Development"],
    "bio": "Software Developer",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "projects": ["Linkup App"],
    "experience": ["2 years at Tech Corp"],
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "lastUpdated": "2026-03-15T13:35:00.000Z"
    },
    "isDiscoverable": true,
    "createdAt": "2026-03-15T13:30:00.000Z"
  }
}
```

### Location Services

#### POST /api/location/update
Update user location.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (200):**
```json
{
  "message": "Location updated successfully"
}
```

#### GET /api/users/nearby
Get nearby users within 100 meters.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "users": [
    {
      "id": "60d5ecb74b24c72b8c8b4568",
      "name": "Jane Smith",
      "skills": ["React", "Python"],
      "interests": ["Machine Learning"],
      "bio": "Frontend Developer",
      "github": "https://github.com/janesmith",
      "linkedin": "https://linkedin.com/in/janesmith",
      "location": {
        "latitude": 40.7129,
        "longitude": -74.0061,
        "lastUpdated": "2026-03-15T13:40:00.000Z"
      }
    }
  ]
}
```

### Dynamic Location Updates

#### How Location Updates Work

**Current Implementation:**
- Manual location updates via API calls
- Optimized to only update when user moves >10 meters
- Stores location accuracy for better precision
- Tracks last update timestamp

**For Dynamic Updates (Client-Side):**

1. **Periodic Updates**: Client app sends location every 30 seconds
2. **Movement-Based**: Only update when user moves significant distance (50m)
3. **Accuracy Filtering**: Consider GPS accuracy for better results
4. **Battery Optimization**: Smart intervals based on movement speed

#### Client Implementation Examples

See `client-location-example.js` (React Native) and `web-location-example.js` (Web Browser) for complete implementation examples.

**Key Features:**
- Automatic background location tracking
- Distance-based update filtering
- Error handling and permission management
- Battery-conscious update intervals

#### Testing Dynamic Updates

1. **Manual Testing**: Use the location update endpoint with different coordinates
2. **Nearby Discovery**: Test with multiple users at varying distances
3. **Real-time Updates**: Implement Socket.io for live proximity alerts

**Example Test Coordinates:**
- User 1: `40.7128, -74.0060` (Manhattan)
- User 2: `40.7129, -74.0061` (125m away - should be nearby)
- User 3: `40.7589, -73.9851` (5km away - too far)

### Team Management

#### POST /api/teams/create
Create a new team.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "teamName": "Hackathon Heroes",
  "requiredSkills": ["React", "Node.js"],
  "teamSize": 4
}
```

**Response (201):**
```json
{
  "team": {
    "_id": "60d5ecb74b24c72b8c8b4569",
    "teamName": "Hackathon Heroes",
    "leader": "60d5ecb74b24c72b8c8b4567",
    "requiredSkills": ["React", "Node.js"],
    "teamSize": 4,
    "members": ["60d5ecb74b24c72b8c8b4567"],
    "joinRequests": [],
    "createdAt": "2026-03-15T13:45:00.000Z"
  }
}
```

#### GET /api/teams
Get all teams.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "teams": [
    {
      "_id": "60d5ecb74b24c72b8c8b4569",
      "teamName": "Hackathon Heroes",
      "leader": {
        "_id": "60d5ecb74b24c72b8c8b4567",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "requiredSkills": ["React", "Node.js"],
      "teamSize": 4,
      "members": [
        {
          "_id": "60d5ecb74b24c72b8c8b4567",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ],
      "joinRequests": [],
      "createdAt": "2026-03-15T13:45:00.000Z"
    }
  ]
}
```

#### POST /api/teams/join
Send join request to a team.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "teamId": "60d5ecb74b24c72b8c8b4569"
}
```

**Response (200):**
```json
{
  "message": "Join request sent"
}
```

#### POST /api/teams/approve
Approve join request (team leader only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "teamId": "60d5ecb74b24c72b8c8b4569",
  "userId": "60d5ecb74b24c72b8c8b4568"
}
```

**Response (200):**
```json
{
  "message": "User added to team"
}
```

#### POST /api/teams/reject
Reject join request (team leader only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "teamId": "60d5ecb74b24c72b8c8b4569",
  "userId": "60d5ecb74b24c72b8c8b4568"
}
```

**Response (200):**
```json
{
  "message": "Join request rejected"
}
```

### Chat System

#### GET /api/chat/:userId
Get private chat messages with a user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "messages": [
    {
      "_id": "60d5ecb74b24c72b8c8b4570",
      "sender": {
        "_id": "60d5ecb74b24c72b8c8b4567",
        "name": "John Doe"
      },
      "receiver": {
        "_id": "60d5ecb74b24c72b8c8b4568",
        "name": "Jane Smith"
      },
      "message": "Hello! Interested in joining our team?",
      "timestamp": "2026-03-15T14:00:00.000Z"
    }
  ]
}
```

#### GET /api/chat/team/:teamId
Get team chat messages.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "messages": [
    {
      "_id": "60d5ecb74b24c72b8c8b4571",
      "sender": {
        "_id": "60d5ecb74b24c72b8c8b4567",
        "name": "John Doe"
      },
      "teamId": "60d5ecb74b24c72b8c8b4569",
      "message": "Welcome to Hackathon Heroes!",
      "timestamp": "2026-03-15T14:05:00.000Z"
    }
  ]
}
```

## Testing with Postman

### Setup

1. **Import Postman Collection**: Import `Linkup_Postman_Collection.json` from the project root
2. **Create Environment**:
   - Name: "Linkup Local"
   - Variables:
     - `baseURL`: `http://localhost:5000`
     - `token`: (leave empty initially)

### Test Flow

#### 1. User Registration & Authentication
- **Register User 1**: Use `/api/auth/register` with sample data
- **Register User 2**: Use different email/location for nearby testing
- **Login**: Get JWT token and set in environment variable
- **Get Me**: Verify authentication works

#### 2. Profile Management
- **Update Profile**: Add skills, bio, projects, experience
- **Get Profile**: View another user's profile

#### 3. Location & Discovery
- **Update Location**: Send current coordinates
- **Nearby Users**: Should return users within 100m radius

#### 4. Team Operations
- **Create Team**: As User 1, create a hackathon team
- **View Teams**: See all available teams
- **Join Team**: As User 2, send join request
- **Approve/Reject**: As team leader (User 1), manage requests

#### 5. Chat System
- **Private Chat**: Get messages between users (initially empty)
- **Team Chat**: Get team messages (initially empty)

### Sample Test Data

**User 1 (Team Leader):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**User 2 (Nearby User):**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "latitude": 40.7129,
  "longitude": -74.0061
}
```

**Team Creation:**
```json
{
  "teamName": "Hackathon Heroes",
  "requiredSkills": ["React", "Node.js", "Python"],
  "teamSize": 4
}
```

### Socket.io Testing

For real-time features, use a Socket.io client:

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

// Join user room
socket.emit('joinUser', 'userId');

// Join team room
socket.emit('joinTeam', 'teamId');

// Send private message
socket.emit('sendMessage', {
  senderId: 'userId1',
  receiverId: 'userId2',
  message: 'Hello!'
});

// Send team message
socket.emit('sendTeamMessage', {
  senderId: 'userId',
  teamId: 'teamId',
  message: 'Team message!'
});
```

## Error Responses

Common error responses:

**400 Bad Request:**
```json
{
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "message": "Not authorized, no token"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Server error"
}
```

## Project Structure

```
linkup-backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── teamController.js
│   │   ├── locationController.js
│   │   └── chatController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── usersRoutes.js
│   │   └── chatRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── utils/
│   │   └── distance.js
│   ├── sockets/
│   │   └── socket.js
│   └── server.js
├── .env
├── package.json
├── README.md
└── Linkup_Postman_Collection.json
```

## Security Features

- JWT authentication with 7-day expiration
- Password hashing with bcrypt
- Input validation with express-validator
- CORS protection
- Error handling middleware

## Development

- Use `npm run dev` for development with nodemon
- Use `npm start` for production
- MongoDB connection with error handling
- Environment-based configuration

---

**Ready to test!** Import the Postman collection and follow the test flow above. 🚀
│   │   ├── Profile.js (not used)
│   │   ├── Team.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── usersRoutes.js
│   │   └── chatRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── utils/
│   │   └── distance.js
│   ├── sockets/
│   │   └── socket.js
│   └── server.js
├── .env
├── package.json
└── README.md
```