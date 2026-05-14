# 🚀 Quick Start Guide - Using Individual Docker.yaml Files

## ✅ Docker Status: CONFIRMED RUNNING

Docker Desktop is actively running in the background with all processes operational.

---

## 📋 What You Have

### Backend Configuration
- **File**: `backend/docker.yaml`
- **Services**: 9 (MySQL, Redis, API Gateway, 6 Microservices)
- **Network**: cms-network (bridge)
- **Volumes**: Persistent data storage

### Frontend Configuration
- **File**: `frontend/docker.yaml`
- **Services**: 1 (Next.js dev server)
- **Features**: Hot reload, development mode
- **Network**: Connected to cms-network

---

## 🎯 Option 1: Run Backend Only

```bash
# Navigate to backend
cd backend

# Start all backend services
docker-compose -f docker.yaml up --build

# Wait 2-3 minutes for MySQL and Redis to be healthy
# Services will be available at:
# - API Gateway: http://localhost:3001
# - MySQL: localhost:3306
# - Redis: localhost:6379
```

---

## 🎯 Option 2: Run Frontend Only

```bash
# Navigate to frontend
cd frontend

# Start frontend
docker-compose -f docker.yaml up --build

# Frontend available at: http://localhost:3000
```

---

## 🎯 Option 3: Run Backend + Frontend Separately

**Terminal 1** - Run Backend:
```bash
cd backend
docker-compose -f docker.yaml up --build
```

**Terminal 2** - Run Frontend:
```bash
cd frontend
docker-compose -f docker.yaml up --build
```

Access both:
- Frontend: http://localhost:3000
- API: http://localhost:3001

---

## 🎯 Option 4: Run Everything from Root (Original Method)

```bash
# From project root
docker-compose up --build

# This uses the root docker-compose.yml which includes everything
```

---

## 📊 Port Mapping

| Service | Port | Access |
|---------|------|--------|
| Frontend (Next.js) | 3000 | http://localhost:3000 |
| API Gateway | 3001 | http://localhost:3001 |
| Member Service | 3002 | http://localhost:3002 |
| Attendance Service | 3003 | http://localhost:3003 |
| Financial Service | 3004 | http://localhost:3004 |
| Event Service | 3005 | http://localhost:3005 |
| Communication Service | 3006 | http://localhost:3006 |
| Reporting Service | 3007 | http://localhost:3007 |
| MySQL | 3306 | localhost:3306 |
| Redis | 6379 | localhost:6379 |

---

## 🛑 How to Stop Services

```bash
# Stop services gracefully
docker-compose -f docker.yaml down

# Stop and remove volumes
docker-compose -f docker.yaml down -v

# Stop and remove all data
docker-compose -f docker.yaml down -v --remove-orphans
```

---

## 📋 View Logs

```bash
# View all service logs
docker-compose -f docker.yaml logs -f

# View specific service logs
docker-compose -f docker.yaml logs -f mysql
docker-compose -f docker.yaml logs -f api-gateway
docker-compose -f docker.yaml logs -f frontend

# View last 100 lines
docker-compose -f docker.yaml logs --tail=100
```

---

## ✅ Verify Services

```bash
# Check all services status
docker-compose -f docker.yaml ps

# Check MySQL health
docker exec church-mysql mysqladmin ping -h localhost

# Check Redis health
docker exec church-redis redis-cli ping
```

---

## 🐛 Troubleshooting

### Services won't start
```bash
# Clean start
docker-compose -f docker.yaml down -v
docker-compose -f docker.yaml up --build
```

### Port already in use
```bash
# Find what's using the port
netstat -ano | findstr :3001

# Edit docker.yaml and change port mapping
# Example: Change "3001:3001" to "3002:3001"
```

### MySQL fails to start
```bash
# Check MySQL logs
docker-compose -f docker.yaml logs mysql

# Wait longer - MySQL takes time to initialize
# Wait 30+ seconds before checking health
```

### Frontend not connecting to API
```bash
# Ensure backend is running first
# Backend must be healthy before frontend can connect
# Check that both are on the same network (cms-network)
```

---

## 📚 Documentation

For more information, see:
- **QUICK_REFERENCE.md** - Fast command lookup
- **DOCKER_SETUP.md** - Comprehensive Docker guide
- **DOCKER_CONFIRMATION.md** - Confirmation report

---

## 🎯 Recommended Workflow

### Development Setup (Best Practice)

**Terminal 1** - Run Backend:
```bash
cd backend
docker-compose -f docker.yaml up --build
```

**Terminal 2** - Run Frontend:
```bash
cd frontend
docker-compose -f docker.yaml up --build
```

**Terminal 3** - Monitor (optional):
```bash
docker ps
docker stats
```

This gives you:
- ✅ Backend services running
- ✅ Frontend dev server running
- ✅ Hot reload on both
- ✅ Easy to restart individual services
- ✅ Better debugging

---

## ✨ Features

### Backend Services
```yaml
✅ MySQL 8.0 with persistent storage
✅ Redis 7 with persistent storage
✅ Health checks for reliability
✅ Service dependencies ordered
✅ Environment variables injected
✅ Docker bridge network
✅ Automatic restart on failure
```

### Frontend Service
```yaml
✅ Next.js development server
✅ Hot reload on file changes
✅ Volume mounts for live editing
✅ Environment configuration
✅ Interactive terminal mode
✅ Network integration
```

---

## 🚀 Get Started Now

### Quick Start Command

**For Backend**:
```bash
cd backend && docker-compose -f docker.yaml up --build
```

**For Frontend**:
```bash
cd frontend && docker-compose -f docker.yaml up --build
```

**For Everything**:
```bash
docker-compose up --build
```

---

## 🎉 You're Ready!

Everything is configured and Docker Desktop is running.

**Next steps**:
1. Choose your setup option above
2. Run the command
3. Wait 2-3 minutes for services to start
4. Access the services at their respective ports
5. Start developing!

---

**Status**: ✅ READY TO GO
**Docker**: ✅ RUNNING
**Configuration**: ✅ COMPLETE

Happy coding! 🚀

