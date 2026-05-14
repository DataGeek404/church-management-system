# Church Management System - NestJS Backend Setup Guide

## 🎯 Overview

The Church Management System has been converted to a unified **NestJS backend** running on **port 3001** with all services consolidated into a single application.

### Key Features:
- ✅ **Single Port**: All services run on port 3001 with route prefixes
- ✅ **Swagger UI**: Complete API documentation at `/api/docs`
- ✅ **Database**: MySQL with TypeORM for data persistence
- ✅ **Caching**: Redis integration for performance
- ✅ **Authentication**: JWT-based auth with decorators
- ✅ **Modular Architecture**: Feature-based modules (Auth, Members, Attendance, etc.)
- ✅ **Independent Backend**: Runs without frontend dependency

---

## 📋 Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+
- **MySQL**: v8.0+
- **Redis**: v7+
- **Docker**: (optional, for containerized setup)

---

## 🚀 Local Development Setup

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install NestJS and dependencies
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

**Default `.env` values:**
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=church_admin
DB_PASSWORD=church_password_123
DB_NAME=church_management
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Ensure MySQL and Redis are Running

#### Option A: Using Docker

```bash
# Start MySQL and Redis containers
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root_password_123 \
  -e MYSQL_DATABASE=church_management \
  -e MYSQL_USER=church_admin \
  -e MYSQL_PASSWORD=church_password_123 \
  mysql:8.0

docker run -d -p 6379:6379 redis:7-alpine
```

#### Option B: Using Local Installation

Ensure MySQL and Redis services are running on your machine.

### 4. Run Development Server

```bash
# From backend directory
npm run dev
```

The backend will start on `http://localhost:3001`

**Available endpoints:**
- **Health Check**: `GET http://localhost:3001/api/health`
- **Swagger Docs**: `http://localhost:3001/api/docs`
- **Auth**: `http://localhost:3001/api/auth/*`
- **Members**: `http://localhost:3001/api/members/*`
- **Attendance**: `http://localhost:3001/api/attendance/*`
- **Financial**: `http://localhost:3001/api/financial/*`
- **Events**: `http://localhost:3001/api/events/*`
- **Communication**: `http://localhost:3001/api/communication/*`
- **Reports**: `http://localhost:3001/api/reports/*`

---

## 🐳 Docker Setup

### Quick Start with Docker Compose

```bash
# Build and start all services (MySQL, Redis, Backend, Frontend)
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

**Access points:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Swagger Docs: `http://localhost:3001/api/docs`

---

## 🔑 Default Credentials

```
Email:    admin@church.local
Password: admin123
```

These are automatically seeded on first backend startup.

---

## 📚 API Documentation

### Access Swagger UI

Navigate to: **`http://localhost:3001/api/docs`**

The Swagger interface includes:
- All API endpoints with descriptions
- Request/response schemas
- Try-it-out feature for testing
- Bearer token authentication setup
- Complete endpoint documentation

### Example API Calls

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@church.local",
    "password": "admin123"
  }'
```

#### Get Members
```bash
curl -X GET http://localhost:3001/api/members \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Create Member
```bash
curl -X POST http://localhost:3001/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@church.local",
    "phone": "+1234567890",
    "address": "123 Main St"
  }'
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   ├── auth/                       # Authentication guards & strategies
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── optional-jwt-auth.guard.ts
│   └── modules/                    # Feature modules
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── dto/
│       │   └── entities/
│       ├── members/
│       ├── attendance/
│       ├── financial/
│       ├── events/
│       ├── communication/
│       └── reports/
├── package.json
├── tsconfig.json
├── .env
├── .env.example
└── Dockerfile
```

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start with watch mode

# Building
npm run build           # Build TypeScript

# Production
npm run prod            # Run compiled code
npm start               # Alias for npm run prod

# Linting & Formatting
npm run lint            # Run ESLint
npm run format          # Format with Prettier

# Testing
npm test                # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Generate coverage report
npm run test:e2e       # Run e2e tests

# Debugging
npm run debug          # Start with debugger
```

---

## 🔐 Authentication

### JWT Flow

1. **Login** → Get token
   ```bash
   POST /api/auth/login
   Response: { token, data }
   ```

2. **Store Token** → Client stores in localStorage/cookies

3. **Use Token** → Send in Authorization header
   ```bash
   Authorization: Bearer {token}
   ```

4. **Verify Token** → Server validates JWT
   ```bash
   POST /api/auth/verify
   ```

### Protected Routes

Routes marked with `@UseGuards(JwtAuthGuard)` require authentication.

Optional authentication routes use `@UseGuards(OptionalJwtAuthGuard)`.

---

## 🗄️ Database

### TypeORM Configuration

- **Type**: MySQL
- **Host**: From `DB_HOST` environment variable
- **Port**: From `DB_PORT` environment variable
- **Credentials**: From `DB_USER` and `DB_PASSWORD`

### Database Entities

All entities are auto-synced in development:
- `User` (Auth module)
- `Member` (Members module)
- Additional entities in other modules

### Migrations

To create migrations:
```bash
npm run typeorm migration:create ./src/migrations/YourMigration
npm run typeorm migration:run
```

---

## 🚨 Troubleshooting

### Backend won't start

**Error: "Port 3001 already in use"**
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 {PID}
```

**Error: "Cannot connect to database"**
```bash
# Check MySQL is running
mysql -u church_admin -p church_password_123 -h localhost

# Check connection string in .env
```

**Error: "Redis connection refused"**
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Frontend can't reach backend

**Make sure** `NEXT_PUBLIC_API_URL` in frontend `.env` points to backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Swagger UI not loading

**Solution**: Clear browser cache and refresh
- Try: `http://localhost:3001/api/docs`
- Alternative: `http://localhost:3001/api/docs-json`

---

## 📝 Environment Variables

### Required
- `NODE_ENV`: `development` or `production`
- `PORT`: Port to run on (default: 3001)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET`: Secret key for JWT signing

### Optional
- `JWT_EXPIRY`: Token expiration time (default: 24h)

---

## 🔄 Deployment

### Production Build

```bash
# Build
npm run build

# Start
npm run prod
```

### Docker Deployment

```bash
# Build image
docker build -t church-backend .

# Run container
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e DB_HOST=mysql-host \
  -e DB_USER=church_admin \
  -e DB_PASSWORD=your_password \
  church-backend
```

### Using Docker Compose

```bash
docker-compose -f docker-compose.yml up -d --build
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Swagger/OpenAPI](https://swagger.io)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

## 🆘 Support

For issues:
1. Check logs: `npm run dev` shows detailed errors
2. Review `.env` configuration
3. Verify database connectivity
4. Check Redis is running
5. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

---

**Status**: ✅ Production Ready  
**Last Updated**: March 29, 2026  
**Version**: 1.0.0

