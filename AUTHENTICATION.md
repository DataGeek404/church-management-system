# Authentication Implementation Guide

## Overview
The Church Management System now includes a complete authentication system with JWT tokens, user registration, and login functionality.

## Backend Components

### Auth Service (Port 3008)
- **Location**: `backend/services/auth-service/`
- **Language**: Node.js/Express
- **Database**: In-memory (can be upgraded to PostgreSQL/MySQL)

#### Endpoints

##### POST `/auth/register`
Register a new user.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### POST `/auth/login`
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "metadata": {
    "loginTime": "125ms"
  }
}
```

##### POST `/auth/verify`
Verify if a JWT token is valid.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "john@example.com",
    "role": "user"
  }
}
```

##### POST `/auth/refresh`
Refresh an expired or valid JWT token.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### GET `/auth/me`
Get current authenticated user information.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "status": "active"
  }
}
```

##### POST `/auth/logout`
Logout user (token is removed client-side).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Frontend Components

### AuthContext (`app/context/AuthContext.jsx`)
React Context for managing authentication state globally.

#### Usage
```jsx
import { useAuth } from '@/app/context/AuthContext';

function MyComponent() {
  const { user, token, isAuthenticated, loading, login, register, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Welcome, {user.firstName}!</div>;
}
```

### AuthProvider
Wrap your application with AuthProvider to enable authentication.

```jsx
import { AuthProvider } from '@/app/context/AuthContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### Login Page (`app/login/page.jsx`)
User login interface.

- **URL**: `/login`
- **Demo Credentials**:
  - Email: `admin@church.local`
  - Password: `admin123`

### Register Page (`app/register/page.jsx`)
User registration interface.

- **URL**: `/register`
- **Fields**: First Name, Last Name, Email, Password, Confirm Password

### ProtectedRoute Component
Protects routes from unauthorized access.

```jsx
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## Frontend API Client

### Token Management
Tokens are automatically stored in:
- **Cookies**: `auth_token` (expires in 7 days)
- **LocalStorage**: `auth_token` (for fallback)

### Automatic Token Injection
All API requests automatically include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Auto-Logout on 401
If the server returns a 401 (Unauthorized), the user is automatically logged out and redirected to `/login`.

## Default Users

### Admin User
- **Email**: `admin@church.local`
- **Password**: `admin123`
- **Role**: `admin`

## Security Considerations

1. **JWT Secret**: Change `JWT_SECRET` environment variable in production
2. **Token Expiry**: Default is 24 hours. Adjust `JWT_EXPIRY` as needed
3. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS properly in production
6. **Rate Limiting**: Consider adding rate limiting for login/register endpoints

## Environment Variables

```bash
# Auth Service
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h

# Database (for production)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=church_management
DB_USER=church_admin
DB_PASSWORD=church_password_123

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running the Auth Service

### Development
```bash
cd backend/services/auth-service
npm run dev
```

### Docker
```bash
docker-compose -f backend/docker.yaml up auth-service
```

## Testing Authentication

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@church.local",
    "password": "admin123"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:3001/api/members \
  -H "Authorization: Bearer <token_from_login>"
```

## Frontend Flow

1. User visits `/login` or `/register`
2. User submits credentials
3. Frontend sends request to `/api/auth/login` or `/api/auth/register`
4. Backend returns JWT token
5. Token is stored in cookies and localStorage
6. Token is automatically included in all subsequent API requests
7. If token expires, user is logged out and redirected to `/login`

## Database Integration (Future)

Currently, the auth service uses in-memory storage. To integrate with a database:

1. Replace `Map` storage with database queries
2. Implement user schema with:
   - `id` (UUID)
   - `email` (unique, indexed)
   - `password` (hashed)
   - `firstName`
   - `lastName`
   - `role` (enum: admin, user)
   - `status` (enum: active, inactive)
   - `createdDate`
   - `updatedDate`

3. Add database migration scripts
4. Update environment variables for database connection

## Troubleshooting

### "No token provided" error
- Make sure user is logged in
- Check if token is stored in cookies/localStorage
- Try logging out and logging back in

### "Invalid token" error
- Token might be expired
- Try refreshing the page
- Check if JWT_SECRET matches between services

### "Invalid email or password" error
- Make sure email and password are correct
- Use demo credentials: `admin@church.local` / `admin123`

## Next Steps

1. Integrate with database (PostgreSQL/MySQL)
2. Add role-based access control (RBAC)
3. Implement refresh token rotation
4. Add email verification
5. Add password reset functionality
6. Implement MFA (Multi-Factor Authentication)

